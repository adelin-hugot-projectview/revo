import React, { useState } from 'react';

const CompanyPage = ({ companyInfo, setCompanyInfo, colors }) => {
    const [formData, setFormData] = useState(companyInfo);
    const [feedback, setFeedback] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setCompanyInfo(formData);
        setFeedback('Informations enregistrées avec succès !');
        setTimeout(() => setFeedback(''), 3000); // Fait disparaître le message après 3 secondes
    };

    return (
        <div className="h-full flex flex-col">
            <h1 className="text-3xl font-bold text-[${colors.neutralDark}] font-['Poppins'] mb-8">Ma société</h1>
            
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-sm space-y-8 w-full">
                {/* Logo Section */}
                <div className="flex items-center gap-6">
                    <img 
                        src={formData.logo || 'https://placehold.co/100x100/E1F2EC/2B5F4C?text=Logo'} 
                        alt="Company Logo" 
                        className="w-24 h-24 rounded-full object-cover border-4"
                        style={{borderColor: colors.secondary}}
                    />
                    <div>
                        <label htmlFor="logo-upload" className="cursor-pointer px-4 py-2 text-sm font-medium text-white rounded-lg" style={{backgroundColor: colors.primary}}>
                            Changer le logo
                        </label>
                        <input id="logo-upload" name="logo-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom de la société</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]"/>
                    </div>
                     <div>
                        <label htmlFor="siret" className="block text-sm font-medium text-gray-700">SIRET</label>
                        <input type="text" name="siret" id="siret" value={formData.siret} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]"/>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresse</label>
                        <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]"/>
                    </div>
                    <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Code Postal</label>
                        <input type="text" name="postalCode" id="postalCode" value={formData.postalCode} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]"/>
                    </div>
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ville</label>
                        <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]"/>
                    </div>
                </div>
                
                {/* Save Button & Feedback */}
                <div className="flex items-center justify-end gap-4">
                    {feedback && <span className="text-sm text-green-600">{feedback}</span>}
                    <button type="submit" className="px-6 py-2 text-white rounded-lg transition-colors" style={{backgroundColor: colors.primary}}>
                        Enregistrer
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CompanyPage;

