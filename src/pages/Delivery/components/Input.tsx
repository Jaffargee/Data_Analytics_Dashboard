import React, { useId } from "react";
import { AlertCircle } from "lucide-react";
import { InputProps } from "../types";
import { cn } from '@/lib/utils'

export default function Input({ 
      value, 
      onChange, 
      placeholder, 
      type = 'text', 
      prefix, 
      suffix, 
      error, 
      disabled 
}: InputProps) {
      const inputId = useId();
      const errorId = useId();
      const isFloated = value !== undefined && value !== null && value !== '';

      return (
            <div className="w-full font-body">
                  {/* Input Container Box */}
                  <div className={cn(
                        "relative flex items-center bg-transparent border rounded-[4px] h-[48px] transition-all duration-200 box-border",
                        error 
                              ? "border-accent-red focus-within:border-accent-red focus-within:[box-shadow:0_0_0_1px_theme(colors.accent-red)]" 
                              : "border-bg-border focus-within:border-accent-gold/50 focus-within:[box-shadow:0_0_0_1px_theme(colors.accent-gold/50)]",
                        disabled && "opacity-40 cursor-not-allowed bg-black/[0.02]"
                  )}>
                        
                        {/* Prefix Icon/Text */}
                        {prefix && (
                              <span className="pl-[12px] pr-[8px] text-ink-faint flex items-center justify-center shrink-0 h-full self-center select-none">
                                    <span className="w-[20px] h-[20px] flex items-center justify-center [&>svg]:w-[20px] [&>svg]:h-[20px]">
                                          {prefix}
                                    </span>
                              </span>
                        )}

                        {/* Interactive Input Area */}
                        <div className="relative flex-1 h-full flex items-center">
                              <input
                                    id={inputId}
                                    type={type} 
                                    value={value} 
                                    disabled={disabled}
                                    onChange={e => onChange(e.target.value)} 
                                    placeholder=" " // Required space character for pure CSS floating mechanics
                                    aria-invalid={error ? "true" : "false"}
                                    aria-describedby={error ? errorId : undefined}
                                    className={cn(
                                          "peer w-full bg-transparent h-full text-[16px] tracking-[0.5px] text-ink-primary outline-none border-none p-0 m-0 leading-none [appearance:none] [WebkitAppearance:none]",
                                          prefix ? "pl-0" : "pl-[16px]",
                                          suffix ? "pr-0" : "pr-[16px]"
                                    )}
                              />

                              {/* Google Floating Label Component */}
                              <label
                                    htmlFor={inputId}
                                    className={cn(
                                          "absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 origin-top-left text-ink-faint text-[16px] tracking-[0.5px] leading-none select-none",
                                          
                                          // Left alignment rule depending on presence of prefix
                                          prefix ? "left-0" : "left-[16px]",
                                          
                                          // CSS Floated States (On Input Focus OR when value is populated)
                                          "peer-focus:-top-[0px] peer-focus:text-[12px] peer-focus:bg-black peer-focus:px-[4px] peer-focus:tracking-[0.4px]",
                                          isFloated ? "-top-[0px] text-[12px] bg-black px-[4px] tracking-[0.4px]" : "",
                                          
                                          // Dynamic Label Coloring states
                                          error 
                                                ? "peer-focus:text-accent-red" 
                                                : "peer-focus:text-accent-gold/70",
                                          
                                          // Correct left offsetting adjustment to align text neatly when pulled up over a prefix line
                                          prefix && (isFloated ? "-left-[28px]" : "left-0"),
                                          prefix && "peer-focus:-left-[28px]"
                                    )}
                              >
                                    {placeholder}
                              </label>
                        </div>

                        {/* Suffix Icon/Text */}
                        {suffix && (
                              <span className="pl-[8px] pr-[12px] text-ink-faint flex items-center justify-center shrink-0 h-full self-center select-none">
                                    <span className="w-[20px] h-[20px] flex items-center justify-center [&>svg]:w-[20px] [&>svg]:h-[20px]">
                                          {suffix}
                                    </span>
                              </span>
                        )}
                  </div>

                  {/* Accessibility Compliant Error Subtext */}
                  {error && (
                        <p 
                              id={errorId}
                              className="flex items-center gap-[4px] mt-[4px] pl-[16px] text-[12px] leading-[16px] tracking-[0.4px] text-accent-red role='alert'"
                        >
                              <AlertCircle size={16} className="shrink-0" />
                              {error}
                        </p>
                  )}
            </div>
      )
}