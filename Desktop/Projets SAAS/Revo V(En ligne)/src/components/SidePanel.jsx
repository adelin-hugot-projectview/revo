import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';

const SidePanel = ({ header, isOpen, onClose, children, colors, widthClass = 'max-w-md' }) => {
    const panelRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        <div
            ref={panelRef}
            className={`fixed top-0 right-0 h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out z-50 flex flex-col ${widthClass} w-full ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="flex items-center justify-between p-4 border-b">
                {/* On affiche le header dynamique ici */}
                <div className="flex-1 min-w-0">{header}</div>
                <button onClick={onClose} className="ml-4 p-2 rounded-full text-gray-500 hover:bg-gray-100">
                    <X size={24} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                {children}
            </div>
        </div>
    );
};

export default SidePanel;
