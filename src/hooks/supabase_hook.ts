import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { TopCustomer } from './data/types';

export type FetchState<T> = { data: T | null; loading: boolean; error: string | null };

function useView<T>(view: string, limit = 100): FetchState<T[]> {
  const [state, setState] = useState<FetchState<T[]>>({ data: null, loading: true, error: null });
  useEffect(() => {
    let active = true;
    supabase.from(view).select('*').limit(limit).then(({ data, error }) => {
      if (active) setState({ data: (data as T[]) ?? [], loading: false, error: error?.message ?? null });
    });
    return () => { active = false; };
  }, [view, limit]);
  return state;
}

export const useTopCustomers = (limit = 200) => useView<TopCustomer>('v_top_customers', limit);
