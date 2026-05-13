import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopBar } from '@/components/ui/TopBar';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import {
      User,
      Phone,
      Building2,
      MapPin,
      CreditCard,
      FileText,
      Edit3,
      Loader2,
      AlertCircle,
      Star,
      DollarSign,
      Mail,
      Globe,
      CheckCircle,
      XCircle,
      ChevronRight,
      Copy,
      Check,
      Banknote,
      BadgeCheck,
      MessageSquare,
      Lock,
      Hash,
      TrendingUp,
      Landmark,
} from 'lucide-react';
import { Address, ContactMethod, CustomerAccount } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────
interface CustomerDetail {
      id: string;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      company_name: string | null;
      company_email: string | null;
      company_phone: string | null;
      company_website: string | null;
      category: string;
      status_level: string;
      is_active: boolean;
      balance: number;
      credit_limit: number;
      taxable: boolean;
      non_tax_certificate_number: string | null;
      default_invoice_terms: string | null;
      disable_loyalty: boolean;
      points: number;
      auto_email_receipt: boolean;
      always_sms_receipt: boolean;
      message_to_show_when_adding_customer_to_sale: string | null;
      comments: string | null;
      internal_notes: string | null;
      created_at: string;
      updated_at?: string;
}

interface SalesAgregate {
      lifetime_value: number;
      total_purchases: number;
      avg_purchase: number;
      last_purchase_at: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtCurrency(n: number) {
      return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2,
      }).format(n);
}

function fmtDate(iso: string) {
      return new Date(iso).toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
      });
}

function initials(c: CustomerDetail) {
      const f = c.first_name?.[0] ?? '';
      const l = c.last_name?.[0] ?? '';
      return (
            (f + l).toUpperCase() || (c.company_name?.[0] ?? '?').toUpperCase()
      );
}

// ── CopyButton ────────────────────────────────────────────────────────────────
function CopyButton({ value }: { value: string }) {
      const [copied, setCopied] = useState(false);
      const copy = () => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
      };
      return (
            <button
                  onClick={copy}
                  className="ml-1.5 w-5 h-5 flex items-center justify-center rounded-md text-ink-faint hover:text-accent-gold hover:bg-accent-gold/10 transition-all"
                  aria-label="Copy"
            >
                  {copied ? (
                        <Check size={11} className="text-accent-teal" />
                  ) : (
                        <Copy size={11} />
                  )}
            </button>
      );
}

// ── StatusPill ────────────────────────────────────────────────────────────────
function StatusPill({ active }: { active: boolean }) {
      return (
            <span
                  className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-widest border',
                        active
                              ? 'bg-accent-teal/10 text-accent-teal border-accent-teal/20'
                              : 'bg-accent-red/10  text-accent-red  border-accent-red/20'
                  )}
            >
                  <span
                        className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              active ? 'bg-accent-teal' : 'bg-accent-red'
                        )}
                  />
                  {active ? 'Active' : 'Inactive'}
            </span>
      );
}

// ── LevelBadge ────────────────────────────────────────────────────────────────
const LEVEL_COLORS: Record<string, string> = {
      BRONZE: 'bg-orange-500/10 text-orange-400   border-orange-500/20',
      SILVER: 'bg-slate-400/10  text-slate-300    border-slate-400/20',
      GOLD: 'bg-accent-gold/10 text-accent-gold border-accent-gold/20',
      PLATINUM: 'bg-cyan-400/10   text-cyan-300     border-cyan-400/20',
};

function LevelBadge({ level }: { level: string }) {
      return (
            <span
                  className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-widest border',
                        LEVEL_COLORS[level] ??
                              'bg-bg-hover text-ink-faint border-bg-border'
                  )}
            >
                  <Star size={9} />
                  {level}
            </span>
      );
}

// ── Section card ──────────────────────────────────────────────────────────────
function Section({
      id,
      icon: Icon,
      title,
      children,
      className,
}: {
      id?: string;
      icon: React.ElementType;
      title: string;
      children: React.ReactNode;
      className?: string;
}) {
      return (
            <div id={id} className={cn('space-y-4', className)}>
                  <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
                              <Icon size={13} className="text-accent-gold" />
                        </div>
                        <h3 className="font-display font-semibold text-xs uppercase tracking-widest text-ink-secondary">
                              {title}
                        </h3>
                        <div className="flex-1 h-px bg-bg-border" />
                  </div>
                  <div>{children}</div>
            </div>
      );
}

// ── InfoRow ───────────────────────────────────────────────────────────────────
function InfoRow({
      label,
      value,
      copyable,
      mono,
      className,
}: {
      label: string;
      value: React.ReactNode;
      copyable?: string;
      mono?: boolean;
      className?: string;
}) {
      return (
            <div
                  className={cn(
                        'flex items-center justify-between gap-3 py-4 px-4 border-b border-bg-border/60 last:border-0',
                        className
                  )}
            >
                  <span className="text-sm font-body text-int-secondary shrink-0 mt-0.5 w-36">
                        {label}
                  </span>
                  <span
                        className={cn(
                              'text-sm text-right text-ink-primary flex items-center gap-0.5 min-w-0',
                              mono && 'font-mono text-xs'
                        )}
                  >
                        {value}
                        {copyable && <CopyButton value={copyable} />}
                  </span>
            </div>
      );
}

// ── ContactCard ───────────────────────────────────────────────────────────────
function ContactCard({ contact }: { contact: ContactMethod }) {
      const isEmail = contact.type === 'email';
      return (
            <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-bg-hover/50 border border-bg-border">
                  <div className="w-7 h-7 rounded-lg bg-bg-card border border-bg-border flex items-center justify-center shrink-0">
                        {isEmail ? (
                              <Mail size={13} className="text-accent-gold" />
                        ) : (
                              <Phone size={13} className="text-accent-gold" />
                        )}
                  </div>
                  <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-ink-faint uppercase tracking-wider">
                              {contact.type}
                        </p>
                        <p className="text-sm font-body text-ink-primary truncate">
                              {contact.value || '—'}
                        </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                        {contact.is_primary && (
                              <span className="text-[9px] font-mono uppercase tracking-widest text-accent-gold border border-accent-gold/20 bg-accent-gold/5 px-1.5 py-0.5 rounded-full">
                                    Primary
                              </span>
                        )}
                        <CopyButton value={contact.value} />
                  </div>
            </div>
      );
}

// ── AddressCard ───────────────────────────────────────────────────────────────
function AddressCard({ address }: { address: Address }) {
      const lines = [
            address.line_1,
            address.line_2,
            [address.city, address.state].filter(Boolean).join(', '),
            [address.postal_code, address.country].filter(Boolean).join(' · '),
      ].filter(Boolean);

      return (
            <div className="px-3.5 py-3 rounded-xl bg-bg-hover/50 border border-bg-border space-y-1">
                  <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-ink-faint border border-bg-border px-2 py-0.5 rounded-full">
                              {address.label}
                        </span>
                        {address.is_primary && (
                              <span className="text-[9px] font-mono uppercase tracking-widest text-accent-gold border border-accent-gold/20 bg-accent-gold/5 px-1.5 py-0.5 rounded-full">
                                    Primary
                              </span>
                        )}
                  </div>
                  {lines.map((l, i) => (
                        <p
                              key={i}
                              className={cn(
                                    'font-body text-ink-primary',
                                    i === 0
                                          ? 'text-sm'
                                          : 'text-xs text-ink-secondary'
                              )}
                        >
                              {l}
                        </p>
                  ))}
            </div>
      );
}

// ── AccountCard ───────────────────────────────────────────────────────────────
function AccountCard({ account }: { account: CustomerAccount }) {
      return (
            <div className="px-3.5 py-3 rounded-xl bg-bg-hover/50 border border-bg-border">
                  <div className="flex items-center gap-2.5 mb-2">
                        <Landmark size={13} className="text-accent-gold" />
                        <p className="text-sm font-body text-ink-primary">
                              {account.bank_name || '—'}
                        </p>
                  </div>
                  <div className="flex items-center justify-between">
                        <p className="text-xs font-mono text-ink-faint tracking-widest">
                              {account.account_no
                                    ? account.account_no.replace(
                                            /\d(?=\d{4})/g,
                                            '·'
                                      )
                                    : '—'}
                        </p>
                        <p className="text-xs font-body text-ink-secondary">
                              {account.account_name || '—'}
                        </p>
                  </div>
            </div>
      );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({
      label,
      value,
      sub,
      icon: Icon,
      accent,
}: {
      label: string;
      value: string;
      sub?: string;
      icon: React.ElementType;
      accent?: boolean;
}) {
      return (
            <div
                  className={cn(
                        'flex-1 min-w-0 rounded-2xl border p-4 flex flex-col gap-3',
                        accent
                              ? 'bg-accent-gold/5 border-accent-gold/20'
                              : 'bg-bg-hover/50 border-bg-border'
                  )}
            >
                  <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
                              {label}
                        </span>
                        <div
                              className={cn(
                                    'w-6 h-6 rounded-lg flex items-center justify-center',
                                    accent
                                          ? 'bg-accent-gold/15 border border-accent-gold/25'
                                          : 'bg-bg-card border border-bg-border'
                              )}
                        >
                              <Icon
                                    size={12}
                                    className={
                                          accent
                                                ? 'text-accent-gold'
                                                : 'text-ink-muted'
                                    }
                              />
                        </div>
                  </div>
                  <div>
                        <p
                              className={cn(
                                    'text-lg font-display font-bold leading-none',
                                    accent
                                          ? 'text-accent-gold'
                                          : 'text-ink-primary'
                              )}
                        >
                              {value}
                        </p>
                        {sub && (
                              <p className="text-[10px] font-body text-ink-faint mt-1">
                                    {sub}
                              </p>
                        )}
                  </div>
            </div>
      );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function Profile() {
      const navigate = useNavigate();
      const { id } = useParams<{ id: string }>();

      const [customer, setCustomer] = useState<CustomerDetail | null>(null);
      const [addresses, setAddresses] = useState<Address[]>([]);
      const [accounts, setAccounts] = useState<CustomerAccount[]>([]);
      const [contacts, setContacts] = useState<ContactMethod[]>([]);
      const [salesArg, setSalesArg] = useState<SalesAgregate>();
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);

      // ── Load data ─────────────────────────────────────────────────────────────
      useEffect(() => {
            if (!id) return;

            Promise.all([
                  supabase
                        .from('customers')
                        .select('*,  sales_details:v_top_customers(*)')
                        .eq('id', id)
                        .single(),
                  supabase
                        .from('customer_addresses')
                        .select('*')
                        .eq('customer_id', id)
                        .order('is_primary', { ascending: false }),
                  supabase
                        .from('customer_accounts')
                        .select('*')
                        .eq('customer_id', id),
                  supabase
                        .from('v_top_customers')
                        .select('*')
                        .eq('id', id)
                        .single(),
                  // Uncomment when customer_contacts table exists:
                  supabase
                        .from('customer_contact_methods')
                        .select('*')
                        .eq('customer_id', id),
            ]).then(([custRes, addrRes, acctRes, salesArg, contactsRes]) => {
                  if (custRes.error || !custRes.data) {
                        setError('Customer not found');
                  } else {
                        setSalesArg(salesArg.data);
                        setCustomer(custRes.data as CustomerDetail);
                        setAddresses((addrRes.data ?? []) as Address[]);
                        setAccounts((acctRes.data ?? []) as CustomerAccount[]);
                        setContacts(contactsRes.data ?? []);
                  }
                  setLoading(false);
            });
      }, [id]);

      // ── States ────────────────────────────────────────────────────────────────
      if (loading)
            return (
                  <div className="flex-1 flex flex-col min-h-screen">
                        <TopBar title="Customer Profile" />
                        <div className="flex-1 flex items-center justify-center gap-3">
                              <Loader2
                                    size={20}
                                    className="animate-spin text-accent-gold"
                              />
                              <span className="text-ink-muted font-body text-sm">
                                    Loading profile…
                              </span>
                        </div>
                  </div>
            );

      if (error || !customer)
            return (
                  <div className="flex-1 flex flex-col min-h-screen">
                        <TopBar title="Customer Profile" />
                        <div className="flex-1 flex items-center justify-center gap-3">
                              <AlertCircle
                                    size={18}
                                    className="text-accent-red"
                              />
                              <span className="text-ink-muted font-body text-sm">
                                    {error ?? 'Something went wrong'}
                              </span>
                        </div>
                  </div>
            );

      const displayName =
            [customer.first_name, customer.last_name]
                  .filter(Boolean)
                  .join(' ') ||
            customer.company_name ||
            'Unknown Customer';

      // Combine primary contact from core row + contacts table entries
      const allContacts: ContactMethod[] = [
            ...(customer.email
                  ? [
                        {
                              id: 'core-email',
                              customer_id: customer.id,
                              type: 'email' as const,
                              value: customer.email,
                              is_primary: true,
                        },
                    ]
                  : []),
            ...contacts,
      ];

      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar
                        title={displayName}
                        subtitle={`Customer Profile · #${id}`}
                        shouldNavigateBack
                  />

                  <div className="flex-1 flex min-h-0">
                        {/* ── Left panel: identity card ── */}
                        <aside className="hidden md:block w-64 flex-shrink-0 border-r border-bg-border bg-bg-panel sticky top-14 h-[calc(100vh-56px)] flex flex-col overflow-y-auto">
                              {/* Avatar block */}
                              <div className="p-5 border-b border-bg-border text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center mx-auto mb-3">
                                          <span className="text-xl font-display font-bold text-accent-gold">
                                                {initials(customer)}
                                          </span>
                                    </div>
                                    <h2 className="font-display font-bold text-base text-ink-primary mb-1 leading-snug">
                                          {displayName}
                                    </h2>
                                    {customer.company_name && (
                                          <p className="text-xs font-body text-ink-faint mb-2">
                                                {customer.company_name}
                                          </p>
                                    )}
                                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                          <StatusPill
                                                active={customer.is_active}
                                          />
                                          <LevelBadge
                                                level={customer.status_level}
                                          />
                                    </div>
                              </div>

                              {/* Quick stats */}
                              <div className="p-4 border-b border-bg-border space-y-2.5">
                                    <div className="flex items-center justify-between py-1">
                                          <span className="text-xs font-body text-ink-faint">
                                                Balance
                                          </span>
                                          <span
                                                className={cn(
                                                      'text-sm font-mono font-semibold',
                                                      customer.balance < 0
                                                            ? 'text-accent-red'
                                                            : 'text-accent-gold'
                                                )}
                                          >
                                                {fmtCurrency(customer.balance)}
                                          </span>
                                    </div>
                                    <div className="flex items-center justify-between py-1">
                                          <span className="text-xs font-body text-ink-faint">
                                                Credit Limit
                                          </span>
                                          <span className="text-sm font-mono text-ink-secondary">
                                                {fmtCurrency(
                                                      customer.credit_limit
                                                )}
                                          </span>
                                    </div>
                                    {!customer.disable_loyalty && (
                                          <div className="flex items-center justify-between py-1">
                                                <span className="text-xs font-body text-ink-faint">
                                                      Loyalty pts
                                                </span>
                                                <span className="text-sm font-mono text-accent-gold">
                                                      {customer.points.toLocaleString()}
                                                </span>
                                          </div>
                                    )}
                                    <div className="flex items-center justify-between py-1">
                                          <span className="text-xs font-body text-ink-faint">
                                                Since
                                          </span>
                                          <span className="text-xs font-mono text-ink-secondary">
                                                {fmtDate(customer.created_at)}
                                          </span>
                                    </div>
                              </div>

                              {/* Feature flags */}
                              <div className="p-4 space-y-2 border-b border-bg-border">
                                    {[
                                          {
                                                label: 'Taxable',
                                                on: customer.taxable,
                                          },
                                          {
                                                label: 'Loyalty enabled',
                                                on: !customer.disable_loyalty,
                                          },
                                          {
                                                label: 'Email receipts',
                                                on: customer.auto_email_receipt,
                                          },
                                          {
                                                label: 'SMS receipts',
                                                on: customer.always_sms_receipt,
                                          },
                                    ].map((f) => (
                                          <div
                                                key={f.label}
                                                className="flex items-center justify-between"
                                          >
                                                <span className="text-xs font-body text-ink-faint">
                                                      {f.label}
                                                </span>
                                                {f.on ? (
                                                      <CheckCircle
                                                            size={13}
                                                            className="text-accent-teal"
                                                      />
                                                ) : (
                                                      <XCircle
                                                            size={13}
                                                            className="text-ink-faint/40"
                                                      />
                                                )}
                                          </div>
                                    ))}
                              </div>

                              {/* Actions */}
                              <div className="p-3 mt-auto">
                                    <button
                                          onClick={() =>
                                                navigate(
                                                      `/customers/${id}/edit`
                                                )
                                          }
                                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-gold/15 border border-accent-gold/30 text-accent-gold text-sm font-mono font-medium hover:bg-accent-gold/25 transition-all"
                                    >
                                          <Edit3 size={14} />
                                          Edit Customer
                                    </button>
                              </div>
                        </aside>

                        {/* ── Main content ── */}
                        <main className="flex-1 min-w-0 overflow-y-auto bg-bg-base">
                              <div className="max-w-3xl mx-auto px-6 py-8 space-y-10">
                                    {/* ── Stat row ── */}
                                    <div className="grid grid-cols- gap-2">
                                          <StatCard
                                                label="Balance"
                                                value={fmtCurrency(
                                                      customer.balance
                                                )}
                                                sub="Current account balance"
                                                icon={DollarSign}
                                                accent
                                          />
                                          <StatCard
                                                label="Credit Limit"
                                                value={fmtCurrency(
                                                      customer.credit_limit
                                                )}
                                                sub="Maximum credit allowed"
                                                icon={Banknote}
                                          />
                                          {!customer.disable_loyalty && (
                                                <StatCard
                                                      label="Loyalty Points"
                                                      value={customer.points.toLocaleString()}
                                                      sub="Redeemable points balance"
                                                      icon={Star}
                                                />
                                          )}
                                          {/* ── Sales stats row ── */}
                                          {salesArg && (
                                                <div className="flex gap-3">
                                                      <StatCard
                                                            label="Total Spent"
                                                            value={fmtCurrency(
                                                                  salesArg.lifetime_value
                                                            )}
                                                            sub="Lifetime customer value"
                                                            icon={TrendingUp}
                                                            accent
                                                      />
                                                      <StatCard
                                                            label="Total Orders"
                                                            value={salesArg.total_purchases?.toLocaleString()}
                                                            sub="Number of purchases"
                                                            icon={Hash}
                                                      />
                                                      <StatCard
                                                            label="Last Purchase"
                                                            value={
                                                                  salesArg.last_purchase_at
                                                                        ? fmtDate(
                                                                                salesArg.last_purchase_at
                                                                          )
                                                                        : 'Never'
                                                            }
                                                            sub="Most recent transaction"
                                                            icon={CheckCircle}
                                                      />
                                                </div>
                                          )}
                                    </div>

                                    {/* ── POS alert banner ── */}
                                    {customer.message_to_show_when_adding_customer_to_sale && (
                                          <div className="flex items-start gap-3 bg-accent-gold/5 border border-accent-gold/20 rounded-xl px-4 py-3">
                                                <MessageSquare
                                                      size={15}
                                                      className="text-accent-gold mt-0.5 shrink-0"
                                                />
                                                <div>
                                                      <p className="text-[10px] font-mono uppercase tracking-widest text-accent-gold/70 mb-0.5">
                                                            POS Alert
                                                      </p>
                                                      <p className="text-sm font-body text-ink-primary">
                                                            {
                                                                  customer.message_to_show_when_adding_customer_to_sale
                                                            }
                                                      </p>
                                                </div>
                                          </div>
                                    )}

                                    {/* ── Identity ── */}
                                    <Section
                                          id="identity"
                                          icon={User}
                                          title="Identity"
                                    >
                                          <div className="rounded-xl border border-bg-border overflow-hidden">
                                                <InfoRow
                                                      label="Full Name"
                                                      value={displayName}
                                                      copyable={displayName}
                                                />
                                                <InfoRow
                                                      label="First Name"
                                                      value={
                                                            customer.first_name ??
                                                            '—'
                                                      }
                                                />
                                                <InfoRow
                                                      label="Last Name"
                                                      value={
                                                            customer.last_name ??
                                                            '—'
                                                      }
                                                />
                                                <InfoRow
                                                      label="Category"
                                                      value={
                                                            <span className="font-mono text-xs border border-bg-border px-2 py-0.5 rounded-full text-ink-secondary">
                                                                  {
                                                                        customer.category
                                                                  }
                                                            </span>
                                                      }
                                                />
                                                <InfoRow
                                                      label="Status Level"
                                                      value={
                                                            <LevelBadge
                                                                  level={
                                                                        customer.status_level
                                                                  }
                                                            />
                                                      }
                                                />
                                                <InfoRow
                                                      label="Account Status"
                                                      value={
                                                            <StatusPill
                                                                  active={
                                                                        customer.is_active
                                                                  }
                                                            />
                                                      }
                                                />
                                                <InfoRow
                                                      label="Customer ID"
                                                      value={customer.id}
                                                      copyable={customer.id}
                                                      mono
                                                />
                                                <InfoRow
                                                      label="Member Since"
                                                      value={fmtDate(
                                                            customer.created_at
                                                      )}
                                                />
                                          </div>
                                    </Section>

                                    {/* ── Contact ── */}
                                    {allContacts.length > 0 && (
                                          <Section
                                                id="contact"
                                                icon={Phone}
                                                title="Contact"
                                          >
                                                <div className="space-y-2">
                                                      {allContacts.map(
                                                            (c, i) => (
                                                                  <ContactCard
                                                                        key={i}
                                                                        contact={
                                                                              c
                                                                        }
                                                                  />
                                                            )
                                                      )}
                                                </div>
                                          </Section>
                                    )}

                                    {/* ── Addresses ── */}
                                    {addresses.length > 0 && (
                                          <Section
                                                id="address"
                                                icon={MapPin}
                                                title="Addresses"
                                          >
                                                <div className="space-y-2">
                                                      {addresses.map((a, i) => (
                                                            <AddressCard
                                                                  key={i}
                                                                  address={a}
                                                            />
                                                      ))}
                                                </div>
                                          </Section>
                                    )}

                                    {/* ── Bank Accounts ── */}
                                    {accounts.length > 0 && (
                                          <Section
                                                id="accounts"
                                                icon={CreditCard}
                                                title="Bank Accounts"
                                          >
                                                <div className="space-y-2">
                                                      {accounts.map((a, i) => (
                                                            <AccountCard
                                                                  key={i}
                                                                  account={a}
                                                            />
                                                      ))}
                                                </div>
                                          </Section>
                                    )}

                                    {/* ── Company ── */}
                                    {(customer.company_name ||
                                          customer.company_email ||
                                          customer.company_phone ||
                                          customer.company_website) && (
                                          <Section
                                                id="company"
                                                icon={Building2}
                                                title="Company"
                                          >
                                                <div className="rounded-xl border border-bg-border overflow-hidden">
                                                      {customer.company_name && (
                                                            <InfoRow
                                                                  label="Company Name"
                                                                  value={
                                                                        customer.company_name
                                                                  }
                                                            />
                                                      )}
                                                      {customer.company_email && (
                                                            <InfoRow
                                                                  label="Company Email"
                                                                  value={
                                                                        customer.company_email
                                                                  }
                                                                  copyable={
                                                                        customer.company_email
                                                                  }
                                                            />
                                                      )}
                                                      {customer.company_phone && (
                                                            <InfoRow
                                                                  label="Company Phone"
                                                                  value={
                                                                        customer.company_phone
                                                                  }
                                                                  copyable={
                                                                        customer.company_phone
                                                                  }
                                                            />
                                                      )}
                                                      {customer.company_website && (
                                                            <InfoRow
                                                                  label="Website"
                                                                  value={
                                                                        <a
                                                                              href={
                                                                                    customer.company_website
                                                                              }
                                                                              target="_blank"
                                                                              rel="noopener noreferrer"
                                                                              className="text-accent-gold hover:underline flex items-center gap-1"
                                                                        >
                                                                              <Globe
                                                                                    size={
                                                                                          11
                                                                                    }
                                                                              />
                                                                              {customer.company_website.replace(
                                                                                    /^https?:\/\//,
                                                                                    ''
                                                                              )}
                                                                        </a>
                                                                  }
                                                            />
                                                      )}
                                                </div>
                                          </Section>
                                    )}

                                    {/* ── Financial ── */}
                                    <Section
                                          id="financial"
                                          icon={DollarSign}
                                          title="Financial"
                                    >
                                          <div className="rounded-xl border border-bg-border overflow-hidden">
                                                <InfoRow
                                                      label="Account Balance"
                                                      value={
                                                            <span
                                                                  className={cn(
                                                                        'font-mono font-semibold',
                                                                        customer.balance <
                                                                              0
                                                                              ? 'text-accent-red'
                                                                              : 'text-accent-gold'
                                                                  )}
                                                            >
                                                                  {fmtCurrency(
                                                                        customer.balance
                                                                  )}
                                                            </span>
                                                      }
                                                />
                                                <InfoRow
                                                      label="Credit Limit"
                                                      value={
                                                            <span className="font-mono">
                                                                  {fmtCurrency(
                                                                        customer.credit_limit
                                                                  )}
                                                            </span>
                                                      }
                                                />
                                                <InfoRow
                                                      label="Taxable"
                                                      value={
                                                            customer.taxable ? (
                                                                  <span className="text-accent-teal flex items-center gap-1">
                                                                        <CheckCircle
                                                                              size={
                                                                                    13
                                                                              }
                                                                        />{' '}
                                                                        Yes
                                                                  </span>
                                                            ) : (
                                                                  <span className="text-ink-faint flex items-center gap-1">
                                                                        <XCircle
                                                                              size={
                                                                                    13
                                                                              }
                                                                        />{' '}
                                                                        No
                                                                        (exempt)
                                                                  </span>
                                                            )
                                                      }
                                                />
                                                {!customer.taxable &&
                                                      customer.non_tax_certificate_number && (
                                                            <InfoRow
                                                                  label="Tax Certificate"
                                                                  value={
                                                                        customer.non_tax_certificate_number
                                                                  }
                                                                  mono
                                                                  copyable={
                                                                        customer.non_tax_certificate_number
                                                                  }
                                                            />
                                                      )}
                                                {customer.default_invoice_terms && (
                                                      <InfoRow
                                                            label="Invoice Terms"
                                                            value={
                                                                  customer.default_invoice_terms
                                                            }
                                                      />
                                                )}
                                          </div>
                                    </Section>

                                    {/* ── Loyalty ── */}
                                    <Section
                                          id="loyalty"
                                          icon={Star}
                                          title="Loyalty"
                                    >
                                          <div className="rounded-xl border border-bg-border overflow-hidden">
                                                <InfoRow
                                                      label="Programme"
                                                      value={
                                                            customer.disable_loyalty ? (
                                                                  <span className="text-ink-faint">
                                                                        Disabled
                                                                  </span>
                                                            ) : (
                                                                  <span className="text-accent-teal flex items-center gap-1">
                                                                        <BadgeCheck
                                                                              size={
                                                                                    13
                                                                              }
                                                                        />{' '}
                                                                        Enabled
                                                                  </span>
                                                            )
                                                      }
                                                />
                                                {!customer.disable_loyalty && (
                                                      <InfoRow
                                                            label="Points Balance"
                                                            value={
                                                                  <span className="font-mono font-semibold text-accent-gold">
                                                                        {customer.points.toLocaleString()}{' '}
                                                                        pts
                                                                  </span>
                                                            }
                                                      />
                                                )}
                                          </div>
                                    </Section>

                                    {/* ── Notes ── */}
                                    {(customer.comments ||
                                          customer.internal_notes) && (
                                          <Section
                                                id="notes"
                                                icon={FileText}
                                                title="Notes"
                                          >
                                                <div className="space-y-3">
                                                      {customer.comments && (
                                                            <div className="rounded-xl border border-bg-border p-4">
                                                                  <p className="text-[9px] font-mono uppercase tracking-widest text-ink-faint mb-2 flex items-center gap-1.5">
                                                                        <FileText
                                                                              size={
                                                                                    9
                                                                              }
                                                                        />{' '}
                                                                        Comments
                                                                        (visible
                                                                        on
                                                                        invoices)
                                                                  </p>
                                                                  <p className="text-sm font-body text-ink-secondary leading-relaxed whitespace-pre-wrap">
                                                                        {
                                                                              customer.comments
                                                                        }
                                                                  </p>
                                                            </div>
                                                      )}
                                                      {customer.internal_notes && (
                                                            <div className="rounded-xl border border-bg-border p-4 bg-bg-hover/30">
                                                                  <p className="text-[9px] font-mono uppercase tracking-widest text-ink-faint mb-2 flex items-center gap-1.5">
                                                                        <Lock
                                                                              size={
                                                                                    9
                                                                              }
                                                                        />{' '}
                                                                        Internal
                                                                        Notes
                                                                        (staff
                                                                        only)
                                                                  </p>
                                                                  <p className="text-sm font-body text-ink-secondary leading-relaxed whitespace-pre-wrap">
                                                                        {
                                                                              customer.internal_notes
                                                                        }
                                                                  </p>
                                                            </div>
                                                      )}
                                                </div>
                                          </Section>
                                    )}

                                    {/* Bottom padding */}
                                    <div className="h-8" />
                              </div>
                        </main>
                  </div>
            </div>
      );
}
