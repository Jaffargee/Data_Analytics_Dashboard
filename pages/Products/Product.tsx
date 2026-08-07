import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Tab, TabList } from "@fluentui/react-components";
import {
      DollarSign,
      Percent,
      Package,
      Users,
      TrendingUp,
      TrendingDown,
      Minus,
      Award,
} from "lucide-react";

import Stats from "../../components/ui/primitives/Stats";
import Badge from "../../components/ui/primitives/Badge"; // ADJUST if named differently
import { CardTitle, CardHeader } from "../../components/ui/primitives/"; // ADJUST path/names to match your actual exports
import EmptyState from "../../components/ui/primitives/EmptyState";
import DataTable, { ColumnDef } from "../../components/ui/DataTable";
import SearchInput from "../../components/ui/SearchInput";
import Button from "../../components/ui/Button";
import TopBar from "../../components/ui/TopBar";

import { fmtCurrency } from "../../lib/utils";
import useProductAnalytics from "./hooks";

import { EChart } from "./components/ProductCharts.tsx";
import { buildSalesTrendOption, buildTopCustomersOption } from "./components/ProductCharts.tsx";

type Granularity = "daily" | "weekly" | "biweekly" | "monthly";
 
type TrendStatus =
      | "RISING"
      | "NEW / RISING"
      | "DECLINING"
      | "SWEET SPOT / STEADY"
      | "DORMANT";
 
interface TopCustomerJson {
      customer_name: string;
      pos_customer_id: number;
      category: string | null;
      quantity: number;
      revenue: number;
}
 
interface ProductDeepDive {
      pos_item_id: number;
      item_name: string;
      item_category: string | null;
      total_quantity: number;
      cost_price: number;
      selling_price: number;
      cogs: number;
      gross_revenue: number;
      revenue: number;
      discount_impact: number;
      profit: number;
      margin_pct: number;
      discount_pct: number;
      total_orders: number;
      distinct_customers: number;
      peak_week: string | null;
      peak_week_quantity: number | null;
      qty_last_7d: number;
      qty_prior_7d: number;
      avg_daily_velocity_30d: number;
      trend_status: TrendStatus;
      top_customer_name: string | null;
      top_customer_id: number | null;
      top_customer_quantity: number | null;
      top_customer_revenue: number | null;
      top_10_customers: TopCustomerJson[] | null;
}
 
interface ProductTopCustomerRow {
      pos_item_id: number;
      item_name: string;
      pos_customer_id: number;
      customer_name: string;
      customer_category: string | null;
      total_quantity: number;
      total_revenue: number;
      total_orders: number;
      qty_rank: number;
}
 
interface SalesTrendRow {
      pos_item_id: number;
      item_name: string;
      period_start: string;
      quantity_sold: number;
      revenue: number;
      orders: number;
}
 
interface OverviewRow {
      metric: string;
      value: string | number;
}
 
interface UseProductAnalyticsReturn {
      product: ProductDeepDive | null;
      topCustomers: ProductTopCustomerRow[];
      salesTrend: SalesTrendRow[];
      granularity: Granularity;
      setGranularity: (value: Granularity) => void;
      loading: boolean;
      trendLoading: boolean;
      error: Error | null;
      refetch: () => void;
}
 
interface GranularityOption {
      value: Granularity;
      label: string;
}
 
interface StatItem {
      id: string;
      label: string;
      value: string | number;
      icon: JSX.Element;
      accent: string;
      delay: number;
}
 
interface TrendMeta {
      label: string;
      accent: string;
      icon: JSX.Element;
}
 
const GRANULARITY_OPTIONS: GranularityOption[] = [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "biweekly", label: "2-Week" },
      { value: "monthly", label: "Monthly" },
];
 
const TREND_META: Record<TrendStatus, TrendMeta> = {
      RISING: { label: "Rising", accent: "success", icon: <TrendingUp size={12} /> },
      "NEW / RISING": {
            label: "New / Rising",
            accent: "success",
            icon: <TrendingUp size={12} />,
      },
      DECLINING: { label: "Declining", accent: "danger", icon: <TrendingDown size={12} /> },
      "SWEET SPOT / STEADY": {
            label: "Sweet Spot",
            accent: "gold",
            icon: <Minus size={12} />,
      },
      DORMANT: { label: "Dormant", accent: "muted", icon: <Minus size={12} /> },
};
 
function generateStats(product: ProductDeepDive | null): StatItem[] {
      if (!product) return [];
      return [
            {
                  id: "actual-revenue",
                  label: "Actual Revenue",
                  value: fmtCurrency(product.revenue),
                  icon: <DollarSign size={14} />,
                  accent: "gold",
                  delay: 0,
            },
            {
                  id: "gross-revenue",
                  label: "Gross Revenue",
                  value: fmtCurrency(product.gross_revenue),
                  icon: <DollarSign size={14} />,
                  accent: "gold",
                  delay: 0.05,
            },
            {
                  id: "profit",
                  label: "Profit",
                  value: fmtCurrency(product.profit),
                  icon: <DollarSign size={14} />,
                  accent: "gold",
                  delay: 0.1,
            },
            {
                  id: "margin",
                  label: "Margin",
                  value: `${product.margin_pct ?? 0}%`,
                  icon: <Percent size={14} />,
                  accent: "gold",
                  delay: 0.15,
            },
            {
                  id: "discount-impact",
                  label: "Discount Impact",
                  value: `${fmtCurrency(product.discount_impact)} (${product.discount_pct ?? 0}%)`,
                  icon: <Percent size={14} />,
                  accent: "gold",
                  delay: 0.2,
            },
            {
                  id: "units-sold",
                  label: "Units Sold",
                  value: product.total_quantity,
                  icon: <Package size={14} />,
                  accent: "gold",
                  delay: 0.25,
            },
            {
                  id: "distinct-customers",
                  label: "Distinct Customers",
                  value: product.distinct_customers,
                  icon: <Users size={14} />,
                  accent: "gold",
                  delay: 0.3,
            },
            {
                  id: "top-buyer",
                  label: "Top Buyer",
                  value: product.top_customer_name ?? "—",
                  icon: <Award size={14} />,
                  accent: "gold",
                  delay: 0.35,
            },
      ];
}
 
const OVERVIEW_COLUMNS: ColumnDef<OverviewRow>[] = [
      { key: "metric", label: "Metric", width: "2fr" },
      { key: "value", label: "Value", width: "2fr", align: "right" },
];
 
const TREND_COLUMNS: ColumnDef<SalesTrendRow>[] = [
      {
            key: "period_start",
            label: "Period",
            width: "1.6fr",
            sortable: true,
            sortValue: (row) => new Date(row.period_start).getTime(),
            render: (row) => new Date(row.period_start).toLocaleDateString(),
      },
      {
            key: "quantity_sold",
            label: "Units Sold",
            width: "1fr",
            align: "right",
            sortable: true,
      },
      {
            key: "revenue",
            label: "Revenue",
            width: "1.4fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.revenue),
      },
      {
            key: "orders",
            label: "Orders",
            width: "1fr",
            align: "right",
            sortable: true,
      },
];
 
const CUSTOMER_COLUMNS: ColumnDef<ProductTopCustomerRow>[] = [
      { key: "qty_rank", label: "#", width: "0.5fr" },
      { key: "customer_name", label: "Customer", width: "2fr", sortable: true },
      { key: "customer_category", label: "Category", width: "1.2fr" },
      {
            key: "total_quantity",
            label: "Qty Bought",
            width: "1fr",
            align: "right",
            sortable: true,
      },
      {
            key: "total_revenue",
            label: "Revenue",
            width: "1.4fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.total_revenue),
      },
      {
            key: "total_orders",
            label: "Orders",
            width: "1fr",
            align: "right",
            sortable: true,
      },
];
 
export default function Product(): JSX.Element {
      const { pos_item_id } = useParams<{ pos_item_id: string }>();
      const [activeTab, setActiveTab] = useState<string>("overview");
      const [customerSearch, setCustomerSearch] = useState<string>("");
 
      const {
            product,
            topCustomers,
            salesTrend,
            granularity,
            setGranularity,
            loading,
            trendLoading,
            error,
      } = useProductAnalytics(pos_item_id) as UseProductAnalyticsReturn;
 
      const stats = useMemo(() => generateStats(product), [product]);
 
      const filteredCustomers = useMemo(() => {
            if (!customerSearch.trim()) return topCustomers;
            const q = customerSearch.toLowerCase();
            return topCustomers.filter((c) =>
                  c.customer_name?.toLowerCase().includes(q)
            );
      }, [topCustomers, customerSearch]);
 
      const overviewRows: OverviewRow[] = useMemo(() => {
            if (!product) return [];
            return [
                  { metric: "COGS", value: fmtCurrency(product.cogs) },
                  { metric: "Gross Revenue", value: fmtCurrency(product.gross_revenue) },
                  { metric: "Actual Revenue", value: fmtCurrency(product.revenue) },
                  { metric: "Discount Impact", value: fmtCurrency(product.discount_impact) },
                  { metric: "Profit", value: fmtCurrency(product.profit) },
                  { metric: "Margin %", value: `${product.margin_pct}%` },
                  { metric: "Discount %", value: `${product.discount_pct}%` },
                  { metric: "Total Orders", value: product.total_orders },
                  { metric: "Units Sold (7d)", value: product.qty_last_7d },
                  { metric: "Units Sold (prior 7d)", value: product.qty_prior_7d },
                  { metric: "Avg Daily Velocity (30d)", value: product.avg_daily_velocity_30d },
            ];
      }, [product]);
 
      const salesTrendOption = useMemo(
            () => buildSalesTrendOption(salesTrend),
            [salesTrend]
      );
 
      const topCustomersOption = useMemo(
            () => buildTopCustomersOption(topCustomers, 10),
            [topCustomers]
      );
 
      const trend = product ? TREND_META[product.trend_status] : null;
 
      if (!loading && !product) {
            return (
                  <div className="flex-1 flex flex-col min-h-screen">
                        <TopBar title="Product" subtitle="Product Intelligence & Analysis." />
                        <main className="flex-1 space-y-6 p-6">
                              <EmptyState
                                    message={`No product matches pos_item_id "${pos_item_id}".`}
                              />
                        </main>
                  </div>
            );
      }
 
      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar
                        title={product?.item_name ?? "Product"}
                        subtitle="Product Intelligence & Analysis."
                        shouldNavigateBack
                  />
 
                  <main className="flex-1 space-y-6 p-6">
                        <div className="flex items-center gap-3">
                              {trend && (
                                    <Badge accent={trend.accent}>
                                          {trend.icon}
                                          <span className="ml-1">{trend.label}</span>
                                    </Badge>
                              )}
                              {product?.peak_week && (
                                    <span className="text-xs text-neutral-400">
                                          Peak week: {new Date(product.peak_week).toLocaleDateString()} (
                                          {product.peak_week_quantity} units)
                                    </span>
                              )}
                        </div>
 
                        <Stats stats={stats} loading={loading} />
 
                        <TabList
                              selectedValue={activeTab}
                              onTabSelect={(_, data) => setActiveTab(data.value as string)}
                        >
                              <Tab value="overview">Overview</Tab>
                              <Tab value="trend">Sales Trend</Tab>
                              <Tab value="customers">Top Customers</Tab>
                        </TabList>
 
                        {error && (
                              <div className="text-sm text-red-400">
                                    Failed to load product data: {error.message}
                              </div>
                        )}
 
                        {activeTab === "overview" && product && (
                              <section className="space-y-4">
                                    <CardHeader>
                                          <CardTitle>Overview</CardTitle>
                                    </CardHeader>
                                    <DataTable<OverviewRow>
                                          data={overviewRows}
                                          columns={OVERVIEW_COLUMNS}
                                          getRowId={(row) => row.metric}
                                          ariaLabel="Product overview metrics"
                                          emptyMessage="No metrics available"
                                    />
                              </section>
                        )}
 
                        {activeTab === "trend" && (
                              <section className="space-y-4">
                                    <div className="flex items-center justify-between gap-4">
                                          <CardHeader>
                                                <CardTitle>Sales Trend</CardTitle>
                                          </CardHeader>
                                          <div className="flex gap-2">
                                                {GRANULARITY_OPTIONS.map((opt) => (
                                                      <Button
                                                            key={opt.value}
                                                            variant={granularity === opt.value ? "solid" : "ghost"}
                                                            size="sm"
                                                            onClick={() => setGranularity(opt.value)}
                                                      >
                                                            {opt.label}
                                                      </Button>
                                                ))}
                                          </div>
                                    </div>
 
                                    {salesTrend.length > 0 && (
                                          <EChart
                                                option={salesTrendOption}
                                                loading={trendLoading}
                                                height="320px"
                                          />
                                    )}
 
                                    <DataTable<SalesTrendRow>
                                          data={salesTrend}
                                          columns={TREND_COLUMNS}
                                          getRowId={(row) => row.period_start}
                                          ariaLabel="Product sales trend"
                                          emptyMessage="This product has no recorded sales for the selected period."
                                          defaultSortKey="period_start"
                                          defaultSortDir="asc"
                                    />
                                    {trendLoading && (
                                          <p className="text-xs text-neutral-400">Refreshing…</p>
                                    )}
                              </section>
                        )}
 
                        {activeTab === "customers" && (
                              <section className="space-y-4">
                                    <div className="flex items-center justify- gap-4">
                                          <CardHeader>
                                                <CardTitle>Top Customers ({topCustomers.length})</CardTitle>
                                          </CardHeader>
                                          <SearchInput
                                                placeholder="Search customer..."
                                                value={customerSearch}
                                                onChange={(e) => setCustomerSearch(e.target.value)}
                                          />
                                    </div>
 
                                    {topCustomers.length > 0 && (
                                          <EChart
                                                option={topCustomersOption}
                                                height={`${Math.min(topCustomers.length, 10) * 34 + 40}px`}
                                          />
                                    )}
 
                                    <DataTable<ProductTopCustomerRow>
                                          data={filteredCustomers}
                                          columns={CUSTOMER_COLUMNS}
                                          getRowId={(row) => row.pos_customer_id}
                                          ariaLabel="Top customers for this product"
                                          emptyMessage="No purchases of this product have a customer attached, or your search returned nothing."
                                          defaultSortKey="total_quantity"
                                          defaultSortDir="desc"
                                    />
                              </section>
                        )}
                  </main>
            </div>
      );
}