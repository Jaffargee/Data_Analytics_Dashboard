import { useMemo, useState } from "react";
import { Tab, TabList } from "@fluentui/react-components";
import { DollarSign, Percent, Users, AlertTriangle } from "lucide-react";

import Stats from "../../components/ui/primitives/Stats";
import Badge from "../../components/ui/primitives/Badge"; // ADJUST if named differently
import { CardTitle, CardHeader } from "../../components/ui/primitives/"; // ADJUST path/names to match your actual exports
import DataTable, { ColumnDef } from "../../components/ui/DataTable";
import EChart from "../../components/charts/EChart";
import TopBar from "../../components/ui/TopBar";
import DiscountByCategory from "./DiscountByCategory";

import { fmtCurrency } from "../../lib/utils";
import useAnalyticsDashboard, {
      type DiscountByItemRow,
      type DiscountByCustomerRow,
      type AbcRow,
      type DeadStockRow,
      type ChurnRiskRow,
      type RevenueAnomalyRow,
      type BelowCostRow,
} from "../../hooks/useAnalyticsDashboard";
import {
      buildRevenueGrowthOption,
      buildDiscountTrendOption,
      buildRetentionOption,
      buildAbcDonutOption,
} from "../../lib/analyticsCharts";
import PriceSensitivityAnalytics from "./PriceSensitivityAnalytics"

const ABC_ACCENT: Record<AbcRow["abc_tier"], string> = {
      A: "gold",
      B: "muted",
      C: "danger",
};

const DEAD_STOCK_ACCENT: Record<DeadStockRow["status"], string> = {
      "NEVER SOLD": "danger",
      "DEAD (60d+)": "danger",
      "SLOW (30-60d)": "gold",
      ACTIVE: "success",
};

const CHURN_ACCENT: Record<ChurnRiskRow["churn_status"], string> = {
      "AT RISK": "danger",
      ACTIVE: "success",
      "INSUFFICIENT DATA": "muted",
};

const ANOMALY_ACCENT: Record<RevenueAnomalyRow["anomaly_status"], string> = {
      SPIKE: "success",
      DIP: "danger",
      NORMAL: "muted",
      "INSUFFICIENT HISTORY": "muted",
};

const DISCOUNT_ITEM_COLUMNS: ColumnDef<DiscountByItemRow>[] = [
      { key: "discount_rank", label: "#", width: "0.5fr" },
      { key: "item_name", label: "Item", width: "2.2fr", sortable: true },
      { key: "qty_sold", label: "Qty Sold", width: "1fr", align: "right", sortable: true },
      {
            key: "gross_revenue",
            label: "Gross Revenue",
            width: "1.4fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.gross_revenue),
      },
      {
            key: "discount_given",
            label: "Discount Given",
            width: "1.4fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.discount_given),
      },
      {
            key: "discount_pct",
            label: "Discount %",
            width: "1fr",
            align: "right",
            sortable: true,
            render: (row) => `${row.discount_pct}%`,
      },
      {
            key: "margin_pct",
            label: "Margin %",
            width: "1fr",
            align: "right",
            sortable: true,
            render: (row) => `${row.margin_pct}%`,
      },
];

const DISCOUNT_CUSTOMER_COLUMNS: ColumnDef<DiscountByCustomerRow>[] = [
      { key: "customer_name", label: "Customer", width: "2fr", sortable: true },
      { key: "category", label: "Category", width: "1.2fr" },
      { key: "orders", label: "Orders", width: "0.8fr", align: "right", sortable: true },
      {
            key: "gross_revenue",
            label: "Gross Revenue",
            width: "1.4fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.gross_revenue),
      },
      {
            key: "discount_given",
            label: "Discount Given",
            width: "1.4fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.discount_given),
      },
      {
            key: "discount_pct",
            label: "Discount %",
            width: "1fr",
            align: "right",
            sortable: true,
            render: (row) => `${row.discount_pct}%`,
      },
];

const ABC_COLUMNS: ColumnDef<AbcRow>[] = [
      {
            key: "abc_tier",
            label: "Tier",
            width: "0.6fr",
            render: (row) => <Badge accent={ABC_ACCENT[row.abc_tier]}>{row.abc_tier}</Badge>,
      },
      { key: "item_name", label: "Item", width: "2.4fr", sortable: true },
      {
            key: "revenue",
            label: "Revenue",
            width: "1.4fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.revenue),
      },
      {
            key: "cumulative_pct",
            label: "Cumulative %",
            width: "1.2fr",
            align: "right",
            sortable: true,
            render: (row) => `${row.cumulative_pct}%`,
      },
];

const DEAD_STOCK_COLUMNS: ColumnDef<DeadStockRow>[] = [
      {
            key: "status",
            label: "Status",
            width: "1.2fr",
            render: (row) => <Badge accent={DEAD_STOCK_ACCENT[row.status]}>{row.status}</Badge>,
      },
      { key: "item_name", label: "Item", width: "2.4fr", sortable: true },
      { key: "qty_last_30d", label: "Qty (30d)", width: "1fr", align: "right", sortable: true },
      { key: "qty_last_60d", label: "Qty (60d)", width: "1fr", align: "right", sortable: true },
      {
            key: "last_sold_at",
            label: "Last Sold",
            width: "1.4fr",
            sortable: true,
            sortValue: (row) => (row.last_sold_at ? new Date(row.last_sold_at).getTime() : 0),
            render: (row) => (row.last_sold_at ? new Date(row.last_sold_at).toLocaleDateString() : "Never"),
      },
];

const CHURN_COLUMNS: ColumnDef<ChurnRiskRow>[] = [
      {
            key: "churn_status",
            label: "Status",
            width: "1.2fr",
            render: (row) => <Badge accent={CHURN_ACCENT[row.churn_status]}>{row.churn_status}</Badge>,
      },
      { key: "customer_name", label: "Customer", width: "2fr", sortable: true },
      { key: "total_orders", label: "Orders", width: "0.8fr", align: "right", sortable: true },
      {
            key: "lifetime_value",
            label: "Lifetime Value",
            width: "1.4fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.lifetime_value),
      },
      {
            key: "avg_days_between_orders",
            label: "Usual Cadence (days)",
            width: "1.4fr",
            align: "right",
            sortable: true,
      },
      {
            key: "days_since_last_order",
            label: "Days Since Last Order",
            width: "1.4fr",
            align: "right",
            sortable: true,
      },
];

const ANOMALY_COLUMNS: ColumnDef<RevenueAnomalyRow>[] = [
      {
            key: "anomaly_status",
            label: "Status",
            width: "1.2fr",
            render: (row) => <Badge accent={ANOMALY_ACCENT[row.anomaly_status]}>{row.anomaly_status}</Badge>,
      },
      {
            key: "sale_date",
            label: "Date",
            width: "1.2fr",
            sortable: true,
            sortValue: (row) => new Date(row.sale_date).getTime(),
            render: (row) => new Date(row.sale_date).toLocaleDateString(),
      },
      {
            key: "revenue",
            label: "Revenue",
            width: "1.3fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.revenue),
      },
      {
            key: "trailing_avg",
            label: "30d Avg",
            width: "1.3fr",
            align: "right",
            sortable: true,
            render: (row) => (row.trailing_avg != null ? fmtCurrency(row.trailing_avg) : "—"),
      },
      { key: "z_score", label: "Z-Score", width: "1fr", align: "right", sortable: true },
];

const BELOW_COST_COLUMNS: ColumnDef<BelowCostRow>[] = [
      {
            key: "invoice_datetime",
            label: "Date",
            width: "1.3fr",
            sortable: true,
            sortValue: (row) => new Date(row.invoice_datetime).getTime(),
            render: (row) => new Date(row.invoice_datetime).toLocaleDateString(),
      },
      { key: "item_name", label: "Item", width: "2fr", sortable: true },
      { key: "customer_name", label: "Customer", width: "1.6fr" },
      { key: "quantity", label: "Qty", width: "0.8fr", align: "right" },
      {
            key: "unit_price",
            label: "Sold At",
            width: "1.2fr",
            align: "right",
            render: (row) => fmtCurrency(row.unit_price),
      },
      {
            key: "cost_price",
            label: "Cost",
            width: "1.2fr",
            align: "right",
            render: (row) => fmtCurrency(row.cost_price),
      },
      {
            key: "loss_amount",
            label: "Loss",
            width: "1.2fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.loss_amount),
      },
];

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
