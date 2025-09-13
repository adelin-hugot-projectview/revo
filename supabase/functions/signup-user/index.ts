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
    const { email, password, full_name, company_name } = await req.json()

    // Validation
    if (!email || !password || !full_name || !company_name) {
      return new Response(
        JSON.stringify({ error: 'Tous les champs sont requis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Le mot de passe doit contenir au moins 8 caractères' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

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

    // 1. Create the user with Supabase Auth (simplified for debugging)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Skip email confirmation for now
    })

    if (authError) {
      console.error('Error creating user:', authError)
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création du compte: ${authError.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const user = authData.user
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création de l\'utilisateur' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 2. Create the company
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        name: company_name.trim(),
        subscription_status: 'trial',
        subscription_plan: 'basic'
      })
      .select()
      .single()

    if (companyError) {
      console.error('Error creating company:', companyError)
      // Rollback user creation if company creation fails
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création de l'entreprise: ${companyError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 3. Create the user profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.id,
        company_id: company.id,
        full_name: full_name.trim(),
        email: email.trim(),
        role: 'admin',
        is_active: true
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Rollback user and company creation if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      await supabaseAdmin.from('companies').delete().eq('id', company.id)
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création du profil: ${profileError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 4. Create default kanban statuses
    const defaultStatuses = [
      { name: 'À faire', color: '#6B7280', position: 1, is_default: true },
      { name: 'En cours', color: '#F59E0B', position: 2 },
      { name: 'En attente', color: '#EF4444', position: 3 },
      { name: 'Terminé', color: '#10B981', position: 4 },
      { name: 'Annulé', color: '#6B7280', position: 5 }
    ]

    const { error: statusError } = await supabaseAdmin
      .from('kanban_statuses')
      .insert(
        defaultStatuses.map(status => ({
          ...status,
          company_id: company.id,
          applies_to: ['sites', 'prospects']
        }))
      )

    if (statusError) {
      console.error('Error creating default statuses:', statusError)
      // Don't rollback everything for status creation failure, just log it
    }

    // Company initialization is now handled entirely by this Edge Function
    console.log('✅ Entreprise initialisée avec les données par défaut')

    // 6. Send welcome email
    try {
      const { error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo: `${Deno.env.get('SITE_URL') || 'https://revo1.netlify.app'}/login`,
          data: {
            full_name: full_name,
            company_name: company_name,
            welcome_email: true
          }
        }
      )

      if (emailError) {
        console.warn('Error sending welcome email:', emailError)
        // Don't fail the signup if email fails
      }
    } catch (emailError) {
      console.warn('Welcome email not sent:', emailError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Compte créé avec succès ! Vérifiez votre boîte mail pour vous connecter.',
        user_id: user.id,
        company_id: company.id
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