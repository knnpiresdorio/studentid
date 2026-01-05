import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirma a exclusão?",
    description = "Essa ação não pode ser desfeita. O item será removido permanentemente do sistema.",
    confirmText = "Excluir",
    cancelText = "Cancelar"
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-white/10 scale-100 transform transition-transform">
                <div className="flex flex-col items-center text-center">
                    <div className="bg-red-500/10 p-3 rounded-full text-red-500 mb-4 border border-red-500/20">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <div className="text-slate-400 mb-6 text-sm">
                        {description}
                    </div>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-900/20 transition-colors"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
