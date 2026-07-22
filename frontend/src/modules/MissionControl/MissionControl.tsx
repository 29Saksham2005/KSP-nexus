import React, { useEffect, useState } from 'react';
import { ShieldAlert, FileText, AlertTriangle, CheckCircle2, BrainCircuit } from 'lucide-react';
import { dashboardService,type KPIData,type TrendDataPoint } from '../../services/dashboard';
import { KPICard } from './components/KPICard';
import { CrimeTrendChart } from './components/CrimeTrendChart';

export const MissionControl: React.FC = () => {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [kpiData, trendData] = await Promise.all([
          dashboardService.getKPIs(),
          dashboardService.getTrends('monthly')
        ]);
        setKpis(kpiData);
        setTrends(trendData);
      } catch (error) {
        console.error("Failed to fetch dashboard intelligence", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mission Control</h1>
        <p className="text-sm text-slate-400">Statewide operational intelligence and AI briefing.</p>
      </div>
      
      {/* 4-Column Grid for KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard 
          title="Total FIRs" 
          value={kpis?.total_firs ?? 0} 
          icon={FileText} 
          colorClass="bg-blue-600/20 text-blue-500"
          isLoading={isLoading}
        />
        <KPICard 
          title="Active Investigations" 
          value={kpis?.active_investigations ?? 0} 
          icon={ShieldAlert} 
          colorClass="bg-amber-500/20 text-amber-500"
          isLoading={isLoading}
        />
        <KPICard 
          title="Open Cases" 
          value={kpis?.open_cases ?? 0} 
          icon={AlertTriangle} 
          colorClass="bg-red-500/20 text-red-500"
          isLoading={isLoading}
        />
        <KPICard 
          title="Solved Cases" 
          value={kpis?.solved_cases ?? 0} 
          icon={CheckCircle2} 
          colorClass="bg-emerald-500/20 text-emerald-500"
          isLoading={isLoading}
        />
      </div>
      
      {/* 3-Column Grid for Chart (Spans 2) and AI Brief (Spans 1) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Crime Trend Chart Area */}
        <div className="xl:col-span-2 h-[400px]">
          <CrimeTrendChart data={trends} isLoading={isLoading} />
        </div>
        
        {/* AI Intelligence Brief Placeholder */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 h-[400px] flex flex-col">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <BrainCircuit className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-medium text-white">AI Intelligence Brief</h3>
          </div>
          
          <div className="flex-1 flex items-center justify-center flex-col text-center px-4">
            <p className="text-slate-400 text-sm mb-4">
              Insufficient data to generate an AI narrative. Please populate the database with crime records to enable the Explainable AI engine.
            </p>
            <div className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
              <span className="text-xs font-medium text-slate-500">Confidence: N/A</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};