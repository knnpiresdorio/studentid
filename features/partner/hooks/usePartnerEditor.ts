import { useState, useEffect } from 'react';
import { Partner, Promotion, PromotionUsageLimit, ActionType } from '../../../types';
import { useUpsertPartnerMutation } from '../../../hooks/useSupabaseQuery';
import { useAuth } from '../../../context/AuthContext';
import { useAnalytics } from '../../../context/AnalyticsContext';

export const usePartnerEditor = (currentPartner: Partner | undefined) => {
    const { user } = useAuth();
    const { addAuditLog } = useAnalytics();
    const upsertPartner = useUpsertPartnerMutation();

    const [isEditingPartner, setIsEditingPartner] = useState(false);
    const [editedPartner, setEditedPartner] = useState<Partner | null>(null);
    const [showSaveWarning, setShowSaveWarning] = useState(false);

    useEffect(() => {
        if (currentPartner && !editedPartner) {
            setEditedPartner(currentPartner);
        }
    }, [currentPartner]);

    const handleAddPromotion = () => {
        if (!editedPartner) return;
        const newPromo: Promotion = {
            id: crypto.randomUUID(),
            title: '',
            limit: 'UNLIMITED',
            isActive: true
        };
        setEditedPartner({
            ...editedPartner,
            activePromotions: [...(editedPartner.activePromotions || []), newPromo]
        });
    };

    const handleUpdatePromotion = (index: number, field: keyof Promotion, value: any) => {
        if (!editedPartner || !editedPartner.activePromotions) return;
        const updatedPromos = [...editedPartner.activePromotions];
        updatedPromos[index] = { ...updatedPromos[index], [field]: value };
        setEditedPartner({ ...editedPartner, activePromotions: updatedPromos });
    };

    const handleTogglePromotionStatus = (index: number) => {
        if (!editedPartner || !editedPartner.activePromotions) return;
        const updatedPromos = [...editedPartner.activePromotions];
        const currentStatus = updatedPromos[index].isActive;
        updatedPromos[index] = {
            ...updatedPromos[index],
            isActive: currentStatus === undefined ? false : !currentStatus
        };
        setEditedPartner({ ...editedPartner, activePromotions: updatedPromos });
    };

    const handleSavePartner = async () => {
        if (!editedPartner) return;

        if (!editedPartner.logoUrl || editedPartner.logoUrl.trim() === '') {
            alert('A Logo do estabelecimento é obrigatória!');
            return;
        }

        try {
            await upsertPartner.mutateAsync(editedPartner);
            setIsEditingPartner(false);
            setShowSaveWarning(false);

            addAuditLog(
                editedPartner.schoolId,
                ActionType.MODIFICATION,
                `Atualizou informações do perfil: ${editedPartner.name}`,
                user?.id || 'sys',
                user?.name || 'Gestor',
                user?.role || 'STORE_ADMIN',
                { partnerId: editedPartner.id }
            );
        } catch (error) {
            console.error('Error saving partner:', error);
            alert('Erro ao salvar alterações. Tente novamente.');
        }
    };

    const toggleSocialVisibility = (network: 'instagram' | 'facebook' | 'tiktok' | 'phone') => {
        if (!editedPartner) return;
        const currentVisibility = editedPartner.socialVisibility || { instagram: true, facebook: true, tiktok: true, phone: true };
        setEditedPartner({
            ...editedPartner,
            socialVisibility: {
                ...currentVisibility,
                [network]: !currentVisibility[network]
            }
        });
    };

    return {
        isEditingPartner,
        setIsEditingPartner,
        editedPartner,
        setEditedPartner,
        showSaveWarning,
        setShowSaveWarning,
        handleAddPromotion,
        handleUpdatePromotion,
        handleTogglePromotionStatus, // Renamed from handleRemovePromotion
        handleSavePartner,
        toggleSocialVisibility
    };
};
