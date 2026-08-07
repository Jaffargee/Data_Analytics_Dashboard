// src/lib/index.ts
// Services
export { supabase } from './services/supabase';
export type * from './services/supabase';
export { queryLLM, executeSQL, buildCustomerProductQuery } from './services/llm';

// Utils - Formatters
export { fmt, fmtCurrency, fmtPercent, formatCellValue, isCurrencyCol } from './utils/formatters';

// Utils - Date
export { fmtDate, fmtMonthLabel, today, nDaysAgo } from './utils/date';

// Utils - Math
export { clamp, pct, cn } from './utils/math';

// Utils - Chart
// Constants
export { CHART_COLORS, CHART_AXIS } from './constants/colors';