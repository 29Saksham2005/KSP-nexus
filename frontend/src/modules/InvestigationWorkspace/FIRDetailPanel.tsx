import React, { useEffect, useState } from 'react';
import { X, Users, Scale, AlertCircle, Calendar } from 'lucide-react';
import { firService, type FIRDetailResponse } from '../../services/fir';

interface FIRDetailPanelProps {
  firId: number | null;
  onClose: () => void;
}

export const FIRDetailPanel: React.FC<FIRDetailPanelProps> = ({ firId, onClose }) => {
  const [details, setDetails] = useState<FIRDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!firId) {
      setDetails(null);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const data = await firService.getFirDetails(firId);
        setDetails(data);
      } catch (error) {
        console.error("Failed to load FIR details", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [firId]);

  // If panel is closed, don't render anything
  if (!firId) return null;

  return (
    <>
      {/* Semi-transparent backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-slate-900 border-l border-slate-700 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
          <div>
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              {details ? details.fir_number : 'Loading...'}
            </h2>
            <p className="text-sm text-slate-400">Case Dossier</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {isLoading || !details ? (
            <div className="flex justify-center py-12">
              <span className="text-blue-400 animate-pulse">Decrypting Case Files...</span>
            </div>
          ) : (
            <>
              {/* Status & Summary Box */}
              <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Status</span>
                    <p className="font-medium text-white">{details.status}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Registered</span>
                    <p className="font-medium text-white flex items-center gap-1 justify-end">
                      <Calendar className="h-3 w-3" />
                      {new Date(details.registration_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <span className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Brief Facts</span>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{details.summary}"
                </p>
              </div>

              {/* Acts & Sections */}
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                  <Scale className="h-4 w-4 text-blue-400" />
                  Legal Framework
                </h3>
                <div className="flex flex-wrap gap-2">
                  {details.acts_sections.map((act, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-800 text-blue-300 rounded-md text-xs border border-slate-700">
                      {act.act_name} - Sec {act.section_code}
                    </span>
                  ))}
                  {details.acts_sections.length === 0 && <span className="text-sm text-slate-500">No acts recorded.</span>}
                </div>
              </div>

              {/* Accused Persons */}
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  Accused ({details.accused.length})
                </h3>
                <ul className="space-y-2">
                  {details.accused.map((acc, idx) => (
                    <li key={idx} className="flex justify-between items-center p-3 bg-red-950/20 border border-red-900/30 rounded-lg">
                      <div>
                        <span className="text-white font-medium block">{acc.name}</span>
                        <span className="text-xs text-slate-400">Identifier: {acc.person_id || 'N/A'}</span>
                      </div>
                      <span className="text-sm text-slate-400">Age: {acc.age || 'U/K'}</span>
                    </li>
                  ))}
                  {details.accused.length === 0 && <span className="text-sm text-slate-500">No accused identified.</span>}
                </ul>
              </div>

              {/* Victims & Complainants */}
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                  <Users className="h-4 w-4 text-emerald-400" />
                  Victims & Complainants
                </h3>
                <div className="space-y-4">
                  {/* Victims */}
                  {details.victims.map((vic, idx) => (
                    <div key={`vic-${idx}`} className="p-3 bg-slate-800/50 rounded-lg flex justify-between items-center">
                      <div>
                        <span className="text-emerald-400 text-xs uppercase font-bold mr-2">Victim</span>
                        <span className="text-white text-sm">{vic.name}</span>
                      </div>
                      <span className="text-xs text-slate-400">Age: {vic.age || 'U/K'}</span>
                    </div>
                  ))}
                  
                  {/* Complainants */}
                  {details.complainants.map((comp, idx) => (
                    <div key={`comp-${idx}`} className="p-3 bg-slate-800/50 rounded-lg flex justify-between items-center">
                      <div>
                        <span className="text-blue-400 text-xs uppercase font-bold mr-2">Complainant</span>
                        <span className="text-white text-sm">{comp.name}</span>
                      </div>
                      <span className="text-xs text-slate-400">Age: {comp.age || 'U/K'}</span>
                    </div>
                  ))}
                </div>
              </div>

            </>
          )}
        </div>
      </div>
    </>
  );
};