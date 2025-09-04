import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import { X, GripVertical, Trash2, Plus } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemType = 'STATUS';

const DraggableStatusItem = ({ status, index, moveStatus, children }) => {
    const ref = useRef(null);

    const [, drop] = useDrop({
        accept: ItemType,
        hover(item, monitor) {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;

            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

            moveStatus(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemType,
        item: () => ({ id: status.id, index }),
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    preview(drop(ref));

    return (
        <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }} className="flex items-center gap-4 p-2 bg-gray-50 rounded-lg">
            <div ref={drag} className="cursor-grab">
                <GripVertical className="text-gray-400" />
            </div>
            {children}
        </div>
    );
};

const StatusManagementModal = ({ isOpen, onRequestClose, statusColumns, onSave, onDelete, colors }) => {
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        setStatuses(statusColumns.sort((a, b) => a.position - b.position));
    }, [statusColumns]);

    const moveStatus = (dragIndex, hoverIndex) => {
        const draggedStatus = statuses[dragIndex];
        const newStatuses = [...statuses];
        newStatuses.splice(dragIndex, 1);
        newStatuses.splice(hoverIndex, 0, draggedStatus);
        setStatuses(newStatuses);
    };

    const handleNameChange = (id, newName) => {
        setStatuses(statuses.map(s => s.id === id ? { ...s, name: newName } : s));
    };

    const handleColorChange = (id, newColor) => {
        setStatuses(statuses.map(s => s.id === id ? { ...s, color: newColor } : s));
    };

    const handleAddNewStatus = () => {
        const newStatus = {
            id: crypto.randomUUID(),
            name: 'Nouveau statut',
            color: '#cccccc',
            position: statuses.length
        };
        setStatuses([...statuses, newStatus]);
    };

    const handleSave = () => {
        onSave(statuses);
        onRequestClose();
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000 }, content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', border: 'none', background: 'transparent', padding: 0, width: '90%', maxWidth: '500px' } }} appElement={document.getElementById('root')}>
            <DndProvider backend={HTML5Backend}>
                <div className="bg-white rounded-xl shadow-lg flex flex-col max-h-[80vh]">
                    <div className="flex justify-between items-center p-5 border-b">
                        <h2 className="text-xl font-bold font-['Poppins'] text-gray-800">Gérer les statuts</h2>
                        <button onClick={onRequestClose} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
                    </div>

                    <div className="p-5 overflow-y-auto space-y-4">
                        {statuses.map((status, index) => (
                            <DraggableStatusItem key={status.id} index={index} status={status} moveStatus={moveStatus}>
                                <div className="relative w-8 h-8">
                                    <div className="w-full h-full rounded-full border-2 border-gray-200" style={{ backgroundColor: status.color }}></div>
                                    <input type="color" value={status.color} onChange={(e) => handleColorChange(status.id, e.target.value)} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                </div>
                                <input type="text" value={status.name} onChange={(e) => handleNameChange(status.id, e.target.value)} className="flex-grow p-2 border border-gray-300 rounded-md" />
                                <button onClick={() => onDelete(status.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={18} /></button>
                            </DraggableStatusItem>
                        ))}
                        <button onClick={handleAddNewStatus} className="w-full flex items-center justify-center gap-2 p-3 text-sm font-semibold text-green-600 hover:bg-green-50 rounded-lg border-2 border-dashed border-gray-300">
                            <Plus size={18} /> Ajouter un statut
                        </button>
                    </div>

                    <div className="flex justify-end gap-4 p-5 border-t bg-gray-50">
                        <button onClick={onRequestClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Annuler</button>
                        <button onClick={handleSave} className="px-4 py-2 text-white font-semibold rounded-lg bg-primary">Enregistrer</button>
                    </div>
                </div>
            </DndProvider>
        </Modal>
    );
};

export default StatusManagementModal;
