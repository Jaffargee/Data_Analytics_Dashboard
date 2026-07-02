
export interface Option {
      value: string;
      label: string;
}

export interface SelectProps {
      value: string;
      onChange: (value: string) => void;
      placeholder: string; // Acts as the floating label text
      options: Option[] | any[];
      error?: string;
      disabled?: boolean;
      prefix?: React.ReactNode;
}

export interface ComboboxProps {
      value: string;
      onChange: (value: string) => void;
      placeholder: string; // Acts as the floating label text
      options: Option[] | any[];
      error?: string;
      disabled?: boolean;
      prefix?: React.ReactNode;
}


export interface InputProps {
	value: string;
      onChange: (v: any) => void;
      placeholder?: string
	type?: string;
      prefix?: React.ReactNode;
      suffix?: React.ReactNode
	error?: string;
      disabled?: boolean
}

export interface TextareProps {
	value: string; onChange: (v: string) => void;
      placeholder?: string;
      rows?: number
}

export interface LabelProps { children: React.ReactNode; required?: boolean }

export interface ToggleProps {
      checked: boolean;
      onChange: (v: boolean) => void;
      label: string;
      description?: string
}

export interface Section {
      id: string;
      title: string;
      icon: React.ElementType
      children: React.ReactNode;
      active?: boolean;
      onActivate?: () => void
}

export interface TextareaProps {
      placeholder: string;
      error?: string;
      onChange?: (v: string) => void;
}


// Shared token for consistent field height across Input, Select, Combobox, Button
export const FIELD_HEIGHT = "h-[48px]";
export const FIELD_TEXT = "text-[16px] tracking-[0.5px]";
export const LABEL_FLOATED = "top-[0px] -translate-y-1/2 text-[12px] bg-black px-[4px] tracking-[0.4px]";
export const LABEL_RESTING = "top-1/2 -translate-y-1/2 text-[16px] tracking-[0.5px]";
export const ERROR_TEXT = "flex items-center gap-[4px] mt-[4px] pl-[16px] text-[12px] leading-[16px] tracking-[0.4px] text-accent-red";
export const PREFIX_SLOT = "pl-[12px] pr-[8px] text-ink-faint flex items-center justify-center shrink-0 h-full self-center select-none";
export const ICON_WRAP = "w-[20px] h-[20px] flex items-center justify-center [&>svg]:w-[20px] [&>svg]:h-[20px]";