import * as Tabs from '@radix-ui/react-tabs';
import { TopBar } from '@/components/ui';
import { Stats } from '@/components/ui/primitives';
import { AlertTriangle, Archive, PackageX, Truck } from 'lucide-react';
import { fmtCurrency, fmt } from '@/lib/utils';
import type { StatCardProps } from '@/components/ui/controls/primitives/types';
import { useInventoryData } from './hooks';
import { StockValueChart } from './components/StockValueChart';
import {
      DeadStockTable,
      SlowStockTable,
      ReorderAlertsTable,
      SupplierExposureTable,
} from './components/InventoryTables';

const TAB_TRIGGER_CLASS =
      'rounded-md px-4 py-1.5 text-xs text-ink-muted data-[state=active]:bg-accent-gold/15 data-[state=active]:text-accent-gold';

export default function InventoryPage() {
      const {
            deadStock,
            slowStock,
            lowStock,
            supplierStock,
            deadRows,
            slowRows,
            lowRows,
            supplierRows,
            totals,
            deadStockByCategory,
      } = useInventoryData();

      const kpis: StatCardProps[] = [
            {
                  label: 'Dead Stock (Cost)',
                  value: fmtCurrency(totals.deadCostValue),
                  sub: `${fmt(totals.deadItemCount)} items · ${fmtCurrency(totals.deadRetailValue)} at retail`,
                  icon: <PackageX size={14} />,
                  accent: 'red',
                  delay: 0,
            },
            {
                  label: 'Slow Stock (Cost)',
                  value: fmtCurrency(totals.slowCostValue),
                  sub: `${fmt(totals.slowItemCount)} items still moving, but slowly`,
                  icon: <Archive size={14} />,
                  accent: 'gold',
                  delay: 100,
            },
            {
                  label: 'Reorder Alerts',
                  value: fmt(totals.lowStockCount),
                  sub: 'Items at or below reorder level',
                  icon: <AlertTriangle size={14} />,
                  accent: 'teal',
                  delay: 200,
            },
            {
                  label: 'Owed to Suppliers',
                  value: fmtCurrency(totals.outstandingBalance),
                  sub: 'Outstanding balance across all suppliers',
                  icon: <Truck size={14} />,
                  accent: 'purple',
                  delay: 300,
            },
      ];

      const tabs: Array<{ value: string; label: string; count: number }> = [
            { value: 'dead', label: 'Dead Stock', count: totals.deadItemCount },
            { value: 'slow', label: 'Slow-Moving', count: totals.slowItemCount },
            { value: 'reorder', label: 'Reorder Alerts', count: totals.lowStockCount },
            { value: 'suppliers', label: 'Suppliers', count: supplierRows.length },
      ];

      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar
                        title="Inventory & Working Capital"
                        subtitle="Dead stock, slow stock, reorder alerts, and supplier exposure"
                  />
                  <main className="flex-1 space-y-6 pb-8">
                        <Stats stats={kpis} />

                        <div className="px-4">
                              <StockValueChart
                                    title="Dead Stock Cost Value by Category"
                                    data={deadStockByCategory}
                                    loading={deadStock.isLoading}
                                    emptyMessage="No dead stock to chart."
                              />
                        </div>

                        <div className="px-4">
                              <Tabs.Root defaultValue="dead">
                                    <Tabs.List className="flex w-fit gap-1 rounded-lg border border-bg-border bg-bg-panel p-1 mb-4 flex-wrap">
                                          {tabs.map((tab) => (
                                                <Tabs.Trigger key={tab.value} value={tab.value} className={TAB_TRIGGER_CLASS}>
                                                      {tab.label} <span className="text-ink-faint">({fmt(tab.count)})</span>
                                                </Tabs.Trigger>
                                          ))}
                                    </Tabs.List>

                                    <Tabs.Content value="dead">
                                          <DeadStockTable data={deadRows} loading={deadStock.isLoading} />
                                    </Tabs.Content>
                                    <Tabs.Content value="slow">
                                          <SlowStockTable data={slowRows} loading={slowStock.isLoading} />
                                    </Tabs.Content>
                                    <Tabs.Content value="reorder">
                                          <ReorderAlertsTable data={lowRows} loading={lowStock.isLoading} />
                                    </Tabs.Content>
                                    <Tabs.Content value="suppliers">
                                          <SupplierExposureTable data={supplierRows} loading={supplierStock.isLoading} />
                                    </Tabs.Content>
                              </Tabs.Root>
                        </div>
                  </main>
            </div>
      );
}
