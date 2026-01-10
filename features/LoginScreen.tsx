import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    User as UserIcon,
    Lock,
    Eye,
    EyeOff,
    CircleUserRound,
    ArrowRight,
    ShieldCheck,
    Globe,
    Smartphone,
    ArrowLeft,
    CheckCircle,
    Building2,
    Store as StoreIcon
} from 'lucide-react';
import { AppUser } from '../types';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { formatCPF, formatCNPJ } from '../utils/formatters';

interface LoginScreenProps {
    users?: AppUser[];
    onLogin?: (user: AppUser) => void;
    onPasswordUpdate?: (userId: string, newPass: string) => void;
}

type ViewState = 'LOGIN' | 'FORGOT_PASSWORD' | 'CHANGE_PASSWORD' | 'FIRST_ACCESS';

export const LoginScreen: React.FC<LoginScreenProps> = ({ users = [], onLogin, onPasswordUpdate }) => {
    const { authError } = useAuth();
    const [view, setView] = useState<ViewState>('LOGIN');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [authorizedUser, setAuthorizedUser] = useState<AppUser | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // New Password State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Forgot Password State
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotSuccess, setForgotSuccess] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem('unipass_last_user');
        if (savedUser) {
            setUsername(savedUser);
            setRememberMe(true);
        }
    }, []);

    // Reset processing state if an error comes from the context
    useEffect(() => {
        if (authError) {
            setIsProcessing(false);
        }
    }, [authError]);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsProcessing(true);

        const cleanUsername = username.trim();
        const cleanPassword = password.trim();

        console.log('Attempting login with:', cleanUsername);

        try {
            // 1. Try Attendant Login First (Simplified Login)
            const { data: attendantData, error: attendantError } = await supabase.rpc('login_attendant', {
                p_username: cleanUsername,
                p_password: cleanPassword
            });

            if (attendantData) {
                console.log('Attendant login successful:', attendantData);
                localStorage.setItem('unipass_attendant_session', JSON.stringify(attendantData));
                window.location.reload(); // Force AuthContext to reload and pick up session
                return;
            }

            // 2. Standard Supabase Auth Login
            const isCPF = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(cleanUsername) || /^\d{11}$/.test(cleanUsername);

            if (isCPF) {
                setError('Para sua segurança, utilize o e-mail cadastrado. Caso não lembre qual e-mail está vinculado ao seu CPF, contate o suporte.');
                setIsProcessing(false);
                return;
            }

            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: cleanUsername,
                password: cleanPassword,
            });

            if (signInError) {
                console.warn('Login failure:', signInError.message);
                if (signInError.message === 'Invalid login credentials') {
                    setError('E-mail ou senha incorretos.');
                } else {
                    setError(signInError.message);
                }
                setIsProcessing(false);
                return;
            }

            if (data.user) {
                if (rememberMe) {
                    localStorage.setItem('unipass_last_user', cleanUsername);
                } else {
                    localStorage.removeItem('unipass_last_user');
                }
                // Redirection will be handled by AuthContext.tsx listener
            }
        } catch (err: any) {
            setError('Erro inesperado: ' + err.message);
            setIsProcessing(false);
        }
    };

    const handlePasswordChangeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (newPassword.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (authorizedUser && onPasswordUpdate && onLogin) {
            // Update parent state
            onPasswordUpdate(authorizedUser.id, newPassword);

            // Login with new data
            const updatedUser = { ...authorizedUser, password: newPassword, mustChangePassword: false };
            onLogin(updatedUser);
        }
    };

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
                redirectTo: `${window.location.origin}/login?view=CHANGE_PASSWORD`,
            });

            if (resetError) {
                setError(resetError.message);
                return;
            }

            setForgotSuccess(true);
        } catch (err: any) {
            setError('Ocorreu um erro ao tentar enviar o e-mail de recuperação.');
            console.error('Reset password error:', err);
        }
    };

    const toggleView = (newView: ViewState) => {
        setView(newView);
        setError('');
        setForgotSuccess(false);
        setForgotEmail('');
        // Reset First Access State
        setFirstAccessStage('SELECT_ROLE');
        setFirstAccessInput('');
        setFoundIdentity(null);
        setFirstAccessRole('STUDENT');
    };

    // --- First Access State ---
    const [firstAccessStage, setFirstAccessStage] = useState<'SELECT_ROLE' | 'CHECK_ID' | 'CONFIRM_IDENTITY' | 'REGISTER'>('SELECT_ROLE');
    const [firstAccessRole, setFirstAccessRole] = useState<'STUDENT' | 'SCHOOL_ADMIN' | 'STORE_ADMIN'>('STUDENT');
    const [firstAccessInput, setFirstAccessInput] = useState(''); // CPF or CNPJ
    const [firstAccessEmail, setFirstAccessEmail] = useState('');
    const [firstAccessPassword, setFirstAccessPassword] = useState('');
    const [firstAccessConfirm, setFirstAccessConfirm] = useState('');
    const [foundIdentity, setFoundIdentity] = useState<{ id: string, name: string, activated: boolean, masked_email?: string } | null>(null);

    const handleCheckIdentity = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsProcessing(true);

        try {
            let rpcName = 'check_student_identity';
            let paramName = 'check_cpf';

            if (firstAccessRole === 'SCHOOL_ADMIN') {
                rpcName = 'check_school_identity';
                paramName = 'check_cnpj';
            } else if (firstAccessRole === 'STORE_ADMIN') {
                rpcName = 'check_partner_identity';
                paramName = 'check_cnpj';
            }

            const { data, error } = await supabase.rpc(rpcName, {
                [paramName]: firstAccessInput
            }).single() as any;

            if (error) throw error;

            if (data && data.found) {
                if (data.activated) {
                    setError('Este cadastro já foi ativado. Por favor, faça login com seu e-mail e senha.');
                    return;
                }

                if (firstAccessRole === 'STUDENT' && data.masked_email === 'contate-sua-escola') {
                    setError('Seu cadastro foi localizado, mas não possui um e-mail vinculado. Por favor, contate sua instituição.');
                    return;
                }

                setFoundIdentity(data);

                // Admin skips confirm identity stage as per user feedback
                if (firstAccessRole !== 'STUDENT') {
                    setFirstAccessStage('REGISTER');
                } else {
                    setFirstAccessStage('CONFIRM_IDENTITY');
                }
            } else {
                const term = firstAccessRole === 'STUDENT' ? 'CPF' : 'CNPJ';
                const base = firstAccessRole === 'STUDENT' ? 'alunos' : (firstAccessRole === 'SCHOOL_ADMIN' ? 'escolas' : 'parceiros');
                setError(`${term} não encontrado na base de ${base}. Verifique se digitou corretamente.`);
            }
        } catch (err: any) {
            console.error('Check Identity Error:', err);
            setError('Erro ao verificar identidade. Tente novamente.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmIdentity = () => {
        setFirstAccessStage('REGISTER');
        setError('');
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (firstAccessPassword !== firstAccessConfirm) {
            setError('As senhas não coincidem.');
            return;
        }

        if (firstAccessPassword.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        setIsProcessing(true);

        try {
            const signUpOptions: any = {
                data: {
                    full_name: foundIdentity?.name,
                    role: firstAccessRole
                }
            };

            if (firstAccessRole === 'STUDENT') {
                signUpOptions.data.cpf = firstAccessInput;
            } else if (firstAccessRole === 'SCHOOL_ADMIN') {
                signUpOptions.data.school_id = foundIdentity?.id;
            } else if (firstAccessRole === 'STORE_ADMIN') {
                signUpOptions.data.partner_id = foundIdentity?.id;
            }

            const { data, error: signUpError } = await supabase.auth.signUp({
                email: firstAccessEmail,
                password: firstAccessPassword,
                options: signUpOptions
            });

            if (signUpError) throw signUpError;

            if (data.user) {
                if (data.session) {
                    // Auto logged in
                } else {
                    alert('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
                    toggleView('LOGIN');
                }
            }

        } catch (err: any) {
            console.error('Registration Error:', err);
            setError(err.message || 'Erro ao criar conta.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50 font-inter">
            {/* LEFT SIDE - Marketing / Branding */}
            <div className="hidden lg:flex w-1/2 bg-[#0a0a16] relative flex-col justify-between p-16 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>

                {/* Header */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="text-white font-bold text-lg">U</span>
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-xl tracking-wide">UniPass</h1>
                        <p className="text-indigo-400 text-[10px] items-center tracking-[0.2em] font-medium">DATA FOUNDATION V2.1</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 my-auto">
                    <h2 className="text-5xl font-extrabold text-white leading-[1.1] mb-12">
                        A TUA<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">IDENTIDADE</span><br />
                        DIGITAL.
                    </h2>

                    <div className="space-y-6 max-w-md">
                        {/* Feature 1 */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-4 flex items-start gap-4 hover:bg-white/10 transition-colors cursor-default">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-400 mt-1">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm mb-1">Segurança LGPD</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">Dados e logs de auditoria imutáveis.</p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-4 flex items-start gap-4 hover:bg-white/10 transition-colors cursor-default">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 mt-1">
                                <Globe size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm mb-1">Ecossistema Ativo</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">Benefícios reais em centenas de parceiros.</p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-4 flex items-start gap-4 hover:bg-white/10 transition-colors cursor-default">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 mt-1">
                                <Smartphone size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm mb-1">PWA Offline</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">Aceda à sua ID sem ligação à rede.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-slate-500 text-xs">
                    © 2024 UniPass Inc. All rights reserved.
                </div>
            </div>

            {/* RIGHT SIDE - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F8FAFC]">
                <div className="w-full max-w-[420px]">

                    {view === 'LOGIN' && (
                        <div className="animate-fade-in">
                            <div className="text-center mb-10">
                                <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20 mx-auto mb-6">
                                    <span className="text-white font-bold text-3xl">U</span>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">BEM-VINDO AO UNIPASS</h2>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto">Inicie sessão para gerir os seus benefícios e identidade.</p>
                            </div>

                            <form onSubmit={handleLoginSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                            EMAIL
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <CircleUserRound className="h-5 w-5 text-slate-300" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium"
                                                placeholder="seu@email.com"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                            SENHA
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-slate-300" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                className="block w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium tracking-widest"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-indigo-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                            />
                                            <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all"></div>
                                            <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 transition-opacity">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                        <span className="text-sm text-slate-600 font-medium group-hover:text-slate-800 transition-colors">Manter conectado</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => toggleView('FORGOT_PASSWORD')}
                                        className="text-sm font-bold text-indigo-600 hover:text-indigo-700 tracking-wide uppercase"
                                    >
                                        RECUPERAR SENHA
                                    </button>
                                </div>

                                {(error || authError) && (
                                    <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl flex items-start gap-3 border border-red-100 animate-shake">
                                        <span className="text-lg mt-0.5">⚠️</span>
                                        <div className="flex-1">
                                            <p className="font-semibold mb-0.5">Ops! Algo deu errado</p>
                                            <p className="text-red-500/80 text-xs leading-relaxed">{error || authError}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="w-full bg-[#5664F5] hover:bg-[#4351e0] disabled:bg-[#a5acf8] text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                                    >
                                        {isProcessing ? 'ENTRANDO...' : 'ENTRAR'}
                                        {!isProcessing && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => toggleView('FIRST_ACCESS')}
                                        className="w-full bg-white border-2 border-indigo-100 hover:border-indigo-200 text-indigo-600 font-bold py-4 px-4 rounded-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 uppercase"
                                    >
                                        PRIMEIRO ACESSO
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {view === 'FIRST_ACCESS' && (
                        <div className="animate-slide-up">
                            <button
                                onClick={() => toggleView('LOGIN')}
                                className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors font-medium"
                            >
                                <ArrowLeft size={16} /> Voltar ao Login
                            </button>

                            <div className="text-center mb-8">
                                <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-sm">
                                    <UserIcon className="text-green-600 w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Primeiro Acesso</h2>
                                {firstAccessStage === 'SELECT_ROLE' && <p className="text-slate-500 text-sm">Selecione o seu perfil de acesso.</p>}
                                {firstAccessStage === 'CHECK_ID' && <p className="text-slate-500 text-sm">Informe os dados para localizarmos seu cadastro.</p>}
                                {firstAccessStage === 'CONFIRM_IDENTITY' && <p className="text-slate-500 text-sm">Confirme se os dados abaixo estão corretos.</p>}
                                {firstAccessStage === 'REGISTER' && <p className="text-slate-500 text-sm">Crie sua senha de acesso.</p>}
                            </div>

                            {/* STAGE: SELECT ROLE */}
                            {firstAccessStage === 'SELECT_ROLE' && (
                                <div className="space-y-4 animate-fade-in">
                                    <button
                                        onClick={() => { setFirstAccessRole('STUDENT'); setFirstAccessStage('CHECK_ID'); }}
                                        className="w-full p-4 bg-white border-2 border-slate-100 hover:border-indigo-100 rounded-2xl flex items-center gap-4 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <UserIcon size={24} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-slate-900">Sou Aluno</h3>
                                            <p className="text-xs text-slate-500">Acesso via CPF e matrícula escolar.</p>
                                        </div>
                                        <ArrowRight size={20} className="ml-auto text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                    </button>

                                    <button
                                        onClick={() => { setFirstAccessRole('SCHOOL_ADMIN'); setFirstAccessStage('CHECK_ID'); }}
                                        className="w-full p-4 bg-white border-2 border-slate-100 hover:border-indigo-100 rounded-2xl flex items-center gap-4 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Building2 size={24} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-slate-900">Instituição de Ensino</h3>
                                            <p className="text-xs text-slate-500">Gestão de alunos e benefícios.</p>
                                        </div>
                                        <ArrowRight size={20} className="ml-auto text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                    </button>

                                    <button
                                        onClick={() => { setFirstAccessRole('STORE_ADMIN'); setFirstAccessStage('CHECK_ID'); }}
                                        className="w-full p-4 bg-white border-2 border-slate-100 hover:border-indigo-100 rounded-2xl flex items-center gap-4 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <StoreIcon size={24} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-slate-900">Estabelecimento Parceiro</h3>
                                            <p className="text-xs text-slate-500">Validação de descontos e métricas.</p>
                                        </div>
                                        <ArrowRight size={20} className="ml-auto text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                    </button>
                                </div>
                            )}

                            {/* STAGE 1: CHECK ID */}
                            {firstAccessStage === 'CHECK_ID' && (
                                <form onSubmit={handleCheckIdentity} className="space-y-6">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                            {firstAccessRole === 'STUDENT' ? 'SEU CPF' : 'CNPJ DA ENTIDADE'}
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                {firstAccessRole === 'STUDENT' ? <CreditCard className="h-5 w-5 text-slate-300" /> : <Building2 className="h-5 w-5 text-slate-300" />}
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium tracking-widest"
                                                placeholder={firstAccessRole === 'STUDENT' ? "000.000.000-00" : "00.000.000/0000-00"}
                                                value={firstAccessInput}
                                                onChange={(e) => setFirstAccessInput(
                                                    firstAccessRole === 'STUDENT' ? formatCPF(e.target.value) : formatCNPJ(e.target.value)
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {(error) && (
                                        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl flex items-start gap-3 border border-red-100">
                                            <span>⚠️</span>
                                            <div>{error}</div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? 'VERIFICANDO...' : 'CONTINUAR'}
                                        {!isProcessing && <ArrowRight size={18} />}
                                    </button>
                                </form>
                            )}

                            {/* STAGE 2: CONFIRM IDENTITY (Students Only) */}
                            {firstAccessStage === 'CONFIRM_IDENTITY' && foundIdentity && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                                        <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center text-emerald-600">
                                            <ShieldCheck size={32} />
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-800 mb-1">Cadastro Localizado!</h3>
                                        <p className="text-slate-500 text-sm mb-4">
                                            Encontramos seus dados em nossa base. Para sua segurança, confirme o registro usando o e-mail:
                                        </p>
                                        <div className="bg-white px-4 py-2 rounded-lg border border-slate-100 inline-block font-mono text-indigo-600 font-bold mb-4">
                                            {foundIdentity.masked_email}
                                        </div>
                                        <p className="text-xs text-slate-400 italic">
                                            Este é o e-mail que você deve utilizar na próxima etapa.
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFirstAccessStage('CHECK_ID')}
                                            className="flex-1 py-3 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                                        >
                                            Não sou eu
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleConfirmIdentity}
                                            className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 shadow-lg shadow-green-200 transition-all"
                                        >
                                            Sim, sou eu
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STAGE 3: REGISTER */}
                            {firstAccessStage === 'REGISTER' && (
                                <form onSubmit={handleRegisterSubmit} className="space-y-5 animate-slide-up">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                            SEU E-MAIL
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <CircleUserRound className="h-5 w-5 text-slate-300" />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium"
                                                placeholder="seu@email.com"
                                                value={firstAccessEmail}
                                                onChange={(e) => setFirstAccessEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                            CRIE UMA SENHA
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-slate-300" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                className="block w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium tracking-widest"
                                                placeholder="••••••••"
                                                value={firstAccessPassword}
                                                onChange={(e) => setFirstAccessPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-indigo-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                            CONFIRME A SENHA
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-slate-300" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium tracking-widest"
                                                placeholder="••••••••"
                                                value={firstAccessConfirm}
                                                onChange={(e) => setFirstAccessConfirm(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {(error) && (
                                        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl flex items-start gap-3 border border-red-100">
                                            <span>⚠️</span>
                                            <div className="text-xs font-medium">{error}</div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-green-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? 'CRIANDO CONTA...' : 'FINALIZAR CADASTRO'}
                                        {!isProcessing && <CheckCircle size={18} />}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {view === 'FORGOT_PASSWORD' && (
                        <div className="animate-slide-up">
                            <button
                                onClick={() => toggleView('LOGIN')}
                                className="mb-8 flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors font-medium"
                            >
                                <ArrowLeft size={16} /> Voltar ao Login
                            </button>

                            <div className="text-center mb-10">
                                <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                    <Lock className="text-indigo-600 w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Recuperar Acesso</h2>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                                    Informe seu e-mail ou CPF para receber as instruções de recuperação.
                                </p>
                            </div>

                            {forgotSuccess ? (
                                <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center animate-fade-in">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="text-green-600 w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-green-800 mb-2">Email Enviado!</h3>
                                    <p className="text-green-600 text-sm mb-6">
                                        Se seus dados estiverem corretos, você receberá um link para redefinir sua senha em instantes.
                                    </p>
                                    <button
                                        onClick={() => toggleView('LOGIN')}
                                        className="text-sm font-bold text-green-700 underline"
                                    >
                                        Ir para o Login
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleForgotSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                            EMAIL
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <CircleUserRound className="h-5 w-5 text-slate-300" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium"
                                                placeholder="seu@email.com"
                                                value={forgotEmail}
                                                onChange={(e) => setForgotEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {(error || authError) && (
                                        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl flex items-start gap-3 border border-red-100 mb-6">
                                            <span>⚠️</span>
                                            <div className="flex-1">
                                                <p className="font-semibold text-xs uppercase tracking-wider mb-1">Erro</p>
                                                <p className="text-red-500/80 text-xs leading-relaxed">{error || authError}</p>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full bg-[#5664F5] hover:bg-[#4351e0] text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5"
                                    >
                                        RECUPERAR SENHA
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {view === 'CHANGE_PASSWORD' && (
                        <div className="animate-slide-up">
                            <div className="text-center mb-10">
                                <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                    <Lock className="text-indigo-600 w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Definir Novo Acesso</h2>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                                    Confirme seu usuário e defina uma nova senha para continuar.
                                </p>
                            </div>

                            <form onSubmit={handlePasswordChangeSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    {/* Allow editing username only for STORE_ADMIN */}
                                    {authorizedUser?.role === 'STORE_ADMIN' && (
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                USUÁRIO DE ACESSO
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <CircleUserRound className="h-5 w-5 text-slate-300" />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium"
                                                    value={authorizedUser.username}
                                                    onChange={(e) => setAuthorizedUser({ ...authorizedUser, username: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                            NOVA SENHA
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-slate-300" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                className="block w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium tracking-widest"
                                                placeholder="••••••••"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-indigo-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                            CONFIRMAR SENHA
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-slate-300" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                className="block w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium tracking-widest"
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {(error || authError) && (
                                    <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl flex items-start gap-3 border border-red-100">
                                        <span>⚠️</span>
                                        <div className="flex-1">
                                            <p className="font-semibold text-xs uppercase tracking-wider mb-1">Erro</p>
                                            <p className="text-red-500/80 text-xs">{error || authError}</p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full bg-[#5664F5] hover:bg-[#4351e0] text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5"
                                >
                                    ATUALIZAR DADOS
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
