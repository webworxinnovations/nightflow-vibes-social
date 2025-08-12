import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import Stripe from 'https://esm.sh/stripe@15.8.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Security-Policy': "default-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Rate limiting (in production, use Redis)
const rateLimitMap = new Map<string, number[]>();

function validateAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount >= 100 && amount <= 100000; // $1-$1000 in cents
}

function validateUuid(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

function sanitizeString(str: string, maxLength: number = 500): string {
  if (!str) return '';
  return str.replace(/[<>\"'&]/g, '').substring(0, maxLength).trim();
}

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10;
  
  if (!rateLimitMap.has(userId)) {
    rateLimitMap.set(userId, []);
  }
  
  const requests = rateLimitMap.get(userId)!;
  // Remove old requests outside the window
  const recentRequests = requests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(userId, recentRequests);
  return true;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase client with service role for audit logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user authentication
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      await supabaseAdmin.rpc('log_payment_event', {
        p_user_id: null,
        p_payment_intent_id: null,
        p_action: 'auth_failed',
        p_error_message: 'Unauthorized access attempt'
      });
      
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      await supabaseAdmin.rpc('log_payment_event', {
        p_user_id: user.id,
        p_payment_intent_id: null,
        p_action: 'rate_limit_exceeded',
        p_error_message: 'Too many payment requests'
      });

      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait before trying again.' }),
        { status: 429, headers: corsHeaders }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { amount, recipientId, streamId, message, songRequest } = body;

    // Comprehensive input validation
    if (!validateAmount(amount)) {
      await supabaseAdmin.rpc('log_payment_event', {
        p_user_id: user.id,
        p_payment_intent_id: null,
        p_action: 'invalid_amount',
        p_amount: amount,
        p_error_message: 'Invalid amount'
      });

      return new Response(
        JSON.stringify({ error: 'Invalid amount. Must be between $1 and $1000.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!validateUuid(recipientId) || !validateUuid(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid user IDs' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Prevent self-tipping
    if (recipientId === user.id) {
      await supabaseAdmin.rpc('log_payment_event', {
        p_user_id: user.id,
        p_payment_intent_id: null,
        p_action: 'self_tip_attempt',
        p_recipient_id: recipientId,
        p_error_message: 'Self-tipping not allowed'
      });

      return new Response(
        JSON.stringify({ error: 'You cannot tip yourself' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Sanitize optional text inputs
    const sanitizedMessage = sanitizeString(message, 200);
    const sanitizedSongRequest = sanitizeString(songRequest, 100);

    // Verify recipient exists
    const { data: recipient, error: recipientError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', recipientId)
      .single();

    if (recipientError || !recipient) {
      await supabaseAdmin.rpc('log_payment_event', {
        p_user_id: user.id,
        p_payment_intent_id: null,
        p_action: 'invalid_recipient',
        p_recipient_id: recipientId,
        p_error_message: 'Recipient not found'
      });

      return new Response(
        JSON.stringify({ error: 'Recipient not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Initialize Stripe - require API key for production
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      // In development, create mock payment intent
      const mockPaymentIntent = {
        id: `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        client_secret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        amount: amount,
        currency: 'usd',
        status: 'requires_confirmation'
      };

      await supabaseAdmin.rpc('log_payment_event', {
        p_user_id: user.id,
        p_payment_intent_id: mockPaymentIntent.id,
        p_action: 'mock_payment_created',
        p_amount: amount,
        p_recipient_id: recipientId,
        p_success: true
      });

      console.log('⚠️ DEVELOPMENT MODE: Created mock payment intent');
      
      return new Response(
        JSON.stringify({
          paymentIntentId: mockPaymentIntent.id,
          clientSecret: mockPaymentIntent.client_secret,
          amount: amount,
          isDevelopment: true
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Production Stripe integration
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        tipperId: user.id,
        recipientId: recipientId,
        streamId: streamId || '',
        message: sanitizedMessage,
        songRequest: sanitizedSongRequest,
        app: 'nightflow'
      }
    });

    // Store pending tip in database
    const { error: tipError } = await supabaseAdmin
      .from('tips')
      .insert({
        tipper_id: user.id,
        recipient_id: recipientId,
        stream_id: streamId,
        amount: amount / 100, // Convert cents to dollars
        message: sanitizedMessage,
        song_request: sanitizedSongRequest,
        payment_intent_id: paymentIntent.id,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending'
      });

    if (tipError) {
      await supabaseAdmin.rpc('log_payment_event', {
        p_user_id: user.id,
        p_payment_intent_id: paymentIntent.id,
        p_action: 'tip_storage_failed',
        p_amount: amount,
        p_recipient_id: recipientId,
        p_error_message: tipError.message
      });

      console.error('Failed to store tip:', tipError);
      
      // Cancel the payment intent if tip storage fails
      await stripe.paymentIntents.cancel(paymentIntent.id);
      
      return new Response(
        JSON.stringify({ error: 'Failed to process tip. Please try again.' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Log successful payment intent creation
    await supabaseAdmin.rpc('log_payment_event', {
      p_user_id: user.id,
      p_payment_intent_id: paymentIntent.id,
      p_action: 'payment_intent_created',
      p_amount: amount,
      p_recipient_id: recipientId,
      p_success: true
    });

    console.log('✅ Payment intent created:', paymentIntent.id);

    return new Response(
      JSON.stringify({
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: amount
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Payment intent creation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});