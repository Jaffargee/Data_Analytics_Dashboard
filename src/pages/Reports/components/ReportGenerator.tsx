import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { TopBar } from '@/components/ui/TopBar';
import { useSummaryReport } from '../hooks/useSummaryReport';
import { DateRangeSelector } from './DateRangeSelector';
import { SummaryReports } from './SummaryReports';
import { ComparisonTab } from './ComparisonTab';
import { TimingTab } from './TimingTab';
import { ProductsTab } from './ProductsTab';
import { CustomersTab } from './CustomersTab';
import { TAB_LIST_CLASS, TAB_TRIGGER_CLASS, STICKY_TAB_WRAPPER_CLASS } from '@/lib/constants/tabs';
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

                  <main className="flex-1 p-3 sm:p-6 space-y-6">
                        <Tabs.Root defaultValue="summary">
                              <Tabs.List className={TAB_LIST_CLASS + ' mb-5'}>
                                    <Tabs.Trigger value="summary" className={TAB_TRIGGER_CLASS}>Summary Reports</Tabs.Trigger>
                                    <Tabs.Trigger value="comparison" className={TAB_TRIGGER_CLASS}>Period Comparison</Tabs.Trigger>
                                    <Tabs.Trigger value="timing" className={TAB_TRIGGER_CLASS}>Timing</Tabs.Trigger>
                                    <Tabs.Trigger value="products" className={TAB_TRIGGER_CLASS}>Products</Tabs.Trigger>
                                    <Tabs.Trigger value="customers" className={TAB_TRIGGER_CLASS}>Customers</Tabs.Trigger>
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

                              <Tabs.Content value="timing">
                                    <TimingTab />
                              </Tabs.Content>

                              <Tabs.Content value="products">
                                    <ProductsTab />
                              </Tabs.Content>

                              <Tabs.Content value="customers">
                                    <CustomersTab />
                              </Tabs.Content>
                        </Tabs.Root>
                  </main>
            </div>
      );
}
