import React from 'react';
import { TopBar } from '../../components/ui/TopBar';
import StatCard from '../../components/ui/primitives/StatCard';
import { DollarSign, Package, TrendingUp, Percent, Plus } from 'lucide-react';
import { fmtCurrency, fmt, fmtPercent } from '@/lib/utils';
import { useProductsData } from './hooks';
import { ProductCharts } from './components/ProductCharts';
import { CategoryPerformance } from './components/CategoryPerformance';
import { ProductsTable } from './components/ProductsTable';
import TableSearch from "../../components/ui/TableSearch";

export default function ProductsPage() {
      const { items, cats, allItems, totals, top10Chart, catDonut } = useProductsData();

      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar
                        title="Products"
                        subtitle="Sales performance by item and category"
                  />
                  <main className="flex-1 space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 px-4 py-4">
                              <StatCard
                                    label="Total Revenue"
                                    value={fmtCurrency(totals.totalRevenue)}
                                    icon={<DollarSign size={14} />}
                                    accent="gold"
                                    delay={0}
                              />
                              <StatCard
                                    label="Units Sold"
                                    value={fmt(totals.totalQty)}
                                    icon={<Package size={14} />}
                                    accent="teal"
                                    delay={100}
                              />
                              <StatCard
                                    label="Gross Profit"
                                    value={fmtCurrency(totals.totalProfit)}
                                    icon={<TrendingUp size={14} />}
                                    accent="purple"
                                    delay={200}
                              />
                              <StatCard
                                    label="Avg Margin"
                                    value={fmtPercent(totals.avgMargin)}
                                    icon={<Percent size={14} />}
                                    accent="gold"
                                    delay={300}
                              />
                        </div>

                        <ProductCharts
                              top10Chart={top10Chart}
                              catDonut={catDonut}
                              itemsLoading={items.loading}
                              catsLoading={cats.loading}
                        />

                        <CategoryPerformance data={cats.data ?? []} />

                        <TableSearch search="" setSearch={() => {}} title="New Product" icon={Plus} withButton={true} />

                        <ProductsTable
                              allItems={items.data}
                              maxRevenue={totals.maxRevenue}
                        />
                        
                  </main>
            </div>
      );
}