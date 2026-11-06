import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/services/supabase';
import type { PriceAnalysis, PriceBucket } from './types';

export interface PriceAnalysisParams {
      from: string | null;
      to: string | null;
      bucket: PriceBucket;
      includeReturns: boolean;
}

/**
 * Calls the get_item_price_analysis RPC: price summary, price-point distribution,
 * price timeline and every individual price point for one item (by pos_item_id).
 */
export default function usePriceAnalysis(posItemId: number, params: PriceAnalysisParams) {
      return useQuery<PriceAnalysis, Error>({
            queryKey: ['item-price-analysis', posItemId, params],
            enabled: Number.isFinite(posItemId) && posItemId > 0,
            staleTime: 5 * 60 * 1000,
            queryFn: async () => {
                  const { data, error } = await supabase.rpc('get_item_price_analysis', {
                        p_pos_item_id: posItemId,
                        p_from: params.from,
                        p_to: params.to,
                        p_bucket: params.bucket,
                        p_include_returns: params.includeReturns,
                  });
                  if (error) throw new Error(error.message);
                  return data as PriceAnalysis;
            },
      });
}
