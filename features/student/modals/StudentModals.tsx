import React from 'react';
import { Camera, Sparkles, Upload } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children?: React.ReactNode;
}

const ModalOverlay: React.FC<ModalProps> = ({ isOpen, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            {children}
        </div>
    );
};

// 1. Delete Dependent Modal
interface DeleteDependentModalProps {
    isOpen: boolean;
    dependentName: string;
    reason: string;
    onReasonChange: (reason: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}

export const DeleteDependentModal: React.FC<DeleteDependentModalProps> = ({
    isOpen, dependentName, reason, onReasonChange, onClose, onConfirm
}) => (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 ring-1 ring-black/5 dark:ring-white/10">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">Solicitar Exclusão</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Você está solicitando a remoção de <strong className="text-slate-700 dark:text-slate-200">{dependentName}</strong>.
                Esta ação precisa ser aprovada pela escola.
            </p>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Motivo da exclusão:</label>
            <textarea
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-900 dark:text-white placeholder-slate-400"
                rows={3}
                placeholder="Ex: Mudança de escola, erro de cadastro..."
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
                <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
                <button onClick={onConfirm} disabled={!reason.trim()} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors shadow-lg shadow-red-500/20">Enviar</button>
            </div>
        </div>
    </ModalOverlay>
);

// 2. Info Update Modal
interface InfoUpdateModalProps {
    isOpen: boolean;
    reason: string;
    onReasonChange: (reason: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}

export const InfoUpdateModal: React.FC<InfoUpdateModalProps> = ({
    isOpen, reason, onReasonChange, onClose, onConfirm
}) => (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 ring-1 ring-black/5 dark:ring-white/10">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">Correção de Dados</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Informe quais dados estão incorretos em seu cadastro para que a secretaria analise.</p>
            <textarea
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-900 dark:text-white placeholder-slate-400"
                rows={4}
                placeholder="Ex: Meu nome está escrito errado, o correto é..."
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
                <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
                <button onClick={onConfirm} disabled={!reason.trim()} className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20">Enviar Solicitação</button>
            </div>
        </div>
    </ModalOverlay>
);

// 3. Photo Update Confirmation Modal
interface PhotoUpdateConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const PhotoUpdateConfirmationModal: React.FC<PhotoUpdateConfirmationModalProps> = ({
    isOpen, onClose, onConfirm
}) => (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 ring-1 ring-black/5 dark:ring-white/10 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                <Camera size={24} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">Alterar Foto de Perfil?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Você deseja selecionar uma nova foto para sua carteirinha?
            </p>
            <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    Cancelar
                </button>
                <button onClick={onConfirm} className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                    Selecionar Foto
                </button>
            </div>
        </div>
    </ModalOverlay>
);

// 4. Photo Preview Modal
interface PhotoPreviewModalProps {
    isOpen: boolean;
    photoUrl: string | null;
    onClose: () => void;
    onConfirm: () => void;
}

export const PhotoPreviewModal: React.FC<PhotoPreviewModalProps> = ({
    isOpen, photoUrl, onClose, onConfirm
}) => (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 ring-1 ring-black/5 dark:ring-white/10">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                <Camera size={24} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2 text-center">Confirmar Envio?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center">
                Deseja solicitar a atualização da sua foto de perfil? Isso passará por aprovação da escola.
            </p>

            {photoUrl && (
                <div className="w-24 h-24 rounded-full mx-auto mb-6 border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden relative">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
            )}

            <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    Cancelar
                </button>
                <button onClick={onConfirm} className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                    Confirmar
                </button>
            </div>
        </div>
    </ModalOverlay>
);

// 5. Success Modal
interface SuccessModalProps {
    isOpen: boolean;
    message: string;
    onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
    isOpen, message, onClose
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-8 ring-1 ring-black/5 dark:ring-white/10 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
                    <Sparkles size={32} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-xl mb-2">Sucesso!</h3>
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className="mt-6 px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
};

// 6. Add/Edit Dependent Modal
interface AddDependentModalProps {
    isOpen: boolean;
    isEditing: boolean;
    name: string;
    setName: (val: string) => void;
    cpf: string;
    setCpf: (val: string) => void;
    relation: string;
    setRelation: (val: string) => void;
    birthDate: string;
    setBirthDate: (val: string) => void;
    photoUrl: string | null;
    onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClose: () => void;
    onConfirm: () => void;
}

export const AddDependentModal: React.FC<AddDependentModalProps> = ({
    isOpen, isEditing, name, setName, cpf, setCpf, relation, setRelation,
    birthDate, setBirthDate, photoUrl, onPhotoUpload, onClose, onConfirm
}) => (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl w-full max-w-sm ring-1 ring-black/5 dark:ring-white/10">
            <h3 className="font-bold mb-6 text-center text-xl text-slate-900 dark:text-white">{isEditing ? 'Editar Dados' : 'Solicitar Inclusão'}</h3>

            {/* Photo Upload */}
            <div className="flex justify-center mb-8">
                <div className="relative group">
                    <div className="w-28 h-28 rounded-full bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-colors group-hover:border-blue-500 dark:group-hover:border-blue-500">
                        {photoUrl ? (
                            <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <Camera className="text-slate-400 dark:text-slate-600" size={32} />
                        )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2.5 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all hover:scale-110 active:scale-95">
                        <Upload size={16} />
                        <input type="file" accept="image/*" className="hidden" onChange={onPhotoUpload} />
                    </label>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 block">Nome Completo *</label>
                    <input className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white placeholder-slate-400 transition-all" placeholder="Ex: João da Silva" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 block">CPF *</label>
                    <input
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={e => {
                            let v = e.target.value.replace(/\D/g, '');
                            if (v.length > 11) v = v.slice(0, 11);
                            v = v.replace(/(\d{3})(\d)/, '$1.$2');
                            v = v.replace(/(\d{3})(\d)/, '$1.$2');
                            v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                            setCpf(v);
                        }}
                        maxLength={14}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 block">Parentesco *</label>
                    <select
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all appearance-none"
                        value={relation}
                        onChange={e => setRelation(e.target.value)}
                    >
                        <option value="" disabled>Selecione...</option>
                        <option value="Pai / Mãe">Pai / Mãe</option>
                        <option value="Filho(a)">Filho(a)</option>
                        <option value="Cônjuge / Companheiro(a)">Cônjuge / Companheiro(a)</option>
                        <option value="Irmão / Irmã">Irmão / Irmã</option>
                        <option value="Avô / Avó">Avô / Avó</option>
                        <option value="Neto(a)">Neto(a)</option>
                        <option value="Tio / Tia">Tio / Tia</option>
                        <option value="Sobrinho(a)">Sobrinho(a)</option>
                        <option value="Primo(a)">Primo(a)</option>
                        <option value="Sogro(a)">Sogro(a)</option>
                        <option value="Genro / Nora">Genro / Nora</option>
                        <option value="Cunhado(a)">Cunhado(a)</option>
                        <option value="Enteado(a)">Enteado(a)</option>
                        <option value="Padrasto / Madrasta">Padrasto / Madrasta</option>
                        <option value="Tutor / Curador">Tutor / Curador</option>
                        <option value="Responsável Legal">Responsável Legal</option>
                        <option value="Outros">Outros</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 block">Nascimento *</label>
                    <input type="date" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white placeholder-slate-400 transition-all" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={onClose} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
                    <button
                        onClick={onConfirm}
                        disabled={!name || !cpf || !relation || !birthDate}
                        className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
                    >
                        {isEditing ? 'Salvar' : 'Solicitar'}
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 text-center">A solicitação será enviada para aprovação da secretaria.</p>
            </div>
        </div>
    </ModalOverlay>
);
