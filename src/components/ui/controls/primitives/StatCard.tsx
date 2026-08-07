import { cn } from '@/lib/utils';
import { accentMap } from "./constants";
import { StatCardProps } from "./types";

export default function StatCard({
      label,
      value,
      sub,
      icon,
      trend,
      accent = 'gold',
      delay = 0,
}: StatCardProps) {
      const accentKey = accent === 'gold' || accent === 'teal' || accent === 'red' || accent === 'purple'
            ? accent
            : 'gold';
      const a = accentMap[accentKey];
      return (
            <div className={cn('rounded-2xl border p-5 flex flex-col gap-3 animate-fade-up opacity-0-init transition-all duration-300 card-glow', 'bg-bg-card', a.border)}
                  style={{
                        animationDelay: `${delay}ms`,
                        animationFillMode: 'forwards',
                  }}
            >
                  <div className="flex items-center justify-between">
                        <span className="font-body text-xs uppercase tracking-widest text-ink-muted">
                              {label}
                        </span>
                        {icon && (
                              <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center', a.bg, a.text)}>{icon}</span>
                        )}
                  </div>
                  <div>
                        <span className={cn('font-displa text-2xl font-bold', a.text)}>{value}</span>
                        {sub && (
                              <p className="text-ink-muted text-xs mt-1 font-body">{sub}</p>
                        )}
                  </div>
                  {trend !== undefined && (
                        <div
                              className={cn(
                                    'text-xs font-mono',
                                    trend >= 0
                                          ? 'text-accent-teal'
                                          : 'text-accent-red'
                              )}
                        >
                              {trend >= 0 ? '▲' : '▼'}{' '}
                              {Math.abs(trend).toFixed(1)}% vs last period
                        </div>
                  )}
            </div>
      );
}
