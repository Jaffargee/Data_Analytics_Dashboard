export interface CartLine {
      pos_item_id: number;
      item_name: string;
      unit_price: number;
      quantity: number;
      discount_pct: number;
      stock_available: number;
}

export interface PaymentLine {
      id: string;
      account: string;
      amount: number;
}

export interface CheckoutCustomer {
      pos_customer_id: number | null;
      customer_name: string | null;
      customer_phone: string | null;
      is_anonymous: boolean;
}
