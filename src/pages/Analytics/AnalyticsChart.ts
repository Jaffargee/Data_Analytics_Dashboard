import type { EChartsOption } from "echarts";
import type {
      RevenueWeekRow,
      DiscountTrendRow,
      RetentionWeekRow,
      AbcRow,
} from "../../hooks/analytics/useAnalyticsDashboard";

const GOLD = "#D4AF37"; // ADJUST to your actual --accent-gold token if it differs
const RED = "#E5484D";
const GREEN = "#3DD68C";
const AXIS_LINE = "#3a3a3a";
const AXIS_LABEL = "#9a9a9a";

function fmtDate(d: string): string {
      return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
