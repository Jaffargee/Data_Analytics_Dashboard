import { useViewQuery } from './use-supabase';
import type { RevenueSummaryRow, TimeOfDayRow } from './types';

export function useRevenueSummary(limit = 400) {
      return useViewQuery<RevenueSummaryRow>('v_revenue_summary', {
            limit,
            order: { column: 'period_day', ascending: false },
      });
}

export function useTimeOfDay() {
      return useViewQuery<TimeOfDayRow>('v_time_of_day_intelligence', {
            order: { column: 'sort_order', ascending: true },
      });
}
