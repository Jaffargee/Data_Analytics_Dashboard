import { BarChart2, LineChart, Package, ShoppingCart, TrendingUp } from 'lucide-react'
import { Card, CardHeader } from '@fluentui/react-components'
import SkeletonCard from '../../components/ui/primitives/SkeletonCard'
import StatCard from '../../components/ui/primitives/StatCard'
import ReactECharts from 'echarts-for-react';
import { TopBar } from '../../components/ui/TopBar';
import { useDailySnapshot, useRevenueDaily, useRevenueMonthly, useBestSelling, useCategoryPerf } from '../../hooks/supabase_hook';
import { fmt, fmtCurrency, fmtMonthLabel, today } from '../../lib/utils'
import CardTitle from '../../components/ui/primitives/CardTitle'
import EmptyState from '../../components/ui/primitives/EmptyState'
import SalesAnalyzer from './components/SalesAnalyzer';

const DONUT_COLORS = [
      '#f5c842',
      '#2dd4bf',
      '#a78bfa',
      '#f87171',
      '#fb923c',
      '#34d399',
];

const OverView = () => {

      const daily = useRevenueDaily(30);
      const monthly = useRevenueMonthly();
      const items = useBestSelling(15);
      const cats = useCategoryPerf();
      const snap = useDailySnapshot(today());

      const snapMap = Object.fromEntries(
            (snap.data ?? []).map((r) => [r.metric, r.value])
      );
      const revenue = snapMap['revenue'] ?? 0;
      const numSales = snapMap['num_sales'] ?? 0;
      const soldToday = snapMap['items_sold'] ?? 0;
      const avgSale = snapMap['avg_sale_value'] ?? 0;

      const monthlyForChart = [...(monthly.data ?? [])]
            .reverse()
            .slice(-12)
            .map((r) => ({
                  label: fmtMonthLabel(r.month),
                  value: Number(r.revenue),
            }));

      const dailyForChart = [...(daily.data ?? [])]
            .reverse()
            .slice(-90)
            .map((r) => ({
                  label: r.sale_date.slice(5),
                  value: Number(r.revenue),
            }));


      const topItems = (items.data ?? []).slice(0, 15).map((d) => ({
            label:
                  d.item_name.length > 22
                        ? d.item_name.slice(0, 22) + '…'
                        : d.item_name,
            value: Number(d.total_revenue),
      }));

      const catData = (cats.data ?? []).slice(0, 6).map((c, i) => ({
            name: c.category,
            value: Number(c.total_revenue),
            itemStyle: { color: DONUT_COLORS[i % DONUT_COLORS.length] } 
      }));

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
                  <main className="flex-1 p-6 space-y-6">

                        {/* KPI Row */}
                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                              {snap.loading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                          <SkeletonCard key={i} />
                                    ))
                              ) : (
                                    <>
                                          <StatCard
                                                label="Revenue Today"
                                                value={fmtCurrency(revenue)}
                                                sub="Based on today's sales"
                                                icon={<TrendingUp size={14} />}
                                                accent="gold"
                                                delay={0}
                                          />
                                          <StatCard
                                                label="Sales Today"
                                                value={fmt(numSales)}
                                                sub="Completed transactions"
                                                icon={
                                                      <ShoppingCart size={14} />
                                                }
                                                accent="teal"
                                                delay={100}
                                          />
                                          <StatCard
                                                label="Items Sold"
                                                value={fmt(soldToday)}
                                                sub="Units moved today"
                                                icon={<Package size={14} />}
                                                accent="purple"
                                                delay={200}
                                          />
                                          <StatCard
                                                label="Avg Sale Value"
                                                value={fmtCurrency(avgSale)}
                                                sub="Per transaction"
                                                icon={<BarChart2 size={14} />}
                                                accent="gold"
                                                delay={300}
                                          />
                                    </>
                              )}
                        </div>

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
                                    <CardHeader header={
                                          <div className='flex flex-row items-center gap-2'>
                                                <CardTitle>
                                                      Daily Revenue — Last 30 Days
                                                </CardTitle>
                                                <span className="text-xs font-mono text-accent-teal">
                                                      ₦ NGN
                                                </span>
                                          </div>
                                    } />
                                    {daily.loading ? (
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
                                    <CardHeader header={
                                          <div className='flex flex-row items-center gap-2'>
                                                <CardTitle>Monthly Revenue</CardTitle>
                                                <span className="text-sm font-mono text-accent-gold">
                                                      ₦ NGN
                                                </span>
                                          </div>
                                    } />
                                    {monthly.loading ? (
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
                                    <CardHeader header={
                                          <div className='flex flex-row items-center gap-2'>
                                                <CardTitle>
                                                      Revenue by Category
                                                </CardTitle>
                                          </div>
                                    } />
                                    {cats.loading ? (
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
                                    <CardHeader header={
                                          <div className='flex flex-row items-center gap-2'>
                                                <CardTitle>
                                                      Top 5 Items by Revenue
                                                </CardTitle>
                                          </div>
                                    } />
                                    {items.loading ? (
                                          <div className="h-48 bg-bg-hover animate-pulse rounded-lg" />
                                    ) : topItems.length ? (
                                          <ReactECharts option={option4} />
                                    ) : (
                                          <EmptyState />
                                    )}
                              </Card>

                        </div>

                        <SalesAnalyzer />

                  </main>
            </div>
      )
}

export default OverView