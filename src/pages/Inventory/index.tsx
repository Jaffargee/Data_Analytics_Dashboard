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

      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar
                        title="Inventory & Working Capital"
                        subtitle="Dead stock, slow stock, reorder alerts, and supplier exposure"
                  />
                  <main className="flex-1 space-y-8 pb-8">
                        <Stats stats={kpis} />

                        <div className="px-4">
                              <StockValueChart
                                    title="Dead Stock Cost Value by Category"
                                    data={deadStockByCategory}
                                    loading={deadStock.isLoading}
                                    emptyMessage="No dead stock to chart."
                              />
                        </div>

                        <DeadStockTable data={deadRows} loading={deadStock.isLoading} />
                        <SlowStockTable data={slowRows} loading={slowStock.isLoading} />
                        <ReorderAlertsTable data={lowRows} loading={lowStock.isLoading} />
                        <SupplierExposureTable data={supplierRows} loading={supplierStock.isLoading} />
                  </main>
            </div>
      );
}
