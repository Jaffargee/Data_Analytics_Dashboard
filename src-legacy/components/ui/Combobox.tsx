import React, { useId, useState, useRef, useEffect, useMemo, useCallback } from "react";
import { AlertCircle, ChevronDown, Check, X } from "lucide-react";
import { cn } from '@/lib/utils';
import {
      FIELD_HEIGHT,
      LABEL_FLOATED,
      ERROR_TEXT,
      PREFIX_SLOT,
      ICON_WRAP,
} from '@/types/ui/index';
import type { Option } from '@/types/ui/index';

export interface ComboboxProps {
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
      /** Allow free-text entry that doesn't match any option */
      allowFreeText?: boolean;
      noOptionsMessage?: string;
}

export default function Combobox({
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
      allowFreeText = false,
      noOptionsMessage = "No matching options",
}: ComboboxProps) {
      const [isOpen, setIsOpen] = useState(false);
      const [query, setQuery] = useState('');
      const [activeIndex, setActiveIndex] = useState(-1);

      const containerRef = useRef<HTMLDivElement>(null);
      const inputRef = useRef<HTMLInputElement>(null);
      const listRef = useRef<HTMLUListElement>(null);

      const internalId = useId();
      const inputId = externalId ?? internalId;
      const errorId = useId();
      const listboxId = useId();
      const optionId = (i: number) => `${listboxId}-opt-${i}`;

      const selectedOption = useMemo(
            () => options.find(o => o.value === value),
            [options, value]
      );

      const filteredOptions = useMemo(
            () => options.filter(o => o.label.toLowerCase().includes(query.toLowerCase())),
            [options, query]
      );

      const isFloated = isOpen || query !== '' || (value !== '' && value !== undefined && value !== null);

      // Sync display text when selection or open state changes
      useEffect(() => {
            if (!isOpen) {
                  // Closed: show the selected label (or free text if allowFreeText)
                  setQuery(selectedOption?.label ?? (allowFreeText ? value : ''));
            } else {
                  // Opened: select all text so typing replaces it immediately
                  requestAnimationFrame(() => inputRef.current?.select());
                  const idx = filteredOptions.findIndex(o => o.value === value);
                  setActiveIndex(idx >= 0 ? idx : 0);
            }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [isOpen, value]);

      const open = useCallback(() => {
            if (disabled) return;
            setIsOpen(true);
      }, [disabled]);

      const close = useCallback(() => {
            setIsOpen(false);
            setActiveIndex(-1);
            // On close, if free text allowed and no option matched, commit raw text
            if (allowFreeText && query && !selectedOption) {
                  onChange(query);
            }
      }, [allowFreeText, onChange, query, selectedOption]);

      const select = useCallback((option: Option) => {
            onChange(option.value);
            setQuery(option.label);
            setIsOpen(false);
            setActiveIndex(-1);
            inputRef.current?.blur();
      }, [onChange]);

      const clear = useCallback((e: React.MouseEvent) => {
            e.stopPropagation();
            onChange('');
            setQuery('');
            setIsOpen(false);
            inputRef.current?.focus();
      }, [onChange]);

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

      // Close on ancestor scroll (prevents dropdown desync)
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

      const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (disabled) return;

            if (!isOpen) {
                  if (["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
                        e.preventDefault();
                        open();
                  }
                  return;
            }

            switch (e.key) {
                  case "ArrowDown":
                        e.preventDefault();
                        setActiveIndex(p =>
                              filteredOptions.length === 0 ? -1 : (p + 1) % filteredOptions.length
                        );
                        break;
                  case "ArrowUp":
                        e.preventDefault();
                        setActiveIndex(p =>
                              filteredOptions.length === 0 ? -1 : (p - 1 + filteredOptions.length) % filteredOptions.length
                        );
                        break;
                  case "Home":
                        e.preventDefault();
                        setActiveIndex(0);
                        break;
                  case "End":
                        e.preventDefault();
                        setActiveIndex(filteredOptions.length - 1);
                        break;
                  case "Enter":
                        e.preventDefault();
                        if (activeIndex >= 0 && filteredOptions[activeIndex]) {
                              select(filteredOptions[activeIndex]);
                        } else if (allowFreeText && query) {
                              onChange(query);
                              setIsOpen(false);
                        }
                        break;
                  case "Escape":
                        e.preventDefault();
                        close();
                        inputRef.current?.blur();
                        break;
                  case "Tab":
                        close();
                        break;
            }
      };

      const hasClearButton = value !== '' && !disabled;

      return (
            <div className={cn("w-full font-body relative", className)} ref={containerRef}>
                  {/* Hidden native input for form submission */}
                  {name && (
                        <input type="hidden" name={name} value={value} />
                  )}

                  {/* Trigger frame */}
                  <div
                        onClick={() => { if (!disabled) { open(); inputRef.current?.focus(); } }}
                        className={cn(
                              "relative flex items-center bg-transparent border rounded-[4px] transition-all duration-200 box-border cursor-text overflow-visible",
                              FIELD_HEIGHT,
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

                        <div className="relative flex-1 h-full flex items-center overflow-visible z-10 min-w-0">
                              <input
                                    ref={inputRef}
                                    id={inputId}
                                    type="text"
                                    role="combobox"
                                    disabled={disabled}
                                    value={query}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    aria-expanded={isOpen}
                                    aria-haspopup="listbox"
                                    aria-controls={listboxId}
                                    aria-autocomplete="list"
                                    aria-activedescendant={
                                          isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined
                                    }
                                    aria-invalid={error ? "true" : "false"}
                                    aria-describedby={error ? errorId : undefined}
                                    onKeyDown={handleKeyDown}
                                    onChange={e => {
                                          setQuery(e.target.value);
                                          setActiveIndex(0);
                                          if (!isOpen) setIsOpen(true);
                                    }}
                                    onFocus={() => open()}
                                    className={cn(
                                          "w-full bg-transparent h-full text-[16px] tracking-[0.5px] text-ink-primary outline-none border-none p-0 m-0 leading-none [appearance:none] [WebkitAppearance:none]",
                                          prefix ? "pl-0" : "pl-[16px]",
                                          "pr-[8px]",
                                          disabled ? "cursor-not-allowed" : "cursor-text",
                                    )}
                              />

                              <label
                                    htmlFor={inputId}
                                    className={cn(
                                          "z-10 absolute pointer-events-none transition-all duration-200 origin-top-left text-ink-faint leading-none select-none",
                                          "text-[16px] tracking-[0.5px]",
                                          prefix ? "left-0" : "left-[16px]",
                                          "top-1/2 -translate-y-1/2",
                                          isFloated && LABEL_FLOATED,
                                          isFloated && (prefix ? "-left-[28px]" : "left-[16px]"),
                                          error
                                                ? "text-accent-red"
                                                : isOpen ? "text-accent-gold/70" : "",
                                    )}
                              >
                                    {placeholder}
                              </label>
                        </div>

                        {/* Clear button — shown when value is set */}
                        {hasClearButton && (
                              <button
                                    type="button"
                                    tabIndex={-1}
                                    onMouseDown={clear}
                                    aria-label="Clear selection"
                                    className="flex items-center justify-center shrink-0 w-[32px] h-full text-ink-faint hover:text-ink-secondary transition-colors"
                              >
                                    <X size={14} />
                              </button>
                        )}

                        {/* Chevron toggle */}
                        <button
                              type="button"
                              tabIndex={-1}
                              disabled={disabled}
                              onMouseDown={e => {
                                    e.preventDefault();
                                    if (isOpen) { setIsOpen(false); inputRef.current?.blur(); }
                                    else { open(); inputRef.current?.focus(); }
                              }}
                              className={cn(
                                    "flex items-center justify-center shrink-0 h-full text-ink-faint cursor-pointer outline-none",
                                    hasClearButton ? "pr-[12px] pl-0" : "pl-[4px] pr-[12px]",
                              )}
                        >
                              <ChevronDown size={20} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
                        </button>
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
                              {filteredOptions.map((option, index) => {
                                    const isSelected = option.value === value;
                                    const isActive = index === activeIndex;
                                    return (
                                          <li
                                                key={option.value}
                                                id={optionId(index)}
                                                role="option"
                                                aria-selected={isSelected}
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => select(option)}
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
                              {filteredOptions.length === 0 && (
                                    <li className="h-[40px] px-[16px] flex items-center text-[14px] text-ink-faint select-none italic">
                                          {noOptionsMessage}
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