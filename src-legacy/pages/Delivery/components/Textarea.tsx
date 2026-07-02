import { TextareProps } from "../types";

export default function Textarea({ value, onChange, placeholder, rows = 3 }: TextareProps) {
	return (
		<textarea value={value} onChange={e => onChange(e.target.value)}
			placeholder={placeholder} rows={rows}
			className="w-full bg-bg-hover border border-bg-border rounded-xl px-3 py-2.5 text-sm font-body text-ink-primary placeholder:text-ink-faint outline-none focus:border-accent-gold/50 transition-all resize-none"
		/>
	)
}