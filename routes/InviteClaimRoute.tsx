import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, UserPlus } from 'lucide-react';
import { Button } from '../components/ui/BaseComponents';
import { DependentModal } from '../components/modals/DependentModal';

export const InviteClaimRoute: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const schoolId = searchParams.get('school');
    const parentId = searchParams.get('parent');

    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'used' | 'success'>('loading');
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        // Mock token validation
        const validateToken = async () => {
            await new Promise(r => setTimeout(r, 1500));
            if (token && token.length > 10) {
                setStatus('valid');
            } else {
                setStatus('invalid');
            }
        };
        validateToken();
    }, [token]);

    const handleSaveDependent = async (data: any) => {
        setIsRegistering(true);
        // Simulate registration and token invalidation
        await new Promise(r => setTimeout(r, 2000));
        setStatus('success');
        setIsRegistering(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <UserPlus className="text-white" size={32} />
                </div>

                {status === 'loading' && (
                    <div className="space-y-4 animate-pulse">
                        <Loader2 className="mx-auto animate-spin text-blue-400" size={32} />
                        <h2 className="text-xl font-bold text-white">Validando Convite...</h2>
                        <p className="text-slate-400 text-sm">Aguarde um instante enquanto verificamos seu token.</p>
                    </div>
                )}

                {status === 'invalid' && (
                    <div className="space-y-4 animate-fade-in">
                        <AlertCircle className="mx-auto text-red-400" size={48} />
                        <h2 className="text-xl font-bold text-white">Convite Inválido</h2>
                        <p className="text-slate-400 text-sm">Este link expirou ou não é mais válido. Peça ao titular que gere um novo link.</p>
                        <Button variant="outline" className="w-full" onClick={() => window.location.href = '/'}>
                            Voltar ao Início
                        </Button>
                    </div>
                )}

                {status === 'valid' && (
                    <div className="space-y-4 animate-fade-in">
                        <h2 className="text-2xl font-bold text-white">Você foi convidado!</h2>
                        <p className="text-slate-400 text-sm">
                            Complete seu cadastro para ter acesso aos benefícios exclusivos do UniPass.
                        </p>
                        <Button
                            variant="indigo"
                            className="w-full justify-center gap-2 group"
                            onClick={() => setIsRegistering(true)}
                        >
                            Começar Cadastro <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="text-emerald-500" size={40} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">Cadastro Concluído!</h2>
                            <p className="text-slate-400 text-sm">Seu perfil de dependente foi criado com sucesso. Você já pode baixar o app e entrar com seus dados.</p>
                        </div>
                        <Button variant="indigo" className="w-full" onClick={() => window.location.href = '/'}>
                            Ir para Login
                        </Button>
                    </div>
                )}
            </div>

            <DependentModal
                isOpen={isRegistering}
                onClose={() => setIsRegistering(false)}
                onSave={handleSaveDependent}
                initialData={{
                    schoolId: schoolId || '',
                    parentId: parentId || ''
                }}
            />
        </div>
    );
};
