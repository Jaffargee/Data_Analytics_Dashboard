import React from 'react';
import { ComparisonTable } from './ComparisonTable';
import { PERIOD1_DEFAULT } from '../constants';
import type { Comparison } from '../types';

interface ComparisonTabProps {
      comparison: Comparison[];
      fromDate: string;
      toDate: string;
}

export function ComparisonTab({
      comparison,
      fromDate,
      toDate,
}: ComparisonTabProps) {
      return (
            <ComparisonTable
                  comparison={comparison}
                  period1Label={`P1: ${PERIOD1_DEFAULT.from} → ${PERIOD1_DEFAULT.to}`}
                  period2Label={`P2: ${fromDate} → ${toDate}`}
            />
      );
}
