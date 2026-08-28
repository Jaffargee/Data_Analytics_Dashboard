import { useRpcQuery } from '@/hooks/data/use-supabase';
import type { PeriodComparisonRow, PeriodDowRow, PeriodTopProductRow, PeriodTopCustomerRow } from '@/hooks/data/types';

export function usePeriodComparison(p1From: string, p1To: string, p2From: string, p2To: string) {
      return useRpcQuery<PeriodComparisonRow>(
            'fn_period_comparison',
            { args: { p1_from: p1From, p1_to: p1To, p2_from: p2From, p2_to: p2To } }
      );
}

export function usePeriodRevenueByDow(fromDate: string, toDate: string) {
      return useRpcQuery<PeriodDowRow>(
            'fn_period_revenue_by_dow',
            { args: { from_date: fromDate, to_date: toDate } }
      );
}

export function usePeriodTopProducts(fromDate: string, toDate: string, topN = 25) {
      return useRpcQuery<PeriodTopProductRow>(
            'fn_period_top_products',
            { args: { from_date: fromDate, to_date: toDate, top_n: topN } }
      );
}

export function usePeriodTopCustomers(fromDate: string, toDate: string, topN = 15) {
      return useRpcQuery<PeriodTopCustomerRow>(
            'fn_period_top_customers',
            { args: { from_date: fromDate, to_date: toDate, top_n: topN } }
      );
}
