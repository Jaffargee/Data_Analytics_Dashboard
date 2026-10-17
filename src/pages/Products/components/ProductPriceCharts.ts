import type { EChartsOption } from 'echarts';
import { fmt, fmtCurrency } from '@/lib/utils';
import { CHART_AXIS, CHART_COLORS } from '@/lib/constants/colors';
import type { PriceDistributionRow, PricePoint, PriceSummary, PriceTimelineRow } from '../types';

const axis = { axisLabel: { color: '#8A8578' }, axisLine: { lineStyle: { color: '#3A342A' } } };
const tooltipBase = {
      backgroundColor: CHART_AXIS.tooltip.bg,
      borderColor: CHART_AXIS.tooltip.border,
      textStyle: { color: CHART_AXIS.tooltip.text },
};

const money = (value: unknown) => fmtCurrency(Number(value));

/** Price over time: average line, min–max range, and units sold as bars. */
export function buildPriceTrendOption(rows: PriceTimelineRow[], summary: PriceSummary): EChartsOption {
      const weighted = summary.weighted_avg_price;
      return {
            backgroundColor: 'transparent',
            tooltip: {
                  ...tooltipBase,
                  trigger: 'axis',
                  valueFormatter: (value) => (typeof value === 'number' ? money(value) : String(value)),
            },
            legend: { data: ['Avg price', 'Min price', 'Max price', 'Units sold'], textStyle: { color: '#8A8578' } },
            grid: { left: 72, right: 56, top: 48, bottom: 48 },
            xAxis: { ...axis, type: 'category', data: rows.map((r) => r.period) },
            yAxis: [
                  { ...axis, type: 'value', scale: true, axisLabel: { color: '#8A8578', formatter: (v: number) => money(v) }, splitLine: { lineStyle: { color: CHART_AXIS.grid } } },
                  { ...axis, type: 'value', splitLine: { show: false }, name: 'Units', nameTextStyle: { color: '#8A8578' } },
            ],
            series: [
                  {
                        name: 'Units sold', type: 'bar', yAxisIndex: 1, data: rows.map((r) => Number(r.units)),
                        itemStyle: { color: 'rgba(167,139,250,0.35)', borderRadius: [4, 4, 0, 0] },
                        tooltip: { valueFormatter: (v) => fmt(Number(v)) },
                  },
                  { name: 'Max price', type: 'line', symbol: 'none', data: rows.map((r) => Number(r.max_price)), lineStyle: { color: CHART_COLORS.red, width: 1, type: 'dashed' } },
                  { name: 'Min price', type: 'line', symbol: 'none', data: rows.map((r) => Number(r.min_price)), lineStyle: { color: CHART_COLORS.green, width: 1, type: 'dashed' } },
                  {
                        name: 'Avg price', type: 'line', smooth: true, symbolSize: 6, data: rows.map((r) => Number(r.avg_price)),
                        lineStyle: { color: CHART_COLORS.gold, width: 3 }, itemStyle: { color: CHART_COLORS.gold },
                        markLine: weighted ? {
                              symbol: 'none',
                              label: { color: CHART_COLORS.teal, formatter: `Overall ${money(weighted)}` },
                              lineStyle: { color: CHART_COLORS.teal, type: 'dotted' },
                              data: [{ yAxis: Number(weighted) }],
                        } : undefined,
                  },
            ],
      };
}

/** How many units sold at each price point. */
export function buildPriceDistributionOption(rows: PriceDistributionRow[]): EChartsOption {
      return {
            backgroundColor: 'transparent',
            tooltip: {
                  ...tooltipBase,
                  trigger: 'axis',
                  axisPointer: { type: 'shadow' },
                  formatter: (params: unknown) => {
                        const p = (params as Array<{ dataIndex: number }>)[0];
                        const row = rows[p.dataIndex];
                        return `<b>${money(row.price)}</b><br/>${fmt(row.units)} units (${row.pct_of_units}% of units)<br/>${fmt(row.sale_lines)} sales`;
                  },
            },
            grid: { left: 56, right: 24, top: 32, bottom: 48 },
            xAxis: { ...axis, type: 'category', data: rows.map((r) => money(r.price)) },
            yAxis: { ...axis, type: 'value', name: 'Units', nameTextStyle: { color: '#8A8578' }, splitLine: { lineStyle: { color: CHART_AXIS.grid } } },
            series: [{
                  type: 'bar',
                  data: rows.map((r) => Number(r.units)),
                  itemStyle: { color: CHART_COLORS.gold, borderRadius: [4, 4, 0, 0] },
                  label: { show: true, position: 'top', color: '#8A8578', formatter: (p) => `${rows[p.dataIndex].pct_of_units}%` },
            }],
      };
}

/** Every individual sale as a dot (size = quantity) so outliers and bulk deals stand out. */
export function buildPricePointsOption(points: PricePoint[], summary: PriceSummary): EChartsOption {
      const avg = summary.avg_price;
      return {
            backgroundColor: 'transparent',
            tooltip: {
                  ...tooltipBase,
                  trigger: 'item',
                  formatter: (p: unknown) => {
                        const d = (p as { data: [number, number, number, number] }).data;
                        return `${new Date(d[0]).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}<br/><b>${money(d[1])}</b> × ${fmt(d[2])} units<br/>Sale #${d[3]}`;
                  },
            },
            grid: { left: 72, right: 32, top: 32, bottom: 56 },
            dataZoom: [{ type: 'inside' }, { type: 'slider', height: 16, bottom: 8 }],
            xAxis: { ...axis, type: 'time' },
            yAxis: { ...axis, type: 'value', scale: true, axisLabel: { color: '#8A8578', formatter: (v: number) => money(v) }, splitLine: { lineStyle: { color: CHART_AXIS.grid } } },
            series: [{
                  type: 'scatter',
                  data: points.map((p) => [new Date(p.sold_at).getTime(), Number(p.unit_price), Number(p.quantity), p.sale_id]),
                  symbolSize: (d: number[]) => Math.min(30, 6 + Math.sqrt(Math.abs(d[2])) * 2.5),
                  itemStyle: { color: CHART_COLORS.teal, opacity: 0.6 },
                  markLine: avg ? {
                        symbol: 'none',
                        label: { color: CHART_COLORS.gold, formatter: `Avg ${money(avg)}` },
                        lineStyle: { color: CHART_COLORS.gold, type: 'dashed' },
                        data: [{ yAxis: Number(avg) }],
                  } : undefined,
            }],
      };
}
