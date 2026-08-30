import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import EmptyState from '@/components/ui/primitives/EmptyState';
import Pagination from '@/components/ui/data/Pagination';

/**
 * Column definition for DataTable.
 * - `key` maps to a field on the row when no `render`/`sortValue` is given.
 * - `render` lets you fully control cell markup (badges, avatars, progress bars, etc).
 * - `sortValue` lets you sort by something other than the raw field (e.g. lowercased name,
 *   a Date parsed from a string, a derived number).
 * - The first column doubles as each row's card title below the `lg` breakpoint, so keep
 *   it to the row's primary identifier (name, item, etc).
 */
export interface ColumnDef<T> {
      key: string;
      label: string;
      sortable?: boolean;
      align?: 'left' | 'right';
      width: string; // grid-template-columns fraction, e.g. '2.2fr'
      render?: (row: T, rowIndex: number) => React.ReactNode;
      sortValue?: (row: T) => string | number;
      /** Omit this column from the stacked mobile/tablet card view (still shown in the desktop grid). */
      hideOnCard?: boolean;
}

export interface DataTablePaginationProps {
      page: number;
      totalPages: number;
      totalCount: number;
      pageSize: number;
      onPageChange: (page: number) => void;
      loading?: boolean;
}

export interface DataTableProps<T> {
      data: T[];
      columns: ColumnDef<T>[];
      getRowId: (row: T, index: number) => string | number;
      onRowClick?: (row: T) => void;
      /** Render action buttons for a row. Presence of this prop adds the actions column. */
      actions?: (row: T) => React.ReactNode;
      actionsLabel?: string;
      actionsWidth?: string;
      ariaLabel?: string;
      emptyMessage?: string;
      defaultSortKey?: string;
      defaultSortDir?: SortDir;
      maxRows?: number;
      className?: string;
      /**
       * When set, `data` is treated as a single already-fetched page (server-side
       * pagination via the offset/limit already supported by useViewQuery/
       * useTableQuery) and a Prev/Next footer is rendered. Sorting by clicking a
       * column header still only reorders the current page's rows — pass an
       * `order` matching the active sort into the underlying hook if you need
       * the whole dataset sorted, not just the visible page.
       */
      pagination?: DataTablePaginationProps;
}

type SortDir = 'asc' | 'desc';

function DataTable<T>({
      data,
      columns,
      getRowId,
      onRowClick,
      actions,
      actionsLabel = 'Actions',
      actionsWidth = '1.4fr',
      ariaLabel = 'Data table',
      emptyMessage = 'No records found',
      defaultSortKey,
      defaultSortDir = 'desc',
      maxRows,
      className = '',
      pagination,
}: DataTableProps<T>) {
      const [sortKey, setSortKey] = useState<string | undefined>(defaultSortKey);
      const [sortDir, setSortDir] = useState<SortDir>(defaultSortDir);
      const [focusedRow, setFocusedRow] = useState(0);
      const rowRefs = useRef<Array<HTMLDivElement | null>>([]);

      const allColumns: ColumnDef<T>[] = useMemo(() => {
            if (!actions) return columns;
            return [
                  ...columns,
                  {
                        key: '__actions__',
                        label: actionsLabel,
                        sortable: false,
                        align: 'right',
                        width: actionsWidth,
                  },
            ];
      }, [columns, actions, actionsLabel, actionsWidth]);

      const gridTemplate = allColumns.map((c) => c.width).join(' ');

      const getValue = useCallback(
            (row: T, key: string): string | number => {
                  const col = columns.find((c) => c.key === key);
                  if (col?.sortValue) return col.sortValue(row);
                  const raw = (row as Record<string, unknown>)[key];
                  if (typeof raw === 'number') return raw;
                  if (raw instanceof Date) return raw.getTime();
                  if (typeof raw === 'string') return raw;
                  return raw == null ? '' : String(raw);
            },
            [columns]
      );

      const sorted = useMemo(() => {
            if (!sortKey) return data;
            const rows = [...data];
            rows.sort((a, b) => {
                  let av = getValue(a, sortKey);
                  let bv = getValue(b, sortKey);

                  if (typeof av === 'string') av = av.toLowerCase();
                  if (typeof bv === 'string') bv = bv.toLowerCase();

                  if (av < bv) return sortDir === 'asc' ? -1 : 1;
                  if (av > bv) return sortDir === 'asc' ? 1 : -1;
                  return 0;
            });
            return rows;
      }, [data, sortKey, sortDir, getValue]);

      const rows = maxRows ? sorted.slice(0, maxRows) : sorted;

      const sortableColumns = useMemo(() => columns.filter((c) => c.sortable), [columns]);

      const toggleSort = (key: string) => {
            if (key === sortKey) {
                  setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
            } else {
                  setSortKey(key);
                  setSortDir('desc');
            }
      };

      const handleRowKeyDown = (
            e: React.KeyboardEvent<HTMLDivElement>,
            index: number,
            row: T
      ) => {
            switch (e.key) {
                  case 'ArrowDown': {
                        e.preventDefault();
                        const next = Math.min(index + 1, rows.length - 1);
                        setFocusedRow(next);
                        rowRefs.current[next]?.focus();
                        break;
                  }
                  case 'ArrowUp': {
                        e.preventDefault();
                        const prev = Math.max(index - 1, 0);
                        setFocusedRow(prev);
                        rowRefs.current[prev]?.focus();
                        break;
                  }
                  case 'Home': {
                        e.preventDefault();
                        setFocusedRow(0);
                        rowRefs.current[0]?.focus();
                        break;
                  }
                  case 'End': {
                        e.preventDefault();
                        const last = rows.length - 1;
                        setFocusedRow(last);
                        rowRefs.current[last]?.focus();
                        break;
                  }
                  case 'Enter':
                  case ' ': {
                        if (onRowClick) {
                              e.preventDefault();
                              onRowClick(row);
                        }
                        break;
                  }
                  default:
                        break;
            }
      };

      const SortIcon = ({ colKey }: { colKey: string }) => {
            if (sortKey !== colKey) {
                  return (
                        <span aria-hidden="true" className="text-ink-faint text-[10px]">
                              ↕
                        </span>
                  );
            }
            return sortDir === 'asc' ? (
                  <span aria-hidden="true" className="text-accent-gold text-[10px]">
                        ↑
                  </span>
            ) : (
                  <span aria-hidden="true" className="text-accent-gold text-[10px]">
                        ↓
                  </span>
            );
      };

      if (!rows.length) {
            return (
                  <div className={`px-3 sm:px-6 ${className}`}>
                        <EmptyState message={emptyMessage} />
                        {pagination && pagination.totalCount > 0 && (
                              <Pagination {...pagination} />
                        )}
                  </div>
            );
      }

      const [titleCol, ...restCols] = columns;
      const cardCols = restCols.filter((c) => !c.hideOnCard);

      return (
            <div className={`px-3 sm:px-6 ${className}`}>
                  {/* ── Mobile / tablet: stacked cards (below lg) ── */}
                  <div className="lg:hidden space-y-2">
                        {sortableColumns.length > 0 && (
                              <div className="flex items-center gap-2 mb-3">
                                    <label className="text-[10px] uppercase tracking-wide text-ink-faint shrink-0">
                                          Sort
                                    </label>
                                    <select
                                          value={sortKey ?? ''}
                                          onChange={(e) => setSortKey(e.target.value || undefined)}
                                          className="flex-1 min-w-0 rounded-md border border-bg-border bg-bg-hover px-2.5 py-1.5 text-xs font-body text-ink-primary focus:outline-none focus:ring-1 focus:ring-accent-gold"
                                    >
                                          {sortableColumns.map((col) => (
                                                <option key={col.key} value={col.key}>{col.label}</option>
                                          ))}
                                    </select>
                                    <button
                                          type="button"
                                          onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                                          aria-label={sortDir === 'asc' ? 'Sort ascending' : 'Sort descending'}
                                          className="shrink-0 p-1.5 rounded-md border border-bg-border bg-bg-hover text-ink-muted hover:text-accent-gold transition-colors"
                                    >
                                          {sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </button>
                              </div>
                        )}

                        {rows.map((row, index) => {
                              const rowId = getRowId(row, index);
                              const clickable = !!onRowClick;
                              return (
                                    <div
                                          key={rowId}
                                          role={clickable ? 'button' : undefined}
                                          tabIndex={clickable ? 0 : undefined}
                                          onClick={() => onRowClick?.(row)}
                                          onKeyDown={(e) => {
                                                if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                                                      e.preventDefault();
                                                      onRowClick?.(row);
                                                }
                                          }}
                                          className={`rounded-lg border border-bg-border bg-bg-card p-3.5 space-y-2 ${
                                                clickable ? 'cursor-pointer hover:border-accent-gold/40 active:bg-bg-hover transition-colors' : ''
                                          }`}
                                    >
                                          <div className="text-sm font-body text-ink-primary font-medium">
                                                {titleCol.render ? titleCol.render(row, index) : String((row as Record<string, unknown>)[titleCol.key] ?? '—')}
                                          </div>
                                          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                                {cardCols.map((col) => (
                                                      <div key={col.key} className="min-w-0">
                                                            <p className="text-[10px] uppercase tracking-wide text-ink-faint">{col.label}</p>
                                                            <div className="text-xs">
                                                                  {col.render
                                                                        ? col.render(row, index)
                                                                        : String((row as Record<string, unknown>)[col.key] ?? '—')}
                                                            </div>
                                                      </div>
                                                ))}
                                          </div>
                                          {actions && (
                                                <div
                                                      className="flex items-center gap-2 pt-1.5 border-t border-bg-border/60"
                                                      onClick={(e) => e.stopPropagation()}
                                                >
                                                      {actions(row)}
                                                </div>
                                          )}
                                    </div>
                              );
                        })}
                  </div>

                  {/* ── Desktop: full grid (lg and up) ── */}
                  <div className="hidden lg:block px-1 pb-1">
                        {/* Accessible grid: div-based, semantics via role/aria */}
                        <div
                              role="grid"
                              aria-label={ariaLabel}
                              aria-rowcount={rows.length}
                              className="w-full rounded-xl border-bg-border overflow-hidden"
                        >
                              {/* Header row */}
                              <div
                                    role="row"
                                    className="grid items-center border-b border-bg-border bg-bg-surface/60 sticky top-0 z-10 backdrop-blur-sm"
                                    style={{ gridTemplateColumns: gridTemplate }}
                              >
                                    {allColumns.map((col) => {
                                          const isSortable = !!col.sortable;
                                          const ariaSort =
                                                col.key === sortKey
                                                      ? sortDir === 'asc'
                                                            ? 'ascending'
                                                            : 'descending'
                                                      : 'none';

                                          return (
                                                <div
                                                      key={col.key}
                                                      role="columnheader"
                                                      aria-sort={
                                                            isSortable
                                                                  ? (ariaSort as React.AriaAttributes['aria-sort'])
                                                                  : undefined
                                                      }
                                                      className={`px-4 py-3 text-xs font-body uppercase tracking-wider text-ink-muted ${
                                                            col.align === 'right' ? 'text-right' : 'text-left'
                                                      }`}
                                                >
                                                      {isSortable ? (
                                                            <button
                                                                  type="button"
                                                                  onClick={() => toggleSort(col.key)}
                                                                  className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 -ml-1 hover:text-accent-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/70 transition-colors"
                                                            >
                                                                  <span>{col.label}</span>
                                                                  <SortIcon colKey={col.key} />
                                                            </button>
                                                      ) : (
                                                            <span>{col.label}</span>
                                                      )}
                                                </div>
                                          );
                                    })}
                              </div>

                              {/* Body */}
                              <div role="rowgroup">
                                    {rows.map((row, index) => {
                                          const isFocusable = index === focusedRow;
                                          const rowId = getRowId(row, index);
                                          const clickable = !!onRowClick;

                                          return (
                                                <div
                                                      key={rowId}
                                                      ref={(el) => (rowRefs.current[index] = el)}
                                                      role="row"
                                                      aria-rowindex={index + 1}
                                                      tabIndex={isFocusable ? 0 : -1}
                                                      onFocus={() => setFocusedRow(index)}
                                                      onClick={() => onRowClick?.(row)}
                                                      onKeyDown={(e) => handleRowKeyDown(e, index, row)}
                                                      className={`grid items-center border-b border-bg-border/40 last:border-b-0 group
                                                      hover:bg-bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset
                                                      focus-visible:ring-accent-gold/70 transition-colors rounded-full ${
                                                            clickable ? 'cursor-pointer' : ''
                                                      }`}
                                                      style={{ gridTemplateColumns: gridTemplate }}
                                                >
                                                      {columns.map((col) => (
                                                            <div
                                                                  key={col.key}
                                                                  role="gridcell"
                                                                  className={`px-4 py-3 min-w-0 ${
                                                                        col.align === 'right' ? 'text-right' : ''
                                                                  }`}
                                                            >
                                                                  {col.render
                                                                        ? col.render(row, index)
                                                                        : String(
                                                                                (row as Record<string, unknown>)[
                                                                                      col.key
                                                                                ] ?? '—'
                                                                          )}
                                                            </div>
                                                      ))}

                                                      {actions && (
                                                            <div
                                                                  role="gridcell"
                                                                  className="px-4 py-3"
                                                                  onClick={(e) => e.stopPropagation()}
                                                            >
                                                                  <div className="flex items-center justify-end gap-2">
                                                                        {actions(row)}
                                                                  </div>
                                                            </div>
                                                      )}
                                                </div>
                                          );
                                    })}
                              </div>
                        </div>
                  </div>

                  {pagination && <Pagination {...pagination} />}
            </div>
      );
}

export default DataTable;
