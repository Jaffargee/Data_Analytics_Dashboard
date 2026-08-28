import { useTableQuery } from './use-supabase';
import type { SaleDetail, SaleItemDetail, SalePayment, SaleItemLine, SaleHeaderDate } from './types';

export function useSaleDetail(posSaleId: number | undefined) {
      return useTableQuery<SaleDetail>(
            'sales',
            { eq: { pos_sale_id: posSaleId ?? -1 }, limit: 1 },
            { enabled: posSaleId !== undefined }
      );
}

export function useSaleItemsDetail(posSaleId: number | undefined) {
      return useTableQuery<SaleItemDetail>(
            'sale_items',
            { eq: { pos_sale_id: posSaleId ?? -1 }, limit: 500 },
            { enabled: posSaleId !== undefined }
      );
}

export function useSalePayments(posSaleId: number | undefined) {
      return useTableQuery<SalePayment>(
            'payments',
            { eq: { pos_sale_id: posSaleId ?? -1 }, limit: 20 },
            { enabled: posSaleId !== undefined }
      );
}

// All sale line items (item + qty + total + which sale), unfiltered — used to build
// a per-item sales timeline client-side (e.g. for WhatsApp-post-to-sale correlation).
export function useAllSaleItemLines(limit = 8000) {
      return useTableQuery<SaleItemLine>('sale_items', {
            limit,
            columns: 'pos_item_id, quantity, total, pos_sale_id',
      });
}

// All sale headers, date only — paired with useAllSaleItemLines to date-stamp each line.
export function useAllSaleDates(limit = 8000) {
      return useTableQuery<SaleHeaderDate>('sales', {
            limit,
            columns: 'pos_sale_id, invoice_datetime',
      });
}
