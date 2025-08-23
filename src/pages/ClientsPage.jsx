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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col hover:shadow-md transition-shadow duration-300">
            <div onClick={() => onClientClick(client)} className="cursor-pointer flex flex-col flex-grow">
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-gray-800 font-['Poppins']">{client.name}</h3>
                        <div className="flex items-center gap-2">
                            <a href={`tel:${client.phone}`} onClick={e => e.stopPropagation()} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" aria-label="Téléphoner">
                                <Phone size={16} />
                            </a>
                            <a href={`mailto:${client.email}`} onClick={e => e.stopPropagation()} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" aria-label="Envoyer un email">
                                <Mail size={16} />
                            </a>
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-around">
                    <div className="text-center p-2 rounded-lg w-full">
                        <p className="flex items-center justify-center gap-2 font-bold text-xl text-green-600"><CheckCircle size={20} />{completedSitesCount}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Terminés</p>
                    </div>
                    <div className="text-center p-2 rounded-lg w-full">
                        <p className="flex items-center justify-center gap-2 font-bold text-xl text-yellow-600"><Wrench size={20} />{otherSitesCount}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Autres</p>
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
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 font-['Poppins']">Clients</h1>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Rechercher un client..." 
                            value={searchTerm} 
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-primary"/>
                    </div>
                    <button onClick={onAddClient} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors bg-primary">
                        <Plus size={20}/>Nouveau client
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
