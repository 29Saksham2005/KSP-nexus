import { api } from './api';

export interface FIRResponse {
  id: number;
  fir_number: string;
  incident_date: string;
  registration_date: string;
  status: string;
  summary: string | null;
  station_name: string;
  category_name: string;
}

export interface FIRPaginatedResponse {
  total_count: number;
  items: FIRResponse[];
}

export const firService = {
  searchFirs: async (
    skip: number = 0,
    limit: number = 50,
    searchQuery?: string,
    statusFilter?: string
  ): Promise<FIRPaginatedResponse> => {
    // Build the query parameters dynamically
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    
    if (searchQuery) params.append('search', searchQuery);
    if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);

    const response = await api.get(`/firs/?${params.toString()}`);
    return response.data.data; // Unpack the nested FastAPI response
  }
};