import React, { useState } from 'react';
import { User, Lock, Upload } from 'lucide-react';

const ProfilePage = ({ currentUser, setCurrentUser, colors }) => {
    // État pour les informations du profil
    const [formData, setFormData] = useState(currentUser);
    // État séparé pour les mots de passe
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    // État pour les messages de confirmation
    const [feedback, setFeedback] = useState('');

    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Soumission du formulaire d'informations
    const handleInfoSubmit = (e) => {
        e.preventDefault();
        setCurrentUser(formData);
        setFeedback('Informations mises à jour avec succès !');
        setTimeout(() => setFeedback(''), 3000);
    };

    // Soumission du formulaire de mot de passe
    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            setFeedback('Les nouveaux mots de passe ne correspondent pas.');
            setTimeout(() => setFeedback(''), 3000);
            return;
        }
        // La logique de changement de mot de passe irait ici
        console.log('Changement de mot de passe demandé:', passwordData);
        setFeedback('Mot de passe mis à jour avec succès !');
        setPasswordData({ current: '', new: '', confirm: '' });
        setTimeout(() => setFeedback(''), 3000);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-[${colors.neutralDark}] font-['Poppins'] mb-8">Mon Profil</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Section Informations personnelles */}
                <form onSubmit={handleInfoSubmit} className="p-8 bg-white rounded-xl shadow-sm space-y-6">
                    <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-3"><User /> Informations personnelles</h2>
                    
                    {/* Section Photo de profil */}
                    <div className="flex items-center gap-6">
                        <img 
                            src={formData.avatar}
                            alt="Avatar" 
                            className="w-24 h-24 rounded-full object-cover border-4"
                            style={{borderColor: colors.secondary}}
                        />
                        <div>
                            <label htmlFor="avatar-upload" className="cursor-pointer px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2" style={{backgroundColor: colors.primary}}>
                                <Upload size={16} />
                                Changer de photo
                            </label>
                            <input id="avatar-upload" name="avatar-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom complet</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleInfoChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]"/>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse e-mail</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleInfoChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]"/>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="px-6 py-2 text-white rounded-lg transition-colors" style={{backgroundColor: colors.primary}}>
                            Enregistrer
                        </button>
                    </div>
                </form>

                {/* Section Sécurité */}
                <form onSubmit={handlePasswordSubmit} className="p-8 bg-white rounded-xl shadow-sm space-y-6">
                    <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-3"><Lock /> Sécurité</h2>
                    <div>
                        <label htmlFor="current" className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
                        <input type="password" name="current" id="current" value={passwordData.current} onChange={handlePasswordChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]"/>
                    </div>
                    <div>
                        <label htmlFor="new" className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                        <input type="password" name="new" id="new" value={passwordData.new} onChange={handlePasswordChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]"/>
                    </div>
                     <div>
                        <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
                        <input type="password" name="confirm" id="confirm" value={passwordData.confirm} onChange={handlePasswordChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]"/>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="px-6 py-2 text-white rounded-lg transition-colors" style={{backgroundColor: colors.primary}}>
                            Changer le mot de passe
                        </button>
                    </div>
                </form>
            </div>
            {/* Message de confirmation */}
            {feedback && (
                 <div className="fixed bottom-10 right-10 p-4 rounded-lg shadow-lg" style={{backgroundColor: colors.secondary, color: colors.primary}}>
                    {feedback}
                 </div>
            )}
        </div>
    );
};

export default ProfilePage;
