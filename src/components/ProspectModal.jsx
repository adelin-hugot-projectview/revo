import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { X } from 'lucide-react';

const ProspectModal = ({ isOpen, onRequestClose, onSave, columns, prospect, defaultColumnId, colors }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (prospect) {
            setFormData(prospect);
        } else {
            setFormData({
                project_name: '',
                contact_name: '',
                kanban_column_id: defaultColumnId || (columns[0]?.id || ''),
                phone: '',
                email: '',
                address: '',
                amount: '',
                description: ''
            });
        }
    }, [prospect, isOpen, defaultColumnId, columns]);

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
                content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', border: 'none', background: 'transparent', padding: 0, width: '90%', maxWidth: '700px' }
            }}
            appElement={document.getElementById('root')}
        >
            <div className="flex flex-col bg-white rounded-xl max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold font-['Poppins'] text-gray-800">{prospect ? 'Modifier le Contact' : 'Nouveau Contact'}</h2>
                    <button type="button" onClick={onRequestClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="project_name" className="block text-sm font-medium text-gray-700">Nom du projet</label>
                            <input type="text" name="project_name" value={formData.project_name || ''} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700">Nom & Prénom</label>
                            <input type="text" name="contact_name" value={formData.contact_name || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="kanban_column_id" className="block text-sm font-medium text-gray-700">Statut</label>
                            <select name="kanban_column_id" value={formData.kanban_column_id || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white">
                                {columns.map(col => <option key={col.id} value={col.id}>{col.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Montant de l'intervention (€)</label>
                            <input type="number" name="amount" value={formData.amount || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                            <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresse</label>
                            <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description du projet</label>
                            <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="4" className="mt-1 w-full p-2 border rounded-md"></textarea>
                        </div>
                    </div>
                </form>
                <div className="flex justify-end gap-4 p-6 border-t mt-auto">
                    <button type="button" onClick={onRequestClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Annuler</button>
                    <button type="button" onClick={handleSubmit} className="px-4 py-2 text-white font-semibold rounded-lg bg-primary">Enregistrer</button>
                </div>
            </div>
        </Modal>
    );
};

export default ProspectModal;
