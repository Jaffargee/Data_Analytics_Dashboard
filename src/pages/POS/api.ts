import type { CartLine, PaymentLine, CheckoutCustomer } from './types';

// Defaults to the FastAPI backend's local dev port. Set VITE_SALES_API_URL
// in your .env once this is deployed somewhere other than localhost.
const SALES_API_URL = (import.meta.env.VITE_SALES_API_URL as string | undefined) ?? 'http://localhost:8000';

export interface SaleResponse {
      pos_sale_id: string;
      invoice_total: number;
      amount_tendered: number;
      change_due: number;
      status: string;
      is_stub: boolean;
      pos4africa_reference: string | null;
      message: string | null;
}

export class CheckoutError extends Error {}

export async function submitSale(
      customer: CheckoutCustomer,
      salesperson: string | null,
      lines: CartLine[],
      payments: PaymentLine[],
      comment: string | null
): Promise<SaleResponse> {
      const payload = {
            pos_customer_id: customer.pos_customer_id,
            customer_name: customer.customer_name,
            customer_phone: customer.customer_phone,
            is_anonymous_customer: customer.is_anonymous,
            salesperson,
            items: lines.map((line) => ({
                  pos_item_id: line.pos_item_id,
                  item_name: line.item_name,
                  quantity: line.quantity,
                  unit_price: line.unit_price,
                  discount_pct: line.discount_pct,
            })),
            payments: payments.map((payment) => ({ account: payment.account, amount: payment.amount })),
            comment,
      };

      let response: Response;
      try {
            response = await fetch(`${SALES_API_URL}/api/sales`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
            });
      } catch {
            throw new CheckoutError(
                  `Couldn't reach the sales backend at ${SALES_API_URL}. Is it running? (cd backend && uvicorn app.main:app --reload)`
            );
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
            const detail = data?.detail ?? `Request failed with status ${response.status}.`;
            throw new CheckoutError(typeof detail === 'string' ? detail : JSON.stringify(detail));
      }

      return data as SaleResponse;
}
