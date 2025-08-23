import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51RfoRnFWG5SW3jjZJX0UoHYtvM07zGim4IlIDg3TjlJvkerEGbAp7deIFTjhfzBikIY2kMN1ZY3JprCiInlpdWx000tmVoYAXO');

const LandingPage = ({ colors }) => {
    const [companyName, setCompanyName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFeedback('');

        try {
            // Validation simple
            if (!companyName || !adminEmail) {
                throw new Error('Veuillez remplir tous les champs.');
            }

            // Rediriger vers la page d'inscription avec les informations
            const params = new URLSearchParams({
                companyName: companyName,
                email: adminEmail
            });
            window.location.href = `/signup?${params.toString()}`;

        } catch (error) {
            console.error('Error:', error);
            setFeedback(error.message || 'Une erreur est survenue.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <h1 className="text-3xl font-bold mb-6" style={{ color: colors.primary }}>Bienvenue sur REVO</h1>
                <p className="text-gray-600 mb-8">Simplifiez la gestion de vos chantiers. Créez votre compte et invitez votre équipe.</p>

                <form onSubmit={handleCreateAccount} className="space-y-4">
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
                        {isLoading ? 'Chargement...' : 'Créer mon compte'}
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
