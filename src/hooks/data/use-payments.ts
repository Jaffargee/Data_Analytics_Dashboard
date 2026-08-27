import { useTableQuery } from './use-supabase';
import type { PaymentRow } from './types';

// Raw payments rows (account + amount only). There is no dedicated
// "revenue by payment method" view yet, so pages aggregate this
// client-side — see src/pages/Revenue/hooks.ts:usePaymentBreakdown.
export function usePayments(limit = 5000) {
      return useTableQuery<PaymentRow>('payments', {
            limit,
            columns: 'account, amount',
      });
}
