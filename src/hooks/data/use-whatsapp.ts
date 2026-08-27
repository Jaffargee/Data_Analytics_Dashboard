import { useTableQuery } from './use-supabase';
import type { WhatsappPostRow, ItemPickerRow } from './types';

export function useWhatsappPosts(limit = 500) {
      return useTableQuery<WhatsappPostRow>('whatsApp_tracking', {
            limit,
            order: { column: 'posted_at', ascending: false },
      });
}

export function useItemsPicker(limit = 500) {
      return useTableQuery<ItemPickerRow>('items', {
            limit,
            columns: 'id, pos_item_id, item_name, category',
            order: { column: 'item_name', ascending: true },
      });
}
