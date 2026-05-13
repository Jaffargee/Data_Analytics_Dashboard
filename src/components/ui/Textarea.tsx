import React from 'react';
import { cn } from '@/lib/utils';

export default function Textarea({
      value,
      id,
      onChange_,
      placeholder,
      rows = 3,
}: {
      value: string;
      id: string;
      onChange_: (v: string) => void;
      placeholder?: string;
      rows?: number;
}) {
      return (
            <textarea
                  id={id}
                  value={value}
                  onChange={(e) => onChange_(e.target.value)}
                  placeholder={placeholder}
                  rows={rows}
                  className="w-full bg-bg-hover border border-bg-border rounded-xl px-3 py-2.5 text-sm font-body text-ink-primary placeholder:text-ink-faint outline-none focus:border-accent-gold/50 focus:bg-bg-card transition-all resize-none"
            />
      );
}
