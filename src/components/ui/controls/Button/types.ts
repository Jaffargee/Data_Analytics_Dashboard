
export type ButtonVariant = 'primary' | 'secondary' | 'dashed' | 'accent' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xm';

export interface ButtonProps {
      children?: React.ReactNode;
      variant?: ButtonVariant;
      size?: ButtonSize;
      disabled?: boolean;
      loading?: boolean;
      type?: 'button' | 'submit' | 'reset';
      fullWidth?: boolean;
      icon?: React.ReactNode;
      iconPosition?: 'left' | 'right';
      onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
      className?: string;
      name?: string;
      value?: string;
      form?: string;
      radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'      
      'aria-label'?: string;
}
