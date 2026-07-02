import { LabelProps } from "../types";

export default function Label({ children, required }: LabelProps) {
      return (
            <label className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-ink-muted mb-1.5">
                  {children}{required && <span className="text-accent-gold">*</span>}
            </label>
      )
}