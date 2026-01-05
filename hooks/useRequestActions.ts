import { Student, UserRole, ChangeRequest } from '../types';
import { useUpsertChangeRequestMutation, useUpsertStudentMutation } from './useSupabaseQuery';
import { useAnalytics } from '../context/AnalyticsContext';
import { useMembers } from '../context/MemberContext';
import { useAuth } from '../context/AuthContext';

export const useRequestActions = (schoolId: string) => {
    const { addAuditLog } = useAnalytics();
    const { students } = useMembers();
    const { user } = useAuth();
    const upsertChangeRequest = useUpsertChangeRequestMutation();
    const upsertStudent = useUpsertStudentMutation();

    const handleResolveRequest = async (request: ChangeRequest, action: 'APPROVE' | 'REJECT', rejectionReason?: string) => {
        const isApproval = action === 'APPROVE';

        const updatedRequest: ChangeRequest = {
            ...request,
            status: isApproval ? 'APPROVED' : 'REJECTED',
            reason: isApproval ? request.reason : (rejectionReason || request.reason),
            resolvedAt: new Date().toISOString(),
            resolvedBy: user?.name || 'Admin'
        };

        try {
            await upsertChangeRequest.mutateAsync(updatedRequest);

            if (isApproval) {
                const student = students.find(s => s.id === request.studentId);
                if (student) {
                    let updatedStudent = { ...student };
                    let actionDetail = '';

                    if (request.type === 'ADD_DEPENDENT' && request.payload) {
                        updatedStudent.dependents = [...(student.dependents || []), request.payload];
                        await upsertStudent.mutateAsync(updatedStudent);
                        actionDetail = `Inclusão de dependente: ${request.payload.name}`;
                    } else if (request.type === 'DELETE_DEPENDENT') {
                        updatedStudent.dependents = student.dependents.filter(d => d.id !== request.dependentId);
                        await upsertStudent.mutateAsync(updatedStudent);
                        actionDetail = `Remoção de dependente: ${request.dependentName}`;
                    } else if (request.type === 'UPDATE_PHOTO' && request.payload?.photoUrl) {
                        updatedStudent.photoUrl = request.payload.photoUrl;
                        await upsertStudent.mutateAsync(updatedStudent);
                        actionDetail = `Atualização de foto de perfil`;
                    }

                    addAuditLog(
                        schoolId,
                        'APPROVE_REQUEST',
                        `Aprovou solicitação (${request.type}) para ${student.fullName}. ${actionDetail}`,
                        user?.id || 'sys',
                        user?.name || 'Admin',
                        user?.role || UserRole.ADMIN,
                        { requestId: request.id, studentId: student.id }
                    );
                }
            } else {
                addAuditLog(
                    schoolId,
                    'REJECT_REQUEST',
                    `Rejeitou solicitação (${request.type}) de ${request.studentName}. Motivo: ${rejectionReason}`,
                    user?.id || 'sys',
                    user?.name || 'Admin',
                    user?.role || UserRole.ADMIN,
                    { requestId: request.id, studentId: request.studentId }
                );
            }
        } catch (error) {
            console.error("Error resolving request:", error);
            alert("Erro ao processar solicitação.");
            throw error;
        }
    };

    return {
        handleResolveRequest,
        upsertChangeRequest
    };
};
