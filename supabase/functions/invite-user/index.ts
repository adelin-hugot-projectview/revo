import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, role, team_id, company_id, inviter_name, signup_url } = await req.json()

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

    // Invite user by email - this will send the invitation email automatically
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: `${new URL(signup_url).origin}/login`,
        data: {
          role: role,
          company_id: company_id,
          team_id: team_id,
          invited_by: inviter_name
        }
      }
    )

    if (inviteError) {
      console.error('Error inviting user:', inviteError)
      return new Response(
        JSON.stringify({ error: `Failed to invite user: ${inviteError.message}` }),
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
        id: inviteData.user.id,
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
        user_id: inviteData.user.id 
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