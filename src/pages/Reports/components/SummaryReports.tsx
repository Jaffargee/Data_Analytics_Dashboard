import React from 'react';
import { Card } from "@fluentui/react-components";
import { CardHeader, CardTitle } from '@/components/ui/primitives';
import SimpleTable from '@/components/ui/data/SimpleTable';
import { cn, isCurrencyCol, formatCellValue } from '@/lib/utils';
import type { QueryResult } from '@/types';

interface SummaryReportsProps {
      reportResult: QueryResult | null;
}

export function SummaryReports({ reportResult }: SummaryReportsProps) {
      if (!reportResult || !reportResult.rows) return null;

      const columns = reportResult.columns;

      return (
            <Card appearance="outline">
                  <CardHeader>
                        <CardTitle>Accounts Summary Report</CardTitle>
                  </CardHeader>
                  <SimpleTable
                        headers={columns.map((col) => col.toLocaleUpperCase())}
                        rows={reportResult.rows}
                        getRowKey={(_row, index) => index}
                        renderCell={(row, columnIndex) => {
                              const col = columns[columnIndex];
                              return (
                                    <span
                                          className={cn(
                                                'text-xs font-mono',
                                                isCurrencyCol(col) ? 'text-accent-gold font-medium' : '',
                                                col === columns[0] ? 'text-ink-primary font-body' : 'text-ink-secondary'
                                          )}
                                    >
                                          {formatCellValue(col, row[col])}
                                    </span>
                              );
                        }}
                  />
            </Card>
      );
}
