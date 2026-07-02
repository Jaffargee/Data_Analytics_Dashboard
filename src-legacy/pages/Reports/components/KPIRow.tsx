import React from 'react';
import { StatCard } from '@/components/ui/primitives';
import { fmtCurrency, fmt } from '@/lib/utils';
import {
      TrendingUp,
      Package,
      Users,
      DollarSign,
      BarChart2,
} from 'lucide-react';

interface KPIRowProps {
      kpis: {
            totalRev: number;
            totalTxn: number;
            avgBasket: number;
            avgDaily: number;
            totalUnits: number;
            tradingDays: number;
      };
}

export function KPIRow({ kpis }: KPIRowProps) {
      const { totalRev, totalTxn, avgBasket, avgDaily, totalUnits } = kpis;

      return (
            <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
                  <StatCard
                        label="Total Revenue"
                        value={fmtCurrency(totalRev)}
                        icon={<DollarSign size={14} />}
                        accent="gold"
                        delay={0}
                  />
                  <StatCard
                        label="Transactions"
                        value={fmt(totalTxn)}
                        icon={<BarChart2 size={14} />}
                        accent="teal"
                        delay={100}
                  />
                  <StatCard
                        label="Avg Daily Rev"
                        value={fmtCurrency(avgDaily)}
                        icon={<TrendingUp size={14} />}
                        accent="purple"
                        delay={200}
                  />
                  <StatCard
                        label="Avg Basket"
                        value={fmtCurrency(avgBasket)}
                        icon={<Package size={14} />}
                        accent="gold"
                        delay={300}
                  />
                  <StatCard
                        label="Units Sold"
                        value={fmt(totalUnits)}
                        icon={<Users size={14} />}
                        accent="teal"
                        delay={400}
                  />
            </div>
      );
}
