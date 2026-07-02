import React, { useId, useState, useRef, useEffect, useCallback } from "react";
import { AlertCircle, ChevronDown, Check } from "lucide-react";
import { cn } from '@/lib/utils';
import {
      FIELD_HEIGHT,
      LABEL_FLOATED,
      ERROR_TEXT,
      PREFIX_SLOT,
      ICON_WRAP,
} from '@/types/ui/index';
import type { Option } from '@/types/ui/index';

export interface SelectProps {
      value: string;
      onChange: (value: string) => void;
      placeholder?: string;
      options?: Option[];
      error?: string;
      disabled?: boolean;
      prefix?: React.ReactNode;
      name?: string;
      id?: string;
      className?: string;
}

export default function Select({
      value,
      onChange,
      placeholder,
      options = [],
      error,
      disabled,
      prefix,
      name,
      id: externalId,
      className,
}: SelectProps) {
      const [isOpen, setIsOpen] = useState(false);
      const [activeIndex, setActiveIndex] = useState(-1);
      const containerRef = useRef<HTMLDivElement>(null);
      const listRef = useRef<HTMLUListElement>(null);

      const internalId = useId();
      const triggerId = externalId ?? internalId;
      const errorId = useId();
      const listboxId = useId();
      const optionId = (i: number) => `${listboxId}-opt-${i}`;

      const selectedOption = options.find(o => o.value === value);
      const isFloated = isOpen || (value !== '' && value !== undefined && value !== null);

      const open = useCallback(() => {
            if (disabled) return;
            setIsOpen(true);
            // Pre-highlight current value
            const idx = options.findIndex(o => o.value === value);
            setActiveIndex(idx >= 0 ? idx : 0);
      }, [disabled, options, value]);

      const close = useCallback(() => {
            setIsOpen(false);
            setActiveIndex(-1);
      }, []);

      const select = useCallback((optValue: string) => {
            onChange(optValue);
            close();
      }, [onChange, close]);

      // Close on outside click
      useEffect(() => {
            function handler(e: MouseEvent) {
                  if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                        close();
                  }
            }
            document.addEventListener("mousedown", handler);
            return () => document.removeEventListener("mousedown", handler);
      }, [close]);

      // Close on scroll of any ancestor (prevents desync)
      useEffect(() => {
            if (!isOpen) return;
            function handler(e: Event) {
                  if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                        close();
                  }
            }
            window.addEventListener("scroll", handler, true);
            return () => window.removeEventListener("scroll", handler, true);
      }, [isOpen, close]);

      // Scroll active item into view
      useEffect(() => {
            if (activeIndex >= 0 && listRef.current) {
                  const el = listRef.current.children[activeIndex] as HTMLElement;
                  el?.scrollIntoView({ block: "nearest" });
            }
      }, [activeIndex]);

      // Type-ahead buffer
      const typeaheadRef = useRef('');
      const typeaheadTimer = useRef<ReturnType<typeof setTimeout>>();

      const handleKeyDown = (e: React.KeyboardEvent) => {
            if (disabled) return;

            if (!isOpen) {
                  if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
                        e.preventDefault();
                        open();
                  }
                  return;
            }

            switch (e.key) {
                  case "ArrowDown":
                        e.preventDefault();
                        setActiveIndex(p => (p + 1) % options.length);
                        break;
                  case "ArrowUp":
                        e.preventDefault();
                        setActiveIndex(p => (p - 1 + options.length) % options.length);
                        break;
                  case "Home":
                        e.preventDefault();
                        setActiveIndex(0);
                        break;
                  case "End":
                        e.preventDefault();
                        setActiveIndex(options.length - 1);
                        break;
                  case "Enter":
                  case " ":
                        e.preventDefault();
                        if (activeIndex >= 0 && activeIndex < options.length) {
                              select(options[activeIndex].value);
                        }
                        break;
                  case "Escape":
                  case "Tab":
                        close();
                        break;
                  default:
                        // Type-ahead: jump to first option whose label starts with typed chars
                        if (e.key.length === 1) {
                              typeaheadRef.current += e.key.toLowerCase();
                              clearTimeout(typeaheadTimer.current);
                              typeaheadTimer.current = setTimeout(() => { typeaheadRef.current = ''; }, 500);
                              const match = options.findIndex(o =>
                                    o.label.toLowerCase().startsWith(typeaheadRef.current)
                              );
                              if (match >= 0) setActiveIndex(match);
                        }
                        break;
            }
      };

      return (
            <div className={cn("w-full font-body relative", className)} ref={containerRef}>
                  {/* Hidden native select for form submission */}
                  {name && (
                        <select name={name} value={value} onChange={() => {}} aria-hidden tabIndex={-1}
                              className="sr-only">
                              {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                  )}

                  {/* Trigger */}
                  <div
                        id={triggerId}
                        role="combobox"
                        aria-expanded={isOpen}
                        aria-haspopup="listbox"
                        aria-controls={listboxId}
                        aria-activedescendant={isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined}
                        aria-invalid={error ? "true" : "false"}
                        aria-describedby={error ? errorId : undefined}
                        aria-disabled={disabled}
                        tabIndex={disabled ? -1 : 0}
                        onKeyDown={handleKeyDown}
                        onClick={() => isOpen ? close() : open()}
                        className={cn(
                              "relative flex items-center bg-transparent border rounded-[4px] transition-all duration-200 box-border cursor-pointer select-none overflow-visible",
                              FIELD_HEIGHT,
                              "focus-visible:outline-none",
                              error
                                    ? "border-accent-red"
                                    : isOpen
                                          ? "border-accent-gold/50 [box-shadow:0_0_0_1px_theme(colors.accent-gold/50)]"
                                          : "border-[#f0f0fa59]",
                              disabled && "opacity-40 cursor-not-allowed",
                        )}
                  >
                        {prefix && (
                              <span className={PREFIX_SLOT}>
                                    <span className={ICON_WRAP}>{prefix}</span>
                              </span>
                        )}

                        <div className="relative flex-1 h-full flex items-center overflow-visible min-w-0">
                              {/* Selected value display */}
                              <span className={cn(
                                    "text-[16px] tracking-[0.5px] text-ink-primary truncate leading-none transition-opacity duration-100",
                                    prefix ? "pl-0" : "pl-[16px]",
                                    !selectedOption ? "opacity-0 pointer-events-none" : "opacity-100"
                              )}>
                                    {selectedOption?.label ?? '\u00A0'}
                              </span>

                              {/* Floating label */}
                              <label
                                    className={cn(
                                          "z-10 absolute pointer-events-none transition-all duration-200 origin-top-left text-ink-faint leading-none select-none",
                                          "text-[16px] tracking-[0.5px]",
                                          prefix ? "left-0" : "left-[16px]",
                                          // Resting
                                          "top-1/2 -translate-y-1/2",
                                          // Floated
                                          isFloated && LABEL_FLOATED,
                                          isFloated && prefix && "-left-[28px]",
                                          isFloated && !prefix && "left-[16px]",
                                          // Color
                                          error
                                                ? "text-accent-red"
                                                : isOpen ? "text-accent-gold/70" : "",
                                    )}
                              >
                                    {placeholder}
                              </label>
                        </div>

                        <span className={cn(PREFIX_SLOT, "relative")}>
                              <ChevronDown size={20} className={cn("transition-transform duration-200 text-ink-faint", isOpen && "rotate-180")} />
                        </span>
                  </div>

                  {/* Dropdown */}
                  {isOpen && (
                        <ul
                              ref={listRef}
                              id={listboxId}
                              role="listbox"
                              aria-label={placeholder}
                              className="absolute left-0 w-full mt-[4px] bg-[#0a0a0a] border border-bg-border rounded-[4px] shadow-xl max-h-[240px] overflow-y-auto z-50 py-[4px] base-scrollbar"
                        >
                              {options.map((option, index) => {
                                    const isSelected = option.value === value;
                                    const isActive = index === activeIndex;
                                    return (
                                          <li
                                                key={option.value}
                                                id={optionId(index)}
                                                role="option"
                                                aria-selected={isSelected}
                                                onMouseDown={e => e.preventDefault()} // prevent trigger blur before click
                                                onClick={() => select(option.value)}
                                                onMouseEnter={() => setActiveIndex(index)}
                                                className={cn(
                                                      "h-[40px] px-[16px] flex items-center justify-between text-[14px] tracking-[0.25px] cursor-pointer transition-colors select-none",
                                                      isSelected ? "text-accent-gold" : "text-ink-primary",
                                                      isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.04]",
                                                      isSelected && !isActive && "bg-accent-gold/[0.08]",
                                                )}
                                          >
                                                <span className="truncate">{option.label}</span>
                                                {isSelected && <Check size={14} className="shrink-0 ml-2 text-accent-gold" />}
                                          </li>
                                    );
                              })}
                              {options.length === 0 && (
                                    <li className="h-[40px] px-[16px] flex items-center text-[14px] text-ink-faint select-none italic">
                                          No options available
                                    </li>
                              )}
                        </ul>
                  )}

                  {error && (
                        <p id={errorId} role="alert" className={ERROR_TEXT}>
                              <AlertCircle size={16} className="shrink-0" />
                              {error}
                        </p>
                  )}
            </div>
      );
}