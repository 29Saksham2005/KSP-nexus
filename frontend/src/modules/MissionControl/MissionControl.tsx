import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { Shield, AlertTriangle, Crosshair, Zap, Activity, Clock, Terminal, ChevronRight, CheckCircle2 } from 'lucide-react';

export const MissionControl: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<number>>(new Set());

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAcknowledge = (id: number) => {
    setAcknowledgedAlerts(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleInvestigate = (location: string) => {
    // Navigates to the investigation workspace. 
    // In a real app, you would pass the specific FIR or Alert ID.
    navigate('/investigation');
  };

  // --- ECharts: Live Threat Velocity ---
  const velocityOptions = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#ef4444', textStyle: { color: '#f8fafc' } },
    grid: { top: 30, right: 20, bottom: 20, left: 40 },
    xAxis: { type: 'category', data: ['Mysuru', 'Bengaluru', 'Hubli', 'Mangaluru', 'Belagavi', 'Udupi'], axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#94a3b8', fontSize: 10, fontFamily: 'monospace' } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }, axisLabel: { color: '#94a3b8', fontFamily: 'monospace' } },
    series: [
      {
        name: 'Current Threat Velocity (Events/Hr)',
        type: 'bar',
        data: [12, 45, 38, 15, 8, 5],
        itemStyle: {
          color: (params: any) => params.value > 30 ? '#ef4444' : params.value > 15 ? '#f59e0b' : '#3b82f6',
          borderRadius: [2, 2, 0, 0]
        },
        markLine: {
          data: [{ type: 'average', name: 'State Baseline' }],
          lineStyle: { color: '#10b981', type: 'dashed' }
        }
      }
    ]
  };

  // Mock Active Alerts
  const activeAlerts = [
    { id: 1, type: 'CRITICAL', location: 'Hubli North', message: '300% localized spike in vehicle theft reported in the last 4 hours.', time: '12m ago' },
    { id: 2, type: 'WARNING', location: 'Bengaluru Urban', message: 'Habitual suspect "Suresh K." flagged by ANPR near identified hotspot.', time: '28m ago' },
    { id: 3, type: 'WARNING', location: 'Mysuru Central', message: 'Three overlapping FIRs registered with identical M.O. (Cyber Fraud).', time: '1h ago' },
  ];

  // Dynamically sort alerts: Unacknowledged at the top, Acknowledged drop to the bottom
  const sortedAlerts = useMemo(() => {
    return [...activeAlerts].sort((a, b) => {
      const aAck = acknowledgedAlerts.has(a.id);
      const bAck = acknowledgedAlerts.has(b.id);
      if (aAck && !bAck) return 1;
      if (!aAck && bAck) return -1;
      return 0;
    });
  }, [acknowledgedAlerts]);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* HEADER: Palantir-style Tactical Header */}
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
            <Shield className="h-7 w-7 text-emerald-500" />
            MISSION CONTROL
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-widest uppercase mt-1">Global Operational Overview</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-emerald-500 text-sm font-mono font-bold animate-pulse">
            <div className="h-2 w-2 rounded-full bg-emerald-500"></div> UPLINK SECURE
          </div>
          <span className="text-lg text-white font-mono">{currentTime.toLocaleTimeString()} IST</span>
        </div>
      </div>

      {/* TOP ROW: Active Telemetry */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900 border-l-4 border-l-blue-500 border-y border-r border-slate-800 p-4 rounded-r-lg">
          <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block mb-1">Active Investigations</span>
          <span className="text-3xl font-mono text-white">1,204</span>
          <span className="text-xs text-emerald-500 ml-2 font-mono">↓ 2.4%</span>
        </div>
        <div className="bg-slate-900 border-l-4 border-l-red-500 border-y border-r border-slate-800 p-4 rounded-r-lg">
          <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block mb-1">Critical Anomalies</span>
          <span className="text-3xl font-mono text-red-400">03</span>
          <span className="text-xs text-red-500 ml-2 font-mono">Requires Action</span>
        </div>
        <div className="bg-slate-900 border-l-4 border-l-amber-500 border-y border-r border-slate-800 p-4 rounded-r-lg">
          <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block mb-1">Identified Networks</span>
          <span className="text-3xl font-mono text-white">42</span>
          <span className="text-xs text-slate-500 ml-2 font-mono">Active tracking</span>
        </div>
        <div className="bg-slate-900 border-l-4 border-l-emerald-500 border-y border-r border-slate-800 p-4 rounded-r-lg">
          <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block mb-1">Field Units Available</span>
          <span className="text-3xl font-mono text-white">84%</span>
          <span className="text-xs text-emerald-500 ml-2 font-mono">Optimal</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
        
        {/* LEFT COLUMN: AI Intelligence Terminal & Velocity Chart */}
        <div className="col-span-8 flex flex-col gap-4 h-full">
          
          {/* AI Terminal */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-1 flex flex-col h-1/2 relative overflow-hidden group">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">NEXUS AI // Overnight Briefing</span>
            </div>
            <div className="p-4 font-mono text-sm text-slate-300 leading-relaxed overflow-y-auto custom-scrollbar">
              <p className="mb-3"><span className="text-blue-400">[SYSTEM]</span> Analyzing 412 new records registered between 18:00 and 06:00...</p>
              <p className="mb-3 text-white">
                <span className="text-emerald-400">[INSIGHT]</span> Crime incidents in <strong className="text-blue-300">Bengaluru Urban</strong> increased by 12% this week. Property crimes account for most of the increase, with three repeat offenders linked across five separate FIRs.
              </p>
              <p className="mb-3 text-white">
                <span className="text-amber-400">[PATTERN]</span> A new cyber-fraud network has been identified operating across Belagavi and Hubli jurisdictions. 14 identical complaints registered.
              </p>
              <p className="text-white border-l-2 border-purple-500 pl-3 mt-4 bg-purple-900/10 py-2">
                <span className="text-purple-400 font-bold block mb-1">[AI RECOMMENDATION]</span> 
                Redeploy 3 night-patrol units to Hubli North sector to intercept projected vehicle theft escalation. Review FIR cluster #882-885 for co-accused verification.
              </p>
            </div>
          </div>

          {/* Velocity Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col h-1/2">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" /> Live Threat Velocity Matrix
            </h3>
            <div className="flex-1 w-full">
              <ReactECharts option={velocityOptions} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Active Threat Triage Queue */}
        <div className="col-span-4 bg-slate-900 border border-slate-800 rounded-lg flex flex-col h-full overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
            <h3 className="text-xs font-mono text-red-400 uppercase tracking-widest flex items-center gap-2">
              <Zap className="h-4 w-4 fill-current" /> Active Triage Queue
            </h3>
            <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded font-mono border border-red-500/30">
              {activeAlerts.length - acknowledgedAlerts.size} PENDING
            </span>
          </div>
          
          <div className="p-3 overflow-y-auto custom-scrollbar space-y-3">
            {/* Render the dynamically sorted alerts */}
            {sortedAlerts.map(alert => {
              const isAck = acknowledgedAlerts.has(alert.id);
              return (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border transition-all duration-500 ${
                    isAck 
                      ? 'bg-slate-950/50 border-slate-800 opacity-50 scale-[0.98]' 
                      : alert.type === 'CRITICAL' 
                        ? 'bg-red-950/20 border-red-900/50 hover:bg-red-950/40' 
                        : 'bg-amber-950/20 border-amber-900/50 hover:bg-amber-950/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-mono tracking-widest font-bold px-1.5 py-0.5 rounded ${
                      isAck ? 'bg-slate-800 text-slate-400' : alert.type === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-900'
                    }`}>
                      {alert.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {alert.time}
                    </span>
                  </div>
                  <h4 className={`text-sm font-bold mb-1 ${isAck ? 'text-slate-400' : 'text-white'}`}>
                    <Crosshair className="h-3 w-3 inline mr-1 opacity-50"/>
                    {alert.location}
                  </h4>
                  <p className={`text-xs mb-3 ${isAck ? 'text-slate-600' : 'text-slate-300'}`}>
                    {alert.message}
                  </p>
                  
                  {!isAck ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleInvestigate(alert.location)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] uppercase tracking-widest py-1.5 rounded transition-colors flex items-center justify-center gap-1"
                      >
                        Investigate <ChevronRight className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-3 bg-slate-800 hover:bg-emerald-900/50 hover:text-emerald-400 text-slate-400 text-[10px] uppercase tracking-widest rounded transition-colors flex items-center border border-transparent hover:border-emerald-800"
                        title="Acknowledge Threat"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-[10px] font-mono text-emerald-500/70 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Acknowledged by Command
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  );
};