import { useMemo, useState } from 'react';
import { Search, Plus, PackageX } from 'lucide-react';
import { usePosItems } from '@/hooks/data';
import type { PosItemRow } from '@/hooks/data';
import { fmtCurrency } from '@/lib/utils';

interface ProductGridProps {
      onAdd: (item: PosItemRow) => void;
}

const INPUT_CLASS =
      'w-full rounded-lg border border-bg-border bg-bg-hover pl-9 pr-3 py-2.5 text-sm font-body text-ink-primary placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-accent-gold';

function isPromoActive(item: PosItemRow): boolean {
      if (!item.promo_price) return false;
      const today = new Date().toISOString().slice(0, 10);
      const startsOk = !item.promo_start_date || item.promo_start_date <= today;
      const endsOk = !item.promo_end_date || item.promo_end_date >= today;
      return startsOk && endsOk;
}

export function ProductGrid({ onAdd }: ProductGridProps) {
      const items = usePosItems();
      const [query, setQuery] = useState('');
      const [category, setCategory] = useState<string>('ALL');

      const rows = items.data?.data ?? [];

      const categories = useMemo(() => {
            const set = new Set<string>();
            for (const row of rows) {
                  if (row.category) set.add(row.category);
            }
            return ['ALL', ...Array.from(set).sort()];
      }, [rows]);

      const filtered = useMemo(() => {
            const q = query.trim().toLowerCase();
            return rows.filter((row) => {
                  const matchesQuery = !q || row.item_name.toLowerCase().includes(q);
                  const matchesCategory = category === 'ALL' || row.category === category;
                  return matchesQuery && matchesCategory;
            });
      }, [rows, query, category]);

      return (
            <div className="flex flex-col h-full min-h-0">
                  <div className="p-3 sm:p-4 space-y-3 shrink-0 border-b border-bg-border">
                        <div className="relative">
                              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                              <input
                                    className={INPUT_CLASS}
                                    placeholder="Search products…"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                              />
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:thin] pb-1">
                              {categories.map((cat) => (
                                    <button
                                          key={cat}
                                          type="button"
                                          onClick={() => setCategory(cat)}
                                          className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-body border transition-colors ${
                                                category === cat
                                                      ? 'bg-accent-gold/15 border-accent-gold/40 text-accent-gold'
                                                      : 'bg-bg-hover border-bg-border text-ink-muted hover:text-ink-primary'
                                          }`}
                                    >
                                          {cat}
                                    </button>
                              ))}
                        </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                        {items.isLoading ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                          <div key={i} className="h-28 rounded-lg bg-bg-hover animate-pulse" />
                                    ))}
                              </div>
                        ) : filtered.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-16 text-ink-faint gap-2">
                                    <PackageX size={28} />
                                    <p className="text-sm font-body">No products match.</p>
                              </div>
                        ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {filtered.map((item) => {
                                          const promoActive = isPromoActive(item);
                                          const price = promoActive ? Number(item.promo_price) : Number(item.selling_price);
                                          const outOfStock = Number(item.quantity) <= 0;
                                          return (
                                                <button
                                                      key={item.pos_item_id}
                                                      type="button"
                                                      disabled={outOfStock}
                                                      onClick={() => onAdd(item)}
                                                      className="group relative flex flex-col items-start text-left rounded-lg border border-bg-border bg-bg-card p-3 hover:border-accent-gold/40 active:bg-bg-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                      {promoActive && (
                                                            <span className="absolute top-2 right-2 rounded-full bg-accent-red/15 border border-accent-red/30 text-accent-red text-[9px] font-body px-1.5 py-0.5">
                                                                  PROMO
                                                            </span>
                                                      )}
                                                      <p className="text-xs font-body text-ink-primary line-clamp-2 min-h-[2.2em]">{item.item_name}</p>
                                                      <p className="text-[10px] text-ink-faint mt-0.5">{item.category ?? 'Uncategorized'}</p>
                                                      <div className="mt-auto pt-2 w-full flex items-end justify-between">
                                                            <div>
                                                                  <p className="text-sm font-mono text-accent-gold font-medium">{fmtCurrency(price)}</p>
                                                                  {outOfStock ? (
                                                                        <p className="text-[10px] text-accent-red">Out of stock</p>
                                                                  ) : (
                                                                        <p className="text-[10px] text-ink-faint">{item.quantity} in stock</p>
                                                                  )}
                                                            </div>
                                                            <span className="w-6 h-6 rounded-full bg-accent-gold/15 border border-accent-gold/30 text-accent-gold flex items-center justify-center shrink-0 group-hover:bg-accent-gold/25 transition-colors">
                                                                  <Plus size={13} />
                                                            </span>
                                                      </div>
                                                </button>
                                          );
                                    })}
                              </div>
                        )}
                  </div>
            </div>
      );
}
