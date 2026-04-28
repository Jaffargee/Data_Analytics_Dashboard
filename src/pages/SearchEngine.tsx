import React, { useState, useRef, useCallback, useEffect } from 'react'
import { TopBar } from '@/components/ui/TopBar'
import { Card, CardHeader, CardTitle, Badge, EmptyState } from '@/components/ui/primitives'
import { supabase } from '@/lib/supabase'
import { fmtCurrency, fmt, fmtDate, cn } from '@/lib/utils'
import { Search, Sparkles, Loader2, ChevronRight, X, Clock, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'
import { gpt_llm_query } from '@/lib/gpt_llm_query'

// ── DB schema sent to Claude as context (not your actual data) ───────────────
const DB_SCHEMA = `
      PostgreSQL schema for a Point-of-Sale system. All monetary values are in NGN (₦).

      Tables:
      - customers(id uuid, pos_customer_id int PK, first_name text, last_name text, email text, phone_number text, company_name text, balance numeric, credit_limit numeric, created_at timestamptz)
      - suppliers(id uuid, pos_supplier_id int PK, company_name text, phone_number text, email text, balance numeric)
      - items(id uuid, pos_item_id int PK, item_name text, category text, supplier_id int FK→suppliers.pos_supplier_id, cost_price numeric, selling_price numeric, quantity numeric, reorder_level numeric, is_service bool, inactive bool)
      - sales(id uuid, pos_sale_id bigint UNIQUE, pos_customer_id int FK→customers.pos_customer_id, salesperson text, customer_name text, comment text, is_anonymous_customer boolean, invoice_total numeric, items_net bigint, items_sold bigint, items_returned bigint, invoice_datetime timestamptz, scraped_at timestamptz)
      - sale_items(id uuid, pos_sale_id bigint FK→sales.pos_sale_id, pos_item_id int FK→items.pos_item_id, name text, quantity bigint, unit_price numeric, total numeric)
      - accounts(id uuid, bank_name text, name text, account_no text, balance numeric)

      Analytical views (prefer these for aggregated queries):
      - v_revenue_daily(sale_date date, num_sales bigint, revenue numeric, items_sold bigint)
      - v_revenue_monthly(month text, num_sales bigint, revenue numeric, avg_sale numeric, items_sold bigint)
      - v_best_selling_items(pos_item_id int, item_name text, category text, selling_price numeric, cost_price numeric, total_qty_sold numeric, total_revenue numeric, gross_profit numeric, margin_pct numeric, times_sold bigint)
      - v_top_customers(pos_customer_id int, customer_name text, phone_number text, email text, total_purchases bigint, lifetime_value numeric, avg_purchase numeric, last_purchase_at timestamptz)
      - v_low_stock_items(pos_item_id int, item_name text, category text, stock_qty numeric, reorder_level numeric, selling_price numeric, cost_price numeric)
      - v_sales_by_salesperson(salesperson text, total_sales bigint, total_revenue numeric, avg_sale numeric, items_sold bigint)
      - v_supplier_stock_value(pos_supplier_id int, supplier_name text, num_products bigint, stock_cost_value numeric, stock_retail_value numeric, outstanding_balance numeric)
      - v_category_performance(category text, num_items bigint, total_qty_sold numeric, total_revenue numeric, gross_profit numeric)
`.trim()

// ── Suggested queries shown at rest state ────────────────────────────────────
const FALLBACK_SUGGESTIONS = [
      { label: 'Top 10 best-selling products',      query: 'Show me the top 10 best-selling products by revenue' },
      { label: 'What did a customer buy?',          query: 'Show all products bought by customer ZIKRULLAHI SHOP with quantities' },
      { label: 'Low stock alert',                   query: 'Which items are running low and need restocking?' },
      { label: 'Revenue this month',                query: 'Total revenue this month broken down by day' },
      { label: 'Most profitable categories',        query: 'Which product categories have the highest profit margin?' },
      { label: 'Supplier outstanding balances',     query: 'Show all suppliers and how much we owe them' },
      { label: 'Salesperson performance',           query: 'Compare salesperson performance by revenue and number of sales' },
      { label: 'Customer purchase frequency',       query: 'Show customers ranked by number of purchases and lifetime value' },
]

// ── Types ────────────────────────────────────────────────────────────────────
interface AIResponse {
      type: 'query' | 'suggestions' | 'error'
      sql?: string
      explanation?: string
      suggestions?: { label: string; query: string }[]
      error?: string
}

interface QueryResult {
      columns: string[]
      rows: Record<string, unknown>[]
      rowCount: number
      executionMs: number
}

interface HistoryItem {
      query: string
      timestamp: Date
}

interface Suggestion {
      label: string
      query: string
}

type SuggestionsStatus = 'idle' | 'loading' | 'done' | 'error'


// ── Helpers ──────────────────────────────────────────────────────────────────
function formatCellValue(key: string, val: unknown): string {
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

function isCurrencyCol(key: string): boolean {
      const k = key.toLowerCase()
      return k.includes('revenue') || k.includes('total') || k.includes('price') ||
      k.includes('value') || k.includes('balance') || k.includes('profit') || k.includes('avg')
}
// ── AI suggestion generator ──────────────────────────────────────────────────
async function fetchAISuggestions(): Promise<Suggestion[]> {
      const systemPrompt = `
            You are an analytics assistant for a Nigerian POS system.
            Generate 8 varied, specific, and useful query suggestions a business owner might want to ask about their sales data.
            Cover different areas: revenue trends, product performance, customer behaviour, stock levels, staff performance, supplier balances.
            
            Respond ONLY with a valid JSON array. No markdown, no explanation. Example format:
            [
            { "label": "Short label (max 5 words)", "query": "Full natural language query the user would type" },
            ...
            ]
      `.trim()
      
      const resp = await gpt_llm_query(
            'Generate 8 diverse analytics query suggestions for a POS dashboard.',
            systemPrompt,
      )
      
      if (!resp) throw new Error('Empty response')
      
      const clean = resp.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean) as Suggestion[]
      
      // Validate shape — must be array of { label, query }
      if (!Array.isArray(parsed) || parsed.some(s => !s.label || !s.query)) {
            throw new Error('Invalid suggestion format')
      }
      
      return parsed
}

// ── Claude API call ──────────────────────────────────────────────────────────
async function callClaude(userQuery: string): Promise<AIResponse> {
      
      const systemPrompt = `
            You are a SQL assistant for a Nigerian Point-of-Sale analytics dashboard. 
            Your job is to convert natural language questions into safe, read-only PostgreSQL queries for Supabase.

            RULES:
            1. Only generate SELECT statements. Never INSERT, UPDATE, DELETE, DROP, TRUNCATE, or any DDL.
            2. Always add LIMIT 200 unless the user explicitly asks for all.
            3. Prefer the analytical views (v_*) over raw tables when they contain the needed data.
            4. For customer-specific queries, use ILIKE for name matching (case-insensitive).
            5. Add ORDER BY for ranking queries (ORDER BY revenue DESC, etc).
            6. Format monetary values nicely using ROUND(val, 2).

            RESPONSE FORMAT — respond with valid JSON only, no markdown, no explanation outside the JSON:

            If query is clear and actionable:
            {
                  "type": "query",
                  "sql": "SELECT ...",
                  "explanation": "One sentence describing what this query returns"
            }

            If query is ambiguous or could mean multiple things:
            {
                  "type": "suggestions",
                  "suggestions": [
                        { "label": "Short label", "query": "More specific version of what user might mean" },
                        { "label": "Short label", "query": "Another interpretation" }
                  ]
            }

            If query is impossible or nonsensical:
            {
                  "type": "error",
                  "error": "Brief explanation of why this can't be queried"
            }

            DATABASE SCHEMA:
      ${DB_SCHEMA}`

      const text = await gpt_llm_query(userQuery, systemPrompt)

      try {
            const clean = text?.replace(/```json|```/g, '').trim()
      if (clean) return JSON.parse(clean) as AIResponse
            return {} as AIResponse
      } catch {
            return { type: 'error', error: 'Failed to parse AI response. Please try again.' }
      }
}

// ── SQL safety check ─────────────────────────────────────────────────────────
function validateSQL(sql: string): { safe: boolean; reason?: string } {
      const upper = sql.toUpperCase().trim()
      const dangerous = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'TRUNCATE', 'ALTER', 'CREATE', 'GRANT', 'REVOKE']

      for (const kw of dangerous) {
            if (upper.includes(kw)) return { safe: false, reason: `Query contains forbidden keyword: ${kw}` }
      }

      if (!upper.startsWith('SELECT')) return { safe: false, reason: 'Only SELECT queries are allowed' }

      return { safe: true }
}

// ── Execute SQL via Supabase RPC or direct query ─────────────────────────────
async function executeSQL(sql: string): Promise<QueryResult> {
      const start = performance.now()

      // Use Supabase's built-in query approach — runs against your DB directly
      const { data, error } = await supabase.rpc('execute_analytics_query', { query_sql: sql })

      if (error) {
            // Fallback: try to parse the SQL and use table/view API
            throw new Error(error.message)
      }

      const rows = (data as Record<string, unknown>[]) ?? []
      const columns = rows.length > 0 ? Object.keys(rows[0]) : []

      return {
            columns,
            rows,
            rowCount: rows.length,
            executionMs: Math.round(performance.now() - start),
      }
}

// ── useSuggestions hook ──────────────────────────────────────────────────────
function useSuggestions() {
      const [suggestions, setSuggestions]   = useState<Suggestion[]>(FALLBACK_SUGGESTIONS)
      const [status, setStatus]             = useState<SuggestionsStatus>('idle')
      
      const load = useCallback(async () => {
            setStatus('loading')
            try {
                  const ai = await fetchAISuggestions()
                  setSuggestions(ai)
                  setStatus('done')
            } catch {
                  // Keep showing fallback on error — no disruption to the user
                  setStatus('error')
            }
      }, [])
      
      // Auto-load on mount
      useEffect(() => { load() }, [load])
      
      return { suggestions, status, reload: load }
}

// NOTE: You need this Supabase function for arbitrary SQL execution:
// CREATE OR REPLACE FUNCTION execute_analytics_query(query_sql TEXT)
// RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
// DECLARE result JSON;
// BEGIN
//   IF upper(query_sql) NOT LIKE 'SELECT%' THEN
//     RAISE EXCEPTION 'Only SELECT queries allowed';
//   END IF;
//   EXECUTE 'SELECT json_agg(t) FROM (' || query_sql || ') t' INTO result;
//   RETURN COALESCE(result, '[]'::json);
// END; $$;

// ── Main component ───────────────────────────────────────────────────────────
export default function SearchEngine() {
      const [input, setInput]             = useState('')
      const [aiState, setAiState]         = useState<'idle' | 'thinking' | 'done' | 'error'>('idle')
      const [aiResponse, setAiResponse]   = useState<AIResponse | null>(null)
      const [result, setResult]           = useState<QueryResult | null>(null)
      const [generatedSQL, setGeneratedSQL] = useState<string>('')
      const [execError, setExecError]     = useState<string | null>(null)
      const [history, setHistory]         = useState<HistoryItem[]>([])
      const [showSQL, setShowSQL]         = useState(false)
      const inputRef = useRef<HTMLInputElement>(null)
      const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
      const [model, setModel] = useState('gemini-2.5-flash')

      // const { suggestions, status: suggestionsStatus, reload: reloadSuggestions } = useSuggestions()

      // Focus input on mount
      useEffect(() => { inputRef.current?.focus() }, [])

      const runQuery = useCallback(async (queryText: string) => {
            if (!queryText.trim()) return

            setAiState('thinking')
            setResult(null)
            setAiResponse(null)
            setExecError(null)
            setGeneratedSQL('')

            // Add to history
            setHistory(prev => [{ query: queryText, timestamp: new Date() }, ...prev.slice(0, 9)])

            try {
                  const aiRes = await callClaude(queryText)
                  setAiResponse(aiRes)

                  if (aiRes.type === 'query' && aiRes.sql) {
                        const check = validateSQL(aiRes.sql)
                        if (!check.safe) {
                              setExecError(check.reason ?? 'Unsafe query blocked')
                              setAiState('error')
                              return
                        }

                        setGeneratedSQL(aiRes.sql)

                        try {
                              const queryResult = await executeSQL(aiRes.sql)
                              setResult(queryResult)
                              setAiState('done')
                        } catch (err) {
                              setExecError(err instanceof Error ? err.message : 'Query execution failed')
                              setAiState('error')
                        }
                  } else {
                        setAiState('done')
                  }

            } catch (err) {
                  setExecError(err instanceof Error ? err.message : 'AI request failed')
                  setAiState('error')
            }

      }, [model])

      const handleInput = (value: string) => {
            setInput(value)
            if (debounceRef.current) clearTimeout(debounceRef.current)
            // No auto-submit on type — only on Enter or button click
      }

      const handleSubmit = (e?: React.FormEvent) => {
            e?.preventDefault()
            if (input.trim()) runQuery(input.trim())
      }

      const handleSuggestionClick = (query: string) => {
            setInput(query)
            runQuery(query)
      }

      const handleClear = () => {
            setInput('')
            setAiState('idle')
            setResult(null)
            setAiResponse(null)
            setExecError(null)
            setGeneratedSQL('')
            inputRef.current?.focus()
      }

      const isLoading = aiState === 'thinking'

      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar title="Search" subtitle="Natural language queries powered by AI" />

                  <main className="flex-1 p-6 space-y-6">

                  {/* ── Search form ── */}
                  <SearchForm
                        input={input}
                        isLoading={isLoading}
                        inputRef={inputRef}
                        onInput={handleInput}
                        onSubmit={handleSubmit}
                        onClear={handleClear}
                        model={model}
                        onModelChange={setModel}
                  />

                  {/* ── Idle state: examples + history ── */}
                  {aiState === 'idle' && (
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                              {/* Example queries */}
                              <div className="xl:col-span-2">
                                    <p className="text-xs font-body uppercase tracking-widest text-ink-muted mb-3">Try asking</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {
                                          FALLBACK_SUGGESTIONS.length === 0 ? (
                                                <div className="flex items-center gap-3 py-4">
                                                      <Loader2 size={18} className="text-accent-gold animate-spin shrink-0" />
                                                      <span className='text-ink-muted font-body text-sm tracking-widest'>Generating Suggestions</span>
                                                </div>
                                          )
                                          :
                                          FALLBACK_SUGGESTIONS.map((ex) => (
                                                <button key={ex.query} onClick={() => handleSuggestionClick(ex.query)} className="flex items-center gap-3 p-3 rounded-xl border border-bg-border bg-bg-card hover:border-accent-gold/30 hover:bg-accent-gold/5 text-left transition-all group">
                                                      <span className="w-6 h-6 rounded-lg bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center shrink-0">
                                                            <TrendingUp size={11} className="text-accent-gold" />
                                                      </span>
                                                      <span className="text-xs font-body text-ink-secondary group-hover:text-ink-primary transition-colors">
                                                            {ex.label}
                                                      </span>
                                                      <ChevronRight size={11} className="text-ink-faint ml-auto shrink-0 group-hover:text-accent-gold transition-colors" />
                                                </button>
                                          ))}
                                    </div>
                              </div>

                              {/* <div className="xl:col-span-2">
                                    <SuggestionsPanel
                                          suggestions={suggestions}
                                          status={suggestionsStatus}
                                          onSelect={handleSuggestionClick}
                                          onReload={reloadSuggestions}
                                    />
                              </div> */}

                              {/* History */}
                              {history.length > 0 && (
                                    <div>
                                          <p className="text-xs font-body uppercase tracking-widest text-ink-muted mb-3">Recent searches</p>
                                          <div className="space-y-1">
                                                {history.slice(0, 6).map((h, i) => (
                                                      <button key={i} onClick={() => handleSuggestionClick(h.query)} className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-bg-hover text-left transition-colors group">
                                                            <Clock size={11} className="text-ink-faint shrink-0" />
                                                            <span className="text-xs font-body text-ink-muted group-hover:text-ink-secondary transition-colors truncate">
                                                                  {h.query}
                                                            </span>
                                                      </button>
                                                ))}
                                          </div>
                                    </div>
                              )}
                        </div>
                  )}

                  {/* ── Loading state ── */}
                  {isLoading && (
                        <Card>
                              <div className="flex items-center gap-3 py-4">
                                    <div className="w-8 h-8 rounded-lg bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
                                          <Sparkles size={14} className="text-accent-gold animate-pulse" />
                                    </div>
                                    <div>
                                          <p className="text-sm font-body text-ink-primary">Generating SQL query…</p>
                                          <p className="text-xs text-ink-muted font-body">Claude is analyzing your question against the schema</p>
                                    </div>
                                    <Loader2 size={16} className="text-accent-gold animate-spin ml-auto" />
                              </div>
                        </Card>
                  )}

                  {/* ── AI suggestions (ambiguous query) ── */}
                  {!isLoading && aiResponse?.type === 'suggestions' && (
                        <Card>
                              <CardHeader>
                                    <CardTitle>Did you mean…</CardTitle>
                                    <Badge variant="gold">Clarify</Badge>
                              </CardHeader>
                              <div className="space-y-2">
                                    {aiResponse.suggestions?.map((s, i) => (
                                          <button key={i} onClick={() => handleSuggestionClick(s.query)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-bg-border hover:border-accent-gold/30 hover:bg-accent-gold/5 text-left transition-all group">
                                                <span className="w-6 h-6 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center shrink-0 text-accent-purple font-mono text-xs">
                                                      {i + 1}
                                                </span>
                                                <span className="text-sm font-body text-ink-secondary group-hover:text-ink-primary transition-colors">
                                                      {s.query}
                                                </span>
                                                <ChevronRight size={13} className="text-ink-faint ml-auto shrink-0 group-hover:text-accent-gold transition-colors" />
                                          </button>
                                    ))}
                              </div>
                        </Card>
                  )}

                  {/* ── Error state ── */}
                  {(aiState === 'error' || aiResponse?.type === 'error') && (
                        <Card>
                              <div className="flex items-start gap-3 py-2">
                                    <div className="w-8 h-8 rounded-lg bg-accent-red/10 border border-accent-red/20 flex items-center justify-center shrink-0">
                                          <AlertCircle size={14} className="text-accent-red" />
                                    </div>
                                    <div>
                                          <p className="text-sm font-body text-accent-red font-medium">Query failed - Model: {model}</p>
                                          <p className="text-xs text-ink-muted font-body mt-0.5">
                                                {execError ?? aiResponse?.error ?? 'An unknown error occurred'}
                                          </p>
                                          {generatedSQL && (
                                                <p className="text-xs text-ink-faint font-mono mt-2 bg-bg-hover rounded px-2 py-1 border border-bg-border">
                                                      {generatedSQL}
                                                </p>
                                          )}
                                    </div>
                              </div>
                        </Card>
                  )}

                  {/* ── Results ── */}
                  {aiState === 'done' && result && (
                        <>
                              {/* Query metadata bar */}
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                          <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
                                                <span className="text-xs font-body text-ink-muted">
                                                      {fmt(result.rowCount)} {result.rowCount === 1 ? 'result' : 'results'}
                                                      <span className="text-ink-faint"> · {result.executionMs}ms</span>
                                                </span>
                                          </div>
                                          {aiResponse?.explanation && (
                                                <span className="text-xs font-body text-ink-secondary hidden sm:block">
                                                — {aiResponse.explanation}
                                                </span>
                                          )}
                                    </div>
                                    <button onClick={() => setShowSQL(!showSQL)} className="text-xs font-mono text-ink-muted hover:text-accent-gold transition-colors border border-bg-border rounded-lg px-2.5 py-1 hover:border-accent-gold/30" >
                                          {showSQL ? 'Hide SQL' : 'View SQL'}
                                    </button>
                              </div>

                              {/* Generated SQL */}
                              {showSQL && generatedSQL && (
                                    <Card>
                                          <CardHeader>
                                                <CardTitle>Generated SQL</CardTitle>
                                                <Badge variant="teal">Read-only · validated</Badge>
                                          </CardHeader>
                                          <pre className="text-xs font-mono text-ink-secondary bg-bg-hover rounded-lg p-4 overflow-x-auto border border-bg-border leading-relaxed whitespace-pre-wrap">
                                                {generatedSQL}
                                          </pre>
                                    </Card>
                              )}

                              {/* Results table */}
                              <Card>
                                    <div className="overflow-x-auto">
                                          <table className="w-full">
                                                <thead>
                                                      <tr className="border-b border-bg-border">
                                                            {result.columns.map((col) => (
                                                                  <th key={col} className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted whitespace-nowrap">
                                                                        {col.replace(/_/g, ' ')}
                                                                  </th>
                                                            ))}
                                                      </tr>
                                                </thead>
                                                <tbody>
                                                      {result.rows.map((row, i) => (
                                                            <tr key={i} className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors">
                                                            {result.columns.map((col) => {
                                                                  const val = row[col]
                                                                  const currency = isCurrencyCol(col)
                                                                  const isFirst = col === result.columns[0]
                                                                  return (
                                                                        <td key={col} className="py-2.5 pr-4 whitespace-nowrap">
                                                                              <span className={cn('text-xs font-mono', currency ? 'text-accent-gold font-medium' : '', isFirst ? 'text-ink-primary font-body' : 'text-ink-secondary')}>
                                                                                    {formatCellValue(col, val)}
                                                                              </span>
                                                                        </td>
                                                                  )
                                                            })}
                                                            </tr>
                                                      ))}
                                                </tbody>
                                          </table>
                                          {result.rows.length === 0 && <EmptyState message="No results found for this query" />}
                                    </div>
                              </Card>
                        </>
                  )}

                  </main>
            </div>
      )
}

// ── Search form sub-component ────────────────────────────────────────────────
function SearchForm({input, model, isLoading, inputRef, onInput, onSubmit, onClear, onModelChange}: { input: string, model: string,  isLoading: boolean, inputRef: React.RefObject<HTMLInputElement>, onInput: (v: string) => void, onSubmit: (e?: React.FormEvent) => void, onClear: () => void, onModelChange: (model: string) => void }) {
      return (
      <div className="flex flex-col items-center gap-4">
            <div className="text-center">
                  <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-gradient-gold">
                        Search Engine
                  </h1>
                  <p className="text-ink-muted text-sm font-body mt-1">
                        Ask anything about your sales data in plain English
                  </p>
            </div>

            <form onSubmit={onSubmit} className="w-full max-w-2xl">
                  <div className="flex items-center gap-3 bg-bg-card border border-accent-gold/30 rounded-full px-4 py-3 focus-within:border-accent-gold/60 transition-all shadow-md shadow-accent-gold/10">
                        {isLoading
                              ? <Loader2 size={18} className="text-accent-gold animate-spin shrink-0" />
                              : <Search size={18} className="text-accent-gold shrink-0" />
                        }
                        <input
                              ref={inputRef}
                              type="text"
                              value={input}
                              onChange={(e) => onInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSubmit()}
                              placeholder="e.g. what did Ali buy last month, top selling items by profit…"
                              className="flex-1 bg-transparent text-base font-body text-ink-primary placeholder:text-ink-faint outline-none"
                              disabled={isLoading}
                        />
                        {input && !isLoading && (
                              <button type="button" onClick={onClear} className="text-ink-faint hover:text-ink-secondary transition-colors">
                                    <X size={15} />
                              </button>
                        )}
                        <button type="submit" disabled={!input.trim() || isLoading} className="px-4 py-2 rounded-full bg-accent-gold/15 border border-accent-gold/30 text-accent-gold text-xs font-mono font-medium hover:bg-accent-gold/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                              {isLoading ? 'Thinking…' : 'Search ↵'}
                        </button>
                  </div>
            </form>


      </div>
      )
}

// ── Suggestions panel ────────────────────────────────────────────────────────
function SuggestionsPanel({ suggestions, status, onSelect, onReload }: { suggestions: Suggestion[], status: SuggestionsStatus, onSelect: (query: string) => void, onReload: () => void }) {
      return (
            <div>
                  <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-body uppercase tracking-widest text-ink-muted">Try asking</p>
                        <button
                              onClick={onReload}
                              disabled={status === 'loading'}
                              className="flex items-center gap-1.5 text-xs font-body text-ink-muted hover:text-accent-gold transition-colors disabled:opacity-40"
                        >
                              <RefreshCw size={11} className={status === 'loading' ? 'animate-spin' : ''} />
                              {status === 'loading' ? 'Generating…' : 'Refresh'}
                        </button>
                  </div>
            
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Skeleton placeholders while AI is loading (only on first load, fallbacks show instantly) */}
                        {status === 'loading' && suggestions === FALLBACK_SUGGESTIONS
                        ? Array.from({ length: 8 }).map((_, i) => (
                              <div key={i} className="h-[52px] rounded-xl border border-bg-border bg-bg-card animate-pulse" />
                        ))
                        : suggestions.map((ex) => (
                              <button
                                    key={ex.query}
                                    onClick={() => onSelect(ex.query)}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-bg-border bg-bg-card hover:border-accent-gold/30 hover:bg-accent-gold/5 text-left transition-all group"
                              >
                                    <span className="w-6 h-6 rounded-lg bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center shrink-0">
                                          <TrendingUp size={11} className="text-accent-gold" />
                                    </span>
                                    <span className="text-xs font-body text-ink-secondary group-hover:text-ink-primary transition-colors line-clamp-2">
                                          {ex.label}
                                    </span>
                                    <ChevronRight size={11} className="text-ink-faint ml-auto shrink-0 group-hover:text-accent-gold transition-colors" />
                              </button>
                              ))
                  }
                  </div>
            
                  {status === 'error' && (
                  <p className="text-[11px] font-body text-ink-faint mt-2">
                        Showing default suggestions — AI generation failed.{' '}
                        <button onClick={onReload} className="text-accent-gold hover:underline">Try again</button>
                  </p>
                  )}
            </div>
      )
}