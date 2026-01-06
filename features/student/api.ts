import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { Student, ChangeRequest, PaginationParams, PaginatedResult } from '../../types';

export const STUDENT_KEYS = {
    all: 'students',
    paginated: 'paginatedStudents',
    requests: 'changeRequests',
};

export const fetchStudentById = async (id: string): Promise<Student | null> => {
    const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
    if (error) return null;
    return data;
};

export const fetchStudentByCpf = async (cpf: string): Promise<Student | null> => {
    const { data, error } = await supabase.from('students').select('*').eq('cpf', cpf).maybeSingle();
    if (error) return null;
    return data;
};

export const fetchStudentStats = async (): Promise<{ schoolId: string; isActive: boolean }[]> => {
    const { data, error } = await supabase.from('students').select('schoolId, isActive');
    if (error) throw error;
    return data || [];
};

const fetchChangeRequests = async (): Promise<ChangeRequest[]> => {
    const { data, error } = await supabase.from('change_requests').select('*');
    if (error) throw error;
    return data || [];
};

export const fetchPaginatedStudents = async ({ page, pageSize, searchTerm, schoolId }: PaginationParams): Promise<PaginatedResult<Student>> => {
    let query = supabase.from('students').select('*', { count: 'exact' });

    if (schoolId) {
        query = query.eq('schoolId', schoolId);
    }

    if (searchTerm) {
        query = query.or(`fullName.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
        .order('fullName', { ascending: true })
        .range(from, to);

    if (error) throw error;
    return { data: data || [], count: count || 0 };
};

export const useStudentStatsQuery = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ['studentStats'],
        queryFn: fetchStudentStats,
        staleTime: 1000 * 60 * 5,
        enabled
    });
};

export const useChangeRequestsQuery = (enabled: boolean = true) => {
    return useQuery({
        queryKey: [STUDENT_KEYS.requests],
        queryFn: fetchChangeRequests,
        staleTime: 1000 * 30,
        enabled
    });
};

export const usePaginatedStudentsQuery = (params: PaginationParams, enabled: boolean = true) => {
    return useQuery({
        queryKey: [STUDENT_KEYS.paginated, params],
        queryFn: () => fetchPaginatedStudents(params),
        staleTime: 1000 * 60,
        enabled
    });
};

export const useUpsertStudentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (student: Student) => {
            const { data, error } = await supabase.from('students').upsert(student).select().single();
            if (error) throw error;
            return data;
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [STUDENT_KEYS.paginated] });
            queryClient.invalidateQueries({ queryKey: ['studentStats'] });
            // Invalidate individual student query if needed
        },
    });
};

export const useDeleteStudentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('students').delete().eq('id', id);
            if (error) throw error;
            return id;
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [STUDENT_KEYS.paginated] });
            queryClient.invalidateQueries({ queryKey: ['studentStats'] });
        },
    });
};

export const useUpsertChangeRequestMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (request: ChangeRequest) => {
            const { data, error } = await supabase.from('change_requests').upsert(request).select().single();
            if (error) throw error;
            return data;
        },
        onMutate: async (newRequest) => {
            await queryClient.cancelQueries({ queryKey: [STUDENT_KEYS.requests] });
            const previousRequests = queryClient.getQueryData<ChangeRequest[]>([STUDENT_KEYS.requests]);
            queryClient.setQueryData<ChangeRequest[]>([STUDENT_KEYS.requests], (old) => {
                if (!old) return [newRequest];
                const exists = old.find(r => r.id === newRequest.id);
                if (exists) return old.map(r => r.id === newRequest.id ? newRequest : r);
                return [newRequest, ...old];
            });
            return { previousRequests };
        },
        onError: (err, newRequest, context) => {
            queryClient.setQueryData([STUDENT_KEYS.requests], context?.previousRequests);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [STUDENT_KEYS.requests] });
        },
    });
};
