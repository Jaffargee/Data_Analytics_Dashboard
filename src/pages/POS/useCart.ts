import { useMemo, useState } from 'react';
import type { CartLine } from './types';
import type { PosItemRow } from '@/hooks/data';

function activePrice(item: PosItemRow): number {
      if (!item.promo_price) return Number(item.selling_price);
      const today = new Date().toISOString().slice(0, 10);
      const startsOk = !item.promo_start_date || item.promo_start_date <= today;
      const endsOk = !item.promo_end_date || item.promo_end_date >= today;
      return startsOk && endsOk ? Number(item.promo_price) : Number(item.selling_price);
}

export function useCart() {
      const [lines, setLines] = useState<CartLine[]>([]);

      const addItem = (item: PosItemRow) => {
            setLines((prev) => {
                  const existing = prev.find((l) => l.pos_item_id === item.pos_item_id);
                  if (existing) {
                        return prev.map((l) =>
                              l.pos_item_id === item.pos_item_id ? { ...l, quantity: l.quantity + 1 } : l
                        );
                  }
                  return [
                        ...prev,
                        {
                              pos_item_id: item.pos_item_id,
                              item_name: item.item_name,
                              unit_price: activePrice(item),
                              quantity: 1,
                              discount_pct: 0,
                              stock_available: Number(item.quantity),
                        },
                  ];
            });
      };

      const updateQuantity = (posItemId: number, quantity: number) => {
            if (quantity <= 0) {
                  removeItem(posItemId);
                  return;
            }
            setLines((prev) => prev.map((l) => (l.pos_item_id === posItemId ? { ...l, quantity } : l)));
      };

      const updateDiscount = (posItemId: number, discountPct: number) => {
            const clamped = Math.max(0, Math.min(100, discountPct));
            setLines((prev) => prev.map((l) => (l.pos_item_id === posItemId ? { ...l, discount_pct: clamped } : l)));
      };

      const removeItem = (posItemId: number) => {
            setLines((prev) => prev.filter((l) => l.pos_item_id !== posItemId));
      };

      const clear = () => setLines([]);

      const lineTotal = (line: CartLine) =>
            Math.round(line.quantity * line.unit_price * (1 - line.discount_pct / 100) * 100) / 100;

      const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0), [lines]);
      const discountTotal = useMemo(
            () => lines.reduce((sum, l) => sum + l.quantity * l.unit_price * (l.discount_pct / 100), 0),
            [lines]
      );
      const total = useMemo(() => lines.reduce((sum, l) => sum + lineTotal(l), 0), [lines]);
      const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);

      return {
            lines,
            addItem,
            updateQuantity,
            updateDiscount,
            removeItem,
            clear,
            lineTotal,
            subtotal,
            discountTotal,
            total,
            itemCount,
      };
}

export type UseCartResult = ReturnType<typeof useCart>;
