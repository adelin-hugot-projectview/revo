import React from 'react';

const StatusBadge = ({ currentStatus, onStatusChange, availableStatuses = [], colors }) => {

    // On extrait l'ID du statut actuel. S'il n'y a pas de statut, la valeur sera une chaîne vide.
    const currentStatusId = currentStatus?.id || '';

    const handleSelectChange = (e) => {
        console.log('🏷️ StatusBadge - Changement de statut:', {
            from: currentStatusId,
            to: e.target.value,
            statusName: availableStatuses.find(s => s.id === e.target.value)?.name
        });
        onStatusChange(e.target.value); // On passe l'ID du nouveau statut
    };
    
    // Pour le style, on se base sur la couleur définie dans la BDD pour le statut actuel.
    // Si aucune couleur n'est trouvée, on utilise une couleur par défaut.
    const badgeStyle = {
        backgroundColor: currentStatus?.color || '#A9A9A9', // Gris par défaut
        color: '#ffffff', // Texte blanc pour une meilleure lisibilité
    };

    return (
        <div className="relative">
            <select
                value={currentStatusId}
                onChange={handleSelectChange}
                className={`appearance-none text-xs font-bold rounded-full py-1 pl-3 pr-8 cursor-pointer border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2`}
                // On applique le style dynamiquement
                style={{ ...badgeStyle, WebkitAppearance: 'none', MozAppearance: 'none', ringColor: colors.primary }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* On affiche tous les statuts disponibles venant de la BDD */}
                {availableStatuses.map(status => (
                    <option key={status.id} value={status.id} style={{backgroundColor: '#ffffff', color: '#000000'}}>
                        {status.name}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2" style={{color: badgeStyle.color}}>
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
            </div>
        </div>
    );
};

export default StatusBadge;
