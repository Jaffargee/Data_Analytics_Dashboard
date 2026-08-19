import {
      type DiscountByItemRow,
      type DiscountByCustomerRow,
      type AbcRow,
      type DeadStockRow,
      type ChurnRiskRow,
      type RevenueAnomalyRow,
      type BelowCostRow,
} from "./types";

import { ColumnDef } from "@/components/ui/data/DataTable";

import { Badge } from "@/components/ui/controls/primitives/"; // ADJUST if named differently

import { fmtCurrency } from "@/lib/utils";

export const ABC_ACCENT: Record<AbcRow["abc_tier"], string> = {
      A: "gold",
      B: "muted",
      C: "danger",
};

export const DEAD_STOCK_ACCENT: Record<DeadStockRow["status"], string> = {
      "NEVER SOLD": "danger",
      "DEAD (60d+)": "danger",
      "SLOW (30-60d)": "gold",
      ACTIVE: "success",
};

export const CHURN_ACCENT: Record<ChurnRiskRow["churn_status"], string> = {
      "AT RISK": "danger",
      ACTIVE: "success",
      "INSUFFICIENT DATA": "muted",
};

export const ANOMALY_ACCENT: Record<RevenueAnomalyRow["anomaly_status"], string> = {
      SPIKE: "success",
      DIP: "danger",
      NORMAL: "muted",
      "INSUFFICIENT HISTORY": "muted",
};

export const DISCOUNT_ITEM_COLUMNS: ColumnDef<DiscountByItemRow>[] = [
      { key: "discount_rank", label: "#", width: "0.5fr" },
      { key: "item_name", label: "Item", width: "2.2fr", sortable: true },
      { key: "qty_sold", label: "Qty Sold", width: "1fr", align: "right", sortable: true },
      {
            key: "gross_revenue",
            label: "Gross Revenue",
            width: "1.4fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.gross_revenue),
      },
      {
            key: "discount_given",
            label: "Discount Given",
            width: "1.4fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.discount_given),
      },
      {
            key: "discount_pct",
            label: "Discount %",
            width: "1fr",
            align: "right",
            sortable: true,
            render: (row) => `${row.discount_pct}%`,
      },
      {
            key: "margin_pct",
            label: "Margin %",
            width: "1fr",
            align: "right",
            sortable: true,
            render: (row) => `${row.margin_pct}%`,
      },
];

export const DISCOUNT_CUSTOMER_COLUMNS: ColumnDef<DiscountByCustomerRow>[] = [
      { key: "customer_name", label: "Customer", width: "2fr", sortable: true },
      { key: "category", label: "Category", width: "1.2fr" },
      { key: "orders", label: "Orders", width: "0.8fr", align: "right", sortable: true },
      {
            key: "gross_revenue",
            label: "Gross Revenue",
            width: "1.4fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.gross_revenue),
      },
      {
            key: "discount_given",
            label: "Discount Given",
            width: "1.4fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.discount_given),
      },
      {
            key: "discount_pct",
            label: "Discount %",
            width: "1fr",
            align: "right",
            sortable: true,
            render: (row) => `${row.discount_pct}%`,
      },
];

export const ABC_COLUMNS: ColumnDef<AbcRow>[] = [
      {
            key: "abc_tier",
            label: "Tier",
            width: "0.6fr",
            render: (row) => <Badge accent={ABC_ACCENT[row.abc_tier]}>{row.abc_tier}</Badge>,
      },
      { key: "item_name", label: "Item", width: "2.4fr", sortable: true },
      {
            key: "revenue",
            label: "Revenue",
            width: "1.4fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.revenue),
      },
      {
            key: "cumulative_pct",
            label: "Cumulative %",
            width: "1.2fr",
            align: "right",
            sortable: true,
            render: (row) => `${row.cumulative_pct}%`,
      },
];

export const DEAD_STOCK_COLUMNS: ColumnDef<DeadStockRow>[] = [
      {
            key: "status",
            label: "Status",
            width: "1.2fr",
            render: (row) => <Badge accent={DEAD_STOCK_ACCENT[row.status]}>{row.status}</Badge>,
      },
      { key: "item_name", label: "Item", width: "2.4fr", sortable: true },
      { key: "qty_last_30d", label: "Qty (30d)", width: "1fr", align: "right", sortable: true },
      { key: "qty_last_60d", label: "Qty (60d)", width: "1fr", align: "right", sortable: true },
      {
            key: "last_sold_at",
            label: "Last Sold",
            width: "1.4fr",
            sortable: true,
            sortValue: (row) => (row.last_sold_at ? new Date(row.last_sold_at).getTime() : 0),
            render: (row) => (row.last_sold_at ? new Date(row.last_sold_at).toLocaleDateString() : "Never"),
      },
];

export const CHURN_COLUMNS: ColumnDef<ChurnRiskRow>[] = [
      {
            key: "churn_status",
            label: "Status",
            width: "1.2fr",
            render: (row) => <Badge accent={CHURN_ACCENT[row.churn_status]}>{row.churn_status}</Badge>,
      },
      { key: "customer_name", label: "Customer", width: "2fr", sortable: true },
      { key: "total_orders", label: "Orders", width: "0.8fr", align: "right", sortable: true },
      {
            key: "lifetime_value",
            label: "Lifetime Value",
            width: "1.4fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.lifetime_value),
      },
      {
            key: "avg_days_between_orders",
            label: "Usual Cadence (days)",
            width: "1.4fr",
            align: "right",
            sortable: true,
      },
      {
            key: "days_since_last_order",
            label: "Days Since Last Order",
            width: "1.4fr",
            align: "right",
            sortable: true,
      },
];

export const ANOMALY_COLUMNS: ColumnDef<RevenueAnomalyRow>[] = [
      {
            key: "anomaly_status",
            label: "Status",
            width: "1.2fr",
            render: (row) => <Badge accent={ANOMALY_ACCENT[row.anomaly_status]}>{row.anomaly_status}</Badge>,
      },
      {
            key: "sale_date",
            label: "Date",
            width: "1.2fr",
            sortable: true,
            sortValue: (row) => new Date(row.sale_date).getTime(),
            render: (row) => new Date(row.sale_date).toLocaleDateString(),
      },
      {
            key: "revenue",
            label: "Revenue",
            width: "1.3fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.revenue),
      },
      {
            key: "trailing_avg",
            label: "30d Avg",
            width: "1.3fr",
            align: "right",
            sortable: true,
            render: (row) => (row.trailing_avg != null ? fmtCurrency(row.trailing_avg) : "—"),
      },
      { key: "z_score", label: "Z-Score", width: "1fr", align: "right", sortable: true },
];

export const BELOW_COST_COLUMNS: ColumnDef<BelowCostRow>[] = [
      {
            key: "invoice_datetime",
            label: "Date",
            width: "1.3fr",
            sortable: true,
            sortValue: (row) => new Date(row.invoice_datetime).getTime(),
            render: (row) => new Date(row.invoice_datetime).toLocaleDateString(),
      },
      { key: "item_name", label: "Item", width: "2fr", sortable: true },
      { key: "customer_name", label: "Customer", width: "1.6fr" },
      { key: "quantity", label: "Qty", width: "0.8fr", align: "right" },
      {
            key: "unit_price",
            label: "Sold At",
            width: "1.2fr",
            align: "right",
            render: (row) => fmtCurrency(row.unit_price),
      },
      {
            key: "cost_price",
            label: "Cost",
            width: "1.2fr",
            align: "right",
            render: (row) => fmtCurrency(row.cost_price),
      },
      {
            key: "loss_amount",
            label: "Loss",
            width: "1.2fr",
            align: "right",
            sortable: true,
            render: (row) => fmtCurrency(row.loss_amount),
      },
];
