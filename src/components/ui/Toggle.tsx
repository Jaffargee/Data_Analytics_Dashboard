import React from 'react';
import { cn } from '@/lib/utils';

export default function Toggle({
      checked,
      onChange,
      label,
      description,
}: {
      checked: boolean;
      onChange: (v: boolean) => void;
      label: string;
      description?: string;
}) {
      return (
            <button
                  type="button"
                  onClick={() => onChange(!checked)}
                  className="flex items-center justify-between w-full p-3 rounded-xl border border-bg-border bg-bg-hover hover:border-accent-gold/20 transition-all group"
            >
                  <div className="text-left">
                        <p className="text-sm font-body text-ink-primary">
                              {label}
                        </p>
                        {description && (
                              <p className="text-xs text-ink-muted font-body mt-0.5">
                                    {description}
                              </p>
                        )}
                  </div>
                  <div
                        className={cn(
                              'relative w-10 h-5.5 rounded-full transition-all duration-200 flex-shrink-0 ml-4',
                              'h-[22px]',
                              checked
                                    ? 'bg-accent-gold'
                                    : 'bg-bg-muted border border-bg-border'
                        )}
                  >
                        <div
                              className={cn(
                                    'absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200',
                                    checked ? 'left-[22px]' : 'left-[3px]'
                              )}
                        />
                  </div>
            </button>
      );
}
