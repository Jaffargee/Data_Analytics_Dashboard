import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { OverviewTab } from './OverviewTab';
import { TimingTab } from './TimingTab';
import { ProductsTab } from './ProductsTab';
import { PricesTab } from './PricesTab';
import { CustomersTab } from './CustomersTab';
import { ComparisonTab } from './ComparisonTab';
import { TAB_VALUES } from '../constants';
import type { ChartDataSets } from '../utils';
import type {
      PeriodSummary,
      RevenueByDow,
      RevenueByCategory,
      TopProduct,
      PriceSensitivity,
      TimeIntelligence,
      TopCustomer,
      DailyBreakdown,
      Comparison,
} from '../types';

interface ReportTabsProps {
      chartData: ChartDataSets;
      rawData: {
            summary: PeriodSummary[];
            dowData: RevenueByDow[];
            catData: RevenueByCategory[];
            products: TopProduct[];
            prices: PriceSensitivity[];
            timingData: TimeIntelligence[];
            customers: TopCustomer[];
            daily: DailyBreakdown[];
            comparison: Comparison[];
      };
      fromDate: string;
      toDate: string;
}

export function ReportTabs({
      chartData,
      rawData,
      fromDate,
      toDate,
}: ReportTabsProps) {
      return (
            <Tabs.Root defaultValue="overview">
                  <Tabs.List className="flex gap-1 bg-bg-panel border border-bg-border rounded-xl p-1 flex-wrap">
                        {TAB_VALUES.map((v) => (
                              <Tabs.Trigger
                                    key={v}
                                    value={v}
                                    className="px-4 py-1.5 text-xs font-body rounded-lg text-ink-secondary
              data-[state=active]:bg-accent-gold/15 data-[state=active]:text-accent-gold
              data-[state=active]:border data-[state=active]:border-accent-gold/30
              hover:text-ink-primary transition-all capitalize"
                              >
                                    {v}
                              </Tabs.Trigger>
                        ))}
                  </Tabs.List>

                  <Tabs.Content value="overview" className="space-y-4 mt-4">
                        <OverviewTab
                              chartData={chartData}
                              catData={rawData.catData}
                              daily={rawData.daily}
                              tradingDays={
                                    rawData.summary.find(
                                          (s) => s.metric === 'trading_days'
                                    )?.value ?? 0
                              }
                        />
                  </Tabs.Content>

                  <Tabs.Content value="timing" className="space-y-4 mt-4">
                        <TimingTab
                              timingData={rawData.timingData}
                              dowData={rawData.dowData}
                              dowChart={chartData.dowChart}
                        />
                  </Tabs.Content>

                  <Tabs.Content value="products" className="space-y-4 mt-4">
                        <ProductsTab products={rawData.products} />
                  </Tabs.Content>

                  <Tabs.Content value="prices" className="space-y-4 mt-4">
                        <PricesTab prices={rawData.prices} />
                  </Tabs.Content>

                  <Tabs.Content value="customers" className="space-y-4 mt-4">
                        <CustomersTab customers={rawData.customers} />
                  </Tabs.Content>

                  <Tabs.Content value="comparison" className="space-y-4 mt-4">
                        <ComparisonTab
                              comparison={rawData.comparison}
                              fromDate={fromDate}
                              toDate={toDate}
                        />
                  </Tabs.Content>
            </Tabs.Root>
      );
}
