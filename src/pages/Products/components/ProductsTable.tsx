import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardHeader, CardTitle, Badge } from '@/components/ui/primitives';
import { fmtCurrency, fmt, fmtPercent } from '@/lib/utils';
import { Edit3, User } from 'lucide-react';
import { useFilteredProducts } from '../hooks';
import { MAX_TABLE_ROWS } from '../constants';
import SearchInput from '@/components/ui/SearchInput';
import { Card, ProgressBar } from '@fluentui/react-components';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import Button from "../../../components/ui/Button";

interface ProductRow {
      pos_item_id: string | number;
      item_name: string;
      category?: string;
      total_revenue: number;
      total_qty_sold: number;
      gross_profit: number;
      margin_pct: number;
      times_sold: number;
}

interface ProductsTableProps {
      allItems: import('@/hooks/data/types').BestSellingItem[] | null | undefined;
      maxRevenue: number;
}

export function ProductsTable({ allItems, maxRevenue }: ProductsTableProps) {
      const navigate = useNavigate();
      const [search, setSearch] = useState('');

      // Sorting now lives in DataTable's column headers, so the hook only needs to filter.
      const filtered = useFilteredProducts(allItems, search, 'total_revenue', 'desc');
      const rows = filtered.slice(0, MAX_TABLE_ROWS) as ProductRow[];

      const columns: ColumnDef<ProductRow>[] = [
            {
                  key: 'index',
                  label: '#',
                  width: '0.5fr',
                  render: (_r, i) => <span className="text-ink-faint text-xs font-mono">{i + 1}</span>,
            },
            {
                  key: 'item_name',
                  label: 'Item',
                  width: '2.2fr',
                  render: (r) => (
                        <div className="min-w-0">
                              <p className="text-xs font-body text-ink-primary group-hover:text-accent-gold transition-colors truncate">
                                    {r.item_name}
                              </p>
                              {r.category && (
                                    <p className="text-[10px] text-ink-muted font-body">{r.category}</p>
                              )}
                        </div>
                  ),
            },
            {
                  key: 'total_revenue',
                  label: 'Revenue',
                  sortable: true,
                  width: '1.6fr',
                  sortValue: (r) => Number(r.total_revenue) || 0,
                  render: (r) => (
                        <>
                              <p className="text-xs font-mono text-accent-gold font-medium">
                                    {fmtCurrency(r.total_revenue)}
                              </p>
                              <ProgressBar
                                    value={Number(r.total_revenue)}
                                    max={maxRevenue}
                                    className="w-20 mt-1"
                              />
                        </>
                  ),
            },
            {
                  key: 'total_qty_sold',
                  label: 'Qty',
                  sortable: true,
                  width: '0.9fr',
                  sortValue: (r) => Number(r.total_qty_sold) || 0,
                  render: (r) => (
                        <span className="text-xs font-mono text-ink-secondary">{fmt(r.total_qty_sold)}</span>
                  ),
            },
            {
                  key: 'gross_profit',
                  label: 'Profit',
                  sortable: true,
                  width: '1.2fr',
                  sortValue: (r) => Number(r.gross_profit) || 0,
                  render: (r) => (
                        <span className="text-xs font-mono text-accent-teal">{fmtCurrency(r.gross_profit)}</span>
                  ),
            },
            {
                  key: 'margin_pct',
                  label: 'Margin',
                  sortable: true,
                  width: '1fr',
                  sortValue: (r) => Number(r.margin_pct) || 0,
                  render: (r) => {
                        const margin = Number(r.margin_pct ?? 0);
                        return (
                              <Badge variant={margin >= 30 ? 'teal' : margin >= 10 ? 'gold' : 'red'}>
                                    {fmtPercent(margin)}
                              </Badge>
                        );
                  },
            },
            {
                  key: 'times_sold',
                  label: 'Transactions',
                  sortable: true,
                  width: '1.2fr',
                  sortValue: (r) => Number(r.times_sold) || 0,
                  render: (r) => (
                        <span className="text-xs font-mono text-ink-secondary">{fmt(r.times_sold)}</span>
                  ),
            },
      ];

      return (
            <DataTable
                  data={rows}
                  columns={columns}
                  getRowId={(r) => r.pos_item_id}
                  ariaLabel="Products"
                  emptyMessage="No items match your search"
                  defaultSortKey="total_revenue"
                  defaultSortDir="desc"
                  actions={(r) => (
                        <>
                              <Button
                                    size="sm"
                                    radius="full"
                                    variant="accent"
                                    type="button"
                                    icon={<Edit3 size={14} aria-hidden="true" />}
                                    aria-label={`Edit ${r.item_name}`}
                                    onClick={() => navigate(`/products/${r.pos_item_id}/edit`)}
                              >
                                    <span>Edit</span>
                              </Button>
                              <Button
                                    size="sm"
                                    radius="full"
                                    variant="accent"
                                    type="button"
                                    icon={<User size={14} aria-hidden="true" />}
                                    aria-label={`View profile for ${r.item_name}`}
                                    onClick={() => {}}
                              >
                                    <span>Profile</span>
                              </Button>
                        </>
                  )}
                  actionsLabel=""
                  actionsWidth="0.9fr"
                  onRowClick={(row) => navigate(`/products/product/${row.pos_item_id}`)}
            />
      );
}
