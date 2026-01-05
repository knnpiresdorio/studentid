import React, { useState } from 'react';
import { Link, Copy, Check, UserPlus, Info } from 'lucide-react';
import { Button } from '../../components/ui/BaseComponents';

interface InviteLinkManagerProps {
    schoolId: string;
    parentId: string;
}

export const InviteLinkManager: React.FC<InviteLinkManagerProps> = ({ schoolId, parentId }) => {
    const [inviteUrl, setInviteUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateInvite = async () => {
        setIsGenerating(true);
        // Simulate API call to generate a token
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        // In a real app, we'd save this to Supabase 'invites' table here
        // For now, we'll generate the local URL
        const url = `${window.location.origin}/register/dependent?token=${token}&school=${schoolId}&parent=${parentId}`;

        setInviteUrl(url);
        setIsGenerating(false);
    };

    const copyToClipboard = () => {
        if (inviteUrl) {
            navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="bg-indigo-600/5 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                    <UserPlus size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold dark:text-white">Convidar Dependente</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Gere um link único para que seu dependente se cadastre sozinho.</p>
                </div>
            </div>

            {!inviteUrl ? (
                <Button
                    variant="indigo"
                    className="w-full justify-center"
                    onClick={generateInvite}
                    disabled={isGenerating}
                >
                    {isGenerating ? 'Gerando...' : 'Gerar Link de Convite Único'}
                </Button>
            ) : (
                <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                        <Link size={16} className="text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-600 dark:text-slate-400 truncate flex-1 font-mono">
                            {inviteUrl}
                        </span>
                        <button
                            onClick={copyToClipboard}
                            className={`p-2 rounded-lg transition-all ${copied ? 'bg-emerald-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500'}`}
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <Info size={12} className="text-amber-500" />
                        Este link expirará após o primeiro uso.
                    </div>
                </div>
            )}
        </div>
    );
};
