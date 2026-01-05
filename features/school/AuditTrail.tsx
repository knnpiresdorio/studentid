import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { AuditLog } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

interface AuditTrailProps {
    auditLogs: AuditLog[];
    totalCount: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onSearchChange: (search: string) => void;
    isLoading?: boolean;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({
    auditLogs,
    totalCount,
    page,
    pageSize,
    onPageChange,
    onSearchChange,
    isLoading
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState('ALL');

    const handleSearchChange = (val: string) => {
        setSearchTerm(val);
        onSearchChange(val);
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Registro de Auditoria</h3>
                    <p className="text-sm text-slate-500">Histórico de validações e alterações do sistema.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        placeholder="Buscar por usuário ou detalhe..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        leftIcon={<Search className="w-4 h-4" />}
                        className="w-full sm:w-64"
                    />
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="ALL">Todas as Ações</option>
                        <option value="LOGIN">Login / Acesso</option>
                        <option value="UPDATE">Atualizações</option>
                        <option value="CREATE">Criações</option>
                        <option value="DELETE">Exclusões</option>
                        <option value="VALIDATION">Validações</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-white/5 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Data/Hora</th>
                            <th className="px-6 py-4">Ação</th>
                            <th className="px-6 py-4">Detalhes</th>
                            <th className="px-6 py-4">Autor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {isLoading && auditLogs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                                    Carregando logs...
                                </td>
                            </tr>
                        ) : auditLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge
                                        variant={
                                            log.metadata?.severity === 'ERROR' ? 'danger' :
                                                log.metadata?.severity === 'WARN' ? 'warning' : 'info'
                                        }
                                    >
                                        {log.action}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                    {log.details}
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-500">
                                    {log.actorName}
                                </td>
                            </tr>
                        ))}
                        {auditLogs.length === 0 && !isLoading && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                                    Nenhum registro encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Mostrando {Math.min(auditLogs.length, pageSize)} de {totalCount} registros
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1 || isLoading}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page === totalPages || totalPages === 0 || isLoading}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50"
                    >
                        Próximo
                    </button>
                </div>
            </div>
        </div>
    );
};
