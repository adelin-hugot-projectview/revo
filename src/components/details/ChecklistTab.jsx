import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const ChecklistTab = ({ site, checklistTemplates, onUpdateSite }) => {
    const [newTaskText, setNewTaskText] = useState('');
    const [checklists, setChecklists] = useState([]);
    const [checklistItems, setChecklistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            
            if (site?.id) {
                await loadChecklists();
            }
            setLoading(false);
        };
        loadData();
    }, [site?.id]);

    const loadChecklists = async () => {
        if (!site?.id) return;

        // Charger les checklists du site
        const { data: checklistsData, error: checklistsError } = await supabase
            .from('site_checklists')
            .select('*')
            .eq('site_id', site.id)
            .order('created_at', { ascending: false });

        if (checklistsError) {
            console.error('Error loading checklists:', checklistsError);
            return;
        }

        setChecklists(checklistsData || []);

        // Charger les tâches de toutes les checklists
        if (checklistsData && checklistsData.length > 0) {
            const checklistIds = checklistsData.map(c => c.id);
            const { data: itemsData, error: itemsError } = await supabase
                .from('site_checklist_items')
                .select('*')
                .in('checklist_id', checklistIds)
                .order('position', { ascending: true });

            if (itemsError) {
                console.error('Error loading checklist items:', itemsError);
            } else {
                setChecklistItems(itemsData || []);
            }
        }
    };

    const handleToggleTask = async (itemId) => {
        const item = checklistItems.find(i => i.id === itemId);
        if (!item) return;

        const { error } = await supabase
            .from('site_checklist_items')
            .update({
                is_completed: !item.is_completed,
                completed_by: !item.is_completed ? user?.id : null,
                completed_at: !item.is_completed ? new Date().toISOString() : null
            })
            .eq('id', itemId);

        if (error) {
            console.error('Error updating task:', error);
            alert('Erreur lors de la mise à jour de la tâche');
        } else {
            await loadChecklists();
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (newTaskText.trim() === '' || !user) return;

        // Créer une checklist par défaut s'il n'y en a pas
        let targetChecklistId;
        if (checklists.length === 0) {
            const { data: newChecklist, error: checklistError } = await supabase
                .from('site_checklists')
                .insert({
                    site_id: site.id,
                    created_by: user.id,
                    name: 'Checklist principale',
                    description: 'Checklist créée automatiquement'
                })
                .select()
                .single();

            if (checklistError) {
                console.error('Error creating checklist:', checklistError);
                alert('Erreur lors de la création de la checklist');
                return;
            }
            targetChecklistId = newChecklist.id;
        } else {
            targetChecklistId = checklists[0].id;
        }

        // Calculer la position
        const maxPosition = Math.max(...checklistItems.filter(i => i.checklist_id === targetChecklistId).map(i => i.position), 0);

        // Ajouter la tâche
        const { error } = await supabase
            .from('site_checklist_items')
            .insert({
                checklist_id: targetChecklistId,
                title: newTaskText.trim(),
                position: maxPosition + 1,
                is_completed: false
            });

        if (error) {
            console.error('Error adding task:', error);
            alert('Erreur lors de l\'ajout de la tâche');
        } else {
            setNewTaskText('');
            await loadChecklists();
        }
    };

    const handleDeleteTask = async (itemId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;

        const { error } = await supabase
            .from('site_checklist_items')
            .delete()
            .eq('id', itemId);

        if (error) {
            console.error('Error deleting task:', error);
            alert('Erreur lors de la suppression de la tâche');
        } else {
            await loadChecklists();
        }
    };

    const handleApplyTemplate = async (e) => {
        const templateId = e.target.value;
        if (!templateId || !user) return;

        try {
            // Récupérer le template et ses items
            const { data: template, error: templateError } = await supabase
                .from('checklist_templates')
                .select('*')
                .eq('id', templateId)
                .single();

            if (templateError) {
                console.error('Error loading template:', templateError);
                return;
            }

            const { data: templateItems, error: itemsError } = await supabase
                .from('checklist_template_items')
                .select('*')
                .eq('template_id', templateId)
                .order('position', { ascending: true });

            if (itemsError) {
                console.error('Error loading template items:', itemsError);
                return;
            }

            // Créer une nouvelle checklist basée sur le template
            const { data: newChecklist, error: checklistError } = await supabase
                .from('site_checklists')
                .insert({
                    site_id: site.id,
                    template_id: templateId,
                    created_by: user.id,
                    name: template.name,
                    description: template.description
                })
                .select()
                .single();

            if (checklistError) {
                console.error('Error creating checklist:', checklistError);
                alert('Erreur lors de la création de la checklist');
                return;
            }

            // Créer les tâches basées sur le template
            const tasksToInsert = templateItems.map(item => ({
                checklist_id: newChecklist.id,
                template_item_id: item.id,
                title: item.title,
                description: item.description,
                position: item.position,
                requires_photo: item.requires_photo || false
            }));

            const { error: insertError } = await supabase
                .from('site_checklist_items')
                .insert(tasksToInsert);

            if (insertError) {
                console.error('Error creating checklist items:', insertError);
                alert('Erreur lors de la création des tâches');
            } else {
                await loadChecklists();
            }

        } catch (error) {
            console.error('Error applying template:', error);
            alert('Erreur lors de l\'application du template');
        }

        // Reset select
        e.target.value = '';
    };

    if (loading) {
        return (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Chargement des checklists...</p>
            </div>
        );
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
                
                <div className="max-w-md mx-auto">
                    <form onSubmit={handleAddTask} className="flex space-x-2">
                        <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Nouvelle tâche" className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                        <button type="submit" disabled={!newTaskText.trim()} className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50">
                            <Plus size={16} />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {checklists.map(checklist => {
                const checklistTasks = checklistItems.filter(item => item.checklist_id === checklist.id);
                const completedChecklistTasks = checklistTasks.filter(item => item.is_completed).length;
                
                return (
                    <div key={checklist.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-700">{checklist.name}</h3>
                            <span className="text-sm text-gray-500">
                                {completedChecklistTasks} / {checklistTasks.length} terminée(s)
                            </span>
                        </div>
                        
                        {checklist.description && (
                            <p className="text-sm text-gray-600">{checklist.description}</p>
                        )}
                        
                        <div className="space-y-2">
                            {checklistTasks.map((task) => (
                                <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                    task.is_completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                                }`}>
                                    <div className="flex items-center space-x-3 flex-1">
                                        <button onClick={() => handleToggleTask(task.id)} className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                                            task.is_completed ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 hover:border-green-500'
                                        }`}>
                                            {task.is_completed && <CheckSquare size={14} />}
                                        </button>
                                        <div className="flex-1">
                                            <span className={`text-sm ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                                {task.title}
                                            </span>
                                            {task.description && (
                                                <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteTask(task.id)} className="text-red-500 hover:text-red-700 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            <form onSubmit={handleAddTask} className="flex space-x-2">
                <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Ajouter une nouvelle tâche..." className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                <button type="submit" disabled={!newTaskText.trim()} className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50">
                    <Plus size={16} />
                </button>
            </form>
            
            {checklistTemplates.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Appliquer un modèle :</label>
                    <select onChange={handleApplyTemplate} defaultValue="" className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
                        <option value="" disabled>Choisir un modèle</option>
                        {checklistTemplates.map(template => (
                            <option key={template.id} value={template.id}>{template.name}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default ChecklistTab;