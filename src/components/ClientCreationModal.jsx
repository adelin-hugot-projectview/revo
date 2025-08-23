import React, { useState } from 'react';
import { X } from 'lucide-react';

const ClientCreationModal = ({ isOpen, onRequestClose, onSave, colors }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
        // Reset form for next time
        setFormData({ name: '', email: '', phone: '', address: '' });
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4" style={{ zIndex: 1100 }}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold font-['Poppins'] text-gray-800">Nouveau Client</h2>
                    <button onClick={onRequestClose} className="p-2 rounded-full hover:bg-gray-100">
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom du client</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse e-mail</label>
                                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"/>
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresse principale</label>
                            <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"/>
                        </div>
                    </div>
                    <div className="flex justify-end items-center p-6 bg-gray-50 rounded-b-xl">
                        <button type="button" onClick={onRequestClose} className="px-6 py-2 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mr-4">
                            Annuler
                        </button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 bg-primary">
                            {isSaving ? 'Enregistrement...' : 'Enregistrer le client'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientCreationModal;

