import React from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';

const DetailSection = ({ icon: Icon, title, children }) => (
    <div className="border-t border-gray-200 pt-4 mt-6 first:mt-0 first:border-t-0 first:pt-0">
        <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2 mb-3">
            <Icon size={16} />
            {title}
        </h3>
        {children}
    </div>
);

// CORRECTION : Le composant reçoit `client` directement
const ClientInfoTab = ({ client }) => {
    if (!client) return <p>Informations du client non disponibles.</p>;

    return (
        <div className="space-y-6">
            <DetailSection icon={User} title="Client">
                <p className="font-bold text-2xl text-gray-800">{client.name}</p>
            </DetailSection>

            <DetailSection icon={Phone} title="Contact">
                 <div className="flex items-center gap-4 text-sm mt-2">
                    <a href={`mailto:${client.email}`} className="flex-1 text-center flex items-center justify-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors"><Mail size={14}/> Envoyer un mail</a>
                    <a href={`tel:${client.phone}`} className="flex-1 text-center flex items-center justify-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors"><Phone size={14}/> Appeler</a>
                 </div>
            </DetailSection>

            <DetailSection icon={MapPin} title="Adresse Principale">
                <p>{client.address}</p>
            </DetailSection>
        </div>
    );
};

export default ClientInfoTab;
