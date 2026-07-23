import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import { History, Play, Pause, SkipBack, SkipForward, Clock } from 'lucide-react';

// --- Utility component to force map resizing ---
const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const timeout = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(timeout);
  }, [map]);
  return null;
};

export const NexusReplay: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineIndex, setTimelineIndex] = useState(0);
  
  // --- Temporal Data Simulation ---
  // In production, this data is fetched from the /replay/timeline API
  const timelineDates = ["Week 1 (March)", "Week 2 (March)", "Week 3 (March)", "Week 4 (March)"];
  const timelineData = [
    [{ lat: 12.9716, lng: 77.5946, val: 3, type: 'theft' }], // W1
    [{ lat: 12.9716, lng: 77.5946, val: 5, type: 'theft' }, { lat: 15.3647, lng: 75.1240, val: 2, type: 'cyber' }], // W2
    [{ lat: 12.9716, lng: 77.5946, val: 8, type: 'theft' }, { lat: 15.3647, lng: 75.1240, val: 6, type: 'cyber' }], // W3
    [{ lat: 12.9716, lng: 77.5946, val: 12, type: 'theft' }, { lat: 15.3647, lng: 75.1240, val: 9, type: 'cyber' }, { lat: 12.8700, lng: 74.8800, val: 4, type: 'narcotics' }] // W4
  ];

  // --- Playback Engine ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineIndex((prev) => {
          if (prev >= timelineDates.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200); // Animation speed
    }
    return () => clearInterval(interval);
  }, [isPlaying, timelineDates.length]);

  const currentPoints = timelineData[timelineIndex];

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
            <History className="h-7 w-7 text-amber-500" />
            NEXUS REPLAY
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-widest uppercase mt-1">Chronological Threat Evolution</p>
        </div>
        <div className="flex items-center gap-2 text-amber-500 text-sm font-mono font-bold">
          <Clock className="h-4 w-4 animate-spin-slow" /> TEMPORAL ENGINE ACTIVE
        </div>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative shadow-inner flex flex-col">
        
        {/* Map Area */}
        <div className="flex-1 w-full h-full relative z-0">
          <MapContainer 
            center={[14.5, 76.5]} 
            zoom={7} 
            className="w-full h-full" 
            zoomControl={false} 
            style={{ height: '100%', width: '100%', minHeight: '400px' }}
          >
            <MapResizer />
            {/* Tactical Dark Map Tiles */}
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            
            {/* Animated Data Points */}
            {currentPoints.map((pt, idx) => {
              const markerColor = pt.type === 'cyber' ? '#10b981' : pt.type === 'narcotics' ? '#f59e0b' : '#ef4444';
              return (
                <CircleMarker 
                  key={`pt-${idx}-${timelineIndex}`} // Force re-render for animation feel
                  center={[pt.lat, pt.lng]} 
                  radius={pt.val * 2} 
                  pathOptions={{ 
                    color: markerColor, 
                    fillColor: markerColor, 
                    fillOpacity: 0.6, 
                    weight: 2 
                  }} 
                />
              );
            })}
          </MapContainer>
        </div>

        {/* Floating Timeframe Display */}
        <div className="absolute top-6 left-6 z-[1000] bg-slate-950/80 border border-slate-800 px-6 py-4 rounded-lg shadow-xl backdrop-blur-md">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Simulated Timeframe</span>
          <span className="text-3xl font-mono text-white tracking-tight">{timelineDates[timelineIndex]}</span>
        </div>

        {/* Legend */}
        <div className="absolute top-6 right-6 z-[1000] bg-slate-950/80 border border-slate-800 p-4 rounded-lg shadow-xl backdrop-blur-md">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-3 border-b border-slate-800 pb-2">Active Signatures</span>
          <div className="space-y-2">
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-red-500 opacity-80"></div><span className="text-xs text-slate-300 font-mono">Property/Violent</span></div>
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-emerald-500 opacity-80"></div><span className="text-xs text-slate-300 font-mono">Cyber Fraud</span></div>
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-amber-500 opacity-80"></div><span className="text-xs text-slate-300 font-mono">Narcotics</span></div>
          </div>
        </div>

        {/* Playback Control Deck (Glassmorphism) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-3xl bg-slate-950/80 border border-slate-700 p-5 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col gap-4">
          <div className="flex items-center gap-6">
            
            {/* Playback Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setTimelineIndex(0)} 
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className="p-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full transition-transform active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
              >
                {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
              </button>
              <button 
                onClick={() => setTimelineIndex(timelineDates.length - 1)} 
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
            
            {/* Tactical Slider */}
            <div className="flex-1 flex flex-col gap-2 relative">
              <input 
                type="range" 
                min="0" 
                max={timelineDates.length - 1} 
                value={timelineIndex} 
                onChange={(e) => {
                  setTimelineIndex(parseInt(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono font-bold mt-1">
                <span>{timelineDates[0]}</span>
                <span>{timelineDates[timelineDates.length - 1]}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};