import StatCard from '../../components/ui/primitives/StatCard';
import { Card } from '@fluentui/react-components';
import CardHeader from '../../components/ui/primitives/CardHeader';
import CardTitle from '../../components/ui/primitives/CardTitle';
import { Badge, EmptyState } from '@/components/ui/primitives';
import { TopBar } from '../../components/ui/TopBar';
import TableSearch from '../../components/ui/TableSearch';
import DataTable, { ColumnDef } from '../../components/ui/DataTable';
import { useSaleDetail, useSaleItemsDetail, useSalePayments } from '@/hooks/data';
import type { SaleItemDetail } from '@/hooks/data';
import { fmt, fmtCurrency, fmtDate } from '@/lib/utils';
import { ArrowUp, Loader2, Plus, ShoppingCart, Users, Calendar, User, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';

export default function CustomerSales() {
      const [query, setQuery] = useState<string>('');
      const [filter, setFilter] = useState<string>('');

      const { sales_id } = useParams();
      const posSaleId = sales_id ? Number(sales_id) : undefined;
      const [params] = useSearchParams();
      const ctm_name = params.get('ctm_name');

      const sale = useSaleDetail(posSaleId);
      const saleItems = useSaleItemsDetail(posSaleId);
      const payments = useSalePayments(posSaleId);

      const loading = sale.isLoading || saleItems.isLoading;
      const saleRow = sale.data?.data?.[0];
      const items = saleItems.data?.data ?? [];
      const paymentRows = payments.data?.data ?? [];

      const totals = useMemo(() => {
            const profit = items.reduce((sum, r) => sum + Number(r.gross_profit ?? 0), 0);
            return { profit };
      }, [items]);

      // Sold vs Returned — used as the filter dropdown options
      const ctm_category = useMemo(() => [{ value: 'Sold', label: 'Sold' }, { value: 'Returned', label: 'Returned' }], []);

      const filtered = useMemo(() => {
            return items.filter((r) => {
                  const matchesQuery =
                        (r.name ?? '').toLowerCase().includes(query.toLowerCase()) ||
                        (r.pos_item_id?.toString() ?? '').includes(query) ||
                        (fmt(r.total) ?? '').includes(query.toLowerCase()) ||
                        (r.total?.toString() ?? '').includes(query.toLowerCase());

                  const matchesFilter =
                        !filter ||
                        (filter === 'Sold' && r.quantity > 0) ||
                        (filter === 'Returned' && r.quantity < 0);

                  return matchesQuery && matchesFilter;
            });
      }, [items, query, filter]);

      // Quantity + total per item, for the per-product breakdown chart
      const chartData = useMemo(() => {
            return [...items]
                  .map((r) => ({
                        name: r.name,
                        quantity: Number(r.quantity) || 0,
                        total: Number(r.total) || 0,
                  }))
                  .sort((a, b) => b.total - a.total);
      }, [items]);

      const columns: ColumnDef<SaleItemDetail>[] = [
            {
                  key: 'pos_item_id',
                  label: 'ID',
                  sortable: true,
                  width: '0.8fr',
            },
            {
                  key: 'name',
                  label: 'Name',
                  sortable: true,
                  width: '2fr',
            },
            {
                  key: 'quantity',
                  label: 'Quantity',
                  sortable: true,
                  align: 'right',
                  width: '1fr',
            },
            {
                  key: 'unit_price',
                  label: 'Unit Price',
                  sortable: true,
                  align: 'right',
                  width: '1.2fr',
                  sortValue: (r) => Number(r.unit_price),
                  render: (r) => fmtCurrency(r.unit_price),
            },
            {
                  key: 'gross_profit',
                  label: 'Profit',
                  sortable: true,
                  align: 'right',
                  width: '1.1fr',
                  sortValue: (r) => Number(r.gross_profit),
                  render: (r) => (
                        <span className={Number(r.gross_profit) < 0 ? 'text-accent-red' : 'text-ink-secondary'}>
                              {fmtCurrency(r.gross_profit)}
                        </span>
                  ),
            },
            {
                  key: 'total',
                  label: 'Total',
                  sortable: true,
                  align: 'right',
                  width: '1.2fr',
                  sortValue: (r) => Number(r.total),
                  render: (r) => (
                        <span className="font-mono text-accent-gold font-medium">
                              {fmtCurrency(r.total)}
                        </span>
                  ),
            },
      ];

      const displayName = saleRow?.customer_name || ctm_name || 'Walk-in Customer';

      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar
                        title={`Sale #${posSaleId ?? ''}`}
                        subtitle={displayName}
                        shouldNavigateBack
                  />

                  <main className="flex-1 p-6 space-y-6">
                        {loading ? (
                              <div className="flex h-full w-full relative items-center justify-center gap-2">
                                    <Loader2
                                          size={18}
                                          className="text-accent-gold animate-spin shrink-0"
                                    />
                                    <p className="text-ink-muted font-body">
                                          Loading...
                                    </p>
                              </div>
                        ) : !saleRow ? (
                              <EmptyState message="Sale not found." />
                        ) : (
                              <div className="flex flex-col gap-2 space-y-4">
                                    <Card>
                                          <CardHeader>
                                                <CardTitle>Sale Details</CardTitle>
                                                {saleRow.salesperson && (
                                                      <Badge variant="teal">{saleRow.salesperson}</Badge>
                                                )}
                                          </CardHeader>
                                          <div className="flex flex-wrap gap-x-8 gap-y-3 px-1 pb-1">
                                                <div className="flex items-center gap-2 text-xs text-ink-secondary">
                                                      <Calendar size={13} className="text-ink-faint" />
                                                      {fmtDate(saleRow.invoice_datetime)}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-ink-secondary">
                                                      <User size={13} className="text-ink-faint" />
                                                      {displayName}
                                                      {saleRow.is_anonymous_customer && (
                                                            <span className="text-ink-faint">(anonymous)</span>
                                                      )}
                                                </div>
                                                {paymentRows.length > 0 && (
                                                      <div className="flex items-center gap-2 text-xs text-ink-secondary">
                                                            <Wallet size={13} className="text-ink-faint" />
                                                            <div className="flex flex-wrap gap-1.5">
                                                                  {paymentRows.map((p, i) => (
                                                                        <Badge key={`${p.account}-${i}`} variant="gold">
                                                                              {p.account}: {fmtCurrency(p.amount)}
                                                                        </Badge>
                                                                  ))}
                                                            </div>
                                                      </div>
                                                )}
                                                {saleRow.comment && (
                                                      <div className="text-xs text-ink-muted italic">
                                                            &ldquo;{saleRow.comment}&rdquo;
                                                      </div>
                                                )}
                                          </div>
                                    </Card>

                                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
                                          <StatCard
                                                label="Revenue"
                                                value={fmtCurrency(saleRow.invoice_total)}
                                                icon={<Users size={14} />}
                                                accent="gold"
                                                delay={0}
                                          />
                                          <StatCard
                                                label="Profit"
                                                value={fmtCurrency(totals.profit)}
                                                icon={<ArrowUp size={14} />}
                                                accent="teal"
                                                delay={100}
                                          />
                                          <StatCard
                                                label="Total Items Bought"
                                                value={fmt(saleRow.items_sold)}
                                                icon={<ShoppingCart size={14} />}
                                                accent="teal"
                                                delay={100}
                                          />
                                          <StatCard
                                                label="Total Items Returned"
                                                value={fmt(saleRow.items_returned)}
                                                icon={<ShoppingCart size={14} />}
                                                accent="red"
                                                delay={100}
                                          />
                                    </div>

                                    <Card>
                                          <CardHeader>
                                                <CardTitle>Items Breakdown</CardTitle>
                                          </CardHeader>
                                          <div className="p-4 h-72">
                                                <ReactECharts
                                                      style={{ height: '100%', width: '100%' }}
                                                      option={{
                                                            tooltip: {
                                                                  trigger: 'axis',
                                                                  axisPointer: { type: 'shadow' },
                                                                  formatter: (params: any[]) => {
                                                                        const label = params[0]?.axisValue ?? '';
                                                                        const rows = params
                                                                              .map((p) => {
                                                                                    const val =
                                                                                          p.seriesName === 'Total'
                                                                                                ? fmtCurrency(p.value)
                                                                                                : p.value;
                                                                                    return `${p.marker} ${p.seriesName}: ${val}`;
                                                                              })
                                                                              .join('<br/>');
                                                                        return `${label}<br/>${rows}`;
                                                                  },
                                                            },
                                                            legend: {
                                                                  data: ['Total', 'Quantity'],
                                                                  textStyle: { color: 'var(--ink-muted)' },
                                                                  top: 0,
                                                            },
                                                            grid: { left: 50, right: 50, top: 40, bottom: 60 },
                                                            xAxis: {
                                                                  type: 'category',
                                                                  data: chartData.map((d) => d.name),
                                                                  axisLabel: {
                                                                        color: 'var(--ink-muted)',
                                                                        fontSize: 11,
                                                                        rotate: 30,
                                                                        interval: 0,
                                                                  },
                                                                  axisLine: { lineStyle: { color: 'var(--bg-border)' } },
                                                            },
                                                            yAxis: [
                                                                  {
                                                                        type: 'value',
                                                                        name: 'Total',
                                                                        axisLabel: {
                                                                              color: 'var(--ink-muted)',
                                                                              fontSize: 11,
                                                                              formatter: (v: number) => fmtCurrency(v),
                                                                        },
                                                                        splitLine: { lineStyle: { color: 'var(--bg-border)' } },
                                                                  },
                                                                  {
                                                                        type: 'value',
                                                                        name: 'Quantity',
                                                                        axisLabel: { color: 'var(--ink-muted)', fontSize: 11 },
                                                                        splitLine: { show: false },
                                                                  },
                                                            ],
                                                            series: [
                                                                  {
                                                                        name: 'Total',
                                                                        type: 'bar',
                                                                        yAxisIndex: 0,
                                                                        data: chartData.map((d) => d.total),
                                                                        itemStyle: {
                                                                              color: 'var(--accent-gold)',
                                                                              borderRadius: [4, 4, 0, 0],
                                                                        },
                                                                  },
                                                                  {
                                                                        name: 'Quantity',
                                                                        type: 'line',
                                                                        yAxisIndex: 1,
                                                                        data: chartData.map((d) => d.quantity),
                                                                        smooth: true,
                                                                        symbol: 'none',
                                                                        lineStyle: { color: 'var(--accent-teal)', width: 2 },
                                                                  },
                                                            ],
                                                      }}
                                                />
                                          </div>
                                    </Card>

                                    <TableSearch
                                          search={query}
                                          filterValue={filter}
                                          title="Add Item"
                                          buttonIcon={Plus}
                                          setFilter={setFilter}
                                          setSearch={setQuery}
                                          filterOption={ctm_category}
                                          withButton
                                          withFilter
                                    />

                                    <DataTable
                                          data={filtered}
                                          columns={columns}
                                          getRowId={(row) => row.pos_item_id}
                                          ariaLabel="Sale items table"
                                          emptyMessage="No items match your search"
                                          defaultSortKey="total"
                                          defaultSortDir="desc"
                                    />

                              </div>
                        )}
                  </main>
            </div>
      );
}
