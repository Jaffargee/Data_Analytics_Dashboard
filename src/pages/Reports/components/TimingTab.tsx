import React from 'react';
import { TimeOfDaySales } from './TimeOfDaySales';
import { DOWDeepDive } from './DOWDeepDive';
import { RevenueByDOWChart } from './RevenueByDOWChart';
import type { TimeIntelligence, RevenueByDow } from '../types';
import type { ChartDataPoint } from '../types';

interface TimingTabProps {
      timingData: TimeIntelligence[];
      dowData: RevenueByDow[];
      dowChart: ChartDataPoint[];
}

export function TimingTab({ timingData, dowData, dowChart }: TimingTabProps) {
      return (
            <>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <TimeOfDaySales timingData={timingData} />
                        <RevenueByDOWChart data={dowChart} />
                  </div>
                  <DOWDeepDive dowData={dowData} />
            </>
      );
}
