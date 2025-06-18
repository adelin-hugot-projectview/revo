import React from 'react';
import { X } from 'lucide-react';

const SidePanel = ({ title, isOpen, onClose, children, colors, widthClass = 'max-w-md' }) => {
    return (
        <div
            className={`fixed top-0 right-0 h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} w-full ${widthClass} z-50 flex flex-col`}
        >
            {/* En-tête du panneau */}
            <div className="flex justify-between items-center p-6 border-b" style={{borderColor: colors.secondary}}>
                <h2 className="text-2xl font-bold font-['Poppins']" style={{color: colors.primary}}>{title}</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                    <X size={24} />
                </button>
            </div>

            {/* Contenu du panneau */}
            <div className="flex-grow p-6 overflow-y-auto">
                {children}
            </div>
        </div>
    );
};

export default SidePanel;
