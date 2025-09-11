const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// AJOUTEZ CETTE LIGNE POUR VÉRIFIER LA CLÉ SECRÈTE (MASQUÉE)
console.log('Stripe Secret Key loaded:', process.env.STRIPE_SECRET_KEY ? '*****' + process.env.STRIPE_SECRET_KEY.slice(-4) : 'NOT LOADED');
console.log('Supabase URL loaded:', supabaseUrl ? '*****' + supabaseUrl.slice(-4) : 'NOT LOADED');
console.log('Supabase Service Role Key loaded:', supabaseServiceRoleKey ? '*****' + supabaseServiceRoleKey.slice(-4) : 'NOT LOADED');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors()); // Permet à votre frontend de faire des requêtes à ce serveur

// Endpoint pour créer une session de paiement Stripe Checkout
app.post('/create-checkout-session', express.json(), async (req, res) => {
    const { success_url, cancel_url, priceId, quantity = 1 } = req.body;

    if (!success_url || !cancel_url || !priceId) {
        return res.status(400).json({ error: 'Success URL, Cancel URL, and Price ID are required.' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: quantity,
                },
            ],
            mode: 'payment', // Ou 'subscription' si vous mettez en place des abonnements récurrents
            success_url: success_url, // Utilise l'URL fournie par le frontend
            cancel_url: cancel_url,   // Utilise l'URL fournie par le frontend
        });
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

// NOUVEAU ENDPOINT : Récupérer les factures d'un client Stripe
app.get('/get-invoices', async (req, res) => {
    console.log('Received /get-invoices request');
    const customerId = req.query.customer_id;
    console.log('Customer ID for invoices:', customerId);
    if (!customerId) {
        console.log('Missing customer ID for invoices, returning 400');
        return res.status(400).json({ error: 'Customer ID is required.' });
    }
    try {
        const invoices = await stripe.invoices.list({
            customer: customerId,
            limit: 10,
        });
        console.log('Successfully fetched invoices');
        res.json(invoices.data);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/get-current-subscription', async (req, res) => {
    console.log('Received /get-current-subscription request');
    const customerId = req.query.customer_id;
    console.log('Customer ID for subscription:', customerId);
    if (!customerId) {
        console.log('Missing customer ID for subscription, returning 400');
        return res.status(400).json({ error: 'Customer ID is required.' });
    }
    try {
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
            limit: 1,
        });
        console.log('Successfully fetched subscription');
        res.json(subscriptions.data.length > 0 ? subscriptions.data[0] : null);
    } catch (error) {
        console.error('Error fetching current subscription:', error);
        res.status(500).json({ error: error.message });
    }
});


app.post('/create-customer-portal-session', express.json(), async (req, res) => {
    const { customer_id, return_url } = req.body;

    if (!customer_id || !return_url) {
        return res.status(400).json({ error: 'Customer ID and return URL are required.' });
    }

    try {
        const session = await stripe.billingPortal.sessions.create({
            customer: customer_id,
            return_url: return_url,
        });
        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating customer portal session:', error);
        res.status(500).json({ error: error.message });
    }
});


// Webhook pour gérer les événements Stripe
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Gérer l'événement
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Checkout session completed:', session.id);

            // Récupérer les détails de la session, y compris les line_items
            const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
                expand: ['line_items'],
            });
            const lineItems = sessionWithLineItems.line_items.data;

            const customerId = session.customer;
            const companyId = session.metadata?.company_id; // Récupérer l'ID de l'entreprise si stocké en metadata

            if (!companyId) {
                console.error('Company ID not found in session metadata.');
                return res.status(400).send('Company ID not found.');
            }

            for (const item of lineItems) {
                const productId = item.price.product;
                const quantity = item.quantity;

                if (productId === 'prod_SbIHI2SdjlARwo') { // Compte société avec 3 utilisateurs
                    console.log(`Account creation product purchased. Setting max_users to 3 for company ${companyId}`);
                    const { data, error } = await supabase
                        .from('companies')
                        .update({ stripe_customer_id: customerId, max_users: 3 })
                        .eq('id', companyId);
                    if (error) console.error('Error updating company for account creation:', error);
                } else if (productId === 'prod_SbIJmvQKmNzs3Y') { // Utilisateur supplémentaire
                    console.log(`Additional user product purchased. Incrementing max_users by ${quantity} for company ${companyId}`);
                    // Récupérer le nombre actuel d'utilisateurs max
                    const { data: companyData, error: fetchError } = await supabase
                        .from('companies')
                        .select('max_users')
                        .eq('id', companyId)
                        .single();

                    if (fetchError) {
                        console.error('Error fetching company max_users:', fetchError);
                    } else if (companyData) {
                        const newMaxUsers = companyData.max_users + quantity;
                        const { error: updateError } = await supabase
                            .from('companies')
                            .update({ max_users: newMaxUsers })
                            .eq('id', companyId);
                        if (updateError) console.error('Error updating company max_users:', updateError);
                    }
                }
            }
            break;
        // ... gérer d'autres types d'événements si nécessaire
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});


// NOUVEAU ENDPOINT : Inviter un utilisateur
app.post('/invite-user', express.json(), async (req, res) => {
    console.log('Received /invite-user request');
    const { email, role, team_id, company_id } = req.body;
    console.log('Invitation data:', { email, role, team_id, company_id });

    if (!email || !role || !company_id) {
        console.log('Missing required fields for invitation');
        return res.status(400).json({ error: 'Email, role, and company_id are required.' });
    }

    // Vérifier si le rôle est valide
    const validRoles = ['Administrateur', 'Technicien'];
    if (!validRoles.includes(role)) {
        console.log('Invalid role:', role);
        return res.status(400).json({ error: 'Invalid role. Must be Administrateur or Technicien.' });
    }

    // Si c'est un technicien, team_id est requis
    if (role === 'Technicien' && !team_id) {
        console.log('Technicien role requires team_id');
        return res.status(400).json({ error: 'team_id is required for Technicien role.' });
    }

    try {
        // Vérifier si l'utilisateur existe déjà
        const { data: existingUser, error: checkError } = await supabase.auth.admin.getUserByEmail(email);
        
        if (checkError && checkError.status !== 404) {
            console.error('Error checking existing user:', checkError);
            return res.status(500).json({ error: 'Error checking existing user.' });
        }

        if (existingUser && existingUser.user) {
            console.log('User already exists');
            return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà.' });
        }

        // Créer l'utilisateur dans Supabase Auth
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: email,
            password: Math.random().toString(36).slice(-8) + 'A1!', // Mot de passe temporaire
            email_confirm: true // Auto-confirmer l'email
        });

        if (createError) {
            console.error('Error creating user in auth:', createError);
            return res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur.' });
        }

        console.log('User created in auth:', newUser.user.id);

        // Créer le profil utilisateur
        const profileData = {
            id: newUser.user.id,
            company_id: company_id,
            team_id: role === 'Technicien' ? team_id : null,
            full_name: email.split('@')[0], // Utiliser la partie email comme nom temporaire
            email: email,
            role: role,
            is_active: true
        };

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert(profileData)
            .select()
            .single();

        if (profileError) {
            console.error('Error creating profile:', profileError);
            // Supprimer l'utilisateur auth si la création du profil échoue
            await supabase.auth.admin.deleteUser(newUser.user.id);
            return res.status(500).json({ error: 'Erreur lors de la création du profil utilisateur.' });
        }

        console.log('Profile created successfully:', profile.id);

        // Envoyer un email de réinitialisation de mot de passe pour que l'utilisateur puisse définir son mot de passe
        const { error: resetError } = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email: email
        });

        if (resetError) {
            console.error('Error sending recovery email:', resetError);
            // Ne pas échouer l'invitation si l'email ne peut pas être envoyé
        }

        console.log('User invitation completed successfully');
        res.json({ 
            message: 'Invitation envoyée avec succès !',
            user: {
                id: profile.id,
                email: profile.email,
                role: profile.role,
                team_id: profile.team_id
            }
        });

    } catch (error) {
        console.error('Error in invite-user endpoint:', error);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Stripe server running on port ${PORT}`);
});