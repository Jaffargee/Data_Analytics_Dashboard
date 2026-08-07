import { fmtDate } from "./date";

export function formatCellValue(key: string, val: unknown): string {
      if (val === null || val === undefined) return '—';

      const k = key.toLowerCase();

      if (
            k.includes('revenue') ||
            k.includes('total') ||
            k.includes('price') ||
            k.includes('value') ||
            k.includes('balance') ||
            k.includes('profit') ||
            (k.includes('sale') && k.includes('avg')) ||
            k === 'lifetime_value'
      ) {
            const n = Number(val);
            return isNaN(n) ? String(val) : fmtCurrency(n);
      }

      if (
            k.includes('date') ||
            (k.includes('at') && String(val).includes('T'))
      ) {
            try {
                  return fmtDate(String(val));
            } catch {
                  return String(val);
            }
      }

      if (k.includes('pct') || k.includes('margin')) {
            const n = Number(val);
            return isNaN(n) ? String(val) : n.toFixed(1) + '%';
      }

      if (
            k.includes('qty') ||
            k.includes('quantity') ||
            k.includes('count') ||
            k.includes('num_') ||
            k.includes('_sold') ||
            k.includes('purchases')
      ) {
            const n = Number(val);
            return isNaN(n) ? String(val) : fmt(n);
      }
      return String(val);
}

export function isCurrencyCol(key: string): boolean {
      const k = key.toLowerCase();
      return (
            k.includes('revenue') ||
            k.includes('total') ||
            k.includes('price') ||
            k.includes('value') ||
            k.includes('balance') ||
            k.includes('profit') ||
            k.includes('avg')
      );
}

export function fmt(n: number, decimals = 0): string {
      return new Intl.NumberFormat('en-NG', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
      }).format(n);
}

export function fmtCurrency(n: number): string {
      if (n === null || n === undefined || isNaN(Number(n))) {
            return '₦0'; // or "--"
      }
      return '₦' + fmt(n, 0);
}

export function fmtPercent(value?: number | null) {
      if (value === null || value === undefined || isNaN(Number(value))) {
            return '0%'; // or "--"
      }
      return `${Number(value).toFixed(2)}%`;
}
