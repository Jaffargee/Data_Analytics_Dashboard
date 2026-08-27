import { useTableQuery } from './use-supabase';
import type { SaleDetail, SaleItemDetail, SalePayment } from './types';

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
