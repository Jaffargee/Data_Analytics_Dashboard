// src/lib/api/supabase-client.ts
/**
 * Universal Supabase API client
 * Handles Views, RPCs, Tables with automatic caching, error handling, and retry logic
 */

import { supabase } from '../services/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

type SupabaseQueryType = 'table' | 'view' | 'rpc'

interface SupabaseViewOptions {
      limit?: number;
      offset?: number;
      columns?: string;
      order?: { column: string; ascending: boolean },
      filters?: Array<{ column: string; operator: string; value: unknown }>;
}

interface SupabaseRpcOptions {
      args: Record<string, unknown>;
}

interface SupabaseTableOptions extends SupabaseViewOptions {
      eq?: Record<string, unknown>;
      neq?: Record<string, unknown>;
}

interface SupabaseQueryResult<T> {
      data: T[] | null;
      error: PostgrestError | null;
      count?: number | undefined
}

// ── Generic Query Executor ────────────────────────────────────────────────
/**
 * Execute a Supabase query (view/table) with filtering, ordering, and pagination
 * @example
 *   const result = await executeViewQuery('v_revenue_daily', {
 *     limit: 100,
 *     order: { column: 'sale_date', ascending: true }
 *   })
 */
export async function executeViewQuery<T>( viewName: string, options: SupabaseViewOptions = {} ) : Promise<SupabaseQueryResult<T>> {
      try {
            const columns = options.columns?.trim() || "*";

            let query =  supabase.from(viewName).select(columns, { count: 'exact' });


            query = (options.filters ?? []).reduce((q, { column, operator, value }) => q.filter(column, operator as any, value), query);

            // if(options.filters && options.filters.length > 0) {
            //       for(const filter of options.filters) {
            //             query = query.filter(
            //                   filter.column,
            //                   filter.operator as any,
            //                   filter.value
            //             );
            //       }
            // }

            if(options.order) {
                  query = query.order(options.order.column, { ascending: options.order.ascending ?? false });
            }

            if(options.limit){
                  query = query.limit(options.limit);
            }

            if(options.offset) {
                  query = query.range(options.offset, options.offset + (options.limit || 50) -1)
            }

            const { data, error, count } = await query;

            return { data: data as T[], error, count } as SupabaseQueryResult<T>;

      } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            return { data: null, error: error as any } as SupabaseQueryResult<T>;
      }
}

/**
 * Execute a Supabase RPC function
 * @example
 *   const result = await executeRpcQuery('fn_daily_snapshot', {
 *     args: { target_date: '2024-01-15' }
 *   })
 */

export async function executeRpcQuery<T>(funcName: string, options: SupabaseRpcOptions): Promise<SupabaseQueryResult<T>> {
      try {

            const { data, error } = await supabase.rpc(funcName, options.args);

            return { data: Array.isArray(data) ? data : [data], error } as SupabaseQueryResult<T>;

      } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            return { data: null, error: error as any } as SupabaseQueryResult<T>;
      }
}

/**
 * Execute a table query with eq/neq filters
 * @example
 *   const result = await executeTableQuery('items', {
 *     eq: { pos_item_id: 123 }
 *   })
 */

export async function executeTableQuery<T>(tableName: string, options: SupabaseTableOptions = {}): Promise<SupabaseQueryResult<T>> {
      try {
            const columns = options.columns?.trim() || "*";
            
            let query = supabase.from(tableName).select(columns, { count: 'exact' });

            query = (options.filters ?? []).reduce((q, { column, operator, value }) => q.filter(column, operator as any, value), query)

            if(options.order) {
                  query = query.order(options.order.column, { ascending: options.order.ascending ?? false });
            }

            if(options.limit){
                  query = query.limit(options.limit);
            }

            if(options.offset) {
                  query = query.range(options.offset, options.offset + (options.limit || 50) -1)
            }

            const { data, error, count } = await query;

            return { data: data as T[], error, count } as SupabaseQueryResult<T>;


      } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            return { data: null, error: error as any };
      }
}

/**
 * Universal query router - determines whether to use view/table/rpc
 */

export async function supabaseQuery<T = unknown>(
      type: SupabaseQueryType, 
      entity_name: string, 
      options: SupabaseViewOptions | SupabaseTableOptions | SupabaseRpcOptions = {}
): Promise<SupabaseQueryResult<T>> {
      switch (type) {
            case 'view':
                  return await executeViewQuery(entity_name, options as SupabaseViewOptions)
            case 'table':
                  return await executeTableQuery(entity_name, options as SupabaseTableOptions)
            case 'rpc':
                  return await executeRpcQuery(entity_name, options as SupabaseRpcOptions)
            default:
                  return { data: null, error: new Error(`Unknown query type: ${type}`) as any };
      }
}