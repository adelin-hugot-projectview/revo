import React from 'react';
import { 
    LayoutDashboard, 
    ClipboardList,
    Columns, // NOUVELLE ICÔNE
    Calendar, 
    Map, 
    List, 
    Users, 
    FileText, 
    Settings, 
    User, 
    LogOut, 
    ChevronLeft, 
    ChevronRight,
    CreditCard // Nouvelle icône pour le paiement
} from 'lucide-react';

const Sidebar = ({ activePage, navigateTo, isSidebarOpen, setIsSidebarOpen, colors, onLogout, currentUserRole = null }) => {
    // Les noms définis ici sont la "source de vérité" pour la navigation
    // et doivent correspondre aux 'case' dans App.jsx
    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'Chantiers', icon: List },
        { name: 'Kanban', icon: Columns }, // NOUVEL ITEM DE MENU
        { name: 'Calendrier', icon: Calendar },
        { name: 'Carte', icon: Map },
        { name: 'Clients', icon: Users },
        { name: 'Templates', icon: FileText },
    ];
    
    const settingsItems = [
        { name: 'Société', icon: Settings },
        { name: 'Abonnement', icon: CreditCard, adminOnly: true },
        { name: 'Mon Profil', icon: User },
    ];

    const NavButton = ({ item }) => (
        <button
            onClick={() => navigateTo(item.name)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activePage === item.name
                    ? `bg-green-100 text-green-800`
                    : `text-gray-600 hover:bg-gray-100`
            }`}
        >
            <item.icon size={20} />
            {isSidebarOpen && <span>{item.name}</span>}
        </button>
    );

    return (
        <div className={`hidden md:flex flex-col h-full bg-white border-r border-gray-200 p-4 transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
            <div className="flex items-center justify-between mb-8">
                {isSidebarOpen && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-700 rounded-md"></div>
                        <h1 className="text-xl font-bold font-['Poppins'] text-gray-800">REVO</h1>
                    </div>
                )}
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
                    {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>
            
            <nav className="flex-grow space-y-2">
                {navItems.map(item => <NavButton key={item.name} item={item} />)}
            </nav>
            
            <div className="space-y-2">
                {settingsItems.map(item => (
                    (!item.adminOnly || currentUserRole === 'Administrateur') && (
                        <NavButton key={item.name} item={item} />
                    )
                ))}
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: colors.danger }}>
                    <LogOut size={20} />
                    {isSidebarOpen && <span>Déconnexion</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
