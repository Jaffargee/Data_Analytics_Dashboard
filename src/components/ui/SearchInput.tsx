import React, { useId, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from '@/lib/utils';

export interface SearchInputProps {
      value: string;
      onChange: (value: string) => void;
      placeholder?: string;
      disabled?: boolean;
      autoFocus?: boolean;
      id?: string;
      name?: string;
      className?: string;
      onClear?: () => void;
      onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
      onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
      onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function SearchInput({
      value,
      onChange,
      placeholder = "Search…",
      disabled,
      autoFocus,
      id: externalId,
      name,
      className,
      onClear,
      onFocus,
      onBlur,
      onKeyDown,
}: SearchInputProps) {
      const internalId = useId();
      const inputId = externalId ?? internalId;
      const inputRef = useRef<HTMLInputElement>(null);
      const hasValue = value.length > 0;

      const handleClear = (e: React.MouseEvent) => {
            e.stopPropagation();
            onChange('');
            onClear?.();
            inputRef.current?.focus();
      };

      const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Escape' && hasValue) {
                  e.preventDefault();
                  onChange('');
                  onClear?.();
            }
            onKeyDown?.(e);
      };

      return (
            <div className={cn("w-full font-body", className)}>
                  <div className={cn(
                        "relative flex items-center bg-transparent border border-[#f0f0fa59] rounded-full h-[40px] transition-all duration-200 box-border",
                        "focus-within:border-accent-gold/50 focus-within:[box-shadow:0_0_0_1px_theme(colors.accent-gold/50)]",
                        disabled && "opacity-40 cursor-not-allowed",
                  )}>
                        {/* Search icon — static, not interactive */}
                        <label htmlFor={inputId} className="pl-[14px] pr-[8px] text-ink-faint flex items-center justify-center shrink-0 cursor-text">
                              <Search size={15} />
                        </label>

                        <input
                              ref={inputRef}
                              id={inputId}
                              name={name}
                              type="search"
                              value={value}
                              disabled={disabled}
                              autoFocus={autoFocus}
                              autoComplete="off"
                              autoCorrect="off"
                              spellCheck={false}
                              placeholder={placeholder}
                              onChange={e => onChange(e.target.value)}
                              onFocus={onFocus}
                              onBlur={onBlur}
                              onKeyDown={handleKeyDown}
                              // Suppress browser native X — we render our own
                              className="flex-1 w-full bg-transparent h-full text-[14px] tracking-[0.25px] text-ink-primary placeholder:text-ink-faint outline-none border-none p-0 m-0 leading-none [appearance:none] [WebkitAppearance:none] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                        />

                        {/* Clear button — keyboard accessible, only when there's a value */}
                        <div className={cn(
                              "transition-all duration-150 flex items-center justify-center shrink-0",
                              hasValue ? "w-[36px] opacity-100" : "w-0 opacity-0 overflow-hidden pointer-events-none"
                        )}>
                              <button
                                    type="button"
                                    tabIndex={hasValue ? 0 : -1}
                                    onClick={handleClear}
                                    aria-label="Clear search"
                                    className="w-[20px] h-[20px] flex items-center justify-center rounded-full text-ink-faint hover:text-ink-secondary hover:bg-white/[0.06] transition-colors"
                              >
                                    <X size={12} />
                              </button>
                        </div>

                        <span className="pr-[4px]" />
                  </div>
            </div>
      );
}