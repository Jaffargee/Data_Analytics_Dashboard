import { QueryResult } from "@/types"

// ── Helpers ──────────────────────────────────────────────────────────────────
export function formatCellValue(key: string, val: unknown): string {
      if (val === null || val === undefined) return '—'

      const k = key.toLowerCase()

      if (k.includes('revenue') || k.includes('total') || k.includes('price') ||
      k.includes('value') || k.includes('balance') || k.includes('profit') ||
      k.includes('sale') && k.includes('avg') || k === 'lifetime_value') {
            const n = Number(val)
            return isNaN(n) ? String(val) : fmtCurrency(n)
      }

      if (k.includes('date') || k.includes('at') && String(val).includes('T')) {
            try { return fmtDate(String(val)) } catch { return String(val) }
      }

      if (k.includes('pct') || k.includes('margin')) {
            const n = Number(val)
            return isNaN(n) ? String(val) : n.toFixed(1) + '%'
      }

      if (k.includes('qty') || k.includes('quantity') || k.includes('count') ||
      k.includes('num_') || k.includes('_sold') || k.includes('purchases')) {
            const n = Number(val)
            return isNaN(n) ? String(val) : fmt(n)
      }
      return String(val)
}

export function isCurrencyCol(key: string): boolean {
      const k = key.toLowerCase()
      return k.includes('revenue') || k.includes('total') || k.includes('price') ||
      k.includes('value') || k.includes('balance') || k.includes('profit') || k.includes('avg')
}

export function fmt(n: number, decimals = 0): string {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function fmtCurrency(n: number): string {
  if (n === null || n === undefined || isNaN(Number(n))) {
        return "₦0"; // or "--"
  }
  return "₦" + fmt(n, 0);
}

export function fmtPercent(value?: number | null) {
      if (value === null || value === undefined || isNaN(Number(value))) {
            return "0%"; // or "--"
      }
      return `${Number(value).toFixed(2)}%`;
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function fmtMonthLabel(ym: string): string {
  // "2024-03" → "Mar 24"
  const [y, m] = ym.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString("en-NG", { month: "short", year: "2-digit" });
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function pct(v: number, total: number): number {
  if (!total) return 0;
  return clamp((v / total) * 100, 0, 100);
}

export function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function nDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}


// Chart Helpers

export function deriveLineChart(res: QueryResult): QueryResult {
            
            if(!res.rows.length) return res;

            const keys = Object.keys(res.rows[0])

            const labelKey = keys.find(k => typeof res.rows[0][k] === 'string') ?? keys[0]
            const valueKey = keys.find(k => typeof res.rows[0][k] === 'number') ?? keys[1]

            if (!valueKey) return res

            const chartData = res.rows.map(r => ({
                  label: String(r[labelKey]),
                  value: Number(r[valueKey]),
            }))

            return {
                  ...res,
                  chartData: {
                        type: 'line',
                        data: chartData,
                  },
            }
}
