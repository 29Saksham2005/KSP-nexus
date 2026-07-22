import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ShieldAlert } from 'lucide-react';
import { geoService, type GeoStationData } from '../../services/geo';

export const GeoIntelligence: React.FC = () => {
  const [stations, setStations] = useState<GeoStationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default center point (Roughly central Karnataka/Bengaluru)
  const center: [number, number] = [12.9716, 77.5946]; 

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const data = await geoService.getStations();
        setStations(data);
      } catch (error) {
        console.error("Failed to load spatial data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGeoData();
  }, []);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <MapPin className="h-6 w-6 text-blue-500" />
          Geo Intelligence
        </h1>
        <p className="text-sm text-slate-400">Real-time spatial mapping of crime distribution and active investigations.</p>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative shadow-lg min-h-[600px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
            <span className="text-blue-400 animate-pulse">Initializing Global Positioning...</span>
          </div>
        ) : (
          <MapContainer 
            center={center} 
            zoom={7} 
            className="h-full w-full"
            zoomControl={false}
          >
            {/* Dark Mode Map Tiles */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {stations.map((station) => (
              <CircleMarker
                key={station.id}
                center={[station.latitude, station.longitude]}
                pathOptions={{
                  color: station.active_investigations > 10 ? '#ef4444' : '#3b82f6',
                  fillColor: station.active_investigations > 10 ? '#ef4444' : '#3b82f6',
                  fillOpacity: 0.4,
                  weight: 2
                }}
                radius={Math.max(10, Math.min(30, station.total_firs * 0.5))} // Dynamically scale based on FIR count
              >
                <Popup className="bg-slate-900 border-none rounded-lg custom-popup">
                  <div className="p-3 bg-slate-900 text-slate-200 rounded shadow-xl">
                    <h3 className="font-bold border-b border-slate-700 pb-2 mb-2 text-white">
                      {station.station_name}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="flex justify-between w-40">
                        <span className="text-slate-400">Total FIRs:</span> 
                        <span className="font-mono text-blue-400">{station.total_firs}</span>
                      </p>
                      <p className="flex justify-between w-40">
                        <span className="text-slate-400">Active Cases:</span> 
                        <span className="font-mono text-red-400 flex items-center gap-1">
                          {station.active_investigations}
                          {station.active_investigations > 10 && <ShieldAlert className="h-3 w-3" />}
                        </span>
                      </p>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};