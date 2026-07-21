import React, { useId, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from '../../../lib/utils';
import {
      FIELD_HEIGHT,
      FIELD_TEXT,
      ERROR_TEXT,
      PREFIX_SLOT,
      ICON_WRAP,
} from '../../../types/ui/index';
import { InputProps } from "./types";

export default function Input2({
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
      radius = 'md',
      onBlur,
      onFocus,
      onKeyDown,
}: InputProps) {
      const internalId = useId();
      const inputId = externalId ?? internalId;
      const errorId = useId();
      const inputRef = useRef<HTMLInputElement>(null);

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
                              "relative flex items-center bg-transparent border transition-all duration-200 box-border overflow-visible",
                              FIELD_HEIGHT,
                              // Radius
                              `rounded-${radius}`,
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
                                    placeholder={placeholder}
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