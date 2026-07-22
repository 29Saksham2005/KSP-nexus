import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import {type TrendDataPoint } from '../../../services/dashboard';

interface CrimeTrendChartProps {
  data: TrendDataPoint[];
  isLoading: boolean;
}

export const CrimeTrendChart: React.FC<CrimeTrendChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-900/50 rounded-lg border border-slate-800 animate-pulse">
        <span className="text-slate-500">Loading trends...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-lg">
        <p className="text-slate-400 mb-2">No historical data available.</p>
        <p className="text-xs text-slate-500">The database currently contains 0 records.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-900 border border-slate-800 rounded-lg p-4">
      <h3 className="text-lg font-medium text-white mb-4">Crime Trend Analysis</h3>
      <div className="h-[calc(100%-2rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="period_label" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
              itemStyle={{ color: '#60a5fa' }}
            />
            <Area 
              type="monotone" 
              dataKey="incident_count" 
              name="Incidents"
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorIncidents)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};