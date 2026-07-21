import { Card, CardHeader, ProgressBar } from "@fluentui/react-components";
import CardTitle from "../../../components/ui/primitives/CardTitle";
import { TopCustomer } from "../../../lib/supabase";
import { FetchState } from "../../../hooks/supabase_hook";
import ReactECharts from 'echarts-for-react';
import Badge from "../../../components/ui/primitives/Badge";
import { fmt } from "../../../lib/utils";

interface ChartsProps<T> {
      customers: FetchState<T>
}

export default function Charts({ customers }: ChartsProps<TopCustomer[]>) {
      const all = customers.data ?? [];

      const top10Chart = all.slice(0, 10).map((c: TopCustomer) => ({
            label: c.customer_name,
            // label: c.customer_name.split(' ')[0],
            value: Number(c.lifetime_value),
      }));

      const freq = { once: 0, repeat: 0, loyal: 0 };
      all.forEach((c: TopCustomer) => {
            const n = Number(c.total_purchases);
            if (n === 1) freq.once++;
            else if (n <= 5) freq.repeat++;
            else freq.loyal++;
      });

      const option = {
            title: { text: 'Top 10 by Lifetime Value' },
            tooltip: { trigger: 'axis' },
            xAxis: {
                  type: 'category',
                  data: top10Chart.map(item => item.label) // convert timestamps
            },
            yAxis: { type: 'value' },
            series: [
                  {
                        name: 'Revenue',
                        type: 'bar',
                        data: top10Chart.map(item => item.value), // your real sales
                        itemStyle: { color: '#f5c842', type: 'dashed' }
                  },
            ]
      }
      
      return (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 py-4 px-6">
                  <Card appearance="outline">
                        <CardHeader 
                              header={
                                    <CardTitle>
                                          Top 10 by Lifetime Value
                                    </CardTitle>
                              }
                        />
                        {customers.loading ? (
                              <div className="h-52 bg-bg-hover animate-pulse rounded-lg" />
                        ) : (
                              <ReactECharts option={option} />
                        )}
                  </Card>

                  <Card appearance="outline">
                        <CardHeader>
                              <CardTitle>
                                    Customer Frequency Segments
                              </CardTitle>
                        </CardHeader>
                        <div className="space-y-4 pt-2">
                              {[
                                    {
                                          label: 'One-time buyers',
                                          value: freq.once,
                                          color: 'warning' as const,
                                          desc: '1 purchase',
                                    },
                                    {
                                          label: 'Repeat customers',
                                          value: freq.repeat,
                                          color: 'success' as const,
                                          desc: '2–5 purchases',
                                    },
                                    {
                                          label: 'Loyal customers',
                                          value: freq.loyal,
                                          color: 'brand' as const,
                                          desc: '6+ purchases',
                                    },
                              ].map((seg) => (
                                    <div
                                          key={seg.label}
                                          className="flex items-center gap-4"
                                    >
                                          <div className="w-40 shrink-0">
                                                <p className="text-xs font-body text-ink-primary">
                                                      {seg.label}
                                                </p>
                                                <p className="text-[10px] text-ink-muted font-body">
                                                      {seg.desc}
                                                </p>
                                          </div>
                                          <div className="flex-1">
                                                <ProgressBar
                                                      value={
                                                            seg.value
                                                      }
                                                      max={
                                                            all.length ||
                                                            1
                                                      }
                                                      color={
                                                            seg.color
                                                      }
                                                />
                                          </div>
                                          <div className="w-16 text-right shrink-0">
                                                <Badge
                                                      variant={
                                                            "teal"
                                                      }
                                                >
                                                      {fmt(
                                                            seg.value
                                                      )}
                                                </Badge>
                                          </div>
                                    </div>
                              ))}
                        </div>
                  </Card>

            </div>
      )
}