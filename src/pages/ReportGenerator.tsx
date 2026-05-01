import React, { useState, useCallback, useEffect } from 'react'
import { TopBar } from '@/components/ui/TopBar'
import { Card, CardHeader, CardTitle, StatCard, Badge, ProgressBar, EmptyState } from '@/components/ui/primitives'
import { BarChart } from '@/components/charts/BarChart'
import { LineChart } from '@/components/charts/LineChart'
import { DonutChart } from '@/components/charts/DonutChart'
import { supabase } from '@/lib/supabase'
import { fmtCurrency, fmt, fmtPercent, fmtMonthLabel, cn, deriveLineChart, isCurrencyCol, formatCellValue } from '@/lib/utils'
import {
      Calendar, TrendingUp, Package, Users, Clock, DollarSign,
      BarChart2, Download, RefreshCw, ChevronDown, Loader2,
      ArrowUp, ArrowDown, Minus,
      ArrowRight
} from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import * as Select from '@radix-ui/react-select'
import { executeSQL } from '@/lib/llm_utils'
import { accounts_summary_report, todays_sales_report } from '@/constants'
import { QueryResult } from '@/types'
import { ChartDialog } from '@/components/ui/ChartDialog'

// ── Types ────────────────────────────────────────────────────────────────────
interface PeriodSummary { metric: string; value: number }
interface RevenueByDow  { day_of_week: string; dow_num: number; transactions: number; revenue: number; units_sold: number }
interface RevenueByCategory { category: string; revenue: number; units_sold: number; transactions: number; avg_price: number }
interface TopProduct { item_name: string; category: string; revenue: number; units_sold: number; transactions: number; avg_price: number; rev_per_txn: number; gross_profit: number; margin_pct: number }
interface PriceSensitivity { price_bucket: string; sort_order: number; line_items: number; units_sold: number; revenue: number; pct_of_revenue: number }
interface TimeIntelligence { time_bucket: string; sort_order: number; transactions: number; revenue: number }
interface TopCustomer { customer_name: string; revenue: number; transactions: number; units: number; avg_basket: number; pct_of_total: number }
interface DailyBreakdown { sale_date: string; day_of_week: string; revenue: number; transactions: number; units_sold: number }
interface Comparison { metric: string; period_1: number; period_2: number; change: number; change_pct: number }

// ── Preset date ranges ───────────────────────────────────────────────────────
const PRESETS = [
      { label: 'Last 7 days',  days: 7  },
      { label: 'Last 14 days', days: 14 },
      { label: 'Last 30 days', days: 30 },
      { label: 'Last 60 days', days: 60 },
      { label: 'Last 90 days', days: 90 },
]

const PERIOD1_DEFAULT = { from: '2026-03-31', to: '2026-04-11' }
const PERIOD2_DEFAULT = { from: '2026-04-11', to: '2026-04-26' }

const DONUT_COLORS = ['#f5c842','#2dd4bf','#a78bfa','#f87171','#fb923c','#34d399','#60a5fa']

function today(): string { return new Date().toISOString().split('T')[0] }
function nDaysAgo(n: number): string {
      const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]
}

// ── Helper ───────────────────────────────────────────────────────────────────
function TrendBadge({ pct }: { pct: number }) {
      if (Math.abs(pct) < 0.5) return <Badge variant="muted"><Minus size={10} className="inline mr-1"/>Flat</Badge>
      if (pct > 0) return <Badge variant="teal"><ArrowUp size={10} className="inline mr-1"/>{pct.toFixed(1)}%</Badge>
      return <Badge variant="red"><ArrowDown size={10} className="inline mr-1"/>{Math.abs(pct).toFixed(1)}%</Badge>
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function ReportGenerator() {
      const [fromDate, setFromDate] = useState(PERIOD2_DEFAULT.from)
      const [toDate,   setToDate]   = useState(PERIOD2_DEFAULT.to)
      const [loading,  setLoading]  = useState(false)
      const [loading2,  setLoading2]  = useState(false)
      const [generated, setGenerated] = useState(false)
      const [reportDate, setReportDate] = useState<string>(new Date().toJSON().split('T')[0])

      // Report data state
      const [summary,    setSummary]    = useState<PeriodSummary[]>([])
      const [dowData,    setDowData]    = useState<RevenueByDow[]>([])
      const [catData,    setCatData]    = useState<RevenueByCategory[]>([])
      const [products,   setProducts]   = useState<TopProduct[]>([])
      const [prices,     setPrices]     = useState<PriceSensitivity[]>([])
      const [timingData, setTimingData] = useState<TimeIntelligence[]>([])
      const [customers,  setCustomers]  = useState<TopCustomer[]>([])
      const [daily,      setDaily]      = useState<DailyBreakdown[]>([])
      const [comparison, setComparison] = useState<Comparison[]>([])
      const [reportResult, setSummaryResult] = useState<QueryResult | null>(null);

      const generateReport = useCallback(async () => {
            setLoading(true)
            try {
                  const [s, d, c, p, pr, t, cu, da, co] = await Promise.all([
                        supabase.rpc('fn_period_executive_summary', { from_date: fromDate, to_date: toDate }),
                        supabase.rpc('fn_period_revenue_by_dow',    { from_date: fromDate, to_date: toDate }),
                        supabase.rpc('fn_period_revenue_by_category',{ from_date: fromDate, to_date: toDate }),
                        supabase.rpc('fn_period_top_products',      { from_date: fromDate, to_date: toDate, top_n: 25 }),
                        supabase.rpc('fn_period_price_sensitivity', { from_date: fromDate, to_date: toDate }),
                        supabase.rpc('fn_period_time_intelligence', { from_date: fromDate, to_date: toDate }),
                        supabase.rpc('fn_period_top_customers',     { from_date: fromDate, to_date: toDate, top_n: 15 }),
                        supabase.rpc('fn_period_daily_breakdown',   { from_date: fromDate, to_date: toDate }),
                        supabase.rpc('fn_period_comparison', {
                              p1_from: PERIOD1_DEFAULT.from, p1_to: PERIOD1_DEFAULT.to,
                              p2_from: fromDate, p2_to: toDate,
                        }),
                  ])
                  setSummary(s.data ?? [])
                  setDowData(d.data ?? [])
                  setCatData(c.data ?? [])
                  setProducts(p.data ?? [])
                  setPrices(pr.data ?? [])
                  setTimingData(t.data ?? [])
                  setCustomers(cu.data ?? [])
                  setDaily(da.data ?? [])
                  setComparison(co.data ?? [])
                  setGenerated(true)
            } finally {
                  setLoading(false)
            }
      }, [fromDate, toDate])


      const report_query = {
            'summary': accounts_summary_report(reportDate),
            'sales': todays_sales_report(reportDate)
      }

      const generateDReport = useCallback(async (type: 'summary' | 'sales') => {
            setLoading2(true)
            const result = await executeSQL(report_query[type]);
            setSummaryResult(deriveLineChart(result))
            setLoading2(false)
      }, [reportDate])

      // Compute KPIs from summary
      const kpiMap = Object.fromEntries(summary.map(r => [r.metric, r.value]))
      const totalRev   = kpiMap['total_revenue']   ?? 0
      const totalTxn   = kpiMap['total_transactions'] ?? 0
      const avgBasket  = kpiMap['avg_basket_value']  ?? 0
      const avgDaily   = kpiMap['avg_daily_revenue']  ?? 0
      const totalUnits = kpiMap['total_units_sold']   ?? 0
      const tradingDays= kpiMap['trading_days']       ?? 0

      // Chart data transforms
      const dowChart = dowData.sort((a,b) => a.dow_num - b.dow_num).map(r => ({
            label: r.day_of_week.trim().slice(0,3),
            value: Number(r.revenue),
      }))

      const dailyChart = daily.map(r => ({
            label: r.sale_date.slice(5),
            value: Number(r.revenue),
      }))

      const catDonut = catData.slice(0,7).map((r,i) => ({
            label: r.category,
            value: Number(r.revenue),
            color: DONUT_COLORS[i % DONUT_COLORS.length],
      }))

      const maxCatRev = Math.max(...catData.map(r => Number(r.revenue)), 1)
      const maxProdRev= Math.max(...products.map(r => Number(r.revenue)), 1)
      const maxCustRev= Math.max(...customers.map(r => Number(r.revenue)), 1)

      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar title="Report Generator" subtitle="Generate analytics reports for any time period" />

                  <main className="flex-1 p-6 space-y-6">

                        {/* ── Date Range Picker ── */}
                        <Card>
                              <CardHeader>
                                    <CardTitle>Select Period</CardTitle>
                                    {generated && <Badge variant="teal">Report generated</Badge>}
                              </CardHeader>

                              <div className="flex flex-wrap items-end gap-4">
                                    {/* Quick presets */}
                                    <div className="flex flex-wrap gap-2">
                                          {PRESETS.map(p => (
                                                <button key={p.days}
                                                      onClick={() => { setFromDate(nDaysAgo(p.days)); setToDate(today()) }}
                                                      className="px-3 py-1.5 text-xs font-mono border border-bg-border rounded-lg text-ink-muted hover:text-accent-gold hover:border-accent-gold/30 transition-all">
                                                      {p.label}
                                                </button>
                                          ))}
                                    </div>

                                    {/* Custom date pickers */}
                                    <div className="flex items-center gap-3 ml-auto flex-wrap">
                                          <div className="flex items-center gap-2">
                                                <Calendar size={13} className="text-ink-muted" />
                                                <label className="text-xs text-ink-muted font-body">From</label>
                                                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                                                      className="bg-bg-hover border border-bg-border rounded-lg px-3 py-1.5 text-xs font-mono text-ink-primary outline-none focus:border-accent-gold/50 transition-colors" />
                                          </div>
                                          <div className="flex items-center gap-2">
                                                <label className="text-xs text-ink-muted font-body">To</label>
                                                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                                                      className="bg-bg-hover border border-bg-border rounded-lg px-3 py-1.5 text-xs font-mono text-ink-primary outline-none focus:border-accent-gold/50 transition-colors" />
                                          </div>
                                          <button
                                                onClick={generateReport}
                                                disabled={loading || !fromDate || !toDate}
                                                className="flex items-center gap-2 px-5 py-2 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-mono font-medium hover:bg-accent-gold/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                                      {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                                      {loading ? 'Generating…' : 'Generate Report'}
                                          </button>
                                    </div>

                              </div>

                              {/* Summary Report Date Range */}
                              <div className="flex w-full relative flex-wrap gap-4 items-center my-4">
                                    <div>
                                          <span>Summary Report</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                          <Calendar size={13} className="text-ink-muted" />
                                          <label className="text-xs text-ink-muted font-body">Date</label>
                                          <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)}
                                                className="bg-bg-hover border border-bg-border rounded-lg px-3 py-1.5 text-xs font-mono text-ink-primary outline-none focus:border-accent-gold/50 transition-colors" />
                                    </div>
                                    <div>
                                          <button
                                                onClick={() => generateDReport('summary')}
                                                disabled={loading2}
                                                className="flex items-center gap-2 px-5 py-2 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-mono font-medium hover:bg-accent-gold/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                                      {loading2 ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                                      {loading2 ? 'Generating…' : 'Generate Summary Report'}
                                          </button>
                                    </div>
                              </div>

                              {/* Summary Report Date Range */}
                              <div className="flex w-full relative flex-wrap gap-4 items-center my-4">
                                    <div>
                                          <span>Sales Report</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                          <Calendar size={13} className="text-ink-muted" />
                                          <label className="text-xs text-ink-muted font-body">Date</label>
                                          <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)}
                                                className="bg-bg-hover border border-bg-border rounded-lg px-3 py-1.5 text-xs font-mono text-ink-primary outline-none focus:border-accent-gold/50 transition-colors" />
                                    </div>
                                    <div>
                                          <button
                                                onClick={() => generateDReport('sales')}
                                                disabled={loading2}
                                                className="flex items-center gap-2 px-5 py-2 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-mono font-medium hover:bg-accent-gold/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                                      {loading2 ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                                      {loading2 ? 'Generating…' : 'Generate Summary Report'}
                                          </button>
                                    </div>
                              </div>

                        </Card>

                  {/* Summary Accounts Reports */}
                  {/* {
                        reportResult && reportResult.chartData?.data && (
                              <ChartDialog triggerComponent={<button className='flex items-center justify-center'><BarChart data={reportResult.chartData.data} /></button>} height={500} type='line' data={reportResult.chartData.data} />
                        )
                  } */}
                  {
                        reportResult && reportResult.rows &&  (
                              <Card>
                                    <CardHeader><CardTitle>Accounts Summary Report</CardTitle></CardHeader>
                                    <div className="overflow-x-auto">
                                          <table className="w-full">
                                                <thead>
                                                      <tr className="border-b border-bg-border">
                                                            {
                                                                  reportResult.columns.map((col, index) => (
                                                                        <th key={index} className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted">{col.toLocaleUpperCase()}</th>
                                                                  ))
                                                            }
                                                      </tr>
                                                </thead>
                                                <tbody>
                                                      {reportResult.rows.map((row, index) => (
                                                            <tr key={index} className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors">
                                                                  {reportResult.columns.map(col => (
                                                                        <td key={col} className="py-2.5 pr-4 whitespace-nowrap">
                                                                              <span className={cn('text-xs font-mono', isCurrencyCol(col) ? 'text-accent-gold font-medium' : '', col === reportResult.columns[0] ? 'text-ink-primary font-body' : 'text-ink-secondary')}>
                                                                                    {formatCellValue(col, row[col])}
                                                                              </span>
                                                                        </td>
                                                                  ))}
                                                            </tr>
                                                      ))}
                                                </tbody>
                                          </table>
                                    </div>
                              </Card>
                        )
                  }

                  {/* ── Loading state ── */}
                  {loading && (
                  <div className="flex items-center justify-center py-20 gap-3">
                        <Loader2 size={20} className="text-accent-gold animate-spin" />
                        <span className="text-ink-muted font-body text-sm">Running analytics…</span>
                  </div>
                  )}

                  {/* ── Report content ── */}
                  {!loading && generated && (
                  <>
                        {/* KPI row */}
                        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
                              <StatCard label="Total Revenue"   value={fmtCurrency(totalRev)}  icon={<DollarSign size={14}/>} accent="gold"   delay={0}   />
                              <StatCard label="Transactions"    value={fmt(totalTxn)}           icon={<BarChart2 size={14}/>}  accent="teal"   delay={100} />
                              <StatCard label="Avg Daily Rev"   value={fmtCurrency(avgDaily)}   icon={<TrendingUp size={14}/>} accent="purple" delay={200} />
                              <StatCard label="Avg Basket"      value={fmtCurrency(avgBasket)}  icon={<Package size={14}/>}    accent="gold"   delay={300} />
                              <StatCard label="Units Sold"      value={fmt(totalUnits)}         icon={<Users size={14}/>}      accent="teal"   delay={400} />
                        </div>

                        {/* Tabs */}
                        <Tabs.Root defaultValue="overview">
                              <Tabs.List className="flex gap-1 bg-bg-panel border border-bg-border rounded-xl p-1 flex-wrap">
                                    {['overview','timing','products','prices','customers','comparison'].map(v => (
                                          <Tabs.Trigger key={v} value={v}
                                                className="px-4 py-1.5 text-xs font-body rounded-lg text-ink-secondary
                                                data-[state=active]:bg-accent-gold/15 data-[state=active]:text-accent-gold
                                                data-[state=active]:border data-[state=active]:border-accent-gold/30
                                                hover:text-ink-primary transition-all capitalize"
                                          >
                                                {v}
                                          </Tabs.Trigger>
                                    ))}
                              </Tabs.List>

                              {/* ── OVERVIEW TAB ── */}
                              <Tabs.Content value="overview" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                          <Card glow>
                                                <CardHeader><CardTitle>Daily Revenue</CardTitle><Badge variant="teal">{daily.length} days</Badge></CardHeader>
                                                {dailyChart.length
                                                ? <LineChart data={dailyChart} height={200} color="#2dd4bf" formatValue={fmtCurrency} />
                                                : <EmptyState />}
                                          </Card>
                                          <Card glow>
                                          <CardHeader><CardTitle>Revenue by Day of Week</CardTitle></CardHeader>
                                          {dowChart.length
                                          ? <BarChart data={dowChart} height={200} color="#f5c842" formatValue={fmtCurrency} />
                                          : <EmptyState />}
                                          </Card>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                          <Card glow>
                                          <CardHeader><CardTitle>Revenue by Category</CardTitle></CardHeader>
                                          {catDonut.length
                                          ? <DonutChart data={catDonut} size={180} formatValue={fmtCurrency} />
                                          : <EmptyState />}
                                          </Card>
                                          <Card>
                                          <CardHeader><CardTitle>Category Breakdown</CardTitle></CardHeader>
                                          <div className="space-y-3">
                                          {catData.map((r, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                <div className="w-24 shrink-0">
                                                <p className="text-xs font-body text-ink-primary truncate">{r.category}</p>
                                                <p className="text-[10px] font-mono text-ink-muted">{fmt(r.units_sold)} units</p>
                                                </div>
                                                <div className="flex-1"><ProgressBar value={Number(r.revenue)} max={maxCatRev} accent="gold" /></div>
                                                <div className="w-24 text-right shrink-0">
                                                <p className="text-xs font-mono text-accent-gold">{fmtCurrency(r.revenue)}</p>
                                                <p className="text-[10px] font-mono text-ink-muted">{fmt(r.transactions)} txns</p>
                                                </div>
                                                </div>
                                          ))}
                                          </div>
                                          </Card>
                                    </div>

                                    {/* Daily table */}
                                    <Card>
                                          <CardHeader><CardTitle>Day-by-Day Breakdown</CardTitle><Badge variant="muted">{tradingDays} days</Badge></CardHeader>
                                          <div className="overflow-x-auto">
                                          <table className="w-full">
                                          <thead>
                                                <tr className="border-b border-bg-border">
                                                {['Date','Day','Revenue','Transactions','Units','Avg Basket'].map(h => (
                                                <th key={h} className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted">{h}</th>
                                                ))}
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {daily.map((r, i) => (
                                                <tr key={i} className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors">
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-primary">{r.sale_date}</td>
                                                <td className="py-2.5 pr-4 text-xs font-body text-ink-secondary">{r.day_of_week?.trim()}</td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-accent-gold font-medium">{fmtCurrency(r.revenue)}</td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">{fmt(r.transactions)}</td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">{fmt(r.units_sold)}</td>
                                                <td className="py-2.5 text-xs font-mono text-ink-secondary">{fmtCurrency(Number(r.revenue)/Number(r.transactions))}</td>
                                                </tr>
                                                ))}
                                          </tbody>
                                          </table>
                                          </div>
                                    </Card>
                              </Tabs.Content>

                              {/* ── TIMING TAB ── */}
                              <Tabs.Content value="timing" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                          <Card glow>
                                          <CardHeader><CardTitle>Sales by Time of Day</CardTitle></CardHeader>
                                          <div className="space-y-3 pt-2">
                                          {timingData.sort((a,b) => a.sort_order - b.sort_order).map((r, i) => {
                                                const maxRev = Math.max(...timingData.map(x => Number(x.revenue)))
                                                return (
                                                <div key={i} className="flex items-center gap-3">
                                                <div className="w-36 shrink-0">
                                                      <p className="text-xs font-body text-ink-primary">{r.time_bucket}</p>
                                                      <p className="text-[10px] font-mono text-ink-muted">{fmt(r.transactions)} txns</p>
                                                </div>
                                                <div className="flex-1"><ProgressBar value={Number(r.revenue)} max={maxRev} accent="teal" /></div>
                                                <p className="w-28 text-right text-xs font-mono text-accent-teal shrink-0">{fmtCurrency(r.revenue)}</p>
                                                </div>
                                                )
                                          })}
                                          </div>
                                          </Card>

                                          <Card glow>
                                          <CardHeader><CardTitle>Revenue by Day of Week</CardTitle></CardHeader>
                                          {dowChart.length
                                          ? <BarChart data={dowChart} height={200} color="#a78bfa" formatValue={fmtCurrency} />
                                          : <EmptyState />}
                                          </Card>
                                    </div>

                                    <Card>
                                          <CardHeader><CardTitle>Day of Week Deep Dive</CardTitle></CardHeader>
                                          <div className="overflow-x-auto">
                                          <table className="w-full">
                                          <thead>
                                                <tr className="border-b border-bg-border">
                                                {['Day','Revenue','Transactions','Units Sold','% of Week'].map(h => (
                                                <th key={h} className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted">{h}</th>
                                                ))}
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {dowData.sort((a,b) => a.dow_num - b.dow_num).map((r, i) => {
                                                const totalWeekRev = dowData.reduce((s,x) => s + Number(x.revenue), 0)
                                                return (
                                                <tr key={i} className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors">
                                                      <td className="py-2.5 pr-4 text-xs font-body text-ink-primary">{r.day_of_week?.trim()}</td>
                                                      <td className="py-2.5 pr-4 text-xs font-mono text-accent-gold font-medium">{fmtCurrency(r.revenue)}</td>
                                                      <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">{fmt(r.transactions)}</td>
                                                      <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">{fmt(r.units_sold)}</td>
                                                      <td className="py-2.5 text-xs font-mono text-ink-muted">{(Number(r.revenue)/totalWeekRev*100).toFixed(1)}%</td>
                                                </tr>
                                                )
                                                })}
                                          </tbody>
                                          </table>
                                          </div>
                                    </Card>
                              </Tabs.Content>

                              {/* ── PRODUCTS TAB ── */}
                              <Tabs.Content value="products" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                          <Card glow>
                                          <CardHeader><CardTitle>Top 10 by Revenue</CardTitle></CardHeader>
                                          <BarChart
                                          data={products.slice(0,10).map(r => ({ label: r.item_name.slice(0,14)+'…', value: Number(r.revenue) }))}
                                          height={200} color="#f5c842" formatValue={fmtCurrency} />
                                          </Card>
                                          <Card glow>
                                          <CardHeader><CardTitle>Top 10 by Units Sold</CardTitle></CardHeader>
                                          <BarChart
                                          data={[...products].sort((a,b) => Number(b.units_sold)-Number(a.units_sold)).slice(0,10).map(r => ({ label: r.item_name.slice(0,14)+'…', value: Number(r.units_sold) }))}
                                          height={200} color="#2dd4bf" formatValue={fmt} />
                                          </Card>
                                    </div>

                                    <Card>
                                          <CardHeader><CardTitle>All Products</CardTitle><Badge variant="muted">{products.length} items</Badge></CardHeader>
                                          <div className="overflow-x-auto">
                                          <table className="w-full">
                                          <thead>
                                                <tr className="border-b border-bg-border">
                                                {['#','Product','Category','Revenue','Units','Txns','Avg Price','Margin'].map(h => (
                                                <th key={h} className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted">{h}</th>
                                                ))}
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {products.map((r, i) => (
                                                <tr key={i} className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors group">
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-faint">{i+1}</td>
                                                <td className="py-2.5 pr-4">
                                                      <p className="text-xs font-body text-ink-primary group-hover:text-accent-gold transition-colors">{r.item_name}</p>
                                                </td>
                                                <td className="py-2.5 pr-4"><Badge variant="muted">{r.category}</Badge></td>
                                                <td className="py-2.5 pr-4">
                                                      <p className="text-xs font-mono text-accent-gold font-medium">{fmtCurrency(r.revenue)}</p>
                                                      <ProgressBar value={Number(r.revenue)} max={maxProdRev} className="w-16 mt-1" />
                                                </td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">{fmt(r.units_sold)}</td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">{fmt(r.transactions)}</td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">{fmtCurrency(r.avg_price)}</td>
                                                <td className="py-2.5">
                                                      <Badge variant={Number(r.margin_pct) > 30 ? 'teal' : Number(r.margin_pct) > 10 ? 'gold' : 'red'}>
                                                      {Number(r.margin_pct).toFixed(1)}%
                                                      </Badge>
                                                </td>
                                                </tr>
                                                ))}
                                          </tbody>
                                          </table>
                                          {!products.length && <EmptyState />}
                                          </div>
                                    </Card>
                              </Tabs.Content>

                              {/* ── PRICES TAB ── */}
                              <Tabs.Content value="prices" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                          <Card glow>
                                          <CardHeader><CardTitle>Revenue by Price Band</CardTitle></CardHeader>
                                          <BarChart
                                          data={prices.map(r => ({ label: r.price_bucket, value: Number(r.revenue) }))}
                                          height={200} color="#fb923c" formatValue={fmtCurrency} />
                                          </Card>
                                          <Card glow>
                                          <CardHeader><CardTitle>Volume by Price Band</CardTitle></CardHeader>
                                          <BarChart
                                          data={prices.map(r => ({ label: r.price_bucket, value: Number(r.units_sold) }))}
                                          height={200} color="#a78bfa" formatValue={fmt} />
                                          </Card>
                                    </div>

                                    <Card>
                                          <CardHeader><CardTitle>Price Sensitivity Analysis</CardTitle></CardHeader>
                                          <div className="overflow-x-auto">
                                          <table className="w-full">
                                          <thead>
                                                <tr className="border-b border-bg-border">
                                                {['Price Range','Line Items','Units Sold','Revenue','% of Revenue'].map(h => (
                                                <th key={h} className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted">{h}</th>
                                                ))}
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {prices.map((r, i) => (
                                                <tr key={i} className={cn("border-b border-bg-border/40 hover:bg-bg-hover transition-colors", r.price_bucket === '10-20k' && 'bg-accent-gold/5')}>
                                                <td className="py-2.5 pr-4">
                                                      <span className={cn("text-xs font-mono", r.price_bucket === '10-20k' ? 'text-accent-gold font-medium' : 'text-ink-primary')}>
                                                      {r.price_bucket}
                                                      {r.price_bucket === '10-20k' && <span className="ml-2 text-[10px] text-accent-gold">★ Sweet Spot</span>}
                                                      </span>
                                                </td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">{fmt(r.line_items)}</td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">{fmt(r.units_sold)}</td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-accent-gold font-medium">{fmtCurrency(r.revenue)}</td>
                                                <td className="py-2.5">
                                                      <div className="flex items-center gap-2">
                                                      <ProgressBar value={Number(r.pct_of_revenue)} max={100} accent="gold" className="w-16" />
                                                      <span className="text-xs font-mono text-ink-muted">{Number(r.pct_of_revenue).toFixed(1)}%</span>
                                                      </div>
                                                </td>
                                                </tr>
                                                ))}
                                          </tbody>
                                          </table>
                                          </div>
                                    </Card>
                              </Tabs.Content>

                              {/* ── CUSTOMERS TAB ── */}
                              <Tabs.Content value="customers" className="space-y-4 mt-4">
                                    <Card glow>
                                          <CardHeader><CardTitle>Top 10 Customers</CardTitle></CardHeader>
                                          <BarChart
                                          data={customers.slice(0,10).map(r => ({ label: r.customer_name.trim().split(' ')[0], value: Number(r.revenue) }))}
                                          height={200} color="#34d399" formatValue={fmtCurrency} />
                                    </Card>

                                    <Card>
                                          <CardHeader><CardTitle>Customer Rankings</CardTitle><Badge variant="muted">{customers.length} customers</Badge></CardHeader>
                                          <div className="overflow-x-auto">
                                          <table className="w-full">
                                          <thead>
                                                <tr className="border-b border-bg-border">
                                                {['#','Customer','Revenue','Transactions','Units','Avg Basket','% of Total'].map(h => (
                                                <th key={h} className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted">{h}</th>
                                                ))}
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {customers.map((r, i) => (
                                                <tr key={i} className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors group">
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-faint">{i+1}</td>
                                                <td className="py-2.5 pr-4 text-xs font-body text-ink-primary group-hover:text-accent-gold transition-colors">{r.customer_name.trim()}</td>
                                                <td className="py-2.5 pr-4">
                                                      <p className="text-xs font-mono text-accent-gold font-medium">{fmtCurrency(r.revenue)}</p>
                                                      <ProgressBar value={Number(r.revenue)} max={maxCustRev} className="w-16 mt-1" />
                                                </td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">{fmt(r.transactions)}</td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">{fmt(r.units)}</td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">{fmtCurrency(r.avg_basket)}</td>
                                                <td className="py-2.5">
                                                      <Badge variant={Number(r.pct_of_total) > 20 ? 'gold' : Number(r.pct_of_total) > 10 ? 'teal' : 'muted'}>
                                                      {Number(r.pct_of_total).toFixed(1)}%
                                                      </Badge>
                                                </td>
                                                </tr>
                                                ))}
                                          </tbody>
                                          </table>
                                          {!customers.length && <EmptyState />}
                                          </div>
                                    </Card>
                              </Tabs.Content>

                              {/* ── COMPARISON TAB ── */}
                              <Tabs.Content value="comparison" className="space-y-4 mt-4">
                                    <Card>
                                          <CardHeader>
                                          <CardTitle>Period Comparison</CardTitle>
                                          <div className="flex gap-2 text-xs font-mono text-ink-muted">
                                          <span className="text-accent-gold">P1: {PERIOD1_DEFAULT.from} → {PERIOD1_DEFAULT.to}</span>
                                          <span>vs</span>
                                          <span className="text-accent-teal">P2: {fromDate} → {toDate}</span>
                                          </div>
                                          </CardHeader>
                                          <div className="overflow-x-auto">
                                          <table className="w-full">
                                          <thead>
                                                <tr className="border-b border-bg-border">
                                                {['Metric','Period 1 (31 Mar–11 Apr)','Period 2 (Selected)','Change','% Change'].map(h => (
                                                <th key={h} className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted">{h}</th>
                                                ))}
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {comparison.map((r, i) => (
                                                <tr key={i} className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors">
                                                <td className="py-3 pr-4 text-xs font-body text-ink-primary font-medium">{r.metric}</td>
                                                <td className="py-3 pr-4 text-xs font-mono text-ink-secondary">{Number(r.period_1) > 1000 ? fmtCurrency(r.period_1) : fmt(r.period_1)}</td>
                                                <td className="py-3 pr-4 text-xs font-mono text-accent-gold font-medium">{Number(r.period_2) > 1000 ? fmtCurrency(r.period_2) : fmt(r.period_2)}</td>
                                                <td className="py-3 pr-4 text-xs font-mono">
                                                      <span className={cn(Number(r.change) > 0 ? 'text-accent-teal' : 'text-accent-red')}>
                                                      {Number(r.change) > 0 ? '+' : ''}{Number(r.change) > 1000 ? fmtCurrency(r.change) : fmt(r.change)}
                                                      </span>
                                                </td>
                                                <td className="py-3"><TrendBadge pct={Number(r.change_pct)} /></td>
                                                </tr>
                                                ))}
                                          </tbody>
                                          </table>
                                          {!comparison.length && <EmptyState />}
                                          </div>
                                    </Card>
                              </Tabs.Content>
                        </Tabs.Root>
                  </>
                  )}

                  {/* ── Empty state ── */}
                  {!loading && !generated && (
                  <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
                              <Calendar size={24} className="text-accent-gold" />
                        </div>
                        <div className="text-center">
                              <p className="text-ink-primary font-display font-semibold">Select a date range above</p>
                              <p className="text-ink-muted text-sm font-body mt-1">Choose a period and click Generate Report to see full analytics</p>
                        </div>
                  </div>
                  )}

                  </main>
            </div>
      )

}