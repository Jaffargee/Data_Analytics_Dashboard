import { useMemo } from 'react';
import { useWhatsappPosts, useItemsPicker, useAllSaleItemLines, useAllSaleDates } from '@/hooks/data';

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
      const posts = useWhatsappPosts();
      const items = useItemsPicker();
      const lines = useAllSaleItemLines();
      const dates = useAllSaleDates();

      const loading = posts.isLoading || items.isLoading || lines.isLoading || dates.isLoading;

      const correlations: PostCorrelation[] = useMemo(() => {
            const dateBySale = new Map<number, string>();
            for (const row of dates.data?.data ?? []) {
                  dateBySale.set(row.pos_sale_id, row.invoice_datetime);
            }

            const itemIdByUuid = new Map<string, number>();
            for (const item of items.data?.data ?? []) {
                  itemIdByUuid.set(item.id, item.pos_item_id);
            }

            const eventsByItem = new Map<number, DatedEvent[]>();
            for (const line of lines.data?.data ?? []) {
                  const iso = dateBySale.get(line.pos_sale_id);
                  if (!iso) continue;
                  const date = new Date(iso).getTime();
                  const existing = eventsByItem.get(line.pos_item_id) ?? [];
                  existing.push({ date, qty: Number(line.quantity), total: Number(line.total) });
                  eventsByItem.set(line.pos_item_id, existing);
            }

            const now = Date.now();

            return (posts.data?.data ?? []).map((post): PostCorrelation => {
                  const posItemId = itemIdByUuid.get(post.items_id) ?? null;
                  const postedAt = new Date(post.posted_at).getTime();
                  const daysSincePosted = Math.floor((now - postedAt) / (24 * 60 * 60 * 1000));

                  const events = posItemId !== null ? eventsByItem.get(posItemId) ?? [] : [];

                  const before = events.filter((e) => e.date >= postedAt - WINDOW_MS && e.date < postedAt);
                  const after = events.filter((e) => e.date >= postedAt && e.date <= postedAt + WINDOW_MS);

                  const unitsBefore = before.reduce((sum, e) => sum + e.qty, 0);
                  const unitsAfter = after.reduce((sum, e) => sum + e.qty, 0);
                  const revenueAfter = after.reduce((sum, e) => sum + e.total, 0);

                  const liftPct = unitsBefore > 0 ? ((unitsAfter - unitsBefore) / unitsBefore) * 100 : null;

                  const afterPostSorted = events
                        .filter((e) => e.date >= postedAt)
                        .sort((a, b) => a.date - b.date);
                  const firstSale = afterPostSorted[0];
                  const hoursToFirstSale = firstSale ? (firstSale.date - postedAt) / (60 * 60 * 1000) : null;

                  return {
                        id: post.id,
                        item_name: post.item_name,
                        media_type: post.media_type,
                        posted_at: post.posted_at,
                        pos_item_id: posItemId,
                        days_since_posted: daysSincePosted,
                        units_before_7d: unitsBefore,
                        units_after_7d: unitsAfter,
                        revenue_after_7d: revenueAfter,
                        lift_pct: liftPct,
                        first_sale_after: firstSale ? new Date(firstSale.date).toISOString() : null,
                        hours_to_first_sale: hoursToFirstSale,
                  };
            });
      }, [posts.data, items.data, lines.data, dates.data]);

      const summary = useMemo(() => {
            const withSale = correlations.filter((c) => c.first_sale_after !== null);
            const withLift = correlations.filter((c) => c.lift_pct !== null);
            const avgHoursToSale =
                  withSale.length > 0
                        ? withSale.reduce((sum, c) => sum + (c.hours_to_first_sale ?? 0), 0) / withSale.length
                        : null;
            const avgLift =
                  withLift.length > 0
                        ? withLift.reduce((sum, c) => sum + (c.lift_pct ?? 0), 0) / withLift.length
                        : null;
            return {
                  totalPosts: correlations.length,
                  postsWithSale: withSale.length,
                  conversionRate: correlations.length > 0 ? (withSale.length / correlations.length) * 100 : 0,
                  avgHoursToSale,
                  avgLift,
            };
      }, [correlations]);

      return { correlations, summary, loading };
}
