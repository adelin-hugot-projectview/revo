import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
// Chargement conditionnel de Stripe - désactivé temporairement pour éviter les blocages
const isDevelopment = true; // Force disable Stripe for now
let stripePromise = null;

if (!isDevelopment) {
    import('@stripe/stripe-js').then(({ loadStripe }) => {
        stripePromise = loadStripe('pk_test_51RfoRnFWG5SW3jjZJX0UoHYtvM07zGim4IlIDg3TjlJvkerEGbAp7deIFTjhfzBikIY2kMN1ZY3JprCiInlpdWx000tmVoYAXO');
    }).catch(err => console.log('Stripe not loaded:', err));
}

const CompanyPage = ({ companyInfo, setCompanyInfo, colors, currentUserRole }) => {
    const [formData, setFormData] = useState(companyInfo || {});
    const [feedback, setFeedback] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [teams, setTeams] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [showInviteUserModal, setShowInviteUserModal] = useState(false);
    const [newInviteUserData, setNewInviteUserData] = useState({
        email: '',
        role: 'Technicien',
        team_id: null,
    });

    // États pour la gestion du paiement
    const [invoices, setInvoices] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [loadingPayment, setLoadingPayment] = useState(true);
    const [paymentError, setPaymentError] = useState(null);

    useEffect(() => {
        setFormData(companyInfo || {});
        if (companyInfo?.id) {
            fetchUsers(companyInfo.id);
            fetchTeams(companyInfo.id);
        }
    }, [companyInfo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }
        const file = e.target.files[0];
        const fileName = `${companyInfo.id}-${Date.now()}-${file.name}`;
        
        setIsSaving(true);
        setFeedback('Téléchargement du logo...');
        
        const { error: uploadError } = await supabase.storage
            .from('logos')
            .upload(fileName, file);

        if (uploadError) {
            setFeedback(`Erreur de téléchargement: ${uploadError.message}`);
            setIsSaving(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('logos')
            .getPublicUrl(fileName);
        
        setFormData(prev => ({ ...prev, logo_url: publicUrl }));
        setFeedback('Logo mis à jour. Pensez à enregistrer les modifications.');
        setIsSaving(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setFeedback('');

        const { id, created_at, ...updateData } = formData;

        const { data, error } = await supabase
            .from('companies')
            .update(updateData)
            .eq('id', id);

        if (error) {
            setFeedback(`Erreur lors de l'enregistrement: ${error.message}`);
        } else {
            setCompanyInfo(formData);
            setFeedback('Informations enregistrées avec succès !');
            setTimeout(() => setFeedback(''), 3000);
        }
        setIsSaving(false);
    };

    const fetchUsers = async (companyId) => {
        setLoadingUsers(true);
        
        // Récupérer les utilisateurs sans jointure
        const { data: usersData, error: usersError } = await supabase
            .from('profiles')
            .select('id, full_name, role, team_id, email')
            .eq('company_id', companyId);

        if (usersError) {
            console.error("Erreur lors du chargement des utilisateurs:", usersError.message);
            setFeedback(`Erreur lors du chargement des utilisateurs: ${usersError.message}`);
            setLoadingUsers(false);
            return;
        }

        // Récupérer les équipes séparément
        const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('id, name')
            .eq('company_id', companyId);

        if (teamsError) {
            console.error("Erreur lors du chargement des équipes:", teamsError.message);
        }

        // Joindre les données manuellement
        const usersWithTeams = usersData.map(user => ({
            ...user,
            team: user.team_id && teamsData ? teamsData.find(team => team.id === user.team_id) : null
        }));

        setUsers(usersWithTeams);
        setLoadingUsers(false);
    };

    const fetchTeams = async (companyId) => {
        const { data, error } = await supabase
            .from('teams')
            .select('id, name')
            .eq('company_id', companyId);
        if (error) {
            console.error("Erreur lors du chargement des equipes:", error.message);
        } else {
            setTeams(data);
        }
    };

    const handleUpdateUserRole = async (userId, newRole, newTeamId) => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        // Vérifier si l'administrateur essaie de changer son propre rôle
        if (currentUser && currentUser.id === userId && newRole !== 'Administrateur') {
            const confirmChange = window.confirm(
                "Vous êtes sur le point de changer votre propre rôle d'administrateur. " +
                "Cela pourrait limiter vos accès. Êtes-vous sûr de vouloir continuer ?"
            );
            if (!confirmChange) {
                setFeedback('Changement de rôle annulé.');
                return;
            }
        }

        setIsSaving(true);
        setFeedback('');
        const updateData = { role: newRole };
        if (newRole === 'Technicien') {
            updateData.team_id = newTeamId;
        } else {
            updateData.team_id = null; // Clear team_id if not a technician
        }

        const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId);

        if (error) {
            setFeedback(`Erreur lors de la mise à jour du rôle: ${error.message}`);
        } else {
            setFeedback('Rôle mis à jour avec succès !');
            setEditingUser(null); // Exit editing mode
            fetchUsers(companyInfo.id); // Refresh user list
            // Si l'utilisateur actuel a changé son propre rôle, rafraîchir son rôle localement
            if (currentUser && currentUser.id === userId) {
                fetchCurrentUserRole();
            }
            setTimeout(() => setFeedback(''), 3000);
        }
        setIsSaving(false);
    };

    const handleCreateTeam = async () => {
        if (!newTeamName.trim()) {
            setFeedback(`Le nom de l'équipe ne peut pas être vide.`);
            return;
        }
        setIsSaving(true);
        setFeedback('');

        const { data, error } = await supabase
            .from('teams')
            .insert({
                name: newTeamName,
                company_id: companyInfo.id
            });

        if (error) {
            setFeedback(`Erreur lors de la création de l'équipe: ${error.message}`);
        } else {
            setFeedback('Équipe créée avec succès !');
            setNewTeamName('');
            setShowCreateTeamModal(false);
            fetchTeams(companyInfo.id); // Refresh teams list
            setTimeout(() => setFeedback(''), 3000);
        }
        setIsSaving(false);
    };

    const handleInviteUser = async () => {
        if (!newInviteUserData.email.trim()) {
            setFeedback('L\'email ne peut pas être vide.');
            return;
        }
        if (!newInviteUserData.role) {
            setFeedback('Le rôle ne peut pas être vide.');
            return;
        }
        if (newInviteUserData.role === 'Technicien' && !newInviteUserData.team_id) {
            setFeedback('Un technicien doit avoir une équipe assignée.');
            return;
        }

        setIsSaving(true);
        setFeedback('');

        try {
            // Créer l'utilisateur directement avec Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: newInviteUserData.email,
                password: Math.random().toString(36).slice(-8) + 'A1!', // Mot de passe temporaire
                options: {
                    emailRedirectTo: `${window.location.origin}/login`,
                    data: {
                        role: newInviteUserData.role,
                        company_id: companyInfo.id,
                        team_id: newInviteUserData.team_id,
                        invited_by: (await supabase.auth.getUser()).data.user?.id
                    }
                }
            });

            if (authError) {
                throw new Error(authError.message);
            }

            // Si l'utilisateur a été créé, créer aussi son profil
            if (authData.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: authData.user.id,
                        company_id: companyInfo.id,
                        team_id: newInviteUserData.role === 'Technicien' ? newInviteUserData.team_id : null,
                        full_name: newInviteUserData.email.split('@')[0],
                        email: newInviteUserData.email,
                        role: newInviteUserData.role,
                        is_active: true
                    });

                if (profileError) {
                    console.error('Erreur lors de la création du profil:', profileError);
                    // Le profil sera créé via le trigger si configuré
                }
            }

            setFeedback('Invitation envoyée avec succès ! L\'utilisateur recevra un email de confirmation.');
            setNewInviteUserData({ email: '', role: 'Technicien', team_id: null });
            setShowInviteUserModal(false);
            fetchUsers(companyInfo.id); // Refresh user list
            setTimeout(() => setFeedback(''), 3000);
        } catch (error) {
            setFeedback(`Erreur: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Fonctions de gestion du paiement
    const handleCheckout = async () => {
        if (isDevelopment) {
            alert('Paiement désactivé en développement');
            return;
        }
        try {
            const stripe = await stripePromise;

            // Appel à votre backend pour créer une session Checkout
            const response = await fetch('http://localhost:5001/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}), // Vous pouvez passer des données ici si nécessaire
            });

            const session = await response.json();

            // Rediriger l'utilisateur vers Stripe Checkout
            const result = await stripe.redirectToCheckout({
                sessionId: session.id,
            });

            if (result.error) {
                console.error(result.error.message);
                alert(`Erreur: ${result.error.message}`);
            }
        } catch (error) {
            console.error('Error during checkout:', error);
            alert('Une erreur est survenue lors de l\'initialisation du paiement.');
        }
    };

    const handleManageSubscription = async () => {
        console.log('handleManageSubscription called');
        setLoadingPayment(true);
        setPaymentError(null);
        try {
            const customerId = companyInfo?.stripe_customer_id;
            console.log('Customer ID for portal session:', customerId);
            if (!customerId) {
                setPaymentError('ID client Stripe non configuré pour cette entreprise.');
                setLoadingPayment(false);
                return;
            }

            const returnUrl = window.location.origin + '/societe';
            console.log('Return URL for portal session:', returnUrl);

            const response = await fetch('http://localhost:5001/create-customer-portal-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customer_id: customerId,
                    return_url: returnUrl,
                }),
            });

            console.log('Response status from portal session creation:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            }

            const data = await response.json();
            console.log('Portal session URL:', data.url);
            window.location.href = data.url; // Rediriger vers le portail client Stripe

        } catch (error) {
            console.error('Error managing subscription:', error);
            setPaymentError('Erreur lors de la gestion de l\'abonnement.');
        } finally {
            setLoadingPayment(false);
        }
    };

    const fetchPaymentData = async () => {
        setLoadingPayment(true);
        setPaymentError(null);
        try {
            const customerId = companyInfo?.stripe_customer_id; // Utiliser l'ID client de l'entreprise

            if (!customerId) {
                setPaymentError('ID client Stripe non configuré pour cette entreprise.');
                setLoadingPayment(false);
                return;
            }

            // Récupérer les factures
            const invoicesResponse = await fetch(`http://localhost:5001/get-invoices?customer_id=${customerId}`);
            if (!invoicesResponse.ok) {
                throw new Error(`HTTP error! status: ${invoicesResponse.status}`);
            }
            const invoicesData = await invoicesResponse.json();
            setInvoices(invoicesData);

            // Récupérer l'abonnement actuel
            const subscriptionResponse = await fetch(`http://localhost:5001/get-current-subscription?customer_id=${customerId}`);
            if (!subscriptionResponse.ok) {
                throw new Error(`HTTP error! status: ${subscriptionResponse.status}`);
            }
            const subscriptionData = await subscriptionResponse.json();
            setCurrentSubscription(subscriptionData);

        } catch (err) {
            console.error('Error fetching payment data:', err);
            setPaymentError('Erreur lors du chargement des informations de paiement.');
        } finally {
            setLoadingPayment(false);
        }
    };

    // Appeler fetchPaymentData lorsque companyInfo change et que l'utilisateur est un administrateur
    useEffect(() => {
        if (companyInfo?.id && currentUserRole === 'Administrateur') {
            fetchPaymentData();
        }
    }, [companyInfo, currentUserRole]);

    if (!companyInfo) {
        return <div>Chargement des informations de la société...</div>;
    }

    return (
        <div className="h-full flex flex-col">
            <h1 className="text-3xl font-bold text-gray-800 font-['Poppins'] mb-8">Société</h1>
            
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-sm space-y-8 w-full">
                <div className="flex items-center gap-6">
                    <img 
                        src={formData.logo_url || `https://placehold.co/100x100/E1F2EC/2B5F4C?text=${formData.name?.charAt(0) || 'L'}`} 
                        alt="Logo de la société" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-green-500"
                    />
                    <div>
                        <label htmlFor="logo-upload" className="cursor-pointer px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary">
                            Changer le logo
                        </label>
                        <input id="logo-upload" name="logo-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom de la société</label>
                        <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"/>
                    </div>
                     <div>
                        <label htmlFor="siret" className="block text-sm font-medium text-gray-700">SIRET</label>
                        <input type="text" name="siret" id="siret" value={formData.siret || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"/>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresse</label>
                        <input type="text" name="address" id="address" value={formData.address || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"/>
                    </div>
                </div>
                
                <div className="flex items-center justify-end gap-4 pt-6 border-t">
                    {feedback && <span className={`text-sm ${feedback.includes('Erreur') ? 'text-red-600' : 'text-green-600'}`}>{feedback}</span>}
                    <button type="submit" disabled={isSaving} className="px-6 py-2 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 bg-primary">
                        {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>

            <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-sm space-y-4 w-full mt-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 font-['Poppins']">Utilisateurs de la société</h2>
                    {!loadingUsers && (
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600">Total:</span>
                                <span className="font-semibold text-gray-900">{users.length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600">Administrateurs:</span>
                                <span className="font-semibold text-blue-600">{users.filter(user => user.role === 'Administrateur').length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600">Techniciens:</span>
                                <span className="font-semibold text-green-600">{users.filter(user => user.role === 'Technicien').length}</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setShowCreateTeamModal(true)}
                        className="px-4 py-2 text-white font-semibold rounded-lg transition-colors bg-primary">
                        Créer une nouvelle équipe
                    </button>
                    <button
                        onClick={() => setShowInviteUserModal(true)}
                        className="px-4 py-2 text-white font-semibold rounded-lg transition-colors"
                        style={{ backgroundColor: colors.primary }}
                    >
                        Inviter un utilisateur
                    </button>
                </div>
                {loadingUsers ? (
                    <div>Chargement des utilisateurs...</div>
                ) : users.length === 0 ? (
                    <div>Aucun utilisateur trouvé pour cette société.</div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {users.map((user) => (
                            <li key={user.id} className="py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">{user.full_name}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                    {user.role === 'Technicien' && user.team?.name && (
                                        <p className="text-xs text-gray-400">Équipe: {user.team.name}</p>
                                    )}
                                </div>
                                {editingUser && editingUser.id === user.id ? (
                                    <div className="flex items-center space-x-2">
                                        <select
                                            value={editingUser.role}
                                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value, team_id: e.target.value !== 'Technicien' ? null : editingUser.team_id })}
                                            className="border border-gray-300 rounded-md px-2 py-1"
                                        >
                                            <option value="Administrateur">Administrateur</option>
                                            <option value="Technicien">Technicien</option>
                                        </select>
                                        {editingUser.role === 'Technicien' && (
                                            <select
                                                value={editingUser.team_id || ''}
                                                onChange={(e) => setEditingUser({ ...editingUser, team_id: e.target.value })}
                                                className="border border-gray-300 rounded-md px-2 py-1"
                                            >
                                                <option value="">Sélectionner une équipe</option>
                                                {teams.map(team => (
                                                    <option key={team.id} value={team.id}>{team.name}</option>
                                                ))}
                                            </select>
                                        )}
                                        <button
                                            onClick={() => handleUpdateUserRole(editingUser.id, editingUser.role, editingUser.team_id)}
                                            className="px-3 py-1 text-sm text-white rounded-lg"
                                            style={{ backgroundColor: colors.primary }}
                                        >
                                            Sauvegarder
                                        </button>
                                        <button
                                            onClick={() => setEditingUser(null)}
                                            className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-lg"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <span className="px-3 py-1 text-sm font-medium rounded-full" style={{ backgroundColor: colors.secondary, color: colors.primary }}>
                                            {user.role}
                                        </span>
                                        <button
                                            onClick={() => setEditingUser({ ...user })}
                                            className="px-3 py-1 text-sm text-white rounded-lg"
                                            style={{ backgroundColor: colors.primary }}
                                        >
                                            Modifier
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            

            {showCreateTeamModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-2xl font-bold text-gray-800 font-['Poppins'] mb-6">Créer une nouvelle équipe</h3>
                        <div className="mb-4">
                            <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 mb-2">Nom de l'équipe</label>
                            <input
                                type="text"
                                id="team-name"
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1" style={{ '--tw-ring-color': colors.primary }}
                                placeholder="Nom de l'équipe"
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowCreateTeamModal(false)}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleCreateTeam}
                                className="px-4 py-2 text-white font-semibold rounded-lg transition-colors" style={{ backgroundColor: colors.primary }}
                            >
                                Créer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showInviteUserModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-2xl font-bold text-gray-800 font-['Poppins'] mb-6">Inviter un nouvel utilisateur</h3>
                        <div className="mb-4">
                            <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                id="invite-email"
                                value={newInviteUserData.email}
                                onChange={(e) => setNewInviteUserData({ ...newInviteUserData, email: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1" style={{ '--tw-ring-color': colors.primary }}
                                placeholder="email@example.com"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="invite-role" className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                            <select
                                id="invite-role"
                                value={newInviteUserData.role}
                                onChange={(e) => setNewInviteUserData({ ...newInviteUserData, role: e.target.value, team_id: e.target.value !== 'Technicien' ? null : newInviteUserData.team_id })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1" style={{ '--tw-ring-color': colors.primary }}
                            >
                                <option value="Administrateur">Administrateur</option>
                                <option value="Technicien">Technicien</option>
                            </select>
                        </div>
                        {newInviteUserData.role === 'Technicien' && (
                            <div className="mb-4">
                                <label htmlFor="invite-team" className="block text-sm font-medium text-gray-700 mb-2">Équipe</label>
                                <select
                                    id="invite-team"
                                    value={newInviteUserData.team_id || ''}
                                    onChange={(e) => setNewInviteUserData({ ...newInviteUserData, team_id: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1" style={{ '--tw-ring-color': colors.primary }}
                                >
                                    <option value="">Sélectionner une équipe</option>
                                    {teams.map(team => (
                                        <option key={team.id} value={team.id}>{team.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => { setShowInviteUserModal(false); setNewInviteUserData({ email: '', role: 'Technicien', team_id: null }); }}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleInviteUser}
                                disabled={isSaving}
                                className="px-4 py-2 text-white font-semibold rounded-lg transition-colors disabled:opacity-50" style={{ backgroundColor: colors.primary }}
                            >
                                {isSaving ? 'Envoi...' : 'Inviter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyPage;
