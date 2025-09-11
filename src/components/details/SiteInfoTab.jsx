import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Edit3, Save, X } from 'lucide-react';
import StatusSelector from '../StatusSelector.jsx';

// --- FONCTION POUR CRÉER UNE ICÔNE DE CARTE PERSONNALISÉE ---
const createCustomIcon = (color) => {
    const iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="${color}" style="filter: drop-shadow(0 1px 1px rgba(0,0,0,0.5));"><path d="M12 0C7.589 0 4 3.589 4 8c0 4.411 8 16 8 16s8-11.589 8-16c0-4.411-3.589-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>`;
    return new L.DivIcon({ html: iconHtml, className: '', iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28] });
};

// --- COMPOSANT POUR AFFICHER UNE LIGNE D'INFORMATION ---
const InfoRow = ({ label, value, children }) => (
    <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {children ? children : <p className="text-md text-gray-800">{value || 'Non renseigné'}</p>}
    </div>
);

// --- COMPOSANT PRINCIPAL DE L'ONGLET INFO ---
const SiteInfoTab = ({ site, teams, colors, onUpdateSite, onUpdateSiteStatus, statusColumns = [] }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        setFormData({
            team_id: site.team?.id || '',
            start_date: site.startDate ? site.startDate.split('T')[0] : '',
            end_date: site.endDate ? site.endDate.split('T')[0] : '',
            start_time: site.startTime || '09:00',
            end_time: site.endTime || '17:00',
            address: site.address || '',
        });
    }, [site]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const updates = Object.keys(formData).reduce((acc, key) => {
            let initialValue;
            // CORRECTION: Logique de comparaison robuste
            switch (key) {
                case 'team_id':    initialValue = site.team?.id || ''; break;
                case 'start_time': initialValue = site.startTime || '09:00'; break;
                case 'end_time':   initialValue = site.endTime || '17:00'; break;
                case 'start_date': initialValue = site.startDate ? site.startDate.split('T')[0] : ''; break;
                case 'end_date':   initialValue = site.endDate ? site.endDate.split('T')[0] : ''; break;
                default:           initialValue = site[key] || '';
            }
            if (formData[key] !== initialValue) {
                 acc[key] = formData[key] === '' ? null : formData[key];
            }
            return acc;
        }, {});
        
        if (Object.keys(updates).length > 0) {
            onUpdateSite(updates);
        }
        setIsEditing(false);
    };

    const hasCoordinates = typeof site.latitude === 'number' && typeof site.longitude === 'number';

    return (
        <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">Informations générales</h3>
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold p-2 rounded-lg hover:bg-blue-100">
                            <Edit3 size={16} /> Modifier
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                             <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 font-semibold p-2 rounded-lg hover:bg-gray-100">
                                <X size={16} /> Annuler
                            </button>
                             <button onClick={handleSave} className="flex items-center gap-2 text-sm text-white font-semibold p-2 rounded-lg bg-primary">
                                <Save size={16} /> Enregistrer
                            </button>
                        </div>
                    )}
                </div>

                {!isEditing ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                        <InfoRow label="Équipe" value={site.team?.name} />
                        <InfoRow label="Statut">
                            {onUpdateSiteStatus ? (
                                <StatusSelector 
                                    currentStatus={site.status} 
                                    onStatusChange={(newStatusId) => onUpdateSiteStatus(site.id, newStatusId)} 
                                    availableStatuses={statusColumns} 
                                    colors={colors} 
                                    showLabel={false} 
                                />
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{backgroundColor: site.status?.color || '#A9A9A9', color: '#ffffff'}}>
                                    {site.status?.name || 'Aucun statut'}
                                </span>
                            )}
                        </InfoRow>
                        <InfoRow label="Date de début" value={new Date(site.startDate).toLocaleDateString('fr-FR')} />
                        <InfoRow label="Date de fin" value={new Date(site.endDate).toLocaleDateString('fr-FR')} />
                        <InfoRow label="Horaires" value={`${site.startTime} - ${site.endTime}`} />
                        <div className="col-span-2"> <InfoRow label="Adresse" value={site.address} /> </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                        <InfoRow label="Équipe">
                            <select name="team_id" value={formData.team_id} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500">
                                <option value="">Aucune équipe</option>
                                {teams && teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                            </select>
                        </InfoRow>
                        <div className="col-span-2 grid grid-cols-2 gap-2">
                             <InfoRow label="Date de début">
                                <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md"/>
                             </InfoRow>
                              <InfoRow label="Date de fin">
                                <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md"/>
                             </InfoRow>
                        </div>
                        <div className="col-span-2 grid grid-cols-2 gap-2">
                              <InfoRow label="Début">
                                <input type="time" name="start_time" value={formData.start_time} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md"/>
                             </InfoRow>
                              <InfoRow label="Fin">
                                <input type="time" name="end_time" value={formData.end_time} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md"/>
                             </InfoRow>
                        </div>
                         <div className="col-span-2">
                            <InfoRow label="Adresse">
                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md"/>
                            </InfoRow>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="h-48 w-full rounded-lg overflow-hidden border z-10">
                {hasCoordinates ? (
                    <MapContainer center={[site.latitude, site.longitude]} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap &copy; CARTO'/>
                        <Marker position={[site.latitude, site.longitude]} icon={createCustomIcon(colors.primary)}>
                            <Popup>{site.name}</Popup>
                        </Marker>
                    </MapContainer>
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100">
                        <p className="text-sm text-gray-500">Coordonnées GPS non disponibles.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SiteInfoTab;
