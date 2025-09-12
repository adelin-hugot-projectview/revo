import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Edit, Trash2, ClipboardList, X, Sparkles, Loader } from 'lucide-react';
import Modal from 'react-modal';
import ConfirmationModal from '../components/ConfirmationModal.jsx';

// --- MODAL DE CRÉATION/ÉDITION DE CHECKLIST (MODERNISÉE) ---
const ChecklistModal = ({ isOpen, onRequestClose, onSave, colors, editingTemplate }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tasks, setTasks] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [newTask, setNewTask] = useState('');
    
    useEffect(() => {
        if (editingTemplate) {
            setName(editingTemplate.name || '');
            setDescription(editingTemplate.description || '');
            setTasks(editingTemplate.tasks || []);
        } else {
            setName('');
            setDescription('');
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
        onSave({ ...editingTemplate, name, description, tasks });
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
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (optionnelle)</label>
                        <textarea name="description" id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1" style={{'--tw-ring-color': '#22C55E'}}/>
                    </div>
                    {!editingTemplate && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <Sparkles className="text-purple-500" size={20}/>
                                <h3 className="text-sm font-semibold text-gray-700">Génération IA</h3>
                            </div>
                            <div className="space-y-3">
                                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Décris le type de checklist que tu souhaites (ex: 'inspection de sécurité pour chantier')" className="w-full p-3 border border-gray-300 rounded-md text-sm resize-none" rows="2"/>
                                <button type="button" onClick={handleGenerateAI} disabled={!prompt.trim() || isLoading} className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    {isLoading ? <Loader className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                                    {isLoading ? 'Génération...' : 'Générer avec l\'IA'}
                                </button>
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Tâches ({tasks.length})</label>
                        <div className="space-y-3">
                            {tasks.map((task, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <span className="flex-grow text-sm text-gray-700">{task}</span>
                                    <button type="button" onClick={() => handleRemoveTask(index)} className="text-red-500 hover:text-red-700 p-1"><X size={16}/></button>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddTask()} placeholder="Ajouter une tâche..." className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1" style={{'--tw-ring-color': '#22C55E'}}/>
                                <button type="button" onClick={handleAddTask} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"><Plus size={16}/></button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t flex justify-end gap-3">
                    <button type="button" onClick={onRequestClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">Annuler</button>
                    <button type="button" onClick={handleSubmit} disabled={!name.trim() || tasks.length === 0} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{editingTemplate ? 'Modifier' : 'Créer'}</button>
                </div>
            </div>
        </Modal>
    );
};

// --- COMPOSANT PRINCIPAL ---
const TemplatesPage = ({ colors }) => {
    const [checklistTemplates, setChecklistTemplates] = useState([]);
    const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                // Appeler directement avec le user récupéré
                await loadChecklistTemplatesForUser(user);
            }
        };
        getUser();
    }, []);

    const loadChecklistTemplatesForUser = async (currentUser) => {
        if (!currentUser) return;

        // D'abord récupérer le company_id de l'utilisateur
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', currentUser.id)
            .single();

        if (profileError || !profile) {
            console.error('Error fetching user profile:', profileError);
            return;
        }

        // Récupérer les templates avec leurs items pour cette entreprise
        const { data: templatesData, error: templatesError } = await supabase
            .from('checklist_templates')
            .select('*')
            .eq('company_id', profile.company_id)
            .order('created_at', { ascending: false });

        if (templatesError) {
            console.error('Error fetching templates:', templatesError);
            return;
        }

        // Pour chaque template, récupérer ses items
        const templatesWithTasks = await Promise.all(
            templatesData.map(async (template) => {
                const { data: items, error: itemsError } = await supabase
                    .from('checklist_template_items')
                    .select('*')
                    .eq('template_id', template.id)
                    .order('position', { ascending: true });

                if (itemsError) {
                    console.error('Error fetching template items:', itemsError);
                    return { ...template, tasks: [] };
                }

                return { ...template, tasks: items.map(item => item.title) };
            })
        );

        setChecklistTemplates(templatesWithTasks);
    };

    const fetchChecklistTemplates = async () => {
        if (!user) return;
        await loadChecklistTemplatesForUser(user);
    };

    const onSaveTemplate = async (template) => {
        if (!user) return;

        try {
            if (template.id) {
                // Update existing template
                const { data: updatedTemplate, error: templateError } = await supabase
                    .from('checklist_templates')
                    .update({ 
                        name: template.name, 
                        description: template.description 
                    })
                    .eq('id', template.id)
                    .select()
                    .single();

                if (templateError) {
                    console.error('Error updating template:', templateError);
                    alert('Erreur lors de la mise à jour du template');
                    return;
                }

                // Supprimer les anciens items
                await supabase
                    .from('checklist_template_items')
                    .delete()
                    .eq('template_id', template.id);

                // Créer les nouveaux items un par un pour éviter les problèmes RLS
                if (template.tasks.length > 0) {
                    for (let index = 0; index < template.tasks.length; index++) {
                        const task = template.tasks[index];
                        const { error: itemError } = await supabase
                            .from('checklist_template_items')
                            .insert({
                                template_id: template.id,
                                title: task,
                                position: index + 1
                            });

                        if (itemError) {
                            console.error(`Error updating template item ${index}:`, itemError);
                            console.error('Template ID:', template.id);
                            console.error('User ID:', user.id);
                            alert(`Erreur lors de la mise à jour de la tâche "${task}": ${itemError.message}`);
                            return;
                        }
                    }
                }

            } else {
                // Récupérer le company_id depuis le profil
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('company_id')
                    .eq('id', user.id)
                    .single();

                if (profileError || !profile) {
                    console.error('Error fetching user profile for template creation:', profileError);
                    alert('Erreur lors de la récupération du profil utilisateur');
                    return;
                }

                // Create new template
                const { data: newTemplate, error: templateError } = await supabase
                    .from('checklist_templates')
                    .insert([{ 
                        name: template.name, 
                        description: template.description,
                        company_id: profile.company_id,
                        created_by: user.id
                    }])
                    .select()
                    .single();

                if (templateError) {
                    console.error('Error creating template:', templateError);
                    alert('Erreur lors de la création du template');
                    return;
                }

                // Créer les items du template un par un pour éviter les problèmes RLS
                if (template.tasks.length > 0) {
                    for (let index = 0; index < template.tasks.length; index++) {
                        const task = template.tasks[index];
                        const { error: itemError } = await supabase
                            .from('checklist_template_items')
                            .insert({
                                template_id: newTemplate.id,
                                title: task,
                                position: index + 1
                            });

                        if (itemError) {
                            console.error(`Error creating template item ${index}:`, itemError);
                            console.error('Template ID:', newTemplate.id);
                            console.error('User ID:', user.id);
                            alert(`Erreur lors de la création de la tâche "${task}": ${itemError.message}`);
                            return;
                        }
                    }
                }
            }

            // Recharger les templates
            await fetchChecklistTemplates();
            setIsChecklistModalOpen(false);

        } catch (error) {
            console.error('Error saving template:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    const onDeleteTemplate = async (id) => {
        try {
            // Supprimer d'abord les items du template
            await supabase
                .from('checklist_template_items')
                .delete()
                .eq('template_id', id);

            // Puis supprimer le template
            const { error } = await supabase
                .from('checklist_templates')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting template:', error);
                alert('Erreur lors de la suppression');
            } else {
                setChecklistTemplates(prev => prev.filter(t => t.id !== id));
            }
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Erreur lors de la suppression');
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
                                {template.description && (
                                    <p className="text-sm text-gray-600 mt-2">{template.description}</p>
                                )}
                                <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
                                    {template.tasks.slice(0, 3).map((task, index) => <li key={index} className="truncate">{task}</li>)}
                                    {template.tasks.length > 3 && <li className="text-gray-400">...et {template.tasks.length - 3} autres</li>}
                                </ul>
                                <p className="text-xs text-gray-500 mt-2">{template.tasks.length} tâche(s)</p>
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
                title="Supprimer le modèle"
                message={`Êtes-vous sûr de vouloir supprimer le modèle "${templateToDelete?.name}" ? Cette action est irréversible.`}
                confirmText="Supprimer"
                cancelText="Annuler"
                colors={colors}
            />
        </div>
    );
};

export default TemplatesPage;