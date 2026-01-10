import React, { useState } from 'react';
import { School, SchoolType } from '../../../types';
import { Input, Textarea } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Save, Upload, ChevronRight } from 'lucide-react';
import { formatCNPJ } from '../../../utils/formatters';

interface SchoolFormProps {
    school: School;
    onUpdate: (updates: Partial<School>) => void;
    onSave: () => void;
}

export const SchoolForm: React.FC<SchoolFormProps> = ({
    school,
    onUpdate,
    onSave
}) => {
    const [logoUploadMode, setLogoUploadMode] = useState<'url' | 'file'>('url');

    const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdate({ logoUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/5 max-w-2xl ring-1 ring-white/5 animate-fade-in">
            <div className="space-y-5">
                <div>
                    <Input
                        label={<span>Nome da Escola <span className="text-red-500">*</span></span>}
                        value={school.name}
                        onChange={e => onUpdate({ name: e.target.value })}
                    />
                </div>
                <div>
                    <Input
                        label={<span>CNPJ <span className="text-red-500">*</span></span>}
                        value={school.cnpj || ''}
                        onChange={e => onUpdate({ cnpj: formatCNPJ(e.target.value) })}
                        placeholder="00.000.000/0000-00"
                    />
                </div>
                <div>
                    <Input
                        label={<span>E-mail de Contato <span className="text-red-500">*</span></span>}
                        value={school.email || ''}
                        onChange={e => onUpdate({ email: e.target.value })}
                        placeholder="contato@escola.com"
                        type="email"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Tipo <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <select
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-950/80"
                            value={school.type}
                            onChange={e => onUpdate({ type: e.target.value as any })}
                        >
                            {Object.values(SchoolType).map(type => (
                                <option key={type} value={type} className="bg-slate-900">{type}</option>
                            ))}
                        </select>
                        <ChevronRight className="absolute right-3 top-3.5 rotate-90 text-slate-500 pointer-events-none" size={16} />
                    </div>
                </div>
                <div>
                    <Textarea
                        label="Descrição"
                        value={school.description || ''}
                        onChange={e => onUpdate({ description: e.target.value })}
                        placeholder="Breve descrição da escola..."
                    />
                </div>

                {/* Image Upload Toggle */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Logo da Escola <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="flex bg-slate-950/80 rounded-lg p-1 border border-white/10 shadow-inner">
                            <button
                                onClick={() => setLogoUploadMode('url')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${logoUploadMode === 'url' ? 'bg-blue-600 shadow text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                URL da Imagem
                            </button>
                            <button
                                onClick={() => setLogoUploadMode('file')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${logoUploadMode === 'file' ? 'bg-blue-600 shadow text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Upload de Arquivo
                            </button>
                        </div>
                    </div>

                    {logoUploadMode === 'url' ? (
                        <input
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white font-medium placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all hover:bg-slate-950/80"
                            value={school.logoUrl}
                            onChange={e => onUpdate({ logoUrl: e.target.value })}
                            placeholder="https://exemplo.com/logo.png"
                        />
                    ) : (
                        <div className="border-2 border-dashed border-slate-700/50 rounded-xl p-8 text-center hover:bg-slate-900/30 hover:border-blue-500/40 transition-all cursor-pointer relative group bg-slate-950/30">
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={handleLogoFileUpload}
                            />
                            <div className="flex flex-col items-center gap-3 text-slate-500 group-hover:text-blue-400 transition-colors">
                                <div className="bg-slate-900 p-4 rounded-full border border-white/5 group-hover:bg-slate-800 group-hover:scale-110 transition-all shadow-lg">
                                    <Upload size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Clique para selecionar</p>
                                    <p className="text-xs opacity-70 mt-1">PNG, JPG até 2MB</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preview */}
                    {school.logoUrl && (
                        <div className="mt-4 p-4 bg-slate-950/30 border border-white/10 rounded-xl flex items-center gap-4 animate-fade-in">
                            <div className="w-16 h-16 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center p-2">
                                <img src={school.logoUrl} className="w-full h-full object-contain" alt="Preview" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">Preview Atual</p>
                                <p className="text-xs text-slate-500 break-all line-clamp-1">{school.logoUrl}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-white/5">
                    <Button
                        onClick={() => {
                            if (!school.name || !school.cnpj || school.cnpj.length < 18 || !school.type || !school.logoUrl || !school.email) {
                                alert("Por favor, preencha todos os campos obrigatórios (Nome, CNPJ completo, E-mail, Tipo e Logo).");
                                return;
                            }
                            onSave();
                        }}
                        variant="indigo"
                        leftIcon={<Save size={18} />}
                        className="w-full md:w-auto"
                    >
                        Salvar Alterações
                    </Button>
                </div>
            </div>
        </div>
    );
};
