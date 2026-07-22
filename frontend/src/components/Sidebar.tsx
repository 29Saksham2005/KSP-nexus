import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Map, 
  Network, 
  TrendingUp, 
  BrainCircuit, 
  History,
  Settings
} from 'lucide-react';

const navItems = [
  { name: 'Mission Control', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Investigation Workspace', path: '/investigation', icon: FileText },
  { name: 'Geo Intelligence', path: '/geo', icon: Map },
  { name: 'Network Intelligence', path: '/network', icon: Network },
  { name: 'Pattern Intelligence', path: '/pattern', icon: TrendingUp },
  { name: 'AI Intelligence', path: '/ai', icon: BrainCircuit },
  { name: 'NEXUS Replay', path: '/replay', icon: History },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-[calc(100vh-4rem)] flex flex-col sticky top-16">
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive ? 'text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <Settings className="h-5 w-5" />
          Administration
        </NavLink>
      </div>
    </aside>
  );
};