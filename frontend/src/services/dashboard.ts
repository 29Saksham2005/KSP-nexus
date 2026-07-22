import { api } from './api';

export interface KPIData {
  total_firs: number;
  active_investigations: number;
  open_cases: number;
  solved_cases: number;
}

export interface TrendDataPoint {
  period_label: string;
  incident_count: number;
}

export const dashboardService = {
  getKPIs: async (): Promise<KPIData> => {
    const response = await api.get('/dashboard/kpis');
    return response.data.data;
  },

  getTrends: async (period: 'monthly' | 'yearly' = 'monthly'): Promise<TrendDataPoint[]> => {
    const response = await api.get(`/dashboard/trends?period=${period}`);
    return response.data.data.trends;
  }
};