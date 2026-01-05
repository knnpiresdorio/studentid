import React, { useState } from 'react';
import {
    ChevronLeft,
    LogOut,
    Plus,
    X,
    School as SchoolIcon,
    Users,
    Store,
    Bell,
    History,
    AlertTriangle,
    ListChecks,
} from 'lucide-react';

// Components
import { PartnerDetailCard } from './partner/PartnerDetailCard';
import { NotificationManager } from './notifications/NotificationManager';
import { DeleteConfirmationModal } from '../components/modals/DeleteConfirmationModal';
import { StudentModal } from '../components/modals/StudentModal';
import { PartnerModal } from '../components/modals/PartnerModal';
import { StudentTable } from './school/StudentTable';
import { PartnerGrid } from './school/PartnerGrid';
import { RequestList } from './school/RequestList';
import { AuditTrail } from './school/AuditTrail';
import { Button } from '../components/ui/Button';

// Hooks & Context
import { useAuth } from '../context/AuthContext';
import { useMembers } from '../context/MemberContext';
import { usePartners } from '../context/PartnerContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { useStudentActions } from '../hooks/useStudentActions';
import { usePartnerActions } from '../hooks/usePartnerActions';
import { useRequestActions } from '../hooks/useRequestActions';
import { usePaginatedStudentsQuery, usePaginatedAuditLogsQuery } from '../hooks/useSupabaseQuery';
import { Student, Partner, ChangeRequest, UserRole, ActionType } from '../types';
import { useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { maskCPF } from '../utils/masking';

interface SchoolManagerProps {
    schoolId?: string;
    onBack?: () => void;
}

export const SchoolManager: React.FC<SchoolManagerProps> = ({ schoolId, onBack }) => {
    const { logout, user } = useAuth();
    const { schools, changeRequests } = useMembers();
    const { partners } = usePartners();
    const { auditLogs, addAuditLog } = useAnalytics();

    const effectiveSchoolId = schoolId || (user?.role === 'SCHOOL_ADMIN' && user.schoolId ? user.schoolId : '');
    const school = schools.find(s => s.id === effectiveSchoolId);

    const [activeTab, setActiveTab] = useState<'students' | 'partners' | 'requests' | 'audit' | 'notifications'>('students');

    // --- Pagination & Search State ---
    const [studentPage, setStudentPage] = useState(1);
    const [studentSearch, setStudentSearch] = useState('');
    const debouncedStudentSearch = useDebounce(studentSearch, 500);

    const [auditPage, setAuditPage] = useState(1);
    const [auditSearch, setAuditSearch] = useState('');
    const debouncedAuditSearch = useDebounce(auditSearch, 500);

    const pageSize = 10;

    // --- Actions & Queries ---
    const { data: studentsData, isLoading: isLoadingStudents } = usePaginatedStudentsQuery({
        page: studentPage,
        pageSize,
        searchTerm: debouncedStudentSearch,
        schoolId: effectiveSchoolId
    });

    const { data: auditLogsData, isLoading: isLoadingAudit } = usePaginatedAuditLogsQuery({
        page: auditPage,
        pageSize,
        searchTerm: debouncedAuditSearch,
        schoolId: effectiveSchoolId
    });

    const studentActions = useStudentActions(effectiveSchoolId);
    const partnerActions = usePartnerActions(effectiveSchoolId);
    const requestActions = useRequestActions(effectiveSchoolId);

    // Reset page on search
    useEffect(() => { setStudentPage(1); }, [debouncedStudentSearch]);
    useEffect(() => { setAuditPage(1); }, [debouncedAuditSearch]);

    // --- Local UI State ---
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
    const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);
    const [isPartnerDeleteModalOpen, setIsPartnerDeleteModalOpen] = useState(false);
    const [partnerDeletionReason, setPartnerDeletionReason] = useState('');

    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewPartner, setPreviewPartner] = useState<Partner | null>(null);

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [requestToReject, setRequestToReject] = useState<ChangeRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    if (!school) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-500">
                <div className="text-center">
                    <SchoolIcon size={48} className="mx-auto mb-4 opacity-50 text-slate-600" />
                    <p className="text-lg font-medium text-slate-400">Nenhuma escola selecionada ou vinculada.</p>
                    {onBack && <button onClick={onBack} className="mt-4 text-blue-500 hover:text-blue-400">Voltar</button>}
                </div>
            </div>
        );
    }

    const schoolPartners = partners.filter(p => p.schoolId === school.id);
    const pendingRequests = changeRequests.filter(r => r.schoolId === school.id && r.status === 'PENDING');


    // --- Helper Logic ---

    const handleSaveStudent = async (studentData: Student) => {
        const studentToSave = {
            ...studentData,
            schoolId: school.id,
            schoolName: school.name,
            schoolType: school.type,
            dependents: studentData.dependents || []
        } as Student;

        try {
            await studentActions.upsertStudent.mutateAsync(studentToSave);
            addAuditLog(
                effectiveSchoolId,
                editingStudent ? ActionType.MODIFICATION : 'CREATE_MEMBER',
                `${editingStudent ? 'Atualizou' : 'Criou'} membro: ${studentToSave.fullName}`,
                user?.id || 'system',
                user?.name || 'System',
                user?.role || UserRole.SCHOOL_ADMIN,
                { targetId: studentToSave.id, targetName: studentToSave.fullName, userType: studentToSave.userType }
            );
            setIsStudentModalOpen(false);
        } catch (error) {
            console.error("Error saving student:", error);
            alert("Erro ao salvar membro.");
        }
    };

    const handleSavePartner = async (partnerData: Partner) => {
        try {
            const partnerToSave = { ...partnerData, schoolId: school.id };
            await partnerActions.upsertPartner.mutateAsync(partnerToSave);
            addAuditLog(
                school.id,
                editingPartner ? 'UPDATE_PARTNER' : 'CREATE_PARTNER',
                `${editingPartner ? 'Atualizou' : 'Criou'} parceiro: ${partnerToSave.name}`,
                user?.id || 'system',
                user?.name || 'System',
                user?.role || UserRole.ADMIN
            );
            setIsPartnerModalOpen(false);
        } catch (error) {
            alert("Erro ao salvar parceiro.");
        }
    };

    const executeResolveRequest = async (reqId: string, action: 'APPROVE' | 'REJECT') => {
        const req = changeRequests.find(r => r.id === reqId);
        if (!req) return;

        if (action === 'REJECT') {
            setRequestToReject(req);
            setRejectionReason('');
            setIsRejectModalOpen(true);
        } else {
            await requestActions.handleResolveRequest(req, 'APPROVE');
        }
    };

    const executeRejection = async () => {
        if (!requestToReject || !rejectionReason.trim()) return;
        await requestActions.handleResolveRequest(requestToReject, 'REJECT', rejectionReason);
        setIsRejectModalOpen(false);
    };

    return (
        <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200">
            {/* --- MODALS --- */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => {
                    if (studentToDelete) studentActions.handleExecuteDelete(studentToDelete);
                    setIsDeleteModalOpen(false);
                }}
                description={<>Essa ação não pode ser desfeita. O membro <strong>{studentToDelete?.fullName}</strong> será removido permanentemente.</>}
            />

            {studentActions.isBulkUndoModalOpen && studentActions.bulkActionType && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-white/10">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-indigo-500/10 p-3 rounded-full text-indigo-500 mb-4 border border-indigo-500/20">
                                <ListChecks size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Confirmar Ação em Massa?</h3>
                            <p className="text-slate-400 mb-4">
                                Você está prestes a <strong>{studentActions.bulkActionType === 'ACTIVATE' ? 'ATIVAR' : 'DESATIVAR'}</strong> {studentActions.selectedStudentIds.size} membros selecionados.
                            </p>
                            <div className="flex gap-3 w-full">
                                <Button variant="secondary" onClick={() => studentActions.setIsBulkUndoModalOpen(false)} className="flex-1">Cancelar</Button>
                                <Button variant="indigo" onClick={() => {
                                    studentActions.handleBulkAction(Array.from(studentActions.selectedStudentIds), studentActions.bulkActionType!, studentsData?.data || []);
                                    studentActions.setIsBulkUndoModalOpen(false);
                                }} className="flex-1">Confirmar</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isRejectModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Motivo da Recusa</h3>
                            <button onClick={() => setIsRejectModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <textarea
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-red-500/50 outline-none h-32 resize-none mb-4"
                            placeholder="Ex: Foto ilegível, Dados incorretos..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <Button variant="danger" onClick={executeRejection} disabled={!rejectionReason.trim()} className="w-full">Confirmar Recusa</Button>
                    </div>
                </div>
            )}

            <StudentModal
                isOpen={isStudentModalOpen}
                onClose={() => setIsStudentModalOpen(false)}
                onSave={handleSaveStudent}
                student={editingStudent}
                initialData={{
                    isActive: true,
                    schoolId: school.id,
                    schoolName: school.name,
                    schoolType: school.type,
                    validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                    city: '',
                    state: ''
                }}
            />

            <PartnerModal
                isOpen={isPartnerModalOpen}
                onClose={() => setIsPartnerModalOpen(false)}
                onSave={handleSavePartner}
                partner={editingPartner}
                withUserCreation={true}
                initialData={{ schoolId: school.id, discount: '10%', category: 'Alimentação e Bebidas' }}
            />

            {/* --- LAYOUT --- */}
            <aside className="hidden md:flex fixed inset-y-0 left-0 w-72 bg-slate-950 text-white z-50 flex-col border-r border-white/5 shadow-2xl">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <SchoolIcon className="text-white" size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight leading-tight line-clamp-1">{school.name}</h1>
                            <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Portal Escolar</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {[
                        { id: 'students', label: 'Membros', icon: Users },
                        { id: 'partners', label: 'Parceiros', icon: Store },
                        { id: 'notifications', label: 'Notificações', icon: Bell },
                        { id: 'requests', label: 'Solicitações', icon: Bell, count: pendingRequests.length },
                        { id: 'audit', label: 'Auditoria', icon: History }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <div className="relative">
                                <tab.icon size={22} className={activeTab === tab.id ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
                                {tab.count ? tab.count > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border border-slate-900"></span> : null}
                            </div>
                            <span className="font-bold text-sm">{tab.label}</span>
                        </button>
                    ))}
                    {onBack && (
                        <button onClick={onBack} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-slate-400 hover:bg-white/5 hover:text-white mt-8">
                            <ChevronLeft size={22} />
                            <span className="font-bold text-sm">Voltar ao Admin</span>
                        </button>
                    )}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut size={20} />
                        <span className="font-bold text-sm">Sair do Sistema</span>
                    </button>
                </div>
            </aside>

            <main className="md:ml-72 transition-all h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
                <div className="flex-1 flex flex-col p-4 md:p-8 w-full max-w-full overflow-hidden pt-4 md:pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                                {activeTab === 'students' && 'Gestão de Membros'}
                                {activeTab === 'partners' && 'Rede de Parceiros'}
                                {activeTab === 'notifications' && 'Enviar Notificações'}
                                {activeTab === 'requests' && 'Solicitações Pendentes'}
                                {activeTab === 'audit' && 'Registro de Atividades'}
                            </h2>
                            <p className="text-slate-400 text-sm">Gerencie sua instituição de forma eficiente</p>
                        </div>
                        {['students', 'partners'].includes(activeTab) && (
                            <Button
                                variant="indigo"
                                onClick={() => activeTab === 'students' ? setIsStudentModalOpen(true) : setIsPartnerModalOpen(true)}
                                leftIcon={<Plus size={18} />}
                            >
                                {activeTab === 'students' ? 'Novo Membro' : 'Novo Parceiro'}
                            </Button>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col min-h-0 animate-slide-up">
                        {activeTab === 'students' && (
                            <StudentTable
                                students={studentsData?.data || []}
                                totalCount={studentsData?.count || 0}
                                page={studentPage}
                                pageSize={pageSize}
                                onPageChange={setStudentPage}
                                onSearchChange={setStudentSearch}
                                isLoading={isLoadingStudents}
                                auditLogs={auditLogs}
                                selectedStudentIds={studentActions.selectedStudentIds}
                                onSelectAll={(e) => {
                                    if (e.target.checked) studentActions.setSelectedStudentIds(new Set((studentsData?.data || []).map(s => s.id)));
                                    else studentActions.setSelectedStudentIds(new Set());
                                }}
                                onSelectOne={(id) => {
                                    const next = new Set(studentActions.selectedStudentIds);
                                    if (next.has(id)) next.delete(id); else next.add(id);
                                    studentActions.setSelectedStudentIds(next);
                                }}
                                onToggleStatus={studentActions.handleToggleStatus}
                                onToggleDependentStatus={studentActions.handleToggleDependentStatus}
                                onEdit={(s) => { setEditingStudent(s); setIsStudentModalOpen(true); }}
                                onDelete={(s) => { setStudentToDelete(s); setIsDeleteModalOpen(true); }}
                                maskCPF={maskCPF}
                            />
                        )}

                        {activeTab === 'partners' && (
                            <PartnerGrid
                                partners={schoolPartners}
                                onEdit={(p) => { setEditingPartner(p); setIsPartnerModalOpen(true); }}
                                onToggleStatus={partnerActions.handleTogglePartnerStatus}
                                onPreview={(p) => { setPreviewPartner(p); setIsPreviewModalOpen(true); }}
                                onResetPassword={partnerActions.handleResetPartnerPassword}
                                onDeleteRequest={(p) => { setPartnerToDelete(p); setPartnerDeletionReason(''); setIsPartnerDeleteModalOpen(true); }}
                            />
                        )}

                        {activeTab === 'requests' && (
                            <RequestList
                                requests={pendingRequests}
                                onResolve={executeResolveRequest}
                            />
                        )}

                        {activeTab === 'audit' && (
                            <AuditTrail
                                auditLogs={auditLogsData?.data || []}
                                totalCount={auditLogsData?.count || 0}
                                page={auditPage}
                                pageSize={pageSize}
                                onPageChange={setAuditPage}
                                onSearchChange={setAuditSearch}
                                isLoading={isLoadingAudit}
                            />
                        )}

                        {activeTab === 'notifications' && (
                            <div className="max-w-2xl mx-auto animate-fade-in">
                                <NotificationManager schoolId={school.id} />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Bulk Action Bar */}
            {activeTab === 'students' && studentActions.selectedStudentIds.size > 0 && (
                <div className="fixed bottom-6 left-0 right-0 md:left-72 flex justify-center z-40 animate-slide-up">
                    <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-6">
                        <span className="font-bold text-sm"><span className="bg-indigo-600 px-2 py-1 rounded mr-2">{studentActions.selectedStudentIds.size}</span> selecionados</span>
                        <div className="flex gap-3">
                            <Button variant="primary" size="sm" className="bg-emerald-600" onClick={() => { studentActions.setBulkActionType('ACTIVATE'); studentActions.setIsBulkUndoModalOpen(true); }}>Ativar</Button>
                            <Button variant="danger" size="sm" onClick={() => { studentActions.setBulkActionType('DEACTIVATE'); studentActions.setIsBulkUndoModalOpen(true); }}>Desativar</Button>
                            <button onClick={() => studentActions.setSelectedStudentIds(new Set())} className="p-2 text-slate-400 hover:text-white"><X size={20} /></button>
                        </div>
                    </div>
                </div>
            )}

            {isPartnerDeleteModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><AlertTriangle className="text-red-500" /> Solicitar Exclusão</h3>
                        <div className="bg-slate-950/50 border border-white/10 rounded-xl p-4 mb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase">Parceiro</p>
                            <p className="text-white font-bold">{partnerToDelete?.name}</p>
                        </div>
                        <textarea
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white text-sm outline-none h-32 mb-4"
                            placeholder="Descreva o motivo..."
                            value={partnerDeletionReason}
                            onChange={(e) => setPartnerDeletionReason(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => setIsPartnerDeleteModalOpen(false)} className="flex-1">Cancelar</Button>
                            <Button variant="danger" disabled={!partnerDeletionReason.trim()} onClick={() => { alert(`Solicitação enviada.\nMotivo: ${partnerDeletionReason}`); setIsPartnerDeleteModalOpen(false); }} className="flex-1">Enviar Solicitação</Button>
                        </div>
                    </div>
                </div>
            )}

            {isPreviewModalOpen && previewPartner && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm h-[80vh] rounded-3xl overflow-hidden shadow-2xl">
                        <PartnerDetailCard partner={previewPartner} onClose={() => setIsPreviewModalOpen(false)} isEmbedded={true} />
                    </div>
                </div>
            )}
        </div>
    );
};
