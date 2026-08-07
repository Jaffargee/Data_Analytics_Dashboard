import { useViewQuery, useTableQuery } from "./use-supabase";
import type { Customer, TopCustomer, SalesBySalesperson } from "./types"

export async function useCustomers(limit = 300) {
      return useTableQuery<Customer>('customers', { limit })
}

export async function useTopCustomers() {
      return useViewQuery<TopCustomer>('v_top_customers');
}

export function useSalesperson() {
      return useViewQuery<SalesBySalesperson>('v_sales_by_salesperson');
}