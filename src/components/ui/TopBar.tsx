import React from "react";
import { Search, Bell, RefreshCw } from "lucide-react";
import { today } from "@/lib/utils";

interface TopBarProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
}

export function TopBar({ title, subtitle, onRefresh }: TopBarProps) {
  return (
    <header className="h-14 border-b border-bg-border bg-bg-panel/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="font-display font-bold text-base text-ink-primary leading-tight">{title}</h1>
        {subtitle && <p className="text-[11px] text-ink-muted font-body">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Date chip */}
        <span className="text-[11px] font-mono text-ink-muted bg-bg-hover border border-bg-border px-2.5 py-1 rounded">
          {new Date().toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
        </span>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="w-8 h-8 rounded-lg border border-bg-border text-ink-muted hover:text-ink-primary hover:bg-bg-hover flex items-center justify-center transition-all"
          >
            <RefreshCw size={13} />
          </button>
        )}

        <button className="w-8 h-8 rounded-lg border border-bg-border text-ink-muted hover:text-ink-primary hover:bg-bg-hover flex items-center justify-center transition-all">
          <Bell size={13} />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-accent-gold/20 border border-accent-gold/30 flex items-center justify-center">
          <span className="text-accent-gold font-display font-bold text-xs">T</span>
        </div>
      </div>
    </header>
  );
}
