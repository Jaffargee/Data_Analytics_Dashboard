import { useViewQuery } from './use-supabase';
import type {
      CustomerDirectoryRow,
      CustomerProfitRow,
      CustomerCategorySummaryRow,
      CustomerAtRiskRow,
      CustomerIntelligenceRow,
} from './types';

export function useCustomerDirectory(limit = 20, offset = 0) {
      return useViewQuery<CustomerDirectoryRow>('customer_directory', {
            limit,
            offset,
            order: { column: 'total_spent', ascending: false },
      });
}

// Searches the *entire* customer_directory server-side by name — used as the
// remote fallback when a search finds nothing in the currently-loaded page.
export function useCustomerDirectorySearch(query: string, enabled: boolean) {
      return useViewQuery<CustomerDirectoryRow>(
            'customer_directory',
            {
                  limit: 50,
                  order: { column: 'total_spent', ascending: false },
                  filters: [{ column: 'display_name', operator: 'ilike', value: `%${query}%` }],
            },
            { enabled: enabled && query.trim().length > 0 }
      );
}

export function useCustomerProfit(limit = 500) {
      return useViewQuery<CustomerProfitRow>('customer_profit', { limit });
}

export function useCustomerCategorySummary() {
      return useViewQuery<CustomerCategorySummaryRow>('customer_category_summary', {
            order: { column: 'total_revenue', ascending: false },
      });
}

export function useCustomersAtRisk(limit = 20, offset = 0) {
      return useViewQuery<CustomerAtRiskRow>('customers_at_risk', {
            limit,
            offset,
            order: { column: 'lifetime_value', ascending: false },
      });
}

export function useCustomerIntelligence(limit = 20, offset = 0) {
      return useViewQuery<CustomerIntelligenceRow>('v_customer_intelligence', {
            limit,
            offset,
            order: { column: 'lifetime_value', ascending: false },
      });
}
