import React, { useState, useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import { supabase } from './supabaseClient';

// Import des composants
import Sidebar from './components/Sidebar.jsx';
import SidePanel from './components/SidePanel.jsx';
import SiteDetail from './components/details/SiteDetail.jsx';
import ClientDetail from './components/details/ClientDetail.jsx';
import SiteCreationModal from './components/SiteCreationModal.jsx';
import ClientCreationModal from './components/ClientCreationModal.jsx';
import StatusBadge from './components/details/StatusBadge.jsx';
import StatusManagementModal from './components/StatusManagementModal.jsx';

import Dashboard from './pages/Dashboard.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import MapPage from './pages/MapPage.jsx';
import SitesListPage from './pages/SitesListPage.jsx';
import SitesKanbanPage from './pages/SitesKanbanPage.jsx';
import ClientsPage from './pages/ClientsPage.jsx';
import TemplatesPage from './pages/TemplatesPage.jsx';
import CompanyPage from './pages/CompanyPage.jsx';
import SubscriptionPage from './pages/SubscriptionPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import LandingPage from './pages/LandingPage.jsx';

export default function App() {
    // --- ÉTATS ---
    const [session, setSession] = useState(null);
    const [appLoading, setAppLoading] = useState(true);
    const [authPage, setAuthPage] = useState('login');
    const [companyInfo, setCompanyInfo] = useState(null);
    const [sites, setSites] = useState([]);
    const [clients, setClients] = useState([]);
    const [todos, setTodos] = useState([]);
    const [teams, setTeams] = useState([]);
    const [checklistTemplates, setChecklistTemplates] = useState([]);
    const [activePage, setActivePage] = useState('Dashboard');
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [selectedSite, setSelectedSite] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [newTodoText, setNewTodoText] = useState('');
    const [kanbanColumns, setKanbanColumns] = useState([]); // Utilisé comme "statuts"
    const [currentUserRole, setCurrentUserRole] = useState(null); // rôle de l'utilisateur

    // Empêche de rappeler le RPC plusieurs fois pour la même session
    const rpcCalledRef = useRef(false);

    const colors = { primary: '#2B5F4C', secondary: '#E1F2EC', accent: '#FFBB33', neutralDark: '#222222', neutralLight: '#F8F9FA', danger: '#E74C3C', success: '#2ECC71' };

    // --- GESTION DE LA SESSION SUPABASE ---
    useEffect(() => {
        setAppLoading(true);

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            // Au premier SIGNED_IN, garantir la création/liaison company côté DB
            if (event === 'SIGNED_IN' && session?.user?.id && !rpcCalledRef.current) {
                rpcCalledRef.current = true;
                const { error } = await supabase.rpc('create_my_company');
                if (error) console.error('RPC create_my_company error (onAuthStateChange):', error);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // --- CHARGEMENT DES DONNÉES DEPUIS SUPABASE ---
    useEffect(() => {
        if (!session) {
            setCompanyInfo(null); setSites([]); setClients([]); setTodos([]); setTeams([]); setChecklistTemplates([]); setKanbanColumns([]);
            rpcCalledRef.current = false; // Reset RPC flag quand pas de session
            setAppLoading(false);
            return;
        }
        
        let isCancelled = false; // Pour éviter les race conditions
        
        const fetchData = async () => {
            if (isCancelled) return;
            setAppLoading(true);
            try {
                // D'abord, récupérer le profil utilisateur pour obtenir company_id
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;
                if (isCancelled) return;

                let { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('company_id, role')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.error('Erreur (profil utilisateur):', profileError.message);
                    throw new Error('Impossible de charger le profil utilisateur');
                }
                if (isCancelled) return;

                let companyId = profile?.company_id;

                // Filet de sécurité : si pas de company_id, on appelle le RPC puis on re-fetch le profil
                if (!companyId) {
                    console.warn('Aucune société associée — tentative de création via RPC create_my_company');
                    if (!rpcCalledRef.current && !isCancelled) {
                        rpcCalledRef.current = true;
                        const { error: rpcError } = await supabase.rpc('create_my_company');
                        if (rpcError) console.error('RPC create_my_company error (fetchData):', rpcError);
                    }
                    if (isCancelled) return;
                    
                    const retry = await supabase
                        .from('profiles')
                        .select('company_id, role')
                        .eq('id', user.id)
                        .single();
                    if (!retry.error && retry.data?.company_id) {
                        profile = retry.data;
                        companyId = retry.data.company_id;
                    } else {
                        throw new Error('Aucune société associée à cet utilisateur (après tentative de bootstrap).');
                    }
                }
                if (isCancelled) return;

                // Ensuite, charger les données en utilisant company_id
                const [
                    companyRes,
                    sitesRes,
                    clientsRes,
                    teamsRes,
                    kanbanColumnsRes,
                    templatesRes,
                    todosRes
                ] = await Promise.all([
                    supabase.from('companies').select('*, stripe_customer_id, max_users').eq('id', companyId).single(),
                    supabase.from('sites').select('*, client:clients(*), team:teams(id, name), status:kanban_columns(id, name, color, position), start_date, end_date').eq('company_id', companyId).order('position', { ascending: true }),
                    supabase.from('clients').select('*').eq('company_id', companyId),
                    supabase.from('teams').select('*').eq('company_id', companyId),
                    supabase.from('kanban_columns').select('*').eq('company_id', companyId).order('position'),
                    supabase.from('checklist_templates').select('*').eq('company_id', companyId),
                    supabase.from('todos').select('*, site_id').eq('user_id', session.user.id)
                ]);
                
                if (isCancelled) return;

                if (companyRes.error) {
                    console.error('Erreur (société):', companyRes.error.message);
                    throw new Error(`Impossible de charger les informations de la société: ${companyRes.error.message}`);
                } else {
                    setCompanyInfo(companyRes.data);
                }

                // Définir le rôle utilisateur
                setCurrentUserRole(profile.role);
            
                if (clientsRes.error) {
                    console.error('Erreur (clients):', clientsRes.error.message);
                    throw new Error(`Impossible de charger les clients: ${clientsRes.error.message}`);
                } else {
                    setClients(clientsRes.data || []);
                }

                if (teamsRes.error) {
                    console.error('Erreur (équipes):', teamsRes.error.message);
                    throw new Error(`Impossible de charger les équipes: ${teamsRes.error.message}`);
                } else {
                    setTeams(teamsRes.data || []);
                }

                if (templatesRes.error) {
                    console.error('Erreur (modèles):', templatesRes.error.message);
                    throw new Error(`Impossible de charger les modèles: ${templatesRes.error.message}`);
                } else {
                    setChecklistTemplates(templatesRes.data || []);
                }

                if (kanbanColumnsRes.error) {
                    console.error('Erreur (statuts):', kanbanColumnsRes.error.message);
                    throw new Error(`Impossible de charger les statuts: ${kanbanColumnsRes.error.message}`);
                } else {
                    setKanbanColumns(kanbanColumnsRes.data || []);
                }
                
                if (sitesRes.error) {
                    console.error('Erreur (chantiers):', sitesRes.error.message);
                    throw new Error(`Impossible de charger les chantiers: ${sitesRes.error.message}`);
                } else {
                    const formattedSites = sitesRes.data.map(site => ({
                        ...site,
                        client: site.client ? site.client.name : 'Client non défini',
                        clientData: site.client,
                        team: site.team,
                        startTime: site.start_time,
                        endTime: site.end_time,
                        startDate: site.start_date,
                        endDate: site.end_date,
                    }));
                    setSites(formattedSites);
                }

                if (todosRes.error) {
                    console.error('Erreur (todos):', todosRes.error.message);
                    throw new Error(`Impossible de charger les tâches: ${todosRes.error.message}`);
                } else {
                    setTodos(todosRes.data.map(todo => ({ id: todo.id, text: todo.task, done: todo.is_complete, completed_at: todo.completed_at, site_id: todo.site_id })));
                }

            } catch (error) {
                console.error('Erreur lors du chargement des données:', error.message);
            } finally {
                if (!isCancelled) {
                    setAppLoading(false);
                }
            }
        };
        
        fetchData();
        
        // Cleanup function pour éviter les race conditions
        return () => {
            isCancelled = true;
        };
    }, [session]);

    // --- FONCTIONS DE GESTION ---
    const handleLogout = async () => { await supabase.auth.signOut(); setActivePage('Dashboard'); };

    const handleSaveClient = async (clientData) => {
        try {
            console.log('🏢 CompanyInfo:', companyInfo);
            console.log('📝 ClientData:', clientData);
            
            let currentCompanyId = companyInfo?.id;
            
            if (!currentCompanyId) {
                console.log('🔍 Récupération company_id depuis le profil...');
                const { data: { user } } = await supabase.auth.getUser();
                
                if (user) {
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('company_id')
                        .eq('id', user.id)
                        .single();
                    
                    if (profileError || !profile) {
                        throw new Error('Aucun profil trouvé. Veuillez vous reconnecter ou contacter l\'administrateur.');
                    }
                    
                    currentCompanyId = profile.company_id;
                    console.log('🏢 Company ID récupéré:', currentCompanyId);
                }
            }
            
            if (!currentCompanyId) {
                throw new Error('Aucune société associée. Veuillez vous reconnecter.');
            }

            const { data, error } = await supabase
                .from('clients')
                .insert([{
                    name: clientData.name,
                    email: clientData.email,
                    phone: clientData.phone,
                    address: clientData.address,
                    company_id: currentCompanyId
                }])
                .select()
                .single();

            if (error) {
                console.error('Erreur sauvegarde client:', error);
                throw error;
            }

            console.log('✅ Client créé:', data);
            
            setClients(prevClients => [...prevClients, data]);
            
            return data;
        } catch (error) {
            console.error('Erreur lors de la création du client:', error);
            throw error;
        }
    };

    const handleUpdateSite = async (siteId, updates) => {
        const originalSites = [...sites];
        const originalSelectedSite = selectedSite ? { ...selectedSite } : null;

        const updatedSites = sites.map(site => {
            if (site.id === siteId) {
                const newStatus = updates.kanban_column_id
                    ? kanbanColumns.find(c => c.id === updates.kanban_column_id)
                    : site.status;
                return {
                    ...site,
                    ...updates,
                    status: newStatus || site.status
                };
            }
            return site;
        });

        setSites(updatedSites);

        if (selectedSite && selectedSite.id === siteId) {
            const updatedSelectedSiteData = updatedSites.find(s => s.id === siteId);
            setSelectedSite(updatedSelectedSiteData);
        }

        const { data, error } = await supabase
            .from('sites')
            .update(updates)
            .eq('id', siteId)
            .select('*, client:clients(*), team:teams(id, name), status:kanban_columns(id, name, color, position)')
            .single();

        if (error) {
            console.error('Erreur Supabase (update site):', error);
            setSites(originalSites);
            if (originalSelectedSite) {
                setSelectedSite(originalSelectedSite);
            }
            alert("La mise à jour a échoué. Veuillez réessayer.");
        } else {
            const formattedSite = {
                ...data,
                client: data.client ? data.client.name : 'Client non défini',
                clientData: data.client,
                team: data.team,
                startTime: data.start_time,
                endTime: data.end_time,
                startDate: data.start_date,
                endDate: data.end_date
            };
            setSites(prevSites => prevSites.map(site => site.id === siteId ? formattedSite : site));
            if (selectedSite && selectedSite.id === siteId) {
                setSelectedSite(formattedSite);
            }
        }
    };

    const handleUpdateSiteOrder = async (updatedSitesData) => {
        if (updatedSitesData.length === 0) return;

        const updatePromises = updatedSitesData.map(async (updatedSite) => {
            const { error } = await supabase
                .from('sites')
                .update({
                    kanban_column_id: updatedSite.kanban_column_id,
                    position: updatedSite.position,
                })
                .eq('id', updatedSite.id);

            if (error) {
                console.error(`Erreur Supabase (update site ${updatedSite.id} order):`, error);
                return { id: updatedSite.id, success: false, error };
            }
            return { id: updatedSite.id, success: true };
        });

        await Promise.all(updatePromises);

        const { data: sitesRes, error: sitesError } = await supabase.from('sites').select('*, client:clients(name), team:teams(id, name), status:kanban_columns(id, name, color, position)').order('position', { ascending: true });
        if (sitesError) {
            console.error('Erreur (re-fetch chantiers):', sitesError.message);
        } else {
            const formattedSites = sitesRes.map(site => ({
                ...site,
                client: site.client ? site.client.name : 'Client non défini',
                clientData: site.client,
                team: site.team,
                startTime: site.start_time,
                endTime: site.end_time,
                startDate: site.start_date,
                endDate: site.end_date,
            }));
            setSites(formattedSites);
        }
    };
    
    const handleSaveStatusColumns = async (updatedStatuses) => {
        const upserts = updatedStatuses.map((status, index) => ({
            id: status.id,
            name: status.name,
            color: status.color,
            position: index,
            company_id: companyInfo.id
        }));

        const { data, error } = await supabase.from('kanban_columns').upsert(upserts).select();

        if (error) {
            console.error('Erreur (maj statuts):', error);
        } else {
            setKanbanColumns(data.sort((a, b) => a.position - b.position));
        }
    };

    const handleDeleteStatusColumn = async (statusId) => {
        const sitesWithStatus = sites.filter(s => s.status?.id === statusId);
        if (sitesWithStatus.length > 0) {
            alert('Ce statut est utilisé par des chantiers et ne peut pas être supprimé.');
            return;
        }

        const { error } = await supabase.from('kanban_columns').delete().eq('id', statusId);
        if (error) {
            console.error('Erreur (suppression statut):', error);
        } else {
            setKanbanColumns(prev => prev.filter(s => s.id !== statusId));
        }
    };

    const navigateTo = (page) => { setActivePage(page); setIsMobileMenuOpen(false); };
    const handleOpenSite = (site) => { setSelectedClient(null); setSelectedSite(site); };
    const handleOpenClient = (client) => { setSelectedSite(null); setSelectedClient(client); };
    const handleClosePanel = () => { setSelectedSite(null); setSelectedClient(null); };

    // --- FONCTIONS DE GESTION DES TODOS ---
    const handleAddTodo = async (taskText) => {
        if (!session || !companyInfo) return;
        const { data, error } = await supabase.from('todos').insert({
            user_id: session.user.id,
            company_id: companyInfo.id,
            task: taskText,
        }).select().single();
        if (error) {
            console.error('Erreur (ajout todo):', error);
        } else {
            console.log('Nouvelle tâche ajoutée à Supabase:', data);
            setTodos(prev => {
                const updatedTodos = [...prev, { id: data.id, text: data.task, done: data.is_complete, completed_at: data.completed_at, site_id: data.site_id }];
                console.log('Todos après ajout:', updatedTodos);
                return updatedTodos;
            });
        }
    };

    const handleToggleTodo = async (todoId, currentStatus) => {
        const newStatus = !currentStatus;
        const { error } = await supabase.from('todos').update({ is_complete: newStatus, completed_at: newStatus ? new Date().toISOString() : null }).eq('id', todoId);
        if (error) {
            console.error('Erreur (toggle todo):', error);
        } else {
            setTodos(prev => prev.map(todo => todo.id === todoId ? { ...todo, done: newStatus, completed_at: newStatus ? new Date().toISOString() : null } : todo));
        }
    };

    const handleDeleteTodo = async (todoId) => {
        const { error } = await supabase.from('todos').delete().eq('id', todoId);
        if (error) {
            console.error('Erreur (suppression todo):', error);
        } else {
            setTodos(prev => prev.filter(todo => todo.id !== todoId));
        }
    };

    // --- RENDU ---
    if (appLoading) return <div className="h-screen w-screen flex justify-center items-center font-bold text-xl text-primary">Chargement de REVO...</div>;

    // Determine if we are on a public path (landing, login, signup)
    const isPublicPath = window.location.pathname === '/' || window.location.pathname === '/landing' || window.location.pathname === '/login' || window.location.pathname === '/signup';

    if (!session) {
        if (isPublicPath) {
            switch (window.location.pathname) {
                case '/login': return <LoginPage onSwitchToSignup={() => setAuthPage('signup')} colors={colors} companyInfo={companyInfo} />;
                case '/signup': return <SignupPage onSwitchToLogin={() => setAuthPage('login')} colors={colors} companyInfo={companyInfo} />;
                default: return <LandingPage colors={colors} />;
            }
        } else {
            window.location.href = '/';
            return null;
        }
    }

    const isPanelOpen = !!(selectedSite || selectedClient);
    
    const renderActivePage = () => {
        const pageProps = { sites, clients, teams, todos, colors, statusColumns: kanbanColumns, onSiteClick: handleOpenSite, onClientClick: handleOpenClient, onAddSite: () => setIsSiteModalOpen(true), onAddClient: () => setIsClientModalOpen(true), onUpdateSite: handleUpdateSite, onUpdateSiteOrder: handleUpdateSiteOrder, onOpenStatusModal: () => setIsStatusModalOpen(true) };
        switch (activePage) {
            case 'Dashboard': return <Dashboard {...pageProps} todos={todos} newTodoText={setNewTodoText ? newTodoText : ''} setNewTodoText={setNewTodoText} onAddTodo={handleAddTodo} onToggleTodo={handleToggleTodo} onDeleteTodo={handleDeleteTodo} />;
            case 'Chantiers': return <SitesListPage {...pageProps} />;
            case 'Kanban': 
                return <SitesKanbanPage {...pageProps} />;
            case 'Calendrier': return <CalendarPage {...pageProps} />;
            case 'Carte': return <MapPage {...pageProps} />;
            case 'Clients': return <ClientsPage {...pageProps} />;
            case 'Templates': return <TemplatesPage colors={colors} />;
            case 'Société': return <CompanyPage companyInfo={companyInfo} setCompanyInfo={setCompanyInfo} colors={colors} currentUserRole={currentUserRole} />;
            case 'Abonnement': return <SubscriptionPage companyInfo={companyInfo} colors={colors} currentUserRole={currentUserRole} />;
            case 'Mon Profil': return <ProfilePage colors={colors} currentUser={session.user} />;
            default: return <div>Page: {activePage}</div>;
        }
    };

    let panelHeader = null;
    let panelContent = null;
    let panelWidthClass = 'max-w-md';

    if (selectedSite) {
        const siteData = sites.find(s => s.id === selectedSite.id);
        if (siteData) {
            panelHeader = ( <div className="flex items-center justify-between w-full"> <h2 className="text-xl font-bold truncate pr-4">{siteData.name}</h2> <StatusBadge currentStatus={siteData.status} onStatusChange={(newStatusId) => handleUpdateSite(siteData.id, { kanban_column_id: newStatusId })} availableStatuses={kanbanColumns} colors={colors} /> </div> );
            panelContent = <SiteDetail site={siteData} onUpdateSite={(updates) => handleUpdateSite(siteData.id, updates)} teams={teams} checklistTemplates={checklistTemplates} colors={colors} />;
            panelWidthClass = 'max-w-xl';
        }
    } else if (selectedClient) {
        const clientData = { ...selectedClient, sites: sites.filter(s => s.client_id === selectedClient.id) };
        panelHeader = <h2 className="text-xl font-bold">{clientData.name}</h2>;
        panelContent = <ClientDetail client={clientData} onSiteClick={handleOpenSite} />;
        panelWidthClass = 'max-w-md';
    }

    return (
        <div className="flex h-screen bg-gray-50 font-['Inter']">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&family=Inter:wght@400;500;600&display=swap');`}</style>
            <Sidebar activePage={activePage} navigateTo={navigateTo} isSidebarOpen={isDesktopSidebarOpen} setIsSidebarOpen={setIsDesktopSidebarOpen} colors={colors} onLogout={handleLogout} currentUserRole={currentUserRole} />
            {console.log('currentUserRole in App.jsx before passing to Sidebar:', currentUserRole)}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="md:hidden flex items-center justify-between gap-4 p-4 bg-white border-b shadow-sm">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu size={24} /></button>
                </header>
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {renderActivePage()}
                </main>
            </div>
            <SidePanel header={panelHeader} isOpen={!!(selectedSite || selectedClient)} onClose={handleClosePanel} colors={colors} widthClass={panelWidthClass}> {panelContent} </SidePanel>
            <SiteCreationModal isOpen={isSiteModalOpen} onRequestClose={() => setIsSiteModalOpen(false)} clients={clients} teams={teams} onSave={handleUpdateSite} colors={colors} checklistTemplates={checklistTemplates} availableStatuses={kanbanColumns} onAddClient={() => setIsClientModalOpen(true)} />
            <ClientCreationModal isOpen={isClientModalOpen} onRequestClose={() => setIsClientModalOpen(false)} onSave={handleSaveClient} colors={colors} />
            <StatusManagementModal isOpen={isStatusModalOpen} onRequestClose={() => setIsStatusModalOpen(false)} statusColumns={kanbanColumns} onSave={handleSaveStatusColumns} onDelete={handleDeleteStatusColumn} colors={colors} />
        </div>
    );
}