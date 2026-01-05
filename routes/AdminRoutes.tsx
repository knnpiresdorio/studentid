import React, { Suspense } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { PrivateRoute } from '../components/auth/PrivateRoute';
import { useAuth } from '../context/AuthContext';
import { useMembers } from '../context/MemberContext';
import { usePartners } from '../context/PartnerContext';
import { useAnalytics } from '../context/AnalyticsContext';

// Lazy Load Admin Components
const AdminDashboard = React.lazy(() => import('../features/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const SchoolManager = React.lazy(() => import('../features/SchoolManager').then(module => ({ default: module.SchoolManager })));

const SchoolDetail = () => {
    const { schoolId } = useParams();
    const navigate = useNavigate();
    return (
        <Suspense fallback={<div className="p-10 text-center">Carregando escola...</div>}>
            <SchoolManager schoolId={schoolId} onBack={() => navigate('/admin')} />
        </Suspense>
    );
};

export const AdminRoutes: React.FC = () => {
    const { user, logout } = useAuth();
    const { students, schools } = useMembers();
    const { partners } = usePartners();
    const { auditLogs, addAuditLog } = useAnalytics();

    if (!user) return null;

    return (
        <Routes>
            <Route path="/" element={
                <PrivateRoute roles={[UserRole.ADMIN, UserRole.SCHOOL_ADMIN]}>
                    <Suspense fallback={<div className="p-10 text-center">Carregando painel...</div>}>
                        {user.role === UserRole.SCHOOL_ADMIN ? (
                            <SchoolManager
                                schoolId={user.schoolId}
                            />
                        ) : (
                            <AdminDashboard
                                schools={schools}
                                students={students}
                                partners={partners}
                                auditLogs={auditLogs}
                                addAuditLog={addAuditLog}
                                onLogout={logout}
                            />
                        )}
                    </Suspense>
                </PrivateRoute>
            } />
            <Route path="school/:schoolId" element={
                <PrivateRoute roles={[UserRole.ADMIN]}>
                    <SchoolDetail />
                </PrivateRoute>
            } />
        </Routes>
    );
};
