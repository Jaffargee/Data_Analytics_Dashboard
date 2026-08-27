import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { TopBar } from '@/components/ui/TopBar';
import { useSummaryReport } from '../hooks/useSummaryReport';
import { DateRangeSelector } from './DateRangeSelector';
import { SummaryReports } from './SummaryReports';
import { ComparisonTab } from './ComparisonTab';
import type { ReportType } from '../constants';

const TAB_TRIGGER_CLASS =
      'rounded-md px-4 py-1.5 text-xs text-ink-muted data-[state=active]:bg-accent-gold/15 data-[state=active]:text-accent-gold';

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
                        <Tabs.Root defaultValue="summary">
                              <Tabs.List className="flex w-fit gap-1 rounded-lg border border-bg-border bg-bg-panel p-1 mb-5">
                                    <Tabs.Trigger value="summary" className={TAB_TRIGGER_CLASS}>Summary Reports</Tabs.Trigger>
                                    <Tabs.Trigger value="comparison" className={TAB_TRIGGER_CLASS}>Period Comparison</Tabs.Trigger>
                              </Tabs.List>

                              <Tabs.Content value="summary" className="space-y-6">
                                    <DateRangeSelector
                                          reportDate={reportDate}
                                          summaryReportDate={summaryReportDate}
                                          onReportDateChange={setReportDate}
                                          onGenerateSummary={handleGenerateSummaryReport}
                                          summaryLoading={summaryLoading}
                                          detailLoading={detailLoading}
                                    />

                                    <SummaryReports reportResult={reportResult} />
                              </Tabs.Content>

                              <Tabs.Content value="comparison">
                                    <ComparisonTab />
                              </Tabs.Content>
                        </Tabs.Root>
                  </main>
            </div>
      );
}
