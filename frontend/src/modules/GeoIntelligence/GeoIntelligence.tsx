import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, LayersControl, LayerGroup, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Activity, ShieldAlert, Building2, Search } from 'lucide-react';
import { geoService, type GeoPoint, type GeoStationData } from '../../services/geo';

// --- Leaflet Icon Fix for React ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
// ----------------------------------

// Utility Component: Forces map to resize on load
const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const timeout = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(timeout);
  }, [map]);
  return null;
};

// Utility Component: Flies the camera to a selected target
const CameraController = ({ target }: { target: GeoStationData | null }) => {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.latitude, target.longitude], 14, {
        animate: true,
        duration: 1.5
      });
    }
  }, [target, map]);
  return null;
};

export const GeoIntelligence: React.FC = () => {
  const [locations, setLocations] = useState<GeoPoint[]>([]);
  const [stations, setStations] = useState<GeoStationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedStation, setSelectedStation] = useState<GeoStationData | null>(null);

  // Default center point
  const defaultCenter: [number, number] = [14.5, 76.5];
  const defaultZoom = 7;

  useEffect(() => {
    const fetchMapData = async () => {
      setIsLoading(true);
      try {
        const [locData, stationData] = await Promise.all([
          geoService.getCrimeLocations(),
          geoService.getStations()
        ]);
        setLocations(locData);
        setStations(stationData);
      } catch (error) {
        console.error("Failed to load map data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapData();
  }, []);

  // Search filtering logic
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const lower = searchTerm.toLowerCase();
    return stations.filter(s => s.station_name.toLowerCase().includes(lower)).slice(0, 5);
  }, [searchTerm, stations]);

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header & Search Bar */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapPin className="h-6 w-6 text-emerald-500" />
            Geo Intelligence
          </h1>
          <p className="text-sm text-slate-400">
            Geospatial plotting of police stations and active crime hotspots.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-80 z-[2000]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search police station..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
              {searchResults.map(result => (
                <div 
                  key={`search-${result.id}`}
                  onClick={() => {
                    setSelectedStation(result);
                    setSearchTerm('');
                    setShowSearchResults(false);
                  }}
                  className="p-3 hover:bg-slate-800 cursor-pointer flex items-center justify-between border-b border-slate-800/50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-slate-200">{result.station_name}</span>
                  </div>
                  <MapPin className="h-3 w-3 text-emerald-500 opacity-50" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Container Wrapper */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative shadow-inner flex flex-col">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 z-50 bg-slate-900">
            <Activity className="h-8 w-8 text-emerald-500 animate-bounce" />
            <span className="text-slate-400 text-sm animate-pulse">Initializing Satellite Uplink...</span>
          </div>
        ) : (
          <div className="flex-1 w-full h-full relative z-0">
            <MapContainer 
              center={defaultCenter} 
              zoom={defaultZoom} 
              className="w-full h-full"
              zoomControl={true}
              style={{ height: '100%', width: '100%', minHeight: '600px' }}
            >
              <MapResizer />
              <CameraController target={selectedStation} />

              {/* Dark mode styled map tiles */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              
              <LayersControl position="topright">
                
                {/* Layer 1: Police Stations */}
                <LayersControl.Overlay checked name="Jurisdiction: Police Stations">
                  <LayerGroup>
                    {stations.map((station) => (
                      <Marker key={`station-${station.id}`} position={[station.latitude, station.longitude]}>
                        {/* NEW: Permanent Tooltip to always show the name */}
                        <Tooltip permanent direction="bottom" offset={[0, 10]} opacity={0.9}>
                          <span className="font-bold text-[10px] uppercase tracking-wide text-slate-800">
                            {station.station_name}
                          </span>
                        </Tooltip>

                        <Popup className="custom-popup">
                          <div className="p-2 min-w-[200px]">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1 mb-1">
                              <Building2 className="h-3 w-3" /> Police Station
                            </span>
                            <strong className="block text-slate-800 text-sm mb-2">{station.station_name}</strong>
                            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200 pt-2">
                              <div>
                                <span className="text-slate-500 block">Total FIRs</span>
                                <span className="font-bold text-slate-800">{station.total_firs}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Active</span>
                                <span className="font-bold text-blue-600">{station.active_investigations}</span>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </LayerGroup>
                </LayersControl.Overlay>

                {/* Layer 2: Crime Scenes (FIRs) */}
                <LayersControl.Overlay checked name="Intelligence: Crime Scenes">
                  <LayerGroup>
                    {locations.map((loc) => (
                      <CircleMarker 
                        key={`case-${loc.id}`} 
                        center={[loc.latitude, loc.longitude]}
                        radius={6}
                        pathOptions={{ 
                          color: '#ef4444', 
                          fillColor: '#ef4444', 
                          fillOpacity: 0.7,
                          weight: 2
                        }}
                      >
                        <Popup className="custom-popup">
                          <div className="p-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-red-600 block mb-1">
                              Crime Scene
                            </span>
                            <strong className="block text-slate-800 font-mono text-sm mb-1">{loc.fir_number}</strong>
                            <span className="text-xs text-slate-600 flex items-center gap-1">
                              <ShieldAlert className="h-3 w-3" />
                              {loc.category}
                            </span>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </LayerGroup>
                </LayersControl.Overlay>

              </LayersControl>
            </MapContainer>
          </div>
        )}

        {/* Floating Overlay Panel */}
        <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-700 p-4 rounded-lg z-[1000] shadow-xl pointer-events-none w-64">
          <h4 className="text-sm font-bold text-white mb-3 border-b border-slate-800 pb-2 flex justify-between items-center">
            Map Statistics
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded uppercase">Live</span>
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 flex items-center gap-1"><Building2 className="h-3 w-3 text-blue-500"/> Stations:</span>
              <span className="text-sm font-mono font-bold text-blue-400">{stations.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 flex items-center gap-1"><ShieldAlert className="h-3 w-3 text-red-500"/> Crime Scenes:</span>
              <span className="text-sm font-mono font-bold text-red-400">{locations.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};