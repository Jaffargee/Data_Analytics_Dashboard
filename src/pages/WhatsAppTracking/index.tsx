import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as Tabs from '@radix-ui/react-tabs';
import { TopBar } from '@/components/ui';
import { Stats, Badge, CardHeader, CardTitle, EmptyState } from '@/components/ui/primitives';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import { useWhatsappPosts, useItemsPicker } from '@/hooks/data';
import type { WhatsappPostRow, ItemPickerRow } from '@/hooks/data';
import type { StatCardProps } from '@/components/ui/controls/primitives/types';
import type { BadgeVariant } from '@/components/ui/controls/primitives/types';
import { fmt, fmtDate } from '@/lib/utils';
import { supabase } from '@/lib/services/supabase';
import { TAB_LIST_CLASS, TAB_TRIGGER_CLASS, STICKY_TAB_WRAPPER_CLASS } from '@/lib/constants/tabs';
import { MessageCircle, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import { PostPerformanceTab } from './components/PostPerformanceTab';

const MEDIA_TYPES = ['image', 'video', 'status', 'catalog', 'other'] as const;
type MediaType = (typeof MEDIA_TYPES)[number];

const MEDIA_BADGE: Record<string, BadgeVariant> = {
      image: 'gold',
      video: 'purple',
      status: 'teal',
      catalog: 'muted',
      other: 'muted',
};

const SELECT_CLASS =
      'w-full rounded-md border border-bg-border bg-bg-hover px-3 py-2 text-xs font-body text-ink-primary focus:outline-none focus:ring-1 focus:ring-accent-gold';

function LogPostsTab() {
      const queryClient = useQueryClient();
      const posts = useWhatsappPosts();
      const items = useItemsPicker();

      const [selectedItemId, setSelectedItemId] = useState<string>('');
      const [mediaType, setMediaType] = useState<MediaType>('image');
      const [submitting, setSubmitting] = useState(false);
      const [error, setError] = useState<string | null>(null);

      const postRows = posts.data?.data ?? [];
      const itemRows = items.data?.data ?? [];

      const itemById = useMemo(() => {
            const map = new Map<string, ItemPickerRow>();
            for (const item of itemRows) {
                  map.set(item.id, item);
            }
            return map;
      }, [itemRows]);

      const kpis: StatCardProps[] = [
            {
                  label: 'Posts Logged',
                  value: fmt(postRows.length),
                  icon: <MessageCircle size={14} />,
                  accent: 'teal',
                  delay: 0,
            },
            {
                  label: 'Items Featured',
                  value: fmt(new Set(postRows.map((row) => row.items_id)).size),
                  icon: <ImageIcon size={14} />,
                  accent: 'gold',
                  delay: 100,
            },
      ];

      async function handleLogPost() {
            const item = itemById.get(selectedItemId);
            if (!item) {
                  setError('Pick an item first.');
                  return;
            }
            setSubmitting(true);
            setError(null);
            const { error: insertError } = await supabase.from('whatsApp_tracking').insert({
                  items_id: item.id,
                  item_name: item.item_name,
                  media_type: mediaType,
                  posted_at: new Date().toISOString(),
            });
            setSubmitting(false);
            if (insertError) {
                  setError(insertError.message);
                  return;
            }
            setSelectedItemId('');
            queryClient.invalidateQueries({ queryKey: ['table', 'whatsApp_tracking'] });
      }

      const columns: ColumnDef<WhatsappPostRow>[] = [
            {
                  key: 'item_name',
                  label: 'Item',
                  width: '2fr',
                  render: (row) => <span className="text-xs font-body text-ink-primary truncate">{row.item_name}</span>,
            },
            {
                  key: 'media_type',
                  label: 'Media',
                  width: '1fr',
                  render: (row) => <Badge variant={MEDIA_BADGE[row.media_type] ?? 'muted'}>{row.media_type}</Badge>,
            },
            {
                  key: 'posted_at',
                  label: 'Posted',
                  sortable: true,
                  width: '1.3fr',
                  sortValue: (row) => new Date(row.posted_at).getTime(),
                  render: (row) => <span className="text-xs font-mono text-ink-secondary">{fmtDate(row.posted_at)}</span>,
            },
      ];

      return (
            <div className="space-y-6">
                  <Stats stats={kpis} />

                  <div className="px-4 sm:px-6">
                        <section className="rounded-lg border border-bg-border bg-bg-panel p-5">
                              <CardHeader><CardTitle>Log a Post</CardTitle></CardHeader>
                              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                                    <div className="flex-1 w-full">
                                          <label className="block text-[10px] uppercase tracking-wide text-ink-faint mb-1.5">Item</label>
                                          <select
                                                className={SELECT_CLASS}
                                                value={selectedItemId}
                                                onChange={(event) => setSelectedItemId(event.target.value)}
                                          >
                                                <option value="">Select an item…</option>
                                                {itemRows.map((item) => (
                                                      <option key={item.id} value={item.id}>
                                                            {item.item_name}{item.category ? ` — ${item.category}` : ''}
                                                      </option>
                                                ))}
                                          </select>
                                    </div>
                                    <div className="w-full sm:w-40">
                                          <label className="block text-[10px] uppercase tracking-wide text-ink-faint mb-1.5">Media Type</label>
                                          <select
                                                className={SELECT_CLASS}
                                                value={mediaType}
                                                onChange={(event) => setMediaType(event.target.value as MediaType)}
                                          >
                                                {MEDIA_TYPES.map((type) => (
                                                      <option key={type} value={type}>{type}</option>
                                                ))}
                                          </select>
                                    </div>
                                    <button
                                          type="button"
                                          onClick={handleLogPost}
                                          disabled={submitting || !selectedItemId}
                                          className="flex items-center justify-center gap-2 rounded-md bg-accent-gold/15 px-4 py-2 text-xs font-body text-accent-gold border border-accent-gold/30 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-gold/25 transition-colors w-full sm:w-auto"
                                    >
                                          {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                                          Log Post
                                    </button>
                              </div>
                              {error && <p className="text-xs text-accent-red mt-2">{error}</p>}
                              <p className="text-[11px] text-ink-faint mt-3">
                                    Posted-at is stamped as "now" — log it right when you post for accurate timing.
                              </p>
                        </section>
                  </div>

                  <div className="px-4 sm:px-6">
                        {posts.isLoading ? (
                              <div className="h-40 animate-pulse rounded-lg bg-bg-hover" />
                        ) : postRows.length ? (
                              <DataTable
                                    data={postRows}
                                    columns={columns}
                                    getRowId={(row) => row.id}
                                    ariaLabel="WhatsApp posts"
                                    emptyMessage="No posts logged yet."
                                    defaultSortKey="posted_at"
                                    defaultSortDir="desc"
                              />
                        ) : (
                              <EmptyState message="No posts logged yet — log your first one above." />
                        )}
                  </div>
            </div>
      );
}

export default function WhatsAppTrackingPage() {
      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar
                        title="WhatsApp Post Tracking"
                        subtitle="Log what you post so you can see which posts move product"
                  />
                  <main className="flex-1 pb-8">
                        <Tabs.Root defaultValue="log">
                              <div className={`px-4 sm:px-6 ${STICKY_TAB_WRAPPER_CLASS}`}>
                                    <Tabs.List className={TAB_LIST_CLASS}>
                                          <Tabs.Trigger value="log" className={TAB_TRIGGER_CLASS}>Log Posts</Tabs.Trigger>
                                          <Tabs.Trigger value="performance" className={TAB_TRIGGER_CLASS}>Post Performance</Tabs.Trigger>
                                    </Tabs.List>
                              </div>

                              <Tabs.Content value="log" className="mt-6">
                                    <LogPostsTab />
                              </Tabs.Content>

                              <Tabs.Content value="performance" className="mt-6">
                                    <PostPerformanceTab />
                              </Tabs.Content>
                        </Tabs.Root>
                  </main>
            </div>
      );
}
