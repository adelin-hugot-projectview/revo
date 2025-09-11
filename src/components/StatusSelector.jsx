import React from 'react';
import { ChevronDown } from 'lucide-react';

const StatusSelector = ({ currentStatus, onStatusChange, availableStatuses = [], colors, showLabel = true }) => {
    const currentStatusId = currentStatus?.id || '';

    console.log('🔍 StatusSelector - Debug:', {
        currentStatus,
        availableStatusesCount: availableStatuses.length,
        availableStatuses: availableStatuses.map(s => ({ id: s.id, name: s.name }))
    });

    const handleSelectChange = (e) => {
        console.log('📋 StatusSelector - Changement de statut:', {
            from: currentStatusId,
            to: e.target.value,
            statusName: availableStatuses.find(s => s.id === e.target.value)?.name
        });
        onStatusChange(e.target.value);
    };

    const badgeStyle = {
        backgroundColor: currentStatus?.color || '#A9A9A9',
        color: '#ffffff',
    };

    return (
        <div className="flex items-center gap-2">
            {showLabel && <span className="text-sm font-medium text-gray-700">Statut:</span>}
            <div className="relative">
                <select
                    value={currentStatusId}
                    onChange={handleSelectChange}
                    className="appearance-none text-sm font-medium rounded-lg py-2 pl-3 pr-8 cursor-pointer border focus:outline-none focus:ring-2 focus:ring-offset-2 hover:shadow-md transition-shadow"
                    style={{ 
                        ...badgeStyle, 
                        border: `2px solid ${currentStatus?.color || '#A9A9A9'}`,
                        focusRingColor: colors.primary 
                    }}
                    title="Cliquez pour changer le statut"
                >
                    {availableStatuses.map(status => (
                        <option 
                            key={status.id} 
                            value={status.id} 
                            style={{
                                backgroundColor: '#ffffff', 
                                color: '#000000'
                            }}
                        >
                            {status.name}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <ChevronDown size={16} style={{color: badgeStyle.color}} />
                </div>
            </div>
        </div>
    );
};

export default StatusSelector;