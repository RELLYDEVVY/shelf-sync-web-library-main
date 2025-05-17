
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Navbar } from './Navbar';

interface MainLayoutProps {
  requireAuth?: boolean;
  requiredRole?: 'admin' | 'user';
  children?: React.ReactNode;
}

export const MainLayout = ({ 
  requireAuth = false,
  requiredRole,
  children
}: MainLayoutProps) => {
  const { user } = useAuthStore();
  
  // If authentication is required and user is not logged in, redirect to login
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }
  
  // If a specific role is required and user doesn't have it, redirect to appropriate dashboard
  if (requiredRole && user && user.role !== requiredRole) {
    const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>
      <main className="container mx-auto px-4">
        {children || <Outlet />}
      </main>
      {/* Footer removed */}
    </div>
  );
};
