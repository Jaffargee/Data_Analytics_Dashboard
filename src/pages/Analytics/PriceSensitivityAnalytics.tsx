import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, ProgressBar } from "@fluentui/react-components";
import { ChevronDown20Regular, ChevronRight20Regular } from "@fluentui/react-icons";
import type { EChartsOption } from "echarts";
import EChart from "@/components/charts/EChart"; // adjust to wherever EChart.tsx lives
import { CardHeader, CardTitle, EmptyState } from "@/components/ui/primitives";
import { fmtCurrency } from "@/lib/utils";
import { supabase } from "@/lib/supabase"; // your existing client singleton

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface PriceBandRow {
      priceRange: string;
      bandOrder: number;
      lineItems: number;
      unitsSold: number;
      revenue: number;
      pctOfRevenue: number;
      isSweetSpot?: boolean;
}

export interface TopItemRow {
      priceRange: string;
      bandOrder: number;
      metric: "revenue" | "volume";
      rank: number;
      posItemId: number;
      itemName: string;
      unitsSold: number;
      revenue: number;
}

interface PriceSensitivityAnalyticsProps {
      customerId?: number | null;
      dateFrom?: string | null;
      dateTo?: string | null;
      className?: string;
}

/* ------------------------------------------------------------------ */
/* Data fetching                                                       */
/* ------------------------------------------------------------------ */

function useBandParams(customerId?: number | null, dateFrom?: string | null, dateTo?: string | null) {
      return useMemo(
            () => ({
                  p_customer_id: customerId ?? null,
                  p_date_from: dateFrom ?? null,
                  p_date_to: dateTo ?? null,
            }),
            [customerId, dateFrom, dateTo]
      );
}

function usePriceSensitivity(customerId?: number | null, dateFrom?: string | null, dateTo?: string | null) {
      const params = useBandParams(customerId, dateFrom, dateTo);

      return useQuery({
            queryKey: ["price-sensitivity-analysis", params],
            queryFn: async (): Promise<PriceBandRow[]> => {
                  const { data, error } = await supabase.rpc("price_sensitivity_analysis", params);
                  if (error) throw error;

                  const rows = (data ?? []) as {
                        price_range: string;
                        band_order: number;
                        line_items: number;
                        units_sold: number;
                        revenue: number;
                  }[];

                  const totalRevenue = rows.reduce((sum, r) => sum + Number(r.revenue), 0);
                  const maxRevenue = Math.max(...rows.map((r) => Number(r.revenue)), 0);

                  return rows
                        .map((r) => {
                              const revenue = Number(r.revenue);
                              return {
                                    priceRange: r.price_range,
                                    bandOrder: r.band_order,
                                    lineItems: r.line_items,
                                    unitsSold: Number(r.units_sold),
                                    revenue,
                                    pctOfRevenue: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
                                    isSweetSpot: revenue === maxRevenue && revenue > 0,
                              };
                        })
                        .sort((a, b) => a.bandOrder - b.bandOrder);
            },
            staleTime: 5 * 60 * 1000,
      });
}

function usePriceSensitivityTopItems(
      customerId?: number | null,
      dateFrom?: string | null,
      dateTo?: string | null,
      limit = 5,
      enabled = true
) {
      const params = useBandParams(customerId, dateFrom, dateTo);

      return useQuery({
            queryKey: ["price-sensitivity-top-items", params, limit],
            queryFn: async (): Promise<TopItemRow[]> => {
                  const { data, error } = await supabase.rpc("price_sensitivity_top_items", {
                        ...params,
                        p_limit: limit,
                  });
                  if (error) throw error;

                  return ((data ?? []) as any[]).map((r) => ({
                        priceRange: r.price_range,
                        bandOrder: r.band_order,
                        metric: r.metric,
                        rank: r.item_rank,
                        posItemId: r.pos_item_id,
                        itemName: r.item_name,
                        unitsSold: Number(r.units_sold),
                        revenue: Number(r.revenue),
                  }));
            },
            enabled,
            staleTime: 5 * 60 * 1000,
      });
}

/* ------------------------------------------------------------------ */
/* Chart option builder                                                */
/* ------------------------------------------------------------------ */

function buildBandBarOption(
      rows: PriceBandRow[],
      metric: "revenue" | "unitsSold",
      color: string
): EChartsOption {
      return {
            grid: { left: 60, right: 16, top: 16, bottom: 28 },
            tooltip: {
                  trigger: "axis",
                  valueFormatter: (v) => (metric === "revenue" ? fmtCurrency(Number(v)) : String(v)),
            },
            xAxis: {
                  type: "category",
                  data: rows.map((r) => r.priceRange),
                  axisLine: { lineStyle: { color: "#3a3a3a" } },
                  axisLabel: { color: "#9a9a9a", fontSize: 11 },
                  axisTick: { show: false },
            },
            yAxis: {
                  type: "value",
                  axisLine: { show: false },
                  splitLine: { lineStyle: { color: "#242424" } },
                  axisLabel: {
                        color: "#9a9a9a",
                        fontSize: 11,
                        formatter: (v: number) =>
                              metric === "revenue" ? fmtCurrency(v, { compact: true }) : String(v),
                  },
            },
            series: [
                  {
                        type: "bar",
                        data: rows.map((r) => r[metric]),
                        itemStyle: { color, borderRadius: [3, 3, 0, 0] },
                        barMaxWidth: 48,
                  },
            ],
      };
}

/* ------------------------------------------------------------------ */
/* Top-5 drill-down panel                                              */
/* ------------------------------------------------------------------ */

function TopItemsList({ title, items }: { title: string; items: TopItemRow[] }) {
      return (
            <div className="flex-1 min-w-[220px]">
                  <p className="text-ink-muted text-xs uppercase tracking-wide mb-2">{title}</p>
                  <ol className="flex flex-col gap-1.5">
                        {items.map((item) => (
                              <li
                                    key={`${item.metric}-${item.rank}-${item.posItemId}`}
                                    className="flex items-center justify-between gap-3 text-sm"
                              >
                                    <span className="flex items-center gap-2 min-w-0">
                                          <span className="text-ink-muted tabular-nums w-4 shrink-0">{item.rank}.</span>
                                          <span className="text-ink-primary truncate">{item.itemName}</span>
                                    </span>
                                    <span className="text-ink-secondary tabular-nums shrink-0">
                                          {item.metric === "revenue"
                                                ? fmtCurrency(item.revenue)
                                                : `${item.unitsSold} units`}
                                    </span>
                              </li>
                        ))}
                        {items.length === 0 && (
                              <li className="text-ink-muted text-sm">No items in this band</li>
                        )}
                  </ol>
            </div>
      );
}

function BandDrilldown({
      priceRange,
      customerId,
      dateFrom,
      dateTo,
}: {
      priceRange: string;
      customerId?: number | null;
      dateFrom?: string | null;
      dateTo?: string | null;
}) {
      const { data: topItems, isLoading } = usePriceSensitivityTopItems(customerId, dateFrom, dateTo, 5);

      const revenueItems = useMemo(
            () => (topItems ?? []).filter((i) => i.priceRange === priceRange && i.metric === "revenue"),
            [topItems, priceRange]
      );
      const volumeItems = useMemo(
            () => (topItems ?? []).filter((i) => i.priceRange === priceRange && i.metric === "volume"),
            [topItems, priceRange]
      );

      if (isLoading) {
            return <p className="text-ink-muted text-sm py-3">Loading top items…</p>;
      }

      return (
            <div className="flex flex-col sm:flex-row gap-6 py-4 px-2">
                  <TopItemsList title="Top 5 by Revenue" items={revenueItems} />
                  <TopItemsList title="Top 5 by Volume" items={volumeItems} />
            </div>
      );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function PriceSensitivityAnalytics({
      customerId = null,
      dateFrom = null,
      dateTo = null,
      className = "",
}: PriceSensitivityAnalyticsProps): JSX.Element {
      const { data: rowsData, isLoading, isError } = usePriceSensitivity(customerId, dateFrom, dateTo);
      const rows = rowsData ?? [];
      const [expanded, setExpanded] = useState<string | null>(null);

      const revenueOption = useMemo(() => buildBandBarOption(rows, "revenue", "#c98a3e"), [rows]);
      const volumeOption = useMemo(() => buildBandBarOption(rows, "unitsSold", "#8a7fd6"), [rows]);

      return (
            <div className={`flex flex-col gap-4 ${className}`}>
                  {/* Charts row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-bg-surface p-4">
                              <CardHeader>
                                    <CardTitle className="text-ink-primary text-sm tracking-wide">
                                          REVENUE BY PRICE BAND
                                    </CardTitle>
                              </CardHeader>
                              {rows.length === 0 && !isLoading ? (
                                    <EmptyState message="No revenue data for this period" />
                              ) : (
                                    <EChart option={revenueOption} loading={isLoading} height="260px" />
                              )}
                        </Card>

                        <Card className="bg-bg-surface p-4">
                              <CardHeader>
                                    <CardTitle className="text-ink-primary text-sm tracking-wide">
                                          VOLUME BY PRICE BAND
                                    </CardTitle>
                              </CardHeader>
                              {rows.length === 0 && !isLoading ? (
                                    <EmptyState message="No volume data for this period" />
                              ) : (
                                    <EChart option={volumeOption} loading={isLoading} height="260px" />
                              )}
                        </Card>
                  </div>

                  {/* Table */}
                  <Card className="bg-bg-surface p-4">
                        <CardHeader>
                              <CardTitle className="text-ink-primary text-sm tracking-wide">
                                    PRICE SENSITIVITY ANALYSIS
                              </CardTitle>
                        </CardHeader>

                        {rows.length === 0 && !isLoading ? (
                              <EmptyState message="No price band data available" />
                        ) : (
                              <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                          <thead>
                                                <tr className="text-left text-ink-muted uppercase text-xs tracking-wide">
                                                      <th className="py-2 pr-4 font-medium w-6" />
                                                      <th className="py-2 pr-4 font-medium">Price Range</th>
                                                      <th className="py-2 pr-4 font-medium">Line Items</th>
                                                      <th className="py-2 pr-4 font-medium">Units Sold</th>
                                                      <th className="py-2 pr-4 font-medium">Revenue</th>
                                                      <th className="py-2 pr-4 font-medium">% of Revenue</th>
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {rows.map((row) => {
                                                      const isOpen = expanded === row.priceRange;
                                                      return (
                                                            <React.Fragment key={row.priceRange}>
                                                                  <tr
                                                                        className={`border-t border-white/5 cursor-pointer hover:bg-white/[0.03] ${
                                                                              row.isSweetSpot ? "bg-accent-gold/10" : ""
                                                                        }`}
                                                                        onClick={() =>
                                                                              setExpanded(isOpen ? null : row.priceRange)
                                                                        }
                                                                  >
                                                                        <td className="py-3 pl-1 text-ink-muted">
                                                                              {isOpen ? (
                                                                                    <ChevronDown20Regular />
                                                                              ) : (
                                                                                    <ChevronRight20Regular />
                                                                              )}
                                                                        </td>
                                                                        <td className="py-3 pr-4">
                                                                              <span
                                                                                    className={
                                                                                          row.isSweetSpot
                                                                                                ? "text-accent-gold font-semibold"
                                                                                                : "text-ink-primary font-medium"
                                                                                    }
                                                                              >
                                                                                    {row.priceRange}
                                                                              </span>
                                                                              {row.isSweetSpot && (
                                                                                    <span className="ml-2 text-xs text-accent-gold/80">
                                                                                          ★ Sweet Spot
                                                                                    </span>
                                                                              )}
                                                                        </td>
                                                                        <td className="py-3 pr-4 text-ink-secondary">
                                                                              {row.lineItems}
                                                                        </td>
                                                                        <td className="py-3 pr-4 text-ink-secondary">
                                                                              {row.unitsSold}
                                                                        </td>
                                                                        <td className="py-3 pr-4 text-emerald-400 font-medium">
                                                                              {fmtCurrency(row.revenue)}
                                                                        </td>
                                                                        <td className="py-3 pr-4">
                                                                              <div className="flex items-center gap-3">
                                                                                    <ProgressBar
                                                                                          className="flex-1 max-w-[220px]"
                                                                                          value={row.pctOfRevenue / 100}
                                                                                          thickness="medium"
                                                                                    />
                                                                                    <span className="text-ink-secondary tabular-nums w-12 text-right">
                                                                                          {row.pctOfRevenue.toFixed(1)}%
                                                                                    </span>
                                                                              </div>
                                                                        </td>
                                                                  </tr>
                                                                  {isOpen && (
                                                                        <tr className="bg-black/20">
                                                                              <td colSpan={6}>
                                                                                    <BandDrilldown
                                                                                          priceRange={row.priceRange}
                                                                                          customerId={customerId}
                                                                                          dateFrom={dateFrom}
                                                                                          dateTo={dateTo}
                                                                                    />
                                                                              </td>
                                                                        </tr>
                                                                  )}
                                                            </React.Fragment>
                                                      );
                                                })}
                                          </tbody>
                                    </table>
                              </div>
                        )}

                        {isError && (
                              <p className="mt-2 text-xs text-red-400">
                                    Couldn't load price sensitivity data. Check the console for details.
                              </p>
                        )}
                  </Card>
            </div>
      );
}