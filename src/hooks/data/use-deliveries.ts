import { useTableQuery } from './use-supabase';
import type { DeliveryRow, DeliveryTripRow } from './types';

export function useDeliveries(limit = 500) {
      return useTableQuery<DeliveryRow>('deliveries', {
            limit,
            order: { column: 'created_at', ascending: false },
      });
}

export function useDeliveryTrips(limit = 200) {
      return useTableQuery<DeliveryTripRow>('delivery_trips', {
            limit,
            order: { column: 'created_at', ascending: false },
      });
}
