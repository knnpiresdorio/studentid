import React from 'react';
import { Ticket, Plus, Eye, EyeOff } from 'lucide-react';
import { Partner, Promotion, PromotionUsageLimit } from '../../../types';

interface PromotionManagerProps {
    partner: Partner;
    onAddPromotion: () => void;
    onToggleStatus: (index: number) => void;
    onUpdatePromotion: (index: number, field: keyof Promotion, value: any) => void;
}

export const PromotionManager: React.FC<PromotionManagerProps> = ({
    partner,
    onAddPromotion,
    onToggleStatus,
    onUpdatePromotion
}) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                    <Ticket size={20} className="text-purple-500" /> Promoções & Campanhas
                </h3>
                <button
                    onClick={onAddPromotion}
                    className="text-indigo-600 dark:text-indigo-400 font-bold text-sm bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                    <Plus size={16} /> Adicionar
                </button>
            </div>

            <div className="space-y-4">
                {partner.activePromotions?.map((promo, idx) => (
                    <div key={promo.id || idx} className={`bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-end transition-all ${promo.isActive === false ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                        <div className="flex-1 w-full">
                            <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Título da Promoção {promo.isActive === false && '(Oculta)'}</label>
                            <input
                                type="text"
                                value={promo.title}
                                onChange={(e) => onUpdatePromotion(idx, 'title', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-200 dark:focus:ring-purple-900/30 outline-none"
                                placeholder="Ex: Leve 3 Pague 2"
                                disabled={promo.isActive === false}
                            />
                        </div>
                        <div className="w-full md:w-1/3">
                            <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Limite de Uso</label>
                            <select
                                value={promo.limit}
                                onChange={(e) => onUpdatePromotion(idx, 'limit', e.target.value as PromotionUsageLimit)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-200 dark:focus:ring-purple-900/30 outline-none"
                                disabled={promo.isActive === false}
                            >
                                <option value="UNLIMITED">Uso Ilimitado</option>
                                <option value="MONTHLY">1x por Mês</option>
                                <option value="ONCE">Uso Único (Por Membro)</option>
                            </select>
                        </div>
                        <button
                            onClick={() => onToggleStatus(idx)}
                            className={`p-2 rounded-lg transition-colors self-end ${promo.isActive === false
                                ? 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                                : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                }`}
                            title={promo.isActive === false ? "Reativar Promoção" : "Ocultar Promoção"}
                        >
                            {promo.isActive === false ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                    </div>
                ))}
                {(!partner.activePromotions || partner.activePromotions.length === 0) && (
                    <p className="text-center text-slate-400 text-sm py-4 italic">Nenhuma promoção ativa no momento.</p>
                )}
            </div>
        </div>
    );
};
