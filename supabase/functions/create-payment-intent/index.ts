
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { amount, recipientId, streamId, message, songRequest, tipperId } = await req.json()

    // Create Stripe payment intent (placeholder - requires STRIPE_SECRET_KEY)
    const paymentIntent = {
      id: `pi_${Math.random().toString(36).substring(2, 15)}`,
      client_secret: `pi_${Math.random().toString(36).substring(2, 15)}_secret_${Math.random().toString(36).substring(2, 10)}`,
      amount
    }

    // Store pending tip in database
    const { error: tipError } = await supabaseClient
      .from('tips')
      .insert({
        tipper_id: tipperId,
        recipient_id: recipientId,
        stream_id: streamId,
        amount: amount / 100, // Convert back to dollars
        message,
        song_request: songRequest,
        payment_intent_id: paymentIntent.id,
        status: 'pending'
      })

    if (tipError) throw tipError

    return new Response(
      JSON.stringify(paymentIntent),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      },
    )
  }
})
