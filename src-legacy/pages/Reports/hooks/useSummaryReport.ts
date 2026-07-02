import { useState, useCallback } from 'react';
import { executeSQL } from '@/lib/llm_utils';
import { deriveLineChart } from '@/lib/utils';
import { accounts_summary_report, todays_sales_report } from '../constants';
import type { QueryResult } from '@/types';
import type { ReportType } from '../constants';

interface UseSummaryReportReturn {
      loading: boolean;
      reportResult: QueryResult | null;
      generateReport: (type: ReportType, date: string) => Promise<void>;
}

export function useSummaryReport(): UseSummaryReportReturn {
      const [loading, setLoading] = useState(false);
      const [reportResult, setReportResult] = useState<QueryResult | null>(
            null
      );

      const report_query = {
            summary: accounts_summary_report,
            sales: todays_sales_report,
      };

      const generateReport = useCallback(
            async (type: ReportType, date: string) => {
                  setLoading(true);
                  try {
                        const result = await executeSQL(
                              report_query[type](date)
                        );
                        setReportResult(deriveLineChart(result));
                  } finally {
                        setLoading(false);
                  }
            },
            []
      );

      return {
            loading,
            reportResult,
            generateReport,
      };
}
