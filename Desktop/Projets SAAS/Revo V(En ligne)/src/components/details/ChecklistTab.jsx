import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, Clock } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const ChecklistTab = ({ site, checklistTemplates, onUpdateSite }) => {
    const [checklists, setChecklists] = useState([]);
    const [checklistItems, setChecklistItems] = useState([]);
    const [newTaskText, setNewTaskText] = useState('');
    const [loading, setLoading] = useState(true);

    // Charger les checklists du site
    useEffect(() => {
        const fetchChecklists = async () => {
            if (!site?.id) return;
            
            try {
                // Récupérer les checklists du site
                const { data: checklistsData, error: checklistsError } = await supabase
                    .from('site_checklists')
                    .select('*')
                    .eq('site_id', site.id);

                if (checklistsError) throw checklistsError;

                // Récupérer les items de toutes les checklists
                const { data: itemsData, error: itemsError } = await supabase
                    .from('site_checklist_items')
                    .select('*, completed_by:profiles(full_name)')
                    .in('checklist_id', checklistsData.map(c => c.id))
                    .order('position');

                if (itemsError) throw itemsError;

                setChecklists(checklistsData || []);
                setChecklistItems(itemsData || []);
            } catch (error) {
                console.error('Erreur chargement checklist:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChecklists();
    }, [site?.id]);

    const handleToggleTask = async (itemId) => {
        const item = checklistItems.find(i => i.id === itemId);
        if (!item) return;

        const newCompleted = !item.is_completed;
        
        try {
            const { error } = await supabase
                .from('site_checklist_items')
                .update({
                    is_completed: newCompleted,
                    completed_at: newCompleted ? new Date().toISOString() : null,
                    completed_by: newCompleted ? (await supabase.auth.getUser()).data.user.id : null
                })
                .eq('id', itemId);

            if (error) throw error;

            setChecklistItems(prev => prev.map(item => 
                item.id === itemId 
                    ? { ...item, is_completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null }
                    : item
            ));
        } catch (error) {
            console.error('Erreur toggle task:', error);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (newTaskText.trim() === '') return;

        try {
            // Créer une checklist par défaut si elle n'existe pas
            let checklist = checklists[0];
            if (!checklist) {
                const { data: newChecklist, error: checklistError } = await supabase
                    .from('site_checklists')
                    .insert({
                        site_id: site.id,
                        name: 'Checklist principale',
                        created_by: (await supabase.auth.getUser()).data.user.id
                    })
                    .select()
                    .single();

                if (checklistError) throw checklistError;
                checklist = newChecklist;
                setChecklists([checklist]);
            }

            // Ajouter l'item
            const maxPosition = checklistItems.length > 0 ? Math.max(...checklistItems.map(i => i.position)) : 0;
            
            const { data: newItem, error: itemError } = await supabase
                .from('site_checklist_items')
                .insert({
                    checklist_id: checklist.id,
                    title: newTaskText,
                    position: maxPosition + 1,
                    is_completed: false
                })
                .select()
                .single();

            if (itemError) throw itemError;

            setChecklistItems(prev => [...prev, newItem]);
            setNewTaskText('');
        } catch (error) {
            console.error('Erreur ajout task:', error);
        }
    };

    const handleDeleteTask = async (itemId) => {
        try {
            const { error } = await supabase
                .from('site_checklist_items')
                .delete()
                .eq('id', itemId);

            if (error) throw error;

            setChecklistItems(prev => prev.filter(item => item.id !== itemId));
        } catch (error) {
            console.error('Erreur suppression task:', error);
        }
    };

    const handleApplyTemplate = async (e) => {
        const templateId = e.target.value;
        if (!templateId) return;

        try {
            // Récupérer les items du template
            const { data: templateItems, error: templateError } = await supabase
                .from('checklist_template_items')
                .select('*')
                .eq('template_id', templateId)
                .order('position');

            if (templateError) throw templateError;

            // Créer une nouvelle checklist basée sur le template
            const template = checklistTemplates.find(t => t.id === templateId);
            const { data: newChecklist, error: checklistError } = await supabase
                .from('site_checklists')
                .insert({
                    site_id: site.id,
                    template_id: templateId,
                    name: template?.name || 'Checklist template',
                    created_by: (await supabase.auth.getUser()).data.user.id
                })
                .select()
                .single();

            if (checklistError) throw checklistError;

            // Créer les items basés sur le template
            const itemsToInsert = templateItems.map(item => ({
                checklist_id: newChecklist.id,
                template_item_id: item.id,
                title: item.title,
                description: item.description,
                position: item.position,
                is_completed: false,
                requires_photo: item.is_required
            }));

            const { data: newItems, error: itemsError } = await supabase
                .from('site_checklist_items')
                .insert(itemsToInsert)
                .select();

            if (itemsError) throw itemsError;

            setChecklists(prev => [...prev, newChecklist]);
            setChecklistItems(prev => [...prev, ...newItems]);

            // Reset select
            e.target.value = '';
        } catch (error) {
            console.error('Erreur application template:', error);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-8"><div className="text-gray-500">Chargement...</div></div>;
    }

    // Si aucune checklist n'existe
    if (checklists.length === 0 || checklistItems.length === 0) {
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

    const completionPercentage = Math.round((checklistItems.filter(i => i.is_completed).length / checklistItems.length) * 100);

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

            <div className="mb-4">
                <select onChange={handleApplyTemplate} defaultValue="" className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
                    <option value="" disabled>Ajouter un modèle de checklist</option>
                    {checklistTemplates.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                </select>
            </div>

            <ul className="space-y-3 mb-4">
                {checklistItems.map((item) => (
                    <li key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100">
                        <div onClick={() => handleToggleTask(item.id)} className="flex items-center cursor-pointer flex-grow mr-2">
                            <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-md border-2 ${item.is_completed ? `bg-green-500 border-green-500` : `border-gray-300`}`}>
                                {item.is_completed && <CheckSquare size={16} className="text-white" />}
                            </div>
                            <div className="ml-3 flex-grow">
                                <span className={`text-sm ${item.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                    {item.title}
                                </span>
                                {item.description && (
                                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                )}
                                {item.completed_at && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <Clock size={12} className="text-gray-400" />
                                        <span className="text-xs text-gray-400">
                                            Terminé le {new Date(item.completed_at).toLocaleDateString('fr-FR')}
                                            {item.completed_by?.full_name && ` par ${item.completed_by.full_name}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(item.id);
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
            <form onSubmit={handleAddTask} className="flex items-center border-t pt-4">
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