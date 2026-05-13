import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export default function Field({
      label,
      id,
      required,
      error,
      children,
      hint,
      className,
}: {
      label: string;
      required?: boolean;
      error?: string;
      children: React.ReactNode;
      hint?: string;
      id?: string;
      className?: string;
}) {
      return (
            <div className={`flex flex-col gap-1.5 ${className}`}>
                  <label
                        htmlFor={id}
                        className="flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-ink-muted"
                  >
                        {label}
                        {required && (
                              <span className="text-accent-gold">*</span>
                        )}
                  </label>
                  {children}
                  {hint && !error && (
                        <p className="text-[11px] text-ink-faint font-body">
                              {hint}
                        </p>
                  )}
                  {error && (
                        <p className="flex items-center gap-1 text-[11px] text-accent-red">
                              <AlertCircle size={10} />
                              {error}
                        </p>
                  )}
            </div>
      );
}
