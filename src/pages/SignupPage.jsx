// src/pages/SignupPage.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const SignupPage = ({ onSwitchToLogin, colors, companyInfo }) => {
  const [companyName, setCompanyName] = useState('');
  const [isCompanyLocked, setIsCompanyLocked] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Lis les paramètres d'URL (companyName, email) une seule fois
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCompanyName = params.get('companyName');
    const urlEmail = params.get('email');

    if (urlCompanyName) {
      setCompanyName(urlCompanyName);
      setIsCompanyLocked(true);
    }
    if (urlEmail) {
      setEmail(urlEmail);
    }
  }, []);

  const normalizeSupabaseError = (err) => {
    if (!err) return 'Une erreur inconnue est survenue.';
    const msg = err.message || String(err);

    // Quelques cas fréquents – adapte au besoin
    if (/User already registered|already exists/i.test(msg)) {
      return "Un compte existe déjà avec cet e-mail. Essayez de vous connecter.";
    }
    if (/Invalid email/i.test(msg)) {
      return "Adresse e-mail invalide.";
    }
    if (/Password should be|weak password|password must/i.test(msg)) {
      return "Mot de passe trop faible. Utilise au moins 8 caractères.";
    }
    return msg;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    const cleanCompany = companyName.trim();
    const cleanName = fullName.trim();
    const cleanEmail = email.trim();

    if (!cleanCompany) {
      setError("Erreur : Nom de société manquant. Veuillez passer par la page d'accueil.");
      setLoading(false);
      return;
    }
    if (!cleanName) {
      setError("Merci d’indiquer votre nom complet.");
      setLoading(false);
      return;
    }
    if (!cleanEmail) {
      setError("Merci d’indiquer votre adresse e-mail.");
      setLoading(false);
      return;
    }
    if (!password || password.length < 8) {
      setError("Votre mot de passe doit contenir au moins 8 caractères.");
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: cleanName,
            company_name: cleanCompany,
            role: 'Administrateur', // Le créateur sera admin/owner côté DB
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (authData?.user) {
        setSuccessMessage(
          "Compte créé avec succès ! Vérifiez votre boîte mail pour confirmer votre inscription."
        );
      } else {
        setSuccessMessage(
          "Demande de création de compte envoyée ! Vérifiez votre e-mail pour confirmer."
        );
      }
    } catch (err) {
      console.error('Erreur création utilisateur:', err);
      setError(normalizeSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto">
        {/* Branding / logo */}
        <div className="flex justify-center items-center mb-8">
          <div className="w-10 h-10 bg-primary rounded-md" />
          <h1 className="ml-4 text-4xl font-bold font-['Poppins'] text-neutralDark">REVO</h1>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Créez votre espace REVO
          </h2>

          {error && (
            <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>
          )}
          {successMessage && (
            <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm">
              {successMessage}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Société */}
            <div>
              <label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                Nom de votre société
              </label>
              <input
                type="text"
                name="companyName"
                id="companyName"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isCompanyLocked}
                autoComplete="organization"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {isCompanyLocked && (
                <p className="mt-1 text-xs text-gray-500">
                  Le nom de société est verrouillé car transmis via l’URL.
                </p>
              )}
            </div>

            <hr />

            {/* Nom complet */}
            <div>
              <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Votre nom complet (Administrateur)
              </label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Votre adresse e-mail
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Votre mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 mr-3 mt-1 px-2 text-sm text-gray-600 hover:text-gray-800"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 caractères. Utilisez une combinaison lettres/chiffres/symboles.
              </p>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors disabled:opacity-50 bg-primary"
              >
                {loading ? 'Création de votre espace…' : 'Créer mon compte'}
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
