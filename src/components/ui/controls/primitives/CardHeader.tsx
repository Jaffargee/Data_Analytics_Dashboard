import { cn } from "../../../lib/utils";

export default function CardHeader({
      children,
      className,
}: {
      children: React.ReactNode;
      className?: string;
}) {
      return (
            <div
                  className={cn(
                        'flex items-center justify-between mb-5 gap-2',
                        className
                  )}
            >
                  {children}
            </div>
      );
}
