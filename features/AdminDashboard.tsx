import React, { useState, useRef, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import {
    Settings,
    LogOut,
    LayoutDashboard,
    School as SchoolIcon,
    Users,
    Store,
    FileText,
    ChevronRight,
    Search,
    MapPin,
    Building2,
    GraduationCap,
    Edit,
    Trash2,
    Plus,
    Save,
    X,
    ChevronLeft,
    CheckCircle,
    PieChart,
    BarChart3,
    TrendingUp,
    Upload,
    CheckCircle2,
    Circle,
    AlertTriangle,
    Image as ImageIcon,
    Tag,
    UserPlus,
    ChevronDown,
    ChevronUp,
    Bell
} from 'lucide-react';
import {
    School,
    Student,
    Partner,
    AuditLog,
    SchoolType,
    ActionType,
    UserRole,
    ChangeRequest,
    MemberType
} from '../types';
import { useAuth } from '../context/AuthContext';
import { PartnerDetailCard } from './partner/PartnerDetailCard';
import { NotificationManager } from './notifications/NotificationManager';
import { DeleteConfirmationModal } from '../components/modals/DeleteConfirmationModal';
import { StudentModal } from '../components/modals/StudentModal';
import { PartnerModal } from '../components/modals/PartnerModal';
import { SchoolModal } from '../components/modals/SchoolModal';
import { ImportStudentsModal } from '../components/modals/ImportStudentsModal';
import {
    useUpsertStudentMutation,
    useBulkUpsertStudentsMutation,
    useUpsertPartnerMutation,
    useDeleteStudentMutation,
    useDeletePartnerMutation,
    useUpsertSchoolMutation,
    usePaginatedStudentsQuery,
    usePaginatedAuditLogsQuery,
    useStudentStatsQuery,
    fetchStudentById
} from '../hooks/useSupabaseQuery';
import { HeaderControls } from '../components/HeaderControls';
import { Badge } from '../components/ui/Badge';
import { maskCPF } from '../utils/masking';
import { SchoolList } from './admin/schools/SchoolList';
import { SchoolForm } from './admin/schools/SchoolForm';
import { MemberRegistry } from './admin/members/MemberRegistry';
import { PartnerDirectory } from './admin/partners/PartnerDirectory';
import { GlobalAuditTrail } from './admin/audit/GlobalAuditTrail';
import { useSchoolAdmin } from '../hooks/useSchoolAdmin';
import { useAdminPartner } from '../hooks/useAdminPartner';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { OnboardingTour } from '../components/OnboardingTour';
import { optimizeImage } from '../utils/image';

interface AdminDashboardProps {
    schools: School[];
    partners: Partner[];
    auditLogs: AuditLog[];
    addAuditLog: (schoolId: string, action: ActionType | string, details: string, actorId: string, actorName: string, actorRole: UserRole, metadata?: any) => void;
    onLogout: () => void;
}

export const AdminDashboard = ({
    schools = [],
    partners = [],
    auditLogs = [], addAuditLog,
    onLogout
}: AdminDashboardProps) => {
    const { user } = useAuth();

    // Mutations
    const upsertStudent = useUpsertStudentMutation();
    const upsertPartner = useUpsertPartnerMutation();
    const deleteStudent = useDeleteStudentMutation();
    const deletePartner = useDeletePartnerMutation();
    const upsertSchool = useUpsertSchoolMutation();

    const [activeSection, setActiveSection] = useState<'overview' | 'schools' | 'partners' | 'students' | 'logs' | 'notifications'>('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Efficient Stats Fetching
    const { data: studentStats } = useStudentStatsQuery();

    const pageSize = 10;

    // --- Pagination State ---
    const [globalStudentPage, setGlobalStudentPage] = useState(1);
    const [managedStudentPage, setManagedStudentPage] = useState(1);
    const [logsPage, setLogsPage] = useState(1);

    // --- State for Modals & CRUD ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'student' | 'partner', id: string } | null>(null);

    // --- State for Global Admin Modals ---
    const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
    const [editingSchool, setEditingSchool] = useState<School | null>(null);

    // Optimized Hooks (Modular Logic)
    const {
        managedSchool,
        setManagedSchool,
        manageTab,
        setManageTab,
        filteredSchools,
        handleSaveSchoolInfo
    } = useSchoolAdmin(schools, debouncedSearchTerm, upsertSchool, addAuditLog, user);

    const {
        partnerTab,
        setPartnerTab,
        partnerFilters,
        setPartnerFilters,
        uniqueStates,
        uniqueCities,
        uniqueCategories,
        selectedPartner,
        setSelectedPartner,
        isPartnerModalOpen,
        setIsPartnerModalOpen,
        editingPartner,
        openPartnerModal,
        handleSavePartner,
        confirmDeletePartner
    } = useAdminPartner(partners, debouncedSearchTerm);

    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const debouncedStudentSearchTerm = useDebounce(studentSearchTerm, 500);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [studentToToggleStatus, setStudentToToggleStatus] = useState<{ id: string, name: string, isActive: boolean } | null>(null);
    const [pendingBulkAction, setPendingBulkAction] = useState<'activate' | 'deactivate' | null>(null);

    // Student CRUD State
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const isSuperAdmin = user?.role === UserRole.ADMIN;

    // Stats
    const totalSchools = schools.length;
    const totalStudents = studentStats?.length || 0;
    const totalPartners = partners.length;
    const activeStudents = studentStats?.filter(s => s.isActive).length || 0;


    const adminSteps = [
        {
            title: "Bem-vindo ao UniPass Admin",
            content: "Este é o seu centro de controle. Aqui você gerencia todas as escolas, parceiros e alunos do ecossistema UniPass."
        },
        {
            title: "Visão Global",
            content: "Na aba Overview, você tem acesso a métricas rápidas de crescimento e atividade de todo o sistema."
        },
        {
            title: "Gestão Autônoma",
            content: "Você pode assumir a gestão de qualquer escola cadastrada para ajudar diretores e secretários com atualizações críticas."
        },
        {
            title: "Auditoria 360",
            content: "Toda e qualquer ação realizada (por você ou outros administradores) é registrada para total transparência e segurança."
        }
    ];

    // Logs Filter
    const [logSchoolFilter, setLogSchoolFilter] = useState<string>('ALL');

    // --- Queries ---
    const { data: globalStudentsData, isLoading: isLoadingGlobalStudents } = usePaginatedStudentsQuery({
        page: globalStudentPage,
        pageSize,
        searchTerm: debouncedSearchTerm
    });

    const { data: managedStudentsData, isLoading: isLoadingManagedStudents } = usePaginatedStudentsQuery({
        page: managedStudentPage,
        pageSize,
        searchTerm: debouncedStudentSearchTerm,
        schoolId: managedSchool?.id
    });

    const { data: paginatedLogsData, isLoading: isLoadingLogs } = usePaginatedAuditLogsQuery({
        page: logsPage,
        pageSize,
        searchTerm: debouncedSearchTerm,
        schoolId: logSchoolFilter === 'ALL' ? undefined : logSchoolFilter
    });

    // Reset pagination on filter changes
    useEffect(() => { setGlobalStudentPage(1); }, [debouncedSearchTerm]);
    useEffect(() => { setManagedStudentPage(1); }, [debouncedStudentSearchTerm, managedSchool?.id]);
    useEffect(() => { setLogsPage(1); }, [debouncedSearchTerm, logSchoolFilter]);

    const renderSidebarItem = (id: typeof activeSection, label: string, Icon: React.ElementType) => (
        <button
            onClick={() => { setActiveSection(id); setSearchTerm(''); setManagedSchool(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all border border-transparent group ${activeSection === id
                ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white shadow-lg border-blue-500/30 backdrop-blur-sm'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
        >
            <div className={`p-1.5 rounded-lg transition-colors ${activeSection === id ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-800/50 group-hover:bg-slate-700'}`}>
                <Icon size={18} />
            </div>
            <span className={`font-bold text-sm tracking-wide ${activeSection === id ? 'text-white' : ''}`}>{label}</span>
            {activeSection === id && <ChevronRight size={16} className="ml-auto text-blue-400 animate-pulse" aria-hidden="true" />}
        </button>
    );



    const handleBulkAction = (action: 'activate' | 'deactivate') => {
        setPendingBulkAction(action);
    };

    const executeBulkAction = async () => {
        if (!pendingBulkAction) return;

        const isActivating = pendingBulkAction === 'activate';

        try {
            // Processing in parallel for better speed, though sequential is safer for some backends
            // Given our optimistic updates, parallel should be fine
            await Promise.all(
                selectedStudents.map(async (id) => {
                    // Optimized: try to find in current view data first, else fetch
                    const fromView = managedStudentsData?.data.find(s => s.id === id) || globalStudentsData?.data.find(s => s.id === id);
                    const student = fromView || await fetchStudentById(id);

                    if (student) {
                        return upsertStudent.mutateAsync({ ...student, isActive: isActivating });
                    }
                    return Promise.resolve();
                })
            );

            addAuditLog(
                managedSchool?.id || 'ALL',
                ActionType.MODIFICATION,
                `${isActivating ? 'Ativou' : 'Desativou'} ${selectedStudents.length} membros em massa`,
                user?.id || 'sys',
                user?.name || 'Admin',
                user?.role || UserRole.ADMIN
            );
        } catch (error) {
            console.error("Error in bulk action:", error);
            alert("Erro ao executar ação em massa.");
        } finally {
            setSelectedStudents([]);
            setPendingBulkAction(null);
        }
    };


    // --- Student CRUD ---

    const openStudentModal = (student?: Student) => {
        setEditingStudent(student || null);
        setIsStudentModalOpen(true);
    };

    const handleSaveStudent = async (studentData: Student) => {
        const studentToSave = { ...studentData };

        // If in school-specific view, override with that school
        if (managedSchool) {
            studentToSave.schoolId = managedSchool.id;
            studentToSave.schoolName = managedSchool.name;
            studentToSave.schoolType = managedSchool.type;
        }

        if (!studentToSave.schoolId) {
            alert("Erro: Instituição não vinculada.");
            return;
        }

        try {
            await upsertStudent.mutateAsync(studentToSave);
            addAuditLog(
                studentToSave.schoolId,
                ActionType.MODIFICATION,
                `${editingStudent ? 'Atualizou' : 'Criou'} membro: ${studentToSave.fullName}`,
                user?.id || 'sys',
                user?.name || 'Admin',
                user?.role || UserRole.ADMIN
            );
            setIsStudentModalOpen(false);
            setEditingStudent(null);
        } catch (error) {
            console.error("Error saving student:", error);
            alert("Erro ao salvar membro.");
        }
    };

    const bulkUpsertStudents = useBulkUpsertStudentsMutation();

    const handleImportStudents = async (students: Student[]) => {
        try {
            await bulkUpsertStudents.mutateAsync(students);
            addAuditLog(
                managedSchool?.id || 'ALL',
                ActionType.MODIFICATION,
                `Importação em massa: ${students.length} novos membros adicionados via CSV.`,
                user?.id || 'sys',
                user?.name || 'Admin',
                user?.role || UserRole.ADMIN
            );
            setIsImportModalOpen(false);
        } catch (error) {
            console.error("Error importing students:", error);
            alert("Erro durante a importação. Verifique os dados e tente novamente.");
        }
    };

    const confirmDeleteStudent = (student: Student) => {
        setItemToDelete({ type: 'student', id: student.id });
        setIsDeleteModalOpen(true);
    };


    // --- Generic Delete Execution ---


    // Delete execution now uses fetch if needed (audit log needs names)
    // Actually executeDelete uses itemToDelete which only has ID?
    // Line 313: const student = students.find(...)
    // I need to update executeDelete to fetch if needed.

    const executeDelete = async () => {
        if (!itemToDelete) return;

        try {
            if (itemToDelete.type === 'student') {
                const id = itemToDelete.id;
                // Try fetch or find
                const fromView = managedStudentsData?.data.find(s => s.id === id) || globalStudentsData?.data.find(s => s.id === id);
                const student = fromView || await fetchStudentById(id);

                await deleteStudent.mutateAsync(itemToDelete.id);
                // Audit uses student info.
                addAuditLog(
                    student?.schoolId || managedSchool?.id || 'ALL',
                    ActionType.DELETE,
                    `Removeu membro: ${student?.fullName || 'Desconhecido'} (${maskCPF(student?.cpf || '')})`,
                    user?.id || 'sys',
                    user?.name || 'Admin',
                    user?.role || UserRole.ADMIN
                );
            } else {
                const partner = partners.find(p => p.id === itemToDelete.id);
                await deletePartner.mutateAsync(itemToDelete.id);
                addAuditLog(
                    partner?.schoolId || managedSchool?.id || 'ALL',
                    ActionType.DELETE,
                    `Removeu parceiro: ${partner?.name}`,
                    user?.id || 'sys',
                    user?.name || 'Admin',
                    user?.role || UserRole.ADMIN
                );
            }
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Erro ao remover item.");
        } finally {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };


    const handleSaveSchoolGlobal = async (schoolData: School) => {
        try {
            const savedSchool = await upsertSchool.mutateAsync(schoolData);
            setIsSchoolModalOpen(false);
            addAuditLog(
                savedSchool?.id || 'new',
                'UPSERT_SCHOOL',
                `Instituição ${schoolData.name} salva globalmente`,
                user?.id || 'admin',
                user?.name || 'Super Admin',
                UserRole.ADMIN
            );
        } catch (error) {
            console.error('Error saving school:', error);
        }
    };

    const getLinkedSchoolName = (schoolId: string) => {
        const s = schools.find(sc => sc.id === schoolId);
        return s ? s.name : 'Todas / N/A';
    };

    return (
        <div className="flex h-screen bg-transparent overflow-hidden relative text-slate-200">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[100px]"></div>
            </div>

            {/* --- MODALS --- */}
            <StudentModal
                isOpen={isStudentModalOpen}
                onClose={() => setIsStudentModalOpen(false)}
                onSave={handleSaveStudent}
                student={editingStudent}
                schools={schools}
            />

            <PartnerModal
                isOpen={isPartnerModalOpen}
                onClose={() => setIsPartnerModalOpen(false)}
                onSave={(data) => handleSavePartner(data, upsertPartner, addAuditLog, user)}
                partner={editingPartner}
                schools={schools}
            />

            <SchoolModal
                isOpen={isSchoolModalOpen}
                onClose={() => setIsSchoolModalOpen(false)}
                onSave={handleSaveSchoolGlobal}
                school={editingSchool}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={executeDelete}
                description="Essa ação não pode ser desfeita. O item será removido permanentemente do sistema."
            />

            <ImportStudentsModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImportStudents}
                school={managedSchool}
            />

            {/* Status Toggle Confirmation Modal */}
            {studentToToggleStatus && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-white/10 text-center">
                        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 border ${studentToToggleStatus.isActive ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                            {studentToToggleStatus.isActive ? <Circle size={24} /> : <CheckCircle2 size={24} />}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            {studentToToggleStatus.isActive ? 'Desativar Membro?' : 'Ativar Membro?'}
                        </h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Você está prestes a {studentToToggleStatus.isActive ? 'desativar' : 'ativar'} o acesso de <span className="font-bold text-white">{studentToToggleStatus.name}</span>.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStudentToToggleStatus(null)}
                                className="flex-1 px-4 py-2 border border-slate-700 rounded-lg text-slate-300 font-bold hover:bg-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={async () => {
                                    const id = studentToToggleStatus.id;
                                    const fromView = managedStudentsData?.data.find(s => s.id === id) || globalStudentsData?.data.find(s => s.id === id);
                                    const student = fromView || await fetchStudentById(id);

                                    if (student) {
                                        try {
                                            await upsertStudent.mutateAsync({ ...student, isActive: !student.isActive });
                                            setStudentToToggleStatus(null);
                                        } catch (error) {
                                            alert("Erro ao alterar status.");
                                        }
                                    }
                                }}
                                className={`flex-1 px-4 py-2 rounded-lg text-white font-bold transition-colors shadow-lg ${studentToToggleStatus.isActive ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' : 'bg-green-600 hover:bg-green-700 shadow-green-900/20'}`}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Action Confirmation Modal */}
            {pendingBulkAction && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/10 text-center">
                        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 border ${pendingBulkAction === 'deactivate' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                            {pendingBulkAction === 'deactivate' ? <Circle size={24} /> : <CheckCircle2 size={24} />}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            {pendingBulkAction === 'deactivate' ? 'Desativar Membros Selecionados?' : 'Ativar Membros Selecionados?'}
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Você está prestes a {pendingBulkAction === 'deactivate' ? 'desativar' : 'ativar'} o acesso dos seguintes {selectedStudents.length} membros:
                        </p>
                        <div className="bg-slate-950 rounded-lg p-3 text-left max-h-40 overflow-y-auto mb-6 border border-slate-800">
                            <ul className="space-y-1">
                                {selectedStudents.map(id => {
                                    const s = managedStudentsData?.data.find(st => st.id === id) || globalStudentsData?.data.find(st => st.id === id);
                                    if (!s) return null;
                                    return (
                                        <li key={s.id} className="text-xs text-slate-300 border-b border-slate-800 last:border-0 pb-1 last:pb-0 flex justify-between">
                                            <span className="font-semibold">{s.fullName}</span>
                                            <span className="text-slate-500">{maskCPF(s.cpf)}</span>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setPendingBulkAction(null)}
                                className="flex-1 px-4 py-2 border border-slate-700 rounded-lg text-slate-300 font-bold hover:bg-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={executeBulkAction}
                                className={`flex-1 px-4 py-2 rounded-lg text-white font-bold transition-colors shadow-lg ${pendingBulkAction === 'deactivate' ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' : 'bg-green-600 hover:bg-green-700 shadow-green-900/20'}`}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {/* Sidebar */}
            <aside className="w-72 bg-scrimba-navy/80 backdrop-blur-2xl border-r border-white/5 flex flex-col p-5 flex-shrink-0 z-20 shadow-2xl">
                <div className="flex items-center gap-4 px-2 py-6 mb-4">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
                        <Settings className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-xl leading-none tracking-tight font-display">Admin</h1>
                        <p className="text-slate-400 text-xs mt-1 font-medium tracking-wide">UniPass System</p>
                    </div>
                </div>

                <nav className="space-y-2 flex-1">
                    {renderSidebarItem('overview', 'Visão Geral', LayoutDashboard)}
                    {renderSidebarItem('schools', 'Escolas', SchoolIcon)}
                    {renderSidebarItem('students', 'Membros', Users)}
                    {renderSidebarItem('partners', 'Parceiros', Store)}
                    {renderSidebarItem('notifications', 'Notificações', Bell)}
                    {renderSidebarItem('logs', 'Auditoria', FileText)}
                </nav>

                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 mt-auto transition-all border border-transparent hover:border-red-500/20 group"
                >
                    <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm">Sair do Sistema</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-transparent relative scrollbar-hide">
                <header className="bg-scrimba-navy/60 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex justify-between items-center fixed lg:sticky top-0 left-0 right-0 lg:left-auto lg:right-auto z-50 lg:z-30 transition-all">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 drop-shadow-sm font-display tracking-tight">
                        {managedSchool && (
                            <button onClick={() => setManagedSchool(null)} className="mr-1 hover:bg-white/10 p-2 rounded-full text-slate-400 hover:text-white transition-all hover:scale-110 active:scale-95">
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        {managedSchool ? (
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                                Gerenciar: {managedSchool.name}
                            </span>
                        ) : (
                            <>
                                {activeSection === 'overview' && 'Visão Geral'}
                                {activeSection === 'schools' && 'Gerenciar Escolas'}
                                {activeSection === 'students' && 'Gerenciar Membros'}
                                {activeSection === 'partners' && 'Rede de Parceiros'}
                                {activeSection === 'notifications' && 'Enviar Notificações'}
                                {activeSection === 'logs' && 'Logs do Sistema'}
                            </>
                        )}
                    </h2>

                    {activeSection !== 'overview' && activeSection !== 'partners' && !managedSchool && (
                        <div className="relative w-96 group">
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:outline-none text-white placeholder-slate-500 transition-all group-hover:bg-slate-900/80 shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                        </div>
                    )}

                    {/* Global Action Buttons for Super Admin */}
                    <div className="flex items-center gap-4">
                        <HeaderControls />
                        {isSuperAdmin && !managedSchool && (
                            <div className="flex gap-3">
                                {activeSection === 'schools' && (
                                    <button
                                        onClick={() => { setEditingSchool(null); setIsSchoolModalOpen(true); }}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/40 hover:-translate-y-0.5"
                                    >
                                        <Plus size={18} /> Nova Escola
                                    </button>
                                )}
                                {activeSection === 'students' && (
                                    <button
                                        onClick={() => { setEditingStudent(null); setIsStudentModalOpen(true); }}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-900/40 hover:-translate-y-0.5"
                                    >
                                        <UserPlus size={18} /> Novo Membro
                                    </button>
                                )}
                                {activeSection === 'partners' && (
                                    <button
                                        onClick={() => openPartnerModal()}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/40 hover:-translate-y-0.5"
                                    >
                                        <Store size={18} /> Novo Parceiro
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                <div className="p-8 pt-28 lg:p-8">
                    {/* OVERVIEW SECTION */}
                    {activeSection === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                            <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/5 hover:border-blue-500/30 transition-all hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300"><SchoolIcon size={24} /></div>
                                    <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-lg font-bold border border-emerald-500/20 shadow-sm">+2 recentes</span>
                                </div>
                                <p className="text-slate-400 text-sm font-medium tracking-wide">Total de Escolas</p>
                                <p className="text-4xl font-bold text-white mt-2 tracking-tight drop-shadow-lg">{totalSchools}</p>
                            </div>

                            <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/5 hover:border-purple-500/30 transition-all hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300"><Users size={24} /></div>
                                    <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-lg font-bold border border-emerald-500/20 shadow-sm">{(activeStudents / totalStudents * 100).toFixed(0)}% Ativos</span>
                                </div>
                                <p className="text-slate-400 text-sm font-medium tracking-wide">Total de Membros</p>
                                <p className="text-4xl font-bold text-white mt-2 tracking-tight drop-shadow-lg">{totalStudents}</p>
                            </div>

                            <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/5 hover:border-orange-500/30 transition-all hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/10 group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3.5 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300"><Store size={24} /></div>
                                </div>
                                <p className="text-slate-400 text-sm font-medium tracking-wide">Parceiros Cadastrados</p>
                                <p className="text-4xl font-bold text-white mt-2 tracking-tight drop-shadow-lg">{totalPartners}</p>
                            </div>

                            <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/5 hover:border-slate-500/30 transition-all hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/5 group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3.5 bg-slate-700/30 text-slate-300 rounded-xl border border-white/10 group-hover:bg-slate-700 group-hover:text-white transition-colors duration-300"><FileText size={24} /></div>
                                </div>
                                <p className="text-slate-400 text-sm font-medium tracking-wide">Logs Registrados</p>
                                <p className="text-4xl font-bold text-white mt-2 tracking-tight drop-shadow-lg">{auditLogs.length}</p>
                            </div>
                        </div>
                    )}

                    {/* SCHOOLS SECTION */}
                    {activeSection === 'schools' && !managedSchool && (
                        <SchoolList
                            schools={filteredSchools}
                            studentStats={studentStats || []}
                            partners={partners}
                            onManageSchool={setManagedSchool}
                        />
                    )}

                    {activeSection === 'notifications' && (
                        <div className="max-w-2xl mx-auto animate-fade-in">
                            <NotificationManager />
                        </div>
                    )}

                    {/* MANAGED SCHOOL VIEW */}
                    {managedSchool && (
                        <div className="animate-fade-in space-y-6">
                            <div className="flex gap-4 border-b border-white/10">
                                <button onClick={() => setManageTab('info')} className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${manageTab === 'info' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>Informações</button>
                                <button onClick={() => setManageTab('students')} className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${manageTab === 'students' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>Membros ({(studentStats || []).filter(s => s.schoolId === managedSchool.id).length})</button>
                                <button onClick={() => setManageTab('partners')} className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${manageTab === 'partners' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>Parceiros ({partners.filter(p => p.schoolId === managedSchool.id).length})</button>
                            </div >

                            {manageTab === 'info' && (
                                <SchoolForm
                                    school={managedSchool}
                                    onUpdate={(updates) => setManagedSchool({ ...managedSchool, ...updates })}
                                    onSave={handleSaveSchoolInfo}
                                />
                            )}

                            {
                                manageTab === 'students' && (
                                    <div className="bg-slate-900/80 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/5 overflow-hidden ring-1 ring-white/5">
                                        <div className="p-5 border-b border-white/5 flex flex-col md:flex-row justify-between items-center bg-slate-950/30 gap-4">
                                            <div className="flex items-center gap-4 w-full md:w-auto">
                                                <h3 className="font-bold text-white whitespace-nowrap text-lg">Membros ({managedStudentsData?.count || 0})</h3>
                                                <div className="relative w-full md:w-72 group">
                                                    <Input
                                                        placeholder="Buscar por nome ou CPF..."
                                                        value={studentSearchTerm}
                                                        onChange={e => setStudentSearchTerm(e.target.value)}
                                                        leftIcon={<Search size={16} />}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                                {selectedStudents.length > 0 && (
                                                    <div className="flex items-center gap-2 animate-fade-in bg-slate-800/50 p-1 rounded-lg border border-white/5">
                                                        <span className="text-xs text-blue-300 font-bold px-2">
                                                            {selectedStudents.length} selected
                                                        </span>
                                                        <button
                                                            onClick={() => handleBulkAction('activate')}
                                                            className="bg-green-500/20 text-green-400 p-1.5 rounded-md hover:bg-green-500/30 transition-colors"
                                                            title="Ativar Selecionados"
                                                        >
                                                            <CheckCircle2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleBulkAction('deactivate')}
                                                            className="bg-red-500/20 text-red-400 p-1.5 rounded-md hover:bg-red-500/30 transition-colors"
                                                            title="Desativar Selecionados"
                                                        >
                                                            <Circle size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                                <Button
                                                    onClick={() => setIsImportModalOpen(true)}
                                                    variant="outline"
                                                    size="sm"
                                                    leftIcon={<Upload size={16} />}
                                                >
                                                    Importar CSV
                                                </Button>
                                                <Button
                                                    onClick={() => openStudentModal()}
                                                    variant="indigo"
                                                    size="sm"
                                                    leftIcon={<Plus size={16} />}
                                                >
                                                    Adicionar Membro
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm text-slate-300">
                                                <thead className="bg-slate-950/50 text-slate-400 font-bold border-b border-white/5 uppercase text-xs tracking-wider">
                                                    <tr>
                                                        <th className="px-6 py-4 w-4">
                                                            <input
                                                                type="checkbox"
                                                                className="rounded border-white/10 bg-slate-800 text-blue-600 focus:ring-blue-500/50 focus:ring-offset-0 cursor-pointer"
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedStudents((managedStudentsData?.data || []).map(s => s.id));
                                                                    } else {
                                                                        setSelectedStudents([]);
                                                                    }
                                                                }}
                                                                checked={selectedStudents.length > 0 && selectedStudents.length === (managedStudentsData?.data || []).length}
                                                            />
                                                        </th>
                                                        <th className="px-6 py-4">Membro</th>
                                                        <th className="px-6 py-4">Documentação</th>
                                                        <th className="px-6 py-4">Tipo</th>
                                                        <th className="px-6 py-4">Curso/Depto</th>
                                                        <th className="px-6 py-4">Validade</th>
                                                        <th className="px-6 py-4">Status</th>
                                                        <th className="px-6 py-4 text-right">Ações</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {isLoadingManagedStudents ? (
                                                        <tr><td colSpan={8} className="p-10 text-center text-slate-500 italic">Carregando membros...</td></tr>
                                                    ) : (managedStudentsData?.data || []).map(student => (
                                                        <tr key={student.id} className={`hover:bg-white/5 transition-colors group ${selectedStudents.includes(student.id) ? 'bg-blue-500/5' : ''}`}>
                                                            <td className="px-6 py-4">
                                                                <input
                                                                    type="checkbox"
                                                                    className="rounded border-white/10 bg-slate-800 text-blue-600 focus:ring-blue-500/50 focus:ring-offset-0 cursor-pointer"
                                                                    checked={selectedStudents.includes(student.id)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setSelectedStudents([...selectedStudents, student.id]);
                                                                        } else {
                                                                            setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                                                                        }
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 flex items-center gap-4">
                                                                <img src={optimizeImage(student.photoUrl, 40, 40)} className="w-10 h-10 rounded-full object-cover bg-slate-800 border border-white/10 shadow-sm" alt="" />
                                                                <span className="font-bold text-white group-hover:text-blue-400 transition-colors">{student.fullName}</span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-mono text-xs">{maskCPF(student.cpf)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${student.userType === MemberType.STUDENT || !student.userType ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                                    }`}>
                                                                    {student.userType || 'ALUNO'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-slate-400 font-medium">{student.course || 'Corporativo'}</td>
                                                            <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                                                {student.validUntil ? new Date(student.validUntil).toLocaleDateString('pt-BR') : '-'}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <Badge variant={student.isActive ? 'success' : 'danger'}>
                                                                    {student.isActive ? 'ATIVO' : 'INATIVO'}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex justify-end items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => {
                                                                            setStudentToToggleStatus({ id: student.id, name: student.fullName, isActive: student.isActive });
                                                                        }}
                                                                        className={`p-2 rounded-lg transition-all ${student.isActive ? 'text-emerald-400 hover:bg-emerald-500/20' : 'text-slate-400 hover:bg-white/10'}`}
                                                                        title={student.isActive ? 'Desativar Membro' : 'Ativar Membro'}
                                                                    >
                                                                        {student.isActive ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                                                    </button>
                                                                    <button
                                                                        className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                                        onClick={() => openStudentModal(student)}
                                                                        title="Editar Membro"
                                                                    >
                                                                        <Edit size={16} />
                                                                    </button>
                                                                    <button
                                                                        className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                                                        onClick={() => confirmDeleteStudent(student)}
                                                                        title="Remover Membro"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {(managedStudentsData?.data || []).length === 0 && !isLoadingManagedStudents && (
                                                        <tr><td colSpan={8} className="p-10 text-center text-slate-500 italic">Nenhum membro encontrado.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination Controls */}
                                        <div className="p-4 border-t border-white/5 flex items-center justify-between bg-slate-950/20">
                                            <span className="text-xs text-slate-500 font-medium tracking-wide">
                                                Mostrando {Math.min((managedStudentsData?.data || []).length, pageSize)} de {managedStudentsData?.count || 0} membros
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setManagedStudentPage(prev => Math.max(1, prev - 1))}
                                                    disabled={managedStudentPage === 1 || isLoadingManagedStudents}
                                                    className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-all"
                                                >
                                                    Anterior
                                                </button>
                                                <button
                                                    onClick={() => setManagedStudentPage(prev => prev + 1)}
                                                    disabled={managedStudentPage >= Math.ceil((managedStudentsData?.count || 0) / pageSize) || isLoadingManagedStudents}
                                                    className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-all"
                                                >
                                                    Próximo
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            {
                                manageTab === 'partners' && (
                                    <div className="space-y-4">
                                        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-xl border border-white/5 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
                                                    <Store size={20} />
                                                </div>
                                                <h3 className="font-bold text-white text-lg">Parceiros de {managedSchool.name} ({partners.filter(p => p.schoolId === managedSchool.id).length})</h3>
                                            </div>
                                            <button
                                                onClick={() => openPartnerModal()}
                                                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                                            >
                                                <Plus size={18} /> Novo Parceiro
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {selectedPartner && (
                                                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-fade-in">
                                                    <div className="w-full max-w-md bg-slate-950/50 rounded-3xl overflow-hidden shadow-2xl relative border border-white/10 ring-1 ring-white/10">
                                                        <PartnerDetailCard partner={selectedPartner} onClose={() => setSelectedPartner(null)} />
                                                    </div>
                                                </div>
                                            )}

                                            {partners.filter(p => p.schoolId === managedSchool.id).map(partner => (
                                                <div key={partner.id} className="bg-slate-900/40 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/5 flex gap-4 relative group cursor-pointer hover:bg-slate-800/80 transition-all hover:-translate-y-1 hover:shadow-2xl hover:border-purple-500/30" onClick={(e) => {
                                                    if ((e.target as HTMLElement).closest('button')) return;
                                                    setSelectedPartner(partner);
                                                }}>
                                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-800 border border-white/10 shadow-md group-hover:scale-105 transition-transform duration-300">
                                                        <img src={partner.logoUrl} className="w-full h-full object-cover" alt={partner.name} />
                                                    </div>
                                                    <div className="flex-1 pr-14 space-y-1.5">
                                                        <h4 className="font-bold text-white text-base leading-tight group-hover:text-purple-400 transition-colors">{partner.name}</h4>
                                                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block shadow-sm shadow-emerald-900/20">{partner.discount}</span>
                                                        <p className="text-xs text-slate-400 block font-medium">{partner.category}</p>
                                                    </div>
                                                    <div className="absolute top-3 right-3 flex gap-1 bg-slate-950/50 rounded-lg shadow-sm border border-white/10 p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                        <button
                                                            className="text-blue-400 hover:text-white p-1.5 rounded-md hover:bg-blue-600 transition-colors"
                                                            onClick={() => openPartnerModal(partner)}
                                                            title="Editar Parceiro"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            className="text-red-400 hover:text-white p-1.5 rounded-md hover:bg-red-600 transition-colors"
                                                            onClick={() => confirmDeletePartner(partner.id, setItemToDelete, setIsDeleteModalOpen)}
                                                            title="Remover Parceiro"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            }

                        </div >
                    )}

                    {activeSection === 'students' && (
                        <MemberRegistry
                            data={globalStudentsData?.data || []}
                            count={globalStudentsData?.count || 0}
                            isLoading={isLoadingGlobalStudents}
                            page={globalStudentPage}
                            pageSize={pageSize}
                            onPageChange={setGlobalStudentPage}
                        />
                    )}

                    {activeSection === 'partners' && !managedSchool && (
                        <PartnerDirectory
                            partners={partners}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            uniqueStates={uniqueStates}
                            uniqueCities={uniqueCities}
                            uniqueCategories={uniqueCategories}
                            partnerFilters={partnerFilters}
                            onFilterChange={setPartnerFilters}
                            getLinkedSchoolName={(id) => schools.find(s => s.id === id)?.name || 'Geral'}
                        />
                    )}

                    {/* LOGS SECTION */}
                    {activeSection === 'logs' && (
                        <GlobalAuditTrail
                            data={paginatedLogsData?.data || []}
                            count={paginatedLogsData?.count || 0}
                            isLoading={isLoadingLogs}
                            page={logsPage}
                            pageSize={pageSize}
                            onPageChange={setLogsPage}
                            schools={schools}
                            schoolFilter={logSchoolFilter}
                            onSchoolFilterChange={setLogSchoolFilter}
                        />
                    )}
                </div >
            </main >
            <OnboardingTour
                tourId="admin_dashboard"
                steps={adminSteps}
                onComplete={() => console.log('Admin onboarding complete')}
            />
        </div >
    );
};
