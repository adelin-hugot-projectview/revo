import React from 'react';
import { Mail, Phone, MapPin, Building } from 'lucide-react';
import StatusPill from './StatusPill.jsx'; // Import de la StatusPill globale

// --- COMPOSANT PRINCIPAL DE LA FICHE CLIENT (MODERNISÉ) ---
const ClientDetail = ({ client, onSiteClick }) => {
    if (!client) return null;

    // Composant pour afficher une information de contact
    const ContactInfo = ({ icon, label, value, href }) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-base font-semibold text-gray-800">{value || 'Non renseigné'}</p>
            </div>
        </a>
    );

    return (
        <div className="space-y-8 p-1">
            {/* --- CARTE DES COORDONNÉES --- */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Building size={20} className="text-gray-400" />
                    Coordonnées
                </h3>
                <div className="space-y-1">
                    <ContactInfo icon={<Phone size={16} className="text-gray-600" />} label="Téléphone" value={client.phone} href={`tel:${client.phone}`} />
                    <ContactInfo icon={<Mail size={16} className="text-gray-600" />} label="Email" value={client.email} href={`mailto:${client.email}`} />
                    <ContactInfo icon={<MapPin size={16} className="text-gray-600" />} label="Adresse" value={client.address} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.address)}`} />
                </div>
            </div>
            
            {/* --- LISTE DES CHANTIERS ASSOCIÉS --- */}
            <div>
                 <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Chantiers associés ({client.sites.length})
                 </h3>
                 <ul className="space-y-3 max-h-[28rem] overflow-y-auto pr-2">
                    {client.sites.length > 0 ? (
                        client.sites.map(site => (
                            <li 
                                key={site.id} 
                                onClick={() => onSiteClick(site)}
                                className="p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:shadow-md hover:border-green-500 transition-all duration-200"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-900">{site.name}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(site.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <StatusPill status={site.status} />
                                </div>
                            </li>
                        ))
                    ) : (
                        <div className="text-center py-8 px-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">Aucun chantier n'est associé à ce client.</p>
                        </div>
                    )}
                 </ul>
            </div>
        </div>
    );
};

export default ClientDetail;
