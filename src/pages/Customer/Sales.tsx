import { Card, CardHeader, CardTitle, StatCard } from '@/components/ui/primitives'
import { TopBar } from '@/components/ui/TopBar'
import { executeSQL } from '@/lib/llm_utils'
import { supabase } from '@/lib/supabase'
import { fmt, fmtCurrency } from '@/lib/utils'
import { QueryResult, Report } from '@/types'
import { ArrowUp, Loader2, Search, ShoppingCart, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'


const customer_product_query = (pos_sale_id: number) => {
      return (`
            SELECT json_build_object(
                  -- 📊 Summary block
                  'summary', (
                        SELECT json_build_object(
                              'total', ROUND(SUM(si.total), 2),
                              'total_items_bought', SUM(CASE WHEN si.quantity > 0 THEN si.quantity ELSE 0 END),
                              'total_items_returned', SUM(CASE WHEN si.quantity < 0 THEN si.quantity ELSE 0 END),
                              'profit', ROUND(SUM(si.total - (i.cost_price * si.quantity)), 2)
                        )
                        FROM sale_items si
                        JOIN items i ON si.pos_item_id = i.pos_item_id
                        WHERE si.pos_sale_id = ${pos_sale_id}
                  ),

                  -- 📋 Sales list
                  'sale_items', (
                        SELECT json_agg(t)
                        FROM (
                              SELECT
                                    *
                                    FROM sale_items s
                              WHERE s.pos_sale_id = ${pos_sale_id}
                        ) t
                  )
            ) AS result;

      `.trim())
}

export default function CustomerSales() {
      const [report, setReport] = useState<Report | null>(null);
      const [loading, setLoading] = useState(false)

      const pos_sale_id = window.location.pathname.split('/').pop()
      const [params, _] = useSearchParams()
      const ctm_name = params.get('ctm_name')

      async function fetchCustomerSaleItemData () {
                  try {
                        const start = performance.now()

                        if(!pos_sale_id) return
                        setLoading(true);


                        const sql_res = await executeSQL(customer_product_query(parseInt(pos_sale_id as string)));

                        if(!sql_res || !sql_res.rows) {
                              setReport({} as Report)
                        }

                        const result = sql_res.rows[0]?.result as Report;                        
                        setReport(result);

                  } catch (error) {
                        console.log(error);
                  } finally {
                        setLoading(false);
                  }
      }
      useEffect(() => {
            (async () => {
                  await fetchCustomerSaleItemData()
            })()
      }, [])

      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar title={ctm_name || "Customer Sales"} subtitle={`Sales history for customer #${pos_sale_id}`} onRefresh={fetchCustomerSaleItemData} />

                  <main className="flex-1 p-6 space-y-6">
                        {loading ? (
                              <div className="flex h-full w-full relative items-center justify-center gap-2">
                                    <Loader2 size={18} className="text-accent-gold animate-spin shrink-0" />
                                    <p className='text-ink-muted font-body'>Loading...</p>
                              </div>
                        ) : (
                                    <div className='flex flex-col gap-2 space-y-4'>
                                          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
                                                <StatCard label='Revenue' value={fmtCurrency(report?.summary.total)} icon={<Users size={14}/>}      accent="gold"   delay={0} />
                                                <StatCard label='Profit' value={fmt(report?.summary.profit)} icon={<ArrowUp size={14}/>} accent="teal"  delay={100} />
                                                <StatCard label='Total Items Bought' value={fmt(report?.summary.total_items_bought)} icon={<ShoppingCart size={14}/>} accent="teal"  delay={100} />
                                                <StatCard label='Total Items Returned' value={fmt(report?.summary.total_items_returned)} icon={<ShoppingCart size={14}/>} accent="red"  delay={100} />
                                                {/* <StatCard label='Avg Order Value' value={fmtCurrency(report?.summary.avg_order_value)} icon={<Tag size={14}/>}    accent="teal"  delay={200} />
                                                <StatCard label='Loyalty' value={fmtPercent(report?.summary.loyalty_score)} icon={<Star size={14}/>}      accent="purple"delay={300} />
                                                <StatCard label='Total Items Bought' value={fmt(report?.summary.total_items_bought)} icon={<Package size={14}/>}    accent="purple" delay={400} />
                                                <StatCard label='Total Items Returned' value={fmt(report?.summary.total_items_returned)} icon={<Package size={14}/>}   accent="red" delay={400} />
                                                <StatCard label='Visits' value={fmtDate(report?.summary.last_visit)} icon={<Calendar size={14}/>}     accent="gold"   delay={500} />
                                                <StatCard label='Days Since Last Visit' value={fmt(report?.summary.days_since_last_visit)} icon={<Clock size={14}/>}     accent="purple" delay={600} /> */}
                                          </div>
                                          <Card>
                                                <CardHeader>
                                                      <CardTitle>Products Bought by {ctm_name}</CardTitle>
                                                      <div className="relative">
                                                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                                                            <input
                                                                  // value={search}
                                                                  // onChange={(e) => setSearch(e.target.value)}
                                                                  placeholder="Search customers…"
                                                                  className="bg-bg-hover border border-bg-border rounded-lg pl-8 pr-3 py-1.5 text-xs font-body text-ink-primary placeholder:text-ink-faint outline-none focus:border-accent-gold/40 w-52 transition-colors"
                                                            />
                                                      </div>
                                                </CardHeader>
                                                <SalesTable rows={report?.sale_items} />
                                          </Card>
                                    </div>
                        )}
                  </main>
            </div>
      )
}

function SalesTable({ rows }: { rows: any; }) {                 
      return (
            <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                        <thead>
                              <tr className="border-b border-bg-border">
                                    <th className="text-left pb-3 pr-4 text-xs text-ink-muted">#</th>
                                    <th className="text-left pb-3 pr-4 text-xs text-ink-muted">ID</th>
                                    <th className="text-left pb-3 pr-4 text-xs text-ink-muted">Name</th>
                                    <th className="text-left pb-3 pr-4 text-xs text-ink-muted">Quantity</th>
                                    <th className="text-left pb-3 pr-4 text-xs text-ink-muted">Unit Price</th>
                                    <th className="text-left pb-3 pr-4 text-xs text-ink-muted">Total</th>
                              </tr>
                        </thead>

                        <tbody>
                              {rows?.map((r: any, i: number) => {
                                    const hasReturns = Number(r.items_returned) > 0

                                    return (
                                          <tr key={r.pos_item_id} className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors group cursor-pointer">
                                                <td className="py-3 pr-4 text-xs text-ink-faint">{i + 1}</td>

                                                <td className="py-3 pr-4 text-xs text-ink-primary">
                                                      {r.pos_item_id}
                                                </td>

                                                <td className="py-3 pr-4 text-xs text-ink-secondary">
                                                      {r.name}
                                                </td>

                                                <td className="py-3 pr-4 text-xs text-ink-primary">
                                                      {r.quantity}
                                                </td>

                                                <td className="py-3 pr-4 text-xs text-ink-secondary">
                                                      {fmtCurrency(r.unit_price)}
                                                </td>

                                                <td className="py-3 pr-4 text-xs font-mono text-accent-gold font-medium">
                                                      {fmtCurrency(r.total)}
                                                </td>
                                          </tr>
                                    )
                              })}
                        </tbody>
                  </table>
                  {/* {!rows.length && <EmptyState message="No items match your search" />} */}
            </div>
      )
}
