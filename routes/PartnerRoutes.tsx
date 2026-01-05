import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserRole } from '../types';
import { PrivateRoute } from '../components/auth/PrivateRoute';

// Lazy Load StoreView
const StoreView = React.lazy(() => import('../features/partner/StoreView').then(module => ({ default: module.StoreView })));

export const PartnerRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={
                <PrivateRoute roles={[UserRole.STORE, UserRole.STORE_ADMIN]}>
                    <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
                        <StoreView />
                    </Suspense>
                </PrivateRoute>
            } />
        </Routes>
    );
};
