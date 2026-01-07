import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, ArrowRight, Loader2, Building2 } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { Button } from '../../components/ui/Button';

export const OnboardingPasswordScreen: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'SET_PASSWORD' | 'SUCCESS'>('SET_PASSWORD');
    const [schoolName, setSchoolName] = useState('');

    useEffect(() => {
        // Attempt to extract school info from hash or context if available
        // Usually, when coming from an invite, the session is already established
        // but the password isn't set.
        checkSession();
    }, []);

    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            // No session? Maybe the link expired or redirected incorrectly
            // But usually Supabase handles the session creation from the link.
            console.warn('No active session found during onboarding.');
        } else {
            // Fetch school name from profiles
            const { data: profile } = await supabase
                .from('profiles')
                .select('school_id, schools(name)')
                .eq('id', session.user.id)
                .single();

            if (profile?.schools) {
                setSchoolName((profile.schools as any).name);
            }
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setIsLoading(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw updateError;

            setStep('SUCCESS');
        } catch (err: any) {
            setError(err.message || 'Erro ao definir senha.');
        } finally {
            setIsLoading(false);
        }
    };

    if (step === 'SUCCESS') {
        return (
            <div className="min-h-screen bg-[#0a0a16] flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl relative z-10 text-center space-y-8 animate-fade-in">
                    <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto scale-110 shadow-lg shadow-emerald-500/10">
                        <CheckCircle2 className="text-emerald-500" size={40} />
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-3xl font-extrabold text-white">Pronto!</h2>
                        <p className="text-slate-400 text-sm">Sua conta administrativa foi configurada com sucesso. Agora você tem acesso total para gerenciar sua instituição.</p>
                    </div>

                    <Button
                        variant="indigo"
                        size="lg"
                        className="w-full py-6 text-lg font-bold shadow-xl shadow-blue-900/20"
                        onClick={() => navigate('/admin')}
                    >
                        Acessar Painel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a16] flex flex-col items-center justify-center p-6 relative overflow-hidden font-inter">
            {/* Ambient Background */}
            <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md animate-slide-up">
                <div className="text-center mb-10">
                    <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/30 mx-auto mb-8 transform hover:scale-105 transition-transform">
                        <Building2 className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Ativar Acesso</h1>
                    <p className="text-slate-400 text-sm">
                        {schoolName ? (
                            <>Bem-vindo ao painel da <span className="text-indigo-400 font-bold">{schoolName}</span>. </>
                        ) : 'Seja bem-vindo ao portal administrativo.'}
                        Defina sua senha de acesso abaixo.
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Nova Senha</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-11 pr-12 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all outline-none font-medium tracking-widest"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Confirmar Senha</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-11 pr-12 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all outline-none font-medium tracking-widest"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl flex items-center gap-3 animate-shake">
                                <span className="text-base shrink-0">⚠️</span>
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            variant="indigo"
                            className="w-full py-4 rounded-2xl font-bold shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? 'CONFIGURANDO...' : (
                                <>
                                    ATIVAR MINHA CONTA
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 flex items-start gap-3">
                        <ShieldCheck className="text-indigo-500/50 shrink-0" size={20} />
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Segurança Bancária</p>
                            <p className="text-[9px] text-slate-500 leading-relaxed font-medium uppercase mt-0.5">Sua senha é criptografada de ponta a ponta e nunca será compartilhada com terceiros.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
