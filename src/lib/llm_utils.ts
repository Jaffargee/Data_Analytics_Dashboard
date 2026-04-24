import { QueryResult } from "@/types"
import { supabase } from "./supabase"

export async function executeSQL(sql: string): Promise<QueryResult> {
      const start = performance.now()

      // Use Supabase's built-in query approach — runs against your DB directly
      const { data, error } = await supabase.rpc('execute_analytics_query', { query_sql: sql })

      if (error) {
            // Fallback: try to parse the SQL and use table/view API
            throw new Error(error.message)
      }

      const rows = (data as Record<string, unknown>[]) ?? []
      const columns = rows.length > 0 ? Object.keys(rows[0]) : []

      return {
            columns,
            rows,
            rowCount: rows.length,
            executionMs: Math.round(performance.now() - start),
      }
}

export const customer_product_query = (customer_id: number) => {
      return (`
      SELECT json_build_object(
            'summary', (
                  SELECT json_build_object(
                  'revenue', COALESCE(SUM(s.invoice_total), 0),
                  'profit', (
                              SELECT COALESCE(ROUND(SUM(si.total - (i.cost_price * si.quantity)), 2), 0)
                              FROM sale_items si
                              JOIN items i ON si.pos_item_id = i.pos_item_id
                              WHERE si.pos_sale_id IN (
                              SELECT pos_sale_id FROM sales WHERE pos_customer_id = ${customer_id}
                        )
                  ),
                  'total_orders', COUNT(*),
                  'avg_order_value', COALESCE(ROUND(AVG(s.invoice_total), 2), 0),
                  'total_items_bought', COALESCE(SUM(s.items_sold), 0),
                  'total_items_returned', COALESCE(SUM(s.items_returned), 0),
                  'last_visit', MAX(s.invoice_datetime),
                  'days_since_last_visit', DATE_PART('day', NOW() - MAX(s.invoice_datetime)),
                  'loyalty_score', ROUND(
                        CASE 
                        WHEN COUNT(*) = 0 THEN 0 
                        ELSE LEAST(100, (COUNT(*) * 5) + (COALESCE(SUM(s.invoice_total), 0) / 10000)) 
                        END, 2
                  )
                  )
                  FROM sales s
                  WHERE s.pos_customer_id = ${customer_id}
            ),
            'sales', (
                  SELECT json_agg(t ORDER BY t.invoice_datetime DESC)
                  FROM (
                        SELECT
                              s.pos_sale_id,
                              s.invoice_datetime,
                              s.customer_name,
                              s.salesperson,
                              s.invoice_total,
                              s.items_sold,
                              s.items_returned,
                              s.comment
                        FROM sales s
                        WHERE s.pos_customer_id = ${customer_id}
                  ) t
            )
      ) AS result;`.trim()     
)
}