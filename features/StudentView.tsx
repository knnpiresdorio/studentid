import React, { useState } from 'react';
import {
    X, Upload, Info
} from 'lucide-react';
import { AppUser, Partner, ChangeRequest, Student, AuditLog, UserRole } from '../types';
import { StudentCard } from './StudentCard';
import { PartnerDetailCard } from './partner/PartnerDetailCard';
import { StudentLayout } from './student/StudentLayout';
import { DigitalID } from './student/id/DigitalID';
import { BenefitsList } from './student/benefits/BenefitsList';
import { DependentManager } from './student/profile/DependentManager';
import { ActivityTrail } from './student/activity/ActivityTrail';
import { InviteLinkManager } from './invites/InviteLinkManager';
import { HeaderControls } from '../components/HeaderControls';

// Hooks
import { useStudentBenefits } from './student/hooks/useStudentBenefits';
import { useStudentProfile } from './student/hooks/useStudentProfile';
import { useStudentDependents } from './student/hooks/useStudentDependents';

// Modals
import {
    DeleteDependentModal,
    InfoUpdateModal,
    PhotoUpdateConfirmationModal,
    PhotoPreviewModal,
    SuccessModal
} from './student/modals/StudentModals';
import { DependentModal } from '../components/modals/DependentModal';

interface StudentViewProps {
    user: AppUser;
    partners: Partner[];
    myRequests: ChangeRequest[];
    auditLogs: AuditLog[];
    onUpdateStudent: (student: Student) => void;
    onAddDependentUser: (newDependentUser: AppUser) => void;
    onRequestChange: (request: Omit<ChangeRequest, 'id' | 'createdAt' | 'status'>) => void;
    onReportError: (error: string, context: string) => void;
    onLogout: () => void;
}

export const StudentView: React.FC<StudentViewProps> = ({
    user,
    partners,
    myRequests,
    auditLogs,
    onRequestChange,
    onLogout
}) => {
    // Tab State
    const [activeTab, setActiveTab] = useState<'id' | 'partners' | 'requests' | 'family'>('id');

    // --- Hooks Integration ---

    // 1. Profile & General Actions
    const {
        infoModal, setInfoModal,
        photoUpdateModal, setPhotoUpdateModal,
        showPhotoUploadConfirmation, setShowPhotoUploadConfirmation,
        successModal, setSuccessModal,
        fileInputRef,
        handleProfilePhotoUpdate,
        confirmPhotoUpdate,
        handleInfoUpdateRequest
    } = useStudentProfile({ user, onRequestChange });

    // 2. Dependents Management
    const {
        viewingDependent, setViewingDependent,
        editingDependent,
        showAddDependent,
        showUpsell,
        hasFamilyCombo,
        deleteModal, setDeleteModal,
        handleSnoozeUpsell,
        handleAddDependentClick,
        handleSaveDependent,
        openDeleteModal,
        handleSubmitDeleteRequest,
        handleEditClick,
        resetDependentForm
    } = useStudentDependents({ user, onRequestChange, setSuccessModal });

    // 3. Benefits & Partners
    const {
        selectedPartner, setSelectedPartner,
        searchQuery, setSearchQuery,
        isOffline,
        selectedCategory, setSelectedCategory,
        showFavoritesOnly, setShowFavoritesOnly,
        favorites,
        toggleFavorite,
        myPartners
    } = useStudentBenefits(partners, user.studentData?.schoolId);

    const isDependentUser = user.studentData?.isDependent;
    const hasPhoto = !!user.studentData?.photoUrl;

    // --- Render Mandatory Photo Upload (Force Onboarding) ---
    if (!hasPhoto && user.role === UserRole.STUDENT && activeTab === 'id') {
        return (
            <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-8 animate-fade-in">
                <div className="max-w-md w-full text-center space-y-8">
                    <div className="mx-auto w-24 h-24 bg-indigo-600/20 rounded-full flex items-center justify-center text-indigo-400 ring-4 ring-indigo-500/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-white italic font-display">QUASE LÁ!</h1>
                        <p className="text-slate-400 text-sm">
                            Sua instituição já liberou seu acesso, mas precisamos de uma foto para gerar sua carteirinha digital oficial.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-2">
                            <Info size={14} /> Dica para uma boa foto:
                        </p>
                        <ul className="text-xs text-slate-400 space-y-2 text-left list-disc list-inside">
                            <li>Fundo neutro e boa iluminação</li>
                            <li>Rosto centralizado e visível</li>
                            <li>Evite óculos de sol ou chapéus</li>
                        </ul>
                    </div>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Upload size={20} /> Escolher Foto Agora
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleProfilePhotoUpdate}
                            ref={fileInputRef}
                        />
                    </button>

                    <button onClick={onLogout} className="text-slate-500 hover:text-white text-sm font-bold transition-colors">
                        Sair e fazer isso depois
                    </button>
                </div>

                <PhotoPreviewModal
                    isOpen={photoUpdateModal.isOpen}
                    photoUrl={photoUpdateModal.photoUrl}
                    onClose={() => setPhotoUpdateModal({ isOpen: false, photoUrl: null })}
                    onConfirm={confirmPhotoUpdate}
                />
            </div>
        );
    }

    return (
        <StudentLayout
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={onLogout}
            userName={user.name}
            userPhoto={user.studentData?.photoUrl}
            headerAction={activeTab === 'id' ? (
                <div className="flex gap-2 items-center">
                    <HeaderControls />
                    <button
                        onClick={() => setShowPhotoUploadConfirmation(true)}
                        className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full active:scale-95 transition-all"
                    >
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleProfilePhotoUpdate}
                            ref={fileInputRef}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                    </button>
                </div>
            ) : undefined}
        >
            <DeleteDependentModal
                isOpen={deleteModal.isOpen}
                dependentName={deleteModal.dependentName}
                reason={deleteModal.reason}
                onReasonChange={(val) => setDeleteModal({ ...deleteModal, reason: val })}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleSubmitDeleteRequest}
            />

            <InfoUpdateModal
                isOpen={infoModal.isOpen}
                reason={infoModal.reason}
                onReasonChange={(val) => setInfoModal({ ...infoModal, reason: val })}
                onClose={() => setInfoModal({ ...infoModal, isOpen: false })}
                onConfirm={handleInfoUpdateRequest}
            />

            <PhotoUpdateConfirmationModal
                isOpen={showPhotoUploadConfirmation}
                onClose={() => setShowPhotoUploadConfirmation(false)}
                onConfirm={() => {
                    setShowPhotoUploadConfirmation(false);
                    setTimeout(() => {
                        if (fileInputRef.current) {
                            fileInputRef.current.click();
                        }
                    }, 300);
                }}
            />

            <PhotoPreviewModal
                isOpen={photoUpdateModal.isOpen}
                photoUrl={photoUpdateModal.photoUrl}
                onClose={() => setPhotoUpdateModal({ isOpen: false, photoUrl: null })}
                onConfirm={confirmPhotoUpdate}
            />

            <SuccessModal
                isOpen={successModal.isOpen}
                message={successModal.message}
                onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
            />

            {/* --- TAB CONTENT --- */}

            {selectedPartner ? (
                <div className="animate-fade-in lg:h-full">
                    <PartnerDetailCard
                        partner={selectedPartner}
                        onClose={() => setSelectedPartner(null)}
                    />
                </div>
            ) : (
                <>
                    {activeTab === 'id' && user.studentData && (
                        <DigitalID
                            studentData={user.studentData}
                            isOffline={isOffline}
                            onReportError={() => setInfoModal({ isOpen: true, reason: '' })}
                            onUpdatePhoto={() => setShowPhotoUploadConfirmation(true)}
                            isDependentUser={isDependentUser || false}
                        />
                    )}


                    {activeTab === 'partners' && (
                        <BenefitsList
                            partners={myPartners}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                            showFavoritesOnly={showFavoritesOnly}
                            onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            favorites={favorites}
                            onToggleFavorite={toggleFavorite}
                            onSelectPartner={setSelectedPartner}
                        />
                    )}


                    {activeTab === 'family' && user.studentData && (
                        <div className="space-y-6">
                            <InviteLinkManager
                                schoolId={user.studentData.schoolId}
                                parentId={user.studentData.id}
                            />
                            <DependentManager
                                studentData={user.studentData}
                                dependents={user.studentData.dependents}
                                hasFamilyCombo={hasFamilyCombo}
                                showUpsell={showUpsell}
                                onSnoozeUpsell={handleSnoozeUpsell}
                                onAddDependentClick={handleAddDependentClick}
                                onEditDependent={handleEditClick}
                                onDeleteDependent={openDeleteModal}
                                onViewCard={setViewingDependent}
                                isDependentUser={isDependentUser || false}
                            />
                        </div>
                    )}


                    {activeTab === 'requests' && (
                        <ActivityTrail
                            requests={myRequests}
                            auditLogs={auditLogs}
                            partners={partners}
                            studentId={user.studentData?.id}
                        />
                    )}


                    {/* Add/Edit Dependent Modal */}
                    <DependentModal
                        isOpen={showAddDependent}
                        onClose={resetDependentForm}
                        onSave={handleSaveDependent}
                        dependent={editingDependent || undefined}
                    />
                </>
            )}
        </StudentLayout>
    );
};
