import type { ReactNode } from 'react';
import {
      Building2,
      CreditCard,
      Mail,
      MapPin,
      Phone,
      Plus,
      Star,
      StickyNote,
      User,
      X,
} from 'lucide-react';
import Button from '@/components/ui/controls/Button';
import Input from '@/components/ui/controls/Input';
import Select from '@/components/ui/controls/Select';
import Toggle from '@/components/ui/controls/Toggle';
import Textarea from '@/components/ui/controls/Textarea';
import { ctm_addr_label, ctm_category, ctm_status_lvl } from '@/constants';
import { cn } from '@/lib/utils';
import {
      EMPTY_ACCOUNT,
      EMPTY_ADDRESS,
      type CustomerFormErrors,
      type CustomerProfileForm,
      type ProfileAccount,
      type ProfileAddress,
      type ProfileContactType,
} from '@/hooks/data/use-customer-profile';

interface CustomerFormProps {
      form: CustomerProfileForm;
      onChange: (next: CustomerProfileForm) => void;
      errors?: CustomerFormErrors;
      disabled?: boolean;
}

// ── Layout helpers ────────────────────────────────────────────────────────────
function Section({
      icon: Icon,
      title,
      hint,
      children,
}: {
      icon: React.ElementType;
      title: string;
      hint?: string;
      children: ReactNode;
}) {
      return (
            <section className="rounded-2xl border border-bg-border p-4 sm:p-5 space-y-5">
                  <header className="flex items-start gap-3">
                        <div className="w-8 h-8 shrink-0 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
                              <Icon size={14} className="text-accent-gold" />
                        </div>
                        <div className="min-w-0">
                              <h3 className="font-body font-semibold text-sm text-ink-primary leading-tight">
                                    {title}
                              </h3>
                              {hint && (
                                    <p className="text-[12px] text-ink-subtle font-body mt-0.5">{hint}</p>
                              )}
                        </div>
                  </header>
                  {children}
            </section>
      );
}

function IconButton({
      label,
      onClick,
      active,
      danger,
      children,
}: {
      label: string;
      onClick: () => void;
      active?: boolean;
      danger?: boolean;
      children: ReactNode;
}) {
      return (
            <button
                  type="button"
                  title={label}
                  aria-label={label}
                  aria-pressed={active}
                  onClick={onClick}
                  className={cn(
                        'h-[42px] w-[42px] shrink-0 rounded-md border flex items-center justify-center transition-colors',
                        danger
                              ? 'border-[#f0f0fa40] text-ink-muted hover:text-accent-red hover:border-accent-red/40 hover:bg-accent-red/10'
                              : active
                                    ? 'border-accent-gold/50 bg-accent-gold/15 text-accent-gold'
                                    : 'border-[#f0f0fa40] text-ink-faint hover:text-accent-gold hover:border-accent-gold/40'
                  )}
            >
                  {children}
            </button>
      );
}

const TEXTAREA_CLASS =
      'w-full rounded-md border border-[#f0f0fa59] bg-transparent p-3 text-[16px] font-body text-ink-primary outline-none transition-all placeholder:text-ink-faint focus:border-accent-gold/50 focus:[box-shadow:0_0_0_1px_theme(colors.accent-gold/50)]';

const categoryOptions = ctm_category;

// ── Phone / email list ────────────────────────────────────────────────────────
function ContactGroup({
      type,
      form,
      onChange,
      errors,
      disabled,
}: { type: ProfileContactType } & CustomerFormProps) {
      const isEmail = type === 'email';
      const Icon = isEmail ? Mail : Phone;
      const rows = form.contacts
            .map((contact, index) => ({ contact, index }))
            .filter((r) => r.contact.type === type);

      const setContacts = (contacts: CustomerProfileForm['contacts']) =>
            onChange({ ...form, contacts });

      const add = () =>
            setContacts([
                  ...form.contacts,
                  { type, value: '', is_primary: rows.length === 0 },
            ]);

      const update = (index: number, value: string) =>
            setContacts(form.contacts.map((c, i) => (i === index ? { ...c, value } : c)));

      const makePrimary = (index: number) =>
            setContacts(
                  form.contacts.map((c, i) =>
                        c.type === type ? { ...c, is_primary: i === index } : c
                  )
            );

      const remove = (index: number) => {
            const removed = form.contacts[index];
            let next = form.contacts.filter((_, i) => i !== index);
            // keep a primary if any remain of this type
            if (removed.is_primary) {
                  const firstOfType = next.findIndex((c) => c.type === type);
                  if (firstOfType >= 0) {
                        next = next.map((c, i) => (i === firstOfType ? { ...c, is_primary: true } : c));
                  }
            }
            setContacts(next);
      };

      return (
            <div className="space-y-3">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
                        {isEmail ? 'Email addresses' : 'Phone numbers'}
                  </p>

                  {rows.length === 0 && (
                        <p className="text-[13px] font-body text-ink-faint">
                              {isEmail ? 'No email added yet.' : 'No phone number added yet.'}
                        </p>
                  )}

                  {rows.map(({ contact, index }) => (
                        <div key={index} className="flex items-start gap-2">
                              <Input
                                    className="flex-1"
                                    type={isEmail ? 'email' : 'tel'}
                                    placeholder={isEmail ? 'Email address' : 'Phone number'}
                                    prefix={<Icon />}
                                    value={contact.value}
                                    onChange={(v) => update(index, v)}
                                    error={errors?.[`contact_${index}`]}
                                    disabled={disabled}
                                    autoComplete="off"
                              />
                              <IconButton
                                    label={contact.is_primary ? 'Primary' : 'Make primary'}
                                    active={contact.is_primary}
                                    onClick={() => makePrimary(index)}
                              >
                                    <Star size={16} className={contact.is_primary ? 'fill-current' : ''} />
                              </IconButton>
                              <IconButton label="Remove" danger onClick={() => remove(index)}>
                                    <X size={16} />
                              </IconButton>
                        </div>
                  ))}

                  <Button
                        variant="dashed"
                        size="sm"
                        icon={<Plus />}
                        onClick={add}
                        disabled={disabled}
                  >
                        {isEmail ? 'Add email' : 'Add phone number'}
                  </Button>
            </div>
      );
}

// ── Addresses ─────────────────────────────────────────────────────────────────
function AddressCard({
      address,
      onChange,
      onRemove,
      onMakePrimary,
      disabled,
}: {
      address: ProfileAddress;
      onChange: (a: ProfileAddress) => void;
      onRemove: () => void;
      onMakePrimary: () => void;
      disabled?: boolean;
}) {
      const set = <K extends keyof ProfileAddress>(k: K, v: ProfileAddress[K]) =>
            onChange({ ...address, [k]: v });

      return (
            <div className="rounded-xl border border-bg-border p-4 space-y-4">
                  <div className="flex items-center gap-2">
                        <Select
                              className="flex-1"
                              placeholder="Label"
                              value={address.label}
                              options={ctm_addr_label}
                              onChange={(v) => set('label', v)}
                              disabled={disabled}
                        />
                        <IconButton
                              label={address.is_primary ? 'Primary address' : 'Make primary'}
                              active={address.is_primary}
                              onClick={onMakePrimary}
                        >
                              <Star size={16} className={address.is_primary ? 'fill-current' : ''} />
                        </IconButton>
                        <IconButton label="Remove address" danger onClick={onRemove}>
                              <X size={16} />
                        </IconButton>
                  </div>
                  <Input placeholder="Address line 1" value={address.line_1} onChange={(v) => set('line_1', v)} disabled={disabled} />
                  <Input placeholder="Address line 2 (optional)" value={address.line_2} onChange={(v) => set('line_2', v)} disabled={disabled} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input placeholder="City" value={address.city} onChange={(v) => set('city', v)} disabled={disabled} />
                        <Input placeholder="State" value={address.state} onChange={(v) => set('state', v)} disabled={disabled} />
                        <Input placeholder="Postal code" value={address.postal_code} onChange={(v) => set('postal_code', v)} disabled={disabled} />
                        <Input placeholder="Country" value={address.country} onChange={(v) => set('country', v)} disabled={disabled} />
                  </div>
            </div>
      );
}

// ── The form ──────────────────────────────────────────────────────────────────
export default function CustomerForm(props: CustomerFormProps) {
      const { form, onChange, errors, disabled } = props;

      const patch = <K extends keyof CustomerProfileForm>(k: K, v: CustomerProfileForm[K]) =>
            onChange({ ...form, [k]: v });

      // addresses
      const setAddress = (i: number, a: ProfileAddress) =>
            patch('addresses', form.addresses.map((x, idx) => (idx === i ? a : x)));
      const addAddress = () =>
            patch('addresses', [
                  ...form.addresses,
                  { ...EMPTY_ADDRESS, is_primary: form.addresses.length === 0 },
            ]);
      const removeAddress = (i: number) => {
            let next = form.addresses.filter((_, idx) => idx !== i);
            if (form.addresses[i].is_primary && next.length > 0) {
                  next = next.map((a, idx) => ({ ...a, is_primary: idx === 0 }));
            }
            patch('addresses', next);
      };
      const primaryAddress = (i: number) =>
            patch('addresses', form.addresses.map((a, idx) => ({ ...a, is_primary: idx === i })));

      // accounts
      const setAccount = (i: number, a: ProfileAccount) =>
            patch('accounts', form.accounts.map((x, idx) => (idx === i ? a : x)));

      return (
            <div className="space-y-6">
                  <Section icon={User} title="Identity">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <Input
                                    id="first_name"
                                    placeholder="First name *"
                                    value={form.first_name}
                                    onChange={(v) => patch('first_name', v)}
                                    error={errors?.first_name}
                                    disabled={disabled}
                                    autoComplete="off"
                              />
                              <Input
                                    placeholder="Last name"
                                    value={form.last_name}
                                    onChange={(v) => patch('last_name', v)}
                                    disabled={disabled}
                                    autoComplete="off"
                              />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <Select
                                    placeholder="Category"
                                    value={form.category}
                                    options={categoryOptions}
                                    onChange={(v) => patch('category', v)}
                                    disabled={disabled}
                              />
                              <Select
                                    placeholder="Status level"
                                    value={form.status_level}
                                    options={ctm_status_lvl}
                                    onChange={(v) => patch('status_level', v)}
                                    disabled={disabled}
                              />
                        </div>
                        <Toggle
                              checked={form.is_active}
                              onChange={(v) => patch('is_active', v)}
                              label="Active customer"
                              description="Inactive customers are kept for history but marked as inactive"
                              disabled={disabled}
                        />
                  </Section>

                  <Section
                        icon={Phone}
                        title="Contact"
                        hint="Add as many phone numbers and emails as you need. The star marks the primary one."
                  >
                        <ContactGroup {...props} type="phone" />
                        <ContactGroup {...props} type="email" />
                  </Section>

                  <Section icon={Building2} title="Business">
                        <Input
                              placeholder="Company / shop name (optional)"
                              value={form.company_name}
                              onChange={(v) => patch('company_name', v)}
                              disabled={disabled}
                              autoComplete="off"
                        />
                  </Section>

                  <Section icon={MapPin} title="Addresses">
                        {form.addresses.length === 0 && (
                              <p className="text-[13px] font-body text-ink-faint">No address added yet.</p>
                        )}
                        {form.addresses.map((a, i) => (
                              <AddressCard
                                    key={i}
                                    address={a}
                                    onChange={(next) => setAddress(i, next)}
                                    onRemove={() => removeAddress(i)}
                                    onMakePrimary={() => primaryAddress(i)}
                                    disabled={disabled}
                              />
                        ))}
                        <Button variant="dashed" size="sm" icon={<Plus />} onClick={addAddress} disabled={disabled}>
                              Add address
                        </Button>
                  </Section>

                  <Section
                        icon={CreditCard}
                        title="Bank accounts"
                        hint="Accounts this customer pays from or is paid to."
                  >
                        {form.accounts.length === 0 && (
                              <p className="text-[13px] font-body text-ink-faint">No bank account added yet.</p>
                        )}
                        {form.accounts.map((a, i) => (
                              <div key={i} className="rounded-xl border border-bg-border p-4 space-y-4">
                                    <div className="flex items-start gap-2">
                                          <Input
                                                className="flex-1"
                                                placeholder="Bank name"
                                                value={a.bank_name}
                                                onChange={(v) => setAccount(i, { ...a, bank_name: v })}
                                                disabled={disabled}
                                          />
                                          <IconButton
                                                label="Remove account"
                                                danger
                                                onClick={() => patch('accounts', form.accounts.filter((_, idx) => idx !== i))}
                                          >
                                                <X size={16} />
                                          </IconButton>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          <Input
                                                placeholder="Account number"
                                                value={a.account_no}
                                                onChange={(v) => setAccount(i, { ...a, account_no: v })}
                                                disabled={disabled}
                                          />
                                          <Input
                                                placeholder="Account name"
                                                value={a.account_name}
                                                onChange={(v) => setAccount(i, { ...a, account_name: v })}
                                                disabled={disabled}
                                          />
                                    </div>
                                    {errors?.[`account_${i}`] && (
                                          <p className="text-[12px] text-accent-red font-body">{errors[`account_${i}`]}</p>
                                    )}
                              </div>
                        ))}
                        <Button
                              variant="dashed"
                              size="sm"
                              icon={<Plus />}
                              onClick={() => patch('accounts', [...form.accounts, { ...EMPTY_ACCOUNT }])}
                              disabled={disabled}
                        >
                              Add bank account
                        </Button>
                  </Section>

                  <Section icon={StickyNote} title="Internal notes" hint="Only visible to staff.">
                        <Textarea
                              rows={4}
                              placeholder="Anything worth remembering about this customer…"
                              value={form.internal_notes}
                              onChange={(v) => patch('internal_notes', v)}
                              className={TEXTAREA_CLASS}
                        />
                  </Section>
            </div>
      );
}
