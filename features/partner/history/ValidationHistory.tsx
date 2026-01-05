import React from 'react';
import { History, CheckCircle, XCircle, AlertCircle, Info, User } from 'lucide-react';
import { AuditLog, Student, ActionType } from '../../../types';
import { maskCPF } from '../../../utils/masking';

interface ValidationHistoryProps {
    logs: AuditLog[];
    students: Student[];
}

export const ValidationHistory: React.FC<ValidationHistoryProps> = ({
    logs,
    students
}) => {
    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Histórico de Validações</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {logs.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">
                        <History size={48} className="mx-auto mb-3 text-slate-300" />
                        <p>Nenhuma validação registrada ainda.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {logs.map(log => {
                            const logStudent = students.find(s => s.id === log.metadata?.studentId);

                            let icon = <Info size={16} />;
                            let style = "bg-slate-100 text-slate-500";
                            let displayDetails = log.details;

                            if (log.action === 'VALIDATION_SUCCESS') {
                                icon = <CheckCircle size={16} />;
                                style = "bg-emerald-100 text-emerald-600";
                            } else if (log.action === 'VALIDATION_FAILED') {
                                icon = <XCircle size={16} />;
                                style = "bg-red-100 text-red-600";
                            } else if (log.action === 'BENEFIT_USAGE') {
                                if (log.metadata?.promoId === 'STANDARD_BENEFIT') {
                                    icon = <AlertCircle size={16} />;
                                    style = "bg-indigo-100 text-indigo-600";
                                } else {
                                    icon = <AlertCircle size={16} />;
                                    style = "bg-purple-100 text-purple-600";
                                    if (displayDetails.startsWith('Uso de benefício:')) {
                                        displayDetails = displayDetails.replace('Uso de benefício:', 'Uso de promoção:');
                                    }
                                }
                            }

                            return (
                                <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex gap-3">
                                            <div className={`mt-1 p-2 rounded-full flex-shrink-0 w-8 h-8 flex items-center justify-center ${style}`}>
                                                {icon}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm leading-tight mb-1">{displayDetails}</p>

                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1 whitespace-nowrap">
                                                        <User size={10} strokeWidth={2.5} />
                                                        {log.actorName}
                                                    </span>

                                                    {logStudent && (
                                                        <>
                                                            <span className="text-slate-300 hidden sm:inline">|</span>
                                                            <span className="flex items-center gap-1 whitespace-nowrap">
                                                                <span className="font-medium text-slate-600">{logStudent.fullName}</span>
                                                            </span>
                                                            <span className="text-slate-400 font-mono text-[10px] whitespace-nowrap">
                                                                ({maskCPF(logStudent.cpf)})
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            <span className="text-xs font-bold text-slate-400 block whitespace-nowrap">
                                                {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                                            </span>
                                            <span className="text-[10px] text-slate-400 block whitespace-nowrap">
                                                {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
