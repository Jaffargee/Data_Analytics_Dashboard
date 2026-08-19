import { useMemo, useState } from "react";
import { Tab, TabList } from "@fluentui/react-components";
import { DollarSign, Percent, Users, AlertTriangle } from "lucide-react";

import Stats from "../../components/ui/primitives/Stats";
import { CardTitle, CardHeader } from "../../components/ui/primitives/"; // ADJUST path/names to match your actual exports
import DataTable from "../../components/ui/DataTable";
import EChart from "../../components/charts/EChart";
import TopBar from "../../components/ui/TopBar";
import DiscountByCategory from "./DiscountByCategory";

import { fmtCurrency } from "../../lib/utils";
import {
      type DiscountByItemRow,
      type DiscountByCustomerRow,
      type AbcRow,
      type DeadStockRow,
      type ChurnRiskRow,
      type RevenueAnomalyRow,
      type BelowCostRow,
} from "../../hooks/analytics/types";
import {
      buildRevenueGrowthOption,
      buildDiscountTrendOption,
      buildRetentionOption,
      buildAbcDonutOption,
} from "../../components/charts/charts";
import useAnalyticsDashboard from "@/hooks/analytics/use-analytics-dashboard";
import PriceSensitivityAnalytics from "./PriceSensitivityAnalytics"

import { DISCOUNT_ITEM_COLUMNS, CHURN_COLUMNS, DEAD_STOCK_COLUMNS, ABC_COLUMNS, DISCOUNT_CUSTOMER_COLUMNS, ANOMALY_COLUMNS, BELOW_COST_COLUMNS } from "@/hooks/analytics/constants"


export default function Insights(): JSX.Element {
      const [activeTab, setActiveTab] = useState<string>("revenue");
      const [discountByActiveTab, setDiscountByActiveTab] = useState<string>("discount_by_item");
      const [productsInnerActiveTab, setProductsInnerActiveTab] = useState<string>("slow_dead_items");

      const {
            revenueWeekly,
            discountByItem,
            discountByCustomer,
            discountTrend,
            deadStock,
            abc,
            retentionWeekly,
            churnRisk,
            anomalies,
            belowCost,
            dataQuality,
            loading,
            error,
      } = useAnalyticsDashboard();

      const revenueGrowthOption = useMemo(() => buildRevenueGrowthOption(revenueWeekly), [revenueWeekly]);
      const discountTrendOption = useMemo(() => buildDiscountTrendOption(discountTrend), [discountTrend]);
      const retentionOption = useMemo(() => buildRetentionOption(retentionWeekly), [retentionWeekly]);
      const abcDonutOption = useMemo(() => buildAbcDonutOption(abc), [abc]);

      const anomalyRows = useMemo(
            () => anomalies.filter((a) => a.anomaly_status === "SPIKE" || a.anomaly_status === "DIP"),
            [anomalies]
      );

      const dataQualityStats = useMemo(() => {
            if (!dataQuality) return [];
            return [
                  {
                        id: "sales-missing-customer",
                        label: "Sales Missing Customer",
                        value: `${dataQuality.sales_missing_customer} (${dataQuality.pct_sales_missing_customer}%)`,
                        icon: <Users size={14} />,
                        accent: "gold",
                        delay: 0,
                  },
                  {
                        id: "invoice-mismatches",
                        label: "Invoice Total Mismatches",
                        value: dataQuality.invoice_total_mismatches,
                        icon: <AlertTriangle size={14} />,
                        accent: "gold",
                        delay: 0.05,
                  },
                  {
                        id: "below-cost",
                        label: "Below-Cost Line Items",
                        value: dataQuality.below_cost_line_items,
                        icon: <DollarSign size={14} />,
                        accent: "gold",
                        delay: 0.1,
                  },
                  {
                        id: "total-sales",
                        label: "Total Sales",
                        value: dataQuality.total_sales,
                        icon: <Percent size={14} />,
                        accent: "gold",
                        delay: 0.15,
                  },
            ];
      }, [dataQuality]);

      const latestWeek = revenueWeekly[revenueWeekly.length - 1];

      const headlineStats = useMemo(() => {
            if (!latestWeek) return [];
            return [
                  {
                        id: "latest-revenue",
                        label: "This Week's Revenue",
                        value: fmtCurrency(latestWeek.revenue),
                        icon: <DollarSign size={14} />,
                        accent: "gold",
                        delay: 0,
                  },
                  {
                        id: "wow-growth",
                        label: "Week-over-Week Growth",
                        value: latestWeek.wow_growth_pct != null ? `${latestWeek.wow_growth_pct}%` : "—",
                        icon: <Percent size={14} />,
                        accent: "gold",
                        delay: 0.05,
                  },
                  {
                        id: "latest-margin",
                        label: "This Week's Margin",
                        value: `${latestWeek.margin_pct}%`,
                        icon: <Percent size={14} />,
                        accent: "gold",
                        delay: 0.1,
                  },
                  {
                        id: "latest-aov",
                        label: "Avg Order Value",
                        value: fmtCurrency(latestWeek.avg_order_value ?? 0),
                        icon: <DollarSign size={14} />,
                        accent: "gold",
                        delay: 0.15,
                  },
            ];
      }, [latestWeek]);

      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar title="Insights" subtitle="Business Intelligence & Analysis." />

                  <main className="flex-1 space-y-6 p-6">
                        {error && (
                              <div className="text-sm text-red-400">
                                    Failed to load analytics: {error.message}
                              </div>
                        )}

                        <TabList
                              selectedValue={activeTab}
                              onTabSelect={(_, data) => setActiveTab(data.value as string)}
                        >
                              <Tab value="revenue">Revenue & Growth</Tab>
                              <Tab value="discounts">Discounts</Tab>
                              <Tab value="products">Products</Tab>
                              <Tab value="customers">Customers</Tab>
                              <Tab value="price_sensitivity">Price Sensitivity</Tab>
                              <Tab value="quality">Data Quality & Risk</Tab>
                        </TabList>

                        {activeTab === "revenue" && (
                              <section className="space-y-4">
                                    <Stats stats={headlineStats} loading={loading} />
                                    <CardHeader>
                                          <CardTitle>Weekly Revenue, Profit & Margin</CardTitle>
                                    </CardHeader>
                                    <EChart option={revenueGrowthOption} loading={loading} height="340px" />
                              </section>
                        )}

                        {activeTab === "discounts" && (
                              <section className="space-y-6">
                                    <CardHeader>
                                          <CardTitle>Discount Rate Trend</CardTitle>
                                    </CardHeader>
                                    <EChart option={discountTrendOption} loading={loading} height="260px" />
                                    <DiscountByCategory />


                                    <div className="sticky top-[56px] left-0 w-full bg-black py-2 py-x border-b border-bg-border z-[1000]">
                                          <TabList selectedValue={discountByActiveTab} onTabSelect={(_, data) => setDiscountByActiveTab(data.value as string)}>
                                                <Tab value="discount_by_item">Discount By Item</Tab>
                                                <Tab value="discount_by_customer">Discount By Customer</Tab>
                                          </TabList>
                                    </div>

                                    {
                                          discountByActiveTab === "discount_by_item" && (
                                                <>
                                                      <CardHeader>
                                                            <CardTitle>Discount by Item</CardTitle>
                                                      </CardHeader>
                                                      <DataTable<DiscountByItemRow>
                                                            data={discountByItem}
                                                            columns={DISCOUNT_ITEM_COLUMNS}
                                                            getRowId={(row) => `${row.pos_item_id}-${row.item_name}`}
                                                            ariaLabel="Discount by item"
                                                            emptyMessage="No discount data available"
                                                            defaultSortKey="discount_pct"
                                                            defaultSortDir="desc"
                                                      />
                                                </>
                                          )
                                    }
                                    {
                                          discountByActiveTab === "discount_by_customer" && (
                                                <>
                                                      <CardHeader>
                                                            <CardTitle>Discount by Customer</CardTitle>
                                                      </CardHeader>
                                                      <DataTable<DiscountByCustomerRow>
                                                            data={discountByCustomer}
                                                            columns={DISCOUNT_CUSTOMER_COLUMNS}
                                                            getRowId={(row) => row.pos_customer_id}
                                                            ariaLabel="Discount by customer"
                                                            emptyMessage="No discount data available"
                                                            defaultSortKey="discount_pct"
                                                            defaultSortDir="desc"
                                                            maxRows={50}
                                                      />
                                                </>
                                          )
                                    }

                              </section>
                        )}

                        {activeTab === "products" && (
                              <section className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div>
                                                <CardHeader>
                                                      <CardTitle>Revenue by ABC Tier</CardTitle>
                                                </CardHeader>
                                                <EChart option={abcDonutOption} loading={loading} height="280px" />
                                          </div>
                                          <div>
                                                <CardHeader>
                                                      <CardTitle>Dead / Slow-Moving Items</CardTitle>
                                                </CardHeader>
                                                <p className="text-xs text-neutral-400 px-6 pb-2">
                                                      Based purely on sales activity — not current stock levels.
                                                </p>
                                          </div>
                                    </div>

                                    <div className="sticky top-[56px] left-0 w-full bg-black py-2 py-x border-b border-bg-border z-[1000]">
                                          <TabList selectedValue={productsInnerActiveTab} onTabSelect={(_, data) => setProductsInnerActiveTab(data.value as string)}>
                                                <Tab value="slow_dead_items">Dead / Slow-Moving Items</Tab>
                                                <Tab value="revenue_by_abc_tier">Revenue By ABC Tier</Tab>
                                          </TabList>
                                    </div>

                                    {
                                          productsInnerActiveTab === "slow_dead_items" && (
                                                <>
                                                      <DataTable<DeadStockRow>
                                                            data={deadStock}
                                                            columns={DEAD_STOCK_COLUMNS}
                                                            getRowId={(row) => `${row.pos_item_id}-${row.item_name}`}
                                                            ariaLabel="Dead and slow-moving items"
                                                            emptyMessage="No dead or slow-moving items"
                                                            defaultSortKey="last_sold_at"
                                                            defaultSortDir="asc"
                                                      />
                                                </>
                                          )
                                    }
                                    {     
                                          productsInnerActiveTab === "revenue_by_abc_tier" && (
                                                <>
                                                      <CardHeader>
                                                            <CardTitle>ABC Classification (all items)</CardTitle>
                                                      </CardHeader>
                                                      <DataTable<AbcRow>
                                                            data={abc}
                                                            columns={ABC_COLUMNS}
                                                            getRowId={(row) => `${row.abc_tier}-${row.item_name}`}
                                                            ariaLabel="ABC classification"
                                                            emptyMessage="No product revenue data"
                                                            defaultSortKey="revenue"
                                                            defaultSortDir="desc"
                                                            maxRows={100}
                                                      />
                                                </>
                                          )
                                    }
                              </section>
                        )}

                        {activeTab === "customers" && (
                              <section className="space-y-6">
                                    <CardHeader>
                                          <CardTitle>New vs Returning Customers</CardTitle>
                                    </CardHeader>
                                    <EChart option={retentionOption} loading={loading} height="280px" />

                                    <CardHeader>
                                          <CardTitle>Churn Risk</CardTitle>
                                    </CardHeader>
                                    <DataTable<ChurnRiskRow>
                                          data={churnRisk}
                                          columns={CHURN_COLUMNS}
                                          getRowId={(row) => row.customer_name}
                                          ariaLabel="Customer churn risk"
                                          emptyMessage="No repeat customers yet"
                                          defaultSortKey="days_since_last_order"
                                          defaultSortDir="desc"
                                    />
                              </section>
                        )}

                        {activeTab === "quality" && (
                              <section className="space-y-6">
                                    <Stats stats={dataQualityStats} loading={loading} />

                                    <CardHeader>
                                          <CardTitle>Revenue Anomalies (Spikes & Dips)</CardTitle>
                                    </CardHeader>
                                    <DataTable<RevenueAnomalyRow>
                                          data={anomalyRows}
                                          columns={ANOMALY_COLUMNS}
                                          getRowId={(row) => row.sale_date}
                                          ariaLabel="Revenue anomalies"
                                          emptyMessage="No spikes or dips detected in the available history"
                                          defaultSortKey="sale_date"
                                          defaultSortDir="desc"
                                    />

                                    <CardHeader>
                                          <CardTitle>Below-Cost Sales</CardTitle>
                                    </CardHeader>
                                    <DataTable<BelowCostRow>
                                          data={belowCost}
                                          columns={BELOW_COST_COLUMNS}
                                          getRowId={(row) => `${row.invoice_datetime}-${row.item_name}`}
                                          ariaLabel="Below-cost sales"
                                          emptyMessage="No below-cost sales found"
                                          defaultSortKey="loss_amount"
                                          defaultSortDir="desc"
                                    />
                              </section>
                        )}

                        {activeTab === "price_sensitivity" && (
                              <PriceSensitivityAnalytics />
                        )}
                  </main>
            </div>
      );
}
