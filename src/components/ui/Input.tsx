import React from 'react';
import { cn } from '@/lib/utils';

export default function Input({
      value,
      onChange_,
      placeholder,
      type = 'text',
      prefix,
      disabled,
      className,
      ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
      value: string;
      onChange_: (v: string) => void;
      placeholder?: string;
      type?: string;
      prefix?: string;
      className?: string;
      disabled?: boolean;
}) {
      return (
            <div className="relative flex items-center">
                  {prefix && (
                        <span className="absolute left-3 text-xs font-mono text-ink-muted select-none pointer-events-none z-10">
                              {prefix}
                        </span>
                  )}
                  <input
                        {...rest}
                        type={type}
                        value={value}
                        onChange={(e) => onChange_(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={cn(
                              'w-full bg-bg-hover border border-bg-border rounded-md py-2.5 text-sm font-body text-ink-primary',
                              'placeholder:text-ink-faint outline-none transition-all',
                              'focus:border-accent-gold/50 focus:bg-bg-card',
                              'disabled:opacity-50 disabled:cursor-not-allowed',
                              prefix ? 'pl-8 pr-3' : 'px-3',
                              className
                        )}
                  />
            </div>
      );
}
