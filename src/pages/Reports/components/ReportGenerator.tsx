import React, { useState } from 'react';
import { TopBar } from '@/components/ui/TopBar';
import { useSummaryReport } from '../hooks/useSummaryReport';
import { DateRangeSelector } from './DateRangeSelector';
import { SummaryReports } from './SummaryReports';
import type { ReportType } from '../constants';

export function ReportGenerator() {
      const [reportDate, setReportDate] = useState<string>(new Date().toJSON().split('T')[0]);
      const [summaryReportDate, setSummaryReportDate] = useState<string>(new Date().toJSON().split('T')[0]);


      const {
            loading: summaryLoading,
            detailLoading,
            reportResult,
            generateReport: generateSummaryReport,
      } = useSummaryReport();

      const handleGenerateSummaryReport = (type: ReportType) => {
            generateSummaryReport(type, reportDate);
      };

      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar
                        title="Report Generator"
                        subtitle="Generate analytics reports for any time period"
                  />

                  <main className="flex-1 p-6 space-y-6">
                        <DateRangeSelector
                              reportDate={reportDate}
                              summaryReportDate={summaryReportDate}
                              onReportDateChange={setReportDate}
                              onGenerateSummary={handleGenerateSummaryReport}
                              summaryLoading={summaryLoading}
                              detailLoading={detailLoading}
                        />

                        <SummaryReports reportResult={reportResult} />
                  </main>
            </div>
      );
}
