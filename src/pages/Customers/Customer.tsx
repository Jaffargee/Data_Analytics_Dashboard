// import { Card } from '@fluentui/react-components';
// import CardHeader from '../../components/ui/primitives/CardHeader';
// import CardTitle from '../../components/ui/primitives/CardTitle';
// import StatCard from '../../components/ui/primitives/StatCard';
// import { TopBar } from '../../components/ui/TopBar';
// import DataTable, { ColumnDef } from '../../components/ui/DataTable';
// import { fmt, fmtCurrency, fmtDate, fmtPercent } from '@/lib/utils';
// import {
//       Calendar,
//       Clock,
//       Loader2,
//       Package,
//       Plus,
//       ShoppingCart,
//       Star,
//       Tag,
//       Users,
// } from 'lucide-react';
// import { useState } from 'react';
// import ReactECharts from 'echarts-for-react';
// import {
// 	Tab,
// 	TabList,
// 	TabValue,
// } from "@fluentui/react-components";
// import CustomerSales from "./components/CustomerSales";
// import useCustomerSalesData from "./ctmSalesData"

// const tabs = {
// 	sales: <CustomerSales />
// }

// export default function Customer() {
      
//       const { chartData, loading, ctm_name, report } = useCustomerSalesData();
//       const [selectedTab, setSelectedTab] = useState<TabValue>("home");

//       return (
//             <div className="flex-1 flex flex-col min-h-screen">
//                   <TopBar
//                         title={ctm_name as string}
//                         subtitle="Sales details by customer."
//                         onRefresh={async () => await fetchCustomerSalesData()}
//                         shouldNavigateBack
//                   />

//                   <main className="flex-1 space-y-6">
//                         {loading ? (
//                               <div className="flex h-full w-full relative items-center justify-center gap-2">
//                                     <Loader2
//                                           size={18}
//                                           className="text-accent-gold animate-spin shrink-0"
//                                     />
//                                     <p className="text-ink-muted font-body">Loading...</p>
//                               </div>
//                         ) : (
//                               <div className="flex flex-col gap-2 space-y-4">
                                    
//                                     <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4 px-6 py-4">
//                                           <StatCard
//                                                 label="Revenue"
//                                                 value={fmtCurrency(report?.summary.revenue)}
//                                                 icon={<Users size={14} />}
//                                                 accent="gold"
//                                                 delay={0}
//                                           />
//                                           <StatCard
//                                                 label="Profit"
//                                                 value={fmtCurrency(report?.summary.profit)}
//                                                 icon={<Users size={14} />}
//                                                 accent="teal"
//                                                 delay={0}
//                                           />
//                                           <StatCard
//                                                 label="Total Orders"
//                                                 value={fmt(report?.summary.total_orders)}
//                                                 icon={<ShoppingCart size={14} />}
//                                                 accent="teal"
//                                                 delay={100}
//                                           />
//                                           <StatCard
//                                                 label="Avg Order Value"
//                                                 value={fmtCurrency(report?.summary.avg_order_value)}
//                                                 icon={<Tag size={14} />}
//                                                 accent="teal"
//                                                 delay={200}
//                                           />
//                                           <StatCard
//                                                 label="Loyalty"
//                                                 value={fmtPercent(report?.summary.loyalty_score)}
//                                                 icon={<Star size={14} />}
//                                                 accent="purple"
//                                                 delay={300}
//                                           />
//                                           <StatCard
//                                                 label="Total Items Bought"
//                                                 value={fmt(report?.summary.total_items_bought)}
//                                                 icon={<Package size={14} />}
//                                                 accent="purple"
//                                                 delay={400}
//                                           />
//                                           <StatCard
//                                                 label="Total Items Returned"
//                                                 value={fmt(report?.summary.total_items_returned)}
//                                                 icon={<Package size={14} />}
//                                                 accent="red"
//                                                 delay={400}
//                                           />
//                                           <StatCard
//                                                 label="Visits"
//                                                 value={fmtDate(report?.summary.last_visit)}
//                                                 icon={<Calendar size={14} />}
//                                                 accent="gold"
//                                                 delay={500}
//                                           />
//                                           <StatCard
//                                                 label="Days Since Last Visit"
//                                                 value={fmt(report?.summary.days_since_last_visit)}
//                                                 icon={<Clock size={14} />}
//                                                 accent="purple"
//                                                 delay={600}
//                                           />
//                                     </div>

//                                     <div className="px-6 py-4"> 
//                                           <Card appearance="outline">
//                                                 <CardHeader>
//                                                       <CardTitle>Sales Trend</CardTitle>
//                                                 </CardHeader>
//                                                 <div className="p-4 h-72">
//                                                       <ReactECharts
//                                                             style={{ height: '100%', width: '100%' }}
//                                                             option={{
//                                                                   tooltip: {
//                                                                         trigger: 'axis',
//                                                                         axisPointer: { type: 'shadow' },
//                                                                         formatter: (params: any[]) => {
//                                                                               const date = params[0]?.axisValue ?? '';
//                                                                               const rows = params
//                                                                                     .map((p) => {
//                                                                                           const val =
//                                                                                                 p.seriesName === 'Revenue'
//                                                                                                       ? fmtCurrency(p.value)
//                                                                                                       : p.value;
//                                                                                           return `${p.marker} ${p.seriesName}: ${val}`;
//                                                                                     })
//                                                                                     .join('<br/>');
//                                                                               return `${date}<br/>${rows}`;
//                                                                         },
//                                                                   },
//                                                                   legend: {
//                                                                         data: ['Revenue', 'Items Sold'],
//                                                                         textStyle: { color: 'var(--ink-muted)' },
//                                                                         top: 0,
//                                                                   },
//                                                                   grid: { left: 50, right: 50, top: 40, bottom: 30 },
//                                                                   xAxis: {
//                                                                         type: 'category',
//                                                                         data: chartData.map((d) => d.date),
//                                                                         axisLabel: { color: 'var(--ink-muted)', fontSize: 11 },
//                                                                         axisLine: { lineStyle: { color: 'var(--bg-border)' } },
//                                                                   },
//                                                                   yAxis: [
//                                                                         {
//                                                                               type: 'value',
//                                                                               name: 'Revenue',
//                                                                               axisLabel: {
//                                                                                     color: '#a1a1aa',
//                                                                                     fontSize: 11,
//                                                                                     formatter: (v: number) => fmtCurrency(v),
//                                                                               },
//                                                                               splitLine: { lineStyle: { color: 'var(--bg-border)' } },
//                                                                         },
//                                                                         {
//                                                                               type: 'value',
//                                                                               name: 'Items Sold',
//                                                                               axisLabel: { color: '#a1a1aa', fontSize: 14 },
//                                                                               splitLine: { show: false },
//                                                                         },
//                                                                   ],
//                                                                   series: [
//                                                                         {
//                                                                               name: 'Revenue',
//                                                                               type: 'bar',
//                                                                               yAxisIndex: 0,
//                                                                               data: chartData.map((d) => d.revenue),
//                                                                               itemStyle: {
//                                                                                     color: '#f5c842',
//                                                                                     borderRadius: [4, 4, 0, 0],
//                                                                               },
//                                                                         },
//                                                                         {
//                                                                               name: 'Items Sold',
//                                                                               type: 'line',
//                                                                               yAxisIndex: 1,
//                                                                               data: chartData.map((d) => d.items),
//                                                                               smooth: true,
//                                                                               symbol: 'none',
//                                                                               lineStyle: { color: '#426ff5', width: 2 },
//                                                                         },
//                                                                   ],
//                                                             }}
//                                                       />
//                                                 </div>
//                                           </Card>
//                                     </div>

//                                     <TabList selectedValue={selectedTab} onTabSelect={(_, data) => setSelectedTab(data.value)} style={{ marginBottom: "24px" }}>
// 							<Tab value="sales">Sales</Tab>
// 				      	</TabList>

// 				      	{tabs[selectedTab]}

//                               </div>
//                         )}
//                   </main>
//             </div>
//       );
// }

import { Card } from '@fluentui/react-components';
import CardHeader from '../../components/ui/primitives/CardHeader';
import CardTitle from '../../components/ui/primitives/CardTitle';
import StatCard from '../../components/ui/primitives/StatCard';
import { TopBar } from '../../components/ui/TopBar';
import { fmt, fmtCurrency, fmtDate, fmtPercent } from '@/lib/utils';
import {
      Calendar,
      Clock,
      Loader2,
      Package,
      ShoppingCart,
      Star,
      Tag,
      Users,
} from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { Tab, TabList, TabValue } from '@fluentui/react-components';
import CustomerSales from './components/CustomerSales';
import CustomerProductIntelligence from './components/CustomerProductIntelligence';
import CustomerBehavior from './components/CustomerBehavior';
import useCustomerSalesData from './ctmSalesData';

export default function Customer() {
      const { id: customer_id } = useParams();
      const { chartData, loading, ctm_name, report, navigate } = useCustomerSalesData();
      const [selectedTab, setSelectedTab] = useState<TabValue>('sales');

      const tabs: Record<string, React.ReactNode> = {
            sales: <CustomerSales />,
            products: <CustomerProductIntelligence customerId={customer_id} />,
            behavior: <CustomerBehavior sales={report?.sales ?? []} />,
      };

      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar
                        title={ctm_name as string}
                        subtitle="Sales details by customer."
                        onRefresh={async () => await navigate(0)}
                        shouldNavigateBack
                  />

                  <main className="flex-1 space-y-6">
                        {loading ? (
                              <div className="flex h-full w-full relative items-center justify-center gap-2">
                                    <Loader2 size={18} className="text-accent-gold animate-spin shrink-0" />
                                    <p className="text-ink-muted font-body">Loading...</p>
                              </div>
                        ) : (
                              <div className="flex flex-col gap-2 space-y-4">
                                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4 px-6 py-4">
                                          <StatCard
                                                label="Revenue"
                                                value={fmtCurrency(report?.summary.revenue)}
                                                icon={<Users size={14} />}
                                                accent="gold"
                                                delay={0}
                                          />
                                          <StatCard
                                                label="Profit"
                                                value={fmtCurrency(report?.summary.profit)}
                                                icon={<Users size={14} />}
                                                accent="teal"
                                                delay={0}
                                          />
                                          <StatCard
                                                label="Total Orders"
                                                value={fmt(report?.summary.total_orders)}
                                                icon={<ShoppingCart size={14} />}
                                                accent="teal"
                                                delay={100}
                                          />
                                          <StatCard
                                                label="Avg Order Value"
                                                value={fmtCurrency(report?.summary.avg_order_value)}
                                                icon={<Tag size={14} />}
                                                accent="teal"
                                                delay={200}
                                          />
                                          <StatCard
                                                label="Loyalty"
                                                value={fmtPercent(report?.summary.loyalty_score)}
                                                icon={<Star size={14} />}
                                                accent="purple"
                                                delay={300}
                                          />
                                          <StatCard
                                                label="Total Items Bought"
                                                value={fmt(report?.summary.total_items_bought)}
                                                icon={<Package size={14} />}
                                                accent="purple"
                                                delay={400}
                                          />
                                          <StatCard
                                                label="Total Items Returned"
                                                value={fmt(report?.summary.total_items_returned)}
                                                icon={<Package size={14} />}
                                                accent="red"
                                                delay={400}
                                          />
                                          <StatCard
                                                label="Visits"
                                                value={fmtDate(report?.summary.last_visit)}
                                                icon={<Calendar size={14} />}
                                                accent="gold"
                                                delay={500}
                                          />
                                          <StatCard
                                                label="Days Since Last Visit"
                                                value={fmt(report?.summary.days_since_last_visit)}
                                                icon={<Clock size={14} />}
                                                accent="purple"
                                                delay={600}
                                          />
                                    </div>

                                    <div className="px-6 py-4">
                                          <Card appearance="outline">
                                                <CardHeader>
                                                      <CardTitle>Sales Trend</CardTitle>
                                                </CardHeader>
                                                <div className="p-4 h-72">
                                                      <ReactECharts
                                                            style={{ height: '100%', width: '100%' }}
                                                            option={{
                                                                  tooltip: {
                                                                        trigger: 'axis',
                                                                        axisPointer: { type: 'shadow' },
                                                                        formatter: (params: any[]) => {
                                                                              const date = params[0]?.axisValue ?? '';
                                                                              const rows = params
                                                                                    .map((p) => {
                                                                                          const val =
                                                                                                p.seriesName === 'Revenue'
                                                                                                      ? fmtCurrency(p.value)
                                                                                                      : p.value;
                                                                                          return `${p.marker} ${p.seriesName}: ${val}`;
                                                                                    })
                                                                                    .join('<br/>');
                                                                              return `${date}<br/>${rows}`;
                                                                        },
                                                                  },
                                                                  legend: {
                                                                        data: ['Revenue', 'Items Sold'],
                                                                        textStyle: { color: 'var(--ink-muted)' },
                                                                        top: 0,
                                                                  },
                                                                  grid: { left: 50, right: 50, top: 40, bottom: 30 },
                                                                  xAxis: {
                                                                        type: 'category',
                                                                        data: chartData.map((d) => d.date),
                                                                        axisLabel: { color: 'var(--ink-muted)', fontSize: 11 },
                                                                        axisLine: { lineStyle: { color: 'var(--bg-border)' } },
                                                                  },
                                                                  yAxis: [
                                                                        {
                                                                              type: 'value',
                                                                              name: 'Revenue',
                                                                              axisLabel: {
                                                                                    color: '#a1a1aa',
                                                                                    fontSize: 11,
                                                                                    formatter: (v: number) => fmtCurrency(v),
                                                                              },
                                                                              splitLine: { lineStyle: { color: 'var(--bg-border)' } },
                                                                        },
                                                                        {
                                                                              type: 'value',
                                                                              name: 'Items Sold',
                                                                              axisLabel: { color: '#a1a1aa', fontSize: 14 },
                                                                              splitLine: { show: false },
                                                                        },
                                                                  ],
                                                                  series: [
                                                                        {
                                                                              name: 'Revenue',
                                                                              type: 'bar',
                                                                              yAxisIndex: 0,
                                                                              data: chartData.map((d) => d.revenue),
                                                                              itemStyle: {
                                                                                    color: '#f5c842',
                                                                                    borderRadius: [4, 4, 0, 0],
                                                                              },
                                                                        },
                                                                        {
                                                                              name: 'Items Sold',
                                                                              type: 'line',
                                                                              yAxisIndex: 1,
                                                                              data: chartData.map((d) => d.items),
                                                                              smooth: true,
                                                                              symbol: 'none',
                                                                              lineStyle: { color: '#426ff5', width: 2 },
                                                                        },
                                                                  ],
                                                            }}
                                                      />
                                                </div>
                                          </Card>
                                    </div>

                                    <div className="px-6">
                                          <TabList
                                                selectedValue={selectedTab}
                                                onTabSelect={(_, data) => setSelectedTab(data.value)}
                                                style={{ marginBottom: '24px' }}
                                          >
                                                <Tab value="sales">Sales</Tab>
                                                <Tab value="products">Product Intelligence</Tab>
                                                <Tab value="behavior">Behavior</Tab>
                                          </TabList>

                                          {tabs[selectedTab as string]}
                                    </div>
                              </div>
                        )}
                  </main>
            </div>
      );
}