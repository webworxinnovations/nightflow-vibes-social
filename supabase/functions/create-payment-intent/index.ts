
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://bkedbcwomesqxlughssq.lovableproject.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; reset: number }>()

// Input validation helpers
function validateAmount(amount: number): boolean {
  return typeof amount === 'number' && amount > 0 && amount <= 100000 && Number.isInteger(amount)
}

function validateUuid(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return typeof id === 'string' && uuidRegex.test(id)
}

function sanitizeString(str: string, maxLength: number = 500): string {
  if (typeof str !== 'string') return ''
  return str.trim().substring(0, maxLength).replace(/[<>]/g, '')
}

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)
  
  if (!userLimit || now > userLimit.reset) {
    rateLimitMap.set(userId, { count: 1, reset: now + 60000 }) // 1 minute window
    return true
  }
  
  if (userLimit.count >= 10) { // Max 10 requests per minute
    return false
  }
  
  userLimit.count++
  return true
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

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429 
        }
      )
    }

    const body = await req.json()
    const { amount, recipientId, streamId, message, songRequest, tipperId } = body

    // Input validation
    if (!validateAmount(amount)) {
      throw new Error('Invalid amount: must be a positive integer between 1 and 100000 cents')
    }

    if (!validateUuid(recipientId) || !validateUuid(tipperId)) {
      throw new Error('Invalid recipient or tipper ID')
    }

    if (streamId && !validateUuid(streamId)) {
      throw new Error('Invalid stream ID')
    }

    if (tipperId !== user.id) {
      throw new Error('Tipper ID must match authenticated user')
    }

    // Sanitize text inputs
    const sanitizedMessage = message ? sanitizeString(message, 500) : null
    const sanitizedSongRequest = songRequest ? sanitizeString(songRequest, 200) : null

    // Verify recipient exists and is active
    const { data: recipient, error: recipientError } = await supabaseClient
      .from('profiles')
      .select('id, role')
      .eq('id', recipientId)
      .single()

    if (recipientError || !recipient) {
      throw new Error('Invalid recipient')
    }

    // Create secure payment intent ID with crypto randomness
    const paymentIntentId = `pi_${Date.now()}_${crypto.randomUUID().replace(/-/g, '')}`
    
    // In production, integrate with real Stripe API
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    let paymentIntent
    
    if (stripeSecretKey) {
      // Real Stripe integration
      const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: amount.toString(),
          currency: 'usd',
          metadata: JSON.stringify({
            tip_amount: (amount / 100).toString(),
            recipient_id: recipientId,
            tipper_id: tipperId,
            stream_id: streamId || '',
          }),
        }),
      })
      
      if (!stripeResponse.ok) {
        throw new Error('Payment processing failed')
      }
      
      paymentIntent = await stripeResponse.json()
    } else {
      // Mock payment intent for development
      console.warn('STRIPE_SECRET_KEY not set - using mock payment intent')
      paymentIntent = {
        id: paymentIntentId,
        client_secret: `${paymentIntentId}_secret_${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`,
        amount
      }
    }

    // Store pending tip in database
    const { error: tipError } = await supabaseClient
      .from('tips')
      .insert({
        tipper_id: tipperId,
        recipient_id: recipientId,
        stream_id: streamId,
        amount: amount / 100, // Convert to dollars
        message: sanitizedMessage,
        song_request: sanitizedSongRequest,
        payment_intent_id: paymentIntent.id,
        status: 'pending'
      })

    if (tipError) {
      console.error('Database error:', tipError)
      throw new Error('Failed to create tip record')
    }

    // Log the action for audit
    console.log(`Payment intent created: ${paymentIntent.id} for user ${user.id}`)

    return new Response(
      JSON.stringify({
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount
      }),
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
    console.error('Payment intent creation error:', error)
    
    // Don't expose internal error details
    const isKnownError = error.message.includes('Invalid') || 
                        error.message.includes('Authentication') ||
                        error.message.includes('Rate limit')
    
    return new Response(
      JSON.stringify({ 
        error: isKnownError ? error.message : 'Payment processing failed'
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
