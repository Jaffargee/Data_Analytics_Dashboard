import React from 'react';
import EmptyState from '@/components/ui/primitives/EmptyState';

export interface SimpleTableProps<T> {
      headers: string[];
      rows: T[];
      renderCell: (row: T, columnIndex: number) => React.ReactNode;
      getRowKey: (row: T, index: number) => string | number;
      emptyMessage?: string;
      className?: string;
}

/**
 * A lightweight responsive table for small, non-sortable result sets with
 * columns known only as plain strings (dynamic report output, small summary
 * breakdowns). Renders stacked cards below `lg`, a plain `<table>` at `lg`+.
 * For anything sortable/interactive/row-clickable, use DataTable instead.
 */
export function SimpleTable<T>({
      headers,
      rows,
      renderCell,
      getRowKey,
      emptyMessage = 'No data available',
      className = '',
}: SimpleTableProps<T>) {
      if (!rows.length) {
            return <EmptyState message={emptyMessage} />;
      }

      return (
            <div className={className}>
                  {/* ── Mobile / tablet: stacked cards (below lg) ── */}
                  <div className="lg:hidden space-y-2">
                        {rows.map((row, rowIndex) => (
                              <div
                                    key={getRowKey(row, rowIndex)}
                                    className="rounded-lg border border-bg-border bg-bg-card p-3.5 space-y-2"
                              >
                                    <div className="text-sm font-body text-ink-primary font-medium">
                                          {renderCell(row, 0)}
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                          {headers.slice(1).map((header, i) => (
                                                <div key={header} className="min-w-0">
                                                      <p className="text-[10px] uppercase tracking-wide text-ink-faint">{header}</p>
                                                      <div className="text-xs">{renderCell(row, i + 1)}</div>
                                                </div>
                                          ))}
                                    </div>
                              </div>
                        ))}
                  </div>

                  {/* ── Desktop: plain table (lg and up) ── */}
                  <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                              <thead>
                                    <tr className="border-b border-bg-border">
                                          {headers.map((header) => (
                                                <th
                                                      key={header}
                                                      className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted"
                                                >
                                                      {header}
                                                </th>
                                          ))}
                                    </tr>
                              </thead>
                              <tbody>
                                    {rows.map((row, rowIndex) => (
                                          <tr
                                                key={getRowKey(row, rowIndex)}
                                                className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors"
                                          >
                                                {headers.map((header, colIndex) => (
                                                      <td key={header} className="py-3 pr-4">
                                                            {renderCell(row, colIndex)}
                                                      </td>
                                                ))}
                                          </tr>
                                    ))}
                              </tbody>
                        </table>
                  </div>
            </div>
      );
}

export default SimpleTable;
