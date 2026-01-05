import React from 'react';
import { ScanLine, CheckCircle, Calendar, History, Ticket, Store, XCircle } from 'lucide-react';
import { Student, Partner, AuditLog, MemberType } from '../../../types';

interface ScannerViewProps {
    partner: Partner;
    scannedStudent: Student | null;
    scanError: string | null;
    manualCpf: string;
    onManualCpfChange: (cpf: string) => void;
    onCpfValidation: (e: React.FormEvent) => void;
    onOpenScanner: () => void;
    onNewValidation: () => void;
    onRegisterBenefit: (promoId: string, title?: string) => void;
    auditLogs: AuditLog[];
}

export const ScannerView: React.FC<ScannerViewProps> = ({
    partner,
    scannedStudent,
    scanError,
    manualCpf,
    onManualCpfChange,
    onCpfValidation,
    onOpenScanner,
    onNewValidation,
    onRegisterBenefit,
    auditLogs
}) => {
    return (
        <div className="animate-fade-in max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                {scannedStudent ? 'Resultado da Validação' : 'Validar Carteirinha'}
            </h2>

            {!scannedStudent ? (
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 text-center">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                        <ScanLine size={40} />
                    </div>

                    <h3 className="font-bold text-lg text-slate-800 mb-2">Escanear QR Code</h3>
                    <p className="text-slate-500 text-sm mb-6">Aponte a câmera para o código da carteirinha digital.</p>

                    <button
                        onClick={onOpenScanner}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-8"
                    >
                        <ScanLine size={24} /> ABRIR SCANNER
                    </button>

                    <div className="relative flex py-2 items-center mb-8">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">OU valide pelo CPF</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    <form onSubmit={onCpfValidation} className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="000.000.000-00"
                                maxLength={14}
                                value={manualCpf}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '')
                                        .replace(/(\d{3})(\d)/, '$1.$2')
                                        .replace(/(\d{3})(\d)/, '$1.$2')
                                        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
                                        .replace(/(-\d{2})\d+?$/, '$1');
                                    onManualCpfChange(value);
                                }}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-center font-mono placeholder:font-sans text-lg tracking-widest"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={manualCpf.length < 14}
                            className="w-full bg-slate-800 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98]"
                        >
                            VERIFICAR CPF
                        </button>
                    </form>

                    {scanError && (
                        <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-4 animate-slide-up text-center">
                            <div className="flex items-center justify-center gap-2 text-red-600 mb-1">
                                <XCircle size={20} />
                                <h3 className="font-bold text-sm">Inválido</h3>
                            </div>
                            <p className="text-red-500 text-xs">{scanError}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6 animate-slide-up">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CheckCircle size={100} className="text-emerald-600" />
                        </div>
                        <div className="flex items-center gap-2 mb-4 text-emerald-700 font-bold">
                            <CheckCircle size={24} />
                            <span>Carteirinha Válida</span>
                        </div>
                        <div className="flex flex-col items-center gap-6 relative z-10 py-4">
                            <div className="relative">
                                <img src={scannedStudent.photoUrl || 'https://via.placeholder.com/100'} className="w-48 h-48 rounded-3xl object-cover border-4 border-white shadow-xl" alt="Student" />
                                <div className="absolute -bottom-3 -right-3 bg-white p-1.5 rounded-2xl shadow-lg border border-slate-100">
                                    <div className="bg-emerald-500 text-white p-2 rounded-xl">
                                        <CheckCircle size={24} />
                                    </div>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2 border border-emerald-200">
                                    {scannedStudent.userType || MemberType.STUDENT}
                                </div>
                                <h4 className="font-bold text-slate-800 text-2xl mb-1">{scannedStudent.fullName}</h4>
                                <p className="text-emerald-600 font-bold text-base">
                                    {scannedStudent.userType === MemberType.STUDENT || !scannedStudent.userType ? scannedStudent.course : (scannedStudent.course || 'Corporativo')}
                                </p>
                                <div className="flex items-center justify-center gap-2 mt-3 text-slate-500 text-sm bg-white/50 py-1.5 px-4 rounded-full border border-white/20">
                                    <Calendar size={16} />
                                    <span>Validade: {new Date(scannedStudent.validUntil).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {partner.discount && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                                <Ticket size={120} className="text-slate-900" />
                            </div>

                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 relative z-10">
                                <Ticket size={18} className="text-indigo-600" />
                                Benefício Padrão
                            </h4>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                                <div>
                                    <p className="text-lg font-bold text-slate-800 leading-tight">{partner.discount}</p>
                                    <p className="text-xs text-slate-500 mt-1">Benefício fixo da parceria</p>
                                    {(() => {
                                        const standardUsageCount = auditLogs.filter(log =>
                                            log.action === 'BENEFIT_USAGE' &&
                                            log.metadata?.promoId === 'STANDARD_BENEFIT' &&
                                            log.metadata?.studentId === scannedStudent.id
                                        ).length;

                                        if (standardUsageCount > 0) {
                                            return (
                                                <div className="flex items-center gap-1 mt-2 text-indigo-600 font-bold text-xs bg-indigo-50 px-2 py-1 rounded-lg w-fit">
                                                    <History size={12} />
                                                    Usado {standardUsageCount}x
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>

                                <button
                                    onClick={() => onRegisterBenefit('STANDARD_BENEFIT', partner.discount)}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] whitespace-nowrap"
                                >
                                    Registrar
                                </button>
                            </div>
                        </div>
                    )}

                    {partner.activePromotions && partner.activePromotions.length > 0 && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Store size={18} className="text-indigo-600" />
                                Promoções Disponíveis
                            </h4>

                            <div className="space-y-3">
                                {partner.activePromotions.filter(p => p.isActive !== false).map((promo, idx) => {
                                    const usageCount = auditLogs.filter(log =>
                                        log.action === 'BENEFIT_USAGE' &&
                                        log.metadata?.promoId === promo.id &&
                                        log.metadata?.studentId === scannedStudent.id
                                    ).length;

                                    const lastUsage = [...auditLogs].reverse().find(log =>
                                        log.action === 'BENEFIT_USAGE' &&
                                        log.metadata?.promoId === promo.id &&
                                        log.metadata?.studentId === scannedStudent.id
                                    );

                                    let isAvailable = true;
                                    let restrictionReason = '';

                                    if (promo.limit === 'ONCE' && usageCount > 0) {
                                        isAvailable = false;
                                        restrictionReason = 'Já utilizado';
                                    } else if (promo.limit === 'MONTHLY') {
                                        const currentMonth = new Date().getMonth();
                                        const lastUsageMonth = lastUsage ? new Date(lastUsage.timestamp).getMonth() : -1;
                                        if (lastUsageMonth === currentMonth) {
                                            isAvailable = false;
                                            restrictionReason = 'Já utilizado este mês';
                                        }
                                    }

                                    return (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex-1 pr-4">
                                                <p className="font-bold text-slate-700 text-sm">{promo.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">{promo.limit === 'UNLIMITED' ? 'Ilimitado' : promo.limit === 'MONTHLY' ? 'Mensal' : 'Único'}</span>
                                                    {promo.limit === 'UNLIMITED' && usageCount > 0 && (
                                                        <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                                                            • Usado {usageCount}x
                                                        </span>
                                                    )}
                                                    {!isAvailable && (
                                                        <div className="flex flex-col mt-2">
                                                            <span className="text-[10px] text-red-500 font-bold flex items-center gap-1.5 mb-1.5">
                                                                <XCircle size={10} /> {restrictionReason}
                                                            </span>
                                                            {lastUsage && (promo.limit === 'MONTHLY' || promo.limit === 'ONCE') && (
                                                                <div className="pt-1.5 border-t border-slate-100 dark:border-white/5 flex flex-col gap-0.5">
                                                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Utilizado em:</span>
                                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                                        {new Date(lastUsage.timestamp).toLocaleDateString('pt-BR')} às {new Date(lastUsage.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                disabled={!isAvailable}
                                                onClick={() => onRegisterBenefit(promo.id, promo.title)}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${isAvailable
                                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
                                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                {isAvailable ? 'Registrar' : 'Indisponível'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onNewValidation}
                        className="mt-6 w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                    >
                        NOVA VALIDAÇÃO
                    </button>
                </div>
            )}
        </div>
    );
};
