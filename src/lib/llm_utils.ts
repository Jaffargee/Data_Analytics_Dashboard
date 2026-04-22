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