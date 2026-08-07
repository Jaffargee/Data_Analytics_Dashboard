import { cn } from "../../../lib/utils";
import { badgeMap } from "./constants";
import { BadgeVariant } from "./types";


export default function Badge({
      children,
      variant = 'muted',
}: {
      children: React.ReactNode;
      variant?: BadgeVariant;
}) {
      return (
            <span
                  className={cn(
                        'px-2 py-0.5 rounded text-xs font-mono border',
                        badgeMap[variant]
                  )}
            >
                  {children}
            </span>
      );
}