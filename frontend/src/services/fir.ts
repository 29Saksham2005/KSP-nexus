import { api } from './api';

// --- Base Interfaces ---
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

// --- Detail Interfaces ---
export interface PersonBase {
  name: string;
  age: number | null;
  gender_id: number | null;
}

export interface ComplainantSchema extends PersonBase {}
export interface VictimSchema extends PersonBase {}
export interface AccusedSchema extends PersonBase {
  person_id: string | null;
}

export interface ActSectionSchema {
  act_name: string;
  section_code: string;
}

export interface FIRDetailResponse extends FIRResponse {
  complainants: ComplainantSchema[];
  victims: VictimSchema[];
  accused: AccusedSchema[];
  acts_sections: ActSectionSchema[];
}

// --- API Service ---
export const firService = {
  searchFirs: async (
    skip: number = 0,
    limit: number = 50,
    searchQuery?: string,
    statusFilter?: string
  ): Promise<FIRPaginatedResponse> => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    
    if (searchQuery) params.append('search', searchQuery);
    if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);

    const response = await api.get(`/firs/?${params.toString()}`);
    return response.data.data; 
  },

  // Note the comma above separating the two functions!
  getFirDetails: async (firId: number): Promise<FIRDetailResponse> => {
    const response = await api.get(`/firs/${firId}`);
    return response.data.data;
  }
};