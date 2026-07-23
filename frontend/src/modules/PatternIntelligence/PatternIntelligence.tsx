import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Network, Activity, Crosshair, Radar, CalendarDays, TrendingUp } from 'lucide-react';

export const PatternIntelligence: React.FC = () => {
  
  // --- 1. Global Dark Mode ECharts Theme ---
  const commonOptions = {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: 'Inter, sans-serif' },
    tooltip: { 
      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
      borderColor: '#334155', 
      textStyle: { color: '#f8fafc' },
      padding: 12,
      borderRadius: 8,
      shadowBlur: 20,
      shadowColor: 'rgba(0,0,0,0.5)'
    },
  };

  // --- 2. Temporal Punch Card (Time vs Day Pattern) ---
  // Format: [Hour, DayIndex, CrimeCount]
  const hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const punchCardData = [
    [0, 0, 5], [1, 0, 1], [22, 0, 12], [23, 0, 15], // Sunday Night Spikes
    [10, 1, 8], [11, 1, 9], [12, 1, 14], [18, 1, 12], // Monday Commute
    [11, 4, 15], [12, 4, 18], [22, 5, 25], [23, 5, 30], // Friday Night Chaos
    [0, 6, 28], [1, 6, 20], [2, 6, 15], [22, 6, 18], // Saturday Night
  ];

  const temporalOptions = {
    ...commonOptions,
    tooltip: { position: 'top', formatter: (params: any) => `${days[params.value[1]]} at ${hours[params.value[0]]}: <b style="color:#fbbf24">${params.value[2]} Incidents</b>` },
    grid: { left: 40, bottom: 20, right: 20, top: 20 },
    xAxis: { type: 'category', data: hours, boundaryGap: false, splitLine: { show: true, lineStyle: { color: '#1e293b', type: 'dashed' } }, axisLine: { show: false }, axisLabel: { color: '#64748b', fontSize: 10 } },
    yAxis: { type: 'category', data: days, axisLine: { show: false }, axisLabel: { color: '#94a3b8', fontWeight: 'bold' } },
    series: [{
      name: 'Incident Density',
      type: 'scatter',
      symbolSize: (val: any) => Math.min(val[2] * 1.5, 30),
      data: punchCardData,
      itemStyle: {
        color: (params: any) => {
          const val = params.value[2];
          if (val > 20) return '#ef4444'; // Red for severe
          if (val > 10) return '#f59e0b'; // Amber for medium
          return '#3b82f6'; // Blue for low
        },
        shadowBlur: 10,
        shadowColor: 'rgba(0,0,0,0.5)'
      },
      animationDelay: (idx: number) => idx * 10
    }]
  };

  // --- 3. District Threat Signature (Radar Chart) ---
  const radarOptions = {
    ...commonOptions,
    tooltip: {},
    legend: { bottom: 0, textStyle: { color: '#94a3b8' }, icon: 'circle' },
    radar: {
      shape: 'polygon',
      indicator: [
        { name: 'Property Theft', max: 100 },
        { name: 'Violent Crime', max: 100 },
        { name: 'Cyber Fraud', max: 100 },
        { name: 'Narcotics', max: 100 },
        { name: 'Organized Crime', max: 100 }
      ],
      splitArea: { areaStyle: { color: ['rgba(15, 23, 42, 0.5)', 'rgba(30, 41, 59, 0.5)'] } },
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { lineStyle: { color: '#334155' } },
      axisName: { color: '#94a3b8', borderRadius: 3, padding: [3, 5] }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [80, 40, 90, 60, 50],
          name: 'Bengaluru Urban',
          itemStyle: { color: '#ef4444' },
          areaStyle: { color: 'rgba(239, 68, 68, 0.3)' }
        },
        {
          value: [50, 60, 30, 80, 40],
          name: 'State Average',
          itemStyle: { color: '#3b82f6' },
          lineStyle: { type: 'dashed' },
          areaStyle: { color: 'rgba(59, 130, 246, 0.1)' }
        }
      ]
    }]
  };

  // --- 4. Crime Evolution (Stacked Gradient Area) ---
  const evolutionOptions = {
    ...commonOptions,
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } } },
    legend: { top: 0, textStyle: { color: '#94a3b8' }, icon: 'circle' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [{ type: 'category', boundaryGap: false, data: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'], axisLabel: { color: '#64748b' } }],
    yAxis: [{ type: 'value', splitLine: { lineStyle: { color: '#1e293b' } }, axisLabel: { color: '#64748b' } }],
    series: [
      { name: 'Cyber', type: 'line', stack: 'Total', smooth: true, lineStyle: { width: 0 }, showSymbol: false, areaStyle: { opacity: 0.8, color: '#10b981' }, data: [120, 132, 101, 134, 90, 230, 210] },
      { name: 'Narcotics', type: 'line', stack: 'Total', smooth: true, lineStyle: { width: 0 }, showSymbol: false, areaStyle: { opacity: 0.8, color: '#f59e0b' }, data: [220, 182, 191, 234, 290, 330, 310] },
      { name: 'Violent', type: 'line', stack: 'Total', smooth: true, lineStyle: { width: 0 }, showSymbol: false, areaStyle: { opacity: 0.8, color: '#ef4444' }, data: [150, 232, 201, 154, 190, 330, 410] },
      { name: 'Theft', type: 'line', stack: 'Total', smooth: true, lineStyle: { width: 0 }, showSymbol: false, areaStyle: { opacity: 0.8, color: '#3b82f6' }, data: [320, 332, 301, 334, 390, 330, 320] }
    ]
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="h-6 w-6 text-purple-500" />
          Pattern Intelligence
        </h1>
        <p className="text-sm text-slate-400">Advanced algorithmic detection of temporal, geospatial, and entity-based crime signatures.</p>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 overflow-y-auto custom-scrollbar pb-6">
        
        {/* TOP ROW: Temporal Matrix (The USP Chart) */}
        <div className="col-span-12 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><CalendarDays className="h-24 w-24 text-blue-500" /></div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-amber-500" /> Temporal Vulnerability Matrix
            </h3>
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">All Districts (Last 30 Days)</span>
          </div>
          <p className="text-xs text-slate-400 mb-2">Analyzes time-of-day vs day-of-week occurrence rates to identify predictable operational gaps. Red indicates critical threat density.</p>
          <ReactECharts option={temporalOptions} style={{ height: '320px', width: '100%' }} />
        </div>

        {/* BOTTOM LEFT: Radar Chart */}
        <div className="col-span-12 lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-inner relative">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Radar className="h-4 w-4 text-emerald-500" /> Threat Signature
            </h3>
          </div>
          <ReactECharts option={radarOptions} style={{ height: '350px', width: '100%' }} />
        </div>

        {/* BOTTOM RIGHT: Evolution Area Chart */}
        <div className="col-span-12 lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-inner relative">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" /> Categorical Evolution (7-Week Phase)
            </h3>
          </div>
          <ReactECharts option={evolutionOptions} style={{ height: '350px', width: '100%' }} />
        </div>

      </div>
    </div>
  );
};