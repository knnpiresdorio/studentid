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
    const { changeRequests, isLoading } = useMembers(); // consume necessary data
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
                            isLoadingRequests={isLoading}
                            auditLogs={auditLogs}
                            onUpdateStudent={(student) => upsertStudent.mutate(student)}
                            onAddDependentUser={() => { }}
                            onRequestChange={async (request) => {
                                try {
                                    await upsertChangeRequest.mutateAsync({
                                        ...request,
                                        status: 'PENDING',
                                        createdAt: new Date().toISOString()
                                    } as any);
                                } catch (error: any) {
                                    // If conflict (409) or Postgres Unique Violation (23505), it means request already exists.
                                    // We treat this as success because the goal (having a request) is achieved.
                                    const isConflict =
                                        error?.status === 409 ||
                                        error?.code === '23505' || // Postgres unique violation code
                                        error?.message?.includes('409') ||
                                        error?.message?.includes('duplicate key') ||
                                        error?.details?.includes('already exists');

                                    if (isConflict) {
                                        console.warn('Request already exists (409/23505), treating as success to unblock user.');
                                    } else {
                                        console.error('Critical error in onRequestChange:', error);
                                        throw error;
                                    }
                                }
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
