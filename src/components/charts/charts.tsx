import type { EChartsOption } from 'echarts';

interface SalesTrendRow {
      pos_item_id: number;
      item_name: string;
      period_start: string;
      quantity_sold: number;
      revenue: number;
      orders: number;
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

export interface DiscountByCategoryRow {
      category: string;
      customer_count: number;
      total_orders: number;
      gross_revenue: number;
      actual_revenue: number;
      cogs: number;
      discount_given: number;
      profit: number;
      blended_discount_pct: number;
      avg_customer_discount_pct: number;
      min_customer_discount_pct: number;
      max_customer_discount_pct: number;
      blended_margin_pct: number;
      avg_customer_margin_pct: number;
      avg_revenue_per_customer: number;
}


interface RevenueWeekRow {
      week_start: string;
      revenue: number;
      profit: number;
      margin_pct: number;
}

interface DiscountTrendRow {
      week_start: string;
      discount_pct: number;
}

interface RetentionWeekRow {
      week_start: string;
      new_customers: number;
      returning_customers: number;
}

interface AbcRow {
      abc_tier: 'A' | 'B' | 'C';
      revenue: number;
}

function fmtDate(d: string): string {
      return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const GOLD = "#D4AF37"; // ADJUST to your actual --accent-gold token if it differs
const AXIS_LINE = "#3a3a3a";
const AXIS_LABEL = "#9a9a9a";
const RED = "#E5484D";
const GREEN = "#3DD68C";

/**
 * Dual-axis line chart: units sold (left axis) vs revenue (right axis) over time.
 * Feed it whichever v_product_sales_{granularity} rows are currently loaded —
 * the x-axis just reads period_start in order, so it works for daily/weekly/
 * biweekly/monthly without changes.
 */
export function buildSalesTrendOption(rows: SalesTrendRow[]): EChartsOption {
      const dates = rows.map((r) =>
            new Date(r.period_start).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
            })
      );

      return {
            backgroundColor: "transparent",
            textStyle: { color: AXIS_LABEL },
            tooltip: {
                  trigger: "axis",
                  backgroundColor: "#1a1a1a",
                  borderColor: AXIS_LINE,
                  textStyle: { color: "#e5e5e5" },
            },
            legend: {
                  data: ["Units Sold", "Revenue"],
                  textStyle: { color: AXIS_LABEL },
                  top: 0,
            },
            grid: { left: 48, right: 56, top: 40, bottom: 32 },
            xAxis: {
                  type: "category",
                  data: dates,
                  axisLine: { lineStyle: { color: AXIS_LINE } },
                  axisLabel: { color: AXIS_LABEL },
            },
            yAxis: [
                  {
                        type: "value",
                        name: "Units",
                        position: "left",
                        axisLine: { show: true, lineStyle: { color: AXIS_LINE } },
                        splitLine: { lineStyle: { color: "#242424" } },
                        axisLabel: { color: AXIS_LABEL },
                  },
                  {
                        type: "value",
                        name: "Revenue",
                        position: "right",
                        axisLine: { show: true, lineStyle: { color: AXIS_LINE } },
                        splitLine: { show: false },
                        axisLabel: {
                              color: AXIS_LABEL,
                              formatter: (value: number) =>
                                    value >= 1_000_000
                                          ? `₦${(value / 1_000_000).toFixed(1)}M`
                                          : `₦${(value / 1_000).toFixed(0)}k`,
                        },
                  },
            ],
            series: [
                  {
                        name: "Units Sold",
                        type: "bar",
                        yAxisIndex: 0,
                        data: rows.map((r) => r.quantity_sold),
                        itemStyle: { color: "#4a4a4a", borderRadius: [3, 3, 0, 0] },
                        barMaxWidth: 22,
                  },
                  {
                        name: "Revenue",
                        type: "line",
                        yAxisIndex: 1,
                        data: rows.map((r) => r.revenue),
                        smooth: true,
                        symbol: "circle",
                        symbolSize: 6,
                        lineStyle: { color: GOLD, width: 2 },
                        itemStyle: { color: GOLD },
                        areaStyle: { color: GOLD, opacity: 0.08 },
                  },
            ],
      };
}

/**
 * Horizontal bar chart of the top N customers for a product, ranked by quantity.
 * Pass v_product_top_customers rows already sorted by qty_rank.
 */
export function buildTopCustomersOption(
      rows: ProductTopCustomerRow[],
      limit = 10
): EChartsOption {
      const top = [...rows]
            .sort((a, b) => a.qty_rank - b.qty_rank)
            .slice(0, limit)
            .reverse(); // reverse so #1 renders at the top of a horizontal bar chart

      return {
            backgroundColor: "transparent",
            textStyle: { color: AXIS_LABEL },
            tooltip: {
                  trigger: "axis",
                  axisPointer: { type: "shadow" },
                  backgroundColor: "#1a1a1a",
                  borderColor: AXIS_LINE,
                  textStyle: { color: "#e5e5e5" },
                  formatter: (params: any) => {
                        const p = Array.isArray(params) ? params[0] : params;
                        const row = top[p.dataIndex];
                        return `${row.customer_name}<br/>Qty: ${row.total_quantity}<br/>Revenue: ₦${row.total_revenue.toLocaleString()}`;
                  },
            },
            grid: { left: 140, right: 32, top: 16, bottom: 24 },
            xAxis: {
                  type: "value",
                  axisLine: { lineStyle: { color: AXIS_LINE } },
                  splitLine: { lineStyle: { color: "#242424" } },
                  axisLabel: { color: AXIS_LABEL },
            },
            yAxis: {
                  type: "category",
                  data: top.map((r) => r.customer_name),
                  axisLine: { lineStyle: { color: AXIS_LINE } },
                  axisLabel: { color: AXIS_LABEL },
            },
            series: [
                  {
                        name: "Quantity",
                        type: "bar",
                        data: top.map((r) => r.total_quantity),
                        itemStyle: { color: GOLD, borderRadius: [0, 3, 3, 0] },
                        barMaxWidth: 18,
                  },
            ],
      };
}

/** Revenue, profit, and margin % over time, weekly. */
export function buildRevenueGrowthOption(rows: RevenueWeekRow[]): EChartsOption {
      const dates = rows.map((r) => fmtDate(r.week_start));

      return {
            backgroundColor: "transparent",
            textStyle: { color: AXIS_LABEL },
            tooltip: { trigger: "axis", backgroundColor: "#1a1a1a", borderColor: AXIS_LINE, textStyle: { color: "#e5e5e5" } },
            legend: { data: ["Revenue", "Profit", "Margin %"], textStyle: { color: AXIS_LABEL }, top: 0 },
            grid: { left: 56, right: 56, top: 40, bottom: 32 },
            xAxis: {
                  type: "category",
                  data: dates,
                  axisLine: { lineStyle: { color: AXIS_LINE } },
                  axisLabel: { color: AXIS_LABEL },
            },
            yAxis: [
                  {
                        type: "value",
                        name: "Naira",
                        axisLine: { show: true, lineStyle: { color: AXIS_LINE } },
                        splitLine: { lineStyle: { color: "#242424" } },
                        axisLabel: {
                              color: AXIS_LABEL,
                              formatter: (v: number) => (v >= 1_000_000 ? `₦${(v / 1_000_000).toFixed(1)}M` : `₦${(v / 1_000).toFixed(0)}k`),
                        },
                  },
                  {
                        type: "value",
                        name: "Margin %",
                        position: "right",
                        axisLine: { show: true, lineStyle: { color: AXIS_LINE } },
                        splitLine: { show: false },
                        axisLabel: { color: AXIS_LABEL, formatter: "{value}%" },
                  },
            ],
            series: [
                  {
                        name: "Revenue",
                        type: "bar",
                        data: rows.map((r) => r.revenue),
                        itemStyle: { color: "#4a4a4a", borderRadius: [3, 3, 0, 0] },
                        barMaxWidth: 22,
                  },
                  {
                        name: "Profit",
                        type: "bar",
                        data: rows.map((r) => r.profit),
                        itemStyle: { color: GOLD, borderRadius: [3, 3, 0, 0] },
                        barMaxWidth: 22,
                  },
                  {
                        name: "Margin %",
                        type: "line",
                        yAxisIndex: 1,
                        data: rows.map((r) => r.margin_pct),
                        smooth: true,
                        symbol: "circle",
                        symbolSize: 6,
                        lineStyle: { color: GREEN, width: 2 },
                        itemStyle: { color: GREEN },
                  },
            ],
      };
}

/** Discount % of gross revenue over time, weekly. */
export function buildDiscountTrendOption(rows: DiscountTrendRow[]): EChartsOption {
      const dates = rows.map((r) => fmtDate(r.week_start));

      return {
            backgroundColor: "transparent",
            textStyle: { color: AXIS_LABEL },
            tooltip: { trigger: "axis", backgroundColor: "#1a1a1a", borderColor: AXIS_LINE, textStyle: { color: "#e5e5e5" } },
            grid: { left: 48, right: 24, top: 24, bottom: 32 },
            xAxis: {
                  type: "category",
                  data: dates,
                  axisLine: { lineStyle: { color: AXIS_LINE } },
                  axisLabel: { color: AXIS_LABEL },
            },
            yAxis: {
                  type: "value",
                  axisLine: { lineStyle: { color: AXIS_LINE } },
                  splitLine: { lineStyle: { color: "#242424" } },
                  axisLabel: { color: AXIS_LABEL, formatter: "{value}%" },
            },
            series: [
                  {
                        name: "Discount %",
                        type: "line",
                        data: rows.map((r) => r.discount_pct),
                        smooth: true,
                        symbol: "circle",
                        symbolSize: 6,
                        lineStyle: { color: RED, width: 2 },
                        itemStyle: { color: RED },
                        areaStyle: { color: RED, opacity: 0.08 },
                  },
            ],
      };
}

/** New vs returning customers, stacked bar, weekly. */
export function buildRetentionOption(rows: RetentionWeekRow[]): EChartsOption {
      const dates = rows.map((r) => fmtDate(r.week_start));

      return {
            backgroundColor: "transparent",
            textStyle: { color: AXIS_LABEL },
            tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, backgroundColor: "#1a1a1a", borderColor: AXIS_LINE, textStyle: { color: "#e5e5e5" } },
            legend: { data: ["New", "Returning"], textStyle: { color: AXIS_LABEL }, top: 0 },
            grid: { left: 48, right: 24, top: 40, bottom: 32 },
            xAxis: {
                  type: "category",
                  data: dates,
                  axisLine: { lineStyle: { color: AXIS_LINE } },
                  axisLabel: { color: AXIS_LABEL },
            },
            yAxis: {
                  type: "value",
                  axisLine: { lineStyle: { color: AXIS_LINE } },
                  splitLine: { lineStyle: { color: "#242424" } },
                  axisLabel: { color: AXIS_LABEL },
            },
            series: [
                  {
                        name: "New",
                        type: "bar",
                        stack: "customers",
                        data: rows.map((r) => r.new_customers),
                        itemStyle: { color: GOLD, borderRadius: [0, 0, 0, 0] },
                        barMaxWidth: 26,
                  },
                  {
                        name: "Returning",
                        type: "bar",
                        stack: "customers",
                        data: rows.map((r) => r.returning_customers),
                        itemStyle: { color: GREEN, borderRadius: [3, 3, 0, 0] },
                        barMaxWidth: 26,
                  },
            ],
      };
}

/** ABC revenue contribution as a donut. */
export function buildAbcDonutOption(rows: AbcRow[]): EChartsOption {
      const counts = { A: 0, B: 0, C: 0 };
      const revenue = { A: 0, B: 0, C: 0 };
      rows.forEach((r) => {
            counts[r.abc_tier] += 1;
            revenue[r.abc_tier] += r.revenue;
      });

      return {
            backgroundColor: "transparent",
            textStyle: { color: AXIS_LABEL },
            tooltip: {
                  trigger: "item",
                  backgroundColor: "#1a1a1a",
                  borderColor: AXIS_LINE,
                  textStyle: { color: "#e5e5e5" },
                  formatter: (p: any) => `Tier ${p.name}<br/>${counts[p.name as "A" | "B" | "C"]} items<br/>₦${p.value.toLocaleString()}`,
            },
            legend: { top: 0, textStyle: { color: AXIS_LABEL } },
            series: [
                  {
                        name: "Revenue by tier",
                        type: "pie",
                        radius: ["45%", "72%"],
                        itemStyle: { borderColor: "#111", borderWidth: 2 },
                        label: { color: AXIS_LABEL },
                        data: [
                              { name: "A", value: revenue.A, itemStyle: { color: GOLD } },
                              { name: "B", value: revenue.B, itemStyle: { color: "#8a8a8a" } },
                              { name: "C", value: revenue.C, itemStyle: { color: "#4a4a4a" } },
                        ],
                  },
            ],
      };
}

/** Grouped bar: blended discount % vs blended margin % per customer category. */
export function buildDiscountByCategoryOption(rows: DiscountByCategoryRow[]): EChartsOption {
      const sorted = [...rows].sort((a, b) => b.blended_discount_pct - a.blended_discount_pct);
      const categories = sorted.map((r) => r.category);
 
      return {
            backgroundColor: "transparent",
            textStyle: { color: AXIS_LABEL },
            tooltip: {
                  trigger: "axis",
                  axisPointer: { type: "shadow" },
                  backgroundColor: "#1a1a1a",
                  borderColor: AXIS_LINE,
                  textStyle: { color: "#e5e5e5" },
            },
            legend: { data: ["Discount %", "Margin %"], textStyle: { color: AXIS_LABEL }, top: 0 },
            grid: { left: 56, right: 24, top: 40, bottom: 32 },
            xAxis: {
                  type: "category",
                  data: categories,
                  axisLine: { lineStyle: { color: AXIS_LINE } },
                  axisLabel: { color: AXIS_LABEL },
            },
            yAxis: {
                  type: "value",
                  axisLine: { lineStyle: { color: AXIS_LINE } },
                  splitLine: { lineStyle: { color: "#242424" } },
                  axisLabel: { color: AXIS_LABEL, formatter: "{value}%" },
            },
            series: [
                  {
                        name: "Discount %",
                        type: "bar",
                        data: sorted.map((r) => r.blended_discount_pct),
                        itemStyle: { color: RED, borderRadius: [3, 3, 0, 0] },
                        barMaxWidth: 28,
                  },
                  {
                        name: "Margin %",
                        type: "bar",
                        data: sorted.map((r) => r.blended_margin_pct),
                        itemStyle: { color: GREEN, borderRadius: [3, 3, 0, 0] },
                        barMaxWidth: 28,
                  },
            ],
      };
}