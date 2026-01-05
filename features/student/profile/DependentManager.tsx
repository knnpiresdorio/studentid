import React from 'react';
import { AlertTriangle, Sparkles, ChevronLeft, Link as LinkIcon, Edit, Trash2, Plus, User } from 'lucide-react';
import { Student, Dependent } from '../../../types';

interface DependentManagerProps {
    studentData: Student;
    dependents: Dependent[];
    hasFamilyCombo: boolean;
    showUpsell: boolean;
    onSnoozeUpsell: () => void;
    onAddDependentClick: () => void;
    onEditDependent: (dep: Dependent) => void;
    onDeleteDependent: (e: React.MouseEvent, dep: Dependent) => void;
    onViewCard: (dep: Dependent) => void;
    isDependentUser: boolean;
}

export const DependentManager: React.FC<DependentManagerProps> = ({
    studentData,
    dependents,
    hasFamilyCombo,
    showUpsell,
    onSnoozeUpsell,
    onAddDependentClick,
    onEditDependent,
    onDeleteDependent,
    onViewCard,
    isDependentUser
}) => {
    if (isDependentUser) {
        return (
            <div className="flex flex-col items-center justify-center py-20 opacity-60">
                <div className="bg-slate-100 rounded-full p-4 mb-4">
                    <User size={32} className="text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-700">Acesso Restrito</h3>
                <p className="text-sm text-slate-500">Apenas o titular da conta pode gerenciar dependentes.</p>
            </div>
        );
    }

    const dependentsCount = dependents.length;

    return (
        <div className="space-y-8 animate-enter-slide-up pb-32">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">Meus Dependentes</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Gerencie quem utiliza seus benefícios</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800/30 shadow-sm">{dependentsCount}/5 Ocupados</div>
            </div>

            {/* INACTIVE ALERT */}
            {!studentData.isActive && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-2xl p-4 flex gap-3 text-red-600 dark:text-red-400 mb-6">
                    <AlertTriangle className="shrink-0" size={20} />
                    <div>
                        <p className="font-bold text-sm">Conta Inativa</p>
                        <p className="text-xs mt-1">Sua conta está inativa, portanto o acesso dos dependentes também está suspenso. Entre em contato com a secretaria.</p>
                    </div>
                </div>
            )}

            {/* BANNERS LOGIC */}
            {(!hasFamilyCombo && dependentsCount >= 2 && showUpsell) ? (
                <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-xl text-center border-4 border-slate-800 animate-fade-in">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1 mb-6">
                            <Sparkles size={12} className="text-amber-400" fill="currentColor" />
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Limite Gratuito Atingido</span>
                        </div>

                        <h3 className="text-2xl font-black text-white italic mb-4 leading-none font-display">
                            DESBLOQUEIE O<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">COMBO FAMÍLIA</span>
                        </h3>

                        <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                            O seu plano atual permite até 2 dependentes. Faz o upgrade e desfrute de 3 slots adicionais com descontos exclusivos para toda a casa.
                        </p>

                        <div className="w-full space-y-3">
                            <button className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
                                ATIVAR COMBO FAMILIA
                                <ChevronLeft size={16} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={onSnoozeUpsell}
                                className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs hover:bg-slate-700 hover:text-white transition-all uppercase tracking-wider"
                            >
                                Talvez mais tarde
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                dependentsCount < 2 && (
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 rounded-3xl p-6 flex gap-4">
                        <div className="shrink-0">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <span className="font-bold text-lg">i</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-1">Importante: Conforme as regras da sua instituição, tem direito a 2 dependentes gratuitos.</h4>
                            <p className="text-xs text-blue-700 dark:text-blue-300/80 leading-relaxed">
                                Slots extra (até 3) requerem o Combo Familia. Todas as inclusões passam pela moderação da secretaria.
                            </p>
                        </div>
                    </div>
                )
            )}

            <div className="space-y-4">
                {dependents.map((dep, index) => {
                    const isPaid = index >= 3;
                    return (
                        <div key={dep.id} className={`group bg-white dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-white/10 flex items-center justify-between cursor-pointer hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-black/50 hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-[0.99] ${!studentData.isActive ? 'opacity-60 grayscale cursor-not-allowed pointer-events-none' : ''}`} onClick={() => !studentData?.isActive ? null : onViewCard(dep)}>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img src={dep.photoUrl || 'https://via.placeholder.com/100'} className="w-12 h-12 rounded-full object-cover bg-slate-200 dark:bg-slate-700 ring-2 ring-white dark:ring-white/10 shadow-sm" alt={dep.name} />
                                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full shadow-md">
                                        <LinkIcon size={8} />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dep.name}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{dep.cpf} • {dep.relation}</p>
                                    <p className="text-[10px] text-blue-500 dark:text-blue-400 font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0">Ver Carteirinha →</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${isPaid ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>{isPaid ? 'Pago' : 'Grátis'}</span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditDependent(dep);
                                        }}
                                        className="text-slate-300 dark:text-slate-600 hover:text-blue-500 dark:hover:text-blue-400 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                        title="Editar Dados"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={(e) => onDeleteDependent(e, dep)} className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" title="Solicitar Exclusão">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {dependentsCount < 5 && studentData.isActive && (
                    <div className="fixed bottom-24 left-4 right-4 z-40 lg:static lg:bottom-auto lg:left-auto lg:right-auto lg:z-auto">
                        <button onClick={onAddDependentClick} className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-blue-600 text-white font-bold text-sm shadow-xl shadow-slate-900/20 dark:shadow-blue-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-slate-800 dark:border-blue-500">
                            <Plus size={20} /> Adicionar Dependente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
