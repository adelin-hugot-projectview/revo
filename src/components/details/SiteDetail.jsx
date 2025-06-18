import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { User, Clock, MapPin, MessageSquare, History, Mail, Phone, HardHat, Edit } from 'lucide-react';

// Composant pour une section, maintenant avec la possibilité d'actions (ex: bouton edit)
const DetailSection = ({ icon: Icon, title, actions, children, isFirst }) => (
    <div className={!isFirst ? "border-t border-gray-200 pt-4" : ""}>
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
                <Icon size={16} />
                {title}
            </h3>
            {actions && <div>{actions}</div>}
        </div>
        {children}
    </div>
);

// Composant principal de la fiche détail
const SiteDetail = ({ site, colors }) => {
    const [editableSite, setEditableSite] = useState(site);

    useEffect(() => {
        setEditableSite(site);
    }, [site]);

    if (!site) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditableSite(prev => ({ ...prev, [name]: value }));
    };

    // Données de démo pour les techniciens
    const teamMembers = {
        'Équipe Alpha': ['Bob Garcia', 'Charlie Petit'],
        'Équipe Bêta': ['Diana Moreau', 'Frank Martin'],
        'Équipe Gamma': ['Grace Dubois', 'Heidi Bernard']
    };
    
    // Pour éviter l'erreur d'icône non définie avec Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    return (
        <div className="space-y-6 text-gray-800">
            {/* Statut de l'intervention */}
            <select
                name="status"
                value={editableSite.status}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg font-semibold text-lg focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]"
            >
                <option>En attente</option>
                <option>En cours</option>
                <option>Terminé</option>
                <option>Annulé</option>
            </select>
            
            {/* Intervention */}
            <DetailSection 
                icon={Clock} 
                title="Intervention"
                isFirst={true}
                actions={
                    <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-[${colors.primary}]">
                        <Edit size={16}/>
                    </button>
                }
            >
                <p><strong>Début :</strong> {new Date(site.date).toLocaleDateString('fr-FR')} à {site.startTime}</p>
                <p><strong>Fin :</strong> {new Date(site.date).toLocaleDateString('fr-FR')} à {site.endTime}</p>
            </DetailSection>

            {/* Équipe de pose */}
            <DetailSection icon={HardHat} title="Équipe de pose">
                <p className="font-semibold mb-3">{site.team}</p>
                <div className="flex flex-wrap gap-2">
                    {teamMembers[site.team]?.map(tech => (
                        <span key={tech} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">{tech}</span>
                    )) || <span className="text-sm text-gray-500">Aucun technicien assigné.</span>}
                </div>
            </DetailSection>

            {/* Adresse & Carte */}
            <DetailSection icon={MapPin} title="Localisation">
                <p className="mb-3">{site.address}</p>
                <div className="h-48 w-full rounded-lg overflow-hidden z-0">
                     <MapContainer center={[site.lat, site.lng]} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                        <Marker position={[site.lat, site.lng]}></Marker>
                    </MapContainer>
                </div>
            </DetailSection>

            {/* Informations Client */}
            <DetailSection icon={User} title="Client">
                 <p className="font-semibold text-lg">{site.client}</p>
                 <div className="flex items-center gap-3 mt-3">
                    <a href={`tel:${site.clientPhone}`} className="flex-1 text-center flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors"><Phone size={14}/> Appeler</a>
                    <a href={`mailto:${site.clientEmail}`} className="flex-1 text-center flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors"><Mail size={14}/> Envoyer un mail</a>
                 </div>
            </DetailSection>
            
            {/* Commentaire */}
            <DetailSection icon={MessageSquare} title="Commentaire">
                <textarea
                    name="comments"
                    value={editableSite.comments}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Ajouter un commentaire..."
                    className="w-full text-sm bg-gray-50 p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[${colors.primary}] transition-colors"
                />
            </DetailSection>

            {/* Historique */}
            <DetailSection icon={History} title="Historique">
                <ul className="space-y-3 text-sm">
                    {site.history.map((entry, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full mt-1.5" style={{backgroundColor: colors.primary}}></div>
                            <div>
                                <p className="font-semibold">{entry.action}</p>
                                <p className="text-xs text-gray-500">{entry.user} - {new Date(entry.date).toLocaleDateString('fr-FR')}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </DetailSection>
        </div>
    );
};

export default SiteDetail;
