import { useMemo } from "react";
import * as Tabs from '@radix-ui/react-tabs';
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
import { TAB_LIST_CLASS, TAB_TRIGGER_CLASS, STICKY_TAB_WRAPPER_CLASS } from "@/lib/constants/tabs"


export default function Insights(): JSX.Element {
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

                  <main className="flex-1 space-y-6 p-3 sm:p-6">
                        {error && (
                              <div className="text-sm text-red-400">
                                    Failed to load analytics: {error.message}
                              </div>
                        )}

                        <Tabs.Root defaultValue="revenue">
                              <div className={STICKY_TAB_WRAPPER_CLASS}>
                                    <Tabs.List className={TAB_LIST_CLASS}>
                                          <Tabs.Trigger value="revenue" className={TAB_TRIGGER_CLASS}>Revenue & Growth</Tabs.Trigger>
                                          <Tabs.Trigger value="discounts" className={TAB_TRIGGER_CLASS}>Discounts</Tabs.Trigger>
                                          <Tabs.Trigger value="products" className={TAB_TRIGGER_CLASS}>Products</Tabs.Trigger>
                                          <Tabs.Trigger value="customers" className={TAB_TRIGGER_CLASS}>Customers</Tabs.Trigger>
                                          <Tabs.Trigger value="price_sensitivity" className={TAB_TRIGGER_CLASS}>Price Sensitivity</Tabs.Trigger>
                                          <Tabs.Trigger value="quality" className={TAB_TRIGGER_CLASS}>Data Quality & Risk</Tabs.Trigger>
                                    </Tabs.List>
                              </div>

                              <Tabs.Content value="revenue" className="mt-6">
                                    <section className="space-y-4">
                                          <Stats stats={headlineStats} loading={loading} />
                                          <CardHeader>
                                                <CardTitle>Weekly Revenue, Profit & Margin</CardTitle>
                                          </CardHeader>
                                          <EChart option={revenueGrowthOption} loading={loading} height="340px" />
                                    </section>
                              </Tabs.Content>

                              <Tabs.Content value="discounts" className="mt-6">
                                    <section className="space-y-6">
                                          <CardHeader>
                                                <CardTitle>Discount Rate Trend</CardTitle>
                                          </CardHeader>
                                          <EChart option={discountTrendOption} loading={loading} height="260px" />
                                          <DiscountByCategory />

                                          <Tabs.Root defaultValue="discount_by_item">
                                                <div className={STICKY_TAB_WRAPPER_CLASS}>
                                                      <Tabs.List className={TAB_LIST_CLASS}>
                                                            <Tabs.Trigger value="discount_by_item" className={TAB_TRIGGER_CLASS}>Discount By Item</Tabs.Trigger>
                                                            <Tabs.Trigger value="discount_by_customer" className={TAB_TRIGGER_CLASS}>Discount By Customer</Tabs.Trigger>
                                                      </Tabs.List>
                                                </div>

                                                <Tabs.Content value="discount_by_item" className="mt-4">
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
                                                </Tabs.Content>

                                                <Tabs.Content value="discount_by_customer" className="mt-4">
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
                                                </Tabs.Content>
                                          </Tabs.Root>
                                    </section>
                              </Tabs.Content>

                              <Tabs.Content value="products" className="mt-6">
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

                                          <Tabs.Root defaultValue="slow_dead_items">
                                                <div className={STICKY_TAB_WRAPPER_CLASS}>
                                                      <Tabs.List className={TAB_LIST_CLASS}>
                                                            <Tabs.Trigger value="slow_dead_items" className={TAB_TRIGGER_CLASS}>Dead / Slow-Moving Items</Tabs.Trigger>
                                                            <Tabs.Trigger value="revenue_by_abc_tier" className={TAB_TRIGGER_CLASS}>Revenue By ABC Tier</Tabs.Trigger>
                                                      </Tabs.List>
                                                </div>

                                                <Tabs.Content value="slow_dead_items" className="mt-4">
                                                      <DataTable<DeadStockRow>
                                                            data={deadStock}
                                                            columns={DEAD_STOCK_COLUMNS}
                                                            getRowId={(row) => `${row.pos_item_id}-${row.item_name}`}
                                                            ariaLabel="Dead and slow-moving items"
                                                            emptyMessage="No dead or slow-moving items"
                                                            defaultSortKey="last_sold_at"
                                                            defaultSortDir="asc"
                                                      />
                                                </Tabs.Content>

                                                <Tabs.Content value="revenue_by_abc_tier" className="mt-4">
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
                                                </Tabs.Content>
                                          </Tabs.Root>
                                    </section>
                              </Tabs.Content>

                              <Tabs.Content value="customers" className="mt-6">
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
                              </Tabs.Content>

                              <Tabs.Content value="quality" className="mt-6">
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
                              </Tabs.Content>

                              <Tabs.Content value="price_sensitivity" className="mt-6">
                                    <PriceSensitivityAnalytics />
                              </Tabs.Content>
                        </Tabs.Root>
                  </main>
            </div>
      );
}
