import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState() {
      return (
            <div className="flex items-center justify-center py-20 gap-3">
                  <Loader2
                        size={20}
                        className="text-accent-gold animate-spin"
                  />
                  <span className="text-ink-muted font-body text-sm">
                        Running analytics…
                  </span>
            </div>
      );
}
