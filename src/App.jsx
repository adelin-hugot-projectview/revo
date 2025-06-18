import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar.jsx';
import SidePanel from './components/SidePanel.jsx';
import SiteDetail from './components/details/SiteDetail.jsx';
import ClientDetail from './components/details/ClientDetail.jsx';
import SiteCreationModal from './components/SiteCreationModal.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MapPage from './pages/MapPage.jsx';
import SitesListPage from './pages/SitesListPage.jsx';
import ClientsPage from './pages/ClientsPage.jsx';
import StaffPage from './pages/StaffPage.jsx';
import CompanyPage from './pages/CompanyPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import TemplatesPage from './pages/TemplatesPage.jsx';

// --- DONNÉES DE DÉMONSTRATION ---
const allSitesData = [ { id: 1, name: 'Installation panneaux S.', clientId: 'client-1', client: 'Mr Dupont', clientEmail: 'jean.dupont@email.com', clientPhone: '06 11 22 33 44', date: '2025-06-16', startTime: '09:00', endTime: '13:00', type: 'success', lat: 45.7820, lng: 4.8722, address: '15 Rue de la Soie, 69100 Villeurbanne', status: 'Terminé', team: 'Équipe Alpha', comments: "Le client souhaite être appelé 30 minutes avant l'arrivée. Accès par le portail de droite.", history: [{ date: '2025-06-16', user: 'Bob Garcia', action: 'Chantier marqué comme "Terminé".' }], checklist: [{text: "Vérifier le matériel", done: true}, {text: "Contacter le client", done: true}] } ];
const initialStaff = [ { id: 'user-1', name: 'Alice Martin', email: 'alice.martin@zuno.fr', role: 'Administrateur', team: '', avatar: 'https://placehold.co/100x100/2B5F4C/FFFFFF?text=AM' } ];
const initialTodos = [ { id: 1, text: 'Commander matériaux pour Villa Dupont', done: false, siteId: 1 } ];
const initialCompanyInfo = { name: 'Zuno Construction', siret: '123 456 789 00010', address: '123 Rue de la République', city: 'Lyon', postalCode: '69001', logo: '' };
const allTeams = ['Équipe Alpha', 'Équipe Bêta', 'Équipe Gamma'];
const initialChecklistTemplates = [
  { id: 'clt-1', name: 'Check-list standard d\'installation', tasks: ['Vérifier le matériel', 'Préparer la zone de travail', 'Contacter le client avant arrivée', 'Nettoyer le chantier après intervention', 'Faire signer le bon de fin de chantier'] },
  { id: 'clt-2', name: 'Check-list de maintenance chaudière', tasks: ['Vérifier la pression', 'Nettoyer le corps de chauffe', 'Contrôler le monoxyde de carbone'] },
];
const initialEmailTemplates = [
  { id: 'emt-1', name: 'Confirmation de RDV', subject: 'Confirmation de votre rendez-vous Zuno', body: 'Bonjour [Client Name],\n\nNous vous confirmons votre rendez-vous le [Date] à [Heure].\n\nCordialement,\nL\'équipe Zuno' },
];

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [authPage, setAuthPage] = useState('login');
    const [currentUser, setCurrentUser] = useState(initialStaff[0]);
    const [activePage, setActivePage] = useState('Dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [sites, setSites] = useState(allSitesData);
    const [staff, setStaff] = useState(initialStaff);
    const [todos, setTodos] = useState(initialTodos);
    const [companyInfo, setCompanyInfo] = useState(initialCompanyInfo);
    const [selectedSite, setSelectedSite] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [checklistTemplates, setChecklistTemplates] = useState(initialChecklistTemplates);
    const [emailTemplates, setEmailTemplates] = useState(initialEmailTemplates);
    const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);

    
    const handleLogin = (email, password) => { 
        const user = initialStaff.find(u => u.email === email);
        if (user) { setCurrentUser(user); setIsAuthenticated(true); } else { alert('Utilisateur non trouvé !'); }
    };
    
    const handleSignup = (userData) => { 
        const newUser = { ...userData, id: `user-${Date.now()}`, avatar: `https://placehold.co/100x100/2B5F4C/FFFFFF?text=${userData.name.substring(0,2).toUpperCase()}`};
        setStaff([...staff, newUser]);
        setCurrentUser(newUser);
        setIsAuthenticated(true);
    };

    const handleSaveSite = (newSiteData) => {
        const selectedTemplate = checklistTemplates.find(t => t.id === newSiteData.checklistTemplateId);
        const newSite = {
            ...newSiteData,
            id: `site-${Date.now()}`,
            lat: 45.76,
            lng: 4.85,
            type: 'accent',
            history: [{ date: new Date().toISOString().split('T')[0], user: currentUser.name, action: 'Chantier créé.' }],
            checklist: selectedTemplate ? selectedTemplate.tasks.map(task => ({ text: task, done: false })) : []
        };
        setSites(prevSites => [...prevSites, newSite]);
    };

    const clients = useMemo(() => {
        const clientsMap = sites.reduce((acc, site) => {
            if (!acc[site.clientId]) { acc[site.clientId] = { id: site.clientId, name: site.client, phone: site.clientPhone, email: site.clientEmail, sites: [], address: site.address }; }
            acc[site.clientId].sites.push(site);
            return acc;
        }, {});
        return Object.values(clientsMap);
    }, [sites]);

    const navigateTo = (page) => setActivePage(page);
    const handleOpenSite = (site) => { setSelectedClient(null); setSelectedSite(site); };
    const handleOpenClient = (client) => { setSelectedSite(null); setSelectedClient(client); };
    const handleClosePanel = () => { setSelectedSite(null); setSelectedClient(null); };
    
    const colors = { primary: '#2B5F4C', secondary: '#E1F2EC', accent: '#FFBB33', neutralDark: '#222222', neutralLight: '#F8F9FA', danger: '#E74C3C', success: '#2ECC71' };

    if (!isAuthenticated) {
        if (authPage === 'login') return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setAuthPage('signup')} colors={colors} />;
        return <SignupPage onSignup={handleSignup} onSwitchToLogin={() => setAuthPage('login')} colors={colors} />;
    }
    
    const isPanelOpen = !!(selectedSite || selectedClient);
    
    const PageContent = () => {
        switch (activePage) {
            case 'Dashboard': return <Dashboard colors={colors} sites={sites} setSites={setSites} todos={todos} setTodos={setTodos} onSiteClick={handleOpenSite} onAddSite={() => setIsSiteModalOpen(true)} />;
            case 'Calendar': return <CalendarPage colors={colors} sites={sites} onSiteClick={handleOpenSite} />;
            case 'Map': return <MapPage colors={colors} sites={sites} onSiteClick={handleOpenSite} onAddSite={() => setIsSiteModalOpen(true)} />;
            case 'Sites': return <SitesListPage colors={colors} sites={sites} onSiteClick={handleOpenSite} onAddSite={() => setIsSiteModalOpen(true)} />;
            case 'Clients': return <ClientsPage colors={colors} clients={clients} onClientClick={handleOpenClient} onAddSite={() => setIsSiteModalOpen(true)} />;
            case 'Templates': return <TemplatesPage colors={colors} checklistTemplates={checklistTemplates} setChecklistTemplates={setChecklistTemplates} emailTemplates={emailTemplates} setEmailTemplates={setEmailTemplates} />;
            case 'Staff': return <StaffPage colors={colors} staff={staff} setStaff={setStaff} teams={allTeams} />;
            case 'Company': return <CompanyPage colors={colors} companyInfo={companyInfo} setCompanyInfo={setCompanyInfo} />;
            case 'Profile': return <ProfilePage colors={colors} currentUser={currentUser} setCurrentUser={setCurrentUser} />;
            default: return <div>Page en construction</div>;
        }
    };
    
    let panelContent = null, panelTitle = '', panelWidthClass = 'max-w-md';
    if (selectedSite) { panelContent = <SiteDetail site={selectedSite} colors={colors} setSites={setSites} />; panelTitle = selectedSite.name; panelWidthClass = 'max-w-xl'; }
    else if (selectedClient) { panelContent = <ClientDetail client={selectedClient} onSiteClick={handleOpenSite} />; panelTitle = selectedClient.name; }

    return (
        <div className="flex h-screen bg-gray-50 font-['Inter']">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&family=Inter:wght@400;500;600&display=swap');`}</style>
            <Sidebar activePage={activePage} navigateTo={navigateTo} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} colors={colors}/>
            <main className="flex-1 p-8 overflow-y-auto">
                 <PageContent />
            </main>
            <div className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40 ${isPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={handleClosePanel}></div>
            <SidePanel title={panelTitle} isOpen={isPanelOpen} onClose={handleClosePanel} colors={colors} widthClass={panelWidthClass}>
                {panelContent}
            </SidePanel>
            <SiteCreationModal 
                isOpen={isSiteModalOpen}
                onRequestClose={() => setIsSiteModalOpen(false)}
                onSave={handleSaveSite}
                clients={clients}
                teams={allTeams}
                checklistTemplates={checklistTemplates}
                colors={colors}
            />
        </div>
    );
}

