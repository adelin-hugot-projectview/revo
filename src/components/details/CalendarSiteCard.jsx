import React from 'react';
import StatusPill from './StatusPill.jsx';

// Fonction utilitaire pour éclaircir une couleur HEX
const lightenColor = (hex, percent) => {
    if (!hex) return '#FFFFFF'; // Couleur par défaut si hex est null
    let f = parseInt(hex.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = (f >> 8) & 0x00ff, B = f & 0x0000ff;
    return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
};

const CalendarSiteCard = ({ site, onSiteClick, colors }) => {
    const backgroundColor = lightenColor(site.status?.color, 0.8); // 80% plus clair

    return (
        <div 
            onClick={() => onSiteClick(site)}
            className="p-2 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow duration-200 ease-in-out h-full flex flex-col justify-between"
            style={{ backgroundColor: backgroundColor }}
        >
            <div>
                <p className="font-semibold text-sm text-gray-800 truncate">{site.name}</p>
                <p className="text-xs text-gray-500 truncate">{site.client}</p>
            </div>
            <div className="mt-1">
                <StatusPill status={site.status} />
            </div>
        </div>
    );
};

export default CalendarSiteCard;
