import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from 'react-modal';

// --- MODAL ---
const UserModal = ({ isOpen, onRequestClose, onSave, user, teams, colors }) => {
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const isEditing = !!user;

    useEffect(() => {
        Modal.setAppElement('#root');
        setFormData(user || { full_name: '', email: '', role: 'Employé', team_id: null });
    }, [user, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const { error } = await onSave(formData, isEditing);
        setIsSaving(false);
        if (!error) {
            onRequestClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000 }, content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', border: 'none', borderRadius: '1rem', padding: '0', width: '90%', maxWidth: '500px' } }}
            contentLabel="Formulaire Utilisateur"
        >
            <form onSubmit={handleSubmit} className="flex flex-col bg-white rounded-xl overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold font-['Poppins']">{isEditing ? 'Modifier' : 'Inviter'} un utilisateur</h2>
                </div>
                <div className="p-8 space-y-6 flex-grow overflow-y-auto">
                    <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Nom complet</label>
                        <input type="text" name="full_name" id="full_name" value={formData.full_name || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse e-mail</label>
                        <input type="email" name="email" id="email" value={formData.email || ''} onChange={handleChange} required disabled={isEditing} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rôle</label>
                        <select name="role" id="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                            <option>Administrateur</option>
                            <option>Chef de chantier</option>
                            <option>Employé</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="team_id" className="block text-sm font-medium text-gray-700">Équipe</label>
                        <select name="team_id" id="team_id" value={formData.team_id || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                            <option value="">Aucune</option>
                            {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-4 p-6 bg-gray-50 border-t">
                    <button type="button" onClick={onRequestClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Annuler</button>
                    <button type="submit" disabled={isSaving} className="px-4 py-2 text-white rounded-md disabled:opacity-50" style={{backgroundColor: colors.primary}}>
                        {isSaving ? 'En cours...' : (isEditing ? 'Enregistrer' : 'Envoyer l\'invitation')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

// --- PAGE PRINCIPALE ---
const StaffPage = ({ staff, teams, colors, onInviteUser, onUpdateUser, onDeleteUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const handleAddUser = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };
    
    const handleSave = (formData, isEditing) => {
        if (isEditing) {
            return onUpdateUser(formData);
        } else {
            return onInviteUser(formData);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[${colors.neutralDark}] font-['Poppins']">Gestion du personnel</h1>
                <button onClick={handleAddUser} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors" style={{backgroundColor: colors.primary}}>
                    <Plus size={20}/>
                    Inviter un utilisateur
                </button>
            </div>
            
            <div className="flex-grow bg-white rounded-xl shadow-sm overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Équipe</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {staff.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{user.full_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.team?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => handleEditUser(user)} className="text-gray-500 hover:text-gray-800 p-2"><Edit size={18}/></button>
                                    <button onClick={() => onDeleteUser(user.id)} className="text-red-500 hover:text-red-800 p-2"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <UserModal 
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                user={editingUser}
                teams={teams}
                colors={colors}
            />
        </div>
    );
};

export default StaffPage;
