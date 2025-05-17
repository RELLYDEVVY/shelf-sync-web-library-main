
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Navbar } from './Navbar';
import { AdminSidebar } from './AdminSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export const AdminLayout = () => {
  const { user } = useAuthStore();
  const isMobile = useIsMobile();
  
  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user is not an admin, redirect to user dashboard
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>
      <div className="flex flex-1">
        {!isMobile && <AdminSidebar />}
        <main className="flex-grow p-4 md:p-6 overflow-auto">
          {isMobile && <AdminSidebar />}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
