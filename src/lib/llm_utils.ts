export { executeSQL, queryLLM, buildCustomerProductQuery } from './services/llm';

/** SQL used by the customer profile sales drill-down. */
export const customer_product_query = (customerId: number) => `
  SELECT json_build_object(
    'summary', (SELECT json_build_object('revenue', COALESCE(SUM(invoice_total), 0), 'total_orders', COUNT(*), 'avg_order_value', COALESCE(ROUND(AVG(invoice_total), 2), 0), 'total_items_bought', COALESCE(SUM(items_sold), 0), 'total_items_returned', COALESCE(SUM(items_returned), 0), 'last_visit', MAX(invoice_datetime)) FROM sales WHERE pos_customer_id = ${customerId}),
    'sales', (SELECT json_agg(t ORDER BY t.invoice_datetime DESC) FROM (SELECT pos_sale_id, pos_customer_id, invoice_datetime, customer_name, salesperson, invoice_total, items_sold, items_returned, comment FROM sales WHERE pos_customer_id = ${customerId}) t)
  ) AS result;
`.trim();
