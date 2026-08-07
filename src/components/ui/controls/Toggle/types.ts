
export interface ToggleProps {
      checked: boolean;
      onChange: (value: boolean) => void;
      label: string;
      description?: string;
      disabled?: boolean;
      className?: string;
}