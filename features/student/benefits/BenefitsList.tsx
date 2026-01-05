import React from 'react';
import { Search, Heart, Store, MapPin } from 'lucide-react';
import { Partner } from '../../../types';

interface BenefitsListProps {
    partners: Partner[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    showFavoritesOnly: boolean;
    onToggleFavoritesOnly: () => void;
    favorites: string[];
    onToggleFavorite: (e: React.MouseEvent, partnerId: string) => void;
    onSelectPartner: (partner: Partner) => void;
}

export const BenefitsList: React.FC<BenefitsListProps> = ({
    partners,
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    showFavoritesOnly,
    onToggleFavoritesOnly,
    favorites,
    onToggleFavorite,
    onSelectPartner
}) => {
    const categories = ['Todos', ...Array.from(new Set(partners.map(p => p.category)))];

    const filteredPartners = partners.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
        const matchesFavorite = !showFavoritesOnly || favorites.includes(p.id);

        return matchesSearch && matchesCategory && matchesFavorite;
    });

    return (
        <div className="space-y-6 animate-enter-slide-up">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Clube de Vantagens</h2>
            {/* Filters & Search */}
            <div className="space-y-4">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Buscar benefícios..."
                        className="w-full pl-11 pr-4 py-4 rounded-2xl border-none shadow-sm bg-white dark:bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all font-medium"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    <Search className="absolute left-4 top-4 text-slate-400 dark:text-slate-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                </div>

                {/* Categories & Favorites Toggle */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <button
                        onClick={onToggleFavoritesOnly}
                        className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${showFavoritesOnly ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 border border-pink-200 dark:border-pink-800' : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 border border-slate-100 dark:border-white/10'}`}
                    >
                        <Heart size={16} className={showFavoritesOnly ? 'fill-current' : ''} />
                        Favoritos
                    </button>
                    <div className="w-[1px] h-8 bg-slate-200 dark:bg-white/10 mx-1 self-center"></div>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => onCategoryChange(cat)}
                            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-md transform scale-105' : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 border border-slate-100 dark:border-white/10'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4 pt-2">
                <div className="flex justify-between items-end px-1">
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">Parceiros</h3>
                    <span className="text-xs text-slate-500 font-medium">{filteredPartners.length} encontrados</span>
                </div>

                {filteredPartners.length === 0 ? (
                    <div className="text-center py-16 opacity-50 bg-white dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                        <Store size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum parceiro encontrado com estes filtros.</p>
                        <button onClick={() => { onSearchChange(''); onCategoryChange('Todos'); if (showFavoritesOnly) onToggleFavoritesOnly(); }} className="mt-4 text-blue-600 font-bold text-sm hover:underline">Limpar filtros</button>
                    </div>
                ) : (
                    filteredPartners.map(partner => (
                        <div key={partner.id} onClick={() => onSelectPartner(partner)} className="group bg-white dark:bg-white/5 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-100 dark:border-white/10 flex flex-col cursor-pointer hover:shadow-xl hover:translate-y-[-2px] transition-all overflow-hidden relative">

                            {/* Background Banner */}
                            {partner.bannerUrl && (
                                <div
                                    className="absolute inset-0 z-0 bg-cover bg-center opacity-[0.15] dark:opacity-[0.1]"
                                    style={{ backgroundImage: `url(${partner.bannerUrl})` }}
                                />
                            )}

                            {/* Header / Promotions Count Badge */}
                            <div className="flex justify-between items-start pt-5 px-5 relative z-10">
                                <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pr-4">{partner.name}</h4>
                                {(partner.activePromotions?.length || 0) > 0 && (
                                    <div className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-l-lg shadow-sm -mr-5 mt-1">
                                        {partner.activePromotions?.length} promoções
                                    </div>
                                )}
                            </div>

                            {/* Body */}
                            <div className="flex gap-4 p-5 pt-3 relative z-10">
                                {/* Logo */}
                                <div className="relative shrink-0 w-24 h-24">
                                    <img src={partner.logoUrl} alt={partner.name} className="w-full h-full rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 shadow-inner" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 flex flex-col">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-auto">{partner.description}</p>

                                    <div className="flex items-end justify-between mt-3">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{partner.category}</p>
                                            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-500 font-medium">
                                                <MapPin size={12} className="shrink-0 text-slate-400" />
                                                <span className="truncate max-w-[140px]">{partner.address}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => onToggleFavorite(e, partner.id)}
                                            className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 ${favorites.includes(partner.id) ? 'bg-pink-100 text-pink-500' : 'bg-slate-100 text-slate-400 hover:bg-pink-50 hover:text-pink-400'}`}
                                        >
                                            <Heart size={18} className={favorites.includes(partner.id) ? 'fill-current' : ''} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Footer / Discount */}
                            {partner.discount && (
                                <div className="bg-emerald-500 w-full py-2 px-5 flex items-center gap-2 relative z-10">
                                    <span className="text-white font-bold text-sm">{partner.discount}</span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
