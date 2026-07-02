import { useEffect, useRef, useState } from "react"
import { CustomerSearchProps, CustomerSuggestion } from "../types"
import { Loader2, Search } from "lucide-react"
import { supabase } from '@/lib/supabase';
import Input from '@/components/ui/Input';

export default function CustomerSearch({ value, onSelect }: CustomerSearchProps) {

	const [query, setQuery]           = useState(value)
	const [results, setResults]       = useState<CustomerSuggestion[]>([])
	const [open, setOpen]             = useState(false)
	const [loading, setLoading]       = useState(false)
	const debounce                    = useRef<ReturnType<typeof setTimeout>>()
	const ref                         = useRef<HTMLDivElement>(null)

	useEffect(() => { setQuery(value) }, [value])

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [])

	const search = (q: string) => {
		setQuery(q)
		clearTimeout(debounce.current)
		if (!q.trim()) { setResults([]); setOpen(false); return }
		debounce.current = setTimeout(async () => {
			setLoading(true)
			const { data } = await supabase
				.from('customers')
				.select('id, name, pos_customer_id, company_name')
				.or(`name.ilike.%${q}%,company_name.ilike.%${q}%`)
				.limit(8)
			setResults((data ?? []) as CustomerSuggestion[])
			setOpen(true)
			setLoading(false)
		}, 280)
	}

	return (
		<div ref={ref} className="relative">
			<div className="flex hidden items-center bg-bg-hover border border-bg-border rounded-xl overflow-hidden focus-within:border-accent-gold/50 transition-all">
				<span className="pl-3 text-ink-faint flex items-center shrink-0"><Search size={13} /></span>
				<input
					value={query}
					onChange={e => search(e.target.value)}
					onFocus={() => query && setOpen(true)}
					placeholder="Search customer by name…"
					className="flex-1 bg-transparent px-3 py-2.5 text-sm font-body text-ink-primary placeholder:text-ink-faint outline-none"
				/>
				{loading && <span className="pr-3"><Loader2 size={13} className="animate-spin text-ink-muted" /></span>}
			</div>

			<Input 
				prefix={<span className="text-ink-faint flex items-center shrink-0"><Search size={18} /></span>}  
				suffix={loading && <span className=""><Loader2 size={18} className="animate-spin text-accent-gold" /></span>}
				value={query} 
				onFocus={() => query && setOpen(true)}
				onChange={(v: string) => search(v)} 
				placeholder="Search customer by name…"  
				className="hidden" 
			/>
			
			{open && results.length > 0 && (
				<div className="absolute z-50 top-full mt-1 left-0 right-0 bg-bg-panel border border-bg-border rounded-xl shadow-2xl overflow-hidden">
					{results.map(c => (
						<button key={c.id} type="button"
							onClick={() => { onSelect(c); setQuery(c.name); setOpen(false) }}
							className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-bg-hover text-left transition-colors border-b border-bg-border/50 last:border-0">
							<div className="w-7 h-7 rounded-lg bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center shrink-0">
								<span className="text-[10px] font-display font-bold text-accent-gold">{c.name?.slice(0,1)}</span>
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-xs font-body text-ink-primary truncate">{c.name}</p>
								{c.company_name && <p className="text-[10px] font-body text-ink-muted truncate">{c.company_name}</p>}
							</div>
							<span className="text-[10px] font-mono text-ink-faint shrink-0">#{c.pos_customer_id}</span>
						</button>
					))}
				</div>
			)}

		</div>
	)
}
