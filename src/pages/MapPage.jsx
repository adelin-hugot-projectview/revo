import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Calendar, Users, Info, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

// --- COMPOSANT CUSTOM DE SÉLECTEUR DE DATE ---
const DateRangePicker = ({ onDateChange, colors }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const wrapperRef = useRef(null);

    const formatDate = (date) => date ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(date) : '';

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleDayClick = (day) => {
        if (!startDate || (startDate && endDate)) {
            setStartDate(day);
            setEndDate(null);
        } else if (startDate && !endDate) {
            if (day < startDate) {
                setEndDate(startDate);
                setStartDate(day);
            } else {
                setEndDate(day);
            }
        }
    };
    
    const confirmSelection = () => {
        onDateChange(startDate, endDate);
        setIsOpen(false);
    }

    const renderHeader = () => (
        <div className="flex justify-between items-center px-4 py-2">
            <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-1 rounded-full hover:bg-gray-100"><ChevronLeft size={20} /></button>
            <span className="font-semibold text-sm">{new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(currentMonth)}</span>
            <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-1 rounded-full hover:bg-gray-100"><ChevronRight size={20} /></button>
        </div>
    );

    const renderDays = () => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const days = [];
        const monthStartDay = (date.getDay() + 6) % 7; // Lundi = 0

        for (let i = 0; i < monthStartDay; i++) {
            days.push(<div key={`empty-start-${i}`} className="text-center p-2"></div>);
        }

        while (date.getMonth() === currentMonth.getMonth()) {
            const day = new Date(date);
            const isSelectedStart = startDate && day.toDateString() === startDate.toDateString();
            const isSelectedEnd = endDate && day.toDateString() === endDate.toDateString();
            const isInRange = startDate && endDate && day > startDate && day < endDate;
            const isToday = day.toDateString() === new Date().toDateString();

            let classes = "text-center p-2 rounded-full cursor-pointer text-sm transition-colors";
            if (isSelectedStart || isSelectedEnd) {
                classes += ` bg-[${colors.primary}] text-white`;
            } else if (isInRange) {
                classes += ` bg-[${colors.secondary}]`;
            } else if (isToday) {
                 classes += ` border border-gray-300`;
            } else {
                classes += ' hover:bg-gray-100';
            }

            days.push(<div key={day} className={classes} onClick={() => handleDayClick(day)}>{day.getDate()}</div>);
            date.setDate(date.getDate() + 1);
        }

        return <div className="grid grid-cols-7 gap-1 p-2">{days}</div>;
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg text-sm">
                <Calendar size={20} className="text-gray-500"/>
                <span>{startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : 'Sélectionner une plage'}</span>
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 bg-white rounded-xl shadow-lg border z-30 w-72">
                    {renderHeader()}
                    {renderDays()}
                    <div className="p-2 border-t flex justify-end">
                        <button onClick={confirmSelection} className="px-4 py-1 text-white text-sm rounded-lg" style={{backgroundColor: colors.primary}}>Confirmer</button>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- COMPOSANT PRINCIPAL DE LA PAGE ---
const createCustomIcon = (color) => {
    const iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="${color}" style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.4));"><path d="M12 0C7.589 0 4 3.589 4 8c0 4.411 8 16 8 16s8-11.589 8-16c0-4.411-3.589-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>`;
    return new L.DivIcon({ html: iconHtml, className: '', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });
};

const MapPage = ({ sites, colors, onSiteClick, onAddSite }) => {
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [selectedTeam, setSelectedTeam] = useState('');

    const icons = {
        'À venir': createCustomIcon(colors.accent),
        'En cours': createCustomIcon(colors.success),
        'Terminé': createCustomIcon(colors.primary),
        'Problème': createCustomIcon(colors.danger)
    };

    const uniqueTeams = useMemo(() => [...new Set(sites.map(site => site.team))], [sites]);
    
    const filteredSites = sites.filter(site => {
        const siteDate = new Date(site.date);
        const start = dateRange.start;
        const end = dateRange.end;
        if(start) start.setHours(0,0,0,0);
        if(end) end.setHours(23,59,59,999);

        const dateFilterPassed = (!start || siteDate >= start) && (!end || siteDate <= end);
        const teamFilterPassed = !selectedTeam || site.team === selectedTeam;
        return dateFilterPassed && teamFilterPassed;
    });

    const defaultPosition = [45.7640, 4.8357];

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-[${colors.neutralDark}] font-['Poppins'] w-full sm:w-auto">Carte des chantiers</h1>
                <div className="flex flex-wrap items-center gap-4">
                    <DateRangePicker onDateChange={(start, end) => setDateRange({start, end})} colors={colors} />
                    <div className="flex items-center gap-2">
                        <Users size={20} className="text-gray-500"/>
                        <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} className="p-2 border border-gray-300 rounded-lg text-sm">
                            <option value="">Toutes les équipes</option>
                            {uniqueTeams.map(team => <option key={team} value={team}>{team}</option>)}
                        </select>
                    </div>
                    <button onClick={onAddSite} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors" style={{backgroundColor: colors.primary}}><Plus size={20}/>Nouveau chantier</button>
                </div>
            </div>
            <div className="flex-grow w-full rounded-xl shadow-sm overflow-hidden border z-10">
                <MapContainer center={defaultPosition} zoom={12} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    {filteredSites.map(site => (
                        <Marker key={site.id} position={[site.lat, site.lng]} icon={icons[site.status] || createCustomIcon(colors.neutralDark)}>
                            <Popup>
                                <div className="font-['Inter'] space-y-2">
                                    <h3 className="font-bold text-lg" style={{color: colors.primary}}>{site.name}</h3>
                                    <p className="text-sm text-gray-700"><strong>Client:</strong> {site.client}</p>
                                    <p className="text-sm text-gray-700"><strong>Équipe:</strong> {site.team}</p>
                                    <p className="text-sm"><strong>Statut:</strong>
                                        <span className="font-semibold" style={{color: site.status === 'À venir' ? colors.accent : site.status === 'En cours' ? colors.success : site.status === 'Problème' ? colors.danger : colors.primary}}>
                                            {' '}{site.status}
                                        </span>
                                    </p>
                                    <button onClick={() => onSiteClick(site)} className="w-full mt-2 flex items-center justify-center gap-2 p-2 rounded-lg text-white transition-colors" style={{backgroundColor: colors.primary}}>
                                        <Info size={16}/>Infos chantier
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapPage;
