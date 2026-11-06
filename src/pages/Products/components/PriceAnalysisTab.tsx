import { useMemo, useState } from 'react';
import { Activity, ArrowDownUp, Scale, Tag } from 'lucide-react';
import EChart from '@/components/charts/EChart';
import { Badge, CardHeader, CardTitle, EmptyState, StatCard } from '@/components/ui/primitives';
import { fmt, fmtCurrency } from '@/lib/utils';
import usePriceAnalysis from '../usePriceAnalysis';
import { buildPriceDistributionOption, buildPricePointsOption, buildPriceTrendOption } from './ProductPriceCharts';
import type { PriceBucket, PriceDistributionRow, PricePoint } from '../types';

const BUCKETS: { value: PriceBucket; label: string }[] = [
      { value: 'day', label: 'Daily' },
      { value: 'week', label: 'Weekly' },
      { value: 'month', label: 'Monthly' },
];

const DATE_INPUT = 'rounded border border-bg-border bg-bg-base px-2 py-1 text-xs text-ink-primary';
const PANEL = 'rounded-lg border border-bg-border bg-bg-panel p-5 space-y-4';

/** Least-squares slope of price over time, expressed as % change across the whole period. */
function priceDirection(points: PricePoint[]): { label: string; variant: 'teal' | 'red' | 'muted'; changePct: number } | null {
      if (points.length < 3) return null;
      const DAY = 86_400_000;
      const t0 = new Date(points[0].sold_at).getTime();
      const xs = points.map((p) => (new Date(p.sold_at).getTime() - t0) / DAY);
      const ys = points.map((p) => Number(p.unit_price));
      const n = xs.length;
      const mx = xs.reduce((a, b) => a + b, 0) / n;
      const my = ys.reduce((a, b) => a + b, 0) / n;
      const varX = xs.reduce((a, x) => a + (x - mx) ** 2, 0);
      if (varX === 0 || my === 0) return null;
      const slope = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / varX;
      const span = xs[n - 1] - xs[0];
      const changePct = ((slope * span) / my) * 100;
      if (Math.abs(changePct) < 1) return { label: 'Stable pricing', variant: 'muted', changePct };
      return changePct > 0
            ? { label: 'Price trending up', variant: 'teal', changePct }
            : { label: 'Price trending down', variant: 'red', changePct };
}

export default function PriceAnalysisTab({ posItemId }: { posItemId: number }) {
      const [bucket, setBucket] = useState<PriceBucket>('week');
      const [from, setFrom] = useState('');
      const [to, setTo] = useState('');
      const [includeReturns, setIncludeReturns] = useState(false);

      const query = usePriceAnalysis(posItemId, {
            from: from || null,
            to: to || null,
            bucket,
            includeReturns,
      });

      const data = query.data;
      const summary = data?.summary;
      const hasSales = !!summary && summary.sale_lines > 0;

      const direction = useMemo(() => (data ? priceDirection(data.price_points) : null), [data]);
      const topPrice = useMemo(
            () => (data?.price_distribution ?? []).reduce<PriceDistributionRow | null>(
                  (best, row) => (!best || Number(row.units) > Number(best.units) ? row : best), null),
            [data]
      );

      const trendOption = useMemo(() => (data && hasSales ? buildPriceTrendOption(data.timeline, data.summary) : null), [data, hasSales]);
      const distOption = useMemo(() => (data && hasSales ? buildPriceDistributionOption(data.price_distribution) : null), [data, hasSales]);
      const pointsOption = useMemo(() => (data && hasSales ? buildPricePointsOption(data.price_points, data.summary) : null), [data, hasSales]);

      const spreadNote = summary && summary.avg_price && summary.weighted_avg_price
            && Math.abs(Number(summary.weighted_avg_price) - Number(summary.avg_price)) / Number(summary.avg_price) > 0.01
            ? `Weighted average (${fmtCurrency(Number(summary.weighted_avg_price))}) differs from the simple average (${fmtCurrency(Number(summary.avg_price))}) — a few large-quantity sales at a different price are pulling volume away from the typical sale price.`
            : null;

      return (
            <div className="space-y-6">
                  {/* Controls */}
                  <section className="flex flex-wrap items-end gap-4 rounded-lg border border-bg-border bg-bg-panel p-4">
                        <div className="space-y-1">
                              <span className="block text-[10px] uppercase tracking-widest text-ink-muted">Group trend by</span>
                              <div className="flex gap-2">
                                    {BUCKETS.map((b) => (
                                          <button
                                                key={b.value}
                                                type="button"
                                                onClick={() => setBucket(b.value)}
                                                className={`rounded px-3 py-1.5 text-xs ${bucket === b.value ? 'bg-accent-gold/20 text-accent-gold' : 'text-ink-muted hover:bg-bg-hover'}`}
                                          >
                                                {b.label}
                                          </button>
                                    ))}
                              </div>
                        </div>
                        <label className="space-y-1">
                              <span className="block text-[10px] uppercase tracking-widest text-ink-muted">From</span>
                              <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={DATE_INPUT} />
                        </label>
                        <label className="space-y-1">
                              <span className="block text-[10px] uppercase tracking-widest text-ink-muted">To</span>
                              <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={DATE_INPUT} />
                        </label>
                        {(from || to) && (
                              <button type="button" onClick={() => { setFrom(''); setTo(''); }} className="rounded px-3 py-1.5 text-xs text-ink-muted hover:bg-bg-hover">
                                    Clear dates
                              </button>
                        )}
                        <label className="flex items-center gap-2 pb-1.5 text-xs text-ink-muted">
                              <input type="checkbox" checked={includeReturns} onChange={(e) => setIncludeReturns(e.target.checked)} />
                              Include returns
                        </label>
                  </section>

                  {query.error && (
                        <p className="rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                              Unable to load price analysis: {query.error.message}
                        </p>
                  )}

                  {query.isLoading && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                              {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-28 animate-pulse rounded-lg bg-bg-hover" />)}
                        </div>
                  )}

                  {!query.isLoading && !query.error && !hasSales && (
                        <EmptyState message="No sales were recorded for this product in the selected period." />
                  )}

                  {hasSales && summary && data && (
                        <>
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <StatCard label="Average price" value={fmtCurrency(Number(summary.avg_price))} sub={`Weighted by units: ${fmtCurrency(Number(summary.weighted_avg_price))}`} icon={<Tag size={14} />} accent="gold" delay={0} />
                                    <StatCard label="Median / most common" value={fmtCurrency(Number(summary.median_price))} sub={`Most common: ${fmtCurrency(Number(summary.most_common_price))}`} icon={<Scale size={14} />} accent="teal" delay={100} />
                                    <StatCard label="Price range" value={`${fmtCurrency(Number(summary.min_price))} – ${fmtCurrency(Number(summary.max_price))}`} sub={`Std. deviation ${fmtCurrency(Number(summary.price_stddev ?? 0))}`} icon={<ArrowDownUp size={14} />} accent="purple" delay={200} />
                                    <StatCard label="Units sold" value={fmt(Number(summary.units_sold))} sub={`${fmt(summary.sale_lines)} sales${Number(summary.units_returned) ? ` · ${fmt(Number(summary.units_returned))} returned` : ''}`} icon={<Activity size={14} />} accent="gold" delay={300} />
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                                    {direction && (
                                          <Badge variant={direction.variant}>
                                                {direction.label} ({direction.changePct > 0 ? '+' : ''}{direction.changePct.toFixed(1)}% over period)
                                          </Badge>
                                    )}
                                    {topPrice && <span>{topPrice.pct_of_units}% of units sold at {fmtCurrency(Number(topPrice.price))}</span>}
                                    {data.item?.list_price ? <span>Current list price {fmtCurrency(Number(data.item.list_price))}</span> : null}
                                    {data.item?.cost_price ? <span>Cost {fmtCurrency(Number(data.item.cost_price))}</span> : null}
                              </div>
                              {spreadNote && <p className="text-xs text-ink-muted">{spreadNote}</p>}

                              <section className={PANEL}>
                                    <CardHeader className="mb-0"><CardTitle>Price over time</CardTitle></CardHeader>
                                    {trendOption && <EChart option={trendOption} loading={query.isFetching} height="360px" />}
                              </section>

                              <section className={PANEL}>
                                    <CardHeader className="mb-0"><CardTitle>Units sold at each price</CardTitle></CardHeader>
                                    {distOption && <EChart option={distOption} loading={query.isFetching} height="320px" />}
                                    <div className="overflow-x-auto">
                                          <table className="w-full text-left text-xs">
                                                <thead className="text-ink-muted">
                                                      <tr className="border-b border-bg-border">
                                                            <th className="py-2 pr-4 font-normal">Price</th>
                                                            <th className="py-2 pr-4 font-normal">Units</th>
                                                            <th className="py-2 pr-4 font-normal">Sales</th>
                                                            <th className="py-2 pr-4 font-normal">Share of units</th>
                                                      </tr>
                                                </thead>
                                                <tbody>
                                                      {[...data.price_distribution].sort((a, b) => Number(b.units) - Number(a.units)).map((row) => (
                                                            <tr key={row.price} className="border-b border-bg-border/50">
                                                                  <td className="py-2 pr-4 font-mono text-accent-gold">{fmtCurrency(Number(row.price))}</td>
                                                                  <td className="py-2 pr-4 font-mono text-ink-primary">{fmt(Number(row.units))}</td>
                                                                  <td className="py-2 pr-4 font-mono text-ink-secondary">{fmt(Number(row.sale_lines))}</td>
                                                                  <td className="py-2 pr-4">
                                                                        <div className="flex items-center gap-2">
                                                                              <div className="h-1.5 w-28 overflow-hidden rounded bg-bg-hover">
                                                                                    <div className="h-full bg-accent-gold" style={{ width: `${Math.min(100, Number(row.pct_of_units))}%` }} />
                                                                              </div>
                                                                              <span className="font-mono text-ink-secondary">{row.pct_of_units}%</span>
                                                                        </div>
                                                                  </td>
                                                            </tr>
                                                      ))}
                                                </tbody>
                                          </table>
                                    </div>
                              </section>

                              <section className={PANEL}>
                                    <CardHeader className="mb-0"><CardTitle>Every sale (dot size = quantity)</CardTitle></CardHeader>
                                    {pointsOption && <EChart option={pointsOption} loading={query.isFetching} height="340px" />}
                              </section>
                        </>
                  )}
            </div>
      );
}
