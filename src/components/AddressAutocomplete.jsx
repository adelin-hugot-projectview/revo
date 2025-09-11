import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, X } from 'lucide-react';

// Fonction pour créer une icône de carte personnalisée
const createCustomIcon = (color) => {
    const iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="${color}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"><path d="M12 0C7.589 0 4 3.589 4 8c0 4.411 8 16 8 16s8-11.589 8-16c0-4.411-3.589-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>`;
    return new L.DivIcon({ 
        html: iconHtml, 
        className: '', 
        iconSize: [32, 32], 
        iconAnchor: [16, 32], 
        popupAnchor: [0, -32] 
    });
};

const AddressAutocomplete = ({ 
    value = '', 
    onChange, 
    onCoordinatesChange, 
    statusColor = '#2B5F4C',
    placeholder = "Rechercher une adresse...",
    className = "",
    showMap = true 
}) => {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedCoords, setSelectedCoords] = useState(null);
    const [mapKey, setMapKey] = useState(0);
    
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);
    const debounceRef = useRef(null);

    // Fonction pour formater une adresse de manière lisible
    const formatAddress = (suggestion) => {
        const { address } = suggestion;
        const parts = [];
        
        // Numéro + rue
        if (address.house_number && address.road) {
            parts.push(`${address.house_number}, ${address.road}`);
        } else if (address.road) {
            parts.push(address.road);
        }
        
        // Code postal
        if (address.postcode) {
            parts.push(address.postcode);
        }
        
        // Ville
        if (address.city) {
            parts.push(address.city);
        }
        
        return parts.filter(Boolean).join(', ');
    };

    // Fonction pour rechercher des adresses via Nominatim
    const searchAddresses = async (searchQuery) => {
        if (!searchQuery || searchQuery.length < 3) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                new URLSearchParams({
                    q: searchQuery,
                    format: 'json',
                    addressdetails: '1',
                    limit: '5',
                    countrycodes: 'fr', // Limiter à la France
                    'accept-language': 'fr'
                })
            );
            
            if (response.ok) {
                const data = await response.json();
                const formattedSuggestions = data.map(item => ({
                    id: item.place_id,
                    display_name: item.display_name,
                    lat: parseFloat(item.lat),
                    lon: parseFloat(item.lon),
                    address: {
                        house_number: item.address?.house_number || '',
                        road: item.address?.road || '',
                        city: item.address?.city || item.address?.town || item.address?.village || '',
                        postcode: item.address?.postcode || '',
                        country: item.address?.country || ''
                    }
                }));
                setSuggestions(formattedSuggestions);
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error('Erreur lors de la recherche d\'adresses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        
        debounceRef.current = setTimeout(() => {
            searchAddresses(query);
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    // Synchroniser avec la prop value
    useEffect(() => {
        if (value !== query) {
            setQuery(value);
        }
    }, [value]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setQuery(newValue);
        onChange?.(newValue);
        
        if (!newValue) {
            setSuggestions([]);
            setSelectedCoords(null);
            onCoordinatesChange?.(null);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        const formattedAddress = formatAddress(suggestion);
        setQuery(formattedAddress);
        onChange?.(formattedAddress);
        
        const coords = {
            latitude: suggestion.lat,
            longitude: suggestion.lon
        };
        setSelectedCoords(coords);
        onCoordinatesChange?.(coords);
        
        setShowSuggestions(false);
        setSuggestions([]);
        
        // Forcer le re-render de la carte
        setMapKey(prev => prev + 1);
    };

    const clearInput = () => {
        setQuery('');
        onChange?.('');
        setSuggestions([]);
        setSelectedCoords(null);
        onCoordinatesChange?.(null);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    // Fermer les suggestions quand on clique à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="space-y-4">
            {/* Champ de recherche avec autocomplétion */}
            <div className="relative">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    />
                    
                    {/* Icône de recherche */}
                    <Search 
                        size={20} 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    />
                    
                    {/* Icône de chargement ou bouton clear */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {isLoading ? (
                            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        ) : query ? (
                            <button
                                type="button"
                                onClick={clearInput}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        ) : null}
                    </div>
                </div>

                {/* Liste de suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                    <div 
                        ref={suggestionsRef}
                        className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
                        style={{ zIndex: 9999 }}
                    >
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion.id}
                                type="button"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                                <div className="flex items-start gap-3">
                                    <MapPin size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 truncate">
                                            {formatAddress(suggestion)}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate mt-1">
                                            {suggestion.display_name}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Aperçu de la carte */}
            {showMap && selectedCoords && (
                <div className="h-48 w-full rounded-lg overflow-hidden border border-gray-200 relative z-10">
                    <MapContainer
                        key={mapKey}
                        center={[selectedCoords.latitude, selectedCoords.longitude]}
                        zoom={15}
                        style={{ height: '100%', width: '100%', zIndex: 10 }}
                        scrollWheelZoom={false}
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; OpenStreetMap &copy; CARTO'
                        />
                        <Marker
                            position={[selectedCoords.latitude, selectedCoords.longitude]}
                            icon={createCustomIcon(statusColor)}
                        />
                    </MapContainer>
                </div>
            )}
        </div>
    );
};

export default AddressAutocomplete;