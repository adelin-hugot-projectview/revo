import React, { useState, useMemo } from 'react';
import { Search, Phone, Mail, CheckCircle, Wrench, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ChevronDown, ChevronUp, Plus } from 'lucide-react';

const ClientCard = ({ client, colors, onClientClick }) => {
    const [openSection, setOpenSection] = useState(null);
    const completedSites = client.sites.filter(site => site.status === 'Terminé');
    const otherSites = client.sites.filter(site => site.status !== 'Terminé');
    const toggleSection = (section) => { setOpenSection(prev => (prev === section ? null : section)); };
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col hover:shadow-md transition-shadow duration-300">
            <div onClick={() => onClientClick(client)} className="cursor-pointer">
                <div className="flex justify-between items-start">
                    <div><h3 className="font-bold text-lg text-gray-800 font-['Poppins']">{client.name}</h3></div>
                    <div className="flex items-center gap-2">
                        <a href={`tel:${client.phone}`} className="p-2 rounded-full bg-gray-100 hover:bg-[${colors.secondary}] text-[${colors.primary}] transition-colors"><Phone size={16} /></a>
                        <a href={`mailto:${client.email}`} className="p-2 rounded-full bg-gray-100 hover:bg-[${colors.secondary}] text-[${colors.primary}] transition-colors"><Mail size={16} /></a>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-around">
                    <div className="text-center p-2 rounded-lg w-full">
                        <p className="flex items-center justify-center gap-2 font-bold text-xl" style={{color: colors.success}}><CheckCircle size={20} />{completedSites.length}</p>
                        <p className="text-xs text-gray-500 uppercase flex items-center justify-center">Terminés</p>
                    </div>
                    <div className="text-center p-2 rounded-lg w-full">
                        <p className="flex items-center justify-center gap-2 font-bold text-xl" style={{color: colors.accent}}><Wrench size={20} />{otherSites.length}</p>
                        <p className="text-xs text-gray-500 uppercase flex items-center justify-center">Autres</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ClientsPage = ({ clients, colors, onClientClick, onAddSite }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;
    const filteredClients = useMemo(() => clients.filter(client => client.name.toLowerCase().includes(searchTerm.toLowerCase())), [clients, searchTerm]);
    const paginatedClients = filteredClients.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[${colors.neutralDark}] font-['Poppins']">Clients</h1>
                <div className="flex items-center gap-4">
                    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Rechercher un client..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]"/></div>
                    <button onClick={onAddSite} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors" style={{backgroundColor: colors.primary}}><Plus size={20}/>Nouveau chantier</button>
                </div>
            </div>
            <div className="flex-grow"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{paginatedClients.map(client => <ClientCard key={client.id} client={client} colors={colors} onClientClick={onClientClick}/>)}</div></div>
            <div className="flex items-center justify-between py-3 mt-4">
                <span className="text-sm text-gray-700">Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span></span>
                <div className="flex items-center gap-1"><button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronsLeft size={18}/></button><button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={18}/></button><button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={18}/></button><button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronsRight size={18}/></button></div>
            </div>
        </div>
    );
};

export default ClientsPage;
