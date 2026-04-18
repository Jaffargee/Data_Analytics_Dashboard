import React from "react";
import { cn } from "@/lib/utils";
import * as Progress from "@radix-ui/react-progress";
import * as Tooltip from "@radix-ui/react-tooltip";

// ── Card ────────────────────────────────────────────────────
export function Card({
  children, className, glow = false, style,
}: { children: React.ReactNode; className?: string; glow?: boolean; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        "bg-bg-card border border-bg-border rounded-xl p-5 transition-all duration-300",
        glow && "card-glow",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex items-center justify-between mb-5", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("font-display font-semibold text-sm uppercase tracking-widest text-ink-secondary", className)}>
      {children}
    </h3>
  );
}

// ── Stat Card ───────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  trend?: number;
  accent?: "gold" | "teal" | "red" | "purple";
  delay?: number;
}

const accentMap = {
  gold:   { text: "text-accent-gold",   bg: "bg-accent-gold/10",   border: "border-accent-gold/20" },
  teal:   { text: "text-accent-teal",   bg: "bg-accent-teal/10",   border: "border-accent-teal/20" },
  red:    { text: "text-accent-red",    bg: "bg-accent-red/10",    border: "border-accent-red/20" },
  purple: { text: "text-accent-purple", bg: "bg-accent-purple/10", border: "border-accent-purple/20" },
};

export function StatCard({ label, value, sub, icon, trend, accent = "gold", delay = 0 }: StatCardProps) {
  const a = accentMap[accent];
  return (
    <div
      className={cn(
        "rounded-xl border p-5 flex flex-col gap-3 animate-fade-up opacity-0-init transition-all duration-300 card-glow",
        "bg-bg-card", a.border
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className="flex items-center justify-between">
        <span className="font-body text-xs uppercase tracking-widest text-ink-muted">{label}</span>
        {icon && (
          <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center", a.bg, a.text)}>
            {icon}
          </span>
        )}
      </div>
      <div>
        <span className={cn("font-display text-2xl font-bold", a.text)}>{value}</span>
        {sub && <p className="text-ink-muted text-xs mt-1 font-body">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={cn("text-xs font-mono", trend >= 0 ? "text-accent-teal" : "text-accent-red")}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}% vs last period
        </div>
      )}
    </div>
  );
}

// ── Badge ───────────────────────────────────────────────────
type BadgeVariant = "gold" | "teal" | "red" | "purple" | "muted";
const badgeMap: Record<BadgeVariant, string> = {
  gold:   "bg-accent-gold/15 text-accent-gold border-accent-gold/30",
  teal:   "bg-accent-teal/15 text-accent-teal border-accent-teal/30",
  red:    "bg-accent-red/15 text-accent-red border-accent-red/30",
  purple: "bg-accent-purple/15 text-accent-purple border-accent-purple/30",
  muted:  "bg-bg-hover text-ink-secondary border-bg-border",
};

export function Badge({ children, variant = "muted" }: { children: React.ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-mono border", badgeMap[variant])}>
      {children}
    </span>
  );
}

// ── Skeleton ────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded bg-bg-hover", className)} />
  );
}

export function SkeletonCard() {
  return (
    <Card>
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-3 w-20" />
    </Card>
  );
}

// ── Progress Bar ────────────────────────────────────────────
export function ProgressBar({
  value, max, accent = "gold", className,
}: { value: number; max: number; accent?: "gold" | "teal" | "red" | "purple"; className?: string }) {
  const pct = max ? Math.min((value / max) * 100, 100) : 0;
  const colors = { gold: "bg-accent-gold", teal: "bg-accent-teal", red: "bg-accent-red", purple: "bg-accent-purple" };
  return (
    <Progress.Root
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-bg-border", className)}
      value={pct}
    >
      <Progress.Indicator
        className={cn("h-full rounded-full transition-all duration-700 ease-out", colors[accent])}
        style={{ transform: `translateX(-${100 - pct}%)` }}
      />
    </Progress.Root>
  );
}

// ── Tooltip wrapper ─────────────────────────────────────────
export function TooltipWrap({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-bg-panel border border-bg-border text-ink-secondary text-xs px-2.5 py-1.5 rounded-md shadow-xl font-body"
            sideOffset={5}
          >
            {label}
            <Tooltip.Arrow className="fill-bg-border" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

// ── Section header ──────────────────────────────────────────
export function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="font-display font-bold text-xl text-ink-primary">{title}</h2>
        {sub && <p className="text-ink-muted text-sm mt-0.5 font-body">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────
export function EmptyState({ message = "No data available" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-ink-faint gap-2">
      <span className="text-3xl">⬜</span>
      <p className="text-sm font-body">{message}</p>
    </div>
  );
}