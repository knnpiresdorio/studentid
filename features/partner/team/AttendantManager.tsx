import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabase';
import { Users, UserPlus, Trash2, Shield, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Attendant {
    id: string;
    partner_id: string;
    name: string;
    username: string;
    is_active: boolean;
    created_at: string;
}

export const AttendantManager: React.FC<{ partnerId: string }> = ({ partnerId }) => {
    const [attendants, setAttendants] = useState<Attendant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // New Attendant State
    const [newName, setNewName] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    const fetchAttendants = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('store_attendants')
                .select('*')
                .eq('partner_id', partnerId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAttendants(data || []);
        } catch (err: any) {
            console.error('Error fetching attendants:', err);
            setError('Falha ao carregar equipe.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (partnerId) fetchAttendants();
    }, [partnerId]);

    const handleCreateAttendant = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSaving(true);

        try {
            const { data, error } = await supabase.rpc('create_attendant', {
                p_partner_id: partnerId,
                p_name: newName,
                p_username: newUsername,
                p_password: newPassword
            });

            if (error) throw error;

            setSuccess('Atendente criado com sucesso!');
            setNewName('');
            setNewUsername('');
            setNewPassword('');
            setShowAddForm(false);
            fetchAttendants();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Erro ao criar atendente. O nome de usuário pode já estar em uso.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAttendant = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este atendente?')) return;

        try {
            const { error } = await supabase
                .from('store_attendants')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setAttendants(prev => prev.filter(a => a.id !== id));
            setSuccess('Atendente removido.');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError('Erro ao remover atendente.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
                <p className="text-slate-500 text-sm">Carregando equipe...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Minha Equipe</h2>
                    <p className="text-slate-500 text-sm">Gerencie os acessos dos seus atendentes.</p>
                </div>
                {!showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                    >
                        <UserPlus size={18} /> Adicionar Atendente
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 animate-shake">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                    <CheckCircle2 size={20} />
                    <p className="text-sm font-medium">{success}</p>
                </div>
            )}

            {showAddForm && (
                <div className="bg-white border-2 border-indigo-100 rounded-2xl p-6 shadow-sm animate-slide-up">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <UserPlus size={20} className="text-indigo-600" /> Novo Atendente
                        </h3>
                        <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                            Cancelar
                        </button>
                    </div>

                    <form onSubmit={handleCreateAttendant} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome Completo</label>
                            <input
                                type="text"
                                required
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                placeholder="Ex: João Silva"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Usuário de Login</label>
                            <input
                                type="text"
                                required
                                value={newUsername}
                                onChange={e => setNewUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                placeholder="joao_pizzaria"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Senha Inicial</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="md:col-span-3 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:bg-indigo-300"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                                Criar Acesso
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Atendente</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Usuário</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Criado em</th>
                            <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {attendants.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>Nenhum atendente cadastrado.</p>
                                </td>
                            </tr>
                        ) : (
                            attendants.map(attendant => (
                                <tr key={attendant.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold">
                                                {attendant.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-slate-700">{attendant.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                                        {attendant.username}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {new Date(attendant.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDeleteAttendant(attendant.id)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Remover Acesso"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 flex gap-4 items-start">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Shield size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-indigo-900 text-sm mb-1">Segurança e Privacidade</h4>
                    <p className="text-indigo-700/70 text-xs leading-relaxed">
                        Atendentes têm acesso apenas à validação de IDs e consulta de histórico da loja. Eles não podem alterar dados do estabelecimento ou gerenciar outros membros da equipe. Todas as ações realizadas por eles são registradas com a identificação do atendente.
                    </p>
                </div>
            </div>
        </div>
    );
};
