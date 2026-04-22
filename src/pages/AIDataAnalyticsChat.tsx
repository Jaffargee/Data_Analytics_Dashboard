import React, { useEffect, useRef } from 'react'
import { QueryResponse } from '@/types'
import { TopBar } from '@/components/ui/TopBar'
import { ArrowUp, Loader2, PlusIcon, Square, X } from 'lucide-react'
import { parseLLMContent, renderTokens } from '@/lib/llm_parser'
import { llm_query } from '@/lib/llm_query'
import { gpt_llm_query } from '@/lib/gpt_llm_query'
import { DATA_ANALYTICS_CHAT_SYSTEM_INSTRUCTION } from '@/constants'
import { executeSQL } from '@/lib/llm_utils'

// ── System instructions ──────────────────────────────────────────────────────

// Pass 1: Gemini reads the user question → returns SQL as JSON
const SQL_GENERATION_INSTRUCTION = DATA_ANALYTICS_CHAT_SYSTEM_INSTRUCTION

// Pass 3: Gemini reads raw query results → returns human-readable markdown analysis
const ANALYSIS_INSTRUCTION = `
You are an expert business analyst for a Nigerian Point-of-Sale retail business.

You will receive a JSON object containing:
- "question": what the user originally asked
- "sql_ran": the SQL that was executed
- "explanation": brief description of what the query does
- "row_count": number of rows returned
- "columns": column names
- "rows": the actual data rows

Your job is to:
1. Summarise the data in clear, plain English directed at the business owner
2. Highlight the most important insights — top performers, anomalies, trends
3. Format all monetary values in NGN (₦) with commas e.g. ₦1,500,000
4. Use markdown for structure: headings, **bold key figures**, bullet lists
5. Keep it concise and actionable — no fluff
6. Add 1–2 short recommendations at the end if relevant

STRICT RULES:
- Do NOT mention SQL, databases, queries, columns, or any technical terms
- Do NOT say "based on the data" or "the results show" — just state the insight directly
- Speak as if you are a trusted analyst briefing the owner about their business
`.trim()

// ── Types ────────────────────────────────────────────────────────────────────
type MessageRole = 'user' | 'assistant' | 'error' | 'loading'

interface Message {
  id:      number
  role:    MessageRole
  content: string | React.ReactNode[]
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeAssistantMessage(markdown: string): Omit<Message, 'id'> {
  return {
    role:    'assistant',
    content: renderTokens(parseLLMContent(markdown, { enableLinks: true })),
  }
}

// ── Main component ───────────────────────────────────────────────────────────
export default function AIDataAnalyticsChat() {
  const [input,     setInput]     = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [messages,  setMessages]  = React.useState<Message[]>([
    {
      id:   0,
      ...makeAssistantMessage(
        "Hi! I'm your AI data analyst.\n\nAsk me anything about your **sales, products, customers, or stock** — in plain English and I'll pull the numbers and explain what they mean."
      ),
    },
  ])

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const append = (msg: Omit<Message, 'id'>) =>
    setMessages(prev => [...prev, { ...msg, id: prev.length }])

  const replaceLast = (msg: Omit<Message, 'id'>) =>
    setMessages(prev => [...prev.slice(0, -1), { ...msg, id: prev.length - 1 }])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const query = input.trim()
    if (!query || isLoading) return

    // Step 1 — show user message + loading placeholder
    append({ role: 'user',    content: query })
    append({ role: 'loading', content: '' })
    setInput('')
    setIsLoading(true)

    try {
      // ── Pass 1: Natural language → SQL JSON ──────────────────────────────
      const sqlRaw = await llm_query(query, SQL_GENERATION_INSTRUCTION)
      if (!sqlRaw) throw new Error('No response from AI. Please try again.')

      let queryResponse: QueryResponse
      try {
        const clean = sqlRaw.replace(/```json|```/g, '').trim()
        queryResponse = JSON.parse(clean)
      } catch {
        throw new Error('AI returned an unreadable response. Try rephrasing your question.')
      }

      // Handle ambiguous queries — show suggestion chips
      if (queryResponse.type === 'suggestions') {
        const md = [
          "I wasn't sure exactly what you meant. Did you mean one of these?\n",
          ...(queryResponse.suggestions ?? []).map(
            (s, i) => `${i + 1}. **${s.label}** — *${s.query}*`
          ),
        ].join('\n')
        replaceLast(makeAssistantMessage(md))
        return
      }

      // Handle error responses from the AI
      if (queryResponse.type === 'error' || !queryResponse.query?.sql) {
        throw new Error(queryResponse.error ?? "I couldn't build a query for that question.")
      }

      // ── Pass 2: Execute the SQL on Supabase ──────────────────────────────
      const queryResult = await executeSQL(queryResponse.query.sql)

      if (queryResult.rowCount === 0) {
        replaceLast(makeAssistantMessage(
          "I ran the query but found **no matching records**. The data might not exist yet, or try asking in a different way."
        ))
        return
      }

      // ── Pass 3: Results → human-readable analysis ─────────────────────────
      const payload = JSON.stringify({
        question:    query,
        sql_ran:     queryResponse.query.sql,
        explanation: queryResponse.query.explanation,
        row_count:   queryResult.rowCount,
        columns:     queryResult.columns,
        // Cap rows sent to Gemini — keeps context window lean and cost low
        rows:        queryResult.rows.slice(0, 50),
      }, null, 2)

      const analysis = await llm_query(payload, ANALYSIS_INSTRUCTION)
      if (!analysis) throw new Error('AI failed to analyse the results.')

      replaceLast(makeAssistantMessage(analysis))

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      replaceLast({ role: 'error', content: msg })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStop = () => {
    setIsLoading(false)
    replaceLast(makeAssistantMessage('_Stopped._'))
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar title="AI Analyst" subtitle="Ask anything about your data in plain English" />

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* ── Scrollable message list ── */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">
          <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-1 pb-6">
            {messages.map((msg) => {
              if (msg.role === 'user')    return <UserBubble    key={msg.id} message={msg.content as string} />
              if (msg.role === 'loading') return <LoadingBubble key={msg.id} />
              if (msg.role === 'error')   return <ErrorBubble   key={msg.id} message={msg.content as string} />
              return                             <AssistantBubble key={msg.id} content={msg.content as React.ReactNode[]} />
            })}
          </div>
        </div>

        {/* ── Sticky input bar ── */}
        <div className="flex-shrink-0 border-t border-bg-border bg-bg-base/80 backdrop-blur-md">
          <div className="w-full max-w-2xl mx-auto px-4 py-3">
            <ChatInput
              input={input}
              isLoading={isLoading}
              inputRef={inputRef}
              onInput={setInput}
              onSubmit={handleSubmit}
              onStop={handleStop}
              onClear={() => setInput('')}
            />
          </div>
        </div>

      </main>
    </div>
  )
}

// ── Bubble components ────────────────────────────────────────────────────────

function UserBubble({ message }: { message: string }) {
  return (
    <div className="flex justify-end pt-3">
      <div className="max-w-[75%] bg-accent-gold/20 border border-accent-gold/30 rounded-2xl rounded-tr-none px-4 py-2.5 text-sm font-body text-ink-primary leading-relaxed">
        {message}
      </div>
    </div>
  )
}

function AssistantBubble({ content }: { content: React.ReactNode[] }) {
  return (
    <div className="flex justify-start pt-3">
      {/* Prose styling for all markdown output from the AI */}
      <div className="w-full text-sm font-body text-ink-primary leading-7
        [&_strong]:font-semibold [&_strong]:text-ink-primary
        [&_em]:italic [&_em]:text-ink-secondary
        [&_h1]:font-display [&_h1]:text-lg  [&_h1]:font-bold    [&_h1]:mt-5 [&_h1]:mb-2
        [&_h2]:font-display [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2
        [&_h3]:font-display [&_h3]:text-sm  [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1
        [&_p]:mb-3 [&_p:last-child]:mb-0
        [&_ul]:list-disc   [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:space-y-1
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:space-y-1
        [&_code]:font-mono [&_code]:text-xs [&_code]:bg-bg-hover [&_code]:border [&_code]:border-bg-border [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-accent-gold
        [&_pre]:bg-bg-hover [&_pre]:border [&_pre]:border-bg-border [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:mb-3 [&_pre_code]:bg-transparent [&_pre_code]:border-none [&_pre_code]:p-0
        [&_blockquote]:border-l-2 [&_blockquote]:border-accent-gold/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-ink-secondary
        [&_hr]:border-bg-border [&_hr]:my-4
        [&_a]:text-accent-gold [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-accent-gold/80">
        {content}
      </div>
    </div>
  )
}

function LoadingBubble() {
  return (
    <div className="flex justify-start pt-3">
      <div className="flex items-center gap-2 text-ink-muted text-sm font-body">
        <Loader2 size={14} className="text-accent-gold animate-spin shrink-0" />
        <span>Thinking…</span>
      </div>
    </div>
  )
}

function ErrorBubble({ message }: { message: string }) {
  return (
    <div className="flex justify-start pt-3">
      <div className="max-w-[80%] bg-accent-red/10 border border-accent-red/20 rounded-2xl rounded-tl-none px-4 py-2.5 text-sm font-body text-accent-red leading-relaxed">
        {message}
      </div>
    </div>
  )
}

// ── Chat input ───────────────────────────────────────────────────────────────
function ChatInput({
  input, isLoading, inputRef, onInput, onSubmit, onStop, onClear,
}: {
  input:     string
  isLoading: boolean
  inputRef:  React.RefObject<HTMLTextAreaElement>
  onInput:   (v: string) => void
  onSubmit:  (e?: React.FormEvent) => void
  onStop:    () => void
  onClear:   () => void
}) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(e) }} className="w-full">
      <div className="flex flex-col bg-bg-card border border-accent-gold/20 rounded-2xl px-3 py-2 focus-within:border-accent-gold/50 transition-all shadow-lg">

        <div className="relative flex w-full">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => onInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit() }
            }}
            placeholder="Ask anything about your data for analytics..."
            className="flex-1 bg-transparent p-2 resize-none text-base font-body text-ink-primary placeholder:text-ink-faint outline-none max-h-48 overflow-y-auto"
            disabled={isLoading}
            rows={1}
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
          {input && !isLoading && (
            <button type="button" onClick={onClear}
              className="absolute top-1 right-1 text-ink-faint hover:bg-accent-gold/20 rounded-full p-1.5 hover:text-ink-secondary transition-colors">
              <X size={16} className="text-accent-gold" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          {isLoading
            ? <Loader2 size={17} className="text-accent-gold animate-spin ml-1" />
            : (
              <button type="button"
                className="text-ink-faint hover:bg-accent-gold/20 rounded-full p-1.5 hover:text-ink-secondary transition-colors">
                <PlusIcon size={17} className="text-accent-gold" />
              </button>
            )
          }

          {isLoading ? (
            <button type="button" onClick={onStop}
              title="Stop generating"
              className="bg-accent-gold/20 border border-accent-gold/30 hover:bg-accent-red/20 hover:border-accent-red/30 rounded-full p-1.5 transition-colors">
              <Square size={17} className="text-accent-gold" />
            </button>
          ) : (
            <button type="submit" disabled={!input.trim()}
              title="Send"
              className="bg-accent-gold/20 border border-accent-gold/30 hover:bg-accent-gold/30 rounded-full p-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <ArrowUp size={17} className="text-accent-gold" />
            </button>
          )}
        </div>

      </div>
    </form>
  )
}