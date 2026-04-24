import { Badge, Card, CardHeader, CardTitle, StatCard } from '@/components/ui/primitives';
import { TopBar } from '@/components/ui/TopBar';
import { customer_product_query, executeSQL } from '@/lib/llm_utils';
import { fmt, fmtCurrency, fmtDate, fmtPercent } from '@/lib/utils';
import { Report } from '@/types';
import { Calendar, Clock, DollarSign, Loader2, Package, Search, ShoppingCart, Star, Tag, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';




export default function Customer () {

      // Essentials
      const customer_id = window.location.pathname.split('/').pop();
      const [params, _] = useSearchParams()
      const ctm_name = params.get('ctm_name')

      // States
      const [report, setReport] = useState<Report | null>(null);
      const [loading, setLoading] = useState<boolean>(false);
      const [search, setSearch] = useState<string>('');

      async function fetchCustomerSalesData () {
                  try {
                        if(!customer_id) return
                        setLoading(true);

                        const sql_res = await executeSQL(customer_product_query(parseInt(customer_id as string)));

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

      const filtered = useMemo(() => {
            return report && report?.sales.filter((c: any) =>
                  (c.comment ?? "").toLowerCase().includes(search.toLowerCase()) ||
                  ((c.pos_sale_id).toString() ?? "").includes(search) ||
                  (fmt(c.invoice_total) ?? "").includes(search.toLowerCase()) ||
                  ((c.invoice_total).toString() ?? "").includes(search.toLowerCase())
            )
      }, [report, search]);


      useEffect(() => {

            (async () => {
                  await fetchCustomerSalesData();
            })()

      }, [])

      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar title={ctm_name as string} subtitle="Sales details by customer." onRefresh={async () => await fetchCustomerSalesData()} />

                  <main className="flex-1 p-6 space-y-6">
                        {
                              loading ? (
                                    <div className="flex h-full w-full relative items-center justify-center gap-2">
                                          <Loader2 size={18} className="text-accent-gold animate-spin shrink-0" />
                                          <p className='text-ink-muted font-body'>Loading...</p>
                                    </div>
                              ) : (
                                    <div className='flex flex-col gap-2 space-y-4'>
                                          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
                                                <StatCard label='Revenue' value={fmtCurrency(report?.summary.revenue)} icon={<Users size={14}/>}      accent="gold"   delay={0} />
                                                <StatCard label='Profit' value={fmtCurrency(report?.summary.profit)} icon={<Users size={14}/>}      accent="teal"   delay={0} />
                                                <StatCard label='Total Orders' value={fmt(report?.summary.total_orders)} icon={<ShoppingCart size={14}/>} accent="teal"  delay={100} />
                                                <StatCard label='Avg Order Value' value={fmtCurrency(report?.summary.avg_order_value)} icon={<Tag size={14}/>}    accent="teal"  delay={200} />
                                                <StatCard label='Loyalty' value={fmtPercent(report?.summary.loyalty_score)} icon={<Star size={14}/>}      accent="purple"delay={300} />
                                                <StatCard label='Total Items Bought' value={fmt(report?.summary.total_items_bought)} icon={<Package size={14}/>}    accent="purple" delay={400} />
                                                <StatCard label='Total Items Returned' value={fmt(report?.summary.total_items_returned)} icon={<Package size={14}/>}   accent="red" delay={400} />
                                                <StatCard label='Visits' value={fmtDate(report?.summary.last_visit)} icon={<Calendar size={14}/>}     accent="gold"   delay={500} />
                                                <StatCard label='Days Since Last Visit' value={fmt(report?.summary.days_since_last_visit)} icon={<Clock size={14}/>}     accent="purple" delay={600} />
                                          </div>
                                          <Card>
                                                <CardHeader>
                                                      <CardTitle>Products Bought by {ctm_name}</CardTitle>
                                                      <div className="relative">
                                                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                                                            <input
                                                                  value={search}
                                                                  onChange={(e) => setSearch(e.target.value)}
                                                                  placeholder="Search customers…"
                                                                  className="bg-bg-hover border border-bg-border rounded-lg pl-8 pr-3 py-1.5 text-xs font-body text-ink-primary placeholder:text-ink-faint outline-none focus:border-accent-gold/40 w-52 transition-colors"
                                                            />
                                                      </div>
                                                </CardHeader>
                                                <CustomerProducts products={filtered} ctm_name={ctm_name} />
                                          </Card>
                                    </div>
                              )
                        }
                  </main>
            </div>
      )
}

function CustomerProducts({ products, ctm_name }: { products: any; ctm_name?: string | null }) {
      const navigate = useNavigate()
      return (
            <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                        <thead className='sticky top-0 left-0 right-0'>
                              <tr className="border-b border-bg-border">
                                    <th className="sticky top-0 z-10 text-left pb-3 pr-4 text-xs text-ink-muted">#</th>
                                    <th className="sticky top-0 z-10 text-left pb-3 pr-4 text-xs text-ink-muted">ID</th>
                                    <th className="sticky top-0 z-10 text-left pb-3 pr-4 text-xs text-ink-muted">Date</th>
                                    <th className="sticky top-0 z-10 text-left pb-3 pr-4 text-xs text-ink-muted">Customer</th>
                                    <th className="sticky top-0 z-10 text-left pb-3 pr-4 text-xs text-ink-muted">Salesperson</th>
                                    <th className="sticky top-0 z-10 text-left pb-3 pr-4 text-xs text-ink-muted">Comment</th>
                                    <th className="sticky top-0 z-10 text-left pb-3 pr-4 text-xs text-ink-muted">Items Sold</th>
                                    <th className="sticky top-0 z-10 text-left pb-3 pr-4 text-xs text-ink-muted">Returns</th>
                                    <th className="sticky top-0 z-10 text-left pb-3 pr-4 text-xs text-ink-muted">Total</th>
                              </tr>
                        </thead>

                  <tbody>
                        {products?.map((r: any, i: number) => {
                              const hasReturns = Number(r.items_returned) > 0

                              return (
                                    <tr
                                          key={r.pos_sale_id}
                                          className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors group cursor-pointer"
                                          onClick={() => {
                                                // 👉 navigate to sale details
                                                navigate(`/customers/customer/${r.pos_customer_id}/sales/${r.pos_sale_id}?ctm_name=${ctm_name}`)
                                          }}
                                    >
                                          <td className="py-3 pr-4 text-xs text-ink-faint">{i + 1}</td>

                                          <td className="py-3 pr-4 text-xs text-ink-primary">
                                                {r.pos_sale_id}
                                          </td>

                                          <td className="py-3 pr-4 text-xs text-ink-secondary">
                                                {new Date(r.invoice_datetime).toLocaleString()}
                                          </td>

                                          <td className="py-3 pr-4 text-xs text-ink-primary">
                                                {r.customer_name}
                                          </td>

                                          <td className="py-3 pr-4 text-xs text-ink-secondary">
                                                {r.salesperson}
                                          </td>

                                          <td className="py-3 pr-4 text-xs text-ink-secondary">
                                                {r.comment}
                                          </td>

                                          <td className="py-3 pr-4 text-xs font-mono text-ink-secondary">
                                                {fmt(r.items_sold)}
                                          </td>

                                          <td className="py-3 pr-4">
                                                <Badge variant={hasReturns ? "red" : "teal"}>
                                                      {fmt(r.items_returned)}
                                                </Badge>
                                          </td>

                                          <td className="py-3 pr-4 text-xs font-mono text-accent-gold font-medium">
                                                {fmtCurrency(r.invoice_total)}
                                          </td>
                                    </tr>
                              )
                        })}
                  </tbody>
                  </table>
                  {/* {!filtered.length && <EmptyState message="No items match your search" />} */}
            </div>
      )
}

