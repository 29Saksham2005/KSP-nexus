import { api } from './api';

export interface GeoStationData {
  id: string;
  station_name: string;
  latitude: number;
  longitude: number;
  total_firs: number;
  active_investigations: number;
}

export interface GeoPoint {
  id: number;
  fir_number: string;
  category: string;
  latitude: number;
  longitude: number;
}

export const geoService = {
  getStations: async (): Promise<GeoStationData[]> => {
    const response = await api.get('/geo/stations');
    return response.data.data.stations;
  },

  getCrimeLocations: async (): Promise<GeoPoint[]> => {
    const response = await api.get('/geo/locations');
    return response.data.data;
  }
};