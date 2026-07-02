import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/primitives';
import { cn, isCurrencyCol, formatCellValue } from '@/lib/utils';
import type { QueryResult } from '@/types';

interface SummaryReportsProps {
      reportResult: QueryResult | null;
}

export function SummaryReports({ reportResult }: SummaryReportsProps) {
      if (!reportResult || !reportResult.rows) return null;

      return (
            <Card>
                  <CardHeader>
                        <CardTitle>Accounts Summary Report</CardTitle>
                  </CardHeader>
                  <div className="overflow-x-auto">
                        <table className="w-full">
                              <thead>
                                    <tr className="border-b border-bg-border">
                                          {reportResult.columns.map(
                                                (col, index) => (
                                                      <th
                                                            key={index}
                                                            className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted"
                                                      >
                                                            {col.toLocaleUpperCase()}
                                                      </th>
                                                )
                                          )}
                                    </tr>
                              </thead>
                              <tbody>
                                    {reportResult.rows.map((row, index) => (
                                          <tr
                                                key={index}
                                                className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors"
                                          >
                                                {reportResult.columns.map(
                                                      (col) => (
                                                            <td
                                                                  key={col}
                                                                  className="py-2.5 pr-4 whitespace-nowrap"
                                                            >
                                                                  <span
                                                                        className={cn(
                                                                              'text-xs font-mono',
                                                                              isCurrencyCol(
                                                                                    col
                                                                              )
                                                                                    ? 'text-accent-gold font-medium'
                                                                                    : '',
                                                                              col ===
                                                                                    reportResult
                                                                                          .columns[0]
                                                                                    ? 'text-ink-primary font-body'
                                                                                    : 'text-ink-secondary'
                                                                        )}
                                                                  >
                                                                        {formatCellValue(
                                                                              col,
                                                                              row[
                                                                                    col
                                                                              ]
                                                                        )}
                                                                  </span>
                                                            </td>
                                                      )
                                                )}
                                          </tr>
                                    ))}
                              </tbody>
                        </table>
                  </div>
            </Card>
      );
}
