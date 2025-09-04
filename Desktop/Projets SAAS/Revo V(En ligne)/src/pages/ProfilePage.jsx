import React, { useState, useEffect } from 'react';
import { User, Lock, Upload } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ProfilePage = ({ currentUser, colors }) => {
    // État pour les informations du profil
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        avatar_url: ''
    });
    // État pour les mots de passe
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
    // État pour les messages de retour et le chargement
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [isSaving, setIsSaving] = useState(false);

    // Synchronise le formulaire avec les données de l'utilisateur actuel
    useEffect(() => {
        if (currentUser) {
            setFormData({
                full_name: currentUser.user_metadata.full_name || '',
                email: currentUser.email || '',
                avatar_url: currentUser.user_metadata.avatar_url || ''
            });
        }
    }, [currentUser]);

    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };
    
    // Gère le téléversement de l'avatar
    const handleAvatarChange = async (e) => {
        if (!currentUser || !e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        const fileName = `${currentUser.id}/${Date.now()}`;
        
        setIsSaving(true);
        setFeedback({ message: 'Téléchargement de l\'avatar...', type: 'info' });

        const { error } = await supabase.storage.from('avatars').upload(fileName, file);

        if (error) {
            setFeedback({ message: `Erreur: ${error.message}`, type: 'error' });
            setIsSaving(false);
            return;
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        
        const { error: updateError } = await supabase.auth.updateUser({
            data: { avatar_url: data.publicUrl }
        });

        if (updateError) {
             setFeedback({ message: `Erreur: ${updateError.message}`, type: 'error' });
        } else {
            setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }));
            setFeedback({ message: 'Avatar mis à jour !', type: 'success' });
        }
        setIsSaving(false);
    };

    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        const { error } = await supabase.auth.updateUser({
            email: formData.email,
            data: { full_name: formData.full_name }
        });

        if (error) {
            setFeedback({ message: `Erreur: ${error.message}`, type: 'error' });
        } else {
            setFeedback({ message: 'Informations mises à jour avec succès !', type: 'success' });
        }
        setIsSaving(false);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setFeedback({ message: 'Les nouveaux mots de passe ne correspondent pas.', type: 'error' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
             setFeedback({ message: 'Le mot de passe doit contenir au moins 6 caractères.', type: 'error' });
            return;
        }
        
        setIsSaving(true);
        const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });

        if (error) {
            setFeedback({ message: `Erreur: ${error.message}`, type: 'error' });
        } else {
            setFeedback({ message: 'Mot de passe mis à jour avec succès !', type: 'success' });
            setPasswordData({ newPassword: '', confirmPassword: '' });
        }
        setIsSaving(false);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold font-['Poppins'] mb-8" style={{color: colors.neutralDark}}>Mon Profil</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Section Informations personnelles */}
                <form onSubmit={handleInfoSubmit} className="p-8 bg-white rounded-xl shadow-sm space-y-6">
                    <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-3"><User /> Informations personnelles</h2>
                    
                    <div className="flex items-center gap-6">
                        <img 
                            src={formData.avatar_url || `https://placehold.co/100x100/2B5F4C/FFFFFF?text=${formData.full_name?.substring(0,2)?.toUpperCase()}`}
                            alt="Avatar" 
                            className="w-24 h-24 rounded-full object-cover border-4"
                            style={{borderColor: colors.secondary}}
                        />
                        <div>
                            <label htmlFor="avatar-upload" className="cursor-pointer px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2" style={{backgroundColor: colors.primary}}>
                                <Upload size={16} />
                                Changer de photo
                            </label>
                            <input id="avatar-upload" name="avatar-upload" type="file" className="sr-only" onChange={handleAvatarChange} accept="image/*" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Nom complet</label>
                        <input type="text" name="full_name" id="full_name" value={formData.full_name} onChange={handleInfoChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse e-mail</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleInfoChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={isSaving} className="px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50" style={{backgroundColor: colors.primary}}>
                            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>

                {/* Section Sécurité */}
                <form onSubmit={handlePasswordSubmit} className="p-8 bg-white rounded-xl shadow-sm space-y-6">
                    <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-3"><Lock /> Sécurité</h2>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                        <input type="password" name="newPassword" id="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                     <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
                        <input type="password" name="confirmPassword" id="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={isSaving} className="px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50" style={{backgroundColor: colors.primary}}>
                             {isSaving ? 'Mise à jour...' : 'Changer le mot de passe'}
                        </button>
                    </div>
                </form>
            </div>
            {/* Message de confirmation */}
            {feedback.message && (
                 <div className={`fixed bottom-10 right-10 p-4 rounded-lg shadow-lg text-white ${feedback.type === 'error' ? 'bg-red-500' : 'bg-green-600'}`}>
                    {feedback.message}
                 </div>
            )}
        </div>
    );
};

export default ProfilePage;
