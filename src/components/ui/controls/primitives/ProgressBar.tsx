import { cn } from '@/lib/utils';
import { ProgressBar as FluentProgressBar } from '@fluentui/react-components';

export default function ProgressBar({
      value,
      max,
      accent = 'gold',
      className,
}: {
      value: number;
      max: number;
      accent?: 'gold' | 'teal' | 'red' | 'purple';
      className?: string;
}) {
      // Fluent UI v9 ProgressBar component natively normalizes values 
      // between 0 and 1, where 1 represents 100% completion.
      const normalizedValue = max ? Math.min(value / max, 1) : 0;

      // Maps your custom theme colors to specific Tailwind utility classes
      const colors = {
            gold: '[&>div]:bg-accent-gold',
            teal: '[&>div]:bg-accent-teal',
            red: '[&>div]:bg-accent-red',
            purple: '[&>div]:bg-accent-purple',
      };

      return (
            <FluentProgressBar
                  className={cn(
                        'h-1.5 w-full bg-bg-border rounded-full',
                        colors[accent],
                        className
                  )}
                  value={normalizedValue}
            />
      );
}
