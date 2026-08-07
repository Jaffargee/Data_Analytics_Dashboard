import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase"; // ADJUST PATH if your client lives elsewhere

import Badge from "../../components/ui/primitives/Badge"; // ADJUST if named differently
import { CardTitle, CardHeader } from "../../components/ui/primitives/"; // ADJUST path/names to match your actual exports
import DataTable, { ColumnDef } from "../../components/ui/DataTable";
import EChart from "../../components/charts/EChart";

import { fmtCurrency } from "../../lib/utils";
import { buildDiscountByCategoryOption, type DiscountByCategoryRow } from "../../lib/analyticsCharts";

const CATEGORY_ACCENT: Record<string, string> = {
      WHSL1: "gold",
      WHSL2: "gold",
      VIP: "success",
      SEASONAL: "muted",
      RGL: "muted",
      RIWC: "muted",
      STANDARD: "muted",
      UNCATEGORIZED: "danger",
};

const COLUMNS: ColumnDef<DiscountByCategoryRow>[] = [
      {
            key: "category",
            label: "Category",
            width: "1.4fr",
            sortable: true,
            render: (row) => (
                  <Badge accent={CATEGORY_ACCENT[row.category] ?? "muted"}>{row.category}</Badge>
            ),
      },
      { key: "customer_count", label: "Customers", width: "1fr", align: "right", sortable: true },
      { key: "total_orders", label: "Orders", width: "1fr", align: "right", sortable: true },
      {
            key: "actual_revenue",
            label: "Actual Revenue",
            width: "1.6fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.actual_revenue),
      },
      {
            key: "discount_given",
            label: "Discount Given",
            width: "1.6fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.discount_given),
      },
      {
            key: "blended_discount_pct",
            label: "Blended Discount %",
            width: "1.5fr",
            align: "right",
            sortable: true,
            render: (row) => `${row.blended_discount_pct}%`,
      },
      {
            key: "avg_customer_discount_pct",
            label: "Avg Per-Customer Discount %",
            width: "1.8fr",
            align: "right",
            sortable: true,
            render: (row) => `${row.avg_customer_discount_pct}%`,
      },
      {
            key: "blended_margin_pct",
            label: "Margin %",
            width: "1.2fr",
            align: "right",
            sortable: true,
            render: (row) => `${row.blended_margin_pct}%`,
      },
];

export default function DiscountByCategory(): JSX.Element {
      const [rows, setRows] = useState<DiscountByCategoryRow[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<Error | null>(null);

      useEffect(() => {
            let cancelled = false;

            async function load() {
                  setLoading(true);
                  setError(null);
                  const { data, error: fetchError } = await supabase
                        .from("v_discount_by_customer_category")
                        .select("*")
                        .order("blended_discount_pct", { ascending: false });

                  if (cancelled) return;
                  if (fetchError) {
                        setError(fetchError as unknown as Error);
                  } else {
                        setRows(data ?? []);
                  }
                  setLoading(false);
            }

            load();
            return () => {
                  cancelled = true;
            };
      }, []);

      const chartOption = useMemo(() => buildDiscountByCategoryOption(rows), [rows]);

      return (
            <section className="space-y-4">
                  <CardHeader>
                        <CardTitle>Discount & Margin by Customer Category</CardTitle>
                  </CardHeader>
                  <p className="text-xs text-neutral-400 px-6 -mt-2">
                        "Blended" weighs by actual spend (total discount ÷ total gross revenue for the
                        category). "Avg per-customer" is the simple average across each customer's own
                        discount rate — a category can differ a lot between the two if one big spender
                        skews the blend.
                  </p>

                  {error && (
                        <div className="text-sm text-red-400 px-6">
                              Failed to load category discount data: {error.message}
                        </div>
                  )}

                  <EChart option={chartOption} loading={loading} height="300px" />

                  <DataTable<DiscountByCategoryRow>
                        data={rows}
                        columns={COLUMNS}
                        getRowId={(row) => row.category}
                        ariaLabel="Discount and margin by customer category"
                        emptyMessage="No categorized customer data available"
                        defaultSortKey="blended_discount_pct"
                        defaultSortDir="desc"
                  />
            </section>
      );
}