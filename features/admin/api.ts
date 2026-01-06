import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { School, AuditLog, PaginationParams, PaginatedResult } from '../../types';

export const ADMIN_KEYS = {
    schools: 'schools',
    audit: 'auditLogs',
    paginatedAudit: 'paginatedAuditLogs',
};

const fetchSchools = async (): Promise<School[]> => {
    const { data, error } = await supabase.from('schools').select('*');
    if (error) throw error;
    return data || [];
};

const fetchAuditLogs = async (): Promise<AuditLog[]> => {
    // Limit to reasonable amount for context if needed, but Context currently fetches all?
    // Originally useAuditLogsQuery fetched all. Better to limit or use pagination.
    const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(200);
    if (error) throw error;
    return data || [];
};

export const fetchPaginatedAuditLogs = async ({ page, pageSize, searchTerm, schoolId }: PaginationParams): Promise<PaginatedResult<AuditLog>> => {
    let query = supabase.from('audit_logs').select('*', { count: 'exact' });

    if (schoolId) {
        query = query.eq('schoolId', schoolId);
    }

    if (searchTerm) {
        query = query.or(`action.ilike.%${searchTerm}%,details.ilike.%${searchTerm}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
        .order('timestamp', { ascending: false })
        .range(from, to);

    if (error) throw error;
    return { data: data || [], count: count || 0 };
};

export const useSchoolsQuery = (enabled: boolean = true) => {
    return useQuery({
        queryKey: [ADMIN_KEYS.schools],
        queryFn: fetchSchools,
        staleTime: 1000 * 60 * 60, // Schools change rarely
        enabled
    });
};

export const useAuditLogsQuery = (enabled: boolean = true) => {
    return useQuery({
        queryKey: [ADMIN_KEYS.audit],
        queryFn: fetchAuditLogs,
        staleTime: 1000 * 30,
        enabled
    });
};

export const usePaginatedAuditLogsQuery = (params: PaginationParams, enabled: boolean = true) => {
    return useQuery({
        queryKey: [ADMIN_KEYS.paginatedAudit, params],
        queryFn: () => fetchPaginatedAuditLogs(params),
        staleTime: 1000 * 10,
        enabled
    });
};

export const useUpsertSchoolMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (school: School) => {
            const { data, error } = await supabase.from('schools').upsert(school).select().single();
            if (error) throw error;
            return data;
        },
        onMutate: async (newSchool) => {
            await queryClient.cancelQueries({ queryKey: [ADMIN_KEYS.schools] });
            const previousSchools = queryClient.getQueryData<School[]>([ADMIN_KEYS.schools]);
            queryClient.setQueryData<School[]>([ADMIN_KEYS.schools], (old) => {
                if (!old) return [newSchool];
                const exists = old.find(s => s.id === newSchool.id);
                if (exists) return old.map(s => s.id === newSchool.id ? newSchool : s);
                return [newSchool, ...old];
            });
            return { previousSchools };
        },
        onError: (err, newSchool, context) => {
            queryClient.setQueryData([ADMIN_KEYS.schools], context?.previousSchools);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [ADMIN_KEYS.schools] });
        },
    });
};
