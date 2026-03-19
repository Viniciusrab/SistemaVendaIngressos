import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-black text-blue-400">Carregando...</div>;
    }

    if (!user) {
        return <Navigate to="/auth" />;
    }

    if (adminOnly && !['ADMIN', 'TICKETER', 'SUPPORT'].includes(user.role?.toUpperCase() || '')) {
        return <Navigate to="/" />;
    }

    return <>{children}</>;
};
