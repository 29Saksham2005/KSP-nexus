import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Search, Bell, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Branding */}
      <div className="flex items-center gap-3 w-64">
        <div className="bg-blue-900 p-1.5 rounded-md">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <span className="text-white font-bold text-lg tracking-wider">KSP NEXUS</span>
      </div>

      {/* Global Search */}
      <div className="flex-1 max-w-2xl px-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search FIR, Person, Vehicle, or Officer..."
            className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md leading-5 bg-slate-800 text-slate-300 placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
          />
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-6">
        <button className="text-slate-400 hover:text-white transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-900"></span>
        </button>
        
        <div className="flex items-center gap-3 border-l border-slate-700 pl-6">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-white">{user?.full_name}</span>
            <span className="text-xs text-blue-400">{user?.role_id ? 'Administrator' : 'Officer'}</span>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
            title="Secure Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};