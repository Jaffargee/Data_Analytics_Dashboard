import React, { useId } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from '@/lib/utils';
import { ERROR_TEXT, LABEL_FLOATED } from '@/types/ui/index';

export interface TextareaProps {
      value: string;
      onChange?: (value: string) => void;
      placeholder?: string;
      error?: string;
      disabled?: boolean;
      readOnly?: boolean;
      maxLength?: number;
      rows?: number;
      name?: string;
      id?: string;
      className?: string;
      textareaClassName?: string;
      onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
      onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}

export default function Textarea({
      value,
      onChange,
      placeholder,
      error,
      disabled,
      readOnly,
      maxLength,
      rows = 3,
      name,
      id: externalId,
      className,
      textareaClassName,
      onBlur,
      onFocus,
}: TextareaProps) {
      const internalId = useId();
      const textareaId = externalId ?? internalId;
      const errorId = useId();

      const isFloated = value !== '' && value !== undefined && value !== null;

      return (
            <div className={cn("w-full font-body", className)}>
                  <div className={cn(
                        "relative flex bg-transparent border rounded-[4px] transition-all duration-200 box-border overflow-visible",
                        error
                              ? "border-accent-red focus-within:border-accent-red focus-within:[box-shadow:0_0_0_1px_theme(colors.accent-red)]"
                              : "border-[#f0f0fa59] focus-within:border-accent-gold/50 focus-within:[box-shadow:0_0_0_1px_theme(colors.accent-gold/50)]",
                        disabled && "opacity-40 cursor-not-allowed",
                        readOnly && "cursor-default",
                  )}>
                        <div className="relative flex-1 flex overflow-visible z-10">
                              <textarea
                                    id={textareaId}
                                    name={name}
                                    value={value}
                                    disabled={disabled}
                                    readOnly={readOnly}
                                    maxLength={maxLength}
                                    rows={rows}
                                    onChange={e => onChange?.(e.target.value)}
                                    onBlur={onBlur}
                                    onFocus={onFocus}
                                    placeholder=" "
                                    aria-invalid={error ? "true" : "false"}
                                    aria-describedby={error ? errorId : undefined}
                                    aria-disabled={disabled}
                                    aria-readonly={readOnly}
                                    className={cn(
                                          "peer w-full bg-transparent text-[16px] tracking-[0.5px] text-ink-primary outline-none border-none",
                                          // Top padding must be large enough so text starts below the floated label
                                          "pt-[22px] pb-[10px] px-[16px]",
                                          "m-0 resize-y leading-normal [appearance:none] [WebkitAppearance:none]",
                                          disabled ? "cursor-not-allowed" : readOnly ? "cursor-default" : "cursor-text",
                                          textareaClassName,
                                    )}
                              />

                              <label
                                    htmlFor={textareaId}
                                    className={cn(
                                          "z-20 absolute left-[16px] pointer-events-none transition-all duration-200 origin-top-left text-ink-faint leading-none select-none",
                                          // Resting: sits inside the text area, aligned with first line
                                          "top-[14px] text-[16px] tracking-[0.5px]",
                                          // Focus: float to border top
                                          "peer-focus:top-[0px] peer-focus:-translate-y-1/2 peer-focus:text-[12px] peer-focus:bg-black peer-focus:px-[4px] peer-focus:tracking-[0.4px]",
                                          // Populated + blurred
                                          isFloated && LABEL_FLOATED,
                                          // Color
                                          error
                                                ? "text-accent-red peer-focus:text-accent-red"
                                                : "peer-focus:text-accent-gold/70",
                                    )}
                              >
                                    {placeholder}
                              </label>
                        </div>
                  </div>

                  {/* Character count + error row */}
                  <div className="flex items-start justify-between mt-[4px] px-[16px]">
                        {error
                              ? (
                                    <p id={errorId} role="alert" className={cn(ERROR_TEXT, "pl-0 mt-0")}>
                                          <AlertCircle size={16} className="shrink-0" />
                                          {error}
                                    </p>
                              )
                              : <span />
                        }
                        {maxLength !== undefined && (
                              <p className="text-[11px] text-ink-faint font-mono shrink-0 ml-2">
                                    {value.length}/{maxLength}
                              </p>
                        )}
                  </div>
            </div>
      );
}