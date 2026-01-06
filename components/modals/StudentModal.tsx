import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    UserPlus,
    Camera,
    ChevronDown,
    Users,
    Plus,
    Upload
} from 'lucide-react';
import { Student, MemberType, UserRole, School, Dependent } from '../../types';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StudentSchema, studentSchema } from '../../schemas';
import { formatCPF, BRAZIL_STATES } from '../../utils/formatters';
import { ShieldCheck, Edit2, Trash2, Building2 } from 'lucide-react';
import { DependentModal } from './DependentModal';
import { useAuth } from '../../context/AuthContext';
import { uploadFile } from '../../services/storage';

interface StudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (studentData: Student) => void;
    student: Student | null;
    initialData?: Partial<Student>;
    showDependentsTab?: boolean;
    schools?: School[];
}


export const StudentModal: React.FC<StudentModalProps> = ({
    isOpen,
    onClose,
    onSave,
    student,
    initialData,
    showDependentsTab = true,
    schools = []
}) => {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === UserRole.ADMIN;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'dependents'>('info');

    const [isDepModalOpen, setIsDepModalOpen] = useState(false);
    const [editingDepIndex, setEditingDepIndex] = useState<number | null>(null);
    const [selectedStudentFile, setSelectedStudentFile] = useState<File | null>(null);
    const [dependentFilesMap, setDependentFilesMap] = useState<Map<string, File>>(new Map());
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<StudentSchema>({
        resolver: zodResolver(studentSchema),
        defaultValues: {
            isActive: true,
            dependents: [],
            ...initialData
        }
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "dependents"
    });

    const photoUrl = watch('photoUrl');
    const isDependent = watch('isDependent');
    const parentName = watch('parentName');

    useEffect(() => {
        if (isOpen) {
            if (student) {
                reset(student);
            } else {
                reset({
                    userType: MemberType.STUDENT,
                    isActive: true,
                    dependents: [],
                    ...initialData
                });
            }
            setActiveTab('info');
        }
    }, [isOpen, student, initialData, reset]);

    const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedStudentFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setValue('photoUrl', reader.result as string, { shouldValidate: true });
        };
        reader.readAsDataURL(file);
    };

    const handleAddDependent = () => {
        setEditingDepIndex(null);
        setIsDepModalOpen(true);
    };

    const handleEditDependent = (index: number) => {
        setEditingDepIndex(index);
        setIsDepModalOpen(true);
    };

    const handleSaveDependent = (dependent: Dependent, file?: File | null) => {
        // Use dependent ID as key for the files map
        const depId = dependent.id || `temp_${Date.now()}`;
        const dependentWithId = { ...dependent, id: depId };

        if (file) {
            setDependentFilesMap(prev => new Map(prev).set(depId, file));
        }

        if (editingDepIndex !== null) {
            update(editingDepIndex, dependentWithId);
        } else {
            append(dependentWithId);
        }
    };

    const onSubmit: SubmitHandler<StudentSchema> = async (data) => {
        setIsSaving(true);
        try {
            let finalPhotoUrl = data.photoUrl;

            // 1. Upload Student Photo if changed
            if (selectedStudentFile) {
                finalPhotoUrl = await uploadFile(selectedStudentFile, 'students/photos');
            }

            // 2. Upload Dependent Photos if they have new files
            const updatedDependents = await Promise.all((data.dependents || []).map(async (dep) => {
                const depFile = dependentFilesMap.get(dep.id || '');
                if (depFile) {
                    const uploadedUrl = await uploadFile(depFile, 'students/dependents');
                    return { ...dep, photoUrl: uploadedUrl };
                }
                return dep;
            }));

            const studentToSave = {
                ...data,
                photoUrl: finalPhotoUrl,
                dependents: updatedDependents
            };

            onSave(studentToSave as Student);
        } catch (error) {
            console.error('Error saving student with assets:', error);
            alert('Erro ao salvar membro e fotos. Verifique sua conexão.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className={`bg-slate-900 rounded-3xl p-8 w-full ${showDependentsTab ? 'max-w-5xl' : 'max-w-2xl'} shadow-2xl border border-white/10 overflow-y-auto max-h-[90vh]`}>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="bg-blue-500/10 p-2 rounded-lg text-blue-400 border border-blue-500/20"><UserPlus size={20} /></span>
                        {student ? 'Editar Membro' : 'Novo Membro'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10">
                        <X size={20} />
                    </button>
                </div>

                {/* --- TABS --- */}
                {showDependentsTab && (
                    <div className="flex border-b border-white/10 mb-6">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'info' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                        >
                            Dados Gerais
                        </button>
                        <button
                            onClick={() => setActiveTab('dependents')}
                            className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'dependents' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                        >
                            Dependentes
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className={showDependentsTab ? "min-h-[500px]" : ""}>
                    {/* --- TAB: DADOS DO ALUNO --- */}
                    {(activeTab === 'info' || !showDependentsTab) && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {isSuperAdmin && (
                                    <div className="col-span-2 bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 mb-2">
                                        <label className="block text-xs font-bold text-indigo-300 mb-2 uppercase tracking-wide flex items-center gap-2">
                                            <Building2 size={14} /> Instituição Vinculada (Admin Mode)
                                        </label>
                                        <div className="relative">
                                            <select
                                                className="w-full bg-slate-950 border border-indigo-500/30 rounded-lg p-3 text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                                                {...register('schoolId')}
                                                onChange={(e) => {
                                                    const selected = schools.find(s => s.id === e.target.value);
                                                    if (selected) {
                                                        setValue('schoolId', selected.id);
                                                        setValue('schoolName', selected.name);
                                                        setValue('schoolType', selected.type);
                                                    }
                                                }}
                                            >
                                                <option value="">Selecione a Instituição...</option>
                                                {schools.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-400 pointer-events-none" size={16} />
                                        </div>
                                        {errors.schoolId && <span className="text-red-400 text-xs mt-1 block">{errors.schoolId.message}</span>}
                                    </div>
                                )}
                                <div className={showDependentsTab ? "" : "col-span-2"}>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                                        Nome Completo <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className={`w-full bg-slate-950/50 border ${errors.fullName ? 'border-red-500' : 'border-white/10'} rounded-xl p-3.5 text-white font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-600 focus:bg-slate-900`}
                                        placeholder="Ex: Ana Souza"
                                        {...register('fullName')}
                                    />
                                    {errors.fullName && <span className="text-red-400 text-xs mt-1 block">{errors.fullName.message}</span>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                                        Tipo de Membro <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 text-white font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer focus:bg-slate-900"
                                            {...register('userType')}
                                            onChange={(e) => {
                                                setValue('userType', e.target.value as MemberType);
                                                if (e.target.value !== MemberType.STUDENT) {
                                                    // Optional: auto-set course if not student, similar to original logic
                                                    // But better to let user decide or handle in effect
                                                }
                                            }}
                                        >
                                            {Object.entries(MemberType).map(([key, value]) => (
                                                <option key={key} value={value}>{value}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                <div className={showDependentsTab ? "" : "col-span-2"}>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                                        Foto do Membro (URL) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="bg-slate-950 border border-white/10 rounded-xl p-3 flex items-center justify-center w-12 shrink-0 cursor-pointer hover:bg-slate-900 transition-colors"
                                        >
                                            {photoUrl ? (
                                                <img src={photoUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
                                            ) : (
                                                <Camera size={20} className="text-slate-500" />
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handlePhotoFileUpload}
                                        />
                                        <input
                                            className={`w-full bg-slate-950/50 border ${errors.photoUrl ? 'border-red-500' : 'border-white/10'} rounded-xl p-3.5 text-white font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-600 focus:bg-slate-900`}
                                            placeholder="URL da Foto ou clique na câmera para upload"
                                            {...register('photoUrl')}
                                        />
                                    </div>
                                    {errors.photoUrl && <span className="text-red-400 text-xs mt-1 block">{errors.photoUrl.message}</span>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                                        CPF <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        control={control}
                                        name="cpf"
                                        render={({ field }) => (
                                            <input
                                                className={`w-full bg-slate-950/50 border ${errors.cpf ? 'border-red-500' : 'border-white/10'} rounded-xl p-3.5 text-white font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-600 focus:bg-slate-900`}
                                                placeholder="000.000.000-00"
                                                maxLength={14}
                                                {...field}
                                                onChange={(e) => field.onChange(formatCPF(e.target.value))}
                                            />
                                        )}
                                    />
                                    {errors.cpf && <span className="text-red-400 text-xs mt-1 block">{errors.cpf.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                                        Matrícula <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className={`w-full bg-slate-950/50 border ${errors.registrationNumber ? 'border-red-500' : 'border-white/10'} rounded-xl p-3.5 text-white font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-600 focus:bg-slate-900`}
                                        placeholder="Ex: 2024001"
                                        {...register('registrationNumber')}
                                    />
                                    {errors.registrationNumber && <span className="text-red-400 text-xs mt-1 block">{errors.registrationNumber.message}</span>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Curso</label>
                                    <input
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 text-white font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-600 focus:bg-slate-900"
                                        placeholder="Ex: Engenharia Civil"
                                        {...register('course')}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                                            Cidade <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 text-white font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-600 focus:bg-slate-900"
                                            placeholder="Ex: São Paulo"
                                            {...register('city')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                                            Estado <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 text-white font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer focus:bg-slate-900"
                                                {...register('state')}
                                            >
                                                <option value="">UF</option>
                                                {BRAZIL_STATES.map(uf => (
                                                    <option key={uf} value={uf}>{uf}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                                        Data de Nascimento <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className={`w-full bg-slate-950/50 border ${errors.birthDate ? 'border-red-500' : 'border-white/10'} rounded-xl p-3.5 text-white font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-600 focus:bg-slate-900`}
                                        {...register('birthDate')}
                                    />
                                    {errors.birthDate && <span className="text-red-400 text-xs mt-1 block">{errors.birthDate.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                                        Validade <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className={`w-full bg-slate-950/50 border ${errors.validUntil ? 'border-red-500' : 'border-white/10'} rounded-xl p-3.5 text-white font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-600 focus:bg-slate-900`}
                                        {...register('validUntil')}
                                    />
                                    {errors.validUntil && <span className="text-red-400 text-xs mt-1 block">{errors.validUntil.message}</span>}
                                </div>

                                <div className={showDependentsTab ? "md:col-span-2" : "col-span-2"}>
                                    <Controller
                                        control={control}
                                        name="isActive"
                                        render={({ field }) => (
                                            <div
                                                className="bg-slate-950/30 border border-white/5 rounded-xl p-4 flex items-center justify-between group cursor-pointer"
                                                onClick={() => field.onChange(!field.value)}
                                            >
                                                <div>
                                                    <h3 className="text-white font-bold mb-1">Membro Ativo</h3>
                                                    <p className="text-slate-400 text-xs">Se desativado, o acesso à carteirinha será bloqueado.</p>
                                                </div>
                                                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${field.value ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                                                    <div className={`aspect-square h-full bg-white rounded-full shadow-lg transform transition-transform duration-300 ${field.value ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: DEPENDENTES --- */}
                    {activeTab === 'dependents' && showDependentsTab && (
                        <div className="animate-fade-in space-y-6">
                            <div className="bg-slate-950/30 rounded-xl p-6 border border-white/5 flex flex-col min-h-[400px]">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Users size={20} className="text-indigo-400" /> Lista de Dependentes ({fields.length})
                                    </h4>
                                    {!(watch('isDependent') || watch('parentName')) && (
                                        <button
                                            type="button"
                                            onClick={handleAddDependent}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/20"
                                        >
                                            <Plus size={14} /> Adicionar
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
                                    {fields.map((dep, index) => (
                                        <div key={dep.id} className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center overflow-hidden">
                                                    {dep.photoUrl ? (
                                                        <img src={dep.photoUrl} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <span className="text-slate-500 font-bold text-xs uppercase">{dep.name.substring(0, 2)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{dep.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-indigo-400 uppercase font-extrabold tracking-wider bg-indigo-500/10 px-1.5 py-0.5 rounded">{dep.relation}</span>
                                                        <span className="text-[10px] text-slate-500 font-medium">{dep.cpf || 'Sem CPF'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditDependent(index)}
                                                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {fields.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-white/5">
                                                <Users size={32} className="text-slate-600" />
                                            </div>
                                            <p className="text-sm text-slate-400 font-bold mb-1">Nenhum dependente cadastrado</p>
                                            <p className="text-xs text-slate-500 px-6">
                                                {(watch('isDependent') || watch('parentName'))
                                                    ? "Dependentes não podem ter seus próprios dependentes."
                                                    : "Clique em 'Adicionar' para incluir um novo dependente neste titular."}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer for Info Tab */}
                    {(activeTab === 'info' || !showDependentsTab) && (
                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
                            <div className="flex items-center gap-2 text-slate-500">
                                <ShieldCheck size={16} />
                                <span className="text-[10px] uppercase font-bold tracking-tight">LGPD: Dados protegidos e criptografados</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-xl border border-white/10 font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        'Salvar Membro'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div >
            <DependentModal
                isOpen={isDepModalOpen}
                onClose={() => setIsDepModalOpen(false)}
                onSave={handleSaveDependent}
                dependent={editingDepIndex !== null ? fields[editingDepIndex] : null}
            />
        </div >
    );
};
