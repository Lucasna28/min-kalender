import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log('Edge Function loaded and running')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Log request details
  console.log('Received request:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  })

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting invitation process...')
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')
    
    console.log('Environment variables:', {
      supabaseUrl: supabaseUrl ? 'Set' : 'Not set',
      supabaseKey: supabaseKey ? 'Set' : 'Not set',
      siteUrl: Deno.env.get('SITE_URL')
    })

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log('Supabase client initialized')

    // Parse request body
    const requestBody = await req.json()
    console.log('Request body:', requestBody)

    const { invitationId, calendarId, inviteeEmail, inviterId } = requestBody
    console.log('Parsed request data:', { invitationId, calendarId, inviteeEmail, inviterId })

    // Validate required fields
    if (!invitationId || !calendarId || !inviteeEmail || !inviterId) {
      throw new Error('Missing required fields')
    }

    // Hent kalender detaljer
    const { data: calendar, error: calendarError } = await supabase
      .from('calendars')
      .select('name, user_id')
      .eq('id', calendarId)
      .single()

    if (calendarError) {
      console.error('Error fetching calendar:', calendarError)
      throw calendarError
    }
    console.log('Calendar details:', calendar)

    // Hent inviter's email
    const { data: inviter, error: inviterError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', inviterId)
      .single()

    if (inviterError) {
      console.error('Error fetching inviter:', inviterError)
      throw inviterError
    }
    console.log('Inviter details:', inviter)

    // Send OTP email
    console.log('Attempting to send OTP email...')
    const { error: emailError } = await supabase.auth.signInWithOtp({
      email: inviteeEmail,
      options: {
        emailRedirectTo: `${Deno.env.get('SITE_URL')}/calendar/invite?id=${invitationId}`,
        data: {
          calendarId,
          inviterId,
          calendarName: calendar.name,
          inviterName: inviter.full_name || inviter.email
        }
      }
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      throw emailError
    }
    console.log('OTP email sent successfully')

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})