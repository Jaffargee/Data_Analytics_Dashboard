import { ArrowUpDown } from "lucide-react";

type SortKey = "total_revenue" | "total_qty_sold" | "margin_pct" | "times_sold" | "gross_profit" | "selling_price" | "cost_price";


export const SortBtn = ({ k, label, sortKey, toggleSort }: { k: SortKey; label: string, sortKey?: SortKey, toggleSort?: (k: SortKey) => void }) => (
      <button onClick={() => toggleSort?.(k)} className={`flex items-center gap-1 text-xs font-body uppercase tracking-wider transition-colors ${ sortKey === k ? "text-accent-gold" : "text-ink-muted hover:text-ink-secondary"}`}>
                  {label}
                  <ArrowUpDown size={10} className={sortKey === k ? "text-accent-gold" : "text-ink-faint"} />
      </button>
);