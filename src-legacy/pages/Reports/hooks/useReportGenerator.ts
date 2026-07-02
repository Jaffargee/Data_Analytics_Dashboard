import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
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
import { PERIOD1_DEFAULT } from '../constants';

interface UseReportGeneratorReturn {
      loading: boolean;
      generated: boolean;
      summary: PeriodSummary[];
      dowData: RevenueByDow[];
      catData: RevenueByCategory[];
      products: TopProduct[];
      prices: PriceSensitivity[];
      timingData: TimeIntelligence[];
      customers: TopCustomer[];
      daily: DailyBreakdown[];
      comparison: Comparison[];
      generateReport: (fromDate: string, toDate: string) => Promise<void>;
}

export function useReportGenerator(): UseReportGeneratorReturn {
      const [loading, setLoading] = useState(false);
      const [generated, setGenerated] = useState(false);
      const [summary, setSummary] = useState<PeriodSummary[]>([]);
      const [dowData, setDowData] = useState<RevenueByDow[]>([]);
      const [catData, setCatData] = useState<RevenueByCategory[]>([]);
      const [products, setProducts] = useState<TopProduct[]>([]);
      const [prices, setPrices] = useState<PriceSensitivity[]>([]);
      const [timingData, setTimingData] = useState<TimeIntelligence[]>([]);
      const [customers, setCustomers] = useState<TopCustomer[]>([]);
      const [daily, setDaily] = useState<DailyBreakdown[]>([]);
      const [comparison, setComparison] = useState<Comparison[]>([]);

      const generateReport = useCallback(
            async (fromDate: string, toDate: string) => {
                  setLoading(true);
                  try {
                        const [s, d, c, p, pr, t, cu, da, co] =
                              await Promise.all([
                                    supabase.rpc(
                                          'fn_period_executive_summary',
                                          {
                                                from_date: fromDate,
                                                to_date: toDate,
                                          }
                                    ),
                                    supabase.rpc('fn_period_revenue_by_dow', {
                                          from_date: fromDate,
                                          to_date: toDate,
                                    }),
                                    supabase.rpc(
                                          'fn_period_revenue_by_category',
                                          {
                                                from_date: fromDate,
                                                to_date: toDate,
                                          }
                                    ),
                                    supabase.rpc('fn_period_top_products', {
                                          from_date: fromDate,
                                          to_date: toDate,
                                          top_n: 25,
                                    }),
                                    supabase.rpc(
                                          'fn_period_price_sensitivity',
                                          {
                                                from_date: fromDate,
                                                to_date: toDate,
                                          }
                                    ),
                                    supabase.rpc(
                                          'fn_period_time_intelligence',
                                          {
                                                from_date: fromDate,
                                                to_date: toDate,
                                          }
                                    ),
                                    supabase.rpc('fn_period_top_customers', {
                                          from_date: fromDate,
                                          to_date: toDate,
                                          top_n: 15,
                                    }),
                                    supabase.rpc('fn_period_daily_breakdown', {
                                          from_date: fromDate,
                                          to_date: toDate,
                                    }),
                                    supabase.rpc('fn_period_comparison', {
                                          p1_from: PERIOD1_DEFAULT.from,
                                          p1_to: PERIOD1_DEFAULT.to,
                                          p2_from: fromDate,
                                          p2_to: toDate,
                                    }),
                              ]);
                        setSummary(s.data ?? []);
                        setDowData(d.data ?? []);
                        setCatData(c.data ?? []);
                        setProducts(p.data ?? []);
                        setPrices(pr.data ?? []);
                        setTimingData(t.data ?? []);
                        setCustomers(cu.data ?? []);
                        setDaily(da.data ?? []);
                        setComparison(co.data ?? []);
                        setGenerated(true);
                  } finally {
                        setLoading(false);
                  }
            },
            []
      );

      return {
            loading,
            generated,
            summary,
            dowData,
            catData,
            products,
            prices,
            timingData,
            customers,
            daily,
            comparison,
            generateReport,
      };
}
