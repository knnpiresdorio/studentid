import React, { useState } from 'react';
import { Partner } from '../../../types';
import { PartnerDetailCard } from '../../partner/PartnerDetailCard';
import { Search, MapPin, School as SchoolIcon, PieChart } from 'lucide-react';

interface PartnerDirectoryProps {
    partners: Partner[];
    searchTerm: string;
    onSearchChange: (val: string) => void;
    uniqueStates: string[];
    uniqueCities: string[];
    uniqueCategories: string[];
    partnerFilters: {
        state: string;
        city: string;
        category: string;
    };
    onFilterChange: (filters: any) => void;
    getLinkedSchoolName: (schoolId: string) => string;
}

export const PartnerDirectory: React.FC<PartnerDirectoryProps> = ({
    partners,
    searchTerm,
    onSearchChange,
    uniqueStates,
    uniqueCities,
    uniqueCategories,
    partnerFilters,
    onFilterChange,
    getLinkedSchoolName
}) => {
    const [partnerTab, setPartnerTab] = useState<'list' | 'dashboard'>('list');
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

    // Filtering logic (moved from AdminDashboard if possible, but keep it simple for now)
    const filteredPartners = partners.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesState = partnerFilters.state === 'TODOS' || p.state === partnerFilters.state;
        const matchesCity = partnerFilters.city === 'TODAS' || p.city === partnerFilters.city;
        const matchesCategory = partnerFilters.category === 'TODAS' || p.category === partnerFilters.category;
        return matchesSearch && matchesState && matchesCity && matchesCategory;
    });

    const totalPartners = partners.length;

    return (
        <div className="relative animate-fade-in space-y-6">
            {/* Partners Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {partnerTab === 'list' && (
                    <div className="flex gap-2 flex-wrap items-center">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar parceiro..."
                                className="pl-9 pr-4 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50 outline-none w-64 text-white placeholder-slate-500"
                                value={searchTerm}
                                onChange={e => onSearchChange(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                        </div>
                        <select
                            className="px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-300 cursor-pointer"
                            value={partnerFilters.state}
                            onChange={e => onFilterChange({ ...partnerFilters, state: e.target.value })}
                        >
                            <option value="TODOS" className="bg-slate-900">Todos os Estados</option>
                            {uniqueStates.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                        </select>
                        <select
                            className="px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-300 cursor-pointer"
                            value={partnerFilters.city}
                            onChange={e => onFilterChange({ ...partnerFilters, city: e.target.value })}
                        >
                            <option value="TODAS" className="bg-slate-900">Todas as Cidades</option>
                            {uniqueCities.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                        </select>
                        <select
                            className="px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-300 cursor-pointer"
                            value={partnerFilters.category}
                            onChange={e => onFilterChange({ ...partnerFilters, category: e.target.value })}
                        >
                            <option value="TODAS" className="bg-slate-900">Todas as Categorias</option>
                            {uniqueCategories.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                        </select>
                    </div>
                )}

                <div className="flex bg-slate-900/60 rounded-lg p-1 border border-white/10 ml-auto">
                    <button
                        onClick={() => setPartnerTab('list')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${partnerTab === 'list' ? 'bg-blue-600 text-white shadow shadow-blue-500/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        Lista de Parceiros
                    </button>
                    <button
                        onClick={() => setPartnerTab('dashboard')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${partnerTab === 'dashboard' ? 'bg-blue-600 text-white shadow shadow-blue-500/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        Dashboard & BI
                    </button>
                </div>
            </div>

            {partnerTab === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedPartner && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                            <div className="w-full max-w-md bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative border border-white/10">
                                <PartnerDetailCard partner={selectedPartner} onClose={() => setSelectedPartner(null)} />
                            </div>
                        </div>
                    )}

                    {filteredPartners.map(partner => (
                        <div
                            key={partner.id}
                            className="bg-slate-900/40 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/10 flex gap-4 cursor-pointer hover:bg-slate-800/60 transition-all hover:-translate-y-1 relative group"
                            onClick={() => setSelectedPartner(partner)}
                        >
                            <img src={partner.logoUrl} className="w-20 h-20 rounded-lg object-cover bg-slate-800 border border-white/10" alt={partner.name} />
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">{partner.name}</h4>
                                    <span className="bg-green-500/20 text-green-400 border border-green-500/20 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">{partner.discount}</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1 mb-2">{partner.category}</p>

                                {/* Location & School Badges */}
                                <div className="flex flex-wrap gap-2">
                                    {(partner.city || partner.state) && (
                                        <span className="flex items-center gap-1 text-[10px] bg-slate-950/50 text-slate-400 px-2 py-1 rounded border border-white/10">
                                            <MapPin size={10} /> {partner.city}/{partner.state}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/10 font-medium">
                                        <SchoolIcon size={10} /> {getLinkedSchoolName(partner.schoolId)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredPartners.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            <p>Nenhum parceiro encontrado com os filtros atuais.</p>
                        </div>
                    )}
                </div>
            )}

            {partnerTab === 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                    {/* Chart 1: Partners by Category */}
                    <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <PieChart size={120} className="text-white transform rotate-12" />
                        </div>
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-400 border border-purple-500/20 shadow-lg shadow-purple-900/20"><PieChart size={20} /></div>
                            <h3 className="font-bold text-white text-lg">Parceiros por Categoria</h3>
                        </div>
                        <div className="space-y-4 relative z-10">
                            {uniqueCategories.map(cat => {
                                const count = partners.filter(p => p.category === cat).length;
                                const percentage = totalPartners > 0 ? (count / totalPartners) * 100 : 0;
                                return (
                                    <div key={cat}>
                                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                                            <span>{cat}</span>
                                            <span>{count} ({percentage.toFixed(0)}%)</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-slate-950/50 rounded-full overflow-hidden border border-white/5">
                                            <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Chart 2: Top Locations */}
                    <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <MapPin size={120} className="text-white transform -rotate-12" />
                        </div>
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-900/20"><MapPin size={20} /></div>
                            <h3 className="font-bold text-white text-lg">Principais Localizações</h3>
                        </div>
                        <div className="space-y-4 relative z-10">
                            {uniqueCities.map(city => {
                                const count = partners.filter(p => p.city === city).length;
                                const percentage = totalPartners > 0 ? (count / totalPartners) * 100 : 0;
                                return (
                                    <div key={city}>
                                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                                            <span>{city}</span>
                                            <span>{count} parceiros</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-slate-950/50 rounded-full overflow-hidden border border-white/5">
                                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.4)]" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
