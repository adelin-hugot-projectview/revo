import React, { useState, useMemo } from 'react';
import { Search, Phone, Mail, CheckCircle, Wrench, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Plus } from 'lucide-react';

const ClientCard = ({ client, sites, onClientClick }) => {
    // MODIFICATION : Calcul des KPIs en filtrant la liste complète des chantiers
    const clientSites = useMemo(() => 
        sites.filter(site => site.client_id === client.id), 
        [sites, client.id]
    );

    const completedSitesCount = useMemo(() => 
        clientSites.filter(site => site.status?.name === 'Terminé').length, 
        [clientSites]
    );

    const otherSitesCount = clientSites.length - completedSitesCount;

    return (
        <div 
            className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 flex flex-col hover:shadow-xl hover:scale-105 transition-all duration-300 group"
            style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
        >
            <div onClick={() => onClientClick(client)} className="cursor-pointer flex flex-col flex-grow">
                <div className="flex-grow">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="font-black text-xl tracking-tight" style={{color: '#222222'}}>{client.name}</h3>
                        <div className="flex items-center gap-3">
                            <a href={`tel:${client.phone}`} onClick={e => e.stopPropagation()} className="p-3 rounded-2xl bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-600 transition-all duration-300 hover:scale-110" aria-label="Téléphoner">
                                <Phone size={18} />
                            </a>
                            <a href={`mailto:${client.email}`} onClick={e => e.stopPropagation()} className="p-3 rounded-2xl bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-300 hover:scale-110" aria-label="Envoyer un email">
                                <Mail size={18} />
                            </a>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-2xl bg-green-50 border border-green-100">
                        <p className="flex items-center justify-center gap-3 font-black text-2xl mb-2" style={{color: '#2B5F4C'}}>
                            <CheckCircle size={24} />
                            {completedSitesCount}
                        </p>
                        <p className="text-sm font-semibold text-green-600 uppercase tracking-wider">Terminés</p>
                    </div>
                    <div className="text-center p-4 rounded-2xl bg-yellow-50 border border-yellow-100">
                        <p className="flex items-center justify-center gap-3 font-black text-2xl mb-2 text-yellow-600">
                            <Wrench size={24} />
                            {otherSitesCount}
                        </p>
                        <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wider">Autres</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// MODIFICATION : La page reçoit la liste des chantiers (sites)
const ClientsPage = ({ clients, sites, colors, onClientClick, onAddClient }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    const filteredClients = useMemo(() => 
        clients.filter(client => 
            client.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), 
        [clients, searchTerm]
    );

    const paginatedClients = filteredClients.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);

    return (
        <div className="h-full flex flex-col" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2" style={{color: '#222222'}}>Clients</h1>
                    <p className="text-lg text-gray-600 font-light">Gérez votre portefeuille clients</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Rechercher un client..." 
                            value={searchTerm} 
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                            className="pl-12 pr-6 py-4 border border-gray-200 rounded-2xl w-80 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 font-medium shadow-sm hover:shadow-md"/>
                    </div>
                    <button 
                        onClick={onAddClient} 
                        className="flex items-center gap-3 px-6 py-4 text-white rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 shadow-md"
                        style={{background: 'linear-gradient(135deg, #2B5F4C 0%, #22C55E 100%)'}}
                    >
                        <Plus size={20}/>
                        <span className="font-medium">Nouveau client</span>
                    </button>
                </div>
            </div>
            
            <div className="flex-grow">
                {filteredClients.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {paginatedClients.map(client => 
                            // MODIFICATION : On passe la liste des chantiers à chaque carte
                            <ClientCard 
                                key={client.id} 
                                client={client} 
                                sites={sites} 
                                onClientClick={onClientClick}
                            />
                        )}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                        <p className="text-gray-500">Aucun client trouvé.</p>
                    </div>
                )}
            </div>
            
            {totalPages > 1 && (
                <div className="flex items-center justify-between py-3 mt-4">
                    <span className="text-sm text-gray-700">Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span></span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronsLeft size={18}/></button>
                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={18}/></button>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={18}/></button>
                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronsRight size={18}/></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientsPage;
