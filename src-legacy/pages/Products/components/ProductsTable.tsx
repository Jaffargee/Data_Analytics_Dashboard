import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, Badge, ProgressBar, EmptyState } from '@/components/ui/primitives';
import { fmtCurrency, fmt, fmtPercent } from '@/lib/utils';
import { Search, ArrowUpDown, Plus, Edit3 } from 'lucide-react';
import { useFilteredProducts } from '../hooks';
import { MAX_TABLE_ROWS } from '../constants';
import type { SortKey, SortDir } from '../types';
import SearchInput from "@/components/ui/SearchInput"
import Button from "@/components/ui/Button"

interface ProductsTableProps {
      allItems: ReturnType<typeof import('@/lib/hooks').useBestSelling>['data'];
      maxRevenue: number;
}

export function ProductsTable({ allItems, maxRevenue }: ProductsTableProps) {
      const navigate = useNavigate();
      const [search, setSearch] = useState('');
      const [sortKey, setSortKey] = useState<SortKey>('total_revenue');
      const [sortDir, setSortDir] = useState<SortDir>('desc');

      const filtered = useFilteredProducts(allItems, search, sortKey, sortDir);

      function toggleSort(key: SortKey) {
            if (sortKey === key) setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
            else { setSortKey(key); setSortDir('desc'); }
      }

      const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
            <button
                  onClick={() => toggleSort(k)}
                  className={`flex items-center gap-1 text-xs font-body uppercase tracking-wider transition-colors ${
                        sortKey === k ? 'text-accent-gold' : 'text-ink-muted hover:text-ink-secondary'
                  }`}
            >
                  {label}
                  <ArrowUpDown
                        size={10}
                        className={sortKey === k ? 'text-accent-gold' : 'text-ink-faint'}
                  />
            </button>
      );

      return (
            <Card>
                  <CardHeader>
                        <div className='flex-1'>
                              <CardTitle>All Products</CardTitle>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                              <SearchInput placeholder="Search products…" className="h-[43px]" value={search} onChange={(v: string) => setSearch(v)} />
                              <Button className="h-[43px]" onClick={() => navigate('/products/new')} >
                                    <div className="flex flex-row items-center w-full relative justify-center whitespace-nowrap flex-nowrap gap-2">
                                          <div>
                                                <span>
                                                      <Plus size={24} />
                                                </span>
                                          </div>
                                          <div>
                                                <span className='leading-6'>New Prodcut</span>
                                          </div>
                                    </div>
                              </Button>
                        </div>
                  </CardHeader>

                  <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                              <thead>
                                    <tr className="border-b border-bg-border">
                                          <th className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted">#</th>
                                          <th className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted">Item</th>
                                          <th className="text-left pb-3 pr-4"><SortBtn k="total_revenue" label="Revenue" /></th>
                                          <th className="text-left pb-3 pr-4"><SortBtn k="total_qty_sold" label="Qty" /></th>
                                          <th className="text-left pb-3 pr-4"><SortBtn k="gross_profit" label="Profit" /></th>
                                          <th className="text-left pb-3 pr-4"><SortBtn k="margin_pct" label="Margin" /></th>
                                          <th className="text-left pb-3"><SortBtn k="times_sold" label="Transactions" /></th>
                                          <th className="pb-3" />
                                    </tr>
                              </thead>
                              <tbody>
                                    {filtered.slice(0, MAX_TABLE_ROWS).map((r, i) => {
                                          const margin = Number(r.margin_pct ?? 0);
                                          return (
                                                <tr
                                                      key={r.pos_item_id}
                                                      className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors group"
                                                >
                                                      <td className="py-3 pr-4 text-ink-faint text-xs font-mono">{i + 1}</td>
                                                      <td className="py-3 pr-4">
                                                            <p className="text-xs font-body text-ink-primary group-hover:text-accent-gold transition-colors">
                                                                  {r.item_name}
                                                            </p>
                                                            {r.category && (
                                                                  <p className="text-[10px] text-ink-muted font-body">{r.category}</p>
                                                            )}
                                                      </td>
                                                      <td className="py-3 pr-4">
                                                            <p className="text-xs font-mono text-accent-gold font-medium">
                                                                  {fmtCurrency(r.total_revenue)}
                                                            </p>
                                                            <ProgressBar
                                                                  value={Number(r.total_revenue)}
                                                                  max={maxRevenue}
                                                                  className="w-20 mt-1"
                                                            />
                                                      </td>
                                                      <td className="py-3 pr-4 text-xs font-mono text-ink-secondary">
                                                            {fmt(r.total_qty_sold)}
                                                      </td>
                                                      <td className="py-3 pr-4 text-xs font-mono text-accent-teal">
                                                            {fmtCurrency(r.gross_profit)}
                                                      </td>
                                                      <td className="py-3 pr-4">
                                                            <Badge
                                                                  variant={
                                                                        margin >= 30 ? 'teal' : margin >= 10 ? 'gold' : 'red'
                                                                  }
                                                            >
                                                                  {fmtPercent(margin)}
                                                            </Badge>
                                                      </td>
                                                      <td className="py-3 pr-4 text-xs font-mono text-ink-secondary">
                                                            {fmt(r.times_sold)}
                                                      </td>
                                                      <td className="py-3">
                                                            <button
                                                                  onClick={() => navigate(`/products/${r.pos_item_id}/edit`)}
                                                                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 rounded-lg border border-bg-border text-ink-muted hover:text-accent-gold hover:border-accent-gold/30 text-[10px] font-mono transition-all"
                                                            >
                                                                  <Edit3 size={10} />
                                                                  Edit
                                                            </button>
                                                      </td>
                                                </tr>
                                          );
                                    })}
                              </tbody>
                        </table>
                        {!filtered.length && <EmptyState message="No items match your search" />}
                  </div>

            </Card>
      );
}