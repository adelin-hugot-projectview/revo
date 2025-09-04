import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Plus, Info, Users } from 'lucide-react';
import DateRangePicker from '../components/DateRangePicker.jsx';

// --- UTILITIES ---
const createCustomIcon = (color) => {
    const iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="${color}" style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.4));"><path d="M12 0C7.589 0 4 3.589 4 8c0 4.411 8 16 8 16s8-11.589 8-16c0-4.411-3.589-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>`;
    return new L.DivIcon({ html: iconHtml, className: '', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });
};

// --- COMPOSANT POUR METTRE À JOUR LES BORNES DE LA CARTE ---
const MapBoundsUpdater = ({ sites }) => {
    const map = useMap();
    useEffect(() => {
        const validSites = sites.filter(site => typeof site.lat === 'number' && typeof site.lng === 'number');
        if (validSites.length > 0) {
            const bounds = L.latLngBounds(validSites.map(site => [site.lat, site.lng]));
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }
    }, [sites, map]);
    return null;
}

// --- COMPOSANT PRINCIPAL DE LA PAGE ---
const MapPage = ({ sites, teams = [], statusColumns = [], colors, onSiteClick, onAddSite }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(''); // Filtrera par ID de statut
    const [teamFilter, setTeamFilter] = useState('');
    const [dateRange, setDateRange] = useState({ start: null, end: null });

    // Les icônes sont maintenant créées dynamiquement pour chaque site
    // en utilisant la couleur de son statut.
    const getSiteIcon = (siteStatusColor) => {
        return createCustomIcon(siteStatusColor || colors.neutralDark); // Fallback couleur par défaut
    };

    const filteredSites = useMemo(() => sites.filter(site => {
        if (typeof site.lat !== 'number' || typeof site.lng !== 'number') return false;
        
        const siteDate = new Date(site.date);
        const start = dateRange.start;
        const end = dateRange.end;
        if(start) start.setHours(0,0,0,0);
        if(end) end.setHours(23,59,59,999);

        const searchMatch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) || site.client.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = !statusFilter || site.status?.id === statusFilter; // Comparaison par ID
        const teamMatch = !teamFilter || site.team?.id == teamFilter;
        const dateMatch = (!start || siteDate >= start) && (!end || siteDate <= end);
        
        return searchMatch && statusMatch && teamMatch && dateMatch;
    }), [sites, searchTerm, statusFilter, teamFilter, dateRange]);

    const defaultPosition = [45.7640, 4.8357]; // Lyon

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-800 font-['Poppins']">Carte des chantiers</h1>
                <button onClick={onAddSite} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors" style={{backgroundColor: colors.primary}}>
                    <Plus size={20}/>Nouveau chantier
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-green-600"/>
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-green-600">
                    <option value="">Tous les statuts</option>
                    {statusColumns.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                 <div className="flex items-center gap-2">
                    <Users size={20} className="text-gray-500"/>
                    <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)} className="p-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-green-600">
                        <option value="">Toutes les équipes</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <DateRangePicker onDateChange={(start, end) => setDateRange({ start, end })} colors={colors} />
            </div>

            <div className="flex-grow rounded-xl shadow-sm overflow-hidden z-10">
                 <MapContainer center={defaultPosition} zoom={7} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    {filteredSites.map(site => (
                        <Marker key={site.id} position={[site.lat, site.lng]} icon={getSiteIcon(site.status?.color)}>
                            <Popup>
                                <div className="p-1 font-['Inter'] space-y-1">
                                    <h3 className="font-bold text-base" style={{color: colors.primary}}>{site.name}</h3>
                                    <p className="text-sm text-gray-700"><strong>Client:</strong> {site.client}</p>
                                    <p className="text-sm text-gray-700"><strong>Équipe:</strong> {site.team?.name || 'Non assignée'}</p>
                                    <button onClick={() => onSiteClick(site)} className="w-full mt-2 flex items-center justify-center gap-2 p-2 rounded-lg text-white text-sm transition-colors" style={{backgroundColor: colors.primary}}>
                                        <Info size={16}/>Voir les détails
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                    <MapBoundsUpdater sites={filteredSites} />
                </MapContainer>
            </div>
        </div>
    );
};

export default MapPage;
