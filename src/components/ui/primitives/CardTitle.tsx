import { cn } from "../../../lib/utils";

export default function CardTitle({
      children,
      className,
}: {
      children: React.ReactNode;
      className?: string;
}) {
      return (
            <h3
                  className={cn(
                        'font-display font-semibold text-sm uppercase tracking-widest text-ink-secondary',
                        className
                  )}
            >
                  {children}
            </h3>
      );
}