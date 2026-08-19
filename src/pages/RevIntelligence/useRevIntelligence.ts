import { useEffect, useState } from 'react';
import { supabase } from '@/lib/services/supabase';

export interface RevIntelligenceItem {
      total_sales: number;
      name: string;
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

export function useRevIntelligence() {
      const [state, setState] = useState<FetchState<RevIntelligenceItem>>({
            status: 'loading',
            data: null,
            error: null,
      });

      useEffect(() => {
            let cancelled = false;

            (async () => {
                  setState({ status: 'loading', data: null, error: null });

                  const { data, error } = await supabase
                        .from('v_item_revenue_intelligence')
                        .select('*')
                        .order('revenue', { ascending: false })
                        .limit(500);

                  if (cancelled) return;

                  if (error) {
                        setState({ status: 'error', data: null, error: error.message });
                        return;
                  }

                  setState({ status: 'success', data: (data ?? []) as RevIntelligenceItem[], error: null });
            })();

            return () => {
                  cancelled = true;
            };
      }, []);

      return state;
}