import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { useBestSelling, useCategoryPerf } from '@/lib/hooks';
import { BEST_SELLING_LIMIT, DONUT_COLORS, TOP_CHART_COUNT, MAX_DONUT_SEGMENTS } from './constants';
import type { SortKey, SortDir } from './types';

export function useProductsData() {
      const items = useBestSelling(BEST_SELLING_LIMIT);
      const cats = useCategoryPerf();

      const allItems = items.data ?? [];

      const totals = useMemo(() => {
            const totalRevenue = allItems.reduce((s, i) => s + Number(i.total_revenue), 0);
            const totalQty = allItems.reduce((s, i) => s + Number(i.total_qty_sold), 0);
            const totalProfit = allItems.reduce((s, i) => s + Number(i.gross_profit), 0);
            const avgMargin = allItems.length
                  ? allItems.reduce((s, i) => s + Number(i.margin_pct ?? 0), 0) / allItems.length
                  : 0;
            const maxRevenue = Math.max(...allItems.map((i) => Number(i.total_revenue)), 1);
            return { totalRevenue, totalQty, totalProfit, avgMargin, maxRevenue };
      }, [allItems]);

      const top10Chart = useMemo(
            () =>
                  allItems.slice(0, TOP_CHART_COUNT).map((i) => ({
                        label: i.item_name.length > 14 ? i.item_name.slice(0, 14) + '…' : i.item_name,
                        value: Number(i.total_revenue),
                  })),
            [allItems]
      );

      const catDonut = useMemo(
            () =>
                  (cats.data ?? []).slice(0, MAX_DONUT_SEGMENTS).map((c, i) => ({
                        label: c.category,
                        value: Number(c.total_revenue),
                        color: DONUT_COLORS[i % DONUT_COLORS.length],
                  })),
            [cats.data]
      );

      return {
            items,
            cats,
            allItems,
            totals,
            top10Chart,
            catDonut,
      };
}

export function useFilteredProducts(
      allItems: ReturnType<typeof useBestSelling>['data'],
      search: string,
      sortKey: SortKey,
      sortDir: SortDir
) {
      return useMemo(() => {
            const rows = (allItems ?? []).filter(
                  (i) =>
                        i.item_name.toLowerCase().includes(search.toLowerCase()) ||
                        (i.category ?? '').toLowerCase().includes(search.toLowerCase())
            );
            return [...rows].sort((a, b) => {
                  const va = Number((a as unknown as Record<string, unknown>)[sortKey] ?? 0);
                  const vb = Number((b as unknown as Record<string, unknown>)[sortKey] ?? 0);
                  return sortDir === 'desc' ? vb - va : va - vb;
            });
      }, [allItems, search, sortKey, sortDir]);
}


/**
 * Pulls everything for a single product from the views built on top of the POS data:
 *  - v_product_deep_dive        -> core KPIs, discount %, margin %, trend, peak week, #1 customer
 *  - v_product_top_customers    -> every customer who bought it, ranked by quantity
 *  - v_product_sales_{period}   -> time series for the trend chart/table, period is switchable
 *
 * Usage:
 *   const { pos_item_id } = useParams();
 *   const { product, topCustomers, salesTrend, granularity, setGranularity, loading, error, refetch } =
 *     useProductAnalytics(pos_item_id);
 */
const PERIOD_VIEWS = {
      daily: "v_product_sales_daily",
      weekly: "v_product_sales_weekly",
      biweekly: "v_product_sales_biweekly",
      monthly: "v_product_sales_monthly",
};

export default function useProductAnalytics(pos_item_id: number, initialGranularity: string = "weekly") {
      const [product, setProduct] = useState(null);
      const [topCustomers, setTopCustomers] = useState([]);
      const [salesTrend, setSalesTrend] = useState([]);
      const [granularity, setGranularity] = useState(initialGranularity);
      const [loading, setLoading] = useState(true);
      const [trendLoading, setTrendLoading] = useState(false);
      const [error, setError] = useState(null);

      const fetchCore = useCallback(async () => {
            if (!pos_item_id) return;
            setLoading(true);
            setError(null);
            try {
                  const [{ data: productRow, error: productErr }, { data: customers, error: custErr }] = await Promise.all([
                        supabase
                              .from("v_product_deep_dive")
                              .select("*")
                              .eq("pos_item_id", pos_item_id)
                              .maybeSingle(),

                        supabase
                              .from("v_product_top_customers")
                              .select("*")
                              .eq("pos_item_id", pos_item_id)
                              .order("qty_rank", { ascending: true }),
                  ]);

                  if (productErr) throw productErr;
                  if (custErr) throw custErr;

                  setProduct(productRow);
                  setTopCustomers(customers ?? []);
            } catch (err) {
                  setError(err);
            } finally {
                  setLoading(false);
            }
      }, [pos_item_id]);

      const fetchTrend = useCallback(async () => {
            if (!pos_item_id) return;
            setTrendLoading(true);
            try {
                  const view = PERIOD_VIEWS[granularity] ?? PERIOD_VIEWS.weekly;
                  const { data, error: trendErr } = await supabase
                        .from(view)
                        .select("*")
                        .eq("pos_item_id", pos_item_id)
                        .order("period_start", { ascending: true });

                  if (trendErr) throw trendErr;
                  setSalesTrend(data ?? []);
            } catch (err) {
                  setError(err);
            } finally {
                  setTrendLoading(false);
            }
      }, [pos_item_id, granularity]);

      useEffect(() => { fetchCore(); }, [fetchCore]);

      useEffect(() => { fetchTrend(); }, [fetchTrend]);

      const refetch = useCallback(() => {
            fetchCore();
            fetchTrend();
      }, [fetchCore, fetchTrend]);

      return {
            product,          // single row from v_product_deep_dive, or null
            topCustomers,     // array, ranked by qty_rank
            salesTrend,       // array of { period_start, quantity_sold, revenue, orders }
            granularity,      // "daily" | "weekly" | "biweekly" | "monthly"
            setGranularity,
            loading,          // true while product + top customers load
            trendLoading,     // true only while the trend re-fetches on granularity change
            error,
            refetch,
      };
}