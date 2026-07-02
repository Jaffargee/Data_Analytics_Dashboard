import React from 'react';
import { TopCustomersChart } from './TopCustomersChart';
import { CustomerRankingsTable } from './CustomerRankingsTable';
import type { TopCustomer } from '../types';

interface CustomersTabProps {
      customers: TopCustomer[];
}

export function CustomersTab({ customers }: CustomersTabProps) {
      return (
            <>
                  <TopCustomersChart customers={customers} />
                  <CustomerRankingsTable customers={customers} />
            </>
      );
}
