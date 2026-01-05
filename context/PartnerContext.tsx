import React, { createContext, useContext, ReactNode } from 'react';
import { Partner } from '../types';
import {
    usePartnersQuery,
    useUpsertPartnerMutation,
    useDeletePartnerMutation
} from '../hooks/useSupabaseQuery';

interface PartnerContextType {
    partners: Partner[];
    isLoading: boolean;
    error: any;

    // Actions
    upsertPartner: (partner: Partner) => void;
    deletePartner: (id: string) => void;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export const PartnerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { data: partners = [], isLoading, error } = usePartnersQuery();

    const upsertPartnerMutation = useUpsertPartnerMutation();
    const deletePartnerMutation = useDeletePartnerMutation();

    const upsertPartner = (partner: Partner) => upsertPartnerMutation.mutate(partner);
    const deletePartner = (id: string) => deletePartnerMutation.mutate(id);

    return (
        <PartnerContext.Provider value={{
            partners,
            isLoading,
            error,
            upsertPartner,
            deletePartner
        }}>
            {children}
        </PartnerContext.Provider>
    );
};

export const usePartners = () => {
    const context = useContext(PartnerContext);
    if (!context) {
        throw new Error('usePartners must be used within a PartnerProvider');
    }
    return context;
};
