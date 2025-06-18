import React, { useState, useMemo } from 'react';
import { Search, Info, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Plus } from 'lucide-react';
import DateRangePicker from '../components/DateRangePicker.jsx';

const SitesListPage = ({ sites, colors, onSiteClick, onAddSite }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [teamFilter, setTeamFilter] = useState('');
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;
    const uniqueStatuses = useMemo(() => [...new Set(sites.map(site => site.status))], [sites]);
    const uniqueTeams = useMemo(() => [...new Set(sites.map(site => site.team))], [sites]);
    const filteredSites = useMemo(() => sites.filter(site => {
        const siteDate = new Date(site.date);
        const start = dateRange.start;
        const end = dateRange.end;
        if(start) start.setHours(0,0,0,0);
        if(end) end.setHours(23,59,59,999);
        return ((site.name.toLowerCase().includes(searchTerm.toLowerCase()) || site.client.toLowerCase().includes(searchTerm.toLowerCase())) && (!statusFilter || site.status === statusFilter) && (!teamFilter || site.team === teamFilter) && (!start || siteDate >= start) && (!end || siteDate <= end));
    }), [sites, searchTerm, statusFilter, teamFilter, dateRange]);
    const paginatedSites = filteredSites.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filteredSites.length / ITEMS_PER_PAGE);
    const StatusPill = ({ status }) => {
        const style = { 'À venir': `bg-[${colors.accent}] bg-opacity-20 text-yellow-800`, 'En cours': `bg-[${colors.success}] bg-opacity-20 text-green-800`, 'Terminé': `bg-gray-200 text-gray-700`, 'Problème': `bg-[${colors.danger}] bg-opacity-20 text-red-800`, 'Annulé': `bg-red-100 text-red-700`};
        return <span className={`px-3 py-1 text-xs font-bold rounded-full ${style[status] || 'bg-gray-200 text-gray-700'}`}>{status}</span>;
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-[${colors.neutralDark}] font-['Poppins']">Liste des chantiers</h1>
                <div className="flex items-center gap-4">
                    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-[${colors.primary}]"/></div>
                    <button onClick={onAddSite} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors" style={{backgroundColor: colors.primary}}><Plus size={20}/>Nouveau chantier</button>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="p-2 border border-gray-300 rounded-lg text-sm"><option value="">Tous les statuts</option>{uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
                <select value={teamFilter} onChange={e => { setTeamFilter(e.target.value); setCurrentPage(1); }} className="p-2 border border-gray-300 rounded-lg text-sm"><option value="">Toutes les équipes</option>{uniqueTeams.map(t => <option key={t} value={t}>{t}</option>)}</select>
                <DateRangePicker onDateChange={(start, end) => setDateRange({ start, end })} colors={colors} />
            </div>
            <div className="flex-grow bg-white rounded-xl shadow-sm overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0"><tr><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom du chantier</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de début</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th><th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedSites.map((site) => (
                            <tr key={site.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{site.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{site.client}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(site.date).toLocaleDateString('fr-FR')}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusPill status={site.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onSiteClick(site)} className="flex items-center gap-2 text-white p-2 rounded-md text-xs" style={{backgroundColor: colors.primary}}><Info size={14}/>Infos Chantier</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-700">Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span></span>
                <div className="flex items-center gap-1"><button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronsLeft size={18}/></button><button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={18}/></button><button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={18}/></button><button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronsRight size={18}/></button></div>
            </div>
        </div>
    );
};

export default SitesListPage;
