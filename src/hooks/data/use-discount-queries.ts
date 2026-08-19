import { DiscountByCustomerRow, DiscountByItemRow, DiscountTrendRow } from "./types";
import { useViewQuery } from "./use-supabase";

// Discount Trend
export function useDiscountTrend() {
      return useViewQuery<DiscountTrendRow>('v_discount_trend_weekly')
}

// Discount By Item
export function useDiscountByItem() {
      return useViewQuery<DiscountByItemRow>('v_discount_by_item')
}

// Discount By Customer
export function useDiscountByCustomer() {
      return useViewQuery<DiscountByCustomerRow>('v_discount_by_customer')
}