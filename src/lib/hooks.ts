import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type {
  RevenueDaily, RevenueMonthly, BestSellingItem, TopCustomer,
  LowStockItem, SalesBySalesperson, SupplierStockValue,
  CategoryPerformance, DailySnapshot,
} from "./supabase";

type FetchState<T> = { data: T | null; loading: boolean; error: string | null };

function useView<T>(view: string, limit = 100): FetchState<T[]> {
  const [state, setState] = useState<FetchState<T[]>>({ data: null, loading: true, error: null });
  useEffect(() => {
    supabase.from(view).select("*").limit(limit).then(({ data, error }) => {
      setState({ data: (data as T[]) ?? [], loading: false, error: error?.message ?? null });
    });
  }, [view, limit]);
  return state;
}

function useRpc<T>(fn: string, params: Record<string, unknown>): FetchState<T[]> {
  const [state, setState] = useState<FetchState<T[]>>({ data: null, loading: true, error: null });
  const key = JSON.stringify(params);
  useEffect(() => {
    supabase.rpc(fn, params).then(({ data, error }) => {
      setState({ data: (data as T[]) ?? [], loading: false, error: error?.message ?? null });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, key]);
  return state;
}

export const useRevenueDaily    = (limit = 30) => useView<RevenueDaily>("v_revenue_daily", limit);
export const useRevenueMonthly  = ()           => useView<RevenueMonthly>("v_revenue_monthly");
export const useBestSelling     = (n = 20)     => useView<BestSellingItem>("v_best_selling_items", n);
export const useTopCustomers    = (n = 20)     => useView<TopCustomer>("v_top_customers", n);
export const useLowStock        = ()           => useView<LowStockItem>("v_low_stock_items");
export const useSalesperson     = ()           => useView<SalesBySalesperson>("v_sales_by_salesperson");
export const useSupplierStock   = ()           => useView<SupplierStockValue>("v_supplier_stock_value");
export const useCategoryPerf    = ()           => useView<CategoryPerformance>("v_category_performance");

export const useDailySnapshot = (date: string) =>
  useRpc<DailySnapshot>("fn_daily_snapshot", { target_date: date });

export const useRevenueRange = (from: string, to: string) =>
  useRpc<RevenueDaily>("fn_revenue_range", { from_date: from, to_date: to });
