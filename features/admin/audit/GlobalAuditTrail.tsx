import React from 'react';
import { AuditLog, School } from '../../../types';
import { ChevronRight } from 'lucide-react';

interface GlobalAuditTrailProps {
    data: AuditLog[];
    count: number;
    isLoading: boolean;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    schools: School[];
    schoolFilter: string;
    onSchoolFilterChange: (id: string) => void;
}

export const GlobalAuditTrail: React.FC<GlobalAuditTrailProps> = ({
    data,
    count,
    isLoading,
    page,
    pageSize,
    onPageChange,
    schools,
    schoolFilter,
    onSchoolFilterChange
}) => {
    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex justify-end">
                <div className="flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-white/10 shadow-sm backdrop-blur-sm">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Filtrar por escola:</label>
                    <div className="relative">
                        <select
                            className="text-sm border-none bg-slate-950/50 font-medium focus:ring-0 cursor-pointer text-white outline-none py-1 pl-2 pr-8 rounded-lg appearance-none border border-white/5 hover:bg-slate-950/80 transition-colors"
                            value={schoolFilter}
                            onChange={(e) => onSchoolFilterChange(e.target.value)}
                        >
                            <option value="ALL" className="bg-slate-900">Todas as Escolas</option>
                            {schools.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>)}
                        </select>
                        <ChevronRight className="absolute right-2 top-2 rotate-90 text-slate-500 pointer-events-none" size={12} />
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/5 overflow-hidden ring-1 ring-white/5">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/50 text-slate-400 font-bold border-b border-white/5 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Data/Hora</th>
                            <th className="px-6 py-4">Responsável</th>
                            <th className="px-6 py-4">Ação</th>
                            <th className="px-6 py-4">IP / Agente</th>
                            <th className="px-6 py-4">Detalhes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            <tr><td colSpan={5} className="p-10 text-center text-slate-500 italic">Carregando logs de auditoria...</td></tr>
                        ) : data.map(log => (
                            <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                                <td className="px-6 py-4 font-bold text-white group-hover:text-blue-400 transition-colors">
                                    {log.actorName}
                                    <span className="block text-[10px] text-slate-500 font-normal">{log.actorRole}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-medium border border-white/10 shadow-sm">{log.action}</span>
                                </td>
                                <td className="px-6 py-4 text-[10px] text-slate-500 font-mono">
                                    <div className="flex flex-col gap-0.5">
                                        <span>{log.metadata?.ipAddress || '-'}</span>
                                        <span className="truncate max-w-[100px]" title={log.metadata?.userAgent}>{log.metadata?.userAgent || '-'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate" title={log.details}>{log.details}</td>
                            </tr>
                        ))}
                        {data.length === 0 && !isLoading && (
                            <tr><td colSpan={5} className="p-12 text-center text-slate-500">Nenhum log encontrado para esta seleção.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Logs Pagination */}
            <div className="p-4 border-t border-white/5 flex items-center justify-between bg-slate-950/20">
                <span className="text-xs text-slate-500 font-medium tracking-wide">
                    Mostrando {Math.min(data.length, pageSize)} de {count} registros
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                        disabled={page === 1 || isLoading}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-all"
                    >
                        Anterior
                    </button>
                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= Math.ceil(count / pageSize) || isLoading}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-all"
                    >
                        Próximo
                    </button>
                </div>
            </div>
        </div>
    );
};
