
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://bkedbcwomesqxlughssq.lovableproject.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Security-Policy': "default-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate Content-Type
    const contentType = req.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      throw new Error('Invalid content type')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    const { paymentIntentId } = await req.json()

    // Validate payment intent ID format
    if (!paymentIntentId || typeof paymentIntentId !== 'string' || !paymentIntentId.startsWith('pi_')) {
      throw new Error('Invalid payment intent ID')
    }

    // Verify the tip belongs to the authenticated user
    const { data: tip, error: tipError } = await supabaseClient
      .from('tips')
      .select('id, tipper_id, payment_intent_id, status')
      .eq('payment_intent_id', paymentIntentId)
      .single()

    if (tipError || !tip) {
      throw new Error('Payment intent not found')
    }

    if (tip.tipper_id !== user.id) {
      throw new Error('Unauthorized: not your payment')
    }

    if (tip.status !== 'pending') {
      throw new Error('Payment already processed')
    }

    // In production, verify payment with Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    
    if (stripeSecretKey) {
      // Real Stripe verification
      const stripeResponse = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
        },
      })
      
      if (!stripeResponse.ok) {
        throw new Error('Payment verification failed')
      }
      
      const stripeData = await stripeResponse.json()
      
      if (stripeData.status !== 'succeeded') {
        throw new Error('Payment not completed')
      }
    } else {
      console.warn('STRIPE_SECRET_KEY not set - skipping payment verification')
    }

    // Create service client for secure operations
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Update tip status to completed
    const { error } = await supabaseService
      .from('tips')
      .update({ status: 'completed' })
      .eq('payment_intent_id', paymentIntentId)
      .eq('tipper_id', user.id) // Additional security check

    if (error) {
      console.error('Database update error:', error)
      
      // Log security event for failed confirmation
      await supabaseService.rpc('log_security_event', {
        p_user_id: user.id,
        p_event_type: 'PAYMENT_CONFIRMATION_FAILED',
        p_event_data: { 
          payment_intent_id: paymentIntentId,
          error: error.message 
        }
      })
      
      throw new Error('Failed to update payment status')
    }

    // Log successful payment confirmation
    await supabaseService.rpc('log_security_event', {
      p_user_id: user.id,
      p_event_type: 'PAYMENT_CONFIRMED',
      p_event_data: { 
        payment_intent_id: paymentIntentId
      }
    })

    console.log(`Payment confirmed: ${paymentIntentId} for user ${user.id}`)

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY'
        },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Payment confirmation error:', error)
    
    // Don't expose internal error details
    const isKnownError = error.message.includes('Invalid') || 
                        error.message.includes('Authentication') ||
                        error.message.includes('Unauthorized') ||
                        error.message.includes('not found') ||
                        error.message.includes('already processed')
    
    return new Response(
      JSON.stringify({ 
        error: isKnownError ? error.message : 'Payment confirmation failed'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff'
        },
        status: isKnownError ? 400 : 500
      }
    )
  }
})
