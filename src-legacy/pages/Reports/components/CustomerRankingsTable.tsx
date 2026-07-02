import React from 'react';
import {
      Card,
      CardHeader,
      CardTitle,
      Badge,
      ProgressBar,
      EmptyState,
} from '@/components/ui/primitives';
import { fmtCurrency, fmt } from '@/lib/utils';
import type { TopCustomer } from '../types';

interface CustomerRankingsTableProps {
      customers: TopCustomer[];
}

export function CustomerRankingsTable({
      customers,
}: CustomerRankingsTableProps) {
      const maxCustRev = Math.max(
            ...customers.map((r) => Number(r.revenue)),
            1
      );

      return (
            <Card>
                  <CardHeader>
                        <CardTitle>Customer Rankings</CardTitle>
                        <Badge variant="muted">
                              {customers.length} customers
                        </Badge>
                  </CardHeader>
                  <div className="overflow-x-auto">
                        <table className="w-full">
                              <thead>
                                    <tr className="border-b border-bg-border">
                                          {[
                                                '#',
                                                'Customer',
                                                'Revenue',
                                                'Transactions',
                                                'Units',
                                                'Avg Basket',
                                                '% of Total',
                                          ].map((h) => (
                                                <th
                                                      key={h}
                                                      className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted"
                                                >
                                                      {h}
                                                </th>
                                          ))}
                                    </tr>
                              </thead>
                              <tbody>
                                    {customers.map((r, i) => (
                                          <tr
                                                key={i}
                                                className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors group"
                                          >
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-faint">
                                                      {i + 1}
                                                </td>
                                                <td className="py-2.5 pr-4 text-xs font-body text-ink-primary group-hover:text-accent-gold transition-colors">
                                                      {r.customer_name.trim()}
                                                </td>
                                                <td className="py-2.5 pr-4">
                                                      <p className="text-xs font-mono text-accent-gold font-medium">
                                                            {fmtCurrency(
                                                                  r.revenue
                                                            )}
                                                      </p>
                                                      <ProgressBar
                                                            value={Number(
                                                                  r.revenue
                                                            )}
                                                            max={maxCustRev}
                                                            className="w-16 mt-1"
                                                      />
                                                </td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">
                                                      {fmt(r.transactions)}
                                                </td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">
                                                      {fmt(r.units)}
                                                </td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">
                                                      {fmtCurrency(
                                                            r.avg_basket
                                                      )}
                                                </td>
                                                <td className="py-2.5">
                                                      <Badge
                                                            variant={
                                                                  Number(
                                                                        r.pct_of_total
                                                                  ) > 20
                                                                        ? 'gold'
                                                                        : Number(
                                                                                  r.pct_of_total
                                                                            ) >
                                                                            10
                                                                          ? 'teal'
                                                                          : 'muted'
                                                            }
                                                      >
                                                            {Number(
                                                                  r.pct_of_total
                                                            ).toFixed(1)}
                                                            %
                                                      </Badge>
                                                </td>
                                          </tr>
                                    ))}
                              </tbody>
                        </table>
                        {!customers.length && <EmptyState />}
                  </div>
            </Card>
      );
}
