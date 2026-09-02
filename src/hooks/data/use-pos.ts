import { useTableQuery } from './use-supabase';
import type { PosItemRow, PaymentAccountRow } from './types';

// Sellable items for the POS product grid. Excludes inactive items;
// dead/slow stock is still included (it's still sellable, just slow) —
// the grid can filter/badge on stock_lifecycle_status if useful.
export function usePosItems(limit = 1000) {
      return useTableQuery<PosItemRow>('items', {
            limit,
            columns:
                  'pos_item_id, item_name, category, selling_price, promo_price, promo_start_date, promo_end_date, quantity, inactive, stock_lifecycle_status',
            eq: { inactive: false },
            order: { column: 'item_name', ascending: true },
      });
}

export function usePaymentAccounts() {
      return useTableQuery<PaymentAccountRow>('accounts', {
            order: { column: 'name', ascending: true },
      });
}
