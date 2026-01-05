import React from 'react';
import { Student, MemberType } from '../../../types';
import { Badge } from '../../../components/ui/Badge';
import { optimizeImage } from '../../../utils/image';
import { maskCPF } from '../../../utils/masking';
import { School as SchoolIcon } from 'lucide-react';

interface MemberRegistryProps {
    data: Student[];
    count: number;
    isLoading: boolean;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export const MemberRegistry: React.FC<MemberRegistryProps> = ({
    data,
    count,
    isLoading,
    page,
    pageSize,
    onPageChange
}) => {
    return (
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/5 overflow-hidden ring-1 ring-white/5 animate-fade-in">
            <div className="p-5 border-b border-white/5 bg-slate-950/30">
                <h3 className="font-bold text-white text-lg">Visão Global de Membros</h3>
                <p className="text-slate-400 text-xs mt-1">Lista completa de todos os membros cadastrados no sistema.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/50 text-slate-400 font-bold border-b border-white/5 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Membro</th>
                            <th className="px-6 py-4">CPF</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4">Matrícula</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Instituição</th>
                            <th className="px-6 py-4">Curso/Depto</th>
                            <th className="px-6 py-4">Validade</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            <tr><td colSpan={8} className="p-10 text-center text-slate-500 italic">Carregando base global...</td></tr>
                        ) : data.map(student => (
                            <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4 flex items-center gap-4">
                                    <img src={optimizeImage(student.photoUrl, 40, 40)} alt="" className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 shadow-sm object-cover" />
                                    <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{student.fullName}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-mono text-xs">{maskCPF(student.cpf)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${student.userType === MemberType.STUDENT || !student.userType ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                                        {student.userType || 'ALUNO'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">{student.registrationNumber}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={student.isActive ? 'success' : 'danger'}>
                                        {student.isActive ? 'ATIVO' : 'INATIVO'}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <div className="p-1 bg-white/5 rounded border border-white/10 text-slate-400">
                                            <SchoolIcon size={12} />
                                        </div>
                                        <span className="text-xs font-bold">{student.schoolName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-400 font-medium">{student.course || 'Corporativo'}</td>
                                <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                    {student.validUntil ? new Date(student.validUntil).toLocaleDateString('pt-BR') : '-'}
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && !isLoading && (
                            <tr><td colSpan={8} className="p-10 text-center text-slate-500 italic">Nenhum membro encontrado no sistema.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Global Pagination */}
            <div className="p-4 border-t border-white/5 flex items-center justify-between bg-slate-950/20">
                <span className="text-xs text-slate-500 font-medium tracking-wide">
                    Mostrando {Math.min(data.length, pageSize)} de {count} membros globais
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
