import { api } from './api';

export interface Node {
  id: string;
  name: string;
  group: string;
  val: number;
  category?: string; // New field
  date?: string;     // New field
}

export interface Link {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

export const networkService = {
  getLinkAnalysis: async (): Promise<GraphData> => {
    const response = await api.get('/network/link-analysis');
    return response.data.data;
  }
};