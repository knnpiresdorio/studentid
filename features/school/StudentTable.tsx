import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Power, Edit, Trash2, Users, History } from 'lucide-react';
import { Student, AuditLog, MemberType } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { optimizeImage } from '../../utils/image';

interface StudentTableProps {
    students: Student[];
    totalCount: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onSearchChange: (search: string) => void;
    auditLogs: AuditLog[];
    selectedStudentIds: Set<string>;
    onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectOne: (id: string) => void;
    onToggleStatus: (student: Student) => void;
    onToggleDependentStatus: (student: Student, dependentId: string) => void;
    onEdit: (student: Student) => void;
    onDelete: (student: Student) => void;
    maskCPF: (cpf: string) => string;
    isLoading?: boolean;
}

export const StudentTable: React.FC<StudentTableProps> = ({
    students,
    totalCount,
    page,
    pageSize,
    onPageChange,
    onSearchChange,
    auditLogs,
    selectedStudentIds,
    onSelectAll,
    onSelectOne,
    onToggleStatus,
    onToggleDependentStatus,
    onEdit,
    onDelete,
    maskCPF,
    isLoading
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

    const handleSearchChange = (val: string) => {
        setSearchTerm(val);
        onSearchChange(val);
    };

    const totalPages = Math.ceil(totalCount / pageSize);


    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou CPF..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {totalCount} membros no total {isLoading && '(Atualizando...)'}
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar relative bg-slate-50/50 dark:bg-slate-950/50">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-white/5 uppercase text-xs tracking-wider shadow-sm">
                        <tr>
                            <th className="px-6 py-4 w-12 bg-slate-50 dark:bg-slate-900">
                                <input
                                    type="checkbox"
                                    className="rounded border-slate-300 dark:border-white/10 text-indigo-600 focus:ring-indigo-500/50 bg-transparent"
                                    checked={students.length > 0 && selectedStudentIds.size === students.length}
                                    onChange={onSelectAll}
                                />
                            </th>
                            <th className="px-6 py-4 bg-slate-50 dark:bg-slate-900">Membro</th>
                            <th className="px-6 py-4 bg-slate-50 dark:bg-slate-900">Nascimento</th>
                            <th className="px-6 py-4 bg-slate-50 dark:bg-slate-900">CPF</th>
                            <th className="px-6 py-4 bg-slate-50 dark:bg-slate-900">Tipo</th>
                            <th className="px-6 py-4 bg-slate-50 dark:bg-slate-900 hidden 2xl:table-cell">Curso</th>
                            <th className="px-6 py-4 bg-slate-50 dark:bg-slate-900 hidden xl:table-cell">Cidade/UF</th>
                            <th className="px-6 py-4 bg-slate-50 dark:bg-slate-900 text-center">Deps.</th>
                            <th className="px-6 py-4 bg-slate-50 dark:bg-slate-900 hidden lg:table-cell">Cadastro</th>
                            <th className="px-6 py-4 bg-slate-50 dark:bg-slate-900">Validade</th>
                            <th className="px-6 py-4 bg-slate-50 dark:bg-slate-900">Status</th>
                            <th className="px-6 py-4 text-right bg-slate-50 dark:bg-slate-900">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {isLoading && students.length === 0 ? (
                            <tr>
                                <td colSpan={11} className="px-6 py-12 text-center text-slate-500 italic">
                                    Carregando membros...
                                </td>
                            </tr>
                        ) : students.length === 0 ? (
                            <tr>
                                <td colSpan={11} className="px-6 py-12 text-center text-slate-500 italic">
                                    Nenhum membro encontrado para os critérios de busca.
                                </td>
                            </tr>
                        ) : students.map(student => (
                            <React.Fragment key={student.id}>
                                <tr
                                    className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${expandedStudentId === student.id ? 'bg-slate-50 dark:bg-white/5' : ''}`}
                                    onClick={(e) => {
                                        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
                                        setExpandedStudentId(expandedStudentId === student.id ? null : student.id);
                                    }}
                                >
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 dark:border-white/10 text-indigo-600 focus:ring-indigo-500/50 bg-transparent"
                                            checked={selectedStudentIds.has(student.id)}
                                            onChange={() => onSelectOne(student.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-white/10">
                                                {student.photoUrl ? (
                                                    <img src={optimizeImage(student.photoUrl, 80, 80)} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                                        {student.fullName.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {student.fullName}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                                        {student.birthDate ? new Date(student.birthDate).toLocaleDateString('pt-BR') : '-'}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                        {maskCPF(student.cpf)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px - 2 py - 1 rounded text - [10px] font - bold uppercase ${student.userType === MemberType.STUDENT || !student.userType ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                            } `}>
                                            {student.userType || 'ALUNO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium text-sm hidden 2xl:table-cell">
                                        {student.course || 'Corporativo'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs hidden xl:table-cell">
                                        {student.city ? `${student.city}${student.state ? ` - ${student.state}` : ''} ` : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {student.dependents && student.dependents.length > 0 ? (
                                            <span className="inline-flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                                                {student.dependents.length}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300 dark:text-slate-600 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs hidden lg:table-cell">
                                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs text-nowrap">
                                        {new Date(student.validUntil).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={student.isActive ? 'success' : 'danger'}>
                                            {student.isActive ? 'ATIVO' : 'INATIVO'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => onToggleStatus(student)}
                                                className={`p - 2 rounded - lg transition - colors ${student.isActive ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'} `}
                                                title={student.isActive ? 'Desativar Membro' : 'Ativar Membro'}
                                            >
                                                <Power size={16} />
                                            </button>
                                            <button
                                                onClick={() => onEdit(student)}
                                                className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(student)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedStudentId === student.id && (
                                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                                        <td colSpan={11} className="px-6 py-4 border-b border-indigo-500/10">
                                            <div className="pl-14">
                                                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                                    <Users size={16} className="text-indigo-500" />
                                                    Dependentes Vinculados
                                                </h4>
                                                {student.dependents && student.dependents.length > 0 ? (
                                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm mb-6">
                                                        <table className="w-full text-left text-xs">
                                                            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 font-bold border-b dark:border-white/5">
                                                                <tr>
                                                                    <th className="px-4 py-2">Nome</th>
                                                                    <th className="px-4 py-2">CPF</th>
                                                                    <th className="px-4 py-2">Relação</th>
                                                                    <th className="px-4 py-2">Status</th>
                                                                    <th className="px-4 py-2 text-right">Ações</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                                                {student.dependents.map(dependent => (
                                                                    <tr key={dependent.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                                                                        <td className="px-4 py-2 font-bold text-slate-700 dark:text-slate-300">{dependent.name}</td>
                                                                        <td className="px-4 py-2 font-mono text-slate-500">{maskCPF(dependent.cpf)}</td>
                                                                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{dependent.relation}</td>
                                                                        <td className="px-4 py-2">
                                                                            <Badge variant={dependent.isActive ? 'success' : 'danger'}>
                                                                                {dependent.isActive ? 'ATIVO' : 'INATIVO'}
                                                                            </Badge>
                                                                        </td>
                                                                        <td className="px-4 py-2 text-right">
                                                                            <button
                                                                                onClick={() => onToggleDependentStatus(student, dependent.id)}
                                                                                className={`p - 1.5 rounded - lg transition - colors ${dependent.isActive ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'} `}
                                                                                title={dependent.isActive ? 'Desativar Dependente' : 'Ativar Dependente'}
                                                                            >
                                                                                <Power size={14} />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-center text-slate-400 italic mb-6">
                                                        Nenhum dependente vinculado a este membro.
                                                    </div>
                                                )}

                                                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                                    <History size={16} className="text-indigo-500" />
                                                    Histórico do Membro (Logs)
                                                </h4>
                                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm max-h-60 overflow-y-auto">
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 font-bold border-b dark:border-white/5">
                                                            <tr>
                                                                <th className="px-4 py-2">Data</th>
                                                                <th className="px-4 py-2">Ação</th>
                                                                <th className="px-4 py-2">Detalhes</th>
                                                                <th className="px-4 py-2">Autor</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                                            {auditLogs
                                                                .filter(log => log.targetStudent === student.fullName || log.details.includes(student.fullName))
                                                                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                                                .map(log => (
                                                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                                                                        <td className="px-4 py-2 font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                                                                        <td className="px-4 py-2 font-bold text-indigo-500">{log.action}</td>
                                                                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{log.details}</td>
                                                                        <td className="px-4 py-2 text-slate-500">{log.actorName}</td>
                                                                    </tr>
                                                                ))}
                                                            {auditLogs.filter(log => log.targetStudent === student.fullName || log.details.includes(student.fullName)).length === 0 && (
                                                                <tr>
                                                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">
                                                                        Nenhum registro encontrado para este membro.
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Mostrando {Math.min(students.length, pageSize)} de {totalCount} registros
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1 || isLoading}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50 transition-colors"
                    >
                        Anterior
                    </button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (page <= 3) pageNum = i + 1;
                            else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = page - 2 + i;

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => onPageChange(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === pageNum ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5'}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page === totalPages || totalPages === 0 || isLoading}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50 transition-colors"
                    >
                        Próximo
                    </button>
                </div>
            </div>
        </div>
    );
};
