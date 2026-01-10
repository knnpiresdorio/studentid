import React from 'react';
import { Check, X, MessageSquare, CheckCircle } from 'lucide-react';
import { ChangeRequest } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StudentAvatar } from '../student/components/StudentAvatar';
import { getSignedUrl } from '../../services/storage';

interface RequestListProps {
    requests: ChangeRequest[];
    onResolve: (reqId: string, action: 'APPROVE' | 'REJECT') => void;
}

const PhotoPreview: React.FC<{ url: string; alt: string; className?: string }> = ({ url, alt, className }) => {
    const [displayUrl, setDisplayUrl] = React.useState(url);

    React.useEffect(() => {
        // If the URL is a relative path or likely from our 'documents' bucket
        // we might need to refresh it if it expired.
        // For now, let's assume if it contains 'storage/v1/object/sign' it's a signed URL
        // and we check if it's broken.
        if (url.includes('storage/v1/object/sign')) {
            // Check if URL is expired by parsing token or just trying to fetch
            // Simpler approach for now: if user reports it's broken, they refresh the page.
            // But better: Parse the path from the signed URL and get a new one.
            try {
                const urlObj = new URL(url);
                const pathParts = urlObj.pathname.split('/documents/');
                if (pathParts.length > 1) {
                    const filePath = decodeURIComponent(pathParts[1]);
                    getSignedUrl('documents', filePath, 3600).then(newUrl => {
                        setDisplayUrl(newUrl);
                    }).catch(err => console.error("Error refreshing signed URL:", err));
                }
            } catch (e) {
                console.error("Error parsing URL for refresh:", e);
            }
        }
    }, [url]);

    return (
        <img
            src={displayUrl}
            className={className}
            alt={alt}
            onError={(e) => {
                // If it fails to load, it might be expired
                console.warn("Image load failed, attempting to refresh...");
            }}
        />
    )
}

export const RequestList: React.FC<RequestListProps> = ({
    requests,
    onResolve
}) => {
    if (requests.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center text-slate-400 dark:text-slate-600 border border-dashed border-slate-200 dark:border-white/10">
                <CheckCircle size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium">Nenhuma solicitação pendente.</p>
                <p className="text-sm mt-1 opacity-70">Novas solicitações de alunos aparecerão aqui.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 h-full overflow-y-auto pb-20 custom-scrollbar">
            {requests.map(req => (
                <div key={req.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400"></div>
                    <div className="pl-2">
                        <div className="flex flex-wrap items-center gap-2.5 mb-2">
                            {req.type === 'ADD_DEPENDENT' && <Badge variant="success">Inclusão</Badge>}
                            {req.type === 'DELETE_DEPENDENT' && <Badge variant="danger">Exclusão</Badge>}
                            {req.type === 'UPDATE_PHOTO' && <Badge variant="info">Nova Foto</Badge>}
                            {req.type === 'UPDATE_INFO' && <Badge variant="warning">Correção Dados</Badge>}
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{req.studentName}</span>
                            <span className="text-xs text-slate-400">• {new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="space-y-2">
                            {req.type === 'ADD_DEPENDENT' && req.payload && (
                                <div className="text-sm text-slate-600 dark:text-slate-300">
                                    Solicita inclusão de dependente: <strong className="text-slate-900 dark:text-white">{req.payload.name}</strong> <span className="text-slate-400">({req.payload.relation})</span>
                                </div>
                            )}
                            {req.type === 'DELETE_DEPENDENT' && (
                                <div className="text-sm text-slate-600 dark:text-slate-300">
                                    Solicita exclusão de dependente: <strong className="text-red-400">{req.dependentName}</strong>
                                </div>
                            )}
                            {req.type === 'UPDATE_PHOTO' && req.payload?.photoUrl && (
                                <div className="mt-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Foto Atual</span>
                                            <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm transition-all hover:scale-110">
                                                <StudentAvatar studentId={req.studentId} alt="Atual" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">Nova Foto</span>
                                            <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-lg shadow-blue-500/20 transition-all hover:scale-110">
                                                <PhotoPreview url={req.payload.photoUrl} className="w-full h-full object-cover" alt="Nova" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-center text-xs text-slate-500 mt-4 font-medium italic">
                                        Compare as fotos para garantir a identidade do aluno antes de aprovar.
                                    </p>
                                </div>
                            )}

                            <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl text-xs text-slate-600 dark:text-slate-400 flex gap-2 border border-slate-100 dark:border-white/5 italic">
                                <MessageSquare size={14} className="shrink-0 text-slate-400 mt-0.5" />
                                "{req.reason}"
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="primary"
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-500 flex-1 lg:flex-none"
                            onClick={() => onResolve(req.id, 'APPROVE')}
                            leftIcon={<Check size={16} />}
                        >
                            Aprovar
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            className="flex-1 lg:flex-none"
                            onClick={() => onResolve(req.id, 'REJECT')}
                            leftIcon={<X size={16} />}
                        >
                            Recusar
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};
