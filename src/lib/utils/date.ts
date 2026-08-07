

export function fmtDate(iso: string): string {
      return new Date(iso).toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
      });
}

export function fmtMonthLabel(ym: string): string {
      // "2024-03" → "Mar 24"
      const [y, m] = ym.split('-');
      const date = new Date(Number(y), Number(m) - 1, 1);
      return date.toLocaleDateString('en-NG', {
            month: 'short',
            year: '2-digit',
      });
}

export function today(): string {
      return new Date().toISOString().split('T')[0];
}

export function nDaysAgo(n: number): string {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return d.toISOString().split('T')[0];
}
