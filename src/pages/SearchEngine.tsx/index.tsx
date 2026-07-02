
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TopBar } from '@/components/ui/TopBar';
import {
      Card,
      CardHeader,
      CardTitle,
      Badge,
      EmptyState,
} from '@/components/ui/primitives';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { supabase } from '@/lib/supabase';
import { fmtCurrency, fmt, fmtDate, cn } from '@/lib/utils';
import {
      Search,
      Sparkles,
      Loader2,
      ChevronRight,
      X,
      Clock,
      TrendingUp,
      AlertCircle,
      RefreshCw,
      BarChart2,
      PieChart,
      LineChart as LineIcon,
} from 'lucide-react';
import { gpt_llm_query } from '@/lib/gpt_llm_query';
import { DB_SCHEMA } from '../../constants';

const DONUT_COLORS = [
      '#f5c842',
      '#2dd4bf',
      '#a78bfa',
      '#f87171',
      '#fb923c',
      '#34d399',
      '#60a5fa',
      '#f472b6',
];
type ChartType = 'bar' | 'line' | 'donut' | 'none';

interface AIResponse {
      type: 'query' | 'suggestions' | 'error';
      sql?: string;
      explanation?: string;
      chart_type?: 'bar' | 'line' | 'donut' | 'none';
      suggestions?: { label: string; query: string }[];
      error?: string;
}

interface QueryResult {
      columns: string[];
      rows: Record<string, unknown>[];
      rowCount: number;
      executionMs: number;
}

interface HistoryItem {
      query: string;
      timestamp: Date;
}
interface Suggestion {
      label: string;
      query: string;
}
type SuggestionsStatus = 'idle' | 'loading' | 'done' | 'error';

const FALLBACK_SUGGESTIONS: Suggestion[] = [
      {
            label: 'Top 10 best-selling products',
            query: 'Show me the top 10 best-selling products by revenue',
      },
      {
            label: 'What did a customer buy?',
            query: 'Show all products bought by FAHAD TAHIR with quantities',
      },
      {
            label: 'Low stock alert',
            query: 'Which items are running low and need restocking?',
      },
      {
            label: 'Revenue this month by day',
            query: 'Total revenue this month broken down by day',
      },
      {
            label: 'Most profitable categories',
            query: 'Which product categories have the highest profit margin?',
      },
      {
            label: 'Supplier outstanding balances',
            query: 'Show all suppliers and how much we owe them',
      },
      {
            label: 'Salesperson performance',
            query: 'Compare salesperson performance by revenue and number of sales',
      },
      {
            label: 'WhatsApp post effectiveness',
            query: 'Which products I posted on WhatsApp generated same-day sales?',
      },
];

function inferChartType(
      aiHint: string | undefined,
      columns: string[]
): ChartType {
      const cols = columns.map((c) => c.toLowerCase());
      const hasDate = cols.some(
            (c) => c.includes('date') || c.includes('month')
      );
      const hasCategory = cols.some((c) =>
            [
                  'category',
                  'name',
                  'type',
                  'bucket',
                  'salesperson',
                  'customer',
                  'product',
            ].some((k) => c.includes(k))
      );
      const hasNumeric = cols.some((c) =>
            [
                  'revenue',
                  'total',
                  'qty',
                  'units',
                  'count',
                  'sales',
                  'profit',
            ].some((k) => c.includes(k))
      );
      if (!hasNumeric) return 'none';
      if (aiHint && aiHint !== 'none') return aiHint as ChartType;
      if (hasDate) return 'line';
      if (hasCategory && cols.length <= 4) return 'donut';
      if (hasCategory) return 'bar';
      return 'none';
}

function getLabelKey(columns: string[]): string {
      const priorities = [
            'name',
            'item_name',
            'customer_name',
            'product_name_pos',
            'category',
            'salesperson',
            'day_of_week',
            'sale_date',
            'month',
            'date',
            'time_bucket',
            'price_bucket',
            'metric',
            'supplier_name',
      ];
      for (const p of priorities) {
            const match = columns.find(
                  (c) => c.toLowerCase() === p || c.toLowerCase().includes(p)
            );
            if (match) return match;
      }
      return columns[0];
}

function getValueKey(columns: string[]): string {
      const priorities = [
            'revenue',
            'total_revenue',
            'lifetime_value',
            'stock_cost_value',
            'num_sales',
            'total_qty_sold',
            'units',
            'count',
            'total_sales',
            'same_day_revenue',
            'profit',
            'items_sold',
            'balance',
      ];
      for (const p of priorities) {
            const match = columns.find((c) => c.toLowerCase().includes(p));
            if (match) return match;
      }
      return columns[1] ?? columns[0];
}

function formatCellValue(key: string, val: unknown): string {
      if (val === null || val === undefined) return '—';
      const k = key.toLowerCase();
      if (
            k.includes('revenue') ||
            k.includes('price') ||
            k.includes('value') ||
            k.includes('balance') ||
            k.includes('profit') ||
            k.includes('total') ||
            k === 'lifetime_value' ||
            k.includes('avg') ||
            k.includes('cost')
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
            k.includes('num_') ||
            k.includes('_sold') ||
            k.includes('purchases') ||
            k.includes('units') ||
            k.includes('posts') ||
            k.includes('transactions')
      ) {
            const n = Number(val);
            return isNaN(n) ? String(val) : fmt(n);
      }
      return String(val);
}

function isCurrencyCol(key: string): boolean {
      const k = key.toLowerCase();
      return (
            k.includes('revenue') ||
            k.includes('total') ||
            k.includes('price') ||
            k.includes('value') ||
            k.includes('balance') ||
            k.includes('profit') ||
            k.includes('avg') ||
            k.includes('cost') ||
            k === 'lifetime_value'
      );
}

async function callAI(userQuery: string): Promise<AIResponse> {
      const systemPrompt = `You are a SQL expert for a Nigerian textile POS. Convert natural language to safe read-only PostgreSQL.
            RULES:
            1. ONLY SELECT statements. Never INSERT UPDATE DELETE DROP TRUNCATE ALTER CREATE.
            2. LIMIT 200 always unless user says all.
            3. ALWAYS prefer v_* views over raw tables.
            4. Name matching: use ILIKE '%term%' always.
            5. Add ORDER BY for rankings.
            6. NEVER return type:error — always return query or suggestions instead.
            7. chart_type: "line" for time-series, "bar" for categories/names, "donut" for ≤8 share breakdowns, "none" otherwise.

            RESPONSE (valid JSON only, no markdown):
            Clear query: {"type":"query","sql":"SELECT...","explanation":"one sentence","chart_type":"bar"|"line"|"donut"|"none"}
            Ambiguous: {"type":"suggestions","suggestions":[{"label":"short","query":"full query"},{"label":"short","query":"full query"}]}

            DB SCHEMA:
      ${DB_SCHEMA}`;

      const text = await gpt_llm_query(userQuery, systemPrompt);
      if (!text)
            return {
                  type: 'suggestions',
                  suggestions: [
                        {
                              label: 'Show total revenue',
                              query: 'Show me total revenue this month broken down by day',
                        },
                  ],
            };
      try {
            const parsed = JSON.parse(
                  text.replace(/```json|```/g, '').trim()
            ) as AIResponse;
            return parsed;
      } catch {
            return {
                  type: 'suggestions',
                  suggestions: [
                        {
                              label: 'Show total revenue',
                              query: 'Show me total revenue this month',
                        },
                  ],
            };
      }
}

function validateSQL(sql: string): { safe: boolean; reason?: string } {
      const upper = sql.toUpperCase().trim();
      for (const kw of [
            'INSERT',
            'UPDATE',
            'DELETE',
            'DROP',
            'TRUNCATE',
            'ALTER',
            'CREATE',
            'GRANT',
            'REVOKE',
      ]) {
            if (upper.includes(kw))
                  return { safe: false, reason: `Blocked: ${kw}` };
      }
      if (!upper.startsWith('SELECT'))
            return { safe: false, reason: 'Only SELECT allowed' };
      return { safe: true };
}

async function executeSQL(sql: string): Promise<QueryResult> {
      const start = performance.now();
      const { data, error } = await supabase.rpc('execute_analytics_query', {
            query_sql: sql,
      });
      if (error) throw new Error(error.message);
      const rows = (data as Record<string, unknown>[]) ?? [];
      return {
            columns: rows.length > 0 ? Object.keys(rows[0]) : [],
            rows,
            rowCount: rows.length,
            executionMs: Math.round(performance.now() - start),
      };
}

function useSuggestions() {
      const [suggestions, setSuggestions] =
            useState<Suggestion[]>(FALLBACK_SUGGESTIONS);
      const [status, setStatus] = useState<SuggestionsStatus>('idle');
      const load = useCallback(async () => {
            setStatus('loading');
            try {
                  const resp = await gpt_llm_query(
                        'Generate 8 diverse analytics query suggestions for a Nigerian textile POS dashboard.',
                        `Generate 8 specific query suggestions for revenue, products, customers, stock, staff, suppliers, WhatsApp posts. Respond ONLY with JSON array: [{"label":"max 5 words","query":"full query"}]`
                  );
                  if (!resp) throw new Error('empty');
                  const parsed = JSON.parse(
                        resp.replace(/```json|```/g, '').trim()
                  ) as Suggestion[];
                  if (
                        Array.isArray(parsed) &&
                        parsed.every((s) => s.label && s.query)
                  ) {
                        setSuggestions(parsed);
                        setStatus('done');
                  } else throw new Error('invalid');
            } catch {
                  setStatus('error');
            }
      }, []);
      useEffect(() => {
            load();
      }, [load]);
      return { suggestions, status, reload: load };
}

function ResultChart({
      result,
      chartType,
}: {
      result: QueryResult;
      chartType: ChartType;
}) {
      if (chartType === 'none' || result.rowCount === 0) return null;
      const labelKey = getLabelKey(result.columns);
      const valueKey = getValueKey(result.columns);
      const isCurrency = isCurrencyCol(valueKey);
      const formatVal = isCurrency ? fmtCurrency : fmt;
      const chartData = result.rows.slice(0, 20).map((row) => ({
            label: String(row[labelKey] ?? '').slice(0, 16),
            value: Number(row[valueKey] ?? 0),
      }));
      const donutData = result.rows.slice(0, 8).map((row, i) => ({
            label: String(row[labelKey] ?? '').slice(0, 20),
            value: Number(row[valueKey] ?? 0),
            color: DONUT_COLORS[i % DONUT_COLORS.length],
      }));
      return (
            <Card>
                  <CardHeader>
                        <CardTitle>
                              {chartType === 'bar' && (
                                    <>
                                          <BarChart2
                                                size={13}
                                                className="inline mr-1.5 text-accent-gold"
                                          />
                                          Bar Chart
                                    </>
                              )}
                              {chartType === 'line' && (
                                    <>
                                          <LineIcon
                                                size={13}
                                                className="inline mr-1.5 text-accent-teal"
                                          />
                                          Trend Chart
                                    </>
                              )}
                              {chartType === 'donut' && (
                                    <>
                                          <PieChart
                                                size={13}
                                                className="inline mr-1.5 text-accent-purple"
                                          />
                                          Distribution
                                    </>
                              )}
                        </CardTitle>
                        <span className="text-xs font-mono text-ink-muted capitalize">
                              {valueKey.replace(/_/g, ' ')}
                        </span>
                  </CardHeader>
                  {chartType === 'bar' && (
                        <BarChart
                              data={chartData}
                              height={200}
                              color="#f5c842"
                              formatValue={formatVal}
                        />
                  )}
                  {chartType === 'line' && (
                        <LineChart
                              data={chartData}
                              height={200}
                              color="#2dd4bf"
                              formatValue={formatVal}
                        />
                  )}
                  {chartType === 'donut' && (
                        <DonutChart
                              data={donutData}
                              size={180}
                              formatValue={formatVal}
                        />
                  )}
            </Card>
      );
}

export default function SearchEngine() {
      const [input, setInput] = useState('');
      const [aiState, setAiState] = useState<
            'idle' | 'thinking' | 'done' | 'error'
      >('idle');
      const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
      const [result, setResult] = useState<QueryResult | null>(null);
      const [generatedSQL, setGeneratedSQL] = useState<string>('');
      const [execError, setExecError] = useState<string | null>(null);
      const [history, setHistory] = useState<HistoryItem[]>([]);
      const [showSQL, setShowSQL] = useState(false);
      const [chartType, setChartType] = useState<ChartType>('none');
      const inputRef = useRef<HTMLInputElement>(null);
      const {
            suggestions,
            status: suggestionsStatus,
            reload: reloadSuggestions,
      } = useSuggestions();

      useEffect(() => {
            inputRef.current?.focus();
      }, []);

      const runQuery = useCallback(async (queryText: string) => {
            if (!queryText.trim()) return;
            setAiState('thinking');
            setResult(null);
            setAiResponse(null);
            setExecError(null);
            setGeneratedSQL('');
            setChartType('none');
            setHistory((prev) => [
                  { query: queryText, timestamp: new Date() },
                  ...prev.slice(0, 9),
            ]);
            try {
                  const aiRes = await callAI(queryText);
                  setAiResponse(aiRes);
                  if (aiRes.type === 'query' && aiRes.sql) {
                        const check = validateSQL(aiRes.sql);
                        if (!check.safe) {
                              setExecError(check.reason ?? 'Unsafe');
                              setAiState('error');
                              return;
                        }
                        setGeneratedSQL(aiRes.sql);
                        try {
                              const qr = await executeSQL(aiRes.sql);
                              setResult(qr);
                              setChartType(
                                    inferChartType(aiRes.chart_type, qr.columns)
                              );
                              setAiState('done');
                        } catch (err) {
                              setExecError(
                                    err instanceof Error
                                          ? err.message
                                          : 'Query failed'
                              );
                              setAiState('error');
                        }
                  } else {
                        setAiState('done');
                  }
            } catch (err) {
                  setExecError(
                        err instanceof Error ? err.message : 'AI failed'
                  );
                  setAiState('error');
            }
      }, []);

      const handleSuggestionClick = (q: string) => {
            setInput(q);
            runQuery(q);
      };
      const handleSubmit = (e?: React.FormEvent) => {
            e?.preventDefault();
            if (input.trim()) runQuery(input.trim());
      };
      const handleClear = () => {
            setInput('');
            setAiState('idle');
            setResult(null);
            setAiResponse(null);
            setExecError(null);
            setGeneratedSQL('');
            setChartType('none');
            inputRef.current?.focus();
      };
      const isLoading = aiState === 'thinking';

      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar
                        title="Search"
                        subtitle="Natural language queries powered by AI"
                  />
                  <main className="flex-1 p-6 space-y-6">
                        <div className="flex flex-col items-center gap-4">
                              <div className="text-center">
                                    <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-gradient-gold">
                                          Search Engine
                                    </h1>
                                    <p className="text-ink-muted text-sm font-body mt-1">
                                          Ask anything about your sales data in
                                          plain English
                                    </p>
                              </div>
                              <form
                                    onSubmit={handleSubmit}
                                    className="w-full max-w-2xl"
                              >
                                    <div className="flex items-center gap-3 bg-bg-card border border-accent-gold/30 rounded-full px-4 py-3 focus-within:border-accent-gold/60 transition-all shadow-md shadow-accent-gold/10">
                                          {isLoading ? (
                                                <Loader2
                                                      size={18}
                                                      className="text-accent-gold animate-spin shrink-0"
                                                />
                                          ) : (
                                                <Search
                                                      size={18}
                                                      className="text-accent-gold shrink-0"
                                                />
                                          )}
                                          <input
                                                ref={inputRef}
                                                type="text"
                                                value={input}
                                                onChange={(e) =>
                                                      setInput(e.target.value)
                                                }
                                                onKeyDown={(e) =>
                                                      e.key === 'Enter' &&
                                                      !e.shiftKey &&
                                                      handleSubmit()
                                                }
                                                placeholder="e.g. top 10 products, what did Fahad buy, WhatsApp posts with same-day sales…"
                                                className="flex-1 bg-transparent text-base font-body text-ink-primary placeholder:text-ink-faint outline-none"
                                                disabled={isLoading}
                                          />
                                          {input && !isLoading && (
                                                <button
                                                      type="button"
                                                      onClick={handleClear}
                                                      className="text-ink-faint hover:text-ink-secondary transition-colors"
                                                >
                                                      <X size={15} />
                                                </button>
                                          )}
                                          <button
                                                type="submit"
                                                disabled={
                                                      !input.trim() || isLoading
                                                }
                                                className="px-4 py-2 rounded-full bg-accent-gold/15 border border-accent-gold/30 text-accent-gold text-xs font-mono font-medium hover:bg-accent-gold/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                                          >
                                                {isLoading
                                                      ? 'Thinking…'
                                                      : 'Search ↵'}
                                          </button>
                                    </div>
                              </form>
                        </div>

                        {aiState === 'idle' && (
                              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                    <div className="xl:col-span-2">
                                          <div className="flex items-center justify-between mb-3">
                                                <p className="text-xs font-body uppercase tracking-widest text-ink-muted">
                                                      Try asking
                                                </p>
                                                <button
                                                      onClick={
                                                            reloadSuggestions
                                                      }
                                                      disabled={
                                                            suggestionsStatus ===
                                                            'loading'
                                                      }
                                                      className="flex items-center gap-1.5 text-xs font-body text-ink-muted hover:text-accent-gold transition-colors disabled:opacity-40"
                                                >
                                                      <RefreshCw
                                                            size={11}
                                                            className={
                                                                  suggestionsStatus ===
                                                                  'loading'
                                                                        ? 'animate-spin'
                                                                        : ''
                                                            }
                                                      />
                                                      {suggestionsStatus ===
                                                      'loading'
                                                            ? 'Generating…'
                                                            : 'Refresh'}
                                                </button>
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {suggestions.map((ex) => (
                                                      <button
                                                            key={ex.query}
                                                            onClick={() =>
                                                                  handleSuggestionClick(
                                                                        ex.query
                                                                  )
                                                            }
                                                            className="flex items-center gap-3 p-3 rounded-xl border border-bg-border bg-bg-card hover:border-accent-gold/30 hover:bg-accent-gold/5 text-left transition-all group"
                                                      >
                                                            <span className="w-6 h-6 rounded-lg bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center shrink-0">
                                                                  <TrendingUp
                                                                        size={
                                                                              11
                                                                        }
                                                                        className="text-accent-gold"
                                                                  />
                                                            </span>
                                                            <span className="text-xs font-body text-ink-secondary group-hover:text-ink-primary transition-colors line-clamp-2">
                                                                  {ex.label}
                                                            </span>
                                                            <ChevronRight
                                                                  size={11}
                                                                  className="text-ink-faint ml-auto shrink-0 group-hover:text-accent-gold transition-colors"
                                                            />
                                                      </button>
                                                ))}
                                          </div>
                                    </div>
                                    {history.length > 0 && (
                                          <div>
                                                <p className="text-xs font-body uppercase tracking-widest text-ink-muted mb-3">
                                                      Recent searches
                                                </p>
                                                <div className="space-y-1">
                                                      {history
                                                            .slice(0, 6)
                                                            .map((h, i) => (
                                                                  <button
                                                                        key={i}
                                                                        onClick={() =>
                                                                              handleSuggestionClick(
                                                                                    h.query
                                                                              )
                                                                        }
                                                                        className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-bg-hover text-left transition-colors group"
                                                                  >
                                                                        <Clock
                                                                              size={
                                                                                    11
                                                                              }
                                                                              className="text-ink-faint shrink-0"
                                                                        />
                                                                        <span className="text-xs font-body text-ink-muted group-hover:text-ink-secondary transition-colors truncate">
                                                                              {
                                                                                    h.query
                                                                              }
                                                                        </span>
                                                                  </button>
                                                            ))}
                                                </div>
                                          </div>
                                    )}
                              </div>
                        )}

                        {isLoading && (
                              <Card>
                                    <div className="flex items-center gap-3 py-4">
                                          <div className="w-8 h-8 rounded-lg bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
                                                <Sparkles
                                                      size={14}
                                                      className="text-accent-gold animate-pulse"
                                                />
                                          </div>
                                          <div>
                                                <p className="text-sm font-body text-ink-primary">
                                                      Generating SQL query…
                                                </p>
                                                <p className="text-xs text-ink-muted font-body">
                                                      Analysing your question
                                                </p>
                                          </div>
                                          <Loader2
                                                size={16}
                                                className="text-accent-gold animate-spin ml-auto"
                                          />
                                    </div>
                              </Card>
                        )}

                        {!isLoading && aiResponse?.type === 'suggestions' && (
                              <Card>
                                    <CardHeader>
                                          <CardTitle>Did you mean…</CardTitle>
                                          <Badge variant="gold">Clarify</Badge>
                                    </CardHeader>
                                    <div className="space-y-2">
                                          {aiResponse.suggestions?.map(
                                                (s, i) => (
                                                      <button
                                                            key={i}
                                                            onClick={() =>
                                                                  handleSuggestionClick(
                                                                        s.query
                                                                  )
                                                            }
                                                            className="w-full flex items-center gap-3 p-3 rounded-xl border border-bg-border hover:border-accent-gold/30 hover:bg-accent-gold/5 text-left transition-all group"
                                                      >
                                                            <span className="w-6 h-6 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center shrink-0 text-accent-purple font-mono text-xs">
                                                                  {i + 1}
                                                            </span>
                                                            <span className="text-sm font-body text-ink-secondary group-hover:text-ink-primary transition-colors">
                                                                  {s.query}
                                                            </span>
                                                            <ChevronRight
                                                                  size={13}
                                                                  className="text-ink-faint ml-auto shrink-0 group-hover:text-accent-gold transition-colors"
                                                            />
                                                      </button>
                                                )
                                          )}
                                    </div>
                              </Card>
                        )}

                        {aiState === 'error' && (
                              <Card>
                                    <div className="flex items-start gap-3 py-2">
                                          <div className="w-8 h-8 rounded-lg bg-accent-red/10 border border-accent-red/20 flex items-center justify-center shrink-0">
                                                <AlertCircle
                                                      size={14}
                                                      className="text-accent-red"
                                                />
                                          </div>
                                          <div>
                                                <p className="text-sm font-body text-accent-red font-medium">
                                                      Query failed
                                                </p>
                                                <p className="text-xs text-ink-muted font-body mt-0.5">
                                                      {execError}
                                                </p>
                                                {generatedSQL && (
                                                      <pre className="text-xs text-ink-faint font-mono mt-2 bg-bg-hover rounded px-2 py-1 border border-bg-border whitespace-pre-wrap">
                                                            {generatedSQL}
                                                      </pre>
                                                )}
                                          </div>
                                    </div>
                              </Card>
                        )}

                        {aiState === 'done' && result && (
                              <>
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                          <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                      <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
                                                      <span className="text-xs font-body text-ink-muted">
                                                            {fmt(
                                                                  result.rowCount
                                                            )}{' '}
                                                            {result.rowCount ===
                                                            1
                                                                  ? 'result'
                                                                  : 'results'}
                                                            <span className="text-ink-faint">
                                                                  {' '}
                                                                  ·{' '}
                                                                  {
                                                                        result.executionMs
                                                                  }
                                                                  ms
                                                            </span>
                                                      </span>
                                                </div>
                                                {aiResponse?.explanation && (
                                                      <span className="text-xs font-body text-ink-secondary hidden sm:block">
                                                            —{' '}
                                                            {
                                                                  aiResponse.explanation
                                                            }
                                                      </span>
                                                )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                                {(
                                                      [
                                                            'bar',
                                                            'line',
                                                            'donut',
                                                            'none',
                                                      ] as ChartType[]
                                                ).map((ct) => (
                                                      <button
                                                            key={ct}
                                                            onClick={() =>
                                                                  setChartType(
                                                                        ct
                                                                  )
                                                            }
                                                            className={cn(
                                                                  'px-2.5 py-1 text-xs font-mono rounded-lg border transition-all capitalize',
                                                                  chartType ===
                                                                        ct
                                                                        ? 'border-accent-gold/40 bg-accent-gold/15 text-accent-gold'
                                                                        : 'border-bg-border text-ink-faint hover:text-ink-muted'
                                                            )}
                                                      >
                                                            {ct}
                                                      </button>
                                                ))}
                                                <button
                                                      onClick={() =>
                                                            setShowSQL(!showSQL)
                                                      }
                                                      className="px-2.5 py-1 text-xs font-mono border border-bg-border rounded-lg text-ink-muted hover:text-accent-gold hover:border-accent-gold/30 transition-all"
                                                >
                                                      {showSQL
                                                            ? 'Hide SQL'
                                                            : 'SQL'}
                                                </button>
                                          </div>
                                    </div>

                                    {showSQL && generatedSQL && (
                                          <Card>
                                                <CardHeader>
                                                      <CardTitle>
                                                            Generated SQL
                                                      </CardTitle>
                                                      <Badge variant="teal">
                                                            Read-only ·
                                                            validated
                                                      </Badge>
                                                </CardHeader>
                                                <pre className="text-xs font-mono text-ink-secondary bg-bg-hover rounded-lg p-4 overflow-x-auto border border-bg-border leading-relaxed whitespace-pre-wrap">
                                                      {generatedSQL}
                                                </pre>
                                          </Card>
                                    )}

                                    <ResultChart
                                          result={result}
                                          chartType={chartType}
                                    />

                                    <Card>
                                          <div className="overflow-x-auto">
                                                <table className="w-full">
                                                      <thead>
                                                            <tr className="border-b border-bg-border">
                                                                  {result.columns.map(
                                                                        (
                                                                              col
                                                                        ) => (
                                                                              <th
                                                                                    key={
                                                                                          col
                                                                                    }
                                                                                    className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted whitespace-nowrap"
                                                                              >
                                                                                    {col.replace(
                                                                                          /_/g,
                                                                                          ' '
                                                                                    )}
                                                                              </th>
                                                                        )
                                                                  )}
                                                            </tr>
                                                      </thead>
                                                      <tbody>
                                                            {result.rows.map(
                                                                  (row, i) => (
                                                                        <tr
                                                                              key={
                                                                                    i
                                                                              }
                                                                              className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors"
                                                                        >
                                                                              {result.columns.map(
                                                                                    (
                                                                                          col
                                                                                    ) => (
                                                                                          <td
                                                                                                key={
                                                                                                      col
                                                                                                }
                                                                                                className="py-2.5 pr-4 whitespace-nowrap"
                                                                                          >
                                                                                                <span
                                                                                                      className={cn(
                                                                                                            'text-xs font-mono',
                                                                                                            isCurrencyCol(
                                                                                                                  col
                                                                                                            )
                                                                                                                  ? 'text-accent-gold font-medium'
                                                                                                                  : '',
                                                                                                            col ===
                                                                                                                  result
                                                                                                                        .columns[0]
                                                                                                                  ? 'text-ink-primary font-body'
                                                                                                                  : 'text-ink-secondary'
                                                                                                      )}
                                                                                                >
                                                                                                      {formatCellValue(
                                                                                                            col,
                                                                                                            row[
                                                                                                                  col
                                                                                                            ]
                                                                                                      )}
                                                                                                </span>
                                                                                          </td>
                                                                                    )
                                                                              )}
                                                                        </tr>
                                                                  )
                                                            )}
                                                      </tbody>
                                                </table>
                                                {result.rows.length === 0 && (
                                                      <EmptyState message="No results for this query" />
                                                )}
                                          </div>
                                    </Card>
                              </>
                        )}
                  </main>
            </div>
      );
}
