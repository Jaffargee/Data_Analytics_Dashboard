import StatCard from '../../components/ui/primitives/StatCard';
import { Card } from '@fluentui/react-components';
import CardHeader from '../../components/ui/primitives/CardHeader';
import CardTitle from '../../components/ui/primitives/CardTitle';
import { TopBar } from '../../components/ui/TopBar';
import TableSearch from '../../components/ui/TableSearch';
import DataTable, { ColumnDef } from '../../components/ui/DataTable';
import { executeSQL } from '@/lib/llm_utils';
import { fmt, fmtCurrency } from '@/lib/utils';
import { Report } from '@/types';
import { ArrowUp, Loader2, Plus, ShoppingCart, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';

interface SaleItemRow {
      pos_item_id: number | string;
      name: string;
      quantity: number;
      unit_price: number;
      total: number;
}

const customer_product_query = (pos_sale_id: number) => {
      return `
            SELECT json_build_object(
                  -- 📊 Summary block
                  'summary', (
                        SELECT json_build_object(
                              'total', ROUND(SUM(si.total), 2),
                              'total_items_bought', SUM(CASE WHEN si.quantity > 0 THEN si.quantity ELSE 0 END),
                              'total_items_returned', SUM(CASE WHEN si.quantity < 0 THEN si.quantity ELSE 0 END),
                              'profit', ROUND(SUM(si.total - (i.cost_price * si.quantity)), 2)
                        )
                        FROM sale_items si
                        JOIN items i ON si.pos_item_id = i.pos_item_id
                        WHERE si.pos_sale_id = ${pos_sale_id}
                  ),

                  -- 📋 Sales list
                  'sale_items', (
                        SELECT json_agg(t)
                        FROM (
                              SELECT
                                    *
                                    FROM sale_items s
                              WHERE s.pos_sale_id = ${pos_sale_id}
                        ) t
                  )
            ) AS result;

      `.trim();
};

export default function CustomerSales() {
      const [report, setReport] = useState<Report | null>(null);
      const [loading, setLoading] = useState(false);
      const [query, setQuery] = useState<string>('');
      const [filter, setFilter] = useState<string>('');

      const { sales_id: pos_sale_id } = useParams();
      const [params] = useSearchParams();
      const ctm_name = params.get('ctm_name');

      async function fetchCustomerSaleItemData() {
            try {
                  if (!pos_sale_id) return;
                  setLoading(true);

                  const sql_res = await executeSQL(
                        customer_product_query(parseInt(pos_sale_id as string))
                  );

                  if (!sql_res || !sql_res.rows) {
                        setReport({} as Report);
                        return;
                  }

                  const result = sql_res.rows[0]?.result as Report;
                  setReport(result);
            } catch (error) {
                  console.log(error);
            } finally {
                  setLoading(false);
            }
      }

      useEffect(() => {
            (async () => {
                  await fetchCustomerSaleItemData();
            })();
      }, []);

      // Sold vs Returned — used as the filter dropdown options
      const ctm_category = useMemo(() => ['Sold', 'Returned'], []);

      const filtered = useMemo(() => {
            const rows = (report?.sale_items ?? []) as SaleItemRow[];
            return rows.filter((r) => {
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
      }, [report, query, filter]);

      // Quantity + total per item, for the per-product breakdown chart
      const chartData = useMemo(() => {
            const rows = (report?.sale_items ?? []) as SaleItemRow[];
            return rows
                  .map((r) => ({
                        name: r.name,
                        quantity: Number(r.quantity) || 0,
                        total: Number(r.total) || 0,
                  }))
                  .sort((a, b) => b.total - a.total);
      }, [report]);

      const columns: ColumnDef<SaleItemRow>[] = [
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

      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar
                        title={ctm_name || 'Customer Sales'}
                        subtitle={`Sales history for customer #${pos_sale_id}`}
                        onRefresh={fetchCustomerSaleItemData}
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
                        ) : (
                              <div className="flex flex-col gap-2 space-y-4">
                                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
                                          <StatCard
                                                label="Revenue"
                                                value={fmtCurrency(report?.summary.total)}
                                                icon={<Users size={14} />}
                                                accent="gold"
                                                delay={0}
                                          />
                                          <StatCard
                                                label="Profit"
                                                value={fmt(report?.summary.profit)}
                                                icon={<ArrowUp size={14} />}
                                                accent="teal"
                                                delay={100}
                                          />
                                          <StatCard
                                                label="Total Items Bought"
                                                value={fmt(report?.summary.total_items_bought)}
                                                icon={<ShoppingCart size={14} />}
                                                accent="teal"
                                                delay={100}
                                          />
                                          <StatCard
                                                label="Total Items Returned"
                                                value={fmt(report?.summary.total_items_returned)}
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