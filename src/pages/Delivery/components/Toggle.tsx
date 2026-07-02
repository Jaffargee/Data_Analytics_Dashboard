// import { ToggleProps } from "../types";
// import { cn } from '@/lib/utils'

// export default function Toggle({ checked, onChange, label, description }: ToggleProps) {
//       return (
//             <button type="button" onClick={() => onChange(!checked)}
//                   className="flex items-center justify-between w-full p-3 rounded-xl border border-bg-border bg-bg-hover hover:border-accent-gold/20 transition-all">
//                   <div className="text-left">
//                         <p className="text-sm font-body text-ink-primary">{label}</p>
//                         {description && <p className="text-[11px] text-ink-muted font-body mt-0.5">{description}</p>}
//                   </div>
//                   <div className={cn("relative flex-shrink-0 ml-4 w-10 h-[22px] rounded-full transition-all duration-200",
//                         checked ? "bg-accent-gold" : "bg-bg-muted border border-bg-border")}>
//                         <div className={cn("absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200",
//                               checked ? "left-[22px]" : "left-[3px]")} />
//                   </div>
//             </button>
//       )
// }

import React, { useId } from "react";
import { cn } from '@/lib/utils';

interface ToggleProps {
      checked: boolean;
      onChange: (checked: boolean) => void;
      label: string;
      description?: string;
      disabled?: boolean;
}

export default function Toggle({
      checked,
      onChange,
      label,
      description,
      disabled = false,
}: ToggleProps) {
      const toggleId = useId();
      const labelId = useId();
      const descriptionId = useId();

      return (
            <div className={cn(
                  "w-full bg-[#161618] border border-bg-border rounded-[8px] p-[16px] flex items-center justify-between transition-all duration-200 box-border font-body",
                  disabled && "opacity-40 cursor-not-allowed select-none"
            )}>
                  {/* Left-aligned Meta Details Header */}
                  <div className="flex flex-col gap-[2px] pr-[16px]">
                        <span 
                              id={labelId}
                              className="text-[14px] font-medium tracking-[0.3px] text-white leading-normal"
                        >
                              {label}
                        </span>
                        {description && (
                              <span 
                                    id={descriptionId}
                                    className="text-[12px] tracking-[0.2px] text-ink-muted leading-normal"
                              >
                                    {description}
                              </span>
                        )}
                  </div>

                  {/* Right-aligned Fluent UI Switch Input Container */}
                  <button
                        id={toggleId}
                        type="button"
                        role="switch"
                        aria-checked={checked}
                        aria-labelledby={labelId}
                        aria-describedby={description ? descriptionId : undefined}
                        disabled={disabled}
                        onClick={() => onChange(!checked)}
                        className={cn(
                              "relative inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out outline-none border border-transparent focus-visible:ring-1 focus-visible:ring-accent-gold/50",
                              checked ? "bg-accent-gold" : "bg-[#2d2d30]",
                              disabled && "cursor-not-allowed"
                        )}
                  >
                        {/* Interactive Handle Knob */}
                        <span
                              className={cn(
                                    "pointer-events-none block h-[14px] w-[14px] rounded-full transition-transform duration-200 ease-in-out shadow-[0_1px_3px_rgba(0,0,0,0.4)]",
                                    checked 
                                          ? "translate-x-[18px] bg-black" 
                                          : "translate-x-[3px] bg-[#96969a]"
                              )}
                        />
                  </button>
            </div>
      );
}