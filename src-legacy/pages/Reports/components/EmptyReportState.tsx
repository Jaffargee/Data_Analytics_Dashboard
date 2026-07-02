import React from 'react';
import { CalendarRegular as Calendar } from '@fluentui/react-icons';

export function EmptyReportState() {
      return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
                        <Calendar fontSize={24} className="text-accent-gold" />
                  </div>
                  <div className="text-center">
                        <p className="text-ink-primary font-display font-semibold">
                              Select a date range above
                        </p>
                        <p className="text-ink-muted text-sm font-body mt-1">
                              Choose a period and click Generate Report to see
                              full analytics
                        </p>
                  </div>
            </div>
      );
}
