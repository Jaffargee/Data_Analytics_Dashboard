import React from "react";
import { cn } from '@/lib/utils';

export interface ToggleProps {
      checked: boolean;
      onChange: (value: boolean) => void;
      label: string;
      description?: string;
      disabled?: boolean;
}

export default function Toggle({
      checked,
      onChange,
      label,
      description,
      disabled,
}: ToggleProps) {
      return (
            <div className="flex items-center justify-between w-full gap-4">
                  {/* Label area — not part of the interactive target */}
                  <div className="text-left min-w-0">
                        <p className="text-[14px] font-body text-ink-primary leading-snug">
                              {label}
                        </p>
                        {description && (
                              <p className="text-[12px] text-ink-muted font-body mt-[2px] leading-snug">
                                    {description}
                              </p>
                        )}
                  </div>

                  {/* Toggle pill — sole interactive element */}
                  <button
                        type="button"
                        role="switch"
                        aria-checked={checked}
                        disabled={disabled}
                        onClick={() => onChange(!checked)}
                        className={cn(
                              "relative flex-shrink-0 w-[40px] h-[22px] rounded-full transition-colors duration-200 outline-none",
                              "focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                              checked
                                    ? "bg-accent-gold"
                                    : "bg-bg-muted border border-bg-border",
                              disabled && "opacity-40 cursor-not-allowed"
                        )}
                  >
                        <span
                              className={cn(
                                    "absolute top-[3px] w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-all duration-200",
                                    checked ? "left-[21px]" : "left-[3px]"
                              )}
                        />
                  </button>
            </div>
      );
}