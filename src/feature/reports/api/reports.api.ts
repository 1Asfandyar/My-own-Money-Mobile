import { apiRequest } from '@/services/api';
import type { Report, ReportApiResponse } from '@/feature/reports/types/report.types';

export const getReportSummary = async (token: string, month?: string): Promise<Report> => {
  const query = month ? `?month=${encodeURIComponent(month)}` : '';
  const result = await apiRequest<ReportApiResponse>(`/api/v0/reports/summary${query}`, { token });
  return result.data.report;
};
