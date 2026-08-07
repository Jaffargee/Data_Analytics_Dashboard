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
      radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
      onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
      onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
      onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}