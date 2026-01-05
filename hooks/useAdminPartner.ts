import { useState, useMemo } from 'react';
import { Partner } from '../types';

export const useAdminPartner = (partners: Partner[], globalSearchTerm: string) => {
    const [partnerTab, setPartnerTab] = useState<'list' | 'dashboard'>('list');
    const [partnerFilters, setPartnerFilters] = useState({
        state: 'TODOS',
        city: 'TODAS',
        category: 'TODAS'
    });

    const uniqueStates = useMemo(() =>
        Array.from(new Set(partners.map(p => p.state || 'N/A').filter(s => s !== 'N/A'))),
        [partners]
    );

    const uniqueCities = useMemo(() =>
        Array.from(new Set(partners.map(p => p.city || 'N/A').filter(c => c !== 'N/A'))),
        [partners]
    );

    const uniqueCategories = useMemo(() =>
        Array.from(new Set(partners.map(p => p.category))),
        [partners]
    );

    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

    const openPartnerModal = (partner?: Partner) => {
        setEditingPartner(partner || null);
        setIsPartnerModalOpen(true);
    };

    const handleSavePartner = async (partnerData: Partner, upsertPartner: any, addAuditLog: any, user: any) => {
        try {
            await upsertPartner.mutateAsync(partnerData);
            addAuditLog(
                partnerData.schoolId || 'ALL',
                'MODIFICATION',
                `${editingPartner ? 'Atualizou' : 'Criou'} parceiro: ${partnerData.name}`,
                user?.id || 'sys',
                user?.name || 'Admin',
                user?.role || 'ADMIN'
            );
            setIsPartnerModalOpen(false);
        } catch (error) {
            console.error("Error saving partner:", error);
            alert("Erro ao salvar parceiro.");
        }
    };

    const confirmDeletePartner = (id: string, setItemToDelete: (item: { type: 'student' | 'partner', id: string } | null) => void, setIsDeleteModalOpen: (open: boolean) => void) => {
        setItemToDelete({ type: 'partner', id });
        setIsDeleteModalOpen(true);
    };

    return {
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
        setEditingPartner,
        openPartnerModal,
        handleSavePartner,
        confirmDeletePartner
    };
};
