import React, { useState, useEffect } from 'react';
import {
    X, Store, Upload, ChevronRight, Plus, Tag, Trash2,
    ShieldCheck, Instagram, Facebook, Globe, Phone, ChevronDown, GraduationCap
} from 'lucide-react';
import { Partner, Promotion, School } from '../../types';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PartnerSchema, partnerSchema } from '../../schemas';
import { formatPhone, formatCNPJ, BRAZIL_STATES } from '../../utils/formatters';
import { uploadFile } from '../../services/storage';

interface PartnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (partnerData: Partner, userData?: { username?: string, password?: string }) => void;
    partner: Partner | null;
    schools: School[];
    initialData?: Partial<Partner>;
    withUserCreation?: boolean;
}

export const PartnerModal: React.FC<PartnerModalProps> = ({
    isOpen,
    onClose,
    onSave,
    partner,
    schools = [],
    initialData,
    withUserCreation = false
}) => {
    const [logoUploadMode, setLogoUploadMode] = useState<'url' | 'file'>('url');
    const [bannerUploadMode, setBannerUploadMode] = useState<'url' | 'file'>('url');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
    const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'promotions'>('info');

    // Promotion form state
    const [promoTitle, setPromoTitle] = useState('');
    const [promoLimit, setPromoLimit] = useState<Promotion['limit']>('UNLIMITED');
    const [promoDescription, setPromoDescription] = useState('');
    const [promoValidUntil, setPromoValidUntil] = useState('');

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<PartnerSchema>({
        resolver: zodResolver(partnerSchema),
        defaultValues: {
            isActive: true,
            activePromotions: [],
            ...initialData
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "activePromotions"
    });

    const activePromotions = watch('activePromotions');
    const logoUrl = watch('logoUrl');
    const bannerUrl = watch('bannerUrl');

    useEffect(() => {
        if (isOpen) {
            if (partner) {
                reset(partner);
                setLogoUploadMode('url');
                setBannerUploadMode('url');
            } else {
                reset({
                    isActive: true,
                    activePromotions: [],
                    schoolId: '',
                    ...initialData
                });
                setLogoUploadMode('url');
                setBannerUploadMode('url');
            }
            setPromoTitle('');
            setPromoLimit('UNLIMITED');
            setPromoDescription('');
            setPromoValidUntil('');
            setUsername('');
            setPassword('');
        }
    }, [isOpen, partner, initialData, reset]);

    if (!isOpen) return null;

    const onSubmit: SubmitHandler<PartnerSchema> = async (data) => {
        if (withUserCreation && !partner && (!username || !password)) {
            alert("É necessário definir um usuário e senha para o gestor da loja.");
            return;
        }

        setIsUploading(true);
        try {
            let finalLogoUrl = data.logoUrl;
            let finalBannerUrl = data.bannerUrl;

            if (selectedLogoFile) {
                finalLogoUrl = await uploadFile(selectedLogoFile, 'partners/logos');
            }

            if (selectedBannerFile) {
                finalBannerUrl = await uploadFile(selectedBannerFile, 'partners/banners');
            }

            const partnerData = {
                ...data,
                logoUrl: finalLogoUrl,
                bannerUrl: finalBannerUrl
            };

            onSave(partnerData as Partner, { username, password });
        } catch (error) {
            console.error('Error uploading partner assets:', error);
            alert('Erro ao fazer upload das imagens. Verifique sua conexão.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddPromotion = () => {
        if (promoTitle.trim()) {
            append({
                id: `p${Date.now()}`,
                title: promoTitle.trim(),
                limit: promoLimit,
                description: promoDescription.trim() || undefined,
                validUntil: promoValidUntil || undefined,
                isActive: true
            });
            setPromoTitle('');
            setPromoLimit('UNLIMITED');
            setPromoDescription('');
            setPromoValidUntil('');
        }
    };

    const handleRemovePromotion = (index: number) => {
        remove(index);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'bannerUrl') => {
        const file = e.target.files?.[0];
        if (file) {
            if (field === 'logoUrl') setSelectedLogoFile(file);
            if (field === 'bannerUrl') setSelectedBannerFile(file);

            const url = URL.createObjectURL(file);
            setValue(field, url, { shouldValidate: true });
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900/90 backdrop-blur-2xl text-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto border border-white/10 ring-1 ring-white/10 scrollbar-hide">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="bg-purple-500/10 p-2 rounded-lg text-purple-400 border border-purple-500/20"><Store size={24} /></span>
                        {partner ? 'Editar Parceiro' : 'Novo Parceiro'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors"><X size={20} /></button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex bg-slate-950/50 p-1 rounded-2xl border border-white/5 mb-6">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${activeTab === 'info' ? 'bg-purple-600 shadow-lg text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                        <Store size={18} />
                        Dados do Parceiro
                    </button>
                    <button
                        onClick={() => setActiveTab('promotions')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${activeTab === 'promotions' ? 'bg-purple-600 shadow-lg text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                        <Tag size={18} />
                        Promoções
                        {fields.length > 0 && <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full ml-1">{fields.length}</span>}
                    </button>
                </div>

                <div className="space-y-5">
                    {activeTab === 'info' ? (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                                    <GraduationCap size={12} className="text-purple-400" /> Instituição Vinculada <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all appearance-none cursor-pointer"
                                        {...register('schoolId')}
                                    >
                                        <option value="" disabled className="bg-slate-900 text-slate-500">Selecione uma instituição...</option>
                                        {schools.map(s => (
                                            <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3.5 text-slate-500 pointer-events-none" size={16} />
                                </div>
                                {errors.schoolId && <span className="text-red-400 text-xs mt-1">{errors.schoolId.message}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Nome do Parceiro <span className="text-red-500">*</span></label>
                                <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-bold focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder-slate-600" {...register('name')} placeholder="Nome do estabelecimento" />
                                {errors.name && <span className="text-red-400 text-xs mt-1">{errors.name.message}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">CNPJ <span className="text-red-500">*</span></label>
                                <Controller
                                    control={control}
                                    name="cnpj"
                                    render={({ field }) => (
                                        <input
                                            className={`w-full bg-slate-950/50 border ${errors.cnpj ? 'border-red-500' : 'border-white/10'} rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder-slate-600`}
                                            placeholder="00.000.000/0000-00"
                                            {...field}
                                            value={field.value || ''}
                                            onChange={(e) => field.onChange(formatCNPJ(e.target.value))}
                                        />
                                    )}
                                />
                                {errors.cnpj && <span className="text-red-400 text-xs mt-1">{errors.cnpj.message}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">E-mail Comercial <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    className={`w-full bg-slate-950/50 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl p-3 text-white font-bold focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder-slate-600`}
                                    placeholder="parceiro@email.com"
                                    {...register('email')}
                                />
                                {errors.email && <span className="text-red-400 text-xs mt-1">{errors.email.message}</span>}
                            </div>

                            {withUserCreation && !partner && (
                                <div className="bg-slate-950/30 p-4 rounded-xl border border-white/5 space-y-4">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">Credenciais de Acesso (Gestor)</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Usuário</label>
                                            <input
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder-slate-600"
                                                value={username}
                                                onChange={e => setUsername(e.target.value)}
                                                placeholder="usuario.gestor"
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Senha</label>
                                            <input
                                                type="password"
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder-slate-600"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Categoria <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select className={`w-full bg-slate-950/50 border ${errors.category ? 'border-red-500' : 'border-white/10'} rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all appearance-none cursor-pointer`} {...register('category')}>
                                            <option value="" className="bg-slate-900 text-slate-500">Selecione...</option>
                                            <option value="Alimentação" className="bg-slate-900">Alimentação</option>
                                            <option value="Entretenimento" className="bg-slate-900">Entretenimento</option>
                                            <option value="Saúde" className="bg-slate-900">Saúde</option>
                                            <option value="Educação" className="bg-slate-900">Educação</option>
                                            <option value="Tecnologia" className="bg-slate-900">Tecnologia</option>
                                        </select>
                                        <ChevronRight className="absolute right-3 top-3.5 rotate-90 text-slate-500 pointer-events-none" size={16} />
                                    </div>
                                    {errors.category && <span className="text-red-400 text-xs mt-1">{errors.category.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Desconto (Texto) <span className="text-red-500">*</span></label>
                                    <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder-slate-600" placeholder="Ex: 15% OFF" {...register('discount')} />
                                    {errors.discount && <span className="text-red-400 text-xs mt-1">{errors.discount.message}</span>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Descrição <span className="text-red-500">*</span></label>
                                <textarea className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 h-24 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder-slate-600 resize-none" {...register('description')} placeholder="Descrição dos benefícios..." />
                                {errors.description && <span className="text-red-400 text-xs mt-1">{errors.description.message}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Endereço Completo <span className="text-red-500">*</span></label>
                                <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder-slate-600" {...register('address')} placeholder="Rua, Número, Bairro" />
                                {errors.address && <span className="text-red-400 text-xs mt-1">{errors.address.message}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Cidade <span className="text-red-500">*</span></label>
                                    <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder-slate-600" {...register('city')} />
                                    {errors.city && <span className="text-red-400 text-xs mt-1">{errors.city.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Estado (UF) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all appearance-none cursor-pointer" {...register('state')}>
                                            <option value="" className="bg-slate-900 text-slate-500">UF</option>
                                            {BRAZIL_STATES.map(uf => (
                                                <option key={uf} value={uf} className="bg-slate-900">{uf}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 text-slate-500 pointer-events-none" size={16} />
                                    </div>
                                    {errors.state && <span className="text-red-400 text-xs mt-1">{errors.state.message}</span>}
                                </div>
                            </div>

                            <div className="bg-slate-950/30 p-4 rounded-xl border border-white/5 space-y-4">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">Contato e Redes Sociais</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Phone size={12} /> WhatsApp/Telefone</label>
                                        <Controller
                                            control={control}
                                            name="phoneNumber"
                                            render={({ field }) => (
                                                <input
                                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder-slate-600"
                                                    placeholder="(00) 00000-0000"
                                                    {...field}
                                                    onChange={(e) => field.onChange(formatPhone(e.target.value))}
                                                />
                                            )}
                                        />
                                        {errors.phoneNumber && <span className="text-red-400 text-xs mt-1">{errors.phoneNumber.message}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Instagram size={12} /> Instagram URL</label>
                                        <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder-slate-600" placeholder="https://instagram.com/..." {...register('instagramUrl')} />
                                        {errors.instagramUrl && <span className="text-red-400 text-xs mt-1">{errors.instagramUrl.message}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Facebook size={12} /> Facebook URL</label>
                                        <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder-slate-600" placeholder="https://facebook.com/..." {...register('facebookUrl')} />
                                        {errors.facebookUrl && <span className="text-red-400 text-xs mt-1">{errors.facebookUrl.message}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Globe size={12} /> TikTok / Website</label>
                                        <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder-slate-600" placeholder="https://tiktok.com/..." {...register('tiktokUrl')} />
                                        {errors.tiktokUrl && <span className="text-red-400 text-xs mt-1">{errors.tiktokUrl.message}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Logo Upload Section */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Logo / Imagem de Perfil <span className="text-red-500">*</span></label>
                                    <div className="flex bg-slate-950/80 rounded-lg p-0.5 border border-white/10">
                                        <button
                                            onClick={() => setLogoUploadMode('url')}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${logoUploadMode === 'url' ? 'bg-purple-600 shadow text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Link URL
                                        </button>
                                        <button
                                            onClick={() => setLogoUploadMode('file')}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${logoUploadMode === 'file' ? 'bg-purple-600 shadow text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Upload
                                        </button>
                                    </div>
                                </div>
                                {logoUploadMode === 'url' ? (
                                    <input
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder-slate-600"
                                        {...register('logoUrl')}
                                        placeholder="https://..."
                                    />
                                ) : (
                                    <div className="border-2 border-dashed border-slate-700/50 rounded-xl p-6 text-center hover:bg-slate-900/30 hover:border-purple-500/40 transition-all cursor-pointer relative group bg-slate-950/30">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onChange={(e) => handleFileUpload(e, 'logoUrl')}
                                        />
                                        <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-purple-400 transition-colors">
                                            <Upload size={20} />
                                            <span className="text-sm font-bold">Upload Logo</span>
                                        </div>
                                    </div>
                                )}
                                {logoUrl && (
                                    <div className="mt-3 flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden bg-slate-900">
                                            <img src={logoUrl} className="w-full h-full object-cover" alt="Preview" />
                                        </div>
                                        <span className="text-xs text-slate-400 font-medium break-all line-clamp-1">{logoUrl}</span>
                                    </div>
                                )}
                                {errors.logoUrl && <span className="text-red-400 text-xs mt-1">{errors.logoUrl.message}</span>}
                            </div>

                            {/* Banner Upload Section */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Imagem de Banner / Capa</label>
                                    <div className="flex bg-slate-950/80 rounded-lg p-0.5 border border-white/10">
                                        <button
                                            onClick={() => setBannerUploadMode('url')}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${bannerUploadMode === 'url' ? 'bg-purple-600 shadow text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                            type="button"
                                        >
                                            Link URL
                                        </button>
                                        <button
                                            onClick={() => setBannerUploadMode('file')}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${bannerUploadMode === 'file' ? 'bg-purple-600 shadow text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                            type="button"
                                        >
                                            Upload
                                        </button>
                                    </div>
                                </div>
                                {bannerUploadMode === 'url' ? (
                                    <input
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder-slate-600"
                                        {...register('bannerUrl')}
                                        placeholder="https://..."
                                    />
                                ) : (
                                    <div className="border-2 border-dashed border-slate-700/50 rounded-xl p-6 text-center hover:bg-slate-900/30 hover:border-purple-500/40 transition-all cursor-pointer relative group bg-slate-950/30">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onChange={(e) => handleFileUpload(e, 'bannerUrl')}
                                        />
                                        <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-purple-400 transition-colors">
                                            <Upload size={20} />
                                            <span className="text-sm font-bold">Upload Banner</span>
                                        </div>
                                    </div>
                                )}
                                {bannerUrl && (
                                    <div className="mt-3">
                                        <img src={bannerUrl} className="w-full h-32 object-cover rounded-xl border border-white/10 shadow-lg" alt="Banner Preview" />
                                    </div>
                                )}
                                {errors.bannerUrl && <span className="text-red-400 text-xs mt-1">{errors.bannerUrl.message}</span>}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            {/* Enhanced Promotion Form */}
                            <div className="bg-slate-950/30 p-5 rounded-2xl border border-white/5 space-y-4">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
                                    <Plus size={16} className="text-purple-400" /> Nova Promoção
                                </h3>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Título da Promoção</label>
                                        <input
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder-slate-600"
                                            placeholder="Ex: 50% de Desconto em Pizzas"
                                            value={promoTitle}
                                            onChange={(e) => setPromoTitle(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Tipo de Limite</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all appearance-none cursor-pointer"
                                                    value={promoLimit}
                                                    onChange={(e) => setPromoLimit(e.target.value as any)}
                                                >
                                                    <option value="UNLIMITED" className="bg-slate-900">Ilimitado</option>
                                                    <option value="MONTHLY" className="bg-slate-900">Mensal (1x/mês)</option>
                                                    <option value="ONCE" className="bg-slate-900">Único (1x/CPF)</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-3.5 text-slate-500 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Válido Até (Opcional)</label>
                                            <input
                                                type="date"
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                                                value={promoValidUntil}
                                                onChange={(e) => setPromoValidUntil(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Descrição Detalhada (Opcional)</label>
                                        <textarea
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 h-20 text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder-slate-600 resize-none"
                                            placeholder="Regras e condições da promoção..."
                                            value={promoDescription}
                                            onChange={(e) => setPromoDescription(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        onClick={handleAddPromotion}
                                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
                                        type="button"
                                    >
                                        <Plus size={20} />
                                        Adicionar Promoção
                                    </button>
                                </div>
                            </div>

                            {/* Promotion List */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest pl-1">
                                    Promoções Ativas ({fields.length})
                                </h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                                    {fields.map((promo, idx) => (
                                        <div key={promo.id} className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all group flex flex-col gap-2 relative">
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-white">{promo.title}</span>
                                                        {promo.limit === 'UNLIMITED' && (
                                                            <span className="bg-green-500/10 text-green-400 text-[10px] px-2 py-0.5 rounded-full border border-green-500/20 font-bold uppercase">Ilimitado</span>
                                                        )}
                                                        {promo.limit === 'MONTHLY' && (
                                                            <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/20 font-bold uppercase">Mensal</span>
                                                        )}
                                                        {promo.limit === 'ONCE' && (
                                                            <span className="bg-orange-500/10 text-orange-400 text-[10px] px-2 py-0.5 rounded-full border border-orange-500/20 font-bold uppercase">Único</span>
                                                        )}
                                                    </div>
                                                    {promo.validUntil && (
                                                        <span className="text-[10px] text-slate-500 font-medium italic">
                                                            Expira em: {new Date(promo.validUntil).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleRemovePromotion(idx)}
                                                    className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                                    type="button"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            {promo.description && (
                                                <p className="text-xs text-slate-400 line-clamp-2 italic">{promo.description}</p>
                                            )}
                                        </div>
                                    ))}
                                    {fields.length === 0 && (
                                        <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-3xl">
                                            <Tag size={32} className="mx-auto text-slate-700 mb-2 opacity-20" />
                                            <p className="text-sm text-slate-500 font-medium">Nenhuma promoção cadastrada.</p>
                                            <p className="text-xs text-slate-600">Adicione uma nova promoção acima para começar.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 text-slate-500">
                        <ShieldCheck size={16} />
                        <span className="text-[10px] uppercase font-bold tracking-tight">LGPD: Dados empresariais protegidos</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} disabled={isUploading} className="px-6 py-2.5 rounded-xl border border-white/10 font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-all disabled:opacity-50">Cancelar</button>
                        <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={isUploading}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                        >
                            {isUploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Salvar Parceiro'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
