import React from 'react';
import Modal from 'react-modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onRequestClose, onConfirm, title, message, colors }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={{
                overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000 },
                content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', border: 'none', borderRadius: '1rem', padding: '2rem', width: '90%', maxWidth: '450px' }
            }}
            contentLabel={title}
            appElement={document.getElementById('root')}
        >
            <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-red-100 mb-4">
                    <AlertTriangle size={32} className="text-red-600" />
                </div>
                <h2 className="text-xl font-bold font-['Poppins'] mb-2">{title}</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-center gap-4 w-full">
                    <button onClick={onRequestClose} className="flex-1 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                        Annuler
                    </button>
                    <button onClick={onConfirm} className="flex-1 px-4 py-2 text-white rounded-md" style={{backgroundColor: colors.danger}}>
                        Confirmer la suppression
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
