import { useState } from 'react';
import { Student, UserRole } from '../types';
import { useUpsertStudentMutation, useDeleteStudentMutation } from './useSupabaseQuery';
import { useAnalytics } from '../context/AnalyticsContext';
import { useAuth } from '../context/AuthContext';

export const useStudentActions = (schoolId: string) => {
    const { addAuditLog } = useAnalytics();
    const { user } = useAuth();
    const upsertStudent = useUpsertStudentMutation();
    const deleteStudent = useDeleteStudentMutation();

    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
    const [isBulkUndoModalOpen, setIsBulkUndoModalOpen] = useState(false);
    const [bulkActionType, setBulkActionType] = useState<'ACTIVATE' | 'DEACTIVATE' | null>(null);

    const handleToggleStatus = async (student: Student) => {
        const check = confirm(`Deseja ${student.isActive ? 'desativar' : 'ativar'} o aluno ${student.fullName}?`);
        if (!check) return;

        const newStatus = !student.isActive;
        const updatedStudent = {
            ...student,
            isActive: newStatus,
            dependents: student.dependents?.map(d => ({ ...d, isActive: newStatus })) || []
        };

        try {
            await upsertStudent.mutateAsync(updatedStudent);
            addAuditLog(
                schoolId,
                'UPDATE_STUDENT',
                `${newStatus ? 'Ativou' : 'Desativou'} aluno: ${student.fullName}`,
                user?.id || 'system',
                user?.name || 'System',
                user?.role || UserRole.ADMIN
            );
        } catch (error) {
            console.error("Error toggling status:", error);
            alert("Erro ao alterar status.");
            throw error;
        }
    };

    const handleToggleDependentStatus = async (student: Student, dependentId: string) => {
        const dependent = student.dependents?.find(d => d.id === dependentId);
        if (!dependent) return;

        const newStatus = !dependent.isActive;
        const updatedDependents = student.dependents?.map(d =>
            d.id === dependentId ? { ...d, isActive: newStatus } : d
        );

        const updatedStudent = { ...student, dependents: updatedDependents };

        try {
            await upsertStudent.mutateAsync(updatedStudent);
            addAuditLog(
                schoolId,
                'UPDATE_DEPENDENT',
                `${newStatus ? 'Ativou' : 'Desativou'} dependente: ${dependent.name}`,
                user?.id || 'system',
                user?.name || 'System',
                user?.role || UserRole.ADMIN,
                { dependentId, isActive: newStatus, targetId: student.id, targetName: student.fullName }
            );
        } catch (error) {
            alert("Erro ao alterar status do dependente.");
            throw error;
        }
    };

    const handleExecuteDelete = async (student: Student) => {
        try {
            await deleteStudent.mutateAsync(student.id);
            addAuditLog(
                schoolId,
                'DELETE_STUDENT',
                `Removeu aluno: ${student.fullName}`,
                user?.id || 'system',
                user?.name || 'System',
                user?.role || UserRole.ADMIN,
                { targetId: student.id, targetName: student.fullName }
            );
        } catch (error) {
            alert("Erro ao remover aluno.");
            throw error;
        }
    };

    const handleBulkAction = async (ids: string[], action: 'ACTIVATE' | 'DEACTIVATE', students: Student[]) => {
        const status = action === 'ACTIVATE';
        try {
            await Promise.all(
                ids.map(id => {
                    const student = students.find(s => s.id === id);
                    if (student) {
                        return upsertStudent.mutateAsync({ ...student, isActive: status });
                    }
                    return Promise.resolve();
                })
            );

            addAuditLog(
                schoolId,
                'BULK_UPDATE_STATUS',
                `${status ? 'Ativou' : 'Desativou'} ${ids.length} alunos`,
                user?.id || 'system',
                user?.name || 'System',
                user?.role || UserRole.ADMIN,
                { count: ids.length, type: action }
            );
            setSelectedStudentIds(new Set());
        } catch (error) {
            console.error("Bulk action failed:", error);
            alert("Erro ao executar ação em massa.");
            throw error;
        }
    };

    return {
        handleToggleStatus,
        handleToggleDependentStatus,
        handleExecuteDelete,
        handleBulkAction,
        selectedStudentIds,
        setSelectedStudentIds,
        isBulkUndoModalOpen,
        setIsBulkUndoModalOpen,
        bulkActionType,
        setBulkActionType,
        upsertStudent,
        deleteStudent
    };
};
