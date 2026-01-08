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
    const { data, error } = await supabase.from('change_requests').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    // Map snake_case to camelCase
    return (data || []).map(req => ({
        id: req.id,
        schoolId: req.school_id,
        studentId: req.student_id,
        studentName: req.student_name,
        type: req.type,
        status: req.status,
        reason: req.reason,
        payload: req.payload,
        createdAt: req.created_at,
        resolvedAt: req.resolved_at,
        resolvedBy: req.resolved_by
    })) as ChangeRequest[];
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
            // FIX: Remove 'dependents' and derived fields that are not columns in the 'students' view/table
            // This prevents 400 Bad Request or "Column not found" errors when approving requests
            const { dependents, isDependent, parentName, userType, ...dbPayload } = student;

            const { data, error } = await supabase.from('students').upsert(dbPayload).select().single();
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

export const useBulkUpsertStudentsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (students: Student[]) => {
            const { data, error } = await supabase.from('students').upsert(students, { onConflict: 'cpf' });
            if (error) throw error;
            return data;
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [STUDENT_KEYS.paginated] });
            queryClient.invalidateQueries({ queryKey: ['studentStats'] });
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

export const useBulkDeleteStudentsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ids: string[]) => {
            const { error } = await supabase.from('students').delete().in('id', ids);
            if (error) throw error;
            return ids;
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
            // Map camelCase to snake_case
            const payload: any = {
                school_id: request.schoolId,
                student_id: request.studentId,
                student_name: request.studentName,
                type: request.type,
                status: request.status || 'PENDING',
                reason: request.reason,
                payload: request.payload,
            };

            // Only include ID if it's a valid UUID (not 'req_timestamp')
            if (request.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(request.id)) {
                payload.id = request.id;
            }

            // CRITICAL FIX: Check for existing pending request if we don't have an ID
            // This prevents 409 Conflicts if the client cache is stale
            if (!payload.id) {
                const { data: existing } = await supabase
                    .from('change_requests')
                    .select('id')
                    .eq('student_id', payload.student_id)
                    .eq('type', payload.type)
                    .eq('status', 'PENDING')
                    .maybeSingle();

                if (existing) {
                    console.log('Found existing pending request during mutation, switching to update:', existing.id);
                    payload.id = existing.id;
                }
            }

            const { data, error } = await supabase.from('change_requests').upsert(payload).select().single();
            if (error) throw error;
            return data;
        },
        onMutate: async (newRequest) => {
            await queryClient.cancelQueries({ queryKey: [STUDENT_KEYS.requests] });
            const previoushuman = queryClient.getQueryData([STUDENT_KEYS.requests]);
            queryClient.setQueryData([STUDENT_KEYS.requests], (old: any) => {
                return [...(old || []), { ...newRequest, id: 'temp-id', created_at: new Date().toISOString() }];
            });
            return { previoushuman };
        },
        onError: (err, newTodo, context: any) => {
            queryClient.setQueryData([STUDENT_KEYS.requests], context.previoushuman);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [STUDENT_KEYS.requests] });
        },
    });
};

/**
 * Secure mutation for Profile Updates (Photo/Info) using Database RPC
 * detailed in migration: 20260107_rpc_request_profile_update
 */
export const useSubmitProfileUpdate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (params: {
            studentId: string;
            schoolId: string;
            studentName: string;
            type: 'UPDATE_PHOTO' | 'UPDATE_INFO';
            reason: string;
            payload: any;
        }) => {
            console.log('Invoking RPC request_profile_update with:', params);
            const { data, error } = await supabase.rpc('request_profile_update', {
                p_student_id: params.studentId,
                p_school_id: params.schoolId,
                p_student_name: params.studentName,
                p_type: params.type,
                p_reason: params.reason,
                p_payload: params.payload
            });

            if (error) {
                console.error('RPC Error:', error);
                throw error;
            }
            return data;
        },
        onSuccess: () => {
            // Refresh requests so the UI updates immediately
            queryClient.invalidateQueries({ queryKey: ['change_requests'] });
            queryClient.invalidateQueries({ queryKey: [STUDENT_KEYS.requests] });
        }
    });
};
