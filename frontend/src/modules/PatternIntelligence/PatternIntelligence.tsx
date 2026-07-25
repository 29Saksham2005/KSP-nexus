import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { 
  Activity, TrendingUp, PieChart,  Users, 
  AlertTriangle, Map, Maximize2, X, Terminal, Calendar, Database
} from 'lucide-react';

// --- Shared High-Density ECharts Theme Config ---
const commonOptions = {
  backgroundColor: 'transparent',
  textStyle: { fontFamily: 'Inter, sans-serif' },
  tooltip: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderColor: '#334155',
    textStyle: { color: '#f8fafc', fontSize: 12 },
    padding: 12,
    borderRadius: 6,
    shadowBlur: 20,
    shadowColor: 'rgba(0,0,0,0.8)'
  },
};

export const PatternIntelligence: React.FC = () => {
  const [globalDate, setGlobalDate] = useState('last_month');
  const [trendGranularity, setTrendGranularity] = useState('Months');
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  // --- Live Data Engine Multiplier ---
  const dataMult = useMemo(() => {
    switch(globalDate) {
      case 'last_7_days': return 0.25;
      case 'last_year': return 12;
      case 'all_time': return 36;
      default: return 1; 
    }
  }, [globalDate]);

  // --- Real Karnataka Districts (High Density Data) ---
  const karnatakaDistricts = [
    'Bengaluru Urban', 'Mysuru', 'Belagavi', 'Hubli-Dharwad', 'Mangaluru', 
    'Kalaburagi', 'Ballari', 'Tumakuru', 'Shivamogga', 'Udupi', 
    'Davanagere', 'Vijayapura', 'Raichur', 'Bidar', 'Hassan', 
    'Koppal', 'Gadag', 'Kodagu', 'Chikkaballapura', 'Chamarajanagara'
  ].reverse(); // Reversed so highest is at the top of the horizontal bar chart

  // Exponential decay curve to simulate realistic urban vs rural crime distribution
  const districtCrimeData = karnatakaDistricts.map((_, i) => Math.floor((Math.pow(1.3, i) * 10 + 50) * dataMult));

  // --- Chart Configurations ---

  // 1. Main Crime Trend (Multi-Vector Area Chart)
  const trendOptions = {
    ...commonOptions,
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    grid: { left: 10, right: 15, bottom: 10, top: 30, containLabel: true },
    xAxis: { 
      type: 'category', 
      boundaryGap: false,
      data: trendGranularity === 'Months' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] : ['W1', 'W2', 'W3', 'W4'], 
      axisLabel: { color: '#94a3b8' } 
    },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }, axisLabel: { color: '#94a3b8' } },
    series: [
      {
        name: 'Total Incidents',
        data: (trendGranularity === 'Months' ? [120, 150, 130, 180, 140, 210] : [40, 48, 52, 49]).map(v => Math.floor(v * dataMult)),
        type: 'line',
        smooth: true,
        lineStyle: { color: '#ef4444', width: 2 },
        areaStyle: { color: 'rgba(239, 68, 68, 0.1)' }
      },
      {
        name: 'Charge Sheeted',
        data: (trendGranularity === 'Months' ? [80, 100, 95, 120, 110, 140] : [25, 30, 35, 28]).map(v => Math.floor(v * dataMult)),
        type: 'line',
        smooth: true,
        lineStyle: { color: '#10b981', width: 2 },
        areaStyle: { color: 'rgba(16, 185, 129, 0.2)' }
      }
    ]
  };

  // 2. State-Wide District Comparison (Now with DataZoom Scroll)
  const districtOptions = {
    ...commonOptions,
    tooltip: { trigger: 'axis' },
    grid: { left: 10, right: 30, bottom: 20, top: 10, containLabel: true },
    // Interactive Scrollbar for deep data sets
    dataZoom: [
      { type: 'inside', yAxisIndex: 0, start: 60, end: 100 }, // Allow mouse scroll
      { type: 'slider', yAxisIndex: 0, width: 10, right: 5, start: 60, end: 100, fillerColor: '#3b82f6', borderColor: 'transparent', handleSize: 0 } // Visual scrollbar
    ],
    xAxis: { type: 'value', splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }, axisLabel: { color: '#94a3b8', fontSize: 10 } },
    yAxis: { type: 'category', data: karnatakaDistricts, axisLabel: { color: '#94a3b8', fontSize: 10, interval: 0 } },
    series: [{
      name: 'Registered FIRs',
      type: 'bar',
      data: districtCrimeData,
      itemStyle: { 
        color: (params: any) => params.value > (200 * dataMult) ? '#ef4444' : params.value > (100 * dataMult) ? '#f59e0b' : '#3b82f6',
        borderRadius: [0, 4, 4, 0] 
      }
    }]
  };

  // 3. Crime Type (Pie)
  const typeOptions = {
    ...commonOptions,
    tooltip: { trigger: 'item' },
    legend: { bottom: '0', textStyle: { color: '#94a3b8', fontSize: 10 }, itemWidth: 10, itemHeight: 10 },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '45%'],
      itemStyle: { borderRadius: 4, borderColor: '#0f172a', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: Math.floor(1048 * dataMult), name: 'Property', itemStyle: { color: '#3b82f6' } },
        { value: Math.floor(735 * dataMult), name: 'Body', itemStyle: { color: '#ef4444' } },
        { value: Math.floor(580 * dataMult), name: 'Cyber', itemStyle: { color: '#10b981' } },
        { value: Math.floor(484 * dataMult), name: 'Narcotics', itemStyle: { color: '#f59e0b' } },
        { value: Math.floor(200 * dataMult), name: 'Economic', itemStyle: { color: '#8b5cf6' } }
      ]
    }]
  };

  // 4. Case Status (Doughnut)
  const statusOptions = {
    ...commonOptions,
    tooltip: { trigger: 'item' },
    legend: { bottom: '0', textStyle: { color: '#94a3b8', fontSize: 10 }, itemWidth: 10, itemHeight: 10 },
    series: [{
      type: 'pie',
      radius: ['50%', '65%'],
      center: ['50%', '45%'],
      label: { show: false },
      data: [
        { value: Math.floor(450 * dataMult), name: 'Active', itemStyle: { color: '#f59e0b' } },
        { value: Math.floor(320 * dataMult), name: 'Charge Sheet', itemStyle: { color: '#3b82f6' } },
        { value: Math.floor(120 * dataMult), name: 'Closed', itemStyle: { color: '#10b981' } }
      ]
    }]
  };


  // 6. Seriousness of Crime (Bar)
  const seriousnessOptions = {
    ...commonOptions,
    tooltip: { trigger: 'axis' },
    grid: { left: 10, right: 10, bottom: 10, top: 30, containLabel: true },
    xAxis: { type: 'category', data: ['Heinous', 'Non-Hein', 'Cog', 'Non-Cog'], axisLabel: { color: '#94a3b8', fontSize: 10 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }, axisLabel: { color: '#94a3b8' } },
    series: [{
      type: 'bar',
      data: [320, 850, 1100, 200].map(v => Math.floor(v * dataMult)),
      itemStyle: { color: '#ef4444', borderRadius: [4, 4, 0, 0] }
    }]
  };

  // 7. Age vs Crime Rate (Histogram)
  const ageOptions = {
    ...commonOptions,
    tooltip: { trigger: 'axis' },
    grid: { left: 10, right: 10, bottom: 10, top: 30, containLabel: true },
    xAxis: { type: 'category', data: ['<18', '18-25', '26-35', '36-45', '46-55', '55+'], axisLabel: { color: '#94a3b8', fontSize: 10 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }, axisLabel: { color: '#94a3b8' } },
    series: [{
      name: 'Offenders',
      type: 'bar',
      data: [45, 420, 580, 310, 120, 40].map(v => Math.floor(v * dataMult)),
      itemStyle: { color: '#8b5cf6', borderRadius: [2, 2, 0, 0] },
      barWidth: '98%' 
    }]
  };

  // 8. Recidivism (Repeat Offenders)
  const recidivismOptions = {
    ...commonOptions,
    tooltip: { trigger: 'item' },
    legend: { bottom: '0', textStyle: { color: '#94a3b8', fontSize: 10 }, itemWidth: 10, itemHeight: 10 },
    series: [{
      type: 'pie',
      radius: ['45%', '65%'],
      center: ['50%', '45%'],
      label: { show: false },
      data: [
        { value: Math.floor(2150 * dataMult), name: 'First-Time', itemStyle: { color: '#3b82f6' } },
        { value: Math.floor(980 * dataMult), name: 'Habitual', itemStyle: { color: '#ef4444' } }
      ]
    }]
  };

  // --- Tight Grid Layout ---
  const charts = [
    { id: 'district', title: 'State-Wide District Distribution', icon: Map, options: districtOptions, span: 'col-span-12 lg:col-span-5' },
    { id: 'trend', title: 'Macro Crime Velocity', icon: TrendingUp, options: trendOptions, span: 'col-span-12 lg:col-span-7' },
    
    { id: 'type', title: 'Crime Types', icon: PieChart, options: typeOptions, span: 'col-span-2' },
    { id: 'status', title: 'Clearance Rate', icon: Activity, options: statusOptions, span: 'col-span-2' },
    { id: 'age', title: 'Demographics: Age', icon: Users, options: ageOptions, span: 'col-span-3' },
    { id: 'seriousness', title: 'Threat Level', icon: AlertTriangle, options: seriousnessOptions, span: 'col-span-2' },
    { id: 'recidivism', title: 'Recidivism', icon: AlertTriangle, options: recidivismOptions, span: 'col-span-3' },
  ];

  return (
    <div className="h-full flex flex-col space-y-3 overflow-hidden">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-slate-800 pb-3 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
            <Activity className="h-6 w-6 text-purple-500" />
            PATTERN INTELLIGENCE
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-emerald-500 text-xs font-mono bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
            <Database className="h-3 w-3" /> LIVE SYNC
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg shadow-sm">
            <Calendar className="h-4 w-4 text-slate-400" />
            <select 
              value={globalDate} 
              onChange={(e) => setGlobalDate(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="last_7_days" className="bg-slate-900">Last 7 Days</option>
              <option value="last_month" className="bg-slate-900">Last Month</option>
              <option value="last_year" className="bg-slate-900">Last Year</option>
              <option value="all_time" className="bg-slate-900">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI EXPLAINABILITY LAYER */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-start gap-3 shrink-0 shadow-lg">
        <div className="bg-slate-800 p-1.5 rounded border border-slate-700 mt-0.5">
          <Terminal className="h-4 w-4 text-slate-300" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">AI Executive Briefing</h3>
          <p className="text-sm text-slate-400 leading-snug">
            Querying <strong className="text-slate-200">{karnatakaDistricts.length} jurisdictions</strong> over the selected timeframe. Data indicates a <strong className="text-slate-200">{(dataMult * 100).toFixed(0)}%</strong> variance against historical baselines. 
            Bengaluru Urban accounts for a disproportionate volume of active threats. The recidivism rate remains critical, with <strong className="text-amber-400 font-bold">31.3% of incidents linked to habitual offenders</strong>.
          </p>
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <div className="flex-1 grid grid-cols-12 grid-rows-2 gap-3 min-h-0 pb-2">
        {charts.map((chart) => (
          <div key={chart.id} className={`${chart.span} bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-inner relative group flex flex-col h-full`}>
            
            <div className="flex justify-between items-center mb-1 shrink-0">
              <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <chart.icon className="h-3.5 w-3.5 text-blue-500" /> {chart.title}
              </h3>
              
              <div className="flex items-center gap-1">
                {chart.id === 'trend' && (
                  <div className="flex bg-slate-950 rounded border border-slate-700 overflow-hidden mr-1">
                    {['Weeks', 'Months'].map(gran => (
                      <button 
                        key={gran}
                        onClick={() => setTrendGranularity(gran)}
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase transition-colors ${trendGranularity === gran ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}
                      >
                        {gran}
                      </button>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => setExpandedChart(chart.id)}
                  className="p-1 bg-slate-800 text-slate-400 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Expand for Senior Briefing"
                >
                  <Maximize2 className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ReactECharts option={chart.options} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        ))}
      </div>

      {/* FULL-SCREEN "SENIOR BRIEFING" MODAL */}
      {expandedChart && (() => {
        const activeChartData = charts.find(c => c.id === expandedChart);
        if (!activeChartData) return null;

        // Inject the ECharts Toolbox into the expanded view for exports
        const expandedOptions = {
          ...activeChartData.options,
          toolbox: {
            show: true,
            feature: {
              dataView: { readOnly: true, title: 'View Raw Data', backgroundColor: '#0f172a', textColor: '#f8fafc' },
              saveAsImage: { title: 'Export as Image', name: `KSP_NEXUS_${activeChartData.id}_Export` }
            },
            iconStyle: { borderColor: '#94a3b8' }
          }
        };

        return (
          <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-8">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
              <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-xl shrink-0">
                <h2 className="text-lg font-bold text-white flex items-center gap-3">
                  <activeChartData.icon className="h-5 w-5 text-blue-500" />
                  {activeChartData.title} (Executive View)
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-emerald-500 border border-emerald-500/30 px-2 py-1 rounded bg-emerald-500/10">Use icons on right to Export Data</span>
                  <button 
                    onClick={() => setExpandedChart(null)}
                    className="p-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-6 w-full h-full min-h-0">
                <ReactECharts option={expandedOptions} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};