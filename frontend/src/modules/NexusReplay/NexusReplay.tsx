import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import { History, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

// Utility component to handle map resizing
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
  
  // Mock Timeline Data (You will replace this with the /replay/timeline API)
  const timelineDates = ["March 2026", "April 2026", "May 2026", "June 2026"];
  const timelineData = [
    [{ lat: 12.9716, lng: 77.5946, val: 3 }], // March
    [{ lat: 12.9716, lng: 77.5946, val: 5 }, { lat: 15.3647, lng: 75.1240, val: 2 }], // April
    [{ lat: 12.9716, lng: 77.5946, val: 8 }, { lat: 15.3647, lng: 75.1240, val: 6 }], // May
    [{ lat: 12.9716, lng: 77.5946, val: 12 }, { lat: 15.3647, lng: 75.1240, val: 9 }, { lat: 12.8700, lng: 74.8800, val: 4 }] // June
  ];

  // Playback Engine
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
      }, 1500); // Speed of playback
    }
    return () => clearInterval(interval);
  }, [isPlaying, timelineDates.length]);

  const currentPoints = timelineData[timelineIndex];

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <History className="h-6 w-6 text-amber-500" />
          NEXUS Replay
        </h1>
        <p className="text-sm text-slate-400">Chronological playback of crime evolution and hotspot migration.</p>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative shadow-inner flex flex-col">
        {/* Map Area */}
        <div className="flex-1 w-full h-full relative z-0">
          <MapContainer center={[14.5, 76.5]} zoom={7} className="w-full h-full" zoomControl={false} style={{ height: '100%', width: '100%', minHeight: '400px' }}>
            <MapResizer />
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            
            {/* Animated Data Points */}
            {currentPoints.map((pt, idx) => (
              <CircleMarker 
                key={idx} 
                center={[pt.lat, pt.lng]} 
                radius={pt.val * 2} 
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.6, weight: 1 }} 
              />
            ))}
          </MapContainer>
        </div>

        {/* Floating Date Display */}
        <div className="absolute top-6 left-6 z-[1000] bg-slate-950/90 border border-slate-700 px-6 py-3 rounded-lg shadow-xl backdrop-blur-md">
          <span className="text-xs text-amber-500 font-bold uppercase tracking-widest block mb-1">Current Timeframe</span>
          <span className="text-3xl font-mono text-white tracking-tight">{timelineDates[timelineIndex]}</span>
        </div>

        {/* Playback Control Deck */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl bg-slate-950/90 border border-slate-700 p-4 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setTimelineIndex(0)} className="p-2 text-slate-400 hover:text-white transition-colors"><SkipBack className="h-5 w-5" /></button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className="p-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
            </button>
            <button onClick={() => setTimelineIndex(timelineDates.length - 1)} className="p-2 text-slate-400 hover:text-white transition-colors"><SkipForward className="h-5 w-5" /></button>
            
            {/* Timeline Slider */}
            <input 
              type="range" 
              min="0" 
              max={timelineDates.length - 1} 
              value={timelineIndex} 
              onChange={(e) => {
                setTimelineIndex(parseInt(e.target.value));
                setIsPlaying(false);
              }}
              className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};