// src/hooks/data/use-revenue-queries.ts
import { useViewQuery, useRpcQuery } from './use-supabase';
import type { RevenueDaily, RevenueMonthly, DailySnapshot, RevenueWeekRow, RevenueAnomalyRow } from './types';

/**
 * Fetch daily revenue with smart caching
 */
export function useRevenueDaily(limit = 300) {
      return useViewQuery<RevenueDaily>(
            'v_revenue_daily',
            { limit, order: { column: 'sale_date', ascending: false } },
            {
                  staleTime: 10 * 60 * 1000,  // 10 minutes for daily data
            }
      );
}

/**
 * Fetch monthly revenue
 */
export function useRevenueMonthly() {
      return useViewQuery<RevenueMonthly>(
            'v_revenue_monthly',
            { order: { column: 'month', ascending: false } }
      );
}

/**
 * Fetch revenue for a date range
 */
export function useRevenueRange(fromDate: string, toDate: string) {
      return useRpcQuery<RevenueDaily>(
            'fn_revenue_range',
            { args: { from_date: fromDate, to_date: toDate } }
      );
}

/**
 * Fetch daily snapshot (KPIs)
 */
export function useDailySnapshot(date: string) {
      return useRpcQuery<DailySnapshot>(
            'fn_daily_snapshot',
            { args: { target_date: date } }
      );
}

// Fetch Weekly Revenue
export function useRevenueWeekly() {
      return useViewQuery<RevenueWeekRow>('v_revenue_weekly')
}

// RevenueAnomaly
export function useRevenueAnomarly() {
      return useViewQuery<RevenueAnomalyRow>('v_revenue_anomaly_daily');
}