import React, { useState, useMemo } from 'react';
import { Search, Phone, Mail, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Plus } from 'lucide-react';

const ClientCard = ({ client, sites, onClientClick }) => {
    return (
        <div 
            className="bg-white rounded-xl shadow-md border border-gray-100 p-4 hover:shadow-lg hover:border-green-200 transition-all duration-200 group cursor-pointer"
            style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
            onClick={() => onClientClick(client)}
        >
            {/* En-tête avec nom et actions */}
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 truncate mb-1">{client.name}</h3>
                    <div className="flex flex-col gap-1 text-sm text-gray-500">
                        {client.email && (
                            <div className="flex items-center gap-1 truncate">
                                <Mail size={12} />
                                <span className="truncate">{client.email}</span>
                            </div>
                        )}
                        {client.phone && (
                            <div className="flex items-center gap-1">
                                <Phone size={12} />
                                <span>{client.phone}</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Actions rapides */}
                <div className="flex items-center gap-1 ml-2">
                    {client.phone && (
                        <a 
                            href={`tel:${client.phone}`} 
                            onClick={e => e.stopPropagation()} 
                            className="p-2 rounded-lg bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-600 transition-colors" 
                            aria-label="Téléphoner"
                        >
                            <Phone size={14} />
                        </a>
                    )}
                    {client.email && (
                        <a 
                            href={`mailto:${client.email}`} 
                            onClick={e => e.stopPropagation()} 
                            className="p-2 rounded-lg bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors" 
                            aria-label="Envoyer un email"
                        >
                            <Mail size={14} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

// MODIFICATION : La page reçoit la liste des chantiers (sites)
const ClientsPage = ({ clients, sites, colors, onClientClick, onAddClient }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1" style={{color: '#222222'}}>Clients</h1>
                    <p className="text-gray-600">Gérez votre portefeuille clients</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Rechercher un client..." 
                            value={searchTerm} 
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-medium shadow-sm"/>
                    </div>
                    <button 
                        onClick={onAddClient} 
                        className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg font-medium transition-all hover:shadow-md"
                        style={{background: 'linear-gradient(135deg, #2B5F4C 0%, #22C55E 100%)'}}
                    >
                        <Plus size={18}/>
                        Nouveau client
                    </button>
                </div>
            </div>
            
            <div className="flex-grow">
                {filteredClients.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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
