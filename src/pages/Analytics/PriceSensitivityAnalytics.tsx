import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, ProgressBar } from "@fluentui/react-components";
import type { EChartsOption } from "echarts";
import EChart from "@/components/charts/EChart"; // adjust path to wherever EChart.tsx lives
import { CardHeader, CardTitle, EmptyState } from "@/components/ui/primitives";
import { fmtCurrency } from "@/lib/utils";
import { supabase } from "@/lib/supabase"; // your existing client singleton

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface PriceBandRow {
      priceRange: string; // "<5k" | "5-10k" | "10-20k" | "20-30k" | "30-50k" | "50-100k" | ">100k"
      lineItems: number;
      unitsSold: number;
      revenue: number;
      pctOfRevenue: number; // 0-100
      isSweetSpot?: boolean;
}

interface PriceSensitivityAnalyticsProps {
      /** Pass data directly if you already have it (e.g. from a parent query). */
      data?: PriceBandRow[];
      /** Optional scoping — e.g. customer id, date range key — used by the built-in fetch. */
      queryKeyExtra?: (string | number)[];
      /** Skip the built-in fetch entirely and just render whatever's in `data`. */
      disableFetch?: boolean;
      className?: string;
}

/* ------------------------------------------------------------------ */
/* Data fetching                                                       */
/* ------------------------------------------------------------------ */

const PRICE_BAND_ORDER = [
      "<5k",
      "5-10k",
      "10-20k",
      "20-30k",
      "30-50k",
      "50-100k",
      ">100k",
] as const;

/**
 * Expects a Postgres view/RPC that returns one row per price band with
 * line_items, units_sold, revenue already aggregated. Swap the `.from()`
 * call for `.rpc('price_sensitivity_analysis', {...})` if you're doing
 * the bucketing server-side (recommended for large item tables).
 */
async function fetchPriceSensitivity(
      extra: (string | number)[] = [],
): Promise<PriceBandRow[]> {
      // const { data, error } = await supabase
      //       .from("price_sensitivity_analysis") // view name — adjust to match your schema
      //       .select("price_range, line_items, units_sold, revenue")
      //       .order("price_range");

      const { data, error } = await supabase.rpc('price_sensitivity_analysis');

      if (error) throw error;

      const rows = (data ?? []) as {
            price_range: string;
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
                        lineItems: r.line_items,
                        unitsSold: r.units_sold,
                        revenue,
                        pctOfRevenue:
                              totalRevenue > 0
                                    ? (revenue / totalRevenue) * 100
                                    : 0,
                        isSweetSpot: revenue === maxRevenue && revenue > 0,
                  };
            })
            .sort(
                  (a, b) =>
                        PRICE_BAND_ORDER.indexOf(a.priceRange as any) -
                        PRICE_BAND_ORDER.indexOf(b.priceRange as any),
            );
}

function usePriceSensitivity(extra: (string | number)[] = [], enabled = true) {
      return useQuery({
            queryKey: ["price-sensitivity-analysis", ...extra],
            queryFn: () => fetchPriceSensitivity(extra),
            enabled,
            staleTime: 5 * 60 * 1000,
      });
}

/* ------------------------------------------------------------------ */
/* Chart option builders                                               */
/* ------------------------------------------------------------------ */

function buildBandBarOption(
      rows: PriceBandRow[],
      metric: "revenue" | "unitsSold",
      color: string,
): EChartsOption {
      return {
            grid: { left: 60, right: 16, top: 16, bottom: 28 },
            tooltip: {
                  trigger: "axis",
                  valueFormatter: (v) =>
                        metric === "revenue"
                              ? fmtCurrency(Number(v))
                              : String(v),
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
                              metric === "revenue"
                                    ? fmtCurrency(v, { compact: true })
                                    : String(v),
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
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function PriceSensitivityAnalytics({
      data,
      queryKeyExtra,
      disableFetch = false,
      className = "",
}: PriceSensitivityAnalyticsProps): JSX.Element {
      const shouldFetch = !disableFetch && !data;
      const {
            data: fetched,
            isLoading,
            isError,
      } = usePriceSensitivity(queryKeyExtra, shouldFetch);

      const rows = data ?? fetched ?? [];

      const revenueOption = useMemo(
            () => buildBandBarOption(rows, "revenue", "#c98a3e"),
            [rows],
      );
      const volumeOption = useMemo(
            () => buildBandBarOption(rows, "unitsSold", "#8a7fd6"),
            [rows],
      );

      const loading = shouldFetch && isLoading;

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
                              {rows.length === 0 && !loading ? (
                                    <EmptyState message="No revenue data for this period" />
                              ) : (
                                    <EChart
                                          option={revenueOption}
                                          loading={loading}
                                          height="260px"
                                    />
                              )}
                        </Card>

                        <Card className="bg-bg-surface p-4">
                              <CardHeader>
                                    <CardTitle className="text-ink-primary text-sm tracking-wide">
                                          VOLUME BY PRICE BAND
                                    </CardTitle>
                              </CardHeader>
                              {rows.length === 0 && !loading ? (
                                    <EmptyState message="No volume data for this period" />
                              ) : (
                                    <EChart
                                          option={volumeOption}
                                          loading={loading}
                                          height="260px"
                                    />
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

                        {rows.length === 0 && !loading ? (
                              <EmptyState message="No price band data available" />
                        ) : (
                              <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                          <thead>
                                                <tr className="text-left text-ink-muted uppercase text-xs tracking-wide">
                                                      <th className="py-2 pr-4 font-medium">
                                                            Price Range
                                                      </th>
                                                      <th className="py-2 pr-4 font-medium">
                                                            Line Items
                                                      </th>
                                                      <th className="py-2 pr-4 font-medium">
                                                            Units Sold
                                                      </th>
                                                      <th className="py-2 pr-4 font-medium">
                                                            Revenue
                                                      </th>
                                                      <th className="py-2 pr-4 font-medium">
                                                            % of Revenue
                                                      </th>
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {rows.map((row) => (
                                                      <tr
                                                            key={row.priceRange}
                                                            className={`border-t border-white/5 ${
                                                                  row.isSweetSpot
                                                                        ? "bg-accent-gold/10"
                                                                        : ""
                                                            }`}
                                                      >
                                                            <td className="py-3 pr-4">
                                                                  <span
                                                                        className={
                                                                              row.isSweetSpot
                                                                                    ? "text-accent-gold font-semibold"
                                                                                    : "text-ink-primary font-medium"
                                                                        }
                                                                  >
                                                                        {
                                                                              row.priceRange
                                                                        }
                                                                  </span>
                                                                  {row.isSweetSpot && (
                                                                        <span className="ml-2 text-xs text-accent-gold/80">
                                                                              ★
                                                                              Sweet
                                                                              Spot
                                                                        </span>
                                                                  )}
                                                            </td>
                                                            <td className="py-3 pr-4 text-ink-secondary">
                                                                  {
                                                                        row.lineItems
                                                                  }
                                                            </td>
                                                            <td className="py-3 pr-4 text-ink-secondary">
                                                                  {
                                                                        row.unitsSold
                                                                  }
                                                            </td>
                                                            <td className="py-3 pr-4 text-emerald-400 font-medium">
                                                                  {fmtCurrency(
                                                                        row.revenue,
                                                                  )}
                                                            </td>
                                                            <td className="py-3 pr-4">
                                                                  <div className="flex items-center gap-3">
                                                                        <ProgressBar
                                                                              className="flex-1 max-w-[220px]"
                                                                              value={
                                                                                    row.pctOfRevenue /
                                                                                    100
                                                                              }
                                                                              thickness="medium"
                                                                        />
                                                                        <span className="text-ink-secondary tabular-nums w-12 text-right">
                                                                              {row.pctOfRevenue.toFixed(
                                                                                    1,
                                                                              )}
                                                                              %
                                                                        </span>
                                                                  </div>
                                                            </td>
                                                      </tr>
                                                ))}
                                          </tbody>
                                    </table>
                              </div>
                        )}

                        {isError && (
                              <p className="mt-2 text-xs text-red-400">
                                    Couldn't load price sensitivity data. Check
                                    the console for details.
                              </p>
                        )}
                  </Card>
            </div>
      );
}