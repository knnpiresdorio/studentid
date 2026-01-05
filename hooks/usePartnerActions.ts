import { useState } from 'react';
import { Partner, UserRole } from '../types';
import { useUpsertPartnerMutation, useDeletePartnerMutation } from './useSupabaseQuery';
import { useAnalytics } from '../context/AnalyticsContext';
import { useAuth } from '../context/AuthContext';

export const usePartnerActions = (schoolId: string) => {
    const { addAuditLog } = useAnalytics();
    const { user, setUsers } = useAuth();
    const upsertPartner = useUpsertPartnerMutation();

    const handleTogglePartnerStatus = async (partner: Partner) => {
        const newStatus = !partner.isActive;
        const updatedPartner = { ...partner, isActive: newStatus };

        try {
            await upsertPartner.mutateAsync(updatedPartner);
            addAuditLog(
                schoolId,
                'UPDATE_PARTNER',
                `Parceria com ${partner.name} ${newStatus ? 'ativada' : 'desativada'}`,
                user?.id || 'system',
                user?.name || 'System',
                user?.role || UserRole.ADMIN,
                { isActive: newStatus, targetId: partner.id, targetName: partner.name }
            );
        } catch (err) {
            console.error('Error toggling partner status:', err);
            alert('Erro ao alterar status da parceria.');
            throw err;
        }
    };

    const handleResetPartnerPassword = (partner: Partner) => {
        const newPassword = prompt(`Digite a nova senha para o gestor de ${partner.name}:`);
        if (!newPassword) return;

        setUsers(prev => prev.map(u =>
            u.id === partner.adminUserId || u.partnerId === partner.id
                ? { ...u, password: newPassword }
                : u
        ));
        alert("Senha atualizada com sucesso.");
        addAuditLog(
            schoolId,
            'RESET_PASSWORD',
            `Resetou senha do parceiro ${partner.name}`,
            user?.id || 'system',
            user?.name || 'System',
            user?.role || UserRole.ADMIN,
            { targetId: partner.adminUserId || 'unknown', targetName: partner.name }
        );
    };

    return {
        handleTogglePartnerStatus,
        handleResetPartnerPassword,
        upsertPartner
    };
};
