import { useEffect, useState } from 'react';
import { supabase } from '@/lib/services/supabase';

export interface CustomerItemIntelligence {
      pos_customer_id: number | string;
      name: string;
      total_sales: number;
      total_quantity: number;
      cogs: number;
      gross_revenue: number;
      revenue: number;
      net_revenue: number;
      profit: number;
      gross_estimated_main_profit: number;
}

export type FetchState<T> =
      | { status: 'loading'; data: null; error: null }
      | { status: 'error'; data: null; error: string }
      | { status: 'success'; data: T[]; error: null };

export function useCustomerItemIntelligence(customerId: string | number | undefined) {
      const [state, setState] = useState<FetchState<CustomerItemIntelligence>>({
            status: 'loading',
            data: null,
            error: null,
      });

      useEffect(() => {
            if (!customerId) {
                  setState({ status: 'success', data: [], error: null });
                  return;
            }

            let cancelled = false;

            (async () => {
                  setState({ status: 'loading', data: null, error: null });

                  const { data, error } = await supabase
                        .from('v_customer_item_intelligence')
                        .select('*')
                        .eq('pos_customer_id', customerId)
                        .order('revenue', { ascending: false })
                        .limit(500);

                  if (cancelled) return;

                  if (error) {
                        setState({ status: 'error', data: null, error: error.message });
                        return;
                  }

                  setState({
                        status: 'success',
                        data: (data ?? []) as CustomerItemIntelligence[],
                        error: null,
                  });
            })();

            return () => {
                  cancelled = true;
            };
      }, [customerId]);

      return state;
}