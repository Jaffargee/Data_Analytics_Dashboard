

export function clamp(v: number, min: number, max: number): number {
      return Math.min(Math.max(v, min), max);
}

export function cn(...classes: (string | undefined | false | null)[]): string {
      return classes.filter(Boolean).join(' ');
}

export function pct(v: number, total: number): number {
      if (!total) return 0;
      return clamp((v / total) * 100, 0, 100);
}
