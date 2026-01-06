import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMembers } from '../../context/MemberContext';
import { usePartners } from '../../context/PartnerContext';
import { useAnalytics } from '../../context/AnalyticsContext';
import { PartnerDetailCard } from './PartnerDetailCard';
import { Scanner } from '../Scanner';
import { TrendingUp, TrendingDown, Store, Camera, X, CheckCircle, XCircle, Search, History, ScanLine, LogOut, User, Menu, Calendar, Ticket, Info, AlertCircle, Edit2, Save, AlertTriangle, Instagram, Facebook, Video, Phone, Plus, Trash2, BarChart, Activity, Users, Clock, ToggleLeft, ToggleRight, Image, Upload } from 'lucide-react';
import { ActionType, AuditLog, MemberType, Partner, Promotion, PromotionUsageLimit, Student } from '../../types';
import { maskCPF } from '../../utils/masking';
import { MetricsDashboard } from './analytics/MetricsDashboard';
import { ValidationHistory } from './history/ValidationHistory';
import { usePartnerEditor } from './hooks/usePartnerEditor';
import { usePartnerScanner } from './hooks/usePartnerScanner';
import { useValidationHistory } from './hooks/useValidationHistory';
import { PromotionManager } from './promotions/PromotionManager';
import { ScannerView } from './validation/ScannerView';
import { HeaderControls } from '../../components/HeaderControls';

// Chart components moved to MetricsDashboard

type Tab = 'my-store' | 'validate' | 'logs' | 'metrics';

const PARTNER_CATEGORIES = [
    "Alimentação & Bebidas",
    "Livraria & Papelaria",
    "Moda & Acessórios",
    "Beleza & Bem-estar",
    "Informática & Eletrônicos",
    "Lazer & Entretenimento",
    "Saúde & Fitness",
    "Serviços Automotivos",
    "Cursos & Educação",
    "Outros"
];

export const StoreView: React.FC = () => {
    const { user, logout } = useAuth();
    const { students, schools } = useMembers();
    const { partners, isLoading } = usePartners();
    const { auditLogs } = useAnalytics();

    const isStoreUser = user?.role === 'STORE';
    const isStoreAdmin = user?.role === 'STORE_ADMIN';

    const [activeTab, setActiveTab] = useState<Tab>(isStoreUser ? 'validate' : 'metrics');

    // Partner Logic
    const currentPartner = partners.find(p => p.id === user?.username) ||
        partners.find(p => user?.username.startsWith(`${p.id}.`)) ||
        partners[0];

    const {
        isEditingPartner, setIsEditingPartner, editedPartner, setEditedPartner,
        showSaveWarning, setShowSaveWarning, handleAddPromotion, handleUpdatePromotion,
        handleTogglePromotionStatus, handleSavePartner, toggleSocialVisibility
    } = usePartnerEditor(currentPartner);

    const {
        showScanner, setShowScanner, scannedStudent, setScannedStudent, scanError,
        manualCpf, setManualCpf, handleScan, handleCpfValidation, handleRegisterBenefit
    } = usePartnerScanner(currentPartner);

    const { myLogs } = useValidationHistory(currentPartner);

    useEffect(() => {
        if (isStoreUser && activeTab === 'metrics') {
            setActiveTab('validate');
        }
    }, [isStoreUser, activeTab]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // ... (rest of code logic) but wait, I just need to return early for loading.
    // AND then update the JSX for validation tab.

    // To cleanly update, I will need to break this into chunks or use multi-replace.
    // I will use replace_file_content for the whole area if I can, but the file is large.
    // Let's use multi_replace.


    const storeSteps = [
        {
            title: "Boas-vindas, Lojista Parceiro!",
            content: "O UniPass ajuda você a atrair mais clientes e fidelizar o público estudantil da sua região."
        },
        {
            title: "Validação Instantânea",
            content: "Na aba 'Validação de ID', você pode scanear o QR Code ou digitar o CPF para confirmar se o membro tem direito ao benefício."
        },
        {
            title: "Resultados em Tempo Real",
            content: "Acompanhe quantas economias sua loja já gerou e quantos membros únicos você alcançou na aba de Métricas."
        },
        {
            title: "Sua Loja no Mapa",
            content: "Mantenha seu perfil completo com fotos e promoções ativas para aparecer com destaque na carteirinha dos membros."
        }
    ];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'bannerUrl') => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500 * 1024) { // 500KB Limit
                alert("O arquivo deve ter no máximo 500KB.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setEditedPartner(prev => prev ? ({ ...prev, [field]: event.target?.result as string }) : null);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-inter pb-20 lg:pb-0 flex flex-col lg:flex-row">
            {/* Warning Modal */}
            {showSaveWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <AlertTriangle size={120} className="text-amber-500" />
                        </div>

                        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-6 mx-auto relative z-10">
                            <AlertTriangle size={32} />
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 text-center mb-4 relative z-10">Atenção!</h3>
                        <p className="text-slate-600 text-center mb-8 relative z-10">
                            Você está modificando seus benefícios e promoções. Entre em contato com a escola parceira para que ela avise os membros sobre as mudanças.
                        </p>

                        <div className="flex gap-3 relative z-10">
                            <button
                                onClick={() => setShowSaveWarning(false)}
                                className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSavePartner}
                                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
                            >
                                Entendi, Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DESKTOP SIDEBAR */}
            <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 h-screen sticky top-0 px-6 py-8 justify-between z-20 shadow-sm">
                <div>
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-white font-bold text-lg">U</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-slate-800 tracking-tight">UniPass</h1>
                            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{user?.role === 'STORE_ADMIN' ? 'Gestor' : 'Parceiro'}</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {!isStoreUser && (
                            <button onClick={() => setActiveTab('metrics')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'metrics' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                                <BarChart size={20} className={activeTab === 'metrics' ? 'text-indigo-600' : 'text-slate-400'} />
                                Métricas
                            </button>
                        )}
                        {!isStoreUser && (
                            <button onClick={() => setActiveTab('my-store')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'my-store' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                                <Store size={20} className={activeTab === 'my-store' ? 'text-indigo-600' : 'text-slate-400'} />
                                Meu Estabelecimento
                            </button>
                        )}
                        <button onClick={() => setActiveTab('validate')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'validate' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                            <ScanLine size={20} className={activeTab === 'validate' ? 'text-indigo-600' : 'text-slate-400'} />
                            Validação de ID
                        </button>
                        <button onClick={() => setActiveTab('logs')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'logs' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                            <History size={20} className={activeTab === 'logs' ? 'text-indigo-600' : 'text-slate-400'} />
                            Histórico de Validações
                        </button>
                    </nav>
                </div>
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-colors">
                    <LogOut size={20} /> Sair
                </button>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 min-h-screen relative overflow-y-auto">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b border-slate-200 p-4 fixed top-0 left-0 right-0 z-50 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">U</span>
                        </div>
                        <h1 className="font-bold text-slate-800">{user?.role === 'STORE_ADMIN' ? 'Gestor' : 'Parceiro'}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <HeaderControls />
                        <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-500 outline-none rounded-lg" aria-label="Sair do sistema"><LogOut size={20} /></button>
                    </div>
                </header>

                <div className="p-4 pt-24 lg:p-10 max-w-5xl mx-auto">

                    {/* TAB: METRICS */}
                    {!isStoreUser && activeTab === 'metrics' && currentPartner && (
                        <MetricsDashboard
                            partner={currentPartner}
                            auditLogs={auditLogs}
                            schools={schools}
                        />
                    )}

                    {/* TAB: MY STORE */}
                    {!isStoreUser && activeTab === 'my-store' && (
                        currentPartner ? (
                            <div className="animate-fade-in">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900">Meu Estabelecimento</h2>
                                    {isStoreAdmin && !isEditingPartner && (
                                        <button
                                            onClick={() => {
                                                setEditedPartner(currentPartner);
                                                setIsEditingPartner(true);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                                        >
                                            <Edit2 size={16} /> Editar Perfil
                                        </button>
                                    )}
                                </div>
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                                    {isEditingPartner && editedPartner ? (
                                        <div className="p-6 space-y-8">
                                            {/* SECTION 1: DETAILS */}
                                            <div className="space-y-6">
                                                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 border-b border-slate-100 pb-2">
                                                    <Store size={20} className="text-indigo-500" /> Informações Básicas
                                                </h3>

                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nome do Estabelecimento *</label>
                                                    <input
                                                        type="text"
                                                        value={editedPartner.name}
                                                        onChange={e => setEditedPartner({ ...editedPartner, name: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2">Categoria</label>
                                                        <div className="relative">
                                                            <select
                                                                value={editedPartner.category}
                                                                onChange={e => setEditedPartner({ ...editedPartner, category: e.target.value })}
                                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all appearance-none bg-white"
                                                            >
                                                                {PARTNER_CATEGORIES.map(cat => (
                                                                    <option key={cat} value={cat}>{cat}</option>
                                                                ))}
                                                            </select>
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2">Desconto Padrão (Benefício) *</label>
                                                        <input
                                                            type="text"
                                                            value={editedPartner.discount}
                                                            onChange={e => setEditedPartner({ ...editedPartner, discount: e.target.value })}
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                                            placeholder="Ex: 10% OFF"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2">Logo (URL ou Upload)</label>
                                                        <div className="relative flex gap-2">
                                                            <div className="relative flex-1">
                                                                <input
                                                                    type="text"
                                                                    value={editedPartner.logoUrl || ''}
                                                                    onChange={e => setEditedPartner({ ...editedPartner, logoUrl: e.target.value })}
                                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all pl-10"
                                                                    placeholder="https://..."
                                                                />
                                                                <Store size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                                            </div>
                                                            <label className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl px-4 flex items-center justify-center cursor-pointer transition-colors border border-slate-200" title="Upload Imagem (Máx 500KB)">
                                                                <Upload size={20} />
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={(e) => handleFileUpload(e, 'logoUrl')}
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2">Banner (URL ou Upload)</label>
                                                        <div className="relative flex gap-2">
                                                            <div className="relative flex-1">
                                                                <input
                                                                    type="text"
                                                                    value={editedPartner.bannerUrl || ''}
                                                                    onChange={e => setEditedPartner({ ...editedPartner, bannerUrl: e.target.value })}
                                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all pl-10"
                                                                    placeholder="https://..."
                                                                />
                                                                <Image size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                                            </div>
                                                            <label className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl px-4 flex items-center justify-center cursor-pointer transition-colors border border-slate-200" title="Upload Imagem (Máx 500KB)">
                                                                <Upload size={20} />
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={(e) => handleFileUpload(e, 'bannerUrl')}
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">Descrição / Marketing</label>
                                                    <textarea
                                                        value={editedPartner.description}
                                                        onChange={e => setEditedPartner({ ...editedPartner, description: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all min-h-[100px]"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">Endereço Completo</label>
                                                    <input
                                                        type="text"
                                                        value={editedPartner.address}
                                                        onChange={e => setEditedPartner({ ...editedPartner, address: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* SECTION 2: CONTACT & SOCIALS */}
                                            <div className="space-y-6">
                                                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 border-b border-slate-100 pb-2">
                                                    <Phone size={20} className="text-emerald-500" /> Contato e Redes Sociais
                                                </h3>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                                                                <Phone size={14} /> Telefone / WhatsApp
                                                            </label>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleSocialVisibility('phone')}
                                                                className={editedPartner.socialVisibility?.phone !== false ? "text-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none rounded-md" : "text-slate-300 focus-visible:ring-2 focus-visible:ring-slate-300 outline-none rounded-md"}
                                                                aria-label={editedPartner.socialVisibility?.phone !== false ? "Desativar visibilidade do telefone" : "Ativar visibilidade do telefone"}
                                                            >
                                                                {editedPartner.socialVisibility?.phone !== false ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={editedPartner.phoneNumber || ''}
                                                            onChange={e => setEditedPartner({ ...editedPartner, phoneNumber: e.target.value })}
                                                            className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all ${editedPartner.socialVisibility?.phone === false ? 'opacity-50 bg-slate-100' : ''}`}
                                                            placeholder="(XX) XXXXX-XXXX"
                                                            disabled={editedPartner.socialVisibility?.phone === false}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                                                                <Instagram size={14} className="text-pink-500" /> Instagram
                                                            </label>
                                                            <button type="button" onClick={() => toggleSocialVisibility('instagram')} className={editedPartner.socialVisibility?.instagram !== false ? "text-emerald-500" : "text-slate-300"}>
                                                                {editedPartner.socialVisibility?.instagram !== false ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={editedPartner.instagramUrl || ''}
                                                            onChange={e => setEditedPartner({ ...editedPartner, instagramUrl: e.target.value })}
                                                            className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all ${editedPartner.socialVisibility?.instagram === false ? 'opacity-50 bg-slate-100' : ''}`}
                                                            placeholder="https://instagram.com/..."
                                                            disabled={editedPartner.socialVisibility?.instagram === false}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                                                                <Facebook size={14} className="text-blue-600" /> Facebook
                                                            </label>
                                                            <button type="button" onClick={() => toggleSocialVisibility('facebook')} className={editedPartner.socialVisibility?.facebook !== false ? "text-emerald-500" : "text-slate-300"}>
                                                                {editedPartner.socialVisibility?.facebook !== false ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={editedPartner.facebookUrl || ''}
                                                            onChange={e => setEditedPartner({ ...editedPartner, facebookUrl: e.target.value })}
                                                            className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all ${editedPartner.socialVisibility?.facebook === false ? 'opacity-50 bg-slate-100' : ''}`}
                                                            placeholder="https://facebook.com/..."
                                                            disabled={editedPartner.socialVisibility?.facebook === false}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                                                                <Video size={14} className="text-black" /> TikTok
                                                            </label>
                                                            <button type="button" onClick={() => toggleSocialVisibility('tiktok')} className={editedPartner.socialVisibility?.tiktok !== false ? "text-emerald-500" : "text-slate-300"}>
                                                                {editedPartner.socialVisibility?.tiktok !== false ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={editedPartner.tiktokUrl || ''}
                                                            onChange={e => setEditedPartner({ ...editedPartner, tiktokUrl: e.target.value })}
                                                            className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all ${editedPartner.socialVisibility?.tiktok === false ? 'opacity-50 bg-slate-100' : ''}`}
                                                            placeholder="https://tiktok.com/@..."
                                                            disabled={editedPartner.socialVisibility?.tiktok === false}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* SECTION 3: PROMOTIONS */}
                                            <PromotionManager
                                                partner={editedPartner}
                                                onAddPromotion={handleAddPromotion}
                                                onToggleStatus={handleTogglePromotionStatus}
                                                onUpdatePromotion={handleUpdatePromotion}
                                            />

                                            {/* Actions */}
                                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                                <button
                                                    onClick={() => setIsEditingPartner(false)}
                                                    className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={() => setShowSaveWarning(true)}
                                                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                                                >
                                                    <Save size={18} /> Salvar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Preview Mode */
                                        <div className="relative lg:pb-0">
                                            <PartnerDetailCard partner={currentPartner} onClose={() => { }} isEmbedded={true} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 text-slate-500">Parceiro não vinculado.</div>
                        )
                    )}

                    {/* TAB: VALIDATION */}
                    {activeTab === 'validate' && (
                        currentPartner ? (
                            <ScannerView
                                partner={currentPartner}
                                scannedStudent={scannedStudent}
                                scanError={scanError}
                                manualCpf={manualCpf}
                                onManualCpfChange={setManualCpf}
                                onCpfValidation={handleCpfValidation}
                                onOpenScanner={() => setShowScanner(true)}
                                onNewValidation={() => setScannedStudent(null)}
                                onRegisterBenefit={handleRegisterBenefit}
                                auditLogs={auditLogs}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-fade-in">
                                <Store size={64} className="mb-6 text-slate-200" />
                                <h3 className="text-xl font-bold text-slate-600 mb-2">Nenhum Estabelecimento Vinculado</h3>
                                <p className="text-center max-w-sm mb-8 text-slate-500">
                                    Não encontramos um estabelecimento associado à sua conta <strong>{user?.username}</strong>.
                                </p>
                                <button onClick={logout} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm">
                                    Sair e tentar novamente
                                </button>
                            </div>
                        )
                    )}

                    {/* TAB: LOGS */}
                    {activeTab === 'logs' && (
                        <ValidationHistory
                            logs={myLogs}
                            students={students}
                        />
                    )}
                </div>
            </main>

            {/* MOBILE NAV */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-center gap-12 items-center z-50 safe-area-bottom">
                {!isStoreUser && (
                    <button onClick={() => setActiveTab('metrics')} className={`flex flex-col items-center gap-1 ${activeTab === 'metrics' ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <BarChart size={24} strokeWidth={activeTab === 'metrics' ? 2.5 : 2} />
                        <span className="text-[10px] font-bold">Métricas</span>
                    </button>
                )}
                {!isStoreUser && (
                    <button onClick={() => setActiveTab('my-store')} className={`flex flex-col items-center gap-1 ${activeTab === 'my-store' ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <Store size={24} strokeWidth={activeTab === 'my-store' ? 2.5 : 2} />
                        <span className="text-[10px] font-bold">Loja</span>
                    </button>
                )}
                <button onClick={() => setActiveTab('validate')} className={`flex flex-col items-center gap-1 ${activeTab === 'validate' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <ScanLine size={24} strokeWidth={activeTab === 'validate' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold">Validar</span>
                </button>
                <button onClick={() => setActiveTab('logs')} className={`flex flex-col items-center gap-1 ${activeTab === 'logs' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <History size={24} strokeWidth={activeTab === 'logs' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold">Logs</span>
                </button>
            </div>

            {/* SCANNER MODAL */}
            {showScanner && (
                <Scanner onScan={handleScan} onClose={() => setShowScanner(false)} />
            )}
        </div>
    );
};
