import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface PrivateRouteProps {
    children: React.ReactNode;
    roles?: UserRole[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <div className="p-10 text-center">Acesso não autorizado.</div>;
    }

    return <>{children}</>;
};
