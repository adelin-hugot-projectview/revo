import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, role, team_id, team_name, company_id, company_name, inviter_name, signup_url } = await req.json()

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Create user with admin API
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: crypto.randomUUID().slice(0, 12) + 'A1!', // Temporary password
      email_confirm: true,
      user_metadata: {
        role: role,
        company_id: company_id,
        team_id: team_id,
        invited_by: inviter_name
      }
    })

    if (createUserError) {
      console.error('Error creating user:', createUserError)
      return new Response(
        JSON.stringify({ error: `Failed to create user: ${createUserError.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create profile for the user
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUser.user.id,
        company_id: company_id,
        team_id: team_id,
        full_name: email.split('@')[0], // Use email prefix as temporary name
        email: email,
        role: role,
        is_active: true
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Don't fail the function if profile creation fails - it might be created via trigger
    }

    // Send password reset email so user can set their own password
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${new URL(signup_url).origin}/login`
      }
    })

    if (resetError) {
      console.error('Error sending reset email:', resetError)
    }

    // Update invitation status to completed
    const { error: updateError } = await supabaseAdmin
      .from('user_invitations')
      .update({ status: 'completed' })
      .eq('email', email)
      .eq('company_id', company_id)

    if (updateError) {
      console.error('Error updating invitation status:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User invited successfully',
        user_id: newUser.user.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})