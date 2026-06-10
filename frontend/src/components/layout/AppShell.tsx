import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

export const AppShell: React.FC = () => {
  const token = useAuthStore((state) => state.accessToken);

  // If there is no in-memory JWT, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="yeka-page-bg flex min-h-screen bg-slate-50 text-yeka-text-primary">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader />
        <main className="w-full flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
