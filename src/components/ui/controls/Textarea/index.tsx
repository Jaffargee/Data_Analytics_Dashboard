import React from 'react';

export interface TextareaProps {
      value?: string;
      placeholder?: string;
      rows?: number;
      className?: string;
      onChange?: (value: string) => void;
}

export default function Textarea({
      value = '',
      placeholder,
      rows = 4,
      className = '',
      onChange,
}: TextareaProps) {
      return (
            <textarea
                  value={value}
                  placeholder={placeholder}
                  rows={rows}
                  onChange={(event) => onChange?.(event.target.value)}
                  className={className}
            />
      );
}
