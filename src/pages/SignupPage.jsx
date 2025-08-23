import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Assurez-vous que le chemin est correct

const SignupPage = ({ onSwitchToLogin, colors, companyInfo }) => {
    const [companyId, setCompanyId] = useState(null);
    // AJOUT : État pour le nom de la société
    const [companyName, setCompanyName] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlCompanyId = params.get('companyId');
        const urlEmail = params.get('email');

        if (urlCompanyId) {
            setCompanyId(urlCompanyId);
            if (companyInfo && companyInfo.id === urlCompanyId) {
                setCompanyName(companyInfo.name);
            }
        }
        if (urlEmail) {
            setEmail(urlEmail);
        }
    }, [companyInfo]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage('');

        if (!companyId) {
            setError("Erreur: ID de société manquant. Veuillez passer par la page d'accueil pour créer un compte.");
            setLoading(false);
            return;
        }

        try {
            // Fetch current user count for the company
            const { count: currentUsers, error: countError } = await supabase
                .from('profiles')
                .select('id', { count: 'exact' })
                .eq('company_id', companyId);

            if (countError) throw countError;

            if (companyInfo && currentUsers >= companyInfo.max_users) {
                setError(`Limite d'utilisateurs atteinte pour cette société (${companyInfo.max_users} utilisateurs). Veuillez contacter l'administrateur de la société pour augmenter la limite.`);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name,
                        company_id: companyId, // Pass company_id to the new user's profile
                        email: email
                    }
                }
            });

            if (error) {
                throw error;
            }

            setSuccessMessage("Compte créé avec succès ! Veuillez vérifier votre boîte mail pour confirmer votre inscription.");

        } catch (error) {
            setError(error.message || "Une erreur est survenue lors de la création du compte.");
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
                    {/* MODIFICATION : Titre de la page */}
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Créez votre espace REVO</h2>
                    
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
                    {successMessage && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm">{successMessage}</p>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* --- AJOUT : Champ pour le nom de la société --- */}
                        <div>
                            <label htmlFor="companyName" className="text-sm font-medium text-gray-700">Nom de votre société</label>
                            <input type="text" name="companyName" id="companyName" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={!!companyId}
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        {/* --- Ligne de séparation pour plus de clarté --- */}
                        <hr/>
                         <div>
                            <label htmlFor="name" className="text-sm font-medium text-gray-700">Votre nom complet (Administrateur)</label>
                            <input type="text" name="name" id="name" required value={name} onChange={(e) => setName(e.target.value)}
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">Votre adresse e-mail</label>
                            <input type="email" name="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">Votre mot de passe</label>
                            <input type="password" name="password" id="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div>
                            {/* MODIFICATION : Texte du bouton */}
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors disabled:opacity-50 bg-primary">
                                {loading ? 'Création de votre espace...' : "Créer mon compte"}
                            </button>
                        </div>
                    </form>
                </div>
                <p className="mt-6 text-center text-sm text-gray-600">
                    Déjà un compte ?{' '}
                    <button onClick={onSwitchToLogin} className="font-medium hover:underline text-primary">
                        Se connecter
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;