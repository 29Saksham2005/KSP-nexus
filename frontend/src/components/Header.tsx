import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Search, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  
  // --- SEARCH STATE & HANDLER ---
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); 
    if (searchQuery.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // --- NOTIFICATION STATE & MOCK DATA ---
  const [showNotifications, setShowNotifications] = useState(false);
  const mockNotifications = [
    { id: 1, type: "🚨 Alert", text: "New FIR #8832 filed in Koramangala Station.", time: "5m ago" },
    { id: 2, type: "🚗 Match", text: "Flagged Vehicle KA-01-AB-1234 detected on CCTV-04.", time: "12m ago" },
    { id: 3, type: "✅ Update", text: "Forensic report for Case #7721 is ready.", time: "1hr ago" }
  ];

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-50">
      
      {/* Branding */}
      <div className="flex items-center gap-3 w-64">
        <div className="bg-blue-900 p-1.5 rounded-md">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <span className="text-white font-bold text-lg tracking-wider">KSP NEXUS</span>
      </div>

      {/* Global Search (Updated with Form and State) */}
      <div className="flex-1 max-w-2xl px-4">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FIR, Person, Vehicle, or Officer..."
            className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md leading-5 bg-slate-800 text-slate-300 placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
          />
        </form>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-6">
        
        {/* Notifications (Updated with Dropdown Logic) */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-slate-400 hover:text-white transition-colors relative focus:outline-none pt-2"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-900"></span>
          </button>

          {/* Dropdown Menu */}
          {showNotifications && (
            <div className="absolute top-12 right-0 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 p-3 text-left">
              <h4 className="text-slate-100 m-0 pb-2 text-sm border-b border-slate-700 font-semibold">
                Recent Alerts
              </h4>
              <div className="mt-2">
                {mockNotifications.map((notif) => (
                  <div key={notif.id} className="mb-3 text-sm">
                    <div className="text-slate-400 text-xs mb-1">
                      {notif.type} • {notif.time}
                    </div>
                    <div className="text-slate-200">{notif.text}</div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowNotifications(false)}
                className="w-full mt-1 pt-2 pb-1 bg-transparent text-blue-400 hover:text-blue-300 border-none cursor-pointer text-xs transition-colors"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
        
        {/* Profile / Logout */}
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