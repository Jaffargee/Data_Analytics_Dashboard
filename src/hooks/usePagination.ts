import { useMemo, useState } from 'react';

export interface UsePaginationResult {
      page: number;
      setPage: (page: number) => void;
      pageSize: number;
      /** Pass straight through to a useViewQuery/useTableQuery options object. */
      limit: number;
      offset: number;
      /** Resets to page 1 — call when a filter/search changes what's being counted. */
      reset: () => void;
}

/**
 * Drives page-by-page fetching through the existing offset/limit support in
 * useViewQuery/useTableQuery. Doesn't take totalCount up front (that would create
 * a circular dependency — you need `page`/`offset` to fetch, but only get the
 * count back from that same fetch) — derive totalPages where you use it:
 *
 *   const pager = usePagination(20);
 *   const result = useCustomerDirectory(pager.limit, pager.offset);
 *   const totalPages = Math.max(1, Math.ceil((result.data?.count ?? 0) / pager.pageSize));
 */
export function usePagination(pageSize = 20): UsePaginationResult {
      const [page, setPageRaw] = useState(1);

      return useMemo(
            () => ({
                  page,
                  setPage: (next: number) => setPageRaw(Math.max(1, next)),
                  pageSize,
                  limit: pageSize,
                  offset: (page - 1) * pageSize,
                  reset: () => setPageRaw(1),
            }),
            [page, pageSize]
      );
}
