import { useRpcQuery } from '@/hooks/data/use-supabase';
import type { PeriodComparisonRow } from '@/hooks/data/types';

export function usePeriodComparison(p1From: string, p1To: string, p2From: string, p2To: string) {
      return useRpcQuery<PeriodComparisonRow>(
            'fn_period_comparison',
            { args: { p1_from: p1From, p1_to: p1To, p2_from: p2From, p2_to: p2To } }
      );
}
