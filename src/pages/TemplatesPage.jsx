import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Edit, Trash2, ClipboardList, X, Sparkles, Loader } from 'lucide-react';
import Modal from 'react-modal';
import ConfirmationModal from '../components/ConfirmationModal.jsx';

// --- MODAL DE CRÉATION/ÉDITION DE CHECKLIST (MODERNISÉE) ---
const ChecklistModal = ({ isOpen, onRequestClose, onSave, colors, editingTemplate }) => {
    const [name, setName] = useState('');
    const [tasks, setTasks] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [newTask, setNewTask] = useState('');
    
    useEffect(() => {
        if (editingTemplate) {
            setName(editingTemplate.name || '');
            setTasks(editingTemplate.tasks || []);
        } else {
            setName('');
            setTasks([]);
            setPrompt('');
        }
    }, [editingTemplate, isOpen]);

    const handleGenerateAI = async () => {
        if (!prompt) return;
        setIsLoading(true);

        const schema = {
            type: "OBJECT",
            properties: { "tasks": { type: "ARRAY", items: { "type": "STRING" } } },
            required: ["tasks"]
        };
        const systemPrompt = "Tu es un assistant qui crée des listes de tâches pour des professionnels du bâtiment. Réponds uniquement avec l'objet JSON demandé, sans texte supplémentaire.";
        const userPrompt = `Crée une checklist de tâches pour : "${prompt}".`;
        const chatHistory = [{ role: "user", parts: [{ text: systemPrompt }, { text: userPrompt }] }];
        const payload = {
            contents: chatHistory,
            generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.7 }
        };
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
            const result = await response.json();
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                const jsonResponse = JSON.parse(result.candidates[0].content.parts[0].text);
                if (jsonResponse.tasks && Array.isArray(jsonResponse.tasks)) {
                    setTasks(jsonResponse.tasks);
                } else {
                    setTasks(['Erreur: Format de réponse inattendu.']);
                }
            } else {
                setTasks(['Erreur lors de la génération.']);
            }
        } catch (error) {
            console.error("Erreur API Gemini:", error);
            setTasks(['Impossible de générer la checklist.']);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTask = () => {
        if (newTask.trim() !== '') {
            setTasks([...tasks, newTask.trim()]);
            setNewTask('');
        }
    };

    const handleRemoveTask = (indexToRemove) => {
        setTasks(tasks.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = () => {
        onSave({ ...editingTemplate, name, tasks });
        onRequestClose();
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000 }, content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', border: 'none', background: 'transparent', padding: 0, width: '90%', maxWidth: '600px', display: 'flex' } }} appElement={document.getElementById('root')}>
             <div className="flex flex-col bg-white rounded-xl w-full max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold font-['Poppins'] text-gray-800">{editingTemplate ? 'Modifier le modèle' : 'Nouveau modèle'}</h2>
                    <button type="button" onClick={onRequestClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100"><X size={24}/></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom du modèle</label>
                        <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1" style={{'--tw-ring-color': '#22C55E'}}/>
                    </div>
                    {!editingTemplate && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <label htmlFor="prompt" className="block text-sm font-semibold text-gray-700 mb-2">Générer des tâches avec l'IA</label>
                            <div className="flex gap-2">
                                <input type="text" name="prompt" id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ex: préparer une intervention de peinture" className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                                <button type="button" onClick={handleGenerateAI} disabled={isLoading} className="flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors" style={{backgroundColor: '#22C55E', minWidth: '110px'}}>
                                    {isLoading ? <Loader className="animate-spin" size={20}/> : <><Sparkles size={20}/><span>Générer</span></>}
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700">Tâches</h4>
                        <div className="p-4 border rounded-md min-h-[150px] max-h-60 overflow-y-auto bg-white">
                            {tasks.length > 0 ? (
                                <ul className="space-y-2">{tasks.map((task, index) => (<li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md group"><span className="text-sm text-gray-800">{task}</span><button type="button" onClick={() => handleRemoveTask(index)} className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button></li>))}</ul>
                            ) : <div className="text-sm text-center text-gray-400 flex items-center justify-center h-full">{isLoading ? 'Génération en cours...' : 'Aucune tâche.'}</div>}
                        </div>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700 mb-1">Ajouter une tâche manuellement</label>
                        <div className="flex gap-2">
                            <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Nouvelle tâche..." className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                            <button type="button" onClick={handleAddTask} className="px-4 py-2 text-white rounded-lg" style={{backgroundColor: '#22C55E'}}><Plus size={20}/></button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 p-6 border-t mt-auto">
                    <button type="button" onClick={onRequestClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Annuler</button>
                    <button type="button" onClick={handleSubmit} className="px-4 py-2 text-white font-semibold rounded-lg" style={{backgroundColor: '#22C55E'}}>Enregistrer</button>
                </div>
            </div>
        </Modal>
    );
};

// --- COMPOSANT PRINCIPAL DE LA PAGE ---
const TemplatesPage = ({ colors }) => {
    const [checklistTemplates, setChecklistTemplates] = useState([]);
    const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateToDelete, setTemplateToDelete] = useState(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        const { data, error } = await supabase
            .from('checklist_templates')
            .select('id, name, tasks');
        if (error) {
            console.error('Error fetching templates:', error);
        } else {
            setChecklistTemplates(data);
        }
    };

    const onSaveTemplate = async (template) => {
        if (template.id) {
            // Update existing template
            const { data, error } = await supabase
                .from('checklist_templates')
                .update({ name: template.name, tasks: template.tasks })
                .eq('id', template.id)
                .select();
            if (error) {
                console.error('Error updating template:', error);
            } else if (data) {
                setChecklistTemplates(prev => prev.map(t => t.id === data[0].id ? data[0] : t));
            }
        } else {
            // Create new template
            const { data, error } = await supabase
                .from('checklist_templates')
                .insert([{ name: template.name, tasks: template.tasks }])
                .select();
            if (error) {
                console.error('Error creating template:', error);
            } else if (data) {
                setChecklistTemplates(prev => [...prev, data[0]]);
            }
        }
        setIsChecklistModalOpen(false);
    };

    const onDeleteTemplate = async (id) => {
        const { error } = await supabase
            .from('checklist_templates')
            .delete()
            .eq('id', id);
        if (error) {
            console.error('Error deleting template:', error);
        } else {
            setChecklistTemplates(prev => prev.filter(t => t.id !== id));
        }
    };
    const handleOpenCreateModal = () => {
        setEditingTemplate(null);
        setIsChecklistModalOpen(true);
    };

    const handleOpenEditModal = (template) => {
        setEditingTemplate(template);
        setIsChecklistModalOpen(true);
    };

    const handleOpenDeleteModal = (template) => {
        setTemplateToDelete(template);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (templateToDelete) {
            onDeleteTemplate(templateToDelete.id);
        }
        setIsConfirmModalOpen(false);
        setTemplateToDelete(null);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 font-['Poppins']">Templates</h1>
            </div>
            <div className="flex-grow overflow-y-auto">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <button onClick={handleOpenCreateModal} className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-6 text-gray-500 hover:bg-gray-50 hover:text-green-600 transition-colors">
                        <Plus size={32}/><span className="mt-2 font-semibold">Créer une checklist</span>
                    </button>
                    {checklistTemplates.map(template => (
                        <div key={template.id} className="bg-white rounded-xl shadow-sm border p-6 flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex-grow">
                                <h3 className="font-bold text-lg text-gray-800 font-['Poppins']">{template.name}</h3>
                                <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
                                    {template.tasks.slice(0, 3).map((task, index) => <li key={index} className="truncate">{task}</li>)}
                                    {template.tasks.length > 3 && <li className="text-gray-400">...et {template.tasks.length - 3} autres</li>}
                                </ul>
                            </div>
                            <div className="mt-6 pt-4 border-t flex justify-end gap-2">
                                <button onClick={() => handleOpenEditModal(template)} className="p-2 text-gray-500 hover:text-blue-600"><Edit size={18}/></button>
                                <button onClick={() => handleOpenDeleteModal(template)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 size={18}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <ChecklistModal 
                isOpen={isChecklistModalOpen} 
                onRequestClose={() => setIsChecklistModalOpen(false)} 
                onSave={onSaveTemplate} 
                colors={colors} 
                editingTemplate={editingTemplate} 
            />
            <ConfirmationModal 
                isOpen={isConfirmModalOpen}
                onRequestClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirmer la suppression"
                message={`Êtes-vous sûr de vouloir supprimer le modèle "${templateToDelete?.name}" ? Cette action est irréversible.`}
                colors={colors}
            />
        </div>
    );
};

export default TemplatesPage;
