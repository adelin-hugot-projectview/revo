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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                activePage === item.name
                    ? `bg-gradient-to-r from-green-50 to-green-100 text-green-700 shadow-md border border-green-200`
                    : `text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm`
            }`}
            style={{ 
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                ...(activePage === item.name && {
                    background: 'linear-gradient(135deg, rgba(43, 95, 76, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)',
                    color: '#2B5F4C'
                })
            }}
        >
            <item.icon size={20} className={activePage === item.name ? 'text-green-600' : ''} />
            {isSidebarOpen && <span className="font-medium">{item.name}</span>}
        </button>
    );

    return (
        <div className={`hidden md:flex flex-col h-full bg-white border-r border-gray-100 p-6 transition-all duration-500 ${isSidebarOpen ? 'w-80' : 'w-20'}`} style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
            <div className="flex items-center justify-between mb-12">
                {isSidebarOpen && (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #2B5F4C 0%, #22C55E 100%)' }}>
                            <span className="text-white font-black text-xl">R</span>
                        </div>
                        <span className="text-2xl font-black tracking-tight" style={{ 
                            background: 'linear-gradient(135deg, #2B5F4C 0%, #22C55E 100%)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent' 
                        }}>REVO</span>
                    </div>
                )}
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-2xl transition-all duration-300 hover:shadow-md">
                    {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>
            
            <nav className="flex-grow space-y-3">
                {navItems.map(item => <NavButton key={item.name} item={item} />)}
            </nav>
            
            <div className="space-y-3 pt-6 border-t border-gray-100">
                {isSidebarOpen && (
                    <div className="px-2 mb-3">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Paramètres</span>
                    </div>
                )}
                {settingsItems.map(item => (
                    (!item.adminOnly || currentUserRole === 'Administrateur') && (
                        <NavButton key={item.name} item={item} />
                    )
                ))}
                <button 
                    onClick={onLogout} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-md hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)' }}
                >
                    <LogOut size={20} />
                    {isSidebarOpen && <span className="font-medium">Déconnexion</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
