import React, { useState } from 'react';
import { Edit, Trash2, Store, Users, PauseCircle, PlayCircle } from 'lucide-react';
import { Partner } from '../../types';
import { Badge } from '../../components/ui/Badge';

interface PartnerGridProps {
    partners: Partner[];
    onEdit: (partner: Partner) => void;
    onToggleStatus: (partner: Partner) => void;
    onPreview: (partner: Partner) => void;
    onResetPassword: (partner: Partner) => void;
    onDeleteRequest: (partner: Partner) => void;
}

export const PartnerGrid: React.FC<PartnerGridProps> = ({
    partners,
    onEdit,
    onToggleStatus,
    onPreview,
    onResetPassword,
    onDeleteRequest
}) => {
    const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-20 custom-scrollbar">
            {partners.map(partner => (
                <div key={partner.id} className={`group relative bg-slate-950 rounded-2xl border border-white/5 p-5 hover:border-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/10 ${!partner.isActive ? 'opacity-60 grayscale-[50%]' : ''}`}>
                    {/* Actions Menu */}
                    <div className="absolute top-5 right-5 z-10">
                        <div className="relative">
                            <button
                                onClick={() => setActiveActionMenu(activeActionMenu === partner.id ? null : partner.id)}
                                className="p-1.5 rounded-lg bg-slate-950/50 text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                            >
                                <div className="flex gap-0.5">
                                    <div className="w-1 h-1 bg-current rounded-full" />
                                    <div className="w-1 h-1 bg-current rounded-full" />
                                    <div className="w-1 h-1 bg-current rounded-full" />
                                </div>
                            </button>

                            {activeActionMenu === partner.id && (
                                <>
                                    <div
                                        className="fixed inset-0 z-[40]"
                                        onClick={() => setActiveActionMenu(null)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-xl border border-white/10 overflow-hidden z-[50] animate-in fade-in zoom-in-95 duration-200">
                                        <button onClick={() => { onToggleStatus(partner); setActiveActionMenu(null); }} className="w-full text-left px-4 py-3 text-sm font-medium text-white hover:bg-white/5 flex items-center gap-2">
                                            {partner.isActive ? (
                                                <>
                                                    <PauseCircle size={16} className="text-red-400" />
                                                    Desativar Parceria
                                                </>
                                            ) : (
                                                <>
                                                    <PlayCircle size={16} className="text-emerald-400" />
                                                    Ativar Parceria
                                                </>
                                            )}
                                        </button>
                                        <button onClick={() => { onEdit(partner); setActiveActionMenu(null); }} className="w-full text-left px-4 py-3 text-sm font-medium text-white hover:bg-white/5 flex items-center gap-2">
                                            <Edit size={16} className="text-blue-400" />
                                            Editar Dados
                                        </button>
                                        <button onClick={() => { onPreview(partner); setActiveActionMenu(null); }} className="w-full text-left px-4 py-3 text-sm font-medium text-white hover:bg-white/5 flex items-center gap-2">
                                            <Store size={16} className="text-purple-400" />
                                            Pré-visualizar
                                        </button>
                                        <button onClick={() => { onResetPassword(partner); setActiveActionMenu(null); }} className="w-full text-left px-4 py-3 text-sm font-medium text-white hover:bg-white/5 flex items-center gap-2">
                                            <Users size={16} className="text-amber-400" />
                                            Resetar Senha Admin
                                        </button>
                                        <div className="h-px bg-white/10 my-1" />
                                        <button onClick={() => { onDeleteRequest(partner); setActiveActionMenu(null); }} className="w-full text-left px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                                            <Trash2 size={16} />
                                            Solicitar Exclusão
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-slate-950 border border-white/10 p-1 shrink-0 overflow-hidden">
                            <img
                                src={partner.logoUrl}
                                className="w-full h-full object-cover rounded-lg"
                                alt={partner.name}
                            />
                        </div>
                        <div className="pr-8">
                            <h4 className="font-bold text-white text-lg leading-tight mb-1">{partner.name}</h4>
                            <Badge variant="indigo">
                                {partner.category}
                            </Badge>
                        </div>
                    </div>

                    <div className="bg-slate-950/50 rounded-xl p-3 border border-white/5 mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-slate-500 font-bold uppercase">Desconto</span>
                            <span className={`text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-xs border border-emerald-500/20 ${!partner.isActive ? 'text-slate-500 bg-slate-800 border-slate-700' : ''}`}>{partner.discount}</span>
                        </div>
                        <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
                            <div className={`bg-indigo-500 h-full rounded-full ${!partner.isActive ? 'bg-slate-600' : ''}`} style={{ width: '100%' }}></div>
                        </div>
                        <p className={`text-[10px] text-center mt-2 font-medium ${partner.isActive ? 'text-indigo-400' : 'text-red-400'}`}>
                            {partner.isActive ? 'Parceria Ativa' : 'Parceria Pausada'}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
