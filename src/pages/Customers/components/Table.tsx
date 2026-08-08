import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopCustomer } from '../../../lib/supabase';
import Badge from '../../../components/ui/primitives/Badge';
import Button from '../../../components/ui/Button';
import { fmt, fmtCurrency, fmtDate } from '../../../lib/utils';
import { Edit3, User } from 'lucide-react';
import DataTable, { ColumnDef } from '../../../components/ui/DataTable';

interface CustomerTableProps {
      customers: TopCustomer[];
}

const Table = ({ customers }: CustomerTableProps) => {
      const navigate = useNavigate();

      const maxLTV = useMemo(
            () => Math.max(...customers.map((c) => Number(c.lifetime_value)), 1),
            [customers]
      );

      const goToProfile = (c: TopCustomer) => {
            navigate(`/customers/customer/${c.pos_customer_id}?ctm_name=${encodeURIComponent(c.customer_name)}`);
      };

      const status_color = {
            // diamond: "#B9F2FF",
            silver: "#C0C0C0",
            // gold: "#D4AF37",
            // platinum: "#E5E4E2"
            diamond: "teal",
            gold: "gold",
            platinum: "purple",
      }

      const columns: ColumnDef<TopCustomer>[] = [
            {
                  key: 'customer_name',
                  label: 'Customer',
                  sortable: true,
                  width: '2.2fr',
                  sortValue: (c) => c.customer_name?.toLowerCase() ?? '',
                  render: (c) => (
                        <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                    aria-hidden="true"
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                                    bg-gradient-to-br from-accent-gold/25 to-accent-gold/5 text-accent-gold
                                    text-xs font-semibold font-mono ring-1 ring-accent-gold/20"
                              >
                                    {c.customer_name?.charAt(0).toUpperCase() ?? '?'}
                              </div>
                              <div className="min-w-0">
                                    <p className="text-xs font-body text-ink-primary group-hover:text-accent-gold transition-colors truncate">
                                          {c.customer_name}
                                    </p>
                                    <p className="text-[14px] text-ink-muted font-mono">
                                          #{c.pos_customer_id}
                                    </p>
                              </div>
                        </div>
                  ),
            },
            {
                  key: 'status_level',
                  label: 'Status Level',
                  sortable: false,
                  width: '2.2fr',
                  sortValue: (c) => c.customer_name?.toLowerCase() ?? '',
                  render: (c) => (
                        <div className="flex items-center gap-2.5 min-w-0">
                              <Badge variant={(status_color[c.status_level.toLowerCase() as keyof typeof status_color] ?? 'muted') as import('@/components/ui/primitives/Badge').BadgeVariant}>{c.status_level}</Badge>
                        </div>
                  ),
            },
            {
                  key: 'category',
                  label: 'Category',
                  sortable: false,
                  width: '2.2fr',
                  sortValue: (c) => c.customer_name?.toLowerCase() ?? '',
                  render: (c) => (
                        <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-ink-muted">{c.category}</span>
                        </div>
                  ),
            },
            {
                  key: 'total_purchases',
                  label: 'Purchases',
                  sortable: true,
                  width: '1fr',
                  sortValue: (c) => Number(c.total_purchases) || 0,
                  render: (c) => (
                        <Badge
                              variant={
                                    Number(c.total_purchases) > 5
                                          ? 'teal'
                                          : Number(c.total_purchases) > 1
                                                ? 'gold'
                                                : 'muted'
                              }
                        >
                              {fmt(c.total_purchases)}
                        </Badge>
                  ),
            },
            {
                  key: 'lifetime_value',
                  label: 'Lifetime Value',
                  sortable: true,
                  width: '2.3fr',
                  sortValue: (c) => Number(c.lifetime_value) || 0,
                  render: (c) => (
                        <>
                              <p className="text-xs font-mono text-accent-gold font-medium">
                                    {fmtCurrency(c.lifetime_value)}
                              </p>
                              <div
                                    role="progressbar"
                                    aria-valuenow={Number(c.lifetime_value)}
                                    aria-valuemin={0}
                                    aria-valuemax={maxLTV}
                                    aria-label="Lifetime value relative to top customer"
                                    className="mt-1.5 h-1.5 w-30 rounded-full bg-bg-border/60 overflow-hidden"
                              >
                                    <div
                                          className="h-full rounded-full bg-gradient-to-r from-accent-gold/70 to-accent-gold"
                                          style={{
                                                width: `${Math.min((Number(c.lifetime_value) / maxLTV) * 100, 100)}%`,
                                          }}
                                    />
                              </div>
                        </>
                  ),
            },
            {
                  key: 'avg_purchase',
                  label: 'Avg Purchase',
                  sortable: true,
                  width: '1.1fr',
                  sortValue: (c) => Number(c.avg_purchase) || 0,
                  render: (c) => (
                        <span className="text-xs font-mono text-ink-secondary">
                              {fmtCurrency(c.avg_purchase)}
                        </span>
                  ),
            },
            {
                  key: 'last_purchase_at',
                  label: 'Last Seen',
                  sortable: true,
                  width: '1.1fr',
                  sortValue: (c) => (c.last_purchase_at ? new Date(c.last_purchase_at).getTime() : 0),
                  render: (c) => (
                        <span className="text-xs font-mono text-ink-muted">
                              {c.last_purchase_at ? fmtDate(c.last_purchase_at) : '—'}
                        </span>
                  ),
            },
      ];

      return (
            <DataTable
                  data={customers}
                  columns={columns}
                  getRowId={(c) => c.pos_customer_id}
                  onRowClick={goToProfile}
                  ariaLabel="Customer directory"
                  emptyMessage="No customers found"
                  defaultSortKey="lifetime_value"
                  defaultSortDir="desc"
                  maxRows={500}
                  actionsWidth="1.4fr"
                  actions={(c) => (
                        <>
                              <Button
                                    size="sm"
                                    radius="full"
                                    variant="accent"
                                    type="button"
                                    icon={<Edit3 size={14} aria-hidden="true" />}
                                    aria-label={`Edit ${c.customer_name}`}
                                    onClick={() => navigate(`/customers/${c.id}/edit`)}
                              >
                                    <span>Edit</span>
                              </Button>
                              <Button
                                    size="sm"
                                    radius="full"
                                    variant="accent"
                                    type="button"
                                    icon={<User size={14} aria-hidden="true" />}
                                    aria-label={`View profile for ${c.customer_name}`}
                                    onClick={() =>
                                          navigate(
                                                `/customers/customer/profile/${c.id}?id=${c.id}&pos_cid=${c.pos_customer_id}`
                                          )
                                    }
                              >
                                    <span>Profile</span>
                              </Button>
                        </>
                  )}
            />
      );
};

export default Table;
