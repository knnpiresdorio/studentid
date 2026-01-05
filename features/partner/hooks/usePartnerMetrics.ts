import { useMemo } from 'react';
import { Partner, AuditLog, School, MemberType } from '../../../types';

export const usePartnerMetrics = (partner: Partner, auditLogs: AuditLog[], schools: School[]) => {
    return useMemo(() => {
        // 1. Validation Logs (Card Validations)
        const validationLogs = auditLogs.filter(log =>
            log.metadata?.partnerId === partner.id &&
            (log.action === 'VALIDATION_SUCCESS' || log.action === 'VALIDATION_FAILED')
        );

        // 2. Benefit Usage Logs (Promotions + Standard)
        const benefitLogs = auditLogs.filter(log =>
            log.metadata?.partnerId === partner.id &&
            log.action === 'BENEFIT_USAGE'
        );

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const validationsThisWeek = validationLogs.filter(log => new Date(log.timestamp) > oneWeekAgo).length;

        const getLast7DaysData = (logs: AuditLog[]) => {
            return Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const dateStr = d.toISOString().split('T')[0];
                return logs.filter(l => l.timestamp.startsWith(dateStr)).length;
            });
        };

        const validationsLast7Days = getLast7DaysData(validationLogs);
        const benefitsLast7Days = getLast7DaysData(benefitLogs);

        const totalBenefits = benefitLogs.length;

        // Mock Business Metrics
        const avgTicket = 50;
        const avgDiscountPercent = 0.10;
        const estimatedSavings = totalBenefits * avgTicket * avgDiscountPercent;
        const dailySavingsData = benefitsLast7Days.map(count => count * avgTicket * avgDiscountPercent);
        const uniqueStudents = new Set(benefitLogs.map(log => log.metadata?.studentId)).size;

        const qrSuccess = validationLogs.filter(log => log.metadata?.method === 'QR' && log.action === 'VALIDATION_SUCCESS').length;
        const cpfSuccess = validationLogs.filter(log => log.metadata?.method === 'CPF' && log.action === 'VALIDATION_SUCCESS').length;
        const totalSuccess = qrSuccess + cpfSuccess || 1;
        const qrRate = (qrSuccess / totalSuccess) * 100;

        const usageByMemberType = benefitLogs.reduce((acc, log) => {
            const type = log.metadata?.userType || MemberType.STUDENT;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const calculateCompleteness = () => {
            let score = 0;
            if (partner.logoUrl) score += 20;
            if (partner.bannerUrl) score += 20;
            if (partner.description && partner.description.length > 20) score += 20;
            if (partner.phoneNumber || partner.instagramUrl) score += 20;
            if (partner.activePromotions && partner.activePromotions.length > 0) score += 20;
            return score;
        };
        const profileCompleteness = calculateCompleteness();

        const usageBySchool = benefitLogs
            .reduce((acc, log) => {
                const schoolName = schools.find(s => s.id === log.schoolId)?.name || 'Escola Desconhecida';
                acc[schoolName] = (acc[schoolName] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        const sortedUsage = Object.entries(usageBySchool).sort(([, a], [, b]) => (b as number) - (a as number));
        const maxUsage = sortedUsage.length > 0 ? (sortedUsage[0][1] as number) : 1;

        // 3. Advanced Metrics: Peak Hours
        const peakHoursData = Array.from({ length: 24 }, (_, hour) => {
            return benefitLogs.filter(log => new Date(log.timestamp).getHours() === hour).length;
        });

        // 4. Advanced Metrics: New vs. Returning
        const studentUsageCounts = benefitLogs.reduce((acc, log) => {
            const studentId = log.metadata?.studentId;
            if (studentId) acc[studentId] = (acc[studentId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const newStudents = Object.values(studentUsageCounts).filter(count => count === 1).length;
        const returningStudents = Object.values(studentUsageCounts).filter(count => count > 1).length;
        const newVsReturningData = [newStudents, returningStudents];

        return {
            validationsThisWeek,
            validationsLast7Days,
            benefitsLast7Days,
            totalBenefits,
            estimatedSavings,
            dailySavingsData,
            uniqueStudents,
            qrRate,
            usageByMemberType,
            profileCompleteness,
            usageBySchool,
            sortedUsage,
            maxUsage,
            peakHoursData,
            newVsReturningData
        };
    }, [partner, auditLogs, schools]);
};
