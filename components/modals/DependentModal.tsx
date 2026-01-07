import React, { useEffect } from 'react';
import { X, UserPlus, ShieldCheck, ChevronDown, Camera, Plus } from 'lucide-react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DependentSchema, dependentSchema } from '../../schemas';
import { formatCPF, BRAZIL_STATES } from '../../utils/formatters';
import { Dependent } from '../../types';

interface DependentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dependent: Dependent, file?: File | null) => void;
    dependent?: Dependent | null;
}

export const DependentModal: React.FC<DependentModalProps> = ({
    isOpen,
    onClose,
    onSave,
    dependent
}) => {
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors }
    } = useForm<DependentSchema>({
        resolver: zodResolver(dependentSchema),
        defaultValues: {
            isActive: true,
            email: '',
            city: '',
            state: ''
        }
    });

    useEffect(() => {
        if (dependent) {
            reset(dependent);
        } else {
            reset({
                isActive: true,
                city: '',
                state: '',
                name: '',
                relation: '',
                cpf: '',
                birthDate: '',
                email: '',
                photoUrl: ''
            });
        }
    }, [dependent, reset, isOpen]);

    const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setValue('photoUrl', reader.result as string, { shouldValidate: true });
        };
        reader.readAsDataURL(file);
    };

    const onSubmit: SubmitHandler<DependentSchema> = (data) => {
        onSave({
            ...data,
            id: data.id || `dep_${Date.now()}`
        } as Dependent, selectedFile);
        setSelectedFile(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
            <div className="bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-white/10 my-auto">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-950/30 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-400 border border-indigo-500/20">
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                                {dependent ? 'Editar Dependente' : 'Adicionar Dependente'}
                            </h2>
                            <p className="text-slate-400 text-xs mt-0.5">Gerencie os dados do dependente</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form id="dependent-form" onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                    {/* Photo Upload Section */}
                    <div className="flex flex-col items-center gap-4 mb-2">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-white/10 overflow-hidden shadow-xl ring-2 ring-indigo-500/20 transition-all group-hover:ring-indigo-500/50">
                                <Controller
                                    control={control}
                                    name="photoUrl"
                                    render={({ field }) => (
                                        field.value ? (
                                            <img src={field.value} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950">
                                                <Camera size={24} />
                                                <span className="text-[10px] mt-1 font-bold uppercase tracking-widest text-slate-700">Adicionar</span>
                                            </div>
                                        )
                                    )}
                                />
                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer flex-col gap-1">
                                    <Plus size={20} className="text-white" />
                                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">Upload</span>
                                    <input type="file" accept="image/*" onChange={handlePhotoFileUpload} className="hidden" />
                                </label>
                            </div>
                        </div>
                        {errors.photoUrl && <span className="text-red-400 text-xs">{errors.photoUrl.message}</span>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Nome Completo <span className="text-red-500">*</span></label>
                            <input
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-600"
                                placeholder="Nome como no documento"
                                {...register('name')}
                            />
                            {errors.name && <span className="text-red-400 text-xs mt-1">{errors.name.message}</span>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">E-mail <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                className={`w-full bg-slate-950/50 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-600`}
                                placeholder="dependente@email.com"
                                {...register('email')}
                            />
                            {errors.email && <span className="text-red-400 text-xs mt-1">{errors.email.message}</span>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Parentesco <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer"
                                    {...register('relation')}
                                >
                                    <option value="" className="bg-slate-900 text-slate-500">Selecione</option>
                                    <option value="Filho(a)" className="bg-slate-900">Filho(a)</option>
                                    <option value="Cônjuge" className="bg-slate-900">Cônjuge</option>
                                    <option value="Pai/Mãe" className="bg-slate-900">Pai/Mãe</option>
                                    <option value="Outro" className="bg-slate-900">Outro</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 text-slate-500 pointer-events-none" size={16} />
                            </div>
                            {errors.relation && <span className="text-red-400 text-xs mt-1">{errors.relation.message}</span>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Data de Nascimento <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                {...register('birthDate')}
                            />
                            {errors.birthDate && <span className="text-red-400 text-xs mt-1">{errors.birthDate.message}</span>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">CPF <span className="text-red-500">*</span></label>
                            <Controller
                                control={control}
                                name="cpf"
                                render={({ field }) => (
                                    <input
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-600"
                                        placeholder="000.000.000-00"
                                        {...field}
                                        onChange={(e) => field.onChange(formatCPF(e.target.value))}
                                    />
                                )}
                            />
                            {errors.cpf && <span className="text-red-400 text-xs mt-1">{errors.cpf.message}</span>}
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Cidade <span className="text-red-500">*</span></label>
                            <input
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-600"
                                placeholder="Cidade"
                                {...register('city')}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Estado <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer"
                                    {...register('state')}
                                >
                                    <option value="" className="bg-slate-900 text-slate-500">UF</option>
                                    {BRAZIL_STATES.map(uf => (
                                        <option key={uf} value={uf} className="bg-slate-900">{uf}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 text-slate-500 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
                        <div className="flex items-center gap-2 text-slate-500">
                            <ShieldCheck size={16} />
                            <span className="text-[10px] uppercase font-bold tracking-tight">LGPD: Dados protegidos</span>
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
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all shadow-md"
                            >
                                Salvar Dependente
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
