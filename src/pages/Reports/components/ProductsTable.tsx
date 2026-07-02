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
import type { TopProduct } from '../types';

interface ProductsTableProps {
      products: TopProduct[];
}

export function ProductsTable({ products }: ProductsTableProps) {
      const maxProdRev = Math.max(...products.map((r) => Number(r.revenue)), 1);

      return (
            <Card>
                  <CardHeader>
                        <CardTitle>All Products</CardTitle>
                        <Badge variant="muted">{products.length} items</Badge>
                  </CardHeader>
                  <div className="overflow-x-auto">
                        <table className="w-full">
                              <thead>
                                    <tr className="border-b border-bg-border">
                                          {[
                                                '#',
                                                'Product',
                                                'Category',
                                                'Revenue',
                                                'Units',
                                                'Txns',
                                                'Avg Price',
                                                'Margin',
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
                                    {products.map((r, i) => (
                                          <tr
                                                key={i}
                                                className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors group"
                                          >
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-faint">
                                                      {i + 1}
                                                </td>
                                                <td className="py-2.5 pr-4">
                                                      <p className="text-xs font-body text-ink-primary group-hover:text-accent-gold transition-colors">
                                                            {r.item_name}
                                                      </p>
                                                </td>
                                                <td className="py-2.5 pr-4">
                                                      <Badge variant="muted">
                                                            {r.category}
                                                      </Badge>
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
                                                            max={maxProdRev}
                                                            className="w-16 mt-1"
                                                      />
                                                </td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">
                                                      {fmt(r.units_sold)}
                                                </td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">
                                                      {fmt(r.transactions)}
                                                </td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">
                                                      {fmtCurrency(r.avg_price)}
                                                </td>
                                                <td className="py-2.5">
                                                      <Badge
                                                            variant={
                                                                  Number(
                                                                        r.margin_pct
                                                                  ) > 30
                                                                        ? 'teal'
                                                                        : Number(
                                                                                  r.margin_pct
                                                                            ) >
                                                                            10
                                                                          ? 'gold'
                                                                          : 'red'
                                                            }
                                                      >
                                                            {Number(
                                                                  r.margin_pct
                                                            ).toFixed(1)}
                                                            %
                                                      </Badge>
                                                </td>
                                          </tr>
                                    ))}
                              </tbody>
                        </table>
                        {!products.length && <EmptyState />}
                  </div>
            </Card>
      );
}
