import { useMemo } from 'react';
import {
      useDeadStockReport,
      useSlowMovingStock,
      useLowStock,
      useSupplierStock,
} from '@/hooks/data';
import { CHART_COLORS } from '@/lib/constants/colors';

export interface CategoryValuePoint {
      label: string;
      value: number;
      color: string;
}

export interface InventoryTotals {
      deadCostValue: number;
      deadRetailValue: number;
      deadItemCount: number;
      slowCostValue: number;
      slowItemCount: number;
      lowStockCount: number;
      outstandingBalance: number;
}

const PALETTE: readonly string[] = Object.values(CHART_COLORS);

export function useInventoryData() {
      const deadStock = useDeadStockReport();
      const slowStock = useSlowMovingStock();
      const lowStock = useLowStock();
      const supplierStock = useSupplierStock();

      const deadRows = deadStock.data?.data ?? [];
      const slowRows = slowStock.data?.data ?? [];
      const lowRows = lowStock.data?.data ?? [];
      const supplierRows = supplierStock.data?.data ?? [];

      const totals: InventoryTotals = useMemo(() => {
            const deadCostValue = deadRows.reduce(
                  (sum, row) => sum + Number(row.dead_stock_cost_value),
                  0
            );
            const deadRetailValue = deadRows.reduce(
                  (sum, row) => sum + Number(row.dead_stock_retail_value),
                  0
            );
            const slowCostValue = slowRows.reduce(
                  (sum, row) => sum + Number(row.slow_stock_cost_value),
                  0
            );
            const outstandingBalance = supplierRows.reduce(
                  (sum, row) => sum + Number(row.outstanding_balance),
                  0
            );
            return {
                  deadCostValue,
                  deadRetailValue,
                  deadItemCount: deadRows.length,
                  slowCostValue,
                  slowItemCount: slowRows.length,
                  lowStockCount: lowRows.length,
                  outstandingBalance,
            };
      }, [deadRows, slowRows, lowRows, supplierRows]);

      const deadStockByCategory: CategoryValuePoint[] = useMemo(() => {
            const byCategory = new Map<string, number>();
            for (const row of deadRows) {
                  const key = row.category ?? 'Uncategorized';
                  const current = byCategory.get(key) ?? 0;
                  byCategory.set(key, current + Number(row.dead_stock_cost_value));
            }
            return Array.from(byCategory.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([label, value], index) => ({
                        label,
                        value,
                        color: PALETTE[index % PALETTE.length],
                  }));
      }, [deadRows]);

      return {
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
      };
}
