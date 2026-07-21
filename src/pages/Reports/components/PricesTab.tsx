import React from 'react';
import { PriceBandCharts } from './PriceBandCharts';
import { PriceSensitivityTable } from './PriceSensitivityTable';
import type { PriceSensitivity } from '../types';

interface PricesTabProps {
      prices: PriceSensitivity[];
}

export function PricesTab({ prices }: PricesTabProps) {
      return (
            <>
                  <PriceBandCharts prices={prices} />
                  <PriceSensitivityTable prices={prices} />
            </>
      );
}
