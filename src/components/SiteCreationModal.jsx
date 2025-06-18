import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { X, ClipboardList } from 'lucide-react';

const SiteCreationModal = ({ isOpen, onRequestClose, onSave, clients, teams, checklistTemplates, colors }) => {
    const initialFormState = {
        name: '',
        clientId: '',
        date: '',
        startTime: '09:00',
        endTime: '12:00',
        address: '', // Champ pour l'adresse
        team: '',
        status: 'À venir',
        comments: '',
        checklistTemplateId: '',
    };
    const [formData, setFormData] = useState(initialFormState);
    
    // Réinitialiser le formulaire quand la modale se ferme
    useEffect(() => {
        if (!isOpen) {
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
            clientId: selectedClientId,
            client: selectedClient ? selectedClient.name : '',
            clientEmail: selectedClient ? selectedClient.email : '',
            clientPhone: selectedClient ? selectedClient.phone : '',
            address: selectedClient ? selectedClient.address || '' : '' // Pré-remplissage de l'adresse
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onRequestClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000 }, content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', border: 'none', borderRadius: '1rem', padding: '2rem', width: '90%', maxWidth: '600px' } }}
            contentLabel="Formulaire de création de chantier"
            appElement={document.getElementById('root')}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold font-['Poppins']">Nouveau Chantier</h2>
                    <button type="button" onClick={onRequestClose}><X size={24}/></button>
                </div>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom de l'intervention</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]"/>
                </div>

                <div>
                    <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Client</label>
                    <select name="clientId" id="clientId" value={formData.clientId} onChange={handleClientChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]">
                        <option value="">Sélectionner un client</option>
                        {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                    </select>
                </div>
                
                 {/* Champ Adresse */}
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresse du chantier</label>
                    <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]"/>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                        <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                    </div>
                     <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Début</label>
                        <input type="time" name="startTime" id="startTime" value={formData.startTime} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                    </div>
                     <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Fin</label>
                        <input type="time" name="endTime" id="endTime" value={formData.endTime} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                    </div>
                 </div>

                 <div>
                    <label htmlFor="team" className="block text-sm font-medium text-gray-700">Équipe assignée</label>
                    <select name="team" id="team" value={formData.team} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                        <option value="">Aucune</option>
                        {teams.map(team => <option key={team} value={team}>{team}</option>)}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="checklistTemplateId" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <ClipboardList size={16} /> Checklist associée
                    </label>
                    <select name="checklistTemplateId" id="checklistTemplateId" value={formData.checklistTemplateId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                        <option value="">Aucune</option>
                        {checklistTemplates.map(template => <option key={template.id} value={template.id}>{template.name}</option>)}
                    </select>
                </div>
                
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={onRequestClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Annuler</button>
                    <button type="submit" className="px-4 py-2 text-white rounded-md" style={{backgroundColor: colors.primary}}>Créer le chantier</button>
                </div>
            </form>
        </Modal>
    );
};

export default SiteCreationModal;
