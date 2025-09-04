import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { X, Plus } from 'lucide-react';

const SiteCreationModal = ({ isOpen, onRequestClose, onSave, clients, teams, checklistTemplates, colors, onAddClient }) => {
    // On s'assure que tous les champs sont présents dans l'état initial
    const initialFormState = {
        name: '',
        client_id: '',
        startDate: '',
        endDate: '',
        startTime: '09:00',
        endTime: '12:00',
        address: '',
        team_id: '',
    };
    const [formData, setFormData] = useState(initialFormState);
    const [isSaving, setIsSaving] = useState(false);
    
    // Réinitialise le formulaire quand la modale s'ouvre
    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormState);
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClientChange = (e) => {
        const selectedClientId = e.target.value;
        const selectedClient = clients.find(c => c.id === selectedClientId);
        setFormData(prev => ({
            ...prev,
            client_id: selectedClientId,
            address: selectedClient ? selectedClient.address || '' : ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(null, {
                ...formData,
                start_date: formData.startDate,
                end_date: formData.endDate,
                start_time: formData.startTime,
                end_time: formData.endTime,
            });
            onRequestClose();
        } catch (error) {
            console.error('Erreur création chantier:', error);
        }
        setIsSaving(false);
    };

    // Assure que la modale est accessible
    useEffect(() => {
      Modal.setAppElement('#root');
    }, []);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={{ 
                overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }, 
                content: { position: 'relative', top: 'auto', left: 'auto', right: 'auto', bottom: 'auto', border: 'none', borderRadius: '0.75rem', padding: '0', width: '90%', maxWidth: '600px', background: 'white', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', overflow: 'hidden' } 
            }}
            contentLabel="Formulaire de création de chantier"
        >
            <form onSubmit={handleSubmit}>
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold font-['Poppins']">Nouveau Chantier</h2>
                    <button type="button" onClick={onRequestClose} className="p-2 rounded-full hover:bg-gray-100"><X size={24}/></button>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom de l'intervention</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"/>
                    </div>
                    <div>
                        <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">Client</label>
                        <div className="mt-1 flex gap-2">
                            <select name="client_id" id="client_id" value={formData.client_id} onChange={handleClientChange} required className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary">
                                <option value="">Sélectionner un client</option>
                                {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                            </select>
                            <button
                                type="button"
                                onClick={onAddClient}
                                className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors border border-gray-300"
                                title="Créer un nouveau client"
                            >
                                <Plus size={16} />
                                <span className="hidden sm:inline">Client</span>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresse du chantier</label>
                        <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"/>
                    </div>
                    
                    {/* --- DATES ET HEURES --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Date de début</label>
                            <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Date de fin</label>
                            <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Heure de début</label>
                            <input type="time" name="startTime" id="startTime" value={formData.startTime} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Heure de fin</label>
                            <input type="time" name="endTime" id="endTime" value={formData.endTime} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>
                    </div>

                    {/* --- ÉQUIPES --- */}
                    <div>
                        <label htmlFor="team_id" className="block text-sm font-medium text-gray-700">Équipe assignée</label>
                        <select name="team_id" id="team_id" value={formData.team_id} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                            <option value="">Aucune</option>
                            {/* Note: Ceci nécessite que la prop 'teams' soit un tableau d'objets [{id, name}, ...] */}
                            {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                        </select>
                    </div>

                </div>
                
                <div className="flex justify-end gap-4 p-6 bg-gray-50 border-t">
                    <button type="button" onClick={onRequestClose} className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300">Annuler</button>
                    <button type="submit" disabled={isSaving} className="px-4 py-2 text-white font-medium rounded-md disabled:opacity-50 bg-primary">
                        {isSaving ? 'Recherche des coordonnées...' : 'Créer le chantier'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default SiteCreationModal;
