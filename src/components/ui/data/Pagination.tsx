import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
      page: number;
      totalPages: number;
      totalCount: number;
      pageSize: number;
      onPageChange: (page: number) => void;
      loading?: boolean;
}

export function Pagination({ page, totalPages, totalCount, pageSize, onPageChange, loading }: PaginationProps) {
      if (totalCount === 0) return null;

      const from = (page - 1) * pageSize + 1;
      const to = Math.min(page * pageSize, totalCount);

      return (
            <div className="flex items-center justify-between gap-3 px-1 pt-3 flex-wrap">
                  <p className="text-[11px] text-ink-faint font-body">
                        {loading ? 'Loading…' : `${from}–${to} of ${totalCount}`}
                  </p>
                  <div className="flex items-center gap-1.5">
                        <button
                              type="button"
                              onClick={() => onPageChange(page - 1)}
                              disabled={page <= 1 || loading}
                              aria-label="Previous page"
                              className="p-1.5 rounded-md border border-bg-border bg-bg-hover text-ink-muted hover:text-accent-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                              <ChevronLeft size={14} />
                        </button>
                        <span className="text-[11px] font-mono text-ink-secondary px-2 min-w-[64px] text-center">
                              Page {page} / {totalPages}
                        </span>
                        <button
                              type="button"
                              onClick={() => onPageChange(page + 1)}
                              disabled={page >= totalPages || loading}
                              aria-label="Next page"
                              className="p-1.5 rounded-md border border-bg-border bg-bg-hover text-ink-muted hover:text-accent-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                              <ChevronRight size={14} />
                        </button>
                  </div>
            </div>
      );
}

export default Pagination;
