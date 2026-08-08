export {
      cn,
      pct,
      clamp
} from "./math"

export {
      fmt,
      fmtCurrency,
      fmtPercent,
      formatCellValue,
      isCurrencyCol,
} from "./formatters"

export {
      fmtDate,
      fmtMonthLabel,
      today,
      nDaysAgo,
} from "./date"

import type { QueryResult } from '@/types';

export function deriveLineChart(res: QueryResult): QueryResult {
  if (!res.rows.length) return res;
  const keys = Object.keys(res.rows[0]);
  const labelKey = keys.find((key) => typeof res.rows[0][key] === 'string') ?? keys[0];
  const valueKey = keys.find((key) => typeof res.rows[0][key] === 'number') ?? keys[1];
  if (!labelKey || !valueKey) return res;
  return { ...res, chartData: { type: 'line', label: String(res.rows[0][labelKey]), value: Number(res.rows[0][valueKey]) } };
}
