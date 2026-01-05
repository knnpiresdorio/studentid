import { useMemo } from 'react';
import { AuditLog, Partner } from '../../../types';
import { useAnalytics } from '../../../context/AnalyticsContext';
import { useAuth } from '../../../context/AuthContext';

export const useValidationHistory = (currentPartner: Partner | undefined) => {
    const { user } = useAuth();
    const { auditLogs } = useAnalytics();

    const myLogs = useMemo(() => {
        return auditLogs.filter(log => {
            const isMyLog = log.actorId === user?.id;

            if (user?.role === 'STORE_ADMIN') {
                const matchesPartner = currentPartner && log.metadata?.partnerId === currentPartner.id;
                return matchesPartner || isMyLog;
            }

            return isMyLog;
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [auditLogs, user, currentPartner]);

    return { myLogs };
};
