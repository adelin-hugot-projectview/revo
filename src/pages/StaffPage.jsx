import React, { useState, useEffect } from 'react'; // Correction: Ajout de useEffect ici
import { Plus, Edit, Trash2, X } from 'lucide-react';
import Modal from 'react-modal';

// Modal pour ajouter ou modifier un utilisateur
const UserModal = ({ isOpen, onRequestClose, onSave, user, teams, colors }) => {
    const [formData, setFormData] = useState(user || { name: '', email: '', role: 'Employé', team: '' });

    // Ce hook est la source de l'erreur, il faut importer useEffect pour qu'il fonctionne.
    useEffect(() => {
        setFormData(user || { name: '', email: '', role: 'Employé', team: '' });
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={{
                overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000 },
                content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', border: 'none', borderRadius: '1rem', padding: '2rem', width: '90%', maxWidth: '500px' }
            }}
            contentLabel="Formulaire Utilisateur"
            appElement={document.getElementById('root')}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold font-['Poppins']">{user ? 'Modifier' : 'Ajouter'} un utilisateur</h2>
                    <button type="button" onClick={onRequestClose}><X size={24}/></button>
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom complet</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]"/>
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse e-mail</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]"/>
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rôle</label>
                    <select name="role" id="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]">
                        <option>Administrateur</option>
                        <option>Chef de chantier</option>
                        <option>Employé</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="team" className="block text-sm font-medium text-gray-700">Équipe</label>
                    <select name="team" id="team" value={formData.team} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]">
                        <option value="">Aucune</option>
                        {teams.map(team => <option key={team} value={team}>{team}</option>)}
                    </select>
                </div>
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={onRequestClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Annuler</button>
                    <button type="submit" className="px-4 py-2 text-white rounded-md" style={{backgroundColor: colors.primary}}>Enregistrer</button>
                </div>
            </form>
        </Modal>
    );
};


const StaffPage = ({ staff, setStaff, teams, colors }) => {
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
    
    const handleDeleteUser = (userId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
             setStaff(currentStaff => currentStaff.filter(user => user.id !== userId));
        }
    };

    const handleSaveUser = (userData) => {
        if (userData.id) {
            // Modification
            setStaff(currentStaff => currentStaff.map(user => user.id === userData.id ? userData : user));
        } else {
            // Ajout
            setStaff(currentStaff => [...currentStaff, { ...userData, id: `user-${Date.now()}` }]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[${colors.neutralDark}] font-['Poppins']">Gestion du personnel</h1>
                <button onClick={handleAddUser} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors" style={{backgroundColor: colors.primary}}>
                    <Plus size={20}/>
                    Ajouter un utilisateur
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.team || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => handleEditUser(user)} className="text-[${colors.primary}] hover:text-opacity-80 p-2"><Edit size={18}/></button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="text-[${colors.danger}] hover:text-opacity-80 p-2"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <UserModal 
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                onSave={handleSaveUser}
                user={editingUser}
                teams={teams}
                colors={colors}
            />
        </div>
    );
};

export default StaffPage;
