import React, { useRef } from 'react';
import { X, Upload, FileDown, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { School, Student } from '../../types';
import { useStudentImport } from '../../features/admin/hooks/useStudentImport';
import { Button } from '../ui/BaseComponents';

interface ImportStudentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (students: Student[]) => void;
    school: School | null;
}

export const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({
    isOpen,
    onClose,
    onImport,
    school
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { importData, errors, isParsing, parseCSV, clearImport } = useStudentImport(school);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                parseCSV(text);
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/30">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <Upload size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold dark:text-white">Importar Alunos</h2>
                            <p className="text-sm text-slate-500">{school?.name || 'Selecione uma instituição'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto">
                    {importData.length === 0 && !isParsing ? (
                        <div className="space-y-6">
                            <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all group cursor-pointer relative">
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                />
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-full text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 dark:group-hover:text-indigo-400 dark:group-hover:bg-indigo-500/10 transition-all">
                                        <Upload size={32} />
                                    </div>
                                    <div>
                                        <p className="font-bold dark:text-white text-lg">Clique para fazer upload do CSV</p>
                                        <p className="text-slate-500 text-sm mt-1">Ou arraste seu arquivo aqui</p>
                                    </div>
                                </div>
                            </div>

                            <a
                                href="/templates/student_import_template.csv"
                                download
                                className="flex items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                            >
                                <FileDown size={18} className="text-indigo-600 dark:text-indigo-400" />
                                Baixar Modelo de Importação (CSV)
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Stats Summary */}
                            <div className="flex gap-4">
                                <div className="flex-1 bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20 text-center">
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{importData.length}</p>
                                    <p className="text-[10px] font-bold uppercase text-emerald-800/60 dark:text-emerald-300/60">Válidos</p>
                                </div>
                                <div className={`flex-1 ${errors.length > 0 ? 'bg-red-50 dark:bg-red-500/10 border-red-100' : 'bg-slate-50 dark:bg-white/5 border-slate-100'} p-4 rounded-xl border text-center`}>
                                    <p className={`text-2xl font-bold ${errors.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>{errors.length}</p>
                                    <p className="text-[10px] font-bold uppercase text-slate-500/60">Erros</p>
                                </div>
                            </div>

                            {/* Errors List */}
                            {errors.length > 0 && (
                                <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl p-4 overflow-hidden">
                                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-3">
                                        <AlertTriangle size={16} />
                                        <p className="text-xs font-bold uppercase">Erros de Validação</p>
                                    </div>
                                    <div className="max-h-40 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                                        {errors.map((err, i) => (
                                            <p key={i} className="text-xs text-red-700 dark:text-red-300">• {err}</p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Data Preview */}
                            <div className="bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-100 dark:border-white/5 overflow-hidden">
                                <p className="p-3 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-100 dark:border-white/5">Pré-visualização (Primeiros 5)</p>
                                <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-60 overflow-y-auto">
                                    {importData.slice(0, 5).map((student, i) => (
                                        <div key={i} className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold dark:text-white">{student.fullName}</p>
                                                <p className="text-xs text-slate-500">{student.cpf} • {student.course}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-indigo-500 uppercase">{student.userType}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {importData.length > 5 && (
                                        <p className="p-3 text-xs text-center text-slate-400 italic">E outros {importData.length - 5} membros...</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={clearImport}
                                    leftIcon={<Trash2 size={18} />}
                                >
                                    Limpar e Reiniciar
                                </Button>
                                <Button
                                    variant="indigo"
                                    className="flex-1"
                                    onClick={() => onImport(importData as Student[])}
                                    disabled={importData.length === 0}
                                    leftIcon={<CheckCircle size={18} />}
                                >
                                    Confirmar Importação
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
