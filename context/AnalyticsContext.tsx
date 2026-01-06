import React, { createContext, useContext, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { AuditLog, ActionType, UserRole } from '../types';
import { supabase } from '../services/supabase';
import {
    useAuditLogsQuery
} from '../hooks/useSupabaseQuery';
import { ADMIN_KEYS as QUERY_KEYS } from '../features/admin/api';

interface AnalyticsContextType {
    auditLogs: AuditLog[];
    isLoading: boolean;
    error: any;
    addAuditLog: (
        schoolId: string,
        action: ActionType | string,
        details: string,
        actorId: string,
        actorName: string,
        actorRole: UserRole,
        metadata?: any
    ) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { data: auditLogs = [], isLoading, error } = useAuditLogsQuery(!!user);
    const queryClient = useQueryClient();

    const addAuditLog = async (
        schoolId: string,
        action: ActionType | string,
        details: string,
        actorId: string,
        actorName: string,
        actorRole: UserRole,
        metadata?: any
    ) => {
        const logData = {
            school_id: schoolId || null,
            user_id: actorId,
            actor_name: actorName,
            actor_role: actorRole,
            action: action,
            details: details,
            metadata: {
                userAgent: navigator.userAgent,
                ipAddress: '127.0.0.1',
                location: 'Unknown',
                ...metadata
            }
        };

        // Optimistic update (we create a temporary UI-friendly log)
        const optimisticLog: AuditLog = {
            id: `temp-${Date.now()}`,
            schoolId,
            actorId,
            actorName,
            actorRole,
            action: action as ActionType,
            targetStudent: '-',
            details,
            metadata: logData.metadata,
            created_at: new Date().toISOString()
        };

        await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.audit] });
        queryClient.setQueryData<AuditLog[]>([QUERY_KEYS.audit], old => [optimisticLog, ...(old || [])]);

        try {
            const { error } = await supabase.from('audit_logs').insert(logData);
            if (error) throw error;
        } catch (err) {
            console.error("Error logging audit:", err);
        } finally {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.audit] });
        }
    };

    return (
        <AnalyticsContext.Provider value={{
            auditLogs,
            isLoading,
            error,
            addAuditLog
        }}>
            {children}
        </AnalyticsContext.Provider>
    );
};

export const useAnalytics = () => {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalytics must be used within an AnalyticsProvider');
    }
    return context;
};
