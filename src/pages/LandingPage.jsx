import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51RfoRnFWG5SW3jjZJX0UoHYtvM07zGim4IlIDg3TjlJvkerEGbAp7deIFTjhfzBikIY2kMN1ZY3JprCiInlpdWx000tmVoYAXO');

const LandingPage = ({ colors }) => {
    const [companyName, setCompanyName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateCompanyAndCheckout = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFeedback('');

        try {
            // 1. Create the company in Supabase
            const { data: companyData, error: companyError } = await supabase
                .from('companies')
                .insert([{ name: companyName, max_users: 3 }]) // Default 3 users for initial plan
                .select()
                .single();

            if (companyError) throw companyError;

            const companyId = companyData.id;

            // 2. Create Stripe Checkout Session for company creation product
            const stripe = await stripePromise;
            const response = await fetch('http://localhost:5001/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId: 'prod_SbIHI2SdjlARwo', // Product ID for company account with 3 users
                    quantity: 1,
                    success_url: `${window.location.origin}/signup?companyId=${companyId}&email=${adminEmail}`, // Redirect to signup with companyId
                    cancel_url: window.location.origin + '/landing', // Redirect back to landing on cancel
                    metadata: { company_id: companyId }, // Pass company_id to webhook
                }),
            });

            const session = await response.json();

            const result = await stripe.redirectToCheckout({
                sessionId: session.id,
            });

            if (result.error) {
                console.error(result.error.message);
                setFeedback(`Erreur lors de la redirection vers le paiement: ${result.error.message}`);
            }
        } catch (error) {
            console.error('Error creating company or checkout session:', error);
            setFeedback(`Erreur: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <h1 className="text-3xl font-bold mb-6" style={{ color: colors.primary }}>Bienvenue sur REVO</h1>
                <p className="text-gray-600 mb-8">Simplifiez la gestion de vos chantiers. Créez votre compte et invitez votre équipe.</p>

                <form onSubmit={handleCreateCompanyAndCheckout} className="space-y-4">
                    <div>
                        <label htmlFor="companyName" className="sr-only">Nom de la société</label>
                        <input
                            type="text"
                            id="companyName"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Nom de votre société"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label htmlFor="adminEmail" className="sr-only">Email de l'administrateur</label>
                        <input
                            type="email"
                            id="adminEmail"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            placeholder="Votre email (administrateur)"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-2 text-white font-semibold rounded-md transition-colors disabled:opacity-50 bg-primary"
                    >
                        {isLoading ? 'Chargement...' : 'Créer ma société et souscrire'}
                    </button>
                </form>

                {feedback && (
                    <p className={`mt-4 text-sm ${feedback.includes('Erreur') ? 'text-red-500' : 'text-green-500'}`}>
                        {feedback}
                    </p>
                )}

                <p className="mt-6 text-gray-500 text-sm">
                    Déjà un compte ? <a href="/login" className="font-semibold text-primary">Connectez-vous ici</a>
                </p>
            </div>
        </div>
    );
};

export default LandingPage;
