import React, { useState, useEffect } from 'react';
import { School, UserRole, ActionType } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { supabase } from '../../../services/supabase';
import { Mail, ShieldCheck, Key, RefreshCw, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';

interface SchoolAdminAccessProps {
    school: School;
    addAuditLog: (schoolId: string | null, action: ActionType | string, details: string, actorId: string, actorName: string, actorRole: UserRole, metadata?: any) => void;
    currentAdmin: { id: string; name: string; role: UserRole };
}

export const SchoolAdminAccess: React.FC<SchoolAdminAccessProps> = ({
    school,
    addAuditLog,
    currentAdmin
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
    const [existingAdmin, setExistingAdmin] = useState<{ id: string; email: string; full_name: string } | null>(null);

    useEffect(() => {
        checkExistingAdmin();
    }, [school.id]);

    const checkExistingAdmin = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .eq('school_id', school.id)
                .eq('role', 'SCHOOL_ADMIN')
                .maybeSingle();

            if (data) {
                // Fetch email from auth (requires edge function or we just use school.email as reference)
                setExistingAdmin({
                    id: data.id,
                    email: school.email || '',
                    full_name: (data as any).full_name
                });
            } else {
                setExistingAdmin(null);
            }
        } catch (err) {
            console.error('Error checking admin:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendInvite = async () => {
        setIsLoading(true);
        setStatus({ type: 'idle', message: '' });

        try {
            // Since we can't call admin.invite directly, we'll use a RPC or Edge Function
            // For now, we'll simulate it or use the 'profiles' logic if the user already exists
            // But the user requested a flow for creating login/password.

            // LOGIC: We'll call a hypothetical edge function 'invite-school-admin'
            const { data, error } = await supabase.functions.invoke('invite-school-admin', {
                body: {
                    schoolId: school.id,
                    email: school.email,
                    schoolName: school.name
                }
            });

            if (error) throw error;

            setStatus({
                type: 'success',
                message: `Convite enviado com sucesso para ${school.email}. A instituição receberá instruções para definir a senha.`
            });

            addAuditLog(
                school.id,
                'INVITE_SCHOOL_ADMIN',
                `Enviou convite de acesso administrativo para: ${school.email}`,
                currentAdmin.id,
                currentAdmin.name,
                currentAdmin.role
            );
        } catch (err: any) {
            console.error('Invite error:', err);
            setStatus({
                type: 'error',
                message: err.message || 'Erro ao enviar convite. Verifique se a Edge Function está configurada.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!school.email) return;
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(school.email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setStatus({
                type: 'success',
                message: `E-mail de recuperação de senha enviado para ${school.email}.`
            });

            addAuditLog(
                school.id,
                'RESET_ADMIN_PASSWORD',
                `Solicitou reset de senha para o admin da escola: ${school.name}`,
                currentAdmin.id,
                currentAdmin.name,
                currentAdmin.role
            );
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/5 max-w-2xl ring-1 ring-white/5 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Gestão de Acesso Administrativo</h3>
                    <p className="text-slate-400 text-xs mt-1">Configure o login e segurança para esta instituição</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-slate-950/50 rounded-2xl p-6 border border-white/5">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">E-mail Administrativo</p>
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-blue-400" />
                                <span className="text-lg font-bold text-white">{school.email}</span>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${existingAdmin ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            {existingAdmin ? 'Acesso Ativo' : 'Acesso Pendente'}
                        </div>
                    </div>
                </div>

                {status.message && (
                    <div className={`p-4 rounded-xl border flex gap-3 animate-fade-in ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {status.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                        <p className="text-sm font-medium">{status.message}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!existingAdmin ? (
                        <div className="col-span-1 md:col-span-2 bg-blue-600/5 rounded-2xl p-6 border border-blue-500/10 border-dashed">
                            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                                Esta instituição ainda não possui um login configurado. O e-mail <strong>{school.email}</strong> será usado como nome de usuário.
                            </p>
                            <Button
                                onClick={handleSendInvite}
                                isLoading={isLoading}
                                variant="primary"
                                className="w-full"
                                leftIcon={<UserCheck size={18} />}
                            >
                                Criar Acesso e Enviar Convite
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="bg-slate-800/30 rounded-2xl p-6 border border-white/5">
                                <Key className="text-indigo-400 mb-4" size={24} />
                                <h4 className="font-bold text-white mb-2">Redefinir Senha</h4>
                                <p className="text-xs text-slate-500 mb-4">Envia um e-mail de recuperação para que o admin defina uma nova senha.</p>
                                <Button
                                    onClick={handleResetPassword}
                                    isLoading={isLoading}
                                    variant="outline"
                                    className="w-full"
                                    size="sm"
                                    leftIcon={<RefreshCw size={16} />}
                                >
                                    Enviar Link de Reset
                                </Button>
                            </div>

                            <div className="bg-slate-800/30 rounded-2xl p-6 border border-white/5">
                                <Mail className="text-blue-400 mb-4" size={24} />
                                <h4 className="font-bold text-white mb-2">Re-enviar Boas-vindas</h4>
                                <p className="text-xs text-slate-500 mb-4">Caso o admin não tenha recebido o e-mail inicial de configuração.</p>
                                <Button
                                    onClick={handleSendInvite}
                                    isLoading={isLoading}
                                    variant="outline"
                                    className="w-full"
                                    size="sm"
                                    leftIcon={<Mail size={16} />}
                                >
                                    Re-enviar Convite
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3 mt-4">
                    <AlertCircle size={18} className="text-amber-500/50 shrink-0" />
                    <p className="text-[10px] text-slate-400 leading-tight uppercase font-bold tracking-tight">
                        Importante: O destinatário terá 24 horas para utilizar o link de convite. Após esse período, um novo convite deverá ser enviado.
                    </p>
                </div>
            </div>
        </div>
    );
};
