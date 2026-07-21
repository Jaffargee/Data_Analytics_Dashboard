import { Card, CardHeader } from '@fluentui/react-components';
import CardTitle from '../../../components/ui/primitives/CardTitle';
import Input2 from '../../../components/ui/Input/Input2';
import Button from '../../../components/ui/Button';
import ReactECharts from 'echarts-for-react';
import { LineChart, LoaderPinwheel } from 'lucide-react';
import { useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabase';

type Sale = {
      invoice_datetime: string;
      invoice_total: number;
      customer_name: string;
      pos_customer_id: number;
      items_sold: number;
};

function groupByDate(sales: Sale[]) {
      return sales.reduce((acc, s) => {
            const key = new Date(s.invoice_datetime).toISOString().split('T')[0];
            (acc[key] ??= []).push(s);
            return acc;
      }, {} as Record<string, Sale[]>);
}

function dailyStats(sales: Sale[], threshold: number) {
      const total = sales.reduce((s, x) => s + Number(x.invoice_total), 0);
      const sorted = [...sales].sort(
            (a, b) => Number(b.invoice_total) - Number(a.invoice_total)
      );
      const top1 = sorted[0] ? Number(sorted[0].invoice_total) : 0;
      const top3 = sorted
            .slice(0, 3)
            .reduce((s, x) => s + Number(x.invoice_total), 0);
      const aboveThreshold = sorted.filter(
            (s) => Number(s.invoice_total) >= threshold
      );
      const aboveRevenue = aboveThreshold.reduce(
            (s, x) => s + Number(x.invoice_total),
            0
      );

      return {
            count: sales.length,
            total,
            avgTicket: total / (sales.length || 1),
            maxSale: top1,
            top1Pct: total ? (top1 / total) * 100 : 0,
            top3Pct: total ? (top3 / total) * 100 : 0,
            uniqueCustomers: new Set(sales.map((s) => s.pos_customer_id)).size,
            topCustomer: sorted[0]?.customer_name ?? '-',
            aboveCount: aboveThreshold.length,
            abovePct: total ? (aboveRevenue / total) * 100 : 0,
      };
}

const SalesAnalyzer = () => {
      const [fromD, setFromD] = useState(
            new Date().toISOString().split('T')[0]
      );
      const [toD, setToD] = useState(new Date().toISOString().split('T')[0]);
      const [sales, setSales] = useState<Sale[]>([]);
      const [loading, setLoading] = useState(false);
      const [selectedDates, setSelectedDates] = useState<string[]>([]);
      const [threshold, setThreshold] = useState(500000);

      async function fetchSalesData() {
            try {
                  setLoading(true);
                  const { data, error } = await supabase
                        .from('sales')
                        .select(
                              'invoice_datetime, invoice_total, customer_name, pos_customer_id, items_sold'
                        )
                        .gte('invoice_datetime', fromD)
                        .lte('invoice_datetime', toD);

                  if (error) {
                        console.error('Sales Data Error:', error);
                        return;
                  }
                  if (data) {
                        setSales(data);
                        setSelectedDates(Object.keys(groupByDate(data)).sort());
                  }
            } finally {
                  setLoading(false);
            }
      }

      const grouped = useMemo(() => groupByDate(sales), [sales]);
      const allDates = useMemo(() => Object.keys(grouped).sort(), [grouped]);
      const activeDates = selectedDates.length ? selectedDates : allDates;

      // Rank axis: x = position when sales are sorted biggest-first, per day.
      // Evenly spaced by definition (1, 2, 3...) regardless of how many sales
      // happened or when they were entered into the system.
      const series = useMemo(() => {
            const base = activeDates.map((dateKey) => {
                  const daySales = (grouped[dateKey] ?? [])
                        .slice()
                        .sort(
                              (a, b) =>
                                    Number(b.invoice_total) -
                                    Number(a.invoice_total)
                        );

                  return {
                        name: dateKey,
                        type: 'line',
                        symbolSize: 8,
                        data: daySales.map((s, i) => [
                              i + 1,
                              Number(s.invoice_total),
                              s.customer_name,
                        ]),
                  };
            });

            // Flat threshold line across the max rank width so it's visible under every series
            const maxRank = Math.max(1, ...base.map((s) => s.data.length));
            const thresholdLine = {
                  name: `Threshold ₦${threshold.toLocaleString()}`,
                  type: 'line',
                  lineStyle: { type: 'dashed', color: '#888', width: 1 },
                  symbol: 'none',
                  data: [
                        [1, threshold],
                        [maxRank, threshold],
                  ],
                  tooltip: { show: false },
                  z: 0,
            };

            return [...base, thresholdLine];
      }, [activeDates, grouped, threshold]);

      const option = {
            title: {
                  text: 'Sales Ranked by Value (per day, overlaid)',
                  left: 'center',
            },
            tooltip: {
                  trigger: 'item',
                  formatter: (p: any) => {
                        if (!p.data?.[2]) return `${p.seriesName}`;
                        const [rank, val, name] = p.data;
                        return `${p.seriesName} · #${rank}<br/>${name}<br/><b>₦${Number(val).toLocaleString()}</b>`;
                  },
            },
            legend: { type: 'scroll', orient: 'horizontal', top: 30 },
            grid: { top: 80 },
            xAxis: {
                  type: 'value',
                  name: 'Sale rank (1 = biggest)',
                  minInterval: 1,
            },
            yAxis: { type: 'value', name: 'Sale amount' },
            series,
      };

      const stats = useMemo(
            () =>
                  activeDates.map((d) => ({
                        date: d,
                        ...dailyStats(grouped[d] ?? [], threshold),
                  })),
            [activeDates, grouped, threshold]
      );

      return (
            <div className="flex flex-col w-full relative gap-4">
                  <Card appearance="outline" className="w-full">
                        <div className="px-4 py-2 w-full flex flex-row items-center justify-between gap-4 flex-wrap">
                              <CardHeader
                                    header={
                                          <CardTitle>SALES ANALYZER</CardTitle>
                                    }
                              />
                              <div className="flex flex-row items-center justify-center gap-4 flex-wrap">
                                    <Input2
                                          radius="full"
                                          value={fromD}
                                          onChange={setFromD}
                                          type="date"
                                    />
                                    <Input2
                                          radius="full"
                                          value={toD}
                                          onChange={setToD}
                                          type="date"
                                    />
                                    <Input2
                                          radius="full"
                                          value={String(threshold)}
                                          onChange={(v) =>
                                                setThreshold(Number(v) || 0)
                                          }
                                          type="number"
                                          placeholder="Threshold"
                                    />
                                    <Button
                                          onClick={fetchSalesData}
                                          radius="full"
                                          variant="accent"
                                          icon={
                                                loading ? (
                                                      <LoaderPinwheel
                                                            className="animate-spin"
                                                            size={18}
                                                      />
                                                ) : (
                                                      <LineChart size={18} />
                                                )
                                          }
                                    >
                                          <span>Analyze</span>
                                    </Button>
                              </div>
                        </div>

                        {allDates.length > 0 && (
                              <div className="flex flex-wrap gap-2 px-4 pb-2">
                                    {allDates.map((d) => {
                                          const active =
                                                selectedDates.includes(d);
                                          return (
                                                <button
                                                      key={d}
                                                      onClick={() =>
                                                            setSelectedDates(
                                                                  (prev) =>
                                                                        prev.includes(
                                                                              d
                                                                        )
                                                                              ? prev.filter(
                                                                                      (
                                                                                            x
                                                                                      ) =>
                                                                                            x !==
                                                                                            d
                                                                                )
                                                                              : [
                                                                                      ...prev,
                                                                                      d,
                                                                                ]
                                                            )
                                                      }
                                                      className={`text-xs px-3 py-1 rounded-full border ${
                                                            active
                                                                  ? 'bg-yellow-500 text-black border-yellow-500'
                                                                  : 'border-neutral-600 text-neutral-300'
                                                      }`}
                                                >
                                                      {d}
                                                </button>
                                          );
                                    })}
                              </div>
                        )}

                        <ReactECharts option={option} style={{ height: 420 }} />
                  </Card>

                  {stats.length > 0 && (
                        <Card
                              appearance="outline"
                              className="w-full p-4 overflow-x-auto"
                        >
                              <table className="w-full text-sm">
                                    <thead>
                                          <tr className="text-left text-neutral-400">
                                                <th className="pr-4 py-1">
                                                      Date
                                                </th>
                                                <th className="pr-4">
                                                      Revenue
                                                </th>
                                                <th className="pr-4">
                                                      # Sales
                                                </th>
                                                <th className="pr-4">
                                                      Avg Ticket
                                                </th>
                                                <th className="pr-4">
                                                      Max Sale
                                                </th>
                                                <th className="pr-4">
                                                      Top 1 %
                                                </th>
                                                <th className="pr-4">
                                                      Top 3 %
                                                </th>
                                                <th className="pr-4">
                                                      # Above Threshold
                                                </th>
                                                <th className="pr-4">
                                                      % Rev Above Threshold
                                                </th>
                                                <th>Top Customer</th>
                                          </tr>
                                    </thead>
                                    <tbody>
                                          {stats.map((s) => (
                                                <tr
                                                      key={s.date}
                                                      className="border-t border-neutral-800"
                                                >
                                                      <td className="pr-4 py-1">
                                                            {s.date}
                                                      </td>
                                                      <td className="pr-4">
                                                            ₦
                                                            {s.total.toLocaleString()}
                                                      </td>
                                                      <td className="pr-4">
                                                            {s.count}
                                                      </td>
                                                      <td className="pr-4">
                                                            ₦
                                                            {Math.round(
                                                                  s.avgTicket
                                                            ).toLocaleString()}
                                                      </td>
                                                      <td className="pr-4">
                                                            ₦
                                                            {s.maxSale.toLocaleString()}
                                                      </td>
                                                      <td className="pr-4">
                                                            {s.top1Pct.toFixed(
                                                                  1
                                                            )}
                                                            %
                                                      </td>
                                                      <td className="pr-4">
                                                            {s.top3Pct.toFixed(
                                                                  1
                                                            )}
                                                            %
                                                      </td>
                                                      <td className="pr-4">
                                                            {s.aboveCount}
                                                      </td>
                                                      <td className="pr-4">
                                                            {s.abovePct.toFixed(
                                                                  1
                                                            )}
                                                            %
                                                      </td>
                                                      <td>{s.topCustomer}</td>
                                                </tr>
                                          ))}
                                    </tbody>
                              </table>
                        </Card>
                  )}
            </div>
      );
};

export default SalesAnalyzer;
