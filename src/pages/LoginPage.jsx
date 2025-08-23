import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Assurez-vous que le chemin est correct

const LoginPage = ({ onSwitchToSignup, colors, companyInfo }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                throw error;
            }
            // La redirection est maintenant gérée par le listener dans App.jsx
        } catch (error) {
            setError(error.message || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full mx-auto">
                 <div className="flex justify-center items-center mb-8">
                    <div className="w-10 h-10 bg-primary rounded-md"></div>
                    <h1 className="ml-4 text-4xl font-bold font-['Poppins'] text-neutralDark">REVO</h1>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Connexion</h2>
                    
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">Adresse e-mail</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de passe</label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors disabled:opacity-50 bg-primary">
                                {loading ? 'Connexion en cours...' : 'Se connecter'}
                            </button>
                        </div>
                    </form>
                </div>
                <p className="mt-6 text-center text-sm text-gray-600">
                    Pas encore de compte ?{' '}
                    <button onClick={onSwitchToSignup} className="font-medium hover:underline text-primary">
                        S'inscrire
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;