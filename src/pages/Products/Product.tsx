import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tab, TabList } from '@fluentui/react-components';
import { DollarSign, Package, Percent, Users } from 'lucide-react';
import EChart from '@/components/charts/EChart';
import { TopBar } from '@/components/ui/TopBar';
import { Badge, CardHeader, CardTitle, EmptyState, StatCard } from '@/components/ui/primitives';
import { fmt, fmtCurrency, fmtPercent } from '@/lib/utils';
import useProductAnalytics from './hooks';
import { buildSalesTrendOption, buildTopCustomersOption } from './components/ProductDetailCharts';
import type { ProductDeepDive, ProductTopCustomer, SalesTrend, TrendGranularity } from './types';

const granularities: TrendGranularity[] = ['daily', 'weekly', 'biweekly', 'monthly'];

export default function ProductPage() {
      const { product_id } = useParams<{ product_id: string }>();
      const itemId = Number(product_id);
      const [tab, setTab] = useState('overview');
      const analytics = useProductAnalytics(Number.isFinite(itemId) ? itemId : 0);
      const product = analytics.product as ProductDeepDive | null;
      const trend = analytics.salesTrend as SalesTrend[];
      const customers = analytics.topCustomers as ProductTopCustomer[];
      const stats = useMemo(() => product ? [
            { label: 'Revenue', value: fmtCurrency(product.revenue), icon: <DollarSign size={14} />, accent: 'gold' as const },
            { label: 'Profit', value: fmtCurrency(product.profit), icon: <DollarSign size={14} />, accent: 'teal' as const },
            { label: 'Units Sold', value: fmt(product.total_quantity), icon: <Package size={14} />, accent: 'purple' as const },
            { label: 'Customers', value: fmt(product.distinct_customers), icon: <Users size={14} />, accent: 'gold' as const },
      ] : [], [product]);

      if (!Number.isFinite(itemId)) return <ProductEmpty message="The product ID in this URL is invalid." />;
      if (!analytics.loading && !product) return <ProductEmpty message="No product was found for this ID." />;

      return <div className="flex-1 flex flex-col min-h-screen">
            <TopBar title={product?.item_name ?? 'Product'} subtitle="Product intelligence and sales history" shouldNavigateBack />
            <main className="flex-1 space-y-6 p-6">
                  {analytics.error && <p className="rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">Unable to load product analytics: {analytics.error.message}</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">{analytics.loading ? Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-lg bg-bg-hover" />) : stats.map((stat, index) => <StatCard key={stat.label} {...stat} delay={index * 100} />)}</div>
                  {product && <div className="flex flex-wrap gap-3 text-xs text-ink-muted"><Badge variant={product.trend_status.includes('DECLINING') ? 'red' : 'teal'}>{product.trend_status}</Badge><span>{product.item_category ?? 'Uncategorised'}</span><span>Margin {fmtPercent(product.margin_pct)}</span><span>Discount impact {fmtCurrency(product.discount_impact)}</span></div>}
                  <TabList selectedValue={tab} onTabSelect={(_, data) => setTab(String(data.value))}><Tab value="overview">Overview</Tab><Tab value="trend">Sales trend</Tab><Tab value="customers">Top customers</Tab></TabList>
                  {tab === 'overview' && product && <Overview product={product} />}
                  {tab === 'trend' && <section className="rounded-lg border border-bg-border bg-bg-panel p-5 space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><CardHeader className="mb-0"><CardTitle>Revenue and units sold</CardTitle></CardHeader><div className="flex gap-2">{granularities.map((value) => <button key={value} type="button" onClick={() => analytics.setGranularity(value)} className={`rounded px-3 py-1.5 text-xs capitalize ${analytics.granularity === value ? 'bg-accent-gold/20 text-accent-gold' : 'text-ink-muted hover:bg-bg-hover'}`}>{value === 'biweekly' ? '2 weeks' : value}</button>)}</div></div>{trend.length ? <EChart option={buildSalesTrendOption(trend)} loading={analytics.trendLoading} height="340px" /> : <EmptyState message="No sales have been recorded for this product." />}</section>}
                  {tab === 'customers' && <section className="rounded-lg border border-bg-border bg-bg-panel p-5"><CardHeader><CardTitle>Top customers</CardTitle></CardHeader>{customers.length ? <EChart option={buildTopCustomersOption(customers)} height="340px" /> : <EmptyState message="No customer purchases are attached to this product." />}</section>}
            </main>
      </div>;
}

function Overview({ product }: { product: ProductDeepDive }) {
      const rows = [['Selling price', fmtCurrency(product.selling_price)], ['Cost price', fmtCurrency(product.cost_price)], ['COGS', fmtCurrency(product.cogs)], ['Gross revenue', fmtCurrency(product.gross_revenue)], ['Total orders', fmt(product.total_orders)], ['30-day daily velocity', fmt(product.avg_daily_velocity_30d)], ['Peak week', product.peak_week ?? '—'], ['Top buyer', product.top_customer_name ?? '—']];
      return <section className="rounded-lg border border-bg-border bg-bg-panel p-5"><CardHeader><CardTitle>Product overview</CardTitle></CardHeader><dl className="grid grid-cols-1 gap-px overflow-hidden rounded border border-bg-border md:grid-cols-2">{rows.map(([label, value]) => <div key={label} className="flex justify-between gap-4 bg-bg-base p-4"><dt className="text-xs text-ink-muted">{label}</dt><dd className="text-sm text-ink-primary">{value}</dd></div>)}</dl></section>;
}

function ProductEmpty({ message }: { message: string }) { return <div className="flex-1 flex flex-col min-h-screen"><TopBar title="Product" subtitle="Product intelligence and sales history" shouldNavigateBack /><main className="flex-1 p-6"><EmptyState message={message} /></main></div>; }
