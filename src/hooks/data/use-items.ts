// src/hooks/data/use-products-queries.ts
import { useViewQuery } from './use-supabase';
import type {
      BestSellingItem,
      LowStockItem,
      CategoryPerformance,
      SupplierStockValue,
      DeadStockReportRow,
      SlowMovingStockRow,
} from './types';

export function useBestSelling(limit = 200) {
      return useViewQuery<BestSellingItem>(
            'v_best_selling_items',
            { limit, order: { column: 'total_revenue', ascending: false } }
      );
}

export function useLowStock() {
      return useViewQuery<LowStockItem>('v_low_stock_items', {
            limit: 500,
            order: { column: 'stock_qty', ascending: true },
      });
}

export function useCategoryPerf() {
      return useViewQuery<CategoryPerformance>(
            'v_category_performance',
            { order: { column: 'total_revenue', ascending: false } }
      );
}

export function useSupplierStock() {
      return useViewQuery<SupplierStockValue>(
            'v_supplier_stock_value',
            { order: { column: 'outstanding_balance', ascending: false } }
      );
}

// Dead Stock Report — cost/retail capital tied up in DEAD items
export function useDeadStockReport() {
      return useViewQuery<DeadStockReportRow>('v_dead_stock_report', {
            limit: 500,
            order: { column: 'dead_stock_cost_value', ascending: false },
      });
}

// Slow Moving Stock — cost capital tied up in SLOW items
export function useSlowMovingStock() {
      return useViewQuery<SlowMovingStockRow>('v_slow_moving_stock', {
            limit: 500,
            order: { column: 'slow_stock_cost_value', ascending: false },
      });
}