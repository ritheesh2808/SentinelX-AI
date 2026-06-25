import api from './api';
import type { AIVulnerabilityAnalysis } from '../types/ai';

export const analyzeVulnerability = async (data: {
  service: string;
  version: string;
  port: number;
  severity: string;
  banner?: string;
  product?: string;
}): Promise<AIVulnerabilityAnalysis> => {
  const response = await api.post<AIVulnerabilityAnalysis>('/ai/analyze-vulnerability', data);
  return response.data;
};
