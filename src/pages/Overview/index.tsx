import { TopBar } from '@/components/ui';
import { CardHeader, CardTitle, Stats, EmptyState } from '@/components/ui/controls/primitives';
import { fmtCurrency, fmt, fmtMonthLabel, today } from '@/lib/utils';
import { useRevenueDaily, useRevenueMonthly, useCategoryPerf, useDailySnapshot, useBestSelling } from '@/hooks/data';
import { BarChart2, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { Card } from "@fluentui/react-components";
import ReactECharts from 'echarts-for-react';

const DONUT_COLORS = [
      '#f5c842',
      '#2dd4bf',
      '#a78bfa',
      '#f87171',
      '#fb923c',
      '#34d399',
];


export default function Overview () {

      const daily = useRevenueDaily(30);
      const monthly = useRevenueMonthly();
      const items = useBestSelling(15);
      const cats = useCategoryPerf();
      const snap = useDailySnapshot(today());

      const snapMap = Object.fromEntries(
            (snap.data?.data ?? []).map((r: { metric: string; value: number }) => [r.metric, r.value])
      );
      const revenue = snapMap['revenue'] ?? 0;
      const numSales = snapMap['num_sales'] ?? 0;
      const soldToday = snapMap['items_sold'] ?? 0;
      const avgSale = snapMap['avg_sale_value'] ?? 0;

      const monthlyForChart = [...(monthly.data?.data ?? [])]
            .reverse()
            .slice(-12)
            .map((r) => ({
                  label: fmtMonthLabel(r.month),
                  value: Number(r.revenue),
            }));

      const dailyForChart = [...(daily.data?.data ?? [])]
            .reverse()
            .slice(-90)
            .map((r) => ({
                  label: r.sale_date.slice(5),
                  value: Number(r.revenue),
            }));


      const topItems = (items.data?.data ?? []).slice(0, 15).map((d: { item_name: string; total_revenue: number }) => ({
            label: d.item_name.length > 22
                        ? d.item_name.slice(0, 22) + '…'
                        : d.item_name,
            value: Number(d.total_revenue),
      }));

      const catData = (cats.data?.data ?? []).slice(0, 6).map((c: { category: string; total_revenue: number }, i: number) => ({
            name: c.category,
            value: Number(c.total_revenue),
            itemStyle: { color: DONUT_COLORS[i % DONUT_COLORS.length] } 
      }));

      const kpis = [
            {
                  label: "Revenue Today",
                  value: fmtCurrency(revenue),
                  sub: "Based on today's sales",
                  icon: <TrendingUp size={24} />,
                  accent: "gold",
                  delay: 0
            },
            {
                  label: "Sales Today",
                  value: fmt(numSales),
                  sub: "Completed transactions",
                  icon: <ShoppingCart size={24} />,
                  accent: "teal",
                  delay: 0
            },
            {
                  label: "Items Sold Today",
                  value: fmt(soldToday),
                  sub: "Units moved today",
                  icon: <Package size={24} />,
                  accent: "purple",
                  delay: 0
            },
            {
                  label: "Avg Sale Value",
                  value: fmtCurrency(avgSale),
                  sub: "Per transaction",
                  icon: <BarChart2 size={24} />,
                  accent: "gold",
                  delay: 0
            },
      ]

            const option = {
            title: { text: 'DAILY REVENUE' },
            tooltip: { trigger: 'axis' },
            xAxis: {
                  type: 'category',
                  data: dailyForChart.map(item => item.label) // convert timestamps
            },
            yAxis: { type: 'value' },
            series: [
                  {
                        name: 'Daily Revenue',
                        type: 'line',
                        data: dailyForChart.map(item => item.value), // your real sales
                        itemStyle: { color: '#f5c842', type: 'dashed' }
                  },
            ]
      };    

      const option2 = {
            title: { text: 'MONTHLY REVENUE' },
            tooltip: { trigger: 'axis' },
            xAxis: {
                  type: 'category',
                  data: monthlyForChart.map(item => item.label) // convert timestamps
            },
            yAxis: { type: 'value' },
            series: [
                  {
                        name: 'Monthly Revenue',
                        type: 'bar',
                        data: monthlyForChart.map(item => item.value), // your real sales
                        itemStyle: { color: '#f5c842', type: 'dashed' }
                  },
            ]
      };

      const option3 = {
            title: {
                  text: "Category Revenue",
                  left: "left",
                  top: "left"
            },
            tooltip: {
                  trigger: "item",
                  formatter: (params: any) =>
                  `${params.name}\n${params.value.toLocaleString("en-US", {
                        style: "currency",
                        currency: "NGN"
                  })}`
            },
            legend: {
                  orient: "vertical",
                  left: "left"
            },
            series: [
                  {
                        type: "pie",
                        radius: ["40%", "70%"], // donut effect
                        avoidLabelOverlap: false,
                        label: {
                              show: false,
                              position: "center",
                              formatter: (params: any) =>
                              `${params.name}\n\n${params.value.toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "NGN"
                              })}`
                        },
                        emphasis: {
                              label: {
                                    show: true,
                                    fontSize: "16",
                                    fontWeight: "bold",
                              }
                        },
                        data: catData
                  }
            ]
      };

      const option4 = {
            title: { text: 'Top 5 Items by Revenue' },
            tooltip: { trigger: 'axis' },
            xAxis: {
                  type: 'category',
                  data: topItems.map(item => item.label) // convert timestamps
            },
            yAxis: { type: 'value' },
            series: [
                  {
                        name: 'Top 5 Items by Revenue',
                        type: 'bar',
                        data: topItems.map(item => item.value), // your real sales
                        itemStyle: { color: '#f5c842', type: 'dashed' }
                  },
            ]
      };

      return (
            <div className='flex-1 flex flex-col min-h-screen'>
                  <TopBar
                        title="Overview"
                        subtitle="All-time performance snapshot"
                  />
                  
                  <main className="flex-1 space-y-6">

                        {/* KPI Row */}
                        <Stats stats={kpis} />

                        {/* Revenue charts row */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                              <Card
                                    appearance='outline'   
                                    className="animate-fade-up opacity-0-init"
                                    style={{
                                          animationDelay: '150ms',
                                          animationFillMode: 'forwards',
                                    }}
                              >
                                    <CardHeader>
                                          <div className='flex flex-row items-center gap-2'>
                                                <CardTitle>
                                                      Daily Revenue — Last 30 Days
                                                </CardTitle>
                                                <span className="text-xs font-mono text-accent-teal">
                                                      ₦ NGN
                                                </span>
                                          </div>
                                    </CardHeader>
                                    {daily.isLoading ? (
                                          <div className="h-48 bg-bg-hover animate-pulse rounded-lg" />
                                    ) : dailyForChart.length ? (
                                          <ReactECharts option={option} />
                                    ) : (
                                          <EmptyState />
                                    )}
                              </Card>

                              <Card
                                    appearance='outline'
                                    className="animate-fade-up opacity-0-init"
                                    style={{
                                          animationDelay: '250ms',
                                          animationFillMode: 'forwards',
                                    }}
                              >
                                    <CardHeader>
                                          <div className='flex flex-row items-center gap-2'>
                                                <CardTitle>Monthly Revenue</CardTitle>
                                                <span className="text-sm font-mono text-accent-gold">
                                                      ₦ NGN
                                                </span>
                                          </div>
                                    </CardHeader>
                                    {monthly.isLoading ? (
                                          <div className="h-48 bg-bg-hover animate-pulse rounded-lg" />
                                    ) : monthlyForChart.length ? (
                                          <ReactECharts option={option2} />
                                    ) : (
                                          <EmptyState />
                                    )}
                              </Card>
                        </div>

                        {/* Bottom row */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                              <Card
                                    appearance='outline'
                                    className="animate-fade-up opacity-0-init"
                                    style={{
                                          animationDelay: '300ms',
                                          animationFillMode: 'forwards',
                                    }}
                              >
                                    <CardHeader>
                                          <div className='flex flex-row items-center gap-2'>
                                                <CardTitle>
                                                      Revenue by Category
                                                </CardTitle>
                                          </div>
                                    </CardHeader>
                                    {cats.isLoading ? (
                                          <div className="h-48 bg-bg-hover animate-pulse rounded-lg" />
                                    ) : catData.length ? (
                                          <ReactECharts option={option3} />
                                    ) : (
                                          <EmptyState />
                                    )}
                              </Card>

                              <Card
                                    appearance='outline'
                                    className="animate-fade-up opacity-0-init"
                                    style={{
                                          animationDelay: '400ms',
                                          animationFillMode: 'forwards',
                                    }}
                              >
                                    <CardHeader>
                                          <div className='flex flex-row items-center gap-2'>
                                                <CardTitle>
                                                      Top 5 Items by Revenue
                                                </CardTitle>
                                          </div>
                                    </CardHeader>
                                    {items.isLoading ? (
                                          <div className="h-48 bg-bg-hover animate-pulse rounded-lg" />
                                    ) : topItems.length ? (
                                          <ReactECharts option={option4} />
                                    ) : (
                                          <EmptyState />
                                    )}
                              </Card>

                        </div>

                  </main>

            </div>
      )
}