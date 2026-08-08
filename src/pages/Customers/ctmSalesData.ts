import React, { useState, useEffect, useMemo } from "react";
import { useParams } from 'react-router-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Types
import { Report } from '@/types';

// Import Utils
import { customer_product_query, executeSQL } from '@/lib/llm_utils';
import { fmt, fmtCurrency, fmtDate, fmtPercent } from '@/lib/utils';

// Components
import Badge from '../../components/ui/primitives/Badge';
import type { ColumnDef } from '../../components/ui/DataTable';


interface SaleRow {
      pos_sale_id: number | string;
      pos_customer_id: number | string;
      invoice_datetime: string;
      customer_name: string;
      salesperson: string;
      comment: string;
      items_sold: number;
      items_returned: number;
      invoice_total: number;
}

export default function useCustomerSalesData () {
      const { id: customer_id } = useParams();
      const [params] = useSearchParams();
      const ctm_name = params.get('ctm_name');
      const navigate = useNavigate();

      const [report, setReport] = useState<Report | null>(null);
      const [loading, setLoading] = useState<boolean>(false);
      const [query, setQuery] = useState<string>('');
      const [filter, setFilter] = useState<string>('');

      async function fetchCustomerSalesData() {
            try {
                  if (!customer_id) return;
                  setLoading(true);

                  const sql_res = await executeSQL(
                        customer_product_query(parseInt(customer_id as string))
                  );

                  if (!sql_res || !sql_res.rows) {
                        setReport({} as Report);
                        return;
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
                  await fetchCustomerSalesData();
            })();
      }, []);

      // Distinct salespeople on this customer's invoices — used as the filter dropdown options
      const ctm_category = useMemo(() => {
            if (!report?.sales) return [];
            return Array.from(
                  new Set(
                        report.sales
                              .map((s: SaleRow) => s.salesperson)
                              .filter(Boolean)
                  )
            ).map((value) => ({ value: String(value), label: String(value) }));
      }, [report]);

      const filtered = useMemo(() => {
            if (!report?.sales) return [];
            return report.sales.filter((c: SaleRow) => {
                  const matchesQuery =
                        (c.comment ?? '').toLowerCase().includes(query.toLowerCase()) ||
                        (c.pos_sale_id?.toString() ?? '').includes(query) ||
                        (fmt(c.invoice_total) ?? '').includes(query.toLowerCase()) ||
                        (c.invoice_total?.toString() ?? '').includes(query.toLowerCase());

                  const matchesFilter = !filter || c.salesperson === filter;

                  return matchesQuery && matchesFilter;
            });
      }, [report, query, filter]);

      // Revenue + items sold aggregated by day, for the trend chart
      const chartData = useMemo(() => {
            if (!report?.sales?.length) return [];
            const map = new Map<string, { date: string; revenue: number; items: number }>();

            for (const s of report.sales as SaleRow[]) {
                  const day = new Date(s.invoice_datetime).toISOString().slice(0, 10);
                  const entry = map.get(day) ?? { date: day, revenue: 0, items: 0 };
                  entry.revenue += Number(s.invoice_total) || 0;
                  entry.items += Number(s.items_sold) || 0;
                  map.set(day, entry);
            }

            return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
      }, [report]);

      const columns: ColumnDef<SaleRow>[] = [
            {
                  key: 'pos_sale_id',
                  label: 'ID',
                  sortable: true,
                  width: '0.8fr',
            },
            {
                  key: 'invoice_datetime',
                  label: 'Date',
                  sortable: true,
                  width: '1.4fr',
                  sortValue: (r) => new Date(r.invoice_datetime).getTime(),
                  render: (r) => new Date(r.invoice_datetime).toLocaleString(),
            },
            {
                  key: 'customer_name',
                  label: 'Customer',
                  sortable: true,
                  width: '1.4fr',
            },
            {
                  key: 'salesperson',
                  label: 'Salesperson',
                  sortable: true,
                  width: '1.2fr',
            },
            {
                  key: 'comment',
                  label: 'Comment',
                  width: '1.6fr',
            },
            {
                  key: 'items_sold',
                  label: 'Items Sold',
                  sortable: true,
                  align: 'right',
                  width: '1fr',
                  render: (r) => fmt(r.items_sold),
            },
            // {
            //       key: 'items_returned',
            //       label: 'Returns',
            //       sortable: true,
            //       align: 'right',
            //       width: '1fr',
            //       sortValue: (r) => Number(r.items_returned),
            //       render: (r) => (
            //             <Badge variant={Number(r.items_returned) > 0 ? 'red' : 'teal'}>
            //                   {fmt(r.items_returned)}
            //             </Badge>
            //       ),
            // },
            // {
            //       key: 'invoice_total',
            //       label: 'Total',
            //       sortable: true,
            //       align: 'right',
            //       width: '1.2fr',
            //       sortValue: (r) => Number(r.invoice_total),
            //       render: (r) => (
            //             <span className="font-mono text-accent-gold font-medium">
            //                   {fmtCurrency(r.invoice_total)}
            //             </span>
            //       ),
            // },
      ];

      return {
            ctm_name,
            columns, 
            chartData,
            filtered,
            ctm_category,
            report,
            loading,
            query,
            filter,
            setQuery,
            setFilter,
            navigate
      }
}
