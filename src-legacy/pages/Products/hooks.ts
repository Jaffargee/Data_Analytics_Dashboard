import { useMemo } from 'react';
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