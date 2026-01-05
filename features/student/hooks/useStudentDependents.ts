import React, { useState, useEffect } from 'react';
import { AppUser, ChangeRequest, Dependent } from '../../../types';

interface UseStudentDependentsProps {
    user: AppUser;
    onRequestChange: (request: Omit<ChangeRequest, 'id' | 'createdAt' | 'status'>) => void;
    setSuccessModal: (modal: { isOpen: boolean, message: string }) => void;
}

export const useStudentDependents = ({ user, onRequestChange, setSuccessModal }: UseStudentDependentsProps) => {
    // Modals
    const [viewingDependent, setViewingDependent] = useState<Dependent | null>(null);
    const [editingDependent, setEditingDependent] = useState<Dependent | null>(null);
    const [showAddDependent, setShowAddDependent] = useState(false);
    const [showUpsell, setShowUpsell] = useState(false);

    // Mock state for users who bought the combo
    const [hasFamilyCombo, setHasFamilyCombo] = useState(false);

    // Initial check for snooze

    // Initial check for snooze
    useEffect(() => {
        const snoozeDate = localStorage.getItem('unipass_family_snooze');
        if (snoozeDate && new Date().getTime() < parseInt(snoozeDate)) {
            setShowUpsell(false);
        } else {
            setShowUpsell(true);
        }
    }, []);

    const handleSnoozeUpsell = () => {
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem('unipass_family_snooze', (new Date().getTime() + thirtyDays).toString());
        setShowUpsell(false);
    };

    const handleAddDependentClick = () => {
        const usedSlots = user.studentData?.dependents.length || 0;
        if (!hasFamilyCombo && usedSlots >= 2) {
            setShowUpsell(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setEditingDependent(null);
        setShowAddDependent(true);
    };

    const handleSaveDependent = (dependent: Dependent) => {
        if (!user.studentData) return;

        if (editingDependent) {
            onRequestChange({
                schoolId: user.studentData.schoolId,
                studentId: user.studentData.id,
                studentName: user.name,
                type: 'UPDATE_DEPENDENT',
                reason: 'Atualização de dados cadastrais',
                dependentId: editingDependent.id,
                payload: {
                    old: editingDependent,
                    new: {
                        ...editingDependent,
                        ...dependent
                    }
                }
            });
            setSuccessModal({ isOpen: true, message: 'Solicitação de alteração enviada!' });
        } else {
            const currentCount = user.studentData.dependents.length;
            if (currentCount >= 5) {
                alert("Limite de 5 dependentes atingido.");
                return;
            }

            onRequestChange({
                schoolId: user.studentData.schoolId,
                studentId: user.studentData.id,
                studentName: user.studentData.fullName,
                type: 'ADD_DEPENDENT',
                reason: `Inclusão de dependente: ${dependent.relation}`,
                payload: {
                    ...dependent,
                    id: `req_${Date.now()}`
                }
            });
            setSuccessModal({ isOpen: true, message: 'Solicitação de dependente enviada!' });
        }

        setShowAddDependent(false);
        setEditingDependent(null);
    };

    // Delete Logic
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, dependentId: '', dependentName: '', reason: '' });

    const openDeleteModal = (e: React.MouseEvent, dep: Dependent) => {
        e.stopPropagation();
        setDeleteModal({ isOpen: true, dependentId: dep.id, dependentName: dep.name, reason: '' });
    };

    const handleSubmitDeleteRequest = () => {
        if (!user.studentData || !deleteModal.reason.trim()) return;

        onRequestChange({
            schoolId: user.studentData.schoolId,
            studentId: user.studentData.id,
            studentName: user.studentData.fullName,
            type: 'DELETE_DEPENDENT',
            dependentId: deleteModal.dependentId,
            dependentName: deleteModal.dependentName,
            reason: deleteModal.reason
        });

        setDeleteModal({ isOpen: false, dependentId: '', dependentName: '', reason: '' });
        setSuccessModal({ isOpen: true, message: 'Solicitação de exclusão enviada!' });
    };

    const handleEditClick = (dep: Dependent) => {
        setEditingDependent(dep);
        setShowAddDependent(true);
    };

    const resetDependentForm = () => {
        setShowAddDependent(false);
        setEditingDependent(null);
    };

    return {
        viewingDependent, setViewingDependent,
        editingDependent, setEditingDependent,
        showAddDependent, setShowAddDependent,
        showUpsell, setShowUpsell,
        hasFamilyCombo, setHasFamilyCombo,
        deleteModal, setDeleteModal,
        handleSnoozeUpsell,
        handleAddDependentClick,
        handleSaveDependent,
        openDeleteModal,
        handleSubmitDeleteRequest,
        handleEditClick,
        resetDependentForm
    };
};
