import { useViewQuery, useTableQuery } from "./use-supabase";
import type { Customer, TopCustomer, SalesBySalesperson } from "./types"

export function useCustomers(limit = 300) {
      return useTableQuery<Customer>('customers', { limit })
}

export function useTopCustomers(limit: number = 300) {
      return useViewQuery<TopCustomer>('v_top_customers', { limit });
}

export function useSalesperson() {
      return useViewQuery<SalesBySalesperson>('v_sales_by_salesperson');
}