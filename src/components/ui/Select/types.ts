import { Option } from "../../../types/ui";

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
      radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
}
