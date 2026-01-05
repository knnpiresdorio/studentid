import React from 'react';
import { History, Ticket, Store } from 'lucide-react';
import { ChangeRequest, AuditLog, Partner } from '../../../types';

interface ActivityTrailProps {
    requests: ChangeRequest[];
    auditLogs: AuditLog[];
    partners: Partner[];
    studentId?: string;
}

export const ActivityTrail: React.FC<ActivityTrailProps> = ({
    requests,
    auditLogs,
    partners,
    studentId
}) => {
    // Combine Requests and Benefit Usage Logs
    const benefitLogs = auditLogs.filter(log =>
        log.action === 'BENEFIT_USAGE' &&
        log.metadata?.studentId === studentId
    );

    const combinedActivity = [
        ...requests.map(req => ({
            type: 'REQUEST',
            date: new Date(req.createdAt),
            data: req
        })),
        ...benefitLogs.map(log => ({
            type: 'LOG',
            date: new Date(log.timestamp),
            data: log
        }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    if (combinedActivity.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                <History size={32} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate-500 dark:text-slate-600 italic">Nenhuma atividade recente.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-enter-slide-up">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Minhas Solicitações e Atividades</h2>
            <div className="space-y-3">
                {combinedActivity.map((item, idx) => {
                    if (item.type === 'REQUEST') {
                        const req = item.data as ChangeRequest;
                        return (
                            <div key={`req-${req.id || idx}`} className="bg-white dark:bg-white/5 p-4 rounded-xl flex justify-between items-center text-xs border border-slate-100 dark:border-white/5 shadow-sm">
                                <div>
                                    <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">
                                        {req.type === 'ADD_DEPENDENT' && 'Inclusão: ' + (req.payload?.name || 'Novo Dependente')}
                                        {req.type === 'DELETE_DEPENDENT' && 'Exclusão: ' + req.dependentName}
                                        {req.type === 'UPDATE_PHOTO' && 'Atualização de Foto'}
                                        {req.type === 'UPDATE_INFO' && 'Correção de Dados'}
                                        {req.type === 'UPDATE_DEPENDENT' && 'Atualização de Dependente: ' + (req.payload?.new?.name || 'Dependente')}
                                        {req.type === 'BENEFIT_USAGE' && `Uso de Benefício: ${req.payload?.partnerName || 'Parceiro'}`}
                                    </p>
                                    <p className="text-slate-500 dark:text-slate-500 font-medium">{item.date.toLocaleDateString('pt-BR')}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider text-[10px] ${req.status === 'PENDING' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' : req.status === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                                    {req.status === 'PENDING' ? 'Análise' : req.status === 'APPROVED' ? (req.type === 'BENEFIT_USAGE' ? 'Registrado' : 'Aprovado') : 'Recusado'}
                                </span>
                            </div>
                        );
                    } else {
                        const log = item.data as AuditLog;
                        const partner = partners.find(p => p.id === log.metadata?.partnerId);
                        const partnerName = partner ? partner.name : log.actorName;

                        return (
                            <div key={`log-${log.id}`} className="bg-white dark:bg-white/5 p-4 rounded-xl flex justify-between items-center text-xs border border-slate-100 dark:border-white/5 shadow-sm border-l-4 border-l-purple-500">
                                <div>
                                    <p className="font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-2">
                                        <Ticket size={14} className="text-purple-500" />
                                        {log.details.replace('Uso de benefício: ', '')}
                                    </p>
                                    <p className="text-slate-500 dark:text-slate-500 font-medium flex items-center gap-1">
                                        {item.date.toLocaleDateString('pt-BR')} • {item.date.toLocaleTimeString('pt-BR')}
                                        <span className="mx-1">•</span> <Store size={10} /> {partnerName}
                                    </p>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider text-[10px] bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
                                    Utilizado
                                </span>
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
};
