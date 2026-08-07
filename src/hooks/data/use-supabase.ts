// src/hooks/data/use-supabase-query.ts
/**
 * TanStack Query hooks for universal Supabase data fetching
 * Handles caching, background refetch, error retry, and stale time
 */

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import {
      supabaseQuery,
      executeViewQuery,
      executeRpcQuery,
      executeTableQuery,
      SupabaseQueryResult,
      SupabaseViewOptions,
      SupabaseRpcOptions,
      SupabaseTableOptions,
      SupabaseQueryType,
} from '@/lib/api/supabase-client';

// ── Default TanStack Query Options ────────────────────────────────────
const DEFAULT_QUERY_OPTIONS = {
      staleTime: 5 * 60 * 1000,                    // 5 minutes
      gcTime: 10 * 60 * 1000,                      // 10 minutes (formerly cacheTime)
      retry: 2,
      retryDelay: (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 30000),
};

// ── View Query Hook ──────────────────────────────────────────────────────
/**
 * Fetch from a Supabase view with TanStack Query
 * @example
 *   const { data, isLoading, error } = useViewQuery('v_revenue_daily', {
 *     limit: 100,
 *     order: { column: 'sale_date', ascending: true }
 *   })
 */
export function useViewQuery<T = unknown>(
      viewName: string,
      options?: SupabaseViewOptions,
      queryOptions?: Omit<UseQueryOptions<SupabaseQueryResult<T>, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<SupabaseQueryResult<T>> {
      return useQuery({
            queryKey: ['view', viewName, options],
            queryFn: () => executeViewQuery<T>(viewName, options),
            ...DEFAULT_QUERY_OPTIONS,
            ...queryOptions,
      });
}

// ── RPC Query Hook ───────────────────────────────────────────────────────
/**
 * Call a Supabase RPC function with TanStack Query
 * @example
 *   const { data, isLoading, error } = useRpcQuery('fn_daily_snapshot', {
 *     args: { target_date: '2024-01-15' }
 *   })
 */
export function useRpcQuery<T = unknown>(
      functionName: string,
      options: SupabaseRpcOptions,
      queryOptions?: UseQueryOptions<SupabaseQueryResult<T>>
): UseQueryResult<SupabaseQueryResult<T>> {
      return useQuery({
            queryKey: ['rpc', functionName, options],
            queryFn: () => executeRpcQuery<T>(functionName, options),
            ...DEFAULT_QUERY_OPTIONS,
            ...queryOptions,
      });
}

// ── Table Query Hook ────────────────────────────────────────────────────
/**
 * Fetch from a Supabase table with TanStack Query
 * @example
 *   const { data, isLoading } = useTableQuery('items', {
 *     eq: { pos_item_id: 123 },
 *     limit: 50
 *   })
 */
export function useTableQuery<T = unknown>(
      tableName: string,
      options?: SupabaseTableOptions,
      queryOptions?: UseQueryOptions<SupabaseQueryResult<T>>
): UseQueryResult<SupabaseQueryResult<T>> {
      return useQuery({
            queryKey: ['table', tableName, options],
            queryFn: () => executeTableQuery<T>(tableName, options),
            ...DEFAULT_QUERY_OPTIONS,
            ...queryOptions,
      });
}

// ── Universal Query Hook ────────────────────────────────────────────────
/**
 * Universal hook that routes to view/table/rpc automatically
 * @example
 *   const { data, isLoading } = useSupabaseQuery('view', 'v_revenue_daily', {
 *     limit: 100
 *   })
 */
export function useSupabaseQuery<T = unknown>(
      type: SupabaseQueryType,
      name: string,
      options?: SupabaseViewOptions | SupabaseRpcOptions | SupabaseTableOptions,
      queryOptions?: UseQueryOptions<SupabaseQueryResult<T>>
): UseQueryResult<SupabaseQueryResult<T>> {
      return useQuery({
            queryKey: [type, name, options],
            queryFn: () => supabaseQuery<T>(type, name, options),
            ...DEFAULT_QUERY_OPTIONS,
            ...queryOptions,
      });
}