import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Edit, Trash2, ClipboardList, X, Sparkles, Loader, GripVertical } from 'lucide-react';
import Modal from 'react-modal';
import ConfirmationModal from '../components/ConfirmationModal.jsx';

// --- MODAL DE CRÉATION/ÉDITION DE CHECKLIST (MODERNISÉE) ---
const ChecklistModal = ({ isOpen, onRequestClose, colors, editingTemplate, fetchTemplates }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('general');
    const [items, setItems] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [newItemTitle, setNewItemTitle] = useState('');
    const [newItemDescription, setNewItemDescription] = useState('');
    
    useEffect(() => {
        if (editingTemplate) {
            setName(editingTemplate.name || '');
            setDescription(editingTemplate.description || '');
            setCategory(editingTemplate.category || 'general');
            // Charger les items du template
            fetchTemplateItems(editingTemplate.id);
        } else {
            setName('');
            setDescription('');
            setCategory('general');
            setItems([]);
            setPrompt('');
        }
    }, [editingTemplate, isOpen]);

    const fetchTemplateItems = async (templateId) => {
        try {
            const { data, error } = await supabase
                .from('checklist_template_items')
                .select('*')
                .eq('template_id', templateId)
                .order('position');
            
            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Erreur chargement items:', error);
        }
    };

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
                    const newItems = jsonResponse.tasks.map((task, index) => ({
                        title: task,
                        description: '',
                        position: items.length + index + 1,
                        is_required: false,
                        id: `temp_${Date.now()}_${index}` // ID temporaire
                    }));
                    setItems(prev => [...prev, ...newItems]);
                }
            }
        } catch (error) {
            console.error("Erreur API Gemini:", error);
            alert('Impossible de générer la checklist.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddItem = () => {
        if (newItemTitle.trim() !== '') {
            const newItem = {
                title: newItemTitle.trim(),
                description: newItemDescription.trim(),
                position: items.length + 1,
                is_required: false,
                id: `temp_${Date.now()}` // ID temporaire
            };
            setItems([...items, newItem]);
            setNewItemTitle('');
            setNewItemDescription('');
        }
    };

    const handleRemoveItem = (indexToRemove) => {
        setItems(items.filter((_, index) => index !== indexToRemove));
    };

    const handleToggleRequired = (index) => {
        setItems(prev => prev.map((item, i) => 
            i === index ? { ...item, is_required: !item.is_required } : item
        ));
    };

    const handleSubmit = async () => {
        try {
            let templateId = editingTemplate?.id;

            // Créer ou mettre à jour le template
            if (editingTemplate) {
                const { error: templateError } = await supabase
                    .from('checklist_templates')
                    .update({ name, description, category })
                    .eq('id', templateId);
                
                if (templateError) throw templateError;

                // Supprimer les anciens items
                await supabase
                    .from('checklist_template_items')
                    .delete()
                    .eq('template_id', templateId);
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('company_id')
                    .eq('id', user.id)
                    .single();

                const { data: newTemplate, error: templateError } = await supabase
                    .from('checklist_templates')
                    .insert({
                        name,
                        description,
                        category,
                        company_id: profile.company_id,
                        created_by: user.id
                    })
                    .select()
                    .single();
                
                if (templateError) throw templateError;
                templateId = newTemplate.id;
            }

            // Insérer les nouveaux items
            if (items.length > 0) {
                const itemsToInsert = items.map((item, index) => ({
                    template_id: templateId,
                    title: item.title,
                    description: item.description,
                    position: index + 1,
                    is_required: item.is_required
                }));

                const { error: itemsError } = await supabase
                    .from('checklist_template_items')
                    .insert(itemsToInsert);
                
                if (itemsError) throw itemsError;
            }

            await fetchTemplates();
            onRequestClose();
        } catch (error) {
            console.error('Erreur sauvegarde template:', error);
            alert('Erreur lors de la sauvegarde du template');
        }
    };
};

// --- COMPOSANT PRINCIPAL DE LA PAGE ---
const TemplatesPage = ({ colors }) => {
    const [checklistTemplates, setChecklistTemplates] = useState([]);
    const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateToDelete, setTemplateToDelete] = useState(null);

    const fetchTemplates = async () => {
        try {
            const { data: templates, error: templatesError } = await supabase
                .from('checklist_templates')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (templatesError) throw templatesError;

            // Récupérer les items de chaque template
            const templatesWithItems = await Promise.all(
                templates.map(async (template) => {
                    const { data: items, error: itemsError } = await supabase
                        .from('checklist_template_items')
                        .select('*')
                        .eq('template_id', template.id)
                        .order('position');
                    
                    return {
                        ...template,
                        items: itemsError ? [] : items
                    };
                })
            );

            setChecklistTemplates(templatesWithItems);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const onDeleteTemplate = async (id) => {
        try {
            const { error } = await supabase
                .from('checklist_templates')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            await fetchTemplates();
        } catch (error) {
            console.error('Error deleting template:', error);
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
                                    <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                                )}
                                <div className="mt-2">
                                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                        {template.category}
                                    </span>
                                </div>
                                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                                    {template.items?.slice(0, 3).map((item, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                            <span className="truncate">{item.title}</span>
                                            {item.is_required && <span className="text-red-500 text-xs">*</span>}
                                        </li>
                                    ))}
                                    {(template.items?.length || 0) > 3 && (
                                        <li className="text-gray-400 text-xs">...et {(template.items?.length || 0) - 3} autres</li>
                                    )}
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

            {/* Modal de création/édition */}
            <ChecklistModal 
                isOpen={isChecklistModalOpen} 
                onRequestClose={() => setIsChecklistModalOpen(false)} 
                colors={colors} 
                editingTemplate={editingTemplate}
                fetchTemplates={fetchTemplates} 
            />

            <Modal isOpen={false} onRequestClose={onRequestClose} style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000 }, content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', border: 'none', background: 'transparent', padding: 0, width: '90%', maxWidth: '700px', display: 'flex' } }} appElement={document.getElementById('root')}>
                <div className="flex flex-col bg-white rounded-xl w-full max-h-[90vh]">
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-2xl font-bold font-['Poppins'] text-gray-800">{editingTemplate ? 'Modifier le modèle' : 'Nouveau modèle'}</h2>
                        <button type="button" onClick={onRequestClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100"><X size={24}/></button>
                    </div>
                    <div className="p-6 space-y-6 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom du modèle</label>
                                <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1" style={{'--tw-ring-color': '#22C55E'}}/>
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                                <select name="category" id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1" style={{'--tw-ring-color': '#22C55E'}}>
                                    <option value="general">Général</option>
                                    <option value="demarrage">Démarrage</option>
                                    <option value="finition">Finition</option>
                                    <option value="controle">Contrôle</option>
                                    <option value="securite">Sécurité</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea name="description" id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1" style={{'--tw-ring-color': '#22C55E'}} placeholder="Description optionnelle du modèle..."/>
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
                                {items.length > 0 ? (
                                    <ul className="space-y-2">
                                        {items.map((item, index) => (
                                            <li key={item.id || index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-md group">
                                                <GripVertical size={16} className="text-gray-400 cursor-move" />
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-800">{item.title}</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleToggleRequired(index)}
                                                            className={`px-2 py-1 text-xs rounded ${item.is_required ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}
                                                        >
                                                            {item.is_required ? 'Requis' : 'Optionnel'}
                                                        </button>
                                                    </div>
                                                    {item.description && (
                                                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                                    )}
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveItem(index)} 
                                                    className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-sm text-center text-gray-400 flex items-center justify-center h-full">
                                        {isLoading ? 'Génération en cours...' : 'Aucune tâche.'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700">Ajouter une tâche manuellement</label>
                            <div className="space-y-2">
                                <input 
                                    type="text" 
                                    value={newItemTitle} 
                                    onChange={(e) => setNewItemTitle(e.target.value)} 
                                    placeholder="Titre de la tâche..." 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                />
                                <textarea 
                                    value={newItemDescription} 
                                    onChange={(e) => setNewItemDescription(e.target.value)} 
                                    placeholder="Description (optionnelle)..." 
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                />
                                <button type="button" onClick={handleAddItem} className="w-full px-4 py-2 text-white rounded-lg flex items-center justify-center gap-2" style={{backgroundColor: '#22C55E'}}>
                                    <Plus size={16}/>
                                    Ajouter la tâche
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 p-6 border-t mt-auto">
                        <button type="button" onClick={onRequestClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Annuler</button>
                        <button type="button" onClick={handleSubmit} className="px-4 py-2 text-white font-semibold rounded-lg" style={{backgroundColor: '#22C55E'}}>Enregistrer</button>
                    </div>
                </div>
            </Modal>

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