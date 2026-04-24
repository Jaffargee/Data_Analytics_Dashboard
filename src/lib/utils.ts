export function fmt(n: number, decimals = 0): string {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function fmtCurrency(n: number): string {
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
