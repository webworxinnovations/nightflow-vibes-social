
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://bkedbcwomesqxlughssq.lovableproject.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Security-Policy': "default-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
}

// Rate limiting map
const rateLimitMap = new Map<string, { count: number; reset: number }>()

function sanitizeQuery(query: string): string {
  if (typeof query !== 'string') return ''
  // Remove potentially harmful characters and limit length
  return query.trim().substring(0, 200).replace(/[<>\"'&]/g, '')
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)
  
  if (!limit || now > limit.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + 60000 }) // 1 minute window
    return true
  }
  
  if (limit.count >= 30) { // Max 30 requests per minute
    return false
  }
  
  limit.count++
  return true
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('cf-connecting-ip') || 
                    req.headers.get('x-forwarded-for') || 
                    'unknown'

    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429 
        }
      )
    }

    // Validate Content-Type
    const contentType = req.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      throw new Error('Invalid content type')
    }

    const body = await req.json()
    const { query } = body
    
    // Input validation and sanitization
    if (!query || typeof query !== 'string') {
      throw new Error('Query parameter is required and must be a string')
    }

    const sanitizedQuery = sanitizeQuery(query)
    if (!sanitizedQuery || sanitizedQuery.length < 1) {
      throw new Error('Query must contain valid characters')
    }
    
    // Get Spotify client credentials token
    const spotifyClientId = Deno.env.get('SPOTIFY_CLIENT_ID')
    const spotifyClientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET')
    
    if (!spotifyClientId || !spotifyClientSecret) {
      console.error('Spotify credentials not configured')
      throw new Error('Service temporarily unavailable')
    }

    // Get access token with timeout
    const tokenController = new AbortController()
    const tokenTimeout = setTimeout(() => tokenController.abort(), 10000) // 10s timeout

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${spotifyClientId}:${spotifyClientSecret}`)}`
      },
      body: 'grant_type=client_credentials',
      signal: tokenController.signal
    })

    clearTimeout(tokenTimeout)

    if (!tokenResponse.ok) {
      throw new Error('Failed to authenticate with Spotify')
    }

    const tokenData = await tokenResponse.json()
    
    if (!tokenData.access_token) {
      throw new Error('Invalid Spotify response')
    }

    // Search for tracks with timeout
    const searchController = new AbortController()
    const searchTimeout = setTimeout(() => searchController.abort(), 10000) // 10s timeout

    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(sanitizedQuery)}&type=track&limit=10&market=US`,
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        },
        signal: searchController.signal
      }
    )

    clearTimeout(searchTimeout)

    if (!searchResponse.ok) {
      throw new Error('Spotify search failed')
    }

    const searchData = await searchResponse.json()

    // Sanitize response data to remove sensitive info
    const sanitizedData = {
      tracks: {
        items: searchData.tracks?.items?.map((track: any) => ({
          id: track.id,
          name: track.name,
          artists: track.artists?.map((artist: any) => ({
            id: artist.id,
            name: artist.name
          })),
          album: {
            id: track.album?.id,
            name: track.album?.name,
            images: track.album?.images
          },
          duration_ms: track.duration_ms,
          preview_url: track.preview_url,
          external_urls: track.external_urls
        })) || []
      }
    }

    // Log the search for monitoring
    console.log(`Spotify search: "${sanitizedQuery}" - ${sanitizedData.tracks.items.length} results`)

    return new Response(
      JSON.stringify(sanitizedData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'Cache-Control': 'private, max-age=300' // 5 minute cache
        },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Spotify search error:', error)
    
    // Don't expose internal error details
    const isKnownError = error.message.includes('Query') || 
                        error.message.includes('Rate limit') ||
                        error.message.includes('Invalid content') ||
                        error.message.includes('Service temporarily')
    
    return new Response(
      JSON.stringify({ 
        error: isKnownError ? error.message : 'Search service unavailable'
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
