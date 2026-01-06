import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import { UserRole } from './types';
import { MemberProvider } from './context/MemberContext';
import { PartnerProvider } from './context/PartnerContext';
import { AnalyticsProvider } from './context/AnalyticsContext';

// Routes
import { StudentRoutes } from './routes/StudentRoutes';
import { PartnerRoutes } from './routes/PartnerRoutes';
import { AdminRoutes } from './routes/AdminRoutes';

// Login
import { LoginScreen } from './features/LoginScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './components/layout/MainLayout';

const queryClient = new QueryClient();



const AppRoutes = () => {
  const { user, loading, login } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="contents">
      {!user ? (
        <Routes>
          <Route path="/login" element={
            <LoginScreen
              onLogin={login}
            />
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/student/*" element={<StudentRoutes />} />
          <Route path="/partner/*" element={<PartnerRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* Default Redirects based on Role */}
          <Route path="*" element={<Navigate to={
            user.role === UserRole.STUDENT ? '/student' :
              (user.role === UserRole.STORE || user.role === UserRole.STORE_ADMIN) ? '/partner' :
                '/admin'
          } replace />} />
        </Routes>
      )}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemberProvider>
            <PartnerProvider>
              <AnalyticsProvider>
                <MainLayout>
                  <AppRoutes />
                </MainLayout>
              </AnalyticsProvider>
            </PartnerProvider>
          </MemberProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
};

export default App;
