import { useViewQuery } from './use-supabase';
import type { ProductPeakPeriodRow, CategoryBestDayRow, ProductPerformanceRow } from './types';

export function useProductPeakPeriod(limit = 500) {
      return useViewQuery<ProductPeakPeriodRow>('v_product_peak_period', {
            limit,
            order: { column: 'peak_week_revenue', ascending: false },
      });
}

export function useCategoryBestDay() {
      return useViewQuery<CategoryBestDayRow>('v_category_best_day', {
            order: { column: 'revenue_on_best_day', ascending: false },
      });
}

export function useProductPerformance(limit = 500) {
      return useViewQuery<ProductPerformanceRow>('v_product_performance', {
            limit,
            order: { column: 'total_revenue', ascending: false },
      });
}
