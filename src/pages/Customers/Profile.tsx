// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { TopBar } from '@/components/ui/TopBar';
// import { supabase } from '@/lib/supabase';
// import { cn } from '@/lib/utils';
// import {
//       User,
//       Phone,
//       Building2,
//       MapPin,
//       CreditCard,
//       FileText,
//       Edit3,
//       Loader2,
//       AlertCircle,
//       Star,
//       DollarSign,
//       Mail,
//       Globe,
//       CheckCircle,
//       XCircle,
//       ChevronRight,
//       Copy,
//       Check,
//       Banknote,
//       BadgeCheck,
//       MessageSquare,
//       Lock,
//       Hash,
//       TrendingUp,
//       Landmark,
// } from 'lucide-react';
// import { Address, ContactMethod, CustomerAccount } from '@/types';

// // ── Types ─────────────────────────────────────────────────────────────────────
// interface CustomerDetail {
//       id: string;
//       first_name: string | null;
//       last_name: string | null;
//       email: string | null;
//       company_name: string | null;
//       company_email: string | null;
//       company_phone: string | null;
//       company_website: string | null;
//       category: string;
//       status_level: string;
//       is_active: boolean;
//       balance: number;
//       credit_limit: number;
//       taxable: boolean;
//       non_tax_certificate_number: string | null;
//       default_invoice_terms: string | null;
//       disable_loyalty: boolean;
//       points: number;
//       auto_email_receipt: boolean;
//       always_sms_receipt: boolean;
//       message_to_show_when_adding_customer_to_sale: string | null;
//       comments: string | null;
//       internal_notes: string | null;
//       created_at: string;
//       updated_at?: string;
// }

// interface SalesAgregate {
//       lifetime_value: number;
//       total_purchases: number;
//       avg_purchase: number;
//       last_purchase_at: string | null;
// }

// // ── Helpers ───────────────────────────────────────────────────────────────────
// function fmtCurrency(n: number) {
//       return new Intl.NumberFormat('en-NG', {
//             style: 'currency',
//             currency: 'NGN',
//             minimumFractionDigits: 2,
//       }).format(n);
// }

// function fmtDate(iso: string) {
//       return new Date(iso).toLocaleDateString('en-NG', {
//             day: 'numeric',
//             month: 'short',
//             year: 'numeric',
//       });
// }

// function initials(c: CustomerDetail) {
//       const f = c.first_name?.[0] ?? '';
//       const l = c.last_name?.[0] ?? '';
//       return (
//             (f + l).toUpperCase() || (c.company_name?.[0] ?? '?').toUpperCase()
//       );
// }

// // ── CopyButton ────────────────────────────────────────────────────────────────
// function CopyButton({ value }: { value: string }) {
//       const [copied, setCopied] = useState(false);
//       const copy = () => {
//             navigator.clipboard.writeText(value);
//             setCopied(true);
//             setTimeout(() => setCopied(false), 1800);
//       };
//       return (
//             <button
//                   onClick={copy}
//                   className="ml-1.5 w-5 h-5 flex items-center justify-center rounded-md text-ink-faint hover:text-accent-gold hover:bg-accent-gold/10 transition-all"
//                   aria-label="Copy"
//             >
//                   {copied ? (
//                         <Check size={11} className="text-accent-teal" />
//                   ) : (
//                         <Copy size={11} />
//                   )}
//             </button>
//       );
// }

// // ── StatusPill ────────────────────────────────────────────────────────────────
// function StatusPill({ active }: { active: boolean }) {
//       return (
//             <span
//                   className={cn(
//                         'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-widest border',
//                         active
//                               ? 'bg-accent-teal/10 text-accent-teal border-accent-teal/20'
//                               : 'bg-accent-red/10  text-accent-red  border-accent-red/20'
//                   )}
//             >
//                   <span
//                         className={cn(
//                               'w-1.5 h-1.5 rounded-full',
//                               active ? 'bg-accent-teal' : 'bg-accent-red'
//                         )}
//                   />
//                   {active ? 'Active' : 'Inactive'}
//             </span>
//       );
// }

// // ── LevelBadge ────────────────────────────────────────────────────────────────
// const LEVEL_COLORS: Record<string, string> = {
//       BRONZE: 'bg-orange-500/10 text-orange-400   border-orange-500/20',
//       SILVER: 'bg-slate-400/10  text-slate-300    border-slate-400/20',
//       GOLD: 'bg-accent-gold/10 text-accent-gold border-accent-gold/20',
//       PLATINUM: 'bg-cyan-400/10   text-cyan-300     border-cyan-400/20',
// };

// function LevelBadge({ level }: { level: string }) {
//       return (
//             <span
//                   className={cn(
//                         'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-widest border',
//                         LEVEL_COLORS[level] ??
//                               'bg-bg-hover text-ink-faint border-bg-border'
//                   )}
//             >
//                   <Star size={9} />
//                   {level}
//             </span>
//       );
// }

// // ── Section card ──────────────────────────────────────────────────────────────
// function Section({
//       id,
//       icon: Icon,
//       title,
//       children,
//       className,
// }: {
//       id?: string;
//       icon: React.ElementType;
//       title: string;
//       children: React.ReactNode;
//       className?: string;
// }) {
//       return (
//             <div id={id} className={cn('space-y-4', className)}>
//                   <div className="flex items-center gap-3">
//                         <div className="w-7 h-7 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
//                               <Icon size={13} className="text-accent-gold" />
//                         </div>
//                         <h3 className="font-display font-semibold text-xs uppercase tracking-widest text-ink-secondary">
//                               {title}
//                         </h3>
//                         <div className="flex-1 h-px bg-bg-border" />
//                   </div>
//                   <div>{children}</div>
//             </div>
//       );
// }

// // ── InfoRow ───────────────────────────────────────────────────────────────────
// function InfoRow({
//       label,
//       value,
//       copyable,
//       mono,
//       className,
// }: {
//       label: string;
//       value: React.ReactNode;
//       copyable?: string;
//       mono?: boolean;
//       className?: string;
// }) {
//       return (
//             <div
//                   className={cn(
//                         'flex items-center justify-between gap-3 py-4 px-4 border-b border-bg-border/60 last:border-0',
//                         className
//                   )}
//             >
//                   <span className="text-sm font-body text-int-secondary shrink-0 mt-0.5 w-36">
//                         {label}
//                   </span>
//                   <span
//                         className={cn(
//                               'text-sm text-right text-ink-primary flex items-center gap-0.5 min-w-0',
//                               mono && 'font-mono text-xs'
//                         )}
//                   >
//                         {value}
//                         {copyable && <CopyButton value={copyable} />}
//                   </span>
//             </div>
//       );
// }

// // ── ContactCard ───────────────────────────────────────────────────────────────
// function ContactCard({ contact }: { contact: ContactMethod }) {
//       const isEmail = contact.type === 'email';
//       return (
//             <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-bg-hover/50 border border-bg-border">
//                   <div className="w-7 h-7 rounded-lg bg-bg-card border border-bg-border flex items-center justify-center shrink-0">
//                         {isEmail ? (
//                               <Mail size={13} className="text-accent-gold" />
//                         ) : (
//                               <Phone size={13} className="text-accent-gold" />
//                         )}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                         <p className="text-xs font-mono text-ink-faint uppercase tracking-wider">
//                               {contact.type}
//                         </p>
//                         <p className="text-sm font-body text-ink-primary truncate">
//                               {contact.value || '—'}
//                         </p>
//                   </div>
//                   <div className="flex items-center gap-2 shrink-0">
//                         {contact.is_primary && (
//                               <span className="text-[9px] font-mono uppercase tracking-widest text-accent-gold border border-accent-gold/20 bg-accent-gold/5 px-1.5 py-0.5 rounded-full">
//                                     Primary
//                               </span>
//                         )}
//                         <CopyButton value={contact.value} />
//                   </div>
//             </div>
//       );
// }

// // ── AddressCard ───────────────────────────────────────────────────────────────
// function AddressCard({ address }: { address: Address }) {
//       const lines = [
//             address.line_1,
//             address.line_2,
//             [address.city, address.state].filter(Boolean).join(', '),
//             [address.postal_code, address.country].filter(Boolean).join(' · '),
//       ].filter(Boolean);

//       return (
//             <div className="px-3.5 py-3 rounded-xl bg-bg-hover/50 border border-bg-border space-y-1">
//                   <div className="flex items-center justify-between mb-1">
//                         <span className="text-[9px] font-mono uppercase tracking-widest text-ink-faint border border-bg-border px-2 py-0.5 rounded-full">
//                               {address.label}
//                         </span>
//                         {address.is_primary && (
//                               <span className="text-[9px] font-mono uppercase tracking-widest text-accent-gold border border-accent-gold/20 bg-accent-gold/5 px-1.5 py-0.5 rounded-full">
//                                     Primary
//                               </span>
//                         )}
//                   </div>
//                   {lines.map((l, i) => (
//                         <p
//                               key={i}
//                               className={cn(
//                                     'font-body text-ink-primary',
//                                     i === 0
//                                           ? 'text-sm'
//                                           : 'text-xs text-ink-secondary'
//                               )}
//                         >
//                               {l}
//                         </p>
//                   ))}
//             </div>
//       );
// }

// // ── AccountCard ───────────────────────────────────────────────────────────────
// function AccountCard({ account }: { account: CustomerAccount }) {
//       return (
//             <div className="px-3.5 py-3 rounded-xl bg-bg-hover/50 border border-bg-border">
//                   <div className="flex items-center gap-2.5 mb-2">
//                         <Landmark size={13} className="text-accent-gold" />
//                         <p className="text-sm font-body text-ink-primary">
//                               {account.bank_name || '—'}
//                         </p>
//                   </div>
//                   <div className="flex items-center justify-between">
//                         <p className="text-xs font-mono text-ink-faint tracking-widest">
//                               {account.account_no
//                                     ? account.account_no.replace(
//                                             /\d(?=\d{4})/g,
//                                             '·'
//                                       )
//                                     : '—'}
//                         </p>
//                         <p className="text-xs font-body text-ink-secondary">
//                               {account.account_name || '—'}
//                         </p>
//                   </div>
//             </div>
//       );
// }

// // ── StatCard ──────────────────────────────────────────────────────────────────
// function StatCard({
//       label,
//       value,
//       sub,
//       icon: Icon,
//       accent,
// }: {
//       label: string;
//       value: string;
//       sub?: string;
//       icon: React.ElementType;
//       accent?: boolean;
// }) {
//       return (
//             <div
//                   className={cn(
//                         'flex-1 min-w-0 rounded-2xl border p-4 flex flex-col gap-3',
//                         accent
//                               ? 'bg-accent-gold/5 border-accent-gold/20'
//                               : 'bg-bg-hover/50 border-bg-border'
//                   )}
//             >
//                   <div className="flex items-center justify-between">
//                         <span className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
//                               {label}
//                         </span>
//                         <div
//                               className={cn(
//                                     'w-6 h-6 rounded-lg flex items-center justify-center',
//                                     accent
//                                           ? 'bg-accent-gold/15 border border-accent-gold/25'
//                                           : 'bg-bg-card border border-bg-border'
//                               )}
//                         >
//                               <Icon
//                                     size={12}
//                                     className={
//                                           accent
//                                                 ? 'text-accent-gold'
//                                                 : 'text-ink-muted'
//                                     }
//                               />
//                         </div>
//                   </div>
//                   <div>
//                         <p
//                               className={cn(
//                                     'text-lg font-display font-bold leading-none',
//                                     accent
//                                           ? 'text-accent-gold'
//                                           : 'text-ink-primary'
//                               )}
//                         >
//                               {value}
//                         </p>
//                         {sub && (
//                               <p className="text-[10px] font-body text-ink-faint mt-1">
//                                     {sub}
//                               </p>
//                         )}
//                   </div>
//             </div>
//       );
// }

// // ══════════════════════════════════════════════════════════════════════════════
// // MAIN PAGE
// // ══════════════════════════════════════════════════════════════════════════════
// export default function Profile() {
//       const navigate = useNavigate();
//       const { id } = useParams<{ id: string }>();

//       const [customer, setCustomer] = useState<CustomerDetail | null>(null);
//       const [addresses, setAddresses] = useState<Address[]>([]);
//       const [accounts, setAccounts] = useState<CustomerAccount[]>([]);
//       const [contacts, setContacts] = useState<ContactMethod[]>([]);
//       const [salesArg, setSalesArg] = useState<SalesAgregate>();
//       const [loading, setLoading] = useState(true);
//       const [error, setError] = useState<string | null>(null);

//       // ── Load data ─────────────────────────────────────────────────────────────
//       useEffect(() => {
//             if (!id) return;

//             Promise.all([
//                   supabase
//                         .from('customers')
//                         .select('*,  sales_details:v_top_customers(*)')
//                         .eq('id', id)
//                         .single(),
//                   supabase
//                         .from('customer_addresses')
//                         .select('*')
//                         .eq('customer_id', id)
//                         .order('is_primary', { ascending: false }),
//                   supabase
//                         .from('customer_accounts')
//                         .select('*')
//                         .eq('customer_id', id),
//                   supabase
//                         .from('v_top_customers')
//                         .select('*')
//                         .eq('id', id)
//                         .single(),
//                   // Uncomment when customer_contacts table exists:
//                   supabase
//                         .from('customer_contact_methods')
//                         .select('*')
//                         .eq('customer_id', id),
//             ]).then(([custRes, addrRes, acctRes, salesArg, contactsRes]) => {
//                   if (custRes.error || !custRes.data) {
//                         setError('Customer not found');
//                   } else {
//                         setSalesArg(salesArg.data);
//                         setCustomer(custRes.data as CustomerDetail);
//                         setAddresses((addrRes.data ?? []) as Address[]);
//                         setAccounts((acctRes.data ?? []) as CustomerAccount[]);
//                         setContacts(contactsRes.data ?? []);
//                   }
//                   setLoading(false);
//             });
//       }, [id]);

//       // ── States ────────────────────────────────────────────────────────────────
//       if (loading)
//             return (
//                   <div className="flex-1 flex flex-col min-h-screen">
//                         <TopBar title="Customer Profile" />
//                         <div className="flex-1 flex items-center justify-center gap-3">
//                               <Loader2
//                                     size={20}
//                                     className="animate-spin text-accent-gold"
//                               />
//                               <span className="text-ink-muted font-body text-sm">
//                                     Loading profile…
//                               </span>
//                         </div>
//                   </div>
//             );

//       if (error || !customer)
//             return (
//                   <div className="flex-1 flex flex-col min-h-screen">
//                         <TopBar title="Customer Profile" />
//                         <div className="flex-1 flex items-center justify-center gap-3">
//                               <AlertCircle
//                                     size={18}
//                                     className="text-accent-red"
//                               />
//                               <span className="text-ink-muted font-body text-sm">
//                                     {error ?? 'Something went wrong'}
//                               </span>
//                         </div>
//                   </div>
//             );

//       const displayName =
//             [customer.first_name, customer.last_name]
//                   .filter(Boolean)
//                   .join(' ') ||
//             customer.company_name ||
//             'Unknown Customer';

//       // Combine primary contact from core row + contacts table entries
//       const allContacts: ContactMethod[] = [
//             ...(customer.email
//                   ? [
//                         {
//                               id: 'core-email',
//                               customer_id: customer.id,
//                               type: 'email' as const,
//                               value: customer.email,
//                               is_primary: true,
//                         },
//                     ]
//                   : []),
//             ...contacts,
//       ];

//       return (
//             <div className="flex-1 flex flex-col min-h-screen">
//                   <TopBar
//                         title={displayName}
//                         subtitle={`Customer Profile · #${id}`}
//                         shouldNavigateBack
//                   />

//                   <div className="flex-1 flex min-h-0">
//                         {/* ── Left panel: identity card ── */}
//                         <aside className="hidden md:block w-64 flex-shrink-0 border-r border-bg-border bg-bg-panel sticky top-14 h-[calc(100vh-56px)] flex flex-col overflow-y-auto">
//                               {/* Avatar block */}
//                               <div className="p-5 border-b border-bg-border text-center">
//                                     <div className="w-16 h-16 rounded-2xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center mx-auto mb-3">
//                                           <span className="text-xl font-display font-bold text-accent-gold">
//                                                 {initials(customer)}
//                                           </span>
//                                     </div>
//                                     <h2 className="font-display font-bold text-base text-ink-primary mb-1 leading-snug">
//                                           {displayName}
//                                     </h2>
//                                     {customer.company_name && (
//                                           <p className="text-xs font-body text-ink-faint mb-2">
//                                                 {customer.company_name}
//                                           </p>
//                                     )}
//                                     <div className="flex items-center justify-center gap-1.5 flex-wrap">
//                                           <StatusPill
//                                                 active={customer.is_active}
//                                           />
//                                           <LevelBadge
//                                                 level={customer.status_level}
//                                           />
//                                     </div>
//                               </div>

//                               {/* Quick stats */}
//                               <div className="p-4 border-b border-bg-border space-y-2.5">
//                                     <div className="flex items-center justify-between py-1">
//                                           <span className="text-xs font-body text-ink-faint">
//                                                 Balance
//                                           </span>
//                                           <span
//                                                 className={cn(
//                                                       'text-sm font-mono font-semibold',
//                                                       customer.balance < 0
//                                                             ? 'text-accent-red'
//                                                             : 'text-accent-gold'
//                                                 )}
//                                           >
//                                                 {fmtCurrency(customer.balance)}
//                                           </span>
//                                     </div>
//                                     <div className="flex items-center justify-between py-1">
//                                           <span className="text-xs font-body text-ink-faint">
//                                                 Credit Limit
//                                           </span>
//                                           <span className="text-sm font-mono text-ink-secondary">
//                                                 {fmtCurrency(
//                                                       customer.credit_limit
//                                                 )}
//                                           </span>
//                                     </div>
//                                     {!customer.disable_loyalty && (
//                                           <div className="flex items-center justify-between py-1">
//                                                 <span className="text-xs font-body text-ink-faint">
//                                                       Loyalty pts
//                                                 </span>
//                                                 <span className="text-sm font-mono text-accent-gold">
//                                                       {customer.points.toLocaleString()}
//                                                 </span>
//                                           </div>
//                                     )}
//                                     <div className="flex items-center justify-between py-1">
//                                           <span className="text-xs font-body text-ink-faint">
//                                                 Since
//                                           </span>
//                                           <span className="text-xs font-mono text-ink-secondary">
//                                                 {fmtDate(customer.created_at)}
//                                           </span>
//                                     </div>
//                               </div>

//                               {/* Feature flags */}
//                               <div className="p-4 space-y-2 border-b border-bg-border">
//                                     {[
//                                           {
//                                                 label: 'Taxable',
//                                                 on: customer.taxable,
//                                           },
//                                           {
//                                                 label: 'Loyalty enabled',
//                                                 on: !customer.disable_loyalty,
//                                           },
//                                           {
//                                                 label: 'Email receipts',
//                                                 on: customer.auto_email_receipt,
//                                           },
//                                           {
//                                                 label: 'SMS receipts',
//                                                 on: customer.always_sms_receipt,
//                                           },
//                                     ].map((f) => (
//                                           <div
//                                                 key={f.label}
//                                                 className="flex items-center justify-between"
//                                           >
//                                                 <span className="text-xs font-body text-ink-faint">
//                                                       {f.label}
//                                                 </span>
//                                                 {f.on ? (
//                                                       <CheckCircle
//                                                             size={13}
//                                                             className="text-accent-teal"
//                                                       />
//                                                 ) : (
//                                                       <XCircle
//                                                             size={13}
//                                                             className="text-ink-faint/40"
//                                                       />
//                                                 )}
//                                           </div>
//                                     ))}
//                               </div>

//                               {/* Actions */}
//                               <div className="p-3 mt-auto">
//                                     <button
//                                           onClick={() =>
//                                                 navigate(
//                                                       `/customers/${id}/edit`
//                                                 )
//                                           }
//                                           className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-gold/15 border border-accent-gold/30 text-accent-gold text-sm font-mono font-medium hover:bg-accent-gold/25 transition-all"
//                                     >
//                                           <Edit3 size={14} />
//                                           Edit Customer
//                                     </button>
//                               </div>
//                         </aside>

//                         {/* ── Main content ── */}
//                         <main className="flex-1 min-w-0 overflow-y-auto bg-bg-base">
//                               <div className="max-w-3xl mx-auto px-6 py-8 space-y-10">
//                                     {/* ── Stat row ── */}
//                                     <div className="grid grid-cols- gap-2">
//                                           <StatCard
//                                                 label="Balance"
//                                                 value={fmtCurrency(
//                                                       customer.balance
//                                                 )}
//                                                 sub="Current account balance"
//                                                 icon={DollarSign}
//                                                 accent
//                                           />
//                                           <StatCard
//                                                 label="Credit Limit"
//                                                 value={fmtCurrency(
//                                                       customer.credit_limit
//                                                 )}
//                                                 sub="Maximum credit allowed"
//                                                 icon={Banknote}
//                                           />
//                                           {!customer.disable_loyalty && (
//                                                 <StatCard
//                                                       label="Loyalty Points"
//                                                       value={customer.points.toLocaleString()}
//                                                       sub="Redeemable points balance"
//                                                       icon={Star}
//                                                 />
//                                           )}
//                                           {/* ── Sales stats row ── */}
//                                           {salesArg && (
//                                                 <div className="flex gap-3">
//                                                       <StatCard
//                                                             label="Total Spent"
//                                                             value={fmtCurrency(
//                                                                   salesArg.lifetime_value
//                                                             )}
//                                                             sub="Lifetime customer value"
//                                                             icon={TrendingUp}
//                                                             accent
//                                                       />
//                                                       <StatCard
//                                                             label="Total Orders"
//                                                             value={salesArg.total_purchases?.toLocaleString()}
//                                                             sub="Number of purchases"
//                                                             icon={Hash}
//                                                       />
//                                                       <StatCard
//                                                             label="Last Purchase"
//                                                             value={
//                                                                   salesArg.last_purchase_at
//                                                                         ? fmtDate(
//                                                                                 salesArg.last_purchase_at
//                                                                           )
//                                                                         : 'Never'
//                                                             }
//                                                             sub="Most recent transaction"
//                                                             icon={CheckCircle}
//                                                       />
//                                                 </div>
//                                           )}
//                                     </div>

//                                     {/* ── POS alert banner ── */}
//                                     {customer.message_to_show_when_adding_customer_to_sale && (
//                                           <div className="flex items-start gap-3 bg-accent-gold/5 border border-accent-gold/20 rounded-xl px-4 py-3">
//                                                 <MessageSquare
//                                                       size={15}
//                                                       className="text-accent-gold mt-0.5 shrink-0"
//                                                 />
//                                                 <div>
//                                                       <p className="text-[10px] font-mono uppercase tracking-widest text-accent-gold/70 mb-0.5">
//                                                             POS Alert
//                                                       </p>
//                                                       <p className="text-sm font-body text-ink-primary">
//                                                             {
//                                                                   customer.message_to_show_when_adding_customer_to_sale
//                                                             }
//                                                       </p>
//                                                 </div>
//                                           </div>
//                                     )}

//                                     {/* ── Identity ── */}
//                                     <Section
//                                           id="identity"
//                                           icon={User}
//                                           title="Identity"
//                                     >
//                                           <div className="rounded-xl border border-bg-border overflow-hidden">
//                                                 <InfoRow
//                                                       label="Full Name"
//                                                       value={displayName}
//                                                       copyable={displayName}
//                                                 />
//                                                 <InfoRow
//                                                       label="First Name"
//                                                       value={
//                                                             customer.first_name ??
//                                                             '—'
//                                                       }
//                                                 />
//                                                 <InfoRow
//                                                       label="Last Name"
//                                                       value={
//                                                             customer.last_name ??
//                                                             '—'
//                                                       }
//                                                 />
//                                                 <InfoRow
//                                                       label="Category"
//                                                       value={
//                                                             <span className="font-mono text-xs border border-bg-border px-2 py-0.5 rounded-full text-ink-secondary">
//                                                                   {
//                                                                         customer.category
//                                                                   }
//                                                             </span>
//                                                       }
//                                                 />
//                                                 <InfoRow
//                                                       label="Status Level"
//                                                       value={
//                                                             <LevelBadge
//                                                                   level={
//                                                                         customer.status_level
//                                                                   }
//                                                             />
//                                                       }
//                                                 />
//                                                 <InfoRow
//                                                       label="Account Status"
//                                                       value={
//                                                             <StatusPill
//                                                                   active={
//                                                                         customer.is_active
//                                                                   }
//                                                             />
//                                                       }
//                                                 />
//                                                 <InfoRow
//                                                       label="Customer ID"
//                                                       value={customer.id}
//                                                       copyable={customer.id}
//                                                       mono
//                                                 />
//                                                 <InfoRow
//                                                       label="Member Since"
//                                                       value={fmtDate(
//                                                             customer.created_at
//                                                       )}
//                                                 />
//                                           </div>
//                                     </Section>

//                                     {/* ── Contact ── */}
//                                     {allContacts.length > 0 && (
//                                           <Section
//                                                 id="contact"
//                                                 icon={Phone}
//                                                 title="Contact"
//                                           >
//                                                 <div className="space-y-2">
//                                                       {allContacts.map(
//                                                             (c, i) => (
//                                                                   <ContactCard
//                                                                         key={i}
//                                                                         contact={
//                                                                               c
//                                                                         }
//                                                                   />
//                                                             )
//                                                       )}
//                                                 </div>
//                                           </Section>
//                                     )}

//                                     {/* ── Addresses ── */}
//                                     {addresses.length > 0 && (
//                                           <Section
//                                                 id="address"
//                                                 icon={MapPin}
//                                                 title="Addresses"
//                                           >
//                                                 <div className="space-y-2">
//                                                       {addresses.map((a, i) => (
//                                                             <AddressCard
//                                                                   key={i}
//                                                                   address={a}
//                                                             />
//                                                       ))}
//                                                 </div>
//                                           </Section>
//                                     )}

//                                     {/* ── Bank Accounts ── */}
//                                     {accounts.length > 0 && (
//                                           <Section
//                                                 id="accounts"
//                                                 icon={CreditCard}
//                                                 title="Bank Accounts"
//                                           >
//                                                 <div className="space-y-2">
//                                                       {accounts.map((a, i) => (
//                                                             <AccountCard
//                                                                   key={i}
//                                                                   account={a}
//                                                             />
//                                                       ))}
//                                                 </div>
//                                           </Section>
//                                     )}

//                                     {/* ── Company ── */}
//                                     {(customer.company_name ||
//                                           customer.company_email ||
//                                           customer.company_phone ||
//                                           customer.company_website) && (
//                                           <Section
//                                                 id="company"
//                                                 icon={Building2}
//                                                 title="Company"
//                                           >
//                                                 <div className="rounded-xl border border-bg-border overflow-hidden">
//                                                       {customer.company_name && (
//                                                             <InfoRow
//                                                                   label="Company Name"
//                                                                   value={
//                                                                         customer.company_name
//                                                                   }
//                                                             />
//                                                       )}
//                                                       {customer.company_email && (
//                                                             <InfoRow
//                                                                   label="Company Email"
//                                                                   value={
//                                                                         customer.company_email
//                                                                   }
//                                                                   copyable={
//                                                                         customer.company_email
//                                                                   }
//                                                             />
//                                                       )}
//                                                       {customer.company_phone && (
//                                                             <InfoRow
//                                                                   label="Company Phone"
//                                                                   value={
//                                                                         customer.company_phone
//                                                                   }
//                                                                   copyable={
//                                                                         customer.company_phone
//                                                                   }
//                                                             />
//                                                       )}
//                                                       {customer.company_website && (
//                                                             <InfoRow
//                                                                   label="Website"
//                                                                   value={
//                                                                         <a
//                                                                               href={
//                                                                                     customer.company_website
//                                                                               }
//                                                                               target="_blank"
//                                                                               rel="noopener noreferrer"
//                                                                               className="text-accent-gold hover:underline flex items-center gap-1"
//                                                                         >
//                                                                               <Globe
//                                                                                     size={
//                                                                                           11
//                                                                                     }
//                                                                               />
//                                                                               {customer.company_website.replace(
//                                                                                     /^https?:\/\//,
//                                                                                     ''
//                                                                               )}
//                                                                         </a>
//                                                                   }
//                                                             />
//                                                       )}
//                                                 </div>
//                                           </Section>
//                                     )}

//                                     {/* ── Financial ── */}
//                                     <Section
//                                           id="financial"
//                                           icon={DollarSign}
//                                           title="Financial"
//                                     >
//                                           <div className="rounded-xl border border-bg-border overflow-hidden">
//                                                 <InfoRow
//                                                       label="Account Balance"
//                                                       value={
//                                                             <span
//                                                                   className={cn(
//                                                                         'font-mono font-semibold',
//                                                                         customer.balance <
//                                                                               0
//                                                                               ? 'text-accent-red'
//                                                                               : 'text-accent-gold'
//                                                                   )}
//                                                             >
//                                                                   {fmtCurrency(
//                                                                         customer.balance
//                                                                   )}
//                                                             </span>
//                                                       }
//                                                 />
//                                                 <InfoRow
//                                                       label="Credit Limit"
//                                                       value={
//                                                             <span className="font-mono">
//                                                                   {fmtCurrency(
//                                                                         customer.credit_limit
//                                                                   )}
//                                                             </span>
//                                                       }
//                                                 />
//                                                 <InfoRow
//                                                       label="Taxable"
//                                                       value={
//                                                             customer.taxable ? (
//                                                                   <span className="text-accent-teal flex items-center gap-1">
//                                                                         <CheckCircle
//                                                                               size={
//                                                                                     13
//                                                                               }
//                                                                         />{' '}
//                                                                         Yes
//                                                                   </span>
//                                                             ) : (
//                                                                   <span className="text-ink-faint flex items-center gap-1">
//                                                                         <XCircle
//                                                                               size={
//                                                                                     13
//                                                                               }
//                                                                         />{' '}
//                                                                         No
//                                                                         (exempt)
//                                                                   </span>
//                                                             )
//                                                       }
//                                                 />
//                                                 {!customer.taxable &&
//                                                       customer.non_tax_certificate_number && (
//                                                             <InfoRow
//                                                                   label="Tax Certificate"
//                                                                   value={
//                                                                         customer.non_tax_certificate_number
//                                                                   }
//                                                                   mono
//                                                                   copyable={
//                                                                         customer.non_tax_certificate_number
//                                                                   }
//                                                             />
//                                                       )}
//                                                 {customer.default_invoice_terms && (
//                                                       <InfoRow
//                                                             label="Invoice Terms"
//                                                             value={
//                                                                   customer.default_invoice_terms
//                                                             }
//                                                       />
//                                                 )}
//                                           </div>
//                                     </Section>

//                                     {/* ── Loyalty ── */}
//                                     <Section
//                                           id="loyalty"
//                                           icon={Star}
//                                           title="Loyalty"
//                                     >
//                                           <div className="rounded-xl border border-bg-border overflow-hidden">
//                                                 <InfoRow
//                                                       label="Programme"
//                                                       value={
//                                                             customer.disable_loyalty ? (
//                                                                   <span className="text-ink-faint">
//                                                                         Disabled
//                                                                   </span>
//                                                             ) : (
//                                                                   <span className="text-accent-teal flex items-center gap-1">
//                                                                         <BadgeCheck
//                                                                               size={
//                                                                                     13
//                                                                               }
//                                                                         />{' '}
//                                                                         Enabled
//                                                                   </span>
//                                                             )
//                                                       }
//                                                 />
//                                                 {!customer.disable_loyalty && (
//                                                       <InfoRow
//                                                             label="Points Balance"
//                                                             value={
//                                                                   <span className="font-mono font-semibold text-accent-gold">
//                                                                         {customer.points.toLocaleString()}{' '}
//                                                                         pts
//                                                                   </span>
//                                                             }
//                                                       />
//                                                 )}
//                                           </div>
//                                     </Section>

//                                     {/* ── Notes ── */}
//                                     {(customer.comments ||
//                                           customer.internal_notes) && (
//                                           <Section
//                                                 id="notes"
//                                                 icon={FileText}
//                                                 title="Notes"
//                                           >
//                                                 <div className="space-y-3">
//                                                       {customer.comments && (
//                                                             <div className="rounded-xl border border-bg-border p-4">
//                                                                   <p className="text-[9px] font-mono uppercase tracking-widest text-ink-faint mb-2 flex items-center gap-1.5">
//                                                                         <FileText
//                                                                               size={
//                                                                                     9
//                                                                               }
//                                                                         />{' '}
//                                                                         Comments
//                                                                         (visible
//                                                                         on
//                                                                         invoices)
//                                                                   </p>
//                                                                   <p className="text-sm font-body text-ink-secondary leading-relaxed whitespace-pre-wrap">
//                                                                         {
//                                                                               customer.comments
//                                                                         }
//                                                                   </p>
//                                                             </div>
//                                                       )}
//                                                       {customer.internal_notes && (
//                                                             <div className="rounded-xl border border-bg-border p-4 bg-bg-hover/30">
//                                                                   <p className="text-[9px] font-mono uppercase tracking-widest text-ink-faint mb-2 flex items-center gap-1.5">
//                                                                         <Lock
//                                                                               size={
//                                                                                     9
//                                                                               }
//                                                                         />{' '}
//                                                                         Internal
//                                                                         Notes
//                                                                         (staff
//                                                                         only)
//                                                                   </p>
//                                                                   <p className="text-sm font-body text-ink-secondary leading-relaxed whitespace-pre-wrap">
//                                                                         {
//                                                                               customer.internal_notes
//                                                                         }
//                                                                   </p>
//                                                             </div>
//                                                       )}
//                                                 </div>
//                                           </Section>
//                                     )}

//                                     {/* Bottom padding */}
//                                     <div className="h-8" />
//                               </div>
//                         </main>
//                   </div>
//             </div>
//       );
// }


import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { TopBar } from '@/components/ui/TopBar'
import { BarChart } from '@/components/charts/BarChart'
import { LineChart } from '@/components/charts/LineChart'
import { DonutChart } from '@/components/charts/DonutChart'
import { Badge, ProgressBar, EmptyState } from '@/components/ui/primitives'
import { supabase } from '@/lib/supabase'
import { fmtCurrency, fmt, fmtDate, fmtPercent, cn } from '@/lib/utils'
import {
	User, TrendingUp, Package, ShoppingCart, Calendar,
	Clock, MapPin, CreditCard, Edit3, ArrowLeft,
	Star, Repeat, AlertTriangle, ChevronRight,
	DollarSign, BarChart2, Award, Zap, ArrowUp, ArrowDown,
	Building2, Phone, Mail, Hash, Activity, Target,
	ShoppingBag, Receipt, Layers, Globe,
} from 'lucide-react'
import { Customer, CustomerAccount, Address } from '@/types'

// ── colour palette ────────────────────────────────────────────────────────────
const DONUT_COLORS = ['#F5C842','#2DD4BF','#A78BFA','#F87171','#FB923C','#34D399','#60A5FA','#F472B6']

// ── local data shapes ─────────────────────────────────────────────────────────
interface Sale {
	pos_sale_id:      number
	invoice_total:    number
	items_sold:       number
	items_returned:   number
	invoice_datetime: string
	salesperson:      string
	comment:          string | null
}

interface SaleItem {
	pos_sale_id: number
	name:        string
	quantity:    number
	unit_price:  number
	total:       number
	category?:   string
}

interface ProductSummary {
	name:        string
	category:    string
	total_rev:   number
	total_qty:   number
	times_bought: number
	avg_price:   number
}

interface CategorySummary {
	category: string
	revenue:  number
	qty:      number
}

interface MonthSummary {
	month:   string
	revenue: number
	orders:  number
}

interface DowSummary {
	dow:     string
	revenue: number
	orders:  number
}

// ── status / category meta ────────────────────────────────────────────────────
const STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
	DIAMOND:  { color: 'text-accent-teal',   bg: 'bg-accent-teal/10 border-accent-teal/30',   label: '💎 Diamond'  },
	PLATINUM: { color: 'text-accent-purple', bg: 'bg-accent-purple/10 border-accent-purple/30', label: '🪙 Platinum' },
	GOLD:     { color: 'text-accent-gold',   bg: 'bg-accent-gold/10 border-accent-gold/30',   label: '⭐ Gold'     },
	SILVER:   { color: 'text-ink-secondary', bg: 'bg-bg-hover border-bg-border',               label: '🥈 Silver'   },
}

const CATEGORY_META: Record<string, string> = {
	VIP:      'text-accent-gold',
	WHSL1:    'text-accent-teal',
	WHSL2:    'text-accent-teal',
	RGL:      'text-ink-secondary',
	RIWC:     'text-accent-purple',
	SEASONAL: 'text-accent-orange',
	STANDARD: 'text-ink-muted',
}

// ── helper components ─────────────────────────────────────────────────────────

function KpiCard({
	label, value, sub, icon: Icon, accent = 'gold', trend, delay = 0,
}: {
	label:   string
	value:   string
	sub?:    string
	icon:    React.ElementType
	accent?: 'gold' | 'teal' | 'purple' | 'red' | 'green' | 'orange'
	trend?:  number
	delay?:  number
}) {
	const colors: Record<string, string> = {
		gold:   'text-accent-gold   bg-accent-gold/10   border-accent-gold/20',
		teal:   'text-accent-teal   bg-accent-teal/10   border-accent-teal/20',
		purple: 'text-accent-purple bg-accent-purple/10 border-accent-purple/20',
		red:    'text-accent-red    bg-accent-red/10    border-accent-red/20',
		green:  'text-[#34D399]     bg-[#34D399]/10     border-[#34D399]/20',
		orange: 'text-[#FB923C]     bg-[#FB923C]/10     border-[#FB923C]/20',
	}
	const c = colors[accent] ?? colors.gold
	const [iconColor, bgColor] = [c.split(' ')[0], c.split(' ').slice(1).join(' ')]

	return (
		<div
			className="bg-bg-card border border-bg-border rounded-2xl p-5 flex flex-col gap-3 animate-fade-up opacity-0 hover:border-accent-gold/20 transition-all duration-300 group"
			style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
		>
			<div className="flex items-center justify-between">
				<span className="text-[10px] font-mono uppercase tracking-widest text-ink-muted">{label}</span>
				<div className={cn("w-8 h-8 rounded-xl border flex items-center justify-center", bgColor)}>
					<Icon size={14} className={iconColor} />
				</div>
			</div>
			<div>
				<p className={cn("font-display text-2xl font-bold", iconColor)}>{value}</p>
				{sub && <p className="text-[11px] font-body text-ink-muted mt-0.5">{sub}</p>}
			</div>
			{trend !== undefined && (
				<div className={cn("flex items-center gap-1 text-[11px] font-mono", trend >= 0 ? 'text-[#34D399]' : 'text-accent-red')}>
					{trend >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
					{Math.abs(trend).toFixed(1)}% vs last period
				</div>
			)}
		</div>
	)
}

function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
	return (
		<div className="flex items-end justify-between mb-5">
			<div>
				<h2 className="font-display font-bold text-base text-ink-primary">{title}</h2>
				{sub && <p className="text-[11px] text-ink-muted font-body mt-0.5">{sub}</p>}
			</div>
			{action}
		</div>
	)
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<div className={cn("bg-bg-card border border-bg-border rounded-2xl p-5", className)}>
			{children}
		</div>
	)
}

function Skeleton({ className }: { className?: string }) {
	return <div className={cn("animate-pulse bg-bg-hover rounded-xl", className)} />
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function CustomerProfile() {
	const { id }   = useParams<{ id: string }>()
	const navigate = useNavigate()

      const [searchParams] = useSearchParams();
      const pos_cid = searchParams.get('pos_cid');

	// raw data
	const [customer,  setCustomer]  = useState<Customer | null>(null)
	const [addresses, setAddresses] = useState<Address[]>([])
	const [accounts,  setAccounts]  = useState<CustomerAccount[]>([])
	const [sales,     setSales]     = useState<Sale[]>([])
	const [saleItems, setSaleItems] = useState<SaleItem[]>([])
	const [loading,   setLoading]   = useState(true)
	const [error,     setError]     = useState<string | null>(null)
	const [activeTab, setActiveTab] = useState<'overview' | 'purchases' | 'products' | 'contact'>('overview')

	// ── fetch all data ─────────────────────────────────────────────────────────
	useEffect(() => {
		if (!id) return

		Promise.all([
			// Core customer
			supabase.from('customers').select('*').eq('id', id).single(),
			// Addresses
			supabase.from('customer_addresses').select('*').eq('customer_id', id).order('is_primary', { ascending: false }),
			// Bank accounts
			supabase.from('customer_accounts').select('*').eq('customer_id', id),
			// All their sales
			supabase.from('sales').select('pos_sale_id,invoice_total,items_sold,items_returned,invoice_datetime,salesperson,comment')
				.eq('pos_customer_id', pos_cid)
				.order('invoice_datetime', { ascending: false }),
		]).then(async ([custRes, addrRes, acctRes, salesRes]) => {
			if (custRes.error || !custRes.data) {
				setError('Customer not found')
				setLoading(false)
				return
			}

			setCustomer(custRes.data as unknown as Customer)
			setAddresses(addrRes.data ?? [])
			setAccounts(acctRes.data ?? [])

			const salesData = salesRes.data ?? []
			setSales(salesData as Sale[])

			// Fetch sale_items for all sales in one query
			if (salesData.length > 0) {
				const saleIds = salesData.map(s => s.pos_sale_id)
				const { data: itemsData } = await supabase
					.from('sale_items')
					.select('pos_sale_id, name, quantity, unit_price, total, items(category)')
					.in('pos_sale_id', saleIds)

				const mapped: SaleItem[] = (itemsData ?? []).map((si: any) => ({
					pos_sale_id: si.pos_sale_id,
					name:        si.name ?? '',
					quantity:    Number(si.quantity ?? 0),
					unit_price:  Number(si.unit_price ?? 0),
					total:       Number(si.total ?? 0),
					category:    si.items?.category ?? 'Unknown',
				}))
				setSaleItems(mapped)
			}

			setLoading(false)
		}).catch(() => { setError('Failed to load customer data'); setLoading(false) })
	}, [id])

	// ── derived analytics ──────────────────────────────────────────────────────
	const analytics = useMemo(() => {
		if (!sales.length) return null

		const totalRevenue     = sales.reduce((s, x) => s + Number(x.invoice_total), 0)
		const totalOrders      = sales.length
		const totalItemsBought = sales.reduce((s, x) => s + Number(x.items_sold), 0)
		const totalReturned    = sales.reduce((s, x) => s + Number(x.items_returned), 0)
		const avgBasket        = totalRevenue / totalOrders
		const returnRate       = totalItemsBought > 0 ? (totalReturned / totalItemsBought) * 100 : 0

		// Date range
		const dates      = sales.map(s => new Date(s.invoice_datetime))
		const firstDate  = new Date(Math.min(...dates.map(d => d.getTime())))
		const lastDate   = new Date(Math.max(...dates.map(d => d.getTime())))
		const daysSinceLast = Math.floor((Date.now() - lastDate.getTime()) / 86400000)
		const daysSinceFirst = Math.max(1, Math.floor((lastDate.getTime() - firstDate.getTime()) / 86400000))
		const ordersPerMonth = (totalOrders / daysSinceFirst) * 30

		// Monthly trend
		const monthMap = new Map<string, MonthSummary>()
		sales.forEach(s => {
			const d   = new Date(s.invoice_datetime)
			const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`
			const prev = monthMap.get(key) ?? { month: key, revenue: 0, orders: 0 }
			monthMap.set(key, { month: key, revenue: prev.revenue + Number(s.invoice_total), orders: prev.orders + 1 })
		})
		const monthlyTrend = Array.from(monthMap.values()).sort((a,b) => a.month.localeCompare(b.month))

		// Day-of-week pattern
		const dowMap = new Map<string, DowSummary>()
		const DOW    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
		sales.forEach(s => {
			const day  = DOW[new Date(s.invoice_datetime).getDay()]
			const prev = dowMap.get(day) ?? { dow: day, revenue: 0, orders: 0 }
			dowMap.set(day, { dow: day, revenue: prev.revenue + Number(s.invoice_total), orders: prev.orders + 1 })
		})
		const dowPattern = DOW.map(d => dowMap.get(d) ?? { dow: d, revenue: 0, orders: 0 })

		// Hour-of-day distribution
		const hourBuckets: Record<string, number> = { Morning: 0, Midday: 0, Afternoon: 0, Evening: 0, Night: 0 }
		sales.forEach(s => {
			const h = new Date(s.invoice_datetime).getHours()
			if      (h < 11) hourBuckets.Morning++
			else if (h < 13) hourBuckets.Midday++
			else if (h < 18) hourBuckets.Afternoon++
			else if (h < 21) hourBuckets.Evening++
			else             hourBuckets.Night++
		})

		// Top products
		const prodMap = new Map<string, ProductSummary>()
		saleItems.forEach(si => {
			const prev = prodMap.get(si.name) ?? { name: si.name, category: si.category ?? '', total_rev: 0, total_qty: 0, times_bought: 0, avg_price: 0 }
			prodMap.set(si.name, {
				...prev,
				total_rev:    prev.total_rev + si.total,
				total_qty:    prev.total_qty + si.quantity,
				times_bought: prev.times_bought + 1,
				category:     si.category ?? prev.category,
			})
		})
		const topProducts = Array.from(prodMap.values())
			.map(p => ({ ...p, avg_price: p.total_rev / p.total_qty }))
			.sort((a,b) => b.total_rev - a.total_rev)
			.slice(0, 15)

		// Category breakdown
		const catMap = new Map<string, CategorySummary>()
		saleItems.forEach(si => {
			const cat  = si.category ?? 'Unknown'
			const prev = catMap.get(cat) ?? { category: cat, revenue: 0, qty: 0 }
			catMap.set(cat, { category: cat, revenue: prev.revenue + si.total, qty: prev.qty + si.quantity })
		})
		const categoryBreakdown = Array.from(catMap.values()).sort((a,b) => b.revenue - a.revenue)

		// Salesperson favourite
		const spMap = new Map<string, number>()
		sales.forEach(s => { if (s.salesperson) spMap.set(s.salesperson, (spMap.get(s.salesperson) ?? 0) + 1) })
		const favSalesperson = Array.from(spMap.entries()).sort((a,b) => b[1] - a[1])[0]?.[0] ?? '—'

		// Max single order
		const maxOrder = Math.max(...sales.map(s => Number(s.invoice_total)), 0)

		// Biggest month
		const biggestMonth = monthlyTrend.reduce((best, m) => m.revenue > best.revenue ? m : best, { month: '—', revenue: 0, orders: 0 })

		return {
			totalRevenue, totalOrders, totalItemsBought, totalReturned,
			avgBasket, returnRate, firstDate, lastDate, daysSinceLast,
			ordersPerMonth, monthlyTrend, dowPattern, hourBuckets,
			topProducts, categoryBreakdown, favSalesperson, maxOrder, biggestMonth,
		}
	}, [sales, saleItems])

	// ── tab definitions ────────────────────────────────────────────────────────
	const TABS = [
		{ id: 'overview',  label: 'Overview',   icon: BarChart2  },
		{ id: 'purchases', label: 'Purchases',  icon: Receipt    },
		{ id: 'products',  label: 'Products',   icon: Package    },
		{ id: 'contact',   label: 'Contact',    icon: User       },
	] as const

	if (loading) {
		return (
			<div className="flex-1 flex flex-col min-h-screen">
				<TopBar title="Customer Profile" />
				<div className="flex-1 p-6 space-y-6">
					<div className="flex items-center gap-5 p-6 bg-bg-card border border-bg-border rounded-2xl">
						<Skeleton className="w-20 h-20 rounded-2xl" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-6 w-48" />
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-3 w-64" />
						</div>
					</div>
					<div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
						{Array.from({length: 8}).map((_,i) => <Skeleton key={i} className="h-28" />)}
					</div>
				</div>
			</div>
		)
	}

	if (error || !customer) {
		return (
			<div className="flex-1 flex flex-col min-h-screen">
				<TopBar title="Customer Profile" />
				<div className="flex-1 flex items-center justify-center flex-col gap-3">
					<AlertTriangle size={32} className="text-accent-red" />
					<p className="text-ink-muted font-body">{error ?? 'Customer not found'}</p>
					<button onClick={() => navigate('/customers')} className="text-accent-gold text-sm font-mono hover:underline">
						← Back to customers
					</button>
				</div>
			</div>
		)
	}

	const statusMeta = STATUS_META[customer.status_level] ?? STATUS_META.SILVER
	const catColor   = CATEGORY_META[customer.category] ?? 'text-ink-muted'
	const displayName = customer.name || [customer.first_name, customer.last_name].filter(Boolean).join(' ')

	// Chart data
	const monthlyChart = (analytics?.monthlyTrend ?? []).map(m => ({
		label: m.month.slice(5), // MM part
		value: m.revenue,
	}))

	const dowChart = (analytics?.dowPattern ?? []).map(d => ({
		label: d.dow,
		value: d.revenue,
	}))

	const catDonut = (analytics?.categoryBreakdown ?? []).slice(0,7).map((c,i) => ({
		label: c.category,
		value: c.revenue,
		color: DONUT_COLORS[i % DONUT_COLORS.length],
	}))

	const topProdChart = (analytics?.topProducts ?? []).slice(0,10).map(p => ({
		label: p.name.length > 16 ? p.name.slice(0,16)+'…' : p.name,
		value: p.total_rev,
	}))

	const maxProdRev = analytics?.topProducts[0]?.total_rev ?? 1

	return (
		<div className="flex-1 flex flex-col min-h-screen">
			<TopBar title="Customer Profile" subtitle={displayName} />

			<main className="flex-1 overflow-y-auto">
				<div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

					{/* ── HERO CARD ── */}
					<div className="relative bg-bg-card border border-bg-border rounded-3xl overflow-hidden">
						{/* Subtle grid texture */}
						<div className="absolute inset-0 opacity-[0.03]"
							style={{ backgroundImage: 'radial-gradient(circle, #F5C842 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

						<div className="relative p-6 flex flex-col xl:flex-row gap-6">
							{/* Avatar + name block */}
							<div className="flex items-start gap-5">
								<div className="relative flex-shrink-0">
									<div className="w-20 h-20 rounded-2xl bg-accent-gold/15 border-2 border-accent-gold/30 flex items-center justify-center">
										<span className="font-display text-2xl font-bold text-accent-gold">
											{displayName.slice(0,1).toUpperCase()}
										</span>
									</div>
									{/* Active/inactive dot */}
									<div className={cn(
										"absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-bg-card",
										customer.is_active ? "bg-[#34D399]" : "bg-accent-red"
									)} />
								</div>

								<div className="min-w-0">
									<div className="flex items-center gap-3 flex-wrap">
										<h1 className="font-display text-2xl font-bold text-ink-primary leading-tight">
											{displayName}
										</h1>
										<span className={cn("text-[10px] font-mono px-2.5 py-1 rounded-full border", statusMeta.bg, statusMeta.color)}>
											{statusMeta.label}
										</span>
										<span className={cn("text-[10px] font-mono px-2.5 py-1 rounded-full border border-bg-border bg-bg-hover", catColor)}>
											{customer.category}
										</span>
									</div>

									{customer.company_name && (
										<p className="flex items-center gap-1.5 text-sm font-body text-ink-secondary mt-1">
											<Building2 size={12} className="text-ink-faint" />
											{customer.company_name}
										</p>
									)}

									<div className="flex flex-wrap items-center gap-4 mt-2">
										{customer.email && (
											<span className="flex items-center gap-1.5 text-xs font-mono text-ink-muted">
												<Mail size={11} className="text-ink-faint" />
												{customer.email}
											</span>
										)}
										{customer.last_order_at && (
											<span className="flex items-center gap-1.5 text-xs font-mono text-ink-muted">
												<Clock size={11} className="text-ink-faint" />
												Last order {fmtDate(String(customer.last_order_at))}
											</span>
										)}
										<span className="flex items-center gap-1.5 text-xs font-mono text-ink-muted">
											<Hash size={11} className="text-ink-faint" />
											Customer since {fmtDate(String(customer.created_at))}
										</span>
									</div>
								</div>
							</div>

							{/* Right: quick stats strip */}
							<div className="xl:ml-auto flex flex-wrap xl:flex-nowrap gap-3 xl:gap-6">
								{[
									{ label: 'Lifetime Value', value: fmtCurrency(Number(customer.lifetime_value)), color: 'text-accent-gold' },
									{ label: 'Total Orders',   value: fmt(Number(customer.total_orders)),            color: 'text-accent-teal' },
									{ label: 'Total Spent',    value: fmtCurrency(Number(customer.total_spent)),     color: 'text-accent-purple' },
									{ label: 'Items Bought',   value: fmt(Number(customer.total_quantity_purchased)), color: 'text-[#34D399]' },
								].map(stat => (
									<div key={stat.label} className="text-center px-4 py-3 bg-bg-hover/60 rounded-2xl border border-bg-border min-w-[96px]">
										<p className={cn("font-display text-xl font-bold", stat.color)}>{stat.value}</p>
										<p className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mt-0.5">{stat.label}</p>
									</div>
								))}
							</div>
						</div>

						{/* Action bar */}
						<div className="relative border-t border-bg-border px-6 py-3 flex items-center gap-3 bg-bg-hover/30">
							<button
								onClick={() => navigate(-1)}
								className="flex items-center gap-1.5 text-xs font-body text-ink-muted hover:text-ink-primary transition-colors"
							>
								<ArrowLeft size={13} />Back
							</button>
							<div className="flex-1" />
							<button
								onClick={() => navigate(`/customers/${id}/edit`)}
								className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-gold/15 border border-accent-gold/30 text-accent-gold text-xs font-mono hover:bg-accent-gold/25 transition-all"
							>
								<Edit3 size={12} />Edit Customer
							</button>
						</div>
					</div>

					{/* ── TABS ── */}
					<div className="flex gap-1 bg-bg-panel border border-bg-border rounded-xl p-1">
						{TABS.map(tab => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={cn(
									"flex items-center gap-1.5 flex-1 justify-center px-3 py-2 rounded-lg text-xs font-body transition-all",
									activeTab === tab.id
										? "bg-accent-gold/15 text-accent-gold border border-accent-gold/30"
										: "text-ink-secondary hover:text-ink-primary"
								)}
							>
								<tab.icon size={12} />
								{tab.label}
							</button>
						))}
					</div>

					{/* ══════════════════════════════════════════════════════
					    OVERVIEW TAB
					    ══════════════════════════════════════════════════════ */}
					{activeTab === 'overview' && (
						<div className="space-y-8">

							{/* KPI grid */}
							<div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
								<KpiCard label="Total Revenue"     value={fmtCurrency(analytics?.totalRevenue ?? 0)}    icon={DollarSign}  accent="gold"   delay={0}   />
								<KpiCard label="Total Orders"      value={fmt(analytics?.totalOrders ?? 0)}              icon={ShoppingCart} accent="teal"   delay={60}  />
								<KpiCard label="Avg Basket Value"  value={fmtCurrency(analytics?.avgBasket ?? 0)}        icon={Target}      accent="purple" delay={120} />
								<KpiCard label="Items Purchased"   value={fmt(analytics?.totalItemsBought ?? 0)}         icon={Package}     accent="green"  delay={180} />
								<KpiCard label="Largest Order"     value={fmtCurrency(analytics?.maxOrder ?? 0)}         icon={Award}       accent="gold"   delay={240} />
								<KpiCard label="Return Rate"       value={fmtPercent(analytics?.returnRate ?? 0)}        icon={Repeat}      accent={((analytics?.returnRate ?? 0) > 5) ? 'red' : 'teal'} delay={300} />
								<KpiCard label="Orders / Month"    value={(analytics?.ordersPerMonth ?? 0).toFixed(1)}   icon={Calendar}    accent="purple" delay={360} />
								<KpiCard label="Days Since Last"   value={fmt(analytics?.daysSinceLast ?? 0) + 'd'}      icon={Clock}       accent={(analytics?.daysSinceLast ?? 0) > 30 ? 'red' : 'green'} delay={420} />
							</div>

							{/* Revenue trend */}
							{monthlyChart.length > 0 && (
								<Card>
									<SectionHeader title="Revenue Trend" sub="Monthly spend over time" />
									<LineChart data={monthlyChart} height={200} color="#F5C842" formatValue={fmtCurrency} />
								</Card>
							)}

							{/* Day of week + Category */}
							<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
								<Card>
									<SectionHeader title="Shopping by Day" sub="Revenue per weekday" />
									<BarChart data={dowChart} height={180} color="#2DD4BF" formatValue={fmtCurrency} />
								</Card>

								<Card>
									<SectionHeader title="Category Preference" sub="Revenue share by fabric type" />
									{catDonut.length
										? <DonutChart data={catDonut} size={180} formatValue={fmtCurrency} />
										: <EmptyState message="No category data" />
									}
								</Card>
							</div>

							{/* Behaviour insights */}
							<Card>
								<SectionHeader title="Behaviour Insights" sub="Patterns extracted from purchase history" />
								<div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

									{/* Time of day */}
									<div>
										<p className="text-[10px] font-mono uppercase tracking-widest text-ink-muted mb-3">Time of Day</p>
										<div className="space-y-2">
											{Object.entries(analytics?.hourBuckets ?? {}).map(([bucket, count]) => {
												const total = Object.values(analytics?.hourBuckets ?? {}).reduce((s,n) => s+n, 0) || 1
												return (
													<div key={bucket} className="flex items-center gap-2">
														<span className="text-xs font-body text-ink-secondary w-24 shrink-0">{bucket}</span>
														<div className="flex-1">
															<ProgressBar value={count} max={total} accent="gold" />
														</div>
														<span className="text-[10px] font-mono text-ink-muted w-10 text-right">{((count/total)*100).toFixed(0)}%</span>
													</div>
												)
											})}
										</div>
									</div>

									{/* Quick facts */}
									<div>
										<p className="text-[10px] font-mono uppercase tracking-widest text-ink-muted mb-3">Quick Facts</p>
										<div className="space-y-2.5">
											{[
												{ label: 'Favourite salesperson', value: analytics?.favSalesperson ?? '—' },
												{ label: 'Best month',            value: analytics?.biggestMonth.month ?? '—' },
												{ label: 'Best month revenue',    value: fmtCurrency(analytics?.biggestMonth.revenue ?? 0) },
												{ label: 'First purchase',        value: analytics?.firstDate ? fmtDate(analytics.firstDate.toISOString()) : '—' },
												{ label: 'Customer for',          value: analytics?.firstDate ? `${Math.floor((Date.now() - analytics.firstDate.getTime()) / 86400000)} days` : '—' },
											].map(f => (
												<div key={f.label} className="flex items-center justify-between gap-2 py-1.5 border-b border-bg-border/50 last:border-0">
													<span className="text-xs font-body text-ink-muted">{f.label}</span>
													<span className="text-xs font-mono text-ink-primary text-right">{f.value}</span>
												</div>
											))}
										</div>
									</div>

									{/* Credit & Balance */}
									<div>
										<p className="text-[10px] font-mono uppercase tracking-widest text-ink-muted mb-3">Account Status</p>
										<div className="space-y-3">
											<div>
												<div className="flex justify-between mb-1">
													<span className="text-xs font-body text-ink-muted">Balance</span>
													<span className="text-xs font-mono text-accent-gold">{fmtCurrency(Number(customer.balance ?? 0))}</span>
												</div>
											</div>
											<div>
												<div className="flex justify-between mb-1">
													<span className="text-xs font-body text-ink-muted">Credit used</span>
													<span className="text-xs font-mono text-ink-secondary">
														{fmtCurrency(Number(customer.balance ?? 0))} / {fmtCurrency(Number(customer.credit_limit ?? 0))}
													</span>
												</div>
												<ProgressBar
													value={Number(customer.balance ?? 0)}
													max={Math.max(Number(customer.credit_limit ?? 1), 1)}
													accent={Number(customer.balance ?? 0) > Number(customer.credit_limit ?? 0) * 0.8 ? 'red' : 'teal'}
												/>
											</div>
											<div className="flex justify-between py-1.5 border-b border-bg-border/50">
												<span className="text-xs font-body text-ink-muted">Taxable</span>
												<Badge variant={customer.taxable ? 'teal' : 'muted'}>{customer.taxable ? 'Yes' : 'Exempt'}</Badge>
											</div>
											<div className="flex justify-between py-1.5">
												<span className="text-xs font-body text-ink-muted">Invoice terms</span>
												<span className="text-xs font-mono text-ink-secondary">{customer.default_invoice_terms || 'None'}</span>
											</div>
										</div>
									</div>
								</div>
							</Card>

						</div>
					)}

					{/* ══════════════════════════════════════════════════════
					    PURCHASES TAB
					    ══════════════════════════════════════════════════════ */}
					{activeTab === 'purchases' && (
						<div className="space-y-6">

							{/* Summary strip */}
							<div className="grid grid-cols-3 gap-4">
								<KpiCard label="Total Spend"    value={fmtCurrency(analytics?.totalRevenue ?? 0)}  icon={DollarSign}  accent="gold"   />
								<KpiCard label="Total Orders"   value={fmt(analytics?.totalOrders ?? 0)}           icon={Receipt}     accent="teal"   />
								<KpiCard label="Avg per Order"  value={fmtCurrency(analytics?.avgBasket ?? 0)}     icon={Target}      accent="purple" />
							</div>

							{/* Transaction history table */}
							<Card>
								<SectionHeader
									title="Transaction History"
									sub={`${analytics?.totalOrders ?? 0} sales on record`}
								/>
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead>
											<tr className="border-b border-bg-border">
												{['Date','Time','Amount','Items','Returns','Salesperson','Comment'].map(h => (
													<th key={h} className="text-left pb-3 pr-4 text-[10px] font-mono uppercase tracking-widest text-ink-muted whitespace-nowrap">{h}</th>
												))}
											</tr>
										</thead>
										<tbody>
											{sales.slice(0, 100).map((s, i) => {
												const dt     = new Date(s.invoice_datetime)
												const isLarge = Number(s.invoice_total) > (analytics?.avgBasket ?? 0) * 1.5
												return (
													<tr key={s.pos_sale_id} className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors group">
														<td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary whitespace-nowrap">
															{dt.toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'2-digit' })}
														</td>
														<td className="py-2.5 pr-4 text-xs font-mono text-ink-faint">
															{dt.toLocaleTimeString('en-NG', { hour:'2-digit', minute:'2-digit' })}
														</td>
														<td className="py-2.5 pr-4">
															<span className={cn("text-xs font-mono font-medium", isLarge ? "text-accent-gold" : "text-ink-primary")}>
																{fmtCurrency(s.invoice_total)}
															</span>
															{isLarge && <span className="ml-1 text-[9px] text-accent-gold font-mono">▲</span>}
														</td>
														<td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">{s.items_sold}</td>
														<td className="py-2.5 pr-4">
															{Number(s.items_returned) > 0
																? <span className="text-xs font-mono text-accent-red">{s.items_returned}</span>
																: <span className="text-xs font-mono text-ink-faint">—</span>
															}
														</td>
														<td className="py-2.5 pr-4 text-xs font-body text-ink-muted">{s.salesperson || '—'}</td>
														<td className="py-2.5 text-xs font-body text-ink-faint truncate max-w-40">{s.comment || '—'}</td>
													</tr>
												)
											})}
										</tbody>
									</table>
									{!sales.length && <EmptyState message="No transactions found" />}
								</div>
							</Card>

						</div>
					)}

					{/* ══════════════════════════════════════════════════════
					    PRODUCTS TAB
					    ══════════════════════════════════════════════════════ */}
					{activeTab === 'products' && (
						<div className="space-y-6">

							{/* Top products chart */}
							{topProdChart.length > 0 && (
								<Card>
									<SectionHeader title="Top 10 Products by Revenue" sub="What this customer buys most" />
									<BarChart data={topProdChart} height={200} color="#A78BFA" formatValue={fmtCurrency} />
								</Card>
							)}

							{/* Category + product table side by side */}
							<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

								{/* Category breakdown */}
								<Card>
									<SectionHeader title="Category Breakdown" />
									<div className="space-y-3">
										{(analytics?.categoryBreakdown ?? []).map((c, i) => {
											const totalRev = analytics?.totalRevenue ?? 1
											return (
												<div key={c.category} className="flex items-center gap-3">
													<div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
													<div className="flex-1 min-w-0">
														<div className="flex justify-between items-center mb-1">
															<span className="text-xs font-body text-ink-primary truncate">{c.category}</span>
															<span className="text-xs font-mono text-ink-muted ml-2 flex-shrink-0">{fmt(c.qty)} units</span>
														</div>
														<ProgressBar value={c.revenue} max={totalRev} accent="gold" />
													</div>
													<div className="text-right flex-shrink-0 w-24">
														<p className="text-xs font-mono text-accent-gold">{fmtCurrency(c.revenue)}</p>
														<p className="text-[10px] text-ink-faint font-mono">{((c.revenue/totalRev)*100).toFixed(1)}%</p>
													</div>
												</div>
											)
										})}
										{!(analytics?.categoryBreakdown?.length) && <EmptyState message="No data" />}
									</div>
								</Card>

								{/* Top products detailed */}
								<Card>
									<SectionHeader title="All Products Purchased" />
									<div className="overflow-y-auto max-h-96 space-y-0">
										<table className="w-full">
											<thead className="sticky top-0 bg-bg-card">
												<tr className="border-b border-bg-border">
													{['#','Product','Revenue','Qty','×Bought'].map(h => (
														<th key={h} className="text-left pb-2.5 pr-3 text-[10px] font-mono uppercase tracking-widest text-ink-muted">{h}</th>
													))}
												</tr>
											</thead>
											<tbody>
												{(analytics?.topProducts ?? []).map((p, i) => (
													<tr key={p.name} className="border-b border-bg-border/30 hover:bg-bg-hover transition-colors">
														<td className="py-2 pr-3 text-[10px] font-mono text-ink-faint">{i+1}</td>
														<td className="py-2 pr-3">
															<p className="text-xs font-body text-ink-primary leading-tight">{p.name}</p>
															<p className="text-[10px] text-ink-faint font-body">{p.category}</p>
														</td>
														<td className="py-2 pr-3">
															<p className="text-xs font-mono text-accent-gold font-medium">{fmtCurrency(p.total_rev)}</p>
															<ProgressBar value={p.total_rev} max={maxProdRev} className="w-16 mt-0.5" />
														</td>
														<td className="py-2 pr-3 text-xs font-mono text-ink-secondary">{fmt(p.total_qty)}</td>
														<td className="py-2 text-xs font-mono text-ink-muted">{p.times_bought}×</td>
													</tr>
												))}
											</tbody>
										</table>
										{!(analytics?.topProducts?.length) && <EmptyState message="No items data" />}
									</div>
								</Card>
							</div>

						</div>
					)}

					{/* ══════════════════════════════════════════════════════
					    CONTACT TAB
					    ══════════════════════════════════════════════════════ */}
					{activeTab === 'contact' && (
						<div className="space-y-6">

							<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

								{/* Personal info */}
								<Card>
									<SectionHeader title="Personal Information" />
									<div className="space-y-3">
										{[
											{ label: 'Full Name',   value: displayName,                       icon: User      },
											{ label: 'Email',       value: customer.email || '—',             icon: Mail      },
											{ label: 'Category',    value: customer.category,                 icon: Layers    },
											{ label: 'Status',      value: customer.status_level,             icon: Star      },
											{ label: 'Active',      value: customer.is_active ? 'Yes' : 'No', icon: Activity  },
										].map(f => (
											<div key={f.label} className="flex items-center gap-3 py-2 border-b border-bg-border/50 last:border-0">
												<div className="w-7 h-7 rounded-lg bg-bg-hover border border-bg-border flex items-center justify-center flex-shrink-0">
													<f.icon size={12} className="text-ink-muted" />
												</div>
												<span className="text-xs font-body text-ink-muted w-28 flex-shrink-0">{f.label}</span>
												<span className="text-xs font-mono text-ink-primary">{f.value}</span>
											</div>
										))}
									</div>
								</Card>

								{/* Company info */}
								{(customer.company_name || customer.company_email || customer.company_phone || customer.company_website) && (
									<Card>
										<SectionHeader title="Company" />
										<div className="space-y-3">
											{[
												{ label: 'Company',  value: customer.company_name    || '—', icon: Building2 },
												{ label: 'Email',    value: customer.company_email   || '—', icon: Mail      },
												{ label: 'Phone',    value: customer.company_phone   || '—', icon: Phone     },
												{ label: 'Website',  value: customer.company_website || '—', icon: Globe     },
											].map(f => (
												<div key={f.label} className="flex items-center gap-3 py-2 border-b border-bg-border/50 last:border-0">
													<div className="w-7 h-7 rounded-lg bg-bg-hover border border-bg-border flex items-center justify-center flex-shrink-0">
														<f.icon size={12} className="text-ink-muted" />
													</div>
													<span className="text-xs font-body text-ink-muted w-20 flex-shrink-0">{f.label}</span>
													<span className="text-xs font-mono text-ink-primary truncate">{f.value}</span>
												</div>
											))}
										</div>
									</Card>
								)}
							</div>

							{/* Addresses */}
							{addresses.length > 0 && (
								<Card>
									<SectionHeader title="Addresses" sub={`${addresses.length} address${addresses.length !== 1 ? 'es' : ''} on file`} />
									<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
										{addresses.map(addr => (
											<div key={addr.id} className={cn(
												"p-4 rounded-xl border space-y-1",
												addr.is_primary ? "border-accent-gold/30 bg-accent-gold/5" : "border-bg-border bg-bg-hover/40"
											)}>
												<div className="flex items-center gap-2 mb-2">
													<MapPin size={12} className={addr.is_primary ? "text-accent-gold" : "text-ink-muted"} />
													<span className={cn("text-[10px] font-mono uppercase tracking-widest", addr.is_primary ? "text-accent-gold" : "text-ink-muted")}>
														{addr.label}
													</span>
													{addr.is_primary && (
														<span className="text-[9px] font-mono text-accent-gold bg-accent-gold/15 border border-accent-gold/20 rounded-full px-1.5 py-0.5 ml-auto">
															Primary
														</span>
													)}
												</div>
												<p className="text-sm font-body text-ink-primary">{addr.line_1}</p>
												{addr.line_2 && <p className="text-xs font-body text-ink-secondary">{addr.line_2}</p>}
												<p className="text-xs font-body text-ink-secondary">{[addr.city, addr.state, addr.postal_code].filter(Boolean).join(', ')}</p>
												<p className="text-xs font-body text-ink-muted">{addr.country}</p>
											</div>
										))}
									</div>
								</Card>
							)}

							{/* Bank accounts */}
							{accounts.length > 0 && (
								<Card>
									<SectionHeader title="Bank Accounts" sub={`${accounts.length} account${accounts.length !== 1 ? 's' : ''} on file`} />
									<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
										{accounts.map(acct => (
											<div key={acct.id} className="p-4 rounded-xl border border-bg-border bg-bg-hover/40 space-y-2">
												<div className="flex items-center gap-2">
													<CreditCard size={12} className="text-accent-teal" />
													<span className="text-xs font-mono text-accent-teal uppercase">{acct.bank_name}</span>
												</div>
												<p className="text-sm font-mono text-ink-primary tracking-widest">{acct.account_no}</p>
												<p className="text-xs font-body text-ink-secondary">{acct.account_name}</p>
											</div>
										))}
									</div>
								</Card>
							)}

							{/* Internal notes */}
							{customer.internal_notes && (
								<Card>
									<SectionHeader title="Internal Notes" />
									<p className="text-sm font-body text-ink-secondary leading-relaxed">{customer.internal_notes}</p>
								</Card>
							)}

						</div>
					)}

				</div>
			</main>
		</div>
	)
}
