import { TopBar } from '@/components/ui/TopBar'
import { ArrowUp, Loader2, PlusIcon, Square, X } from 'lucide-react'
import { llm_query } from '@/lib/llm_query'
import { crb_llm_query } from '@/lib/crb_llm_query'
import { parseLLMContent, renderTokens } from '@/lib/llm_parser';
import React, { useEffect, useRef } from 'react'


export default function AIDataAnalyticsChat() {

      const [input, setInput ] = React.useState('')
      const [isLoading, setIsLoading] = React.useState(false)
      const inputRef = React.useRef<HTMLInputElement>(null)
      const [messages, setMessages] = React.useState<{id: number, message: React.ReactNode[] | string}[]>([])

      const scrollRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
            if (scrollRef.current) {
                  // Set the scroll position to the total height of the content
                  scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
      }, [messages]); // Runs every time messages update

      const handleOnSubmit = async (e?: React.FormEvent) => {
            e?.preventDefault()
            setMessages((prev) => [...prev, { id: messages.length, message: input }])
            setInput('')
            setIsLoading(true)
            try {
                  const llm_res = await crb_llm_query(input, '')
                  if (llm_res) {
                        const tokens = parseLLMContent(llm_res, { enableLinks: true });
                        setMessages((prev) => [...prev, { id: messages.length + 1, message: renderTokens(tokens) }])
                  }
            } catch (err: any) {
                  setMessages((prev) => [...prev, { id: messages.length + 1, message: "Sorry, I couldn't process that request. \n " + err.message }])
            } finally {
                  setIsLoading(false)
            }
      }

      return (
            <div className="flex flex-col h-screen">
                  <TopBar title="Search" subtitle="Natural language queries powered by AI" />

                  <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">
                              <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-2 pb-4">
                                    {
                                          messages.map((message) => (
                                                message.id % 2 == 0 ? 
                                                <MessageBubble key={message.id} id={message.id} message={message.message as string} /> : 
                                                <ResponseMessageBubble key={message.id} id={message.id} message={message.message as React.ReactNode[]} />))
                                    }
                              </div>
                        </div>
                        <div className="flex flex-row w-full relative items-center justify-center">
                              <ChatInput input={input} isLoading={isLoading} inputRef={inputRef} onInput={setInput} onSubmit={handleOnSubmit} onClear={() => setInput('')}  />
                        </div>
                  </main>
            </div>
      )
}

function MessageBubble({ id, message }: { id: number, message: string }) {
      return (
            <div data-id={id} key={id} className="flex pt-[34px] w-full relative flex-col pb-[16px] items-end">
                  <div className="flex flex-col w-full relative">
                        <div className="block max-w-[calc(100% - 88px)] border border-accent-gold/30 rounded-2xl rounded-tr-none text-ink-primary px-4 py-2 text-md relative bg-accent-gold/30 word-break white-space">
                              {message}
                        </div>
                  </div>
            </div>
      )
}

function ResponseMessageBubble({ id, message }: { id: number, message: React.ReactNode[] }) {
      return (
            <div data-id={id} key={id} className="flex pt-2 pb-4 w-full relative flex-col">
                  <div className="flex flex-col w-full relative">
                        <div className="block text-ink-primary text-lg relative" style={{ lineHeight: "28px" }}>
                              {message}
                        </div>
                  </div>
            </div>
      )
}

// ── Search form sub-component ────────────────────────────────────────────────
function ChatInput({input, isLoading, inputRef, onInput, onSubmit, onClear,}: { input: string, isLoading: boolean, inputRef: React.RefObject<HTMLInputElement>, onInput: (v: string) => void, onSubmit: (e?: React.FormEvent) => void, onClear: () => void }) {
      return (
      <div className="flex flex-col items-center justify-center pb-4 gap-4 relative bottom-4 left-0 right-0 w-full">
            <form onSubmit={onSubmit} className="w-full max-w-2xl">
                  <div className="flex items-center gap-3 bg-bg-card border border-accent-gold/20 rounded-2xl px-2 py-2 focus-within:border-accent-gold/60 transition-all shadow-lg">
                        <div className="flex flex-col w-full h-full relative">
                              <div className="flex h-full w-full relative">
                                    <textarea
                                          // ref={inputRef}
                                          // type="text"
                                          value={input}
                                          onChange={(e) => onInput(e.target.value)}
                                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSubmit()}
                                          placeholder="Ask anything about your data for Analytics..."
                                          className="flex-1 bg-transparent p-2 resize-none max-h-[30rem] text-lg font-body text-ink-primary placeholder:text-ink-faint outline-none"
                                          disabled={isLoading}
                                          rows={10}
                                          style={{fieldSizing: 'content'}}
                                    />
                                    {
                                          input && 
                                          <button type="button" onClick={onClear} className="absolute top-0 right-0 text-ink-faint hover:bg-accent-gold/30 rounded-full p-2 hover:text-ink-secondary transition-colors">
                                                <X size={20} className="text-accent-gold shrink-0" />
                                          </button>
                                    }
                              </div>
                              <div className="flex flex-row w-full items-center justify-between relative">
                                    {isLoading
                                          ? <Loader2 size={18} className="text-accent-gold animate-spin shrink-0" />
                                          : (
                                                <button type="button" onClick={onClear} className="text-ink-faint hover:bg-accent-gold/30 rounded-full p-2 hover:text-ink-secondary transition-colors">
                                                      <PlusIcon size={20} className="text-accent-gold shrink-0" />
                                                </button>
                                          )
                                          
                                    }
                                    {
                                          isLoading ? (
                                                <button type="button" onClick={onSubmit} className="text-ink-faint hover:bg-accent-gold/30 bg-accent-gold/20 border-accent-gold/30 border rounded-full p-2 hover:text-ink-secondary transition-colors">
                                                      <Square size={20} className="text-accent-gold shrink-0" />
                                                </button>
                                          ) : (
                                                <button type="button" onClick={onSubmit} className="text-ink-faint hover:bg-accent-gold/30 bg-accent-gold/20 border-accent-gold/30 border rounded-full p-2 hover:text-ink-secondary transition-colors">
                                                      <ArrowUp size={20} className="text-accent-gold shrink-0" />
                                                </button>
                                          )
                                    }
                              </div>
                        </div>
                  </div>
            </form>
      </div>
      )
}
