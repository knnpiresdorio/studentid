import React, { useState } from 'react';
import {
    ChevronLeft,
    MapPin,
    Store,
    Tag,
    Megaphone,
    Phone,
    Instagram,
    Facebook,
    Video, // Fallback for TikTok if specific icon not available, or use SVG
    Check
} from 'lucide-react';
import { Partner } from '../../types';

interface PartnerDetailCardProps {
    partner: Partner;
    onClose?: () => void;
    isEmbedded?: boolean;
    // userHistory: ChangeRequest[]; // Future: Receive history to calculate status
}

/**
 * Detailed view of a partner.
 * Used in StudentView and Admin Preview.
 */
export const PartnerDetailCard: React.FC<PartnerDetailCardProps> = ({ partner, onClose, isEmbedded }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyPhone = () => {
        if (partner.phoneNumber) {
            navigator.clipboard.writeText(partner.phoneNumber);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const showPhone = partner.phoneNumber && partner.socialVisibility?.phone !== false;

    return (
        <div className={`${isEmbedded ? 'relative w-full h-full bg-slate-900 rounded-b-3xl lg:rounded-3xl pb-28 lg:pb-0 overflow-y-auto' : 'fixed inset-0 z-[60] lg:static lg:z-auto bg-slate-950/95 lg:bg-slate-900 backdrop-blur-3xl min-h-screen lg:min-h-0 lg:h-full lg:rounded-3xl overflow-y-auto lg:overflow-visible'} animate-fade-in text-slate-200`}>
            {/* Header / Banner - Reduced height */}
            <div className="relative h-36 w-full">
                {/* Banner Image with Overlay */}
                <div className="absolute inset-0">
                    {partner.bannerUrl ? (
                        <img
                            src={partner.bannerUrl}
                            alt={partner.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-indigo-600"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
                </div>

                {/* Top Navigation Bar */}
                <div className={`absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20 ${isEmbedded && !onClose ? 'hidden' : ''}`}>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/5 shadow-lg group active:scale-95"
                        >
                            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    )}
                    <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wider border border-white/10 shadow-lg">
                        {partner.category}
                    </div>
                </div>

                {/* Overlapping Logo - Floating Effect */}
                <div className="absolute -bottom-10 left-6 z-30">
                    <div className="w-24 h-24 bg-white rounded-3xl p-1 shadow-2xl shadow-black/50 transform rotate-3">
                        <img
                            src={partner.logoUrl || 'https://via.placeholder.com/150'}
                            alt="Logo"
                            className="w-full h-full object-cover rounded-2xl bg-white bg-slate-100" // Added bg-slate-100 fallback
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="px-6 pt-12 pb-24">

                {/* 1. Header Info */}
                <div className="mb-8 pl-1">
                    <h1 className="text-2xl font-black text-white leading-none mb-2 font-display">{partner.name}</h1>
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                        <MapPin size={14} className="text-blue-500 shrink-0" />
                        <span>{partner.address}</span>
                    </div>
                </div>

                {/* 2. Main Benefit Card - Restored Green Highlights */}
                <div className="mb-10 group">
                    <div className="relative overflow-hidden rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/10 backdrop-blur-sm">
                        {/* Glow Effect Restored */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-xl opacity-50 group-hover:opacity-75 transition-opacity pointer-events-none"></div>

                        <div className="relative p-5 flex items-center justify-between">
                            <div>
                                <h3 className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Benefício Estudante</h3>
                                <p className="text-2xl font-bold text-white tracking-tight">{partner.discount}</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30 text-emerald-300 group-hover:scale-110 transition-transform shadow-inner">
                                <Tag size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. About Section */}
                <div className="mb-10 space-y-4">
                    <h3 className="font-bold text-white flex items-center gap-2 text-base">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Store size={16} />
                        </div>
                        Sobre o Parceiro
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed font-light pl-2 border-l-2 border-slate-800">
                        {partner.description}
                    </p>
                </div>

                {/* 4. Promotions Section - Restored Purple Highlights */}
                {/* 4. Promotions Section - Restored Purple Highlights */}
                {(() => {
                    const visiblePromotions = partner.activePromotions?.filter(p => p.isActive !== false) || [];

                    if (visiblePromotions.length === 0) return null;

                    return (
                        <div className="mb-10 space-y-4">
                            <h3 className="font-bold text-white flex items-center gap-2 text-base">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                                    <Megaphone size={16} />
                                </div>
                                Promoções Ativas
                            </h3>
                            <div className="space-y-3">
                                {visiblePromotions.map((promo, idx) => {
                                    // Logic to deduce availability would be here if we had the history prop
                                    // For now we just display the limits

                                    const limitLabel = {
                                        'UNLIMITED': 'Uso Ilimitado',
                                        'MONTHLY': '1x ao Mês',
                                        'ONCE': 'Resgate Único'
                                    };

                                    return (
                                        <div key={promo.id || idx} className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-purple-500/10 transition-colors backdrop-blur-sm group/promo">
                                            <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-purple-300 shrink-0">
                                                <Tag size={16} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-purple-200 font-bold text-sm leading-snug">{promo.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                                        {limitLabel[promo.limit]}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}

                {/* 5. Bottom Actions */}
                <div className="space-y-4 mt-auto">
                    {/* Social Media Row */}
                    {(partner.instagramUrl || partner.facebookUrl || partner.tiktokUrl) && (
                        <div className="flex justify-center gap-4 pb-4 border-b border-white/5">
                            {partner.instagramUrl && (
                                <a href={partner.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 border border-white/10 text-slate-400 hover:text-pink-500 hover:border-pink-500/50 transition-all">
                                    <Instagram size={18} />
                                </a>
                            )}
                            {partner.facebookUrl && (
                                <a href={partner.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 border border-white/10 text-slate-400 hover:text-blue-500 hover:border-blue-500/50 transition-all">
                                    <Facebook size={18} />
                                </a>
                            )}
                            {partner.tiktokUrl && (
                                <a href={partner.tiktokUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-white/50 transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                                </a>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 text-sm border border-slate-700 transition-all active:scale-[0.98]">
                            <MapPin size={18} className="text-blue-400" /> Ver Mapa
                        </button>

                        {showPhone ? (
                            <button
                                onClick={handleCopyPhone}
                                className={`flex items-center justify-center gap-2 py-4 font-bold rounded-xl text-sm border transition-all active:scale-[0.98] ${copied
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50'
                                    : 'bg-slate-800 text-white hover:bg-slate-700 border-slate-700'
                                    }`}
                            >
                                {copied ? <Check size={18} /> : <Phone size={18} className="text-emerald-400" />}
                                {copied ? 'Copiado!' : 'Contato'}
                            </button>
                        ) : (
                            <div className="hidden"></div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
