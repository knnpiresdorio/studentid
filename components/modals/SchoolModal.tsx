import React, { useEffect, useRef, useState } from 'react';
import { X, Building2, Camera, Plus, ShieldCheck } from 'lucide-react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { uploadFile } from '../../services/storage';
import { zodResolver } from '@hookform/resolvers/zod';
import { SchoolSchema, schoolSchema } from '../../schemas';
import { School, SchoolType } from '../../types';
import { formatCNPJ } from '../../utils/formatters';

interface SchoolModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (schoolData: School) => void;
    school: School | null;
}

export const SchoolModal: React.FC<SchoolModalProps> = ({
    isOpen,
    onClose,
    onSave,
    school
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors }
    } = useForm<SchoolSchema>({
        resolver: zodResolver(schoolSchema),
        defaultValues: {
            isActive: true,
            email: '',
            description: ''
        }
    });

    useEffect(() => {
        if (school) {
            reset(school);
        } else {
            reset({
                isActive: true,
                description: '',
                name: '',
                email: '',
                logoUrl: '',
                type: SchoolType.UNIVERSITY
            });
        }
    }, [school, reset, isOpen]);

    const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setValue('logoUrl', reader.result as string, { shouldValidate: true });
        };
        reader.readAsDataURL(file);
    };

    const onSubmit: SubmitHandler<SchoolSchema> = async (data) => {
        setIsUploading(true);
        try {
            let finalLogoUrl = data.logoUrl;

            // If a new file was selected, upload it to storage
            if (selectedFile) {
                finalLogoUrl = await uploadFile(selectedFile, 'schools');
            }

            const schoolToSave = {
                ...data,
                logoUrl: finalLogoUrl,
                createdAt: (data as any).createdAt || new Date().toISOString()
            };

            // Remove empty ID so Supabase generates a UUID
            if (!schoolToSave.id) {
                delete (schoolToSave as any).id;
            }

            onSave(schoolToSave as School);
            onClose();
        } catch (error) {
            console.error('Error in SchoolModal onSubmit:', error);
            alert('Erro ao salvar instituição. Tente novamente.');
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
            <div className="bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-white/10 my-auto">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-950/30 rounded-t-3xl">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-500/10 p-3 rounded-xl text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-900/20">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">
                                {school ? 'Editar Instituição' : 'Nova Instituição'}
                            </h2>
                            <p className="text-slate-400 text-xs mt-0.5">Gerencie os dados da instituição de ensino</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-all">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Logo Upload Section */}
                        <div className="md:col-span-1 space-y-4">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Logo da Instituição <span className="text-red-500">*</span></label>
                            <div className="relative group w-full aspect-video rounded-2xl bg-slate-950 border border-white/10 overflow-hidden shadow-xl ring-2 ring-blue-500/20 transition-all group-hover:ring-blue-500/50 flex items-center justify-center">
                                <Controller
                                    control={control}
                                    name="logoUrl"
                                    render={({ field }) => (
                                        field.value ? (
                                            <img src={field.value} className="w-full h-full object-contain p-4" alt="Logo Preview" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-slate-600">
                                                <Camera size={40} className="mb-2 opacity-20" />
                                                <span className="text-xs font-bold uppercase tracking-widest text-slate-700">Upload Logo</span>
                                            </div>
                                        )
                                    )}
                                />
                                <label className="absolute inset-0 bg-blue-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer flex-col gap-2">
                                    <Plus size={32} className="text-white" />
                                    <span className="text-xs text-white font-bold uppercase tracking-widest">Mudar Logo</span>
                                    <input type="file" accept="image/*" onChange={handlePhotoFileUpload} className="hidden" />
                                </label>
                            </div>
                            {errors.logoUrl && <span className="text-red-400 text-xs mt-1 block font-medium">{errors.logoUrl.message}</span>}
                        </div>

                        <div className="md:col-span-1 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Nome da Instituição <span className="text-red-500">*</span></label>
                                <input
                                    className={`w-full bg-slate-950/50 border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-xl p-3.5 text-white font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder-slate-600`}
                                    placeholder="Ex: Universidade Federal"
                                    {...register('name')}
                                />
                                {errors.name && <span className="text-red-400 text-xs mt-1 block font-medium">{errors.name.message}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">E-mail de Contato <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    className={`w-full bg-slate-950/50 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl p-3.5 text-white font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder-slate-600`}
                                    placeholder="Ex: contato@escola.com"
                                    {...register('email')}
                                />
                                {errors.email && <span className="text-red-400 text-xs mt-1 block font-medium">{errors.email.message}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">CNPJ <span className="text-red-500">*</span></label>
                                <Controller
                                    control={control}
                                    name="cnpj"
                                    render={({ field }) => (
                                        <input
                                            className={`w-full bg-slate-950/50 border ${errors.cnpj ? 'border-red-500' : 'border-white/10'} rounded-xl p-3.5 text-white font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder-slate-600`}
                                            placeholder="00.000.000/0000-00"
                                            {...field}
                                            value={field.value || ''}
                                            onChange={(e) => field.onChange(formatCNPJ(e.target.value))}
                                        />
                                    )}
                                />
                                {errors.cnpj && <span className="text-red-400 text-xs mt-1 block font-medium">{errors.cnpj.message}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Tipo de Instituição <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 text-white font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none cursor-pointer"
                                        {...register('type')}
                                    >
                                        {Object.values(SchoolType).map(type => (
                                            <option key={type} value={type} className="bg-slate-900">{type}</option>
                                        ))}
                                    </select>
                                    <Plus size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none rotate-45" />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Descrição / Observações</label>
                            <textarea
                                rows={4}
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white font-medium focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder-slate-600 resize-none"
                                placeholder="Breve descrição da instituição..."
                                {...register('description')}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-8 border-t border-white/5">
                        <div className="flex items-center gap-3 text-slate-500">
                            <ShieldCheck size={20} className="text-emerald-500/50" />
                            <div>
                                <span className="text-[10px] uppercase font-bold tracking-widest block">Ambiente Seguro</span>
                                <span className="text-[9px] text-slate-600 uppercase font-medium">Dados protegidos por criptografia</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-3 rounded-xl border border-white/10 font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all tracking-wide"
                            >
                                Voltar
                            </button>
                            <button
                                type="submit"
                                disabled={isUploading}
                                className="px-10 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all shadow-lg active:scale-95 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    school ? 'Salvar' : 'Criar Instituição'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
