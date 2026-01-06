import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { Partner } from '../../types';

export const PARTNER_KEYS = {
    all: 'partners',
};

import { MOCK_PARTNERS } from '../../services/mockData';

const fetchPartners = async (): Promise<Partner[]> => {
    const { data, error } = await supabase.from('partners').select('*');
    if (error) {
        console.error('Supabase error:', error);
        return MOCK_PARTNERS;
    }
    return (data && data.length > 0) ? data : MOCK_PARTNERS;
};

export const usePartnersQuery = (enabled: boolean = true) => {
    return useQuery({
        queryKey: [PARTNER_KEYS.all],
        queryFn: fetchPartners,
        staleTime: 1000 * 60 * 5,
        enabled
    });
};

export const useUpsertPartnerMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (partner: Partner) => {
            const { data, error } = await supabase.from('partners').upsert(partner).select().single();
            if (error) throw error;
            return data;
        },
        onMutate: async (newPartner) => {
            await queryClient.cancelQueries({ queryKey: [PARTNER_KEYS.all] });
            const previousPartners = queryClient.getQueryData<Partner[]>([PARTNER_KEYS.all]);
            queryClient.setQueryData<Partner[]>([PARTNER_KEYS.all], (old) => {
                if (!old) return [newPartner];
                const exists = old.find(p => p.id === newPartner.id);
                if (exists) return old.map(p => p.id === newPartner.id ? newPartner : p);
                return [newPartner, ...old];
            });
            return { previousPartners };
        },
        onError: (err, newPartner, context) => {
            queryClient.setQueryData([PARTNER_KEYS.all], context?.previousPartners);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [PARTNER_KEYS.all] });
        },
    });
};

export const useDeletePartnerMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('partners').delete().eq('id', id);
            if (error) throw error;
            return id;
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: [PARTNER_KEYS.all] });
            const previousPartners = queryClient.getQueryData<Partner[]>([PARTNER_KEYS.all]);
            queryClient.setQueryData<Partner[]>([PARTNER_KEYS.all], (old) => {
                return (old || []).filter(p => p.id !== id);
            });
            return { previousPartners };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData([PARTNER_KEYS.all], context?.previousPartners);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [PARTNER_KEYS.all] });
        },
    });
};
