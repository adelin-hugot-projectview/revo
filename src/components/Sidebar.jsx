import React from 'react';
import { Calendar, Map, Briefcase, Users, Building, User, ChevronLeft, CalendarDays, ClipboardList } from 'lucide-react'; // Ajout de ClipboardList

// Le composant NavItem est maintenant local au fichier Sidebar
const NavItem = ({ icon: Icon, label, active, onClick, isSidebarOpen, colors }) => (
    <li
        className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors ${isSidebarOpen ? 'justify-start' : 'justify-center'} ${
            active 
            ? `bg-[${colors.primary}] text-white` 
            : `text-[${colors.neutralDark}] hover:bg-[${colors.secondary}]`
        }`}
        onClick={onClick}
    >
        <Icon size={20} className={active ? 'text-white' : `text-[${colors.primary}]`} />
        <span className={`ml-4 whitespace-nowrap ${isSidebarOpen ? 'inline-block' : 'hidden'}`}>{label}</span>
    </li>
);

// Le composant Sidebar est maintenant exporté par défaut
const Sidebar = ({ activePage, navigateTo, isSidebarOpen, setIsSidebarOpen, colors }) => {
    return (
        <div className={`relative flex flex-col h-screen bg-[${colors.neutralLight}] border-r border-gray-200 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
            <div className={`flex items-center p-4 border-b border-gray-200 h-[69px] ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
                <div className={`flex items-center`}>
                    <div className={`w-8 h-8 bg-[${colors.primary}] rounded-md flex-shrink-0`}></div>
                    <h1 className={`ml-3 text-2xl font-bold font-['Poppins'] text-[${colors.neutralDark}] transition-opacity duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Zuno</h1>
                </div>
            </div>
            
            <nav className="flex-1 px-4 py-4 overflow-y-auto">
                <ul>
                    <NavItem icon={Calendar} label="Dashboard" active={activePage === 'Dashboard'} onClick={() => navigateTo('Dashboard')} isSidebarOpen={isSidebarOpen} colors={colors} />
                    <NavItem icon={CalendarDays} label="Calendrier" active={activePage === 'Calendar'} onClick={() => navigateTo('Calendar')} isSidebarOpen={isSidebarOpen} colors={colors} />
                    <NavItem icon={Map} label="Carte des chantiers" active={activePage === 'Map'} onClick={() => navigateTo('Map')} isSidebarOpen={isSidebarOpen} colors={colors} />
                    <NavItem icon={Briefcase} label="Liste des chantiers" active={activePage === 'Sites'} onClick={() => navigateTo('Sites')} isSidebarOpen={isSidebarOpen} colors={colors} />
                    <NavItem icon={Users} label="Clients" active={activePage === 'Clients'} onClick={() => navigateTo('Clients')} isSidebarOpen={isSidebarOpen} colors={colors} />
                    <NavItem icon={ClipboardList} label="Templates" active={activePage === 'Templates'} onClick={() => navigateTo('Templates')} isSidebarOpen={isSidebarOpen} colors={colors} />
                </ul>
            </nav>
            
            <div className="px-4 py-4 border-t border-gray-200">
                 <ul>
                    <NavItem icon={Building} label="Ma société" active={activePage === 'Company'} onClick={() => navigateTo('Company')} isSidebarOpen={isSidebarOpen} colors={colors} />
                    <NavItem icon={Users} label="Personnel" active={activePage === 'Staff'} onClick={() => navigateTo('Staff')} isSidebarOpen={isSidebarOpen} colors={colors} />
                    <NavItem icon={User} label="Profil" active={activePage === 'Profile'} onClick={() => navigateTo('Profile')} isSidebarOpen={isSidebarOpen} colors={colors} />
                </ul>
            </div>
            
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 rounded-full bg-white border border-gray-300 shadow-lg hover:bg-gray-100 transition-colors focus:outline-none z-10"
                aria-label={isSidebarOpen ? "Réduire le menu" : "Agrandir le menu"}
            >
                <ChevronLeft size={20} className={`transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`} />
            </button>
        </div>
    );
};

export default Sidebar;
