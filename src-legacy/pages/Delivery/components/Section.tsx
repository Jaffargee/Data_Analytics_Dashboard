import { Section } from "../types";
import { cn } from '@/lib/utils'

export default function SectionCard({ id, title, icon: Icon, children, active, onActivate }: Section) {
      return (
            <div id={id} className="scroll-mt-6">
                  <button type="button" onClick={onActivate} className="w-full flex items-center gap-3 mb-4 group">
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                              active ? "bg-accent-gold/20 border border-accent-gold/30" : "bg-bg-hover border border-bg-border group-hover:border-accent-gold/20")}>
                              <Icon size={14} className={active ? "text-accent-gold" : "text-ink-muted"} />
                        </div>
                        <h3 className={cn("font-display font-semibold text-sm uppercase tracking-widest transition-colors",
                              active ? "text-accent-gold" : "text-ink-secondary group-hover:text-ink-primary")}>{title}</h3>
                        <div className="flex-1 h-px bg-bg-border" />
                  </button>
                  <div className="space-y-4">{children}</div>
            </div>
      )
}