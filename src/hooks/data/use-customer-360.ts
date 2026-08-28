import { useViewQuery } from './use-supabase';
import type {
      CustomerDirectoryRow,
      CustomerProfitRow,
      CustomerCategorySummaryRow,
      CustomerAtRiskRow,
      CustomerIntelligenceRow,
} from './types';

export function useCustomerDirectory(limit = 500) {
      return useViewQuery<CustomerDirectoryRow>('customer_directory', {
            limit,
            order: { column: 'lifetime_value', ascending: false },
      });
}

export function useCustomerProfit(limit = 500) {
      return useViewQuery<CustomerProfitRow>('customer_profit', { limit });
}

export function useCustomerCategorySummary() {
      return useViewQuery<CustomerCategorySummaryRow>('customer_category_summary', {
            order: { column: 'total_revenue', ascending: false },
      });
}

export function useCustomersAtRisk(limit = 200) {
      return useViewQuery<CustomerAtRiskRow>('customers_at_risk', {
            limit,
            order: { column: 'lifetime_value', ascending: false },
      });
}

export function useCustomerIntelligence(limit = 500) {
      return useViewQuery<CustomerIntelligenceRow>('v_customer_intelligence', {
            limit,
            order: { column: 'lifetime_value', ascending: false },
      });
}
