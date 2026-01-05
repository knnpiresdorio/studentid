import { useState } from 'react';
import { School, UserRole } from '../types';

export const useSchoolAdmin = (
    schools: School[],
    searchTerm: string,
    upsertSchool: any,
    addAuditLog: any,
    user: any
) => {
    const [managedSchool, setManagedSchool] = useState<School | null>(null);
    const [manageTab, setManageTab] = useState<'info' | 'students' | 'partners'>('info');

    const filteredSchools = schools.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSaveSchoolInfo = async () => {
        if (!managedSchool) return;
        try {
            await upsertSchool.mutateAsync(managedSchool);
            addAuditLog(
                managedSchool.id,
                'UPDATE_SCHOOL_INFO',
                `Alterou informações institucionais da escola: ${managedSchool.name}`,
                user?.id || 'system',
                user?.name || 'System',
                user?.role || UserRole.ADMIN,
                { updates: managedSchool }
            );
        } catch (error) {
            console.error("Error saving school info:", error);
            throw error;
        }
    };

    return {
        managedSchool,
        setManagedSchool,
        manageTab,
        setManageTab,
        filteredSchools,
        handleSaveSchoolInfo
    };
};
