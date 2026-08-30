import { useMemo } from 'react';
import { useWhatsappPosts, useItemsPicker, useAllSaleItemLines, useAllSaleDates, useWhatsappPostsCorelation } from '@/hooks/data';

const WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7-day before/after window

export interface PostCorrelation {
      id: string;
      item_name: string;
      media_type: string;
      posted_at: string;
      pos_item_id: number | null;
      days_since_posted: number;
      units_before_7d: number;
      units_after_7d: number;
      revenue_after_7d: number;
      lift_pct: number | null;
      first_sale_after: string | null;
      hours_to_first_sale: number | null;
}

interface DatedEvent {
      date: number; // epoch ms
      qty: number;
      total: number;
}

export function usePostCorrelation() {

      const correlations_data = useWhatsappPostsCorelation();

      const loading = correlations_data.isLoading;
      const correlations = correlations_data.data?.data ?? []
      
      const summary = useMemo(() => {
            const withSale = correlations.filter((c) => c.first_sale_at !== null && c.sales_count > 0);

            const totalPosts = correlations.length;
            const postsWithSale = withSale.length;
            const conversionRate = totalPosts > 0 ? (postsWithSale / totalPosts) * 100 : 0;

            const avgDaysToFirstSale =
                  withSale.length > 0
                        ? withSale.reduce((sum, c) => sum + (c.days_to_first_sale ?? 0), 0) / withSale.length
                        : null;

            const totalUnitsSold = correlations.reduce((sum, c) => sum + (c.units_sold ?? 0), 0);
            const totalRevenue = correlations.reduce((sum, c) => sum + (c.sales_revenue ?? 0), 0);
            const totalGrossProfit = correlations.reduce((sum, c) => sum + (c.gross_profit ?? 0), 0);
            const totalSalesCount = correlations.reduce((sum, c) => sum + (c.sales_count ?? 0), 0);

            return {
                  totalPosts,
                  postsWithSale,
                  conversionRate,
                  avgDaysToFirstSale,
                  totalUnitsSold,
                  totalRevenue,
                  totalGrossProfit,
                  totalSalesCount,
            };
      }, [correlations]);

      return { correlations, summary, loading };
}
