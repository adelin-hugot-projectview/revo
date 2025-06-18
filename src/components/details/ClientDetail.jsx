import React from 'react';
import { Mail, Phone } from 'lucide-react';

const ClientDetail = ({ client, onSiteClick }) => {
    if (!client) return null;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-500">Contact</h3>
                <p className="text-xl flex items-center gap-2"><Phone size={20} /> {client.phone}</p>
                <p className="text-xl flex items-center gap-2"><Mail size={20} /> {client.email}</p>
            </div>
            
            <div>
                 <h3 className="text-lg font-semibold text-gray-500 mb-2">Chantiers ({client.sites.length})</h3>
                 <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {client.sites.map(site => (
                        <li 
                            key={site.id} 
                            onClick={() => onSiteClick(site)}
                            className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                        >
                            <p className="font-semibold">{site.name}</p>
                            <p className="text-sm text-gray-600">
                                {new Date(site.date).toLocaleDateString('fr-FR')} - <span className="font-medium">{site.status}</span>
                            </p>
                        </li>
                    ))}
                 </ul>
            </div>
        </div>
    );
};

export default ClientDetail;
