import React from 'react';
import { Badge } from '@/components/ui/primitives';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface TrendBadgeProps {
      pct: number;
}

export function TrendBadge({ pct }: TrendBadgeProps) {
      if (Math.abs(pct) < 0.5)
            return (
                  <Badge variant="muted">
                        <Minus size={10} className="inline mr-1" />
                        Flat
                  </Badge>
            );
      if (pct > 0)
            return (
                  <Badge variant="teal">
                        <ArrowUp size={10} className="inline mr-1" />
                        {pct.toFixed(1)}%
                  </Badge>
            );
      return (
            <Badge variant="red">
                  <ArrowDown size={10} className="inline mr-1" />
                  {Math.abs(pct).toFixed(1)}%
            </Badge>
      );
}
