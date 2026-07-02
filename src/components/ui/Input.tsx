import React, { useId, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from '@/lib/utils';
import {
      FIELD_HEIGHT,
      FIELD_TEXT,
      LABEL_FLOATED,
      LABEL_RESTING,
      ERROR_TEXT,
      PREFIX_SLOT,
      ICON_WRAP,
} from '@/types/ui/index';

export interface InputProps {
      value: string;
      onChange: (value: string) => void;
      placeholder?: string;
      type?: React.HTMLInputTypeAttribute;
      prefix?: React.ReactNode;
      suffix?: React.ReactNode;
      error?: string;
      disabled?: boolean;
      readOnly?: boolean;
      maxLength?: number;
      autoComplete?: string;
      autoFocus?: boolean;
      name?: string;
      id?: string;
      className?: string;
      inputClassName?: string;
      onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
      onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
      onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function Input({
      value,
      onChange,
      placeholder,
      type = 'text',
      prefix,
      suffix,
      error,
      disabled,
      readOnly,
      maxLength,
      autoComplete,
      autoFocus,
      name,
      id: externalId,
      className,
      inputClassName,
      onBlur,
      onFocus,
      onKeyDown,
}: InputProps) {
      const internalId = useId();
      const inputId = externalId ?? internalId;
      const errorId = useId();
      const inputRef = useRef<HTMLInputElement>(null);

      const isFloated = value !== '' && value !== undefined && value !== null;

      // For date/time types, open the native picker on container click
      const handleContainerClick = () => {
            if (disabled || readOnly) return;
            if (type === 'date' || type === 'time' || type === 'datetime-local') {
                  try {
                        inputRef.current?.showPicker();
                  } catch {
                        inputRef.current?.focus();
                  }
            }
      };

      return (
            <div className={cn("w-full font-body", className)}>
                  <div
                        onClick={handleContainerClick}
                        className={cn(
                              "relative flex items-center bg-transparent border rounded-[4px] transition-all duration-200 box-border overflow-visible",
                              FIELD_HEIGHT,
                              error
                                    ? "border-accent-red focus-within:border-accent-red focus-within:[box-shadow:0_0_0_1px_theme(colors.accent-red)]"
                                    : "border-[#f0f0fa59] focus-within:border-accent-gold/50 focus-within:[box-shadow:0_0_0_1px_theme(colors.accent-gold/50)]",
                              disabled && "opacity-40 cursor-not-allowed",
                              readOnly && "cursor-default",
                        )}
                  >
                        {/* Prefix */}
                        {prefix && (
                              <span className={cn("absolute left-0 top-0", PREFIX_SLOT)}>
                                    <span className={ICON_WRAP}>{prefix}</span>
                              </span>
                        )}

                        {/* Input + floating label */}
                        <div className={cn(
                              "relative flex-1 h-full flex items-center overflow-visible z-10",
                              prefix ? "pl-[42px]" : ""
                        )}>
                              <input
                                    ref={inputRef}
                                    id={inputId}
                                    name={name}
                                    type={type}
                                    value={value}
                                    disabled={disabled}
                                    readOnly={readOnly}
                                    maxLength={maxLength}
                                    autoComplete={autoComplete}
                                    autoFocus={autoFocus}
                                    onChange={e => onChange(e.target.value)}
                                    onBlur={onBlur}
                                    onFocus={onFocus}
                                    onKeyDown={onKeyDown}
                                    placeholder=" "
                                    aria-invalid={error ? "true" : "false"}
                                    aria-describedby={error ? errorId : undefined}
                                    aria-disabled={disabled}
                                    aria-readonly={readOnly}
                                    className={cn(
                                          "peer w-full bg-transparent h-full outline-none border-none p-0 m-0 leading-none [appearance:none] [WebkitAppearance:none]",
                                          // Hide native date/time picker icon — we control the click ourselves
                                          "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute",
                                          FIELD_TEXT,
                                          "text-ink-primary",
                                          prefix ? "pl-0" : "pl-[16px]",
                                          suffix ? "pr-0" : "pr-[16px]",
                                          disabled ? "cursor-not-allowed" : readOnly ? "cursor-default" : "cursor-text",
                                          inputClassName,
                                    )}
                              />

                              <label
                                    htmlFor={inputId}
                                    className={cn(
                                          "z-20 absolute pointer-events-none transition-all duration-200 origin-top-left text-ink-faint leading-none select-none",
                                          // Resting position — shift right if prefix present
                                          !isFloated && prefix ? "left-[0px]" : "left-[16px]",
                                          LABEL_RESTING,
                                          // On focus: always snap left-[16px] and float
                                          "peer-focus:left-[16px]",
                                          "peer-focus:top-[0px] peer-focus:-translate-y-1/2 peer-focus:text-[12px] peer-focus:bg-black peer-focus:px-[4px] peer-focus:tracking-[0.4px]",
                                          // Populated + blurred state
                                          isFloated && LABEL_FLOATED,
                                          isFloated && "left-[16px]",
                                          // Color
                                          error
                                                ? "text-accent-red peer-focus:text-accent-red"
                                                : "peer-focus:text-accent-gold/70",
                                    )}
                              >
                                    {placeholder}
                              </label>
                        </div>

                        {/* Suffix */}
                        {suffix && (
                              <span className={PREFIX_SLOT}>
                                    <span className={ICON_WRAP}>{suffix}</span>
                              </span>
                        )}
                  </div>

                  {error && (
                        <p id={errorId} role="alert" className={ERROR_TEXT}>
                              <AlertCircle size={16} className="shrink-0" />
                              {error}
                        </p>
                  )}
            </div>
      );
}