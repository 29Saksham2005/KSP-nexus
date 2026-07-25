import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText } from 'lucide-react';
import { firService, type FIRResponse } from '../../services/fir';
import { FIRDetailPanel } from './FIRDetailPanel';


export const InvestigationWorkspace: React.FC = () => {
  const [firs, setFirs] = useState<FIRResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  // Track which FIR row is selected for the slide-over panel
  const [selectedFirId, setSelectedFirId] = useState<number | null>(null);

  const fetchFirs = async () => {
    setIsLoading(true);
    try {
      const data = await firService.searchFirs(0, 50, search, status);
      setFirs(data.items);
      setTotalCount(data.total_count);
    } catch (error) {
      console.error("Failed to fetch FIRs", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch data whenever search or status changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFirs();
    }, 400); // Debounce typing so we don't spam the API

    return () => clearTimeout(delayDebounceFn);
  }, [search, status]);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-500" />
          Investigation Workspace
        </h1>
        <p className="text-sm text-slate-400">Search, filter, and review active First Information Reports.</p>
      </div>

      {/* Control Panel: Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Crime No. or brief facts..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Charge Sheeted">Charge Sheeted</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Data Grid */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/50 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Crime No.</th>
                <th className="px-6 py-4">Station</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <span className="animate-pulse">Retrieving records...</span>
                  </td>
                </tr>
              ) : firs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No cases match your search criteria.
                  </td>
                </tr>
              ) : (
                firs.map((fir) => (
                  <tr 
                    key={fir.id} 
                    onClick={() => setSelectedFirId(fir.id)}
                    className="hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-blue-400">{fir.fir_number}</td>
                    <td className="px-6 py-4">{fir.station_name}</td>
                    <td className="px-6 py-4">{fir.category_name}</td>
                    <td className="px-6 py-4">{new Date(fir.incident_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        fir.status === 'Closed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        fir.status === 'Under Investigation' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {fir.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Pagination Stats */}
        <div className="bg-slate-950/50 border-t border-slate-800 px-6 py-4 flex justify-between items-center text-sm text-slate-500">
          <span>Showing top {firs.length} of {totalCount} records</span>
        </div>
      </div>

      {/* Slide-Over Panel Component */}
      <FIRDetailPanel 
        firId={selectedFirId} 
        onClose={() => setSelectedFirId(null)} 
      />
    </div>
  );
};