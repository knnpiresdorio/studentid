import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserRole } from '../types';
import { PrivateRoute } from '../components/auth/PrivateRoute';
import { useAuth } from '../context/AuthContext';
import { useMembers } from '../context/MemberContext';
import { usePartners } from '../context/PartnerContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { useUpsertStudentMutation, useUpsertChangeRequestMutation } from '../hooks/useSupabaseQuery';

// Lazy Load StudentView
const StudentView = React.lazy(() => import('../features/StudentView').then(module => ({ default: module.StudentView })));

export const StudentRoutes: React.FC = () => {
    const { user, logout } = useAuth();
    const { changeRequests } = useMembers(); // consume necessary data
    const { partners } = usePartners();
    const { auditLogs } = useAnalytics();

    // Mutations for Student View
    const upsertStudent = useUpsertStudentMutation();
    const upsertChangeRequest = useUpsertChangeRequestMutation();

    if (!user) return null;

    return (
        <Routes>
            <Route path="/" element={
                <PrivateRoute roles={[UserRole.STUDENT]}>
                    <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
                        <StudentView
                            user={user}
                            partners={partners}
                            myRequests={changeRequests.filter(r => r.studentId === user.studentData?.id || r.studentId === user.studentData?.parentName)}
                            auditLogs={auditLogs}
                            onUpdateStudent={(student) => upsertStudent.mutate(student)}
                            onAddDependentUser={() => { }}
                            onRequestChange={(request) => {
                                upsertChangeRequest.mutate({
                                    ...request,
                                    id: `req_${Date.now()}`,
                                    status: 'PENDING',
                                    createdAt: new Date().toISOString()
                                } as any);
                            }}
                            onReportError={() => { }}
                            onLogout={logout}
                        />
                    </Suspense>
                </PrivateRoute>
            } />
        </Routes>
    );
};
