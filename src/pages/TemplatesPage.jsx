import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ClipboardList, Mail, X, Sparkles, Loader } from 'lucide-react';
import Modal from 'react-modal';
import ConfirmationModal from '../components/ConfirmationModal.jsx'; // Import du nouveau composant

// --- MODAL DE CRÉATION/ÉDITION DE CHECKLIST ---
const ChecklistModal = ({ isOpen, onRequestClose, onSave, colors, editingTemplate }) => {
    const [name, setName] = useState('');
    const [tasks, setTasks] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [newTask, setNewTask] = useState('');
    
    useEffect(() => {
        if (editingTemplate) {
            setName(editingTemplate.name);
            setTasks(editingTemplate.tasks);
        } else {
            setName('');
            setTasks([]);
            setPrompt('');
        }
    }, [editingTemplate, isOpen]);

    const handleGenerateAI = async () => {
        if (!prompt) return;
        setIsLoading(true);
        const apiKey = "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";
        const apiUrl = "https://api.openai.com/v1/chat/completions";
        const systemPrompt = "Tu es un assistant qui crée des listes de tâches. Réponds uniquement avec un objet JSON contenant une clé 'tasks' qui est un tableau de chaînes de caractères. N'ajoute aucune explication ou texte supplémentaire.";
        const userPrompt = `Crée une checklist de tâches pour : "${prompt}".`;
        const payload = { model: "gpt-4o-mini", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], response_format: { type: "json_object" } };
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
            const result = await response.json();
            if (result.choices?.[0]?.message?.content) {
                const jsonResponse = JSON.parse(result.choices[0].message.content);
                setTasks(jsonResponse.tasks || []);
            } else {
                setTasks(['Erreur lors de la génération.']);
            }
        } catch (error) {
            console.error("Erreur lors de l'appel à l'API OpenAI:", error);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...editingTemplate, name, tasks });
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000 }, content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', border: 'none', borderRadius: '1rem', padding: '2rem', width: '90%', maxWidth: '600px' } }} appElement={document.getElementById('root')}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between items-center"><h2 className="text-2xl font-bold font-['Poppins']">{editingTemplate ? 'Modifier le' : 'Nouveau'} Template</h2><button type="button" onClick={onRequestClose}><X size={24}/></button></div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom du template</label>
                    <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]"/>
                </div>
                {!editingTemplate && (
                    <div className="space-y-2">
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">Décrivez la check-list à créer</label>
                        <div className="flex gap-2">
                            <input type="text" name="prompt" id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ex: préparer une intervention de peinture extérieure" className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                            <button type="button" onClick={handleGenerateAI} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors" style={{backgroundColor: colors.primary}}>
                                {isLoading ? <Loader className="animate-spin" size={20}/> : <Sparkles size={20}/>}
                                <span>Générer</span>
                            </button>
                        </div>
                    </div>
                )}
                <div className="p-4 border rounded-md min-h-[150px] max-h-60 overflow-y-auto">
                    <h4 className="font-semibold mb-2">Tâches</h4>
                    {tasks.length > 0 ? (
                        <ul className="space-y-2">{tasks.map((task, index) => (<li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md"><span className="text-sm">{task}</span><button type="button" onClick={() => handleRemoveTask(index)} className="p-1 text-gray-400 hover:text-[${colors.danger}]"><Trash2 size={16}/></button></li>))}</ul>
                    ) : <p className="text-sm text-center text-gray-400 py-4">{isLoading ? 'Génération en cours...' : 'Aucune tâche.'}</p>}
                </div>
                 <div>
                    <div className="flex gap-2">
                        <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Ajouter une tâche manuellement" className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                        <button type="button" onClick={handleAddTask} className="px-4 py-2 text-white rounded-lg" style={{backgroundColor: colors.accent}}><Plus size={20}/></button>
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t"><button type="button" onClick={onRequestClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Annuler</button><button type="submit" className="px-4 py-2 text-white rounded-md" style={{backgroundColor: colors.primary}}>Enregistrer</button></div>
            </form>
        </Modal>
    );
};

// --- Sous-composant pour l'onglet Check-list ---
const ChecklistTemplates = ({ templates, onAdd, onEdit, onDelete, colors }) => (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button onClick={onAdd} className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-6 text-gray-500 hover:bg-gray-50 hover:text-[${colors.primary}] transition-colors">
                <Plus size={32}/><span className="mt-2 font-semibold">Créer une checklist</span>
            </button>
            {templates.map(template => (
                <div key={template.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg text-gray-800 font-['Poppins']">{template.name}</h3>
                    <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
                        {template.tasks.slice(0, 3).map((task, index) => <li key={index}>{task}</li>)}
                        {template.tasks.length > 3 && <li className="text-gray-400">...et {template.tasks.length - 3} autres</li>}
                    </ul>
                    <div className="mt-6 pt-4 border-t flex justify-end gap-2">
                        <button onClick={() => onEdit(template)} className="p-2 text-gray-500 hover:text-[${colors.primary}]"><Edit size={18}/></button>
                        <button onClick={() => onDelete(template)} className="p-2 text-gray-500 hover:text-[${colors.danger}]"><Trash2 size={18}/></button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// --- Sous-composant pour l'onglet Email ---
const EmailTemplates = ({ templates, colors }) => (
     <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-6 text-gray-500 hover:bg-gray-50 hover:text-[${colors.primary}] transition-colors">
                <Plus size={32}/><span className="mt-2 font-semibold">Créer un email</span>
            </button>
            {templates.map(template => (
                <div key={template.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg text-gray-800 font-['Poppins']">{template.name}</h3>
                    <p className="text-sm font-semibold text-gray-500 mt-4">Sujet :</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md">{template.subject}</p>
                    <div className="mt-6 pt-4 border-t flex justify-end gap-2"><button className="p-2 text-gray-500 hover:text-[${colors.primary}]"><Edit size={18}/></button><button className="p-2 text-gray-500 hover:text-[${colors.danger}]"><Trash2 size={18}/></button></div>
                </div>
            ))}
        </div>
    </div>
);

// --- Composant principal de la page ---
const TemplatesPage = ({ checklistTemplates, setChecklistTemplates, emailTemplates, colors }) => {
    const [activeTab, setActiveTab] = useState('Check-list');
    const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateToDelete, setTemplateToDelete] = useState(null);

    const tabs = [{ name: 'Check-list', icon: ClipboardList }, { name: 'Email', icon: Mail }];

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

    const handleSaveChecklist = (templateData) => {
        if (templateData.id) {
            setChecklistTemplates(prev => prev.map(t => t.id === templateData.id ? templateData : t));
        } else {
            const newTemplate = { ...templateData, id: `clt-${Date.now()}`};
            setChecklistTemplates(prev => [newTemplate, ...prev]);
        }
        setIsChecklistModalOpen(false);
    };

    const confirmDelete = () => {
        setChecklistTemplates(prev => prev.filter(t => t.id !== templateToDelete.id));
        setIsConfirmModalOpen(false);
        setTemplateToDelete(null);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-bold text-[${colors.neutralDark}] font-['Poppins']">Templates</h1></div>
            <div className="mb-6 border-b border-gray-200"><nav className="-mb-px flex space-x-6" aria-label="Tabs">{tabs.map((tab) => (<button key={tab.name} onClick={() => setActiveTab(tab.name)} className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.name ? `border-[${colors.primary}] text-[${colors.primary}]` : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><tab.icon size={16} />{tab.name}</button>))}</nav></div>
            <div className="flex-grow overflow-y-auto">
                {activeTab === 'Check-list' && <ChecklistTemplates templates={checklistTemplates} onAdd={handleOpenCreateModal} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} colors={colors} />}
                {activeTab === 'Email' && <EmailTemplates templates={emailTemplates} colors={colors} />}
            </div>
            <ChecklistModal isOpen={isChecklistModalOpen} onRequestClose={() => setIsChecklistModalOpen(false)} onSave={handleSaveChecklist} colors={colors} editingTemplate={editingTemplate} />
            <ConfirmationModal 
                isOpen={isConfirmModalOpen}
                onRequestClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirmer la suppression"
                message={`Êtes-vous sûr de vouloir supprimer le template "${templateToDelete?.name}" ? Cette action est irréversible.`}
                colors={colors}
            />
        </div>
    );
};

export default TemplatesPage;
