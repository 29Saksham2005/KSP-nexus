import React from 'react';
// Remove the { LucideIcon } import entirely

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ElementType; // Use React.ElementType instead of LucideIcon
  colorClass: string;
  isLoading: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, colorClass, isLoading }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        {isLoading ? (
          <div className="h-8 w-16 bg-slate-800 animate-pulse rounded"></div>
        ) : (
          <h3 className="text-2xl font-bold text-white">{value}</h3>
        )}
      </div>
      <div className={`p-3 rounded-md ${colorClass}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  );
};