import React, { useState } from 'react';
import { TopBar } from '@/components/ui/TopBar';
import { useReportGenerator } from '../hooks/useReportGenerator';
import { useSummaryReport } from '../hooks/useSummaryReport';
import { DateRangeSelector } from './DateRangeSelector';
import { SummaryReports } from './SummaryReports';
import { KPIRow } from './KPIRow';
import { ReportTabs } from './ReportTabs';
import { LoadingState } from './LoadingState';
import { EmptyReportState } from './EmptyReportState';
import { PERIOD2_DEFAULT } from '../constants';
import { computeKPIs, transformChartData } from '../utils';
import type { ReportType } from '../constants';

export function ReportGenerator() {
      const [fromDate, setFromDate] = useState(PERIOD2_DEFAULT.from);
      const [toDate, setToDate] = useState(PERIOD2_DEFAULT.to);
      const [reportDate, setReportDate] = useState<string>(
            new Date().toJSON().split('T')[0]
      );

      const {
            loading,
            generated,
            summary,
            dowData,
            catData,
            products,
            prices,
            timingData,
            customers,
            daily,
            comparison,
            generateReport,
      } = useReportGenerator();

      const {
            loading: summaryLoading,
            reportResult,
            generateReport: generateSummaryReport,
      } = useSummaryReport();

      const handleGenerateReport = () => {
            if (fromDate && toDate) {
                  console.log('Connected')
                  generateReport(fromDate, toDate);
            }
      };

      const handleGenerateSummaryReport = (type: ReportType) => {
            generateSummaryReport(type, reportDate);
      };

      const kpis = computeKPIs(summary);
      const chartData = transformChartData(
            dowData,
            daily,
            catData,
            products,
            customers
      );

      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar
                        title="Report Generator"
                        subtitle="Generate analytics reports for any time period"
                  />

                  <main className="flex-1 p-6 space-y-6">
                        <DateRangeSelector
                              fromDate={fromDate}
                              toDate={toDate}
                              onFromDateChange={setFromDate}
                              onToDateChange={setToDate}
                              onGenerate={handleGenerateReport}
                              loading={loading}
                              generated={generated}
                              reportDate={reportDate}
                              onReportDateChange={setReportDate}
                              onGenerateSummary={handleGenerateSummaryReport}
                              summaryLoading={summaryLoading}
                        />

                        <SummaryReports reportResult={reportResult} />

                        {loading && <LoadingState />}

                        {!loading && generated && (
                              <>
                                    <KPIRow kpis={kpis} />
                                    <ReportTabs
                                          chartData={chartData}
                                          rawData={{
                                                summary,
                                                dowData,
                                                catData,
                                                products,
                                                prices,
                                                timingData,
                                                customers,
                                                daily,
                                                comparison,
                                          }}
                                          fromDate={fromDate}
                                          toDate={toDate}
                                    />
                              </>
                        )}

                        {!loading && !generated && <EmptyReportState />}
                  </main>
            </div>
      );
}
