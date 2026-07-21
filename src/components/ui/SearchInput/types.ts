
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