import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';

const ChecklistTab = ({ site, checklistTemplates, onUpdateSite }) => {
    const [newTaskText, setNewTaskText] = useState('');

    const handleToggleTask = async (taskIndex) => {
        const updatedChecklist = site.checklist.map((task, index) => 
            index === taskIndex ? { ...task, done: !task.done } : task
        );
        await onUpdateSite({ checklist: updatedChecklist });
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (newTaskText.trim() === '') return;
        const newTask = { text: newTaskText, done: false };
        const updatedChecklist = [...(site.checklist || []), newTask];
        await onUpdateSite({ checklist: updatedChecklist });
        setNewTaskText('');
    };

    const handleDeleteTask = async (taskIndex) => {
        const updatedChecklist = site.checklist.filter((_, index) => index !== taskIndex);
        await onUpdateSite({ checklist: updatedChecklist });
    };

    const handleApplyTemplate = async (e) => {
        const templateId = e.target.value;
        if (!templateId) return;
        const selectedTemplate = checklistTemplates.find(t => t.id.toString() === templateId);
        if (selectedTemplate && selectedTemplate.tasks) {
            // CORRECTION: Transforme le tableau de chaînes en tableau d'objets
            const formattedTasks = selectedTemplate.tasks.map(taskText => ({ text: taskText, done: false }));
            await onUpdateSite({ checklist: formattedTasks });
        }
    };

    // Si la checklist n'existe pas ou est vide
    if (!site.checklist || site.checklist.length === 0) {
        return (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700">Cette checklist est vide.</h3>
                <p className="text-gray-500 mt-1 mb-6">Commencez par ajouter une tâche ou utilisez un modèle.</p>
                
                <div className="mb-4">
                    <select onChange={handleApplyTemplate} defaultValue="" className="w-full max-w-xs p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
                        <option value="" disabled>Choisir un modèle de checklist</option>
                        {checklistTemplates.map(template => (
                            <option key={template.id} value={template.id}>{template.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-sm">OU</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <form onSubmit={handleAddTask} className="flex items-center justify-center">
                    <input 
                        type="text" 
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder="Ajouter une première tâche"
                        className="w-full max-w-xs p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-green-600"
                    />
                    <button type="submit" className="p-2 bg-green-600 text-white rounded-r-md hover:bg-green-700">
                        <Plus size={22} />
                    </button>
                </form>
            </div>
        );
    }

    const completionPercentage = Math.round((site.checklist.filter(t => t.done).length / site.checklist.length) * 100);

    // Si la checklist existe
    return (
        <div>
            <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Progression</span>
                    <span className="text-sm font-medium text-gray-700">{completionPercentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${completionPercentage || 0}%` }}></div>
                </div>
            </div>
            <ul className="space-y-3">
                {site.checklist.map((task, index) => (
                    <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100">
                        <div onClick={() => handleToggleTask(index)} className="flex items-center cursor-pointer flex-grow mr-2">
                            <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-md border-2 ${task.done ? `bg-green-500 border-green-500` : `border-gray-300`}`}>
                                {task.done && <CheckSquare size={16} className="text-white" />}
                            </div>
                            <span className={`ml-3 text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.text}</span>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(index);
                            }}
                            className="p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-100 transition-all"
                            aria-label="Supprimer la tâche"
                        >
                            <Trash2 size={16} />
                        </button>
                    </li>
                ))}
            </ul>
            {/* Formulaire pour ajouter de nouvelles tâches */}
            <form onSubmit={handleAddTask} className="flex items-center mt-4 border-t pt-4">
                <input 
                    type="text" 
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Ajouter une nouvelle tâche"
                    className="w-full p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-green-600"
                />
                <button type="submit" className="p-2 bg-green-600 text-white rounded-r-md hover:bg-green-700">
                    <Plus size={22} />
                </button>
            </form>
        </div>
    );
};

export default ChecklistTab;
