import React from "react";
import { cn } from '@/lib/utils';
import { FIELD_HEIGHT } from '@/types/ui/index';

export type ButtonVariant = 'primary' | 'secondary' | 'dashed' | 'accent' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
      children: React.ReactNode;
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
      'aria-label'?: string;
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
      sm: "h-[32px] px-[16px] text-[13px] gap-[6px]",
      md: `${FIELD_HEIGHT} px-[24px] text-[14px] gap-[8px]`,
      lg: "h-[52px] px-[32px] text-[16px] gap-[8px]",
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
      // Gold filled — primary CTA
      primary:
            "bg-accent-gold text-black hover:bg-accent-gold/90 active:bg-accent-gold/80 border border-transparent",

      // Outlined — secondary action
      secondary:
            "bg-transparent border border-[#f0f0fa59] text-ink-primary hover:bg-white/[0.04] hover:border-ink-faint active:bg-white/[0.08]",

      // Dashed — additive action ("+ Add item")
      dashed:
            "bg-transparent border border-dashed border-[#f0f0fa40] text-ink-muted hover:bg-white/[0.02] hover:border-[#f0f0fa80] hover:text-ink-primary active:bg-white/[0.05]",

      // Gold tinted outline — contextual accent
      accent:
            "bg-accent-gold/[0.12] border border-accent-gold/30 text-accent-gold hover:bg-accent-gold/[0.20] active:bg-accent-gold/[0.08]",

      // No background — subtle/icon-adjacent
      ghost:
            "bg-transparent border border-transparent text-ink-muted hover:bg-white/[0.04] hover:text-ink-primary active:bg-white/[0.08]",

      // Destructive — dangerous action
      destructive:
            "bg-accent-red/[0.12] border border-accent-red/30 text-accent-red hover:bg-accent-red/[0.20] active:bg-accent-red/[0.08]",
};

export default function Button({
      children,
      variant = 'primary',
      size = 'md',
      disabled,
      loading,
      type = 'button',
      fullWidth,
      icon,
      iconPosition = 'left',
      onClick,
      className,
      name,
      value,
      form,
      'aria-label': ariaLabel,
}: ButtonProps) {
      const isDisabled = disabled || loading;

      return (
            <button
                  type={type}
                  name={name}
                  value={value}
                  form={form}
                  disabled={isDisabled}
                  onClick={onClick}
                  aria-label={ariaLabel}
                  aria-busy={loading}
                  aria-disabled={isDisabled}
                  className={cn(
                        // Base
                        "relative inline-flex items-center justify-center font-body font-medium tracking-[0.4px] rounded-full",
                        "transition-all duration-200 outline-none select-none",
                        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-accent-gold",
                        "active:scale-[0.98]",
                        // Size
                        SIZE_CLASSES[size],
                        // Variant
                        VARIANT_CLASSES[variant],
                        // Width
                        fullWidth ? "w-full" : "",
                        // Disabled
                        isDisabled && "opacity-40 cursor-not-allowed pointer-events-none active:scale-100",
                        className,
                  )}
            >
                  {/* Loading spinner */}
                  {loading && (
                        <span className="absolute inset-0 flex items-center justify-center">
                              <svg
                                    className="animate-spin"
                                    width={size === 'sm' ? 14 : 16}
                                    height={size === 'sm' ? 14 : 16}
                                    viewBox="0 0 16 16"
                                    fill="none"
                              >
                                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                                    <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                        </span>
                  )}

                  {/* Content — hidden while loading (keeps button width stable) */}
                  <span className={cn("inline-flex items-center gap-2", loading && "opacity-0")}>
                        {icon && iconPosition === 'left' && (
                              <span className="flex items-center justify-center [&>svg]:w-[16px] [&>svg]:h-[16px]">
                                    {icon}
                              </span>
                        )}
                        {children}
                        {icon && iconPosition === 'right' && (
                              <span className="flex items-center justify-center [&>svg]:w-[16px] [&>svg]:h-[16px]">
                                    {icon}
                              </span>
                        )}
                  </span>
            </button>
      );
}