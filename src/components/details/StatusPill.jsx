import React from 'react';

const StatusPill = ({ status }) => {
    if (!status) {
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">Non défini</span>;
    }
    // Pour une meilleure lisibilité, on pourrait calculer si le texte doit être blanc ou noir
    // en fonction de la luminosité de la couleur de fond. Pour l'instant, on part sur du blanc.
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full text-white`} style={{ backgroundColor: status.color || '#A9A9A9' }}>{status.name}</span>;
};

export default StatusPill;
