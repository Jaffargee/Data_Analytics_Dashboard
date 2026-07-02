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
      ChevronLeft,
      Save,
      Loader2,
      AlertCircle,
      Check,
      Star,
      Trash2,
      PlusIcon,
      DollarSign,
      CheckCircle,
} from 'lucide-react';
import { Field, Input, Textarea, Toggle } from '@/components/ui';
import { ctm_addr_label, ctm_category, ctm_status_lvl } from '@/constants';
import {
      Address,
      ContactMethod,
      ContactType,
      CustomerForm,
      CustomerAccount,
} from '@/types';

// ── Local form shape extends the base CustomerForm from @/types ───────────────
// CTMForm covers: first_name, last_name, email, company_*, category,
// status_level, is_active, balance, credit_limit, taxable,
// non_tax_certificate_number, default_invoice_terms, disable_loyalty,
// points, auto_email_receipt, always_sms_receipt,
// message_to_show_when_adding_customer_to_sale,
// comments, internal_notes, addresses[], accounts[]
//
// We extend it with fields that exist in the DB but not yet in CTMForm,
// plus contacts[] which we manage in the UI even though it maps to a
// future customer_contacts table.

const DEFAULT_ADDRESS: Address = {
      label: 'Home',
      is_primary: true,
      line_1: '',
      line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Nigeria',
};

const DEFAULT_ACCOUNT: CustomerAccount = {
      account_no: '',
      account_name: '',
      bank_name: '',
};

const DEFAULT_CONTACT_EMAIL: ContactMethod = {
      id: '',
      customer_id: '',
      type: 'email',
      value: '',
      is_primary: true,
};

const DEFAULT_CONTACT_PHONE: ContactMethod = {
      id: '',
      customer_id: '',
      type: 'phone',
      value: '',
      is_primary: false,
};

const EMPTY_FORM: CustomerForm = {
      first_name: '',
      last_name: '',
      email: '',
      company_name: '',
      company_email: '',
      company_phone: '',
      company_website: '',
      category: 'STANDARD',
      status_level: 'SILVER',
      is_active: true,
      balance: '0',
      credit_limit: '0',
      taxable: true,
      non_tax_certificate_number: '',
      default_invoice_terms: '',
      disable_loyalty: false,
      points: '0',
      auto_email_receipt: false,
      always_sms_receipt: false,
      message_to_show_when_adding_customer_to_sale: '',
      comment: '',
      internal_notes: '',
      addresses: [{ ...DEFAULT_ADDRESS }],
      accounts: [],
      contacts: [{ ...DEFAULT_CONTACT_EMAIL }, { ...DEFAULT_CONTACT_PHONE }],
};

// ── Section definitions ───────────────────────────────────────────────────────
const SECTIONS = [
      { id: 'identity', label: 'Identity', icon: User },
      { id: 'contact', label: 'Contact', icon: Phone },
      { id: 'address', label: 'Address', icon: MapPin },
      { id: 'accounts', label: 'Accounts', icon: CreditCard },
      { id: 'company', label: 'Company', icon: Building2 },
      { id: 'financial', label: 'Financial', icon: DollarSign },
      { id: 'loyalty', label: 'Loyalty', icon: Star },
      { id: 'notes', label: 'Notes', icon: FileText },
] as const;

// ── Shared props for section sub-components ───────────────────────────────────
interface SectionProps {
      activeSection: string;
      setActiveSection: (s: string) => void;
      form: CustomerForm;
      set: <K extends keyof CustomerForm>(
            key: K
      ) => (value: CustomerForm[K]) => void;
      errors: Partial<Record<keyof CustomerForm, string>>;
      setForm: React.Dispatch<React.SetStateAction<CustomerForm>>;
}

// ── SectionCard wrapper ───────────────────────────────────────────────────────
function SectionCard({
      id,
      title,
      icon: Icon,
      children,
      active,
      onActivate,
}: {
      id: string;
      title: string;
      icon: React.ElementType;
      children: React.ReactNode;
      active?: boolean;
      onActivate?: () => void;
}) {
      return (
            <div id={id} className="scroll-mt-6">
                  <button
                        type="button"
                        onClick={onActivate}
                        className="w-full flex items-center gap-3 mb-4 group"
                  >
                        <div
                              className={cn(
                                    'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                                    active
                                          ? 'bg-accent-gold/20 border border-accent-gold/30'
                                          : 'bg-bg-hover border border-bg-border group-hover:border-accent-gold/20'
                              )}
                        >
                              <Icon
                                    size={14}
                                    className={
                                          active
                                                ? 'text-accent-gold'
                                                : 'text-ink-muted'
                                    }
                              />
                        </div>
                        <h3
                              className={cn(
                                    'font-display font-semibold text-sm uppercase tracking-widest transition-colors',
                                    active
                                          ? 'text-accent-gold'
                                          : 'text-ink-secondary group-hover:text-ink-primary'
                              )}
                        >
                              {title}
                        </h3>
                        <div className="flex-1 h-px bg-bg-border" />
                  </button>
                  <div className="space-y-4">{children}</div>
            </div>
      );
}

// ── Add button ────────────────────────────────────────────────────────────────
function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
      return (
            <button
                  type="button"
                  onClick={onClick}
                  className="border border-accent-gold/50 hover:bg-accent-gold/10 hover:border-accent-gold transition-all rounded-xl w-full flex items-center justify-center gap-2 px-4 py-2.5 cursor-pointer"
            >
                  <PlusIcon size={16} className="text-accent-gold" />
                  <span className="text-accent-gold text-sm font-body">
                        {label}
                  </span>
            </button>
      );
}

// ── Remove button ─────────────────────────────────────────────────────────────
function RemoveButton({ onClick }: { onClick: () => void }) {
      return (
            <button
                  type="button"
                  onClick={onClick}
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-lg text-ink-faint hover:text-accent-red hover:bg-accent-red/10 transition-all border border-transparent hover:border-accent-red/20"
                  aria-label="Remove"
            >
                  <span className="text-xs leading-none">✕</span>
            </button>
      );
}

// ── Entry card shell ──────────────────────────────────────────────────────────
function EntryCard({
      children,
      removable,
      onRemove,
}: {
      children: React.ReactNode;
      removable?: boolean;
      onRemove?: () => void;
}) {
      return (
            <div className="relative border border-bg-border rounded-xl p-4 bg-bg-hover/40 space-y-4">
                  {removable && onRemove && <RemoveButton onClick={onRemove} />}
                  {children}
            </div>
      );
}

// ── ContactFields ─────────────────────────────────────────────────────────────
function ContactFields({
      contact,
      index,
      onChange,
      onRemove,
}: {
      contact: ContactMethod;
      index: number;
      onChange: (c: ContactMethod) => void;
      onRemove?: () => void;
}) {
      const patch = <K extends keyof ContactMethod>(
            k: K,
            v: ContactMethod[K]
      ) => onChange({ ...contact, [k]: v });

      return (
            <EntryCard removable={Boolean(onRemove)} onRemove={onRemove}>
                  <div className="grid grid-cols-1 gap-4">
                        {/* Primary toggle only on first contact */}
                        {index === 0 && (
                              <div className="flex items-center gap-2">
                                    <input
                                          type="checkbox"
                                          id={`contact_primary_${index}`}
                                          checked={contact.is_primary}
                                          onChange={(e) =>
                                                patch(
                                                      'is_primary',
                                                      e.target.checked
                                                )
                                          }
                                          className="w-4 h-4 accent-[#F5C842] bg-bg-hover border-bg-border rounded"
                                    />
                                    <label
                                          htmlFor={`contact_primary_${index}`}
                                          className="text-sm font-body text-ink-primary"
                                    >
                                          Primary contact
                                    </label>
                              </div>
                        )}

                        <div className="grid grid-cols-3 gap-3">
                              <Field label="Type">
                                    <select
                                          value={contact.type}
                                          onChange={(e) =>
                                                patch(
                                                      'type',
                                                      e.target
                                                            .value as ContactType
                                                )
                                          }
                                          className="w-full bg-bg-card border border-bg-border rounded-xl px-3 py-2.5 text-sm font-body text-ink-primary outline-none focus:border-accent-gold/50 transition-all"
                                    >
                                          <option value="phone">Phone</option>
                                          <option value="email">Email</option>
                                    </select>
                              </Field>
                              <div className="col-span-2">
                                    <Field
                                          label={
                                                contact.type === 'email'
                                                      ? 'Email Address'
                                                      : 'Phone Number'
                                          }
                                    >
                                          <Input
                                                value={contact.value}
                                                onChange_={(v) =>
                                                      patch('value', v)
                                                }
                                                type={
                                                      contact.type === 'email'
                                                            ? 'email'
                                                            : 'tel'
                                                }
                                                placeholder={
                                                      contact.type === 'email'
                                                            ? 'customer@email.com'
                                                            : '+234 812 000 0000'
                                                }
                                          />
                                    </Field>
                              </div>
                        </div>
                  </div>
            </EntryCard>
      );
}

// ── AddressFields ─────────────────────────────────────────────────────────────
function AddressFields({
      address,
      index,
      onChange,
      onRemove,
}: {
      address: Address;
      index: number;
      onChange: (a: Address) => void;
      onRemove?: () => void;
}) {
      const patch = <K extends keyof Address>(k: K, v: Address[K]) =>
            onChange({ ...address, [k]: v });

      return (
            <EntryCard removable={Boolean(onRemove)} onRemove={onRemove}>
                  {/* Primary toggle on first address */}
                  {index === 0 && (
                        <div className="flex items-center gap-2">
                              <input
                                    type="checkbox"
                                    id={`addr_primary_${index}`}
                                    checked={address.is_primary}
                                    onChange={(e) =>
                                          patch('is_primary', e.target.checked)
                                    }
                                    className="w-4 h-4 accent-[#F5C842] bg-bg-hover border-bg-border rounded"
                              />
                              <label
                                    htmlFor={`addr_primary_${index}`}
                                    className="text-sm font-body text-ink-primary"
                              >
                                    Primary address
                              </label>
                        </div>
                  )}

                  <Field label="Label">
                        <select
                              value={address.label}
                              onChange={(e) =>
                                    patch(
                                          'label',
                                          e.target.value as Address['label']
                                    )
                              }
                              className="w-full bg-bg-card border border-bg-border rounded-xl px-3 py-2.5 text-sm font-body text-ink-primary outline-none focus:border-accent-gold/50 transition-all"
                        >
                              {ctm_addr_label.map(
                                    (a: { id: string; value: string }) => (
                                          <option key={a.id} value={a.id}>
                                                {a.value}
                                          </option>
                                    )
                              )}
                        </select>
                  </Field>

                  <Field label="Address Line 1">
                        <Input
                              value={address.line_1}
                              onChange_={(v) => patch('line_1', v)}
                              placeholder="Street address, building"
                        />
                  </Field>
                  <Field label="Address Line 2">
                        <Input
                              value={address.line_2}
                              onChange_={(v) => patch('line_2', v)}
                              placeholder="Apartment, floor, landmark (optional)"
                        />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                        <Field label="City">
                              <Input
                                    value={address.city}
                                    onChange_={(v) => patch('city', v)}
                                    placeholder="e.g. Kano"
                              />
                        </Field>
                        <Field label="State">
                              <Input
                                    value={address.state}
                                    onChange_={(v) => patch('state', v)}
                                    placeholder="e.g. Kano State"
                              />
                        </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                        <Field label="Postal Code">
                              <Input
                                    value={address.postal_code}
                                    onChange_={(v) => patch('postal_code', v)}
                                    placeholder="700001"
                              />
                        </Field>
                        <Field label="Country">
                              <Input
                                    value={address.country}
                                    onChange_={(v) => patch('country', v)}
                                    placeholder="Nigeria"
                              />
                        </Field>
                  </div>
            </EntryCard>
      );
}

// ── AccountFields ─────────────────────────────────────────────────────────────
function AccountFields({
      account,
      onRemove,
      onChange,
}: {
      account: CustomerAccount;
      onRemove?: () => void;
      onChange: (a: CustomerAccount) => void;
}) {
      const patch = <K extends keyof CustomerAccount>(
            k: K,
            v: CustomerAccount[K]
      ) => onChange({ ...account, [k]: v });

      return (
            <EntryCard removable={Boolean(onRemove)} onRemove={onRemove}>
                  <div className="grid grid-cols-2 gap-4">
                        <Field label="Bank Name">
                              <Input
                                    value={account.bank_name}
                                    onChange_={(v) => patch('bank_name', v)}
                                    placeholder="e.g. Access Bank, GTBank"
                              />
                        </Field>
                        <Field label="Account Number">
                              <Input
                                    value={account.account_no}
                                    onChange_={(v) => patch('account_no', v)}
                                    placeholder="0060450000"
                              />
                        </Field>
                  </div>
                  <Field label="Account Name">
                        <Input
                              value={account.account_name}
                              onChange_={(v) => patch('account_name', v)}
                              placeholder="Name as it appears on the account"
                        />
                  </Field>
            </EntryCard>
      );
}

// ── Section components ────────────────────────────────────────────────────────

function Identity({
      activeSection,
      setActiveSection,
      form,
      set,
      errors,
}: SectionProps) {
      return (
            <SectionCard
                  id="identity"
                  title="Identity"
                  icon={User}
                  active={activeSection === 'identity'}
                  onActivate={() => setActiveSection('identity')}
            >
                  <div className="grid grid-cols-2 gap-4">
                        <Field
                              label="First Name"
                              required
                              error={errors.first_name}
                        >
                              <Input
                                    value={form.first_name}
                                    onChange_={set('first_name')}
                                    placeholder="e.g. Fahad"
                              />
                        </Field>
                        <Field label="Last Name">
                              <Input
                                    value={form.last_name}
                                    onChange_={set('last_name')}
                                    placeholder="e.g. Tahir"
                              />
                        </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                        <Field label="Category">
                              <select
                                    value={form.category}
                                    onChange={(e) =>
                                          set('category')(
                                                e.target
                                                      .value as CustomerForm['category']
                                          )
                                    }
                                    className="w-full bg-bg-hover border border-bg-border rounded-xl px-3 py-2.5 text-sm font-body text-ink-primary outline-none focus:border-accent-gold/50 transition-all"
                              >
                                    {ctm_category.map(
                                          (c: {
                                                id: string;
                                                value: string;
                                          }) => (
                                                <option key={c.id} value={c.id}>
                                                      {c.value}
                                                </option>
                                          )
                                    )}
                              </select>
                        </Field>
                        <Field label="Status Level">
                              <select
                                    value={form.status_level}
                                    onChange={(e) =>
                                          set('status_level')(
                                                e.target
                                                      .value as CustomerForm['status_level']
                                          )
                                    }
                                    className="w-full bg-bg-hover border border-bg-border rounded-xl px-3 py-2.5 text-sm font-body text-ink-primary outline-none focus:border-accent-gold/50 transition-all"
                              >
                                    {ctm_status_lvl.map(
                                          (l: {
                                                id: string;
                                                value: string;
                                          }) => (
                                                <option key={l.id} value={l.id}>
                                                      {l.value}
                                                </option>
                                          )
                                    )}
                              </select>
                        </Field>
                  </div>

                  <Toggle
                        checked={form.is_active}
                        onChange={set('is_active')}
                        label="Active customer"
                        description="Inactive customers are hidden from the POS"
                  />
            </SectionCard>
      );
}

function Contact({
      activeSection,
      setActiveSection,
      form,
      set,
      setForm,
      errors,
}: SectionProps) {
      const addContact = (type: ContactType) => {
            setForm((prev) => ({
                  ...prev,
                  contacts: [
                        ...prev.contacts,
                        {
                              id: '',
                              customer_id: '',
                              type,
                              value: '',
                              is_primary: false,
                        },
                  ],
            }));
      };

      const updateContact = (i: number, c: ContactMethod) =>
            setForm((prev) => ({
                  ...prev,
                  contacts: prev.contacts.map((x, idx) => (idx === i ? c : x)),
            }));

      const removeContact = (i: number) =>
            setForm((prev) => ({
                  ...prev,
                  contacts: prev.contacts.filter((_, idx) => idx !== i),
            }));

      return (
            <SectionCard
                  id="contact"
                  title="Contact"
                  icon={Phone}
                  active={activeSection === 'contact'}
                  onActivate={() => setActiveSection('contact')}
            >
                  <div className="space-y-3">
                        {form.contacts.map((c, i) => (
                              <ContactFields
                                    key={i}
                                    index={i}
                                    contact={c}
                                    onChange={(updated) =>
                                          updateContact(i, updated)
                                    }
                                    onRemove={
                                          form.contacts.length > 1
                                                ? () => removeContact(i)
                                                : undefined
                                    }
                              />
                        ))}
                  </div>

                  <div className="flex items-center gap-3">
                        <AddButton
                              label="Add Phone"
                              onClick={() => addContact('phone')}
                        />
                        <AddButton
                              label="Add Email"
                              onClick={() => addContact('email')}
                        />
                  </div>

                  <div className="space-y-2 pt-1">
                        <Toggle
                              checked={form.auto_email_receipt}
                              onChange={set('auto_email_receipt')}
                              label="Auto-send email receipts"
                              description="Automatically email receipts after each sale"
                        />
                        <Toggle
                              checked={form.always_sms_receipt}
                              onChange={set('always_sms_receipt')}
                              label="Always SMS receipt"
                              description="Send SMS receipt for every transaction"
                        />
                  </div>
            </SectionCard>
      );
}

function Addresses({
      activeSection,
      setActiveSection,
      form,
      setForm,
}: SectionProps) {
      const addAddress = () =>
            setForm((prev) => ({
                  ...prev,
                  addresses: [
                        ...prev.addresses,
                        {
                              ...DEFAULT_ADDRESS,
                              is_primary: prev.addresses.length === 0,
                        },
                  ],
            }));

      const updateAddress = (i: number, a: Address) =>
            setForm((prev) => ({
                  ...prev,
                  addresses: prev.addresses.map((x, idx) =>
                        idx === i ? a : x
                  ),
            }));

      const removeAddress = (i: number) =>
            setForm((prev) => {
                  const next = prev.addresses.filter((_, idx) => idx !== i);
                  // Ensure at least one primary remains
                  if (next.length > 0 && !next.some((a) => a.is_primary)) {
                        next[0] = { ...next[0], is_primary: true };
                  }
                  return { ...prev, addresses: next };
            });

      return (
            <SectionCard
                  id="address"
                  title="Address"
                  icon={MapPin}
                  active={activeSection === 'address'}
                  onActivate={() => setActiveSection('address')}
            >
                  <div className="space-y-3">
                        {form.addresses.map((a, i) => (
                              <AddressFields
                                    key={i}
                                    index={i}
                                    address={a}
                                    onChange={(updated) =>
                                          updateAddress(i, updated)
                                    }
                                    onRemove={
                                          form.addresses.length > 1
                                                ? () => removeAddress(i)
                                                : undefined
                                    }
                              />
                        ))}
                  </div>
                  <AddButton label="Add Address" onClick={addAddress} />
            </SectionCard>
      );
}

function Accounts({
      activeSection,
      setActiveSection,
      form,
      setForm,
}: SectionProps) {
      const addAccount = () =>
            setForm((prev) => ({
                  ...prev,
                  accounts: [...prev.accounts, { ...DEFAULT_ACCOUNT }],
            }));

      const updateAccount = (i: number, a: CustomerAccount) =>
            setForm((prev) => ({
                  ...prev,
                  accounts: prev.accounts.map((x, idx) => (idx === i ? a : x)),
            }));

      const removeAccount = (i: number) =>
            setForm((prev) => ({
                  ...prev,
                  accounts: prev.accounts.filter((_, idx) => idx !== i),
            }));

      return (
            <SectionCard
                  id="accounts"
                  title="Bank Accounts"
                  icon={CreditCard}
                  active={activeSection === 'accounts'}
                  onActivate={() => setActiveSection('accounts')}
            >
                  {form.accounts.length === 0 && (
                        <p className="text-xs font-body text-ink-faint text-center py-3">
                              No bank accounts added yet.
                        </p>
                  )}
                  <div className="space-y-3">
                        {form.accounts.map((a, i) => (
                              <AccountFields
                                    key={i}
                                    account={a}
                                    onChange={(updated) =>
                                          updateAccount(i, updated)
                                    }
                                    onRemove={() => removeAccount(i)}
                              />
                        ))}
                  </div>
                  <AddButton label="Add Bank Account" onClick={addAccount} />
            </SectionCard>
      );
}

function Company({ activeSection, setActiveSection, form, set }: SectionProps) {
      return (
            <SectionCard
                  id="company"
                  title="Company (Optional)"
                  icon={Building2}
                  active={activeSection === 'company'}
                  onActivate={() => setActiveSection('company')}
            >
                  <Field label="Company Name">
                        <Input
                              value={form.company_name ?? ''}
                              onChange_={set('company_name')}
                              placeholder="e.g. FAHAD TAHIR SHOP"
                        />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                        <Field label="Company Email">
                              <Input
                                    value={form.company_email ?? ''}
                                    onChange_={set('company_email')}
                                    type="email"
                                    placeholder="company@email.com"
                              />
                        </Field>
                        <Field label="Company Phone">
                              <Input
                                    value={form.company_phone ?? ''}
                                    onChange_={set('company_phone')}
                                    type="tel"
                                    placeholder="+234 803 000 0000"
                              />
                        </Field>
                  </div>
                  <Field label="Website">
                        <Input
                              value={form.company_website ?? ''}
                              onChange_={set('company_website')}
                              type="url"
                              placeholder="https://example.com"
                        />
                  </Field>
            </SectionCard>
      );
}

function Financial({
      activeSection,
      setActiveSection,
      form,
      set,
}: SectionProps) {
      return (
            <SectionCard
                  id="financial"
                  title="Financial"
                  icon={DollarSign}
                  active={activeSection === 'financial'}
                  onActivate={() => setActiveSection('financial')}
            >
                  <div className="grid grid-cols-2 gap-4">
                        <Field
                              label="Account Balance (₦)"
                              hint="Current balance on account"
                        >
                              <Input
                                    value={form.balance}
                                    onChange_={set('balance')}
                                    type="number"
                                    prefix="₦"
                              />
                        </Field>
                        <Field
                              label="Credit Limit (₦)"
                              hint="Maximum credit allowed"
                        >
                              <Input
                                    value={form.credit_limit}
                                    onChange_={set('credit_limit')}
                                    type="number"
                                    prefix="₦"
                              />
                        </Field>
                  </div>

                  <Toggle
                        checked={form.taxable}
                        onChange={set('taxable')}
                        label="Customer is taxable"
                        description="Include tax on this customer's invoices"
                  />

                  {!form.taxable && (
                        <Field label="Non-Tax Certificate Number">
                              <Input
                                    value={form.non_tax_certificate_number}
                                    onChange_={set(
                                          'non_tax_certificate_number'
                                    )}
                                    placeholder="Exemption certificate number"
                              />
                        </Field>
                  )}

                  <Field label="Default Invoice Terms">
                        <select
                              value={form.default_invoice_terms}
                              onChange={(e) =>
                                    set('default_invoice_terms')(e.target.value)
                              }
                              className="w-full bg-bg-hover border border-bg-border rounded-xl px-3 py-2.5 text-sm font-body text-ink-primary outline-none focus:border-accent-gold/50 transition-all"
                        >
                              <option value="">None</option>
                              <option value="Due on receipt">
                                    Due on receipt
                              </option>
                              <option value="Net 7">Net 7</option>
                              <option value="Net 14">Net 14</option>
                              <option value="Net 30">Net 30</option>
                              <option value="Net 60">Net 60</option>
                        </select>
                  </Field>
            </SectionCard>
      );
}

function Loyalty({ activeSection, setActiveSection, form, set }: SectionProps) {
      return (
            <SectionCard
                  id="loyalty"
                  title="Loyalty"
                  icon={Star}
                  active={activeSection === 'loyalty'}
                  onActivate={() => setActiveSection('loyalty')}
            >
                  <Toggle
                        checked={!form.disable_loyalty}
                        onChange={(v) => set('disable_loyalty')(!v)}
                        label="Loyalty programme enabled"
                        description="Customer earns and redeems loyalty points"
                  />

                  {!form.disable_loyalty && (
                        <Field label="Current Points Balance">
                              <Input
                                    value={form.points}
                                    onChange_={set('points')}
                                    type="number"
                                    placeholder="0"
                              />
                        </Field>
                  )}

                  <Field
                        label="POS Alert Message"
                        hint="Shown when this customer is added to a sale"
                  >
                        <Input
                              value={
                                    form.message_to_show_when_adding_customer_to_sale
                              }
                              onChange_={set(
                                    'message_to_show_when_adding_customer_to_sale'
                              )}
                              placeholder="e.g. VIP customer — apply 5% discount"
                        />
                  </Field>
            </SectionCard>
      );
}

function Notes({ activeSection, setActiveSection, form, set }: SectionProps) {
      return (
            <SectionCard
                  id="notes"
                  title="Notes"
                  icon={FileText}
                  active={activeSection === 'notes'}
                  onActivate={() => setActiveSection('notes')}
            >
                  <Field
                        id="comment"
                        label="Customer Comment"
                        hint="Visible on invoices and receipts"
                  >
                        <Textarea
                              id="comment"
                              value={form.comment}
                              onChange_={set('comment')}
                              placeholder="Public notes about this customer…"
                              rows={3}
                        />
                  </Field>
                  <Field
                        id="internal_notes"
                        label="Internal Notes"
                        hint="Staff-only — not shown to customer"
                  >
                        <Textarea
                              id="internal_notes"
                              value={form.internal_notes}
                              onChange_={set('internal_notes')}
                              placeholder="Private staff notes…"
                              rows={3}
                        />
                  </Field>
            </SectionCard>
      );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function CustomerFormPage() {
      const navigate = useNavigate();
      const { id } = useParams<{ id?: string }>();
      const isEdit = Boolean(id);

      const [form, setForm] = useState<CustomerForm>(EMPTY_FORM);
      const [customerId, setCustomerId] = useState<string | null>(null); // uuid PK
      const [activeSection, setActiveSection] = useState('identity');
      const [saving, setSaving] = useState(false);
      const [loading, setLoading] = useState(isEdit);
      const [saved, setSaved] = useState(false);
      const [errors, setErrors] = useState<
            Partial<Record<keyof CustomerForm, string>>
      >({});
      const [globalError, setGlobalError] = useState<string | null>(null);

      // Typed setter — preserves the actual value type from the form key
      const set =
            <K extends keyof CustomerForm>(key: K) =>
            (value: CustomerForm[K]) =>
                  setForm((prev) => ({ ...prev, [key]: value }));

      // ── Load existing customer + sub-tables ───────────────────────────────────
      useEffect(() => {
            if (!isEdit || !id) return;

            Promise.all([
                  supabase.from('customers').select('*').eq('id', id).single(),
                  supabase
                        .from('customer_addresses')
                        .select('*')
                        .eq('customer_id', id)
                        .order('created_at'),
                  supabase
                        .from('customer_accounts')
                        .select('*')
                        .eq('customer_id', id)
                        .order('created_at'),
                  supabase
                        .from('customer_contact_methods')
                        .select('*')
                        .eq('customer_id', id)
                        .order('created_at'),
            ]).then(([custRes, addrRes, acctRes, custCntct]) => {
                  if (custRes.error || !custRes.data) {
                        setGlobalError('Customer not found');
                        setLoading(false);
                        return;
                  }

                  const d = custRes.data;
                  setCustomerId(d.id);

                  const loadedAddresses: Address[] = (addrRes.data ?? []).map(
                        (a) => ({
                              id: a.id,
                              customer_id: a.customer_id,
                              label: a.label as Address['label'],
                              is_primary: a.is_primary,
                              line_1: a.line_1 ?? '',
                              line_2: a.line_2 ?? '',
                              city: a.city ?? '',
                              state: a.state ?? '',
                              postal_code: a.postal_code ?? '',
                              country: a.country ?? 'Nigeria',
                        })
                  );

                  const loadedAccounts: CustomerAccount[] = (
                        acctRes.data ?? []
                  ).map((a) => ({
                        id: a.id,
                        customer_id: a.customer_id,
                        account_no: a.account_no ?? '',
                        account_name: a.account_name ?? '',
                        bank_name: a.bank_name ?? '',
                  }));

                  const loadedContacts: ContactMethod[] = (
                        custCntct.data ?? []
                  ).map((c) => ({
                        id: c.id,
                        customer_id: c.customer_id,
                        type: c.type ?? '',
                        value: c.value ?? '',
                        is_primary: c.is_primary ?? '',
                  }));

                  setForm({
                        first_name: d.first_name ?? '',
                        last_name: d.last_name ?? '',
                        email: d.email ?? '',
                        company_name: d.company_name ?? '',
                        company_email: d.company_email ?? '',
                        company_phone: d.company_phone ?? '',
                        company_website: d.company_website ?? '',
                        category: d.category ?? 'STANDARD',
                        status_level: d.status_level ?? 'SILVER',
                        is_active: d.is_active ?? true,
                        balance: String(d.balance ?? 0),
                        credit_limit: String(d.credit_limit ?? 0),
                        taxable: d.taxable ?? true,
                        non_tax_certificate_number:
                              d.non_tax_certificate_number ?? '',
                        default_invoice_terms: d.default_invoice_terms ?? '',
                        disable_loyalty: d.disable_loyalty ?? false,
                        points: String(d.points ?? 0),
                        auto_email_receipt: d.auto_email_receipt ?? false,
                        always_sms_receipt: d.always_sms_receipt ?? false,
                        message_to_show_when_adding_customer_to_sale:
                              d.message_to_show_when_adding_customer_to_sale ??
                              '',
                        comment: d.comment ?? '',
                        internal_notes: d.internal_notes ?? '',
                        addresses:
                              loadedAddresses.length > 0
                                    ? loadedAddresses
                                    : [{ ...DEFAULT_ADDRESS }],
                        accounts: loadedAccounts,
                        contacts: loadedContacts, // future: load from customer_contacts table
                  });

                  setLoading(false);
            });
      }, [id, isEdit]);

      // ── Validation ────────────────────────────────────────────────────────────
      const validate = (): boolean => {
            const errs: typeof errors = {};

            if (!form.first_name.trim() && !form.company_name?.trim())
                  errs.first_name = 'First name or company name is required';

            if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                  errs.email = 'Invalid email address';

            // Validate at least line_1 + city + state on every address
            form.addresses.forEach((a, i) => {
                  if (!a.line_1.trim())
                        errs.first_name =
                              errs.first_name ??
                              `Address ${i + 1}: line 1 is required`;
            });

            // Validate accounts have all three fields
            form.accounts.forEach((a, i) => {
                  if (
                        !a.bank_name.trim() ||
                        !a.account_no.trim() ||
                        !a.account_name.trim()
                  )
                        errs.first_name =
                              errs.first_name ??
                              `Account ${i + 1}: all fields are required`;
            });

            setErrors(errs);

            // Scroll to first section with error
            if (errs.first_name) setActiveSection('identity');
            else if (errs.email) setActiveSection('contact');

            return Object.keys(errs).length === 0;
      };

      // ── Save ──────────────────────────────────────────────────────────────────
      const handleSave = async () => {
            if (!validate()) return;
            setSaving(true);
            setGlobalError(null);

            try {
                  // 1. Upsert core customer row
                  const corePayload = {
                        first_name: form.first_name.trim() || null,
                        last_name: form.last_name.trim() || null,
                        email: form.email.trim() || null,
                        company_name: form.company_name?.trim() || null,
                        company_email: form.company_email?.trim() || null,
                        company_phone: form.company_phone?.trim() || null,
                        company_website: form.company_website?.trim() || null,
                        category: form.category,
                        status_level: form.status_level,
                        is_active: form.is_active,
                        // legacy POS fields
                        balance: parseFloat(form.balance) || 0,
                        credit_limit: parseFloat(form.credit_limit) || 0,
                        taxable: form.taxable,
                        non_tax_certificate_number:
                              form.non_tax_certificate_number.trim() || null,
                        default_invoice_terms:
                              form.default_invoice_terms.trim() || null,
                        disable_loyalty: form.disable_loyalty,
                        points: parseInt(form.points) || 0,
                        auto_email_receipt: form.auto_email_receipt,
                        always_sms_receipt: form.always_sms_receipt,
                        message_to_show_when_adding_customer_to_sale:
                              form.message_to_show_when_adding_customer_to_sale.trim() ||
                              null,
                        comment: form.comment.trim() || null,
                        internal_notes: form.internal_notes.trim() || null,
                  };

                  let finalCustomerId = customerId;

                  if (isEdit && customerId) {
                        const { error } = await supabase
                              .from('customers')
                              .update(corePayload)
                              .eq('id', customerId);
                        if (error) {
                              console.log(error);
                              throw error;
                        }
                  } else {
                        const { data, error } = await supabase
                              .from('customers')
                              .insert(corePayload)
                              .select('id')
                              .single();
                        if (error) throw error;
                        finalCustomerId = data.id;
                        setCustomerId(data.id);
                  }

                  if (!finalCustomerId)
                        throw new Error('Customer ID missing after save');

                  // 2. Upsert addresses
                  for (const addr of form.addresses) {
                        const addrPayload = {
                              customer_id: finalCustomerId,
                              label: addr.label,
                              is_primary: addr.is_primary,
                              line_1: addr.line_1.trim(),
                              line_2: addr.line_2.trim() || null,
                              city: addr.city.trim(),
                              state: addr.state.trim(),
                              postal_code: addr.postal_code.trim() || null,
                              country: addr.country.trim() || 'Nigeria',
                        };
                        if (addr.id) {
                              await supabase
                                    .from('customer_addresses')
                                    .update(addrPayload)
                                    .eq('id', addr.id);
                        } else {
                              const { data } = await supabase
                                    .from('customer_addresses')
                                    .insert(addrPayload)
                                    .select('id')
                                    .single();
                              if (data) addr.id = data.id; // backfill id so re-saves don't duplicate
                        }
                  }

                  // 3. Upsert bank accounts
                  for (const acct of form.accounts) {
                        const acctPayload = {
                              customer_id: finalCustomerId,
                              account_no: acct.account_no.trim(),
                              account_name: acct.account_name.trim(),
                              bank_name: acct.bank_name.trim(),
                        };
                        if (acct.id) {
                              await supabase
                                    .from('customer_accounts')
                                    .update(acctPayload)
                                    .eq('id', acct.id);
                        } else {
                              const { data } = await supabase
                                    .from('customer_accounts')
                                    .insert(acctPayload)
                                    .select('id')
                                    .single();
                              if (data) acct.id = data.id;
                        }
                  }

                  // 4. Upsert Contact Methods
                  for (const contact of form.contacts) {
                        const contactPayload: ContactMethod = {
                              customer_id: finalCustomerId,
                              type: contact.type,
                              value: contact.value.trim(),
                              is_primary: contact.is_primary,
                        };
                        if (contactPayload.id) {
                              await supabase
                                    .from('customer_contact_methods')
                                    .update(contactPayload)
                                    .eq('id', contact.id);
                        } else {
                              const { data } = await supabase
                                    .from('customer_contact_methods')
                                    .insert(contactPayload)
                                    .select('id')
                                    .single();
                              if (data) contactPayload.id = data.id;
                        }
                  }

                  setSaved(true);
                  setTimeout(() => navigate('/customers'), 1200);
            } catch (err: unknown) {
                  setGlobalError(
                        err instanceof Error
                              ? err.message
                              : 'Save failed. Please try again.'
                  );
            } finally {
                  setSaving(false);
            }
      };

      // ── Scroll helper ─────────────────────────────────────────────────────────
      const scrollTo = (sectionId: string) => {
            setActiveSection(sectionId);
            document
                  .getElementById(sectionId)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };

      // ── Loading state ─────────────────────────────────────────────────────────
      if (loading) {
            return (
                  <div className="flex-1 flex flex-col min-h-screen">
                        <TopBar
                              title={isEdit ? 'Edit Customer' : 'New Customer'}
                        />
                        <div className="flex-1 flex items-center justify-center gap-3">
                              <Loader2
                                    size={20}
                                    className="animate-spin text-accent-gold"
                              />
                              <span className="text-ink-muted font-body text-sm">
                                    Loading customer…
                              </span>
                        </div>
                  </div>
            );
      }

      const displayName =
            [form.first_name, form.last_name].filter(Boolean).join(' ') ||
            form.company_name ||
            'New Customer';

      // Shared props passed to every section
      const sectionProps: SectionProps = {
            activeSection,
            setActiveSection,
            form,
            set,
            errors,
            setForm,
      };

      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar
                        title={isEdit ? `Edit: ${displayName}` : 'New Customer'}
                        subtitle={
                              isEdit
                                    ? `ID #${id}`
                                    : 'Create a new customer record'
                        }
                        shouldNavigateBack
                  />

                  <div className="flex-1 flex min-h-0">
                        {/* ── Left sidebar nav ── */}
                        <aside className="hidden md:block w-52 flex-shrink-0 border-r border-bg-border bg-bg-panel sticky top-14 h-[calc(100vh-56px)] flex flex-col">
                              {/* Avatar preview */}
                              <div className="p-4 border-b border-bg-border">
                                    <div className="w-12 h-12 rounded-2xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center mx-auto mb-2">
                                          <User
                                                size={20}
                                                className="text-accent-gold"
                                          />
                                    </div>
                                    <p className="text-xs font-body text-center text-ink-secondary truncate px-1">
                                          {displayName}
                                    </p>
                                    <div className="flex items-center justify-center gap-1.5 mt-1.5">
                                          <span className="text-[9px] font-mono text-ink-faint uppercase tracking-widest">
                                                {form.category}
                                          </span>
                                          <span className="text-ink-faint">
                                                ·
                                          </span>
                                          <span className="text-[9px] font-mono text-ink-faint uppercase tracking-widest">
                                                {form.status_level}
                                          </span>
                                    </div>
                              </div>

                              <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                                    {SECTIONS.map((s) => {
                                          // Show count badge for multi-entry sections
                                          const badge =
                                                s.id === 'address'
                                                      ? form.addresses.length
                                                      : s.id === 'accounts'
                                                        ? form.accounts.length
                                                        : s.id === 'contact'
                                                          ? form.contacts.length
                                                          : null;

                                          return (
                                                <button
                                                      key={s.id}
                                                      type="button"
                                                      onClick={() =>
                                                            scrollTo(s.id)
                                                      }
                                                      className={cn(
                                                            'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-body transition-all text-left',
                                                            activeSection ===
                                                                  s.id
                                                                  ? 'bg-accent-gold/10 text-accent-gold border border-accent-gold/20'
                                                                  : 'text-ink-secondary hover:text-ink-primary hover:bg-bg-hover'
                                                      )}
                                                >
                                                      <s.icon
                                                            size={14}
                                                            className={
                                                                  activeSection ===
                                                                  s.id
                                                                        ? 'text-accent-gold'
                                                                        : 'text-ink-muted'
                                                            }
                                                      />
                                                      <span className="flex-1">
                                                            {s.label}
                                                      </span>
                                                      {badge !== null &&
                                                            badge > 0 && (
                                                                  <span
                                                                        className={cn(
                                                                              'text-[10px] font-mono w-4 h-4 rounded-full flex items-center justify-center',
                                                                              activeSection ===
                                                                                    s.id
                                                                                    ? 'bg-accent-gold/20 text-accent-gold'
                                                                                    : 'bg-bg-hover text-ink-faint'
                                                                        )}
                                                                  >
                                                                        {badge}
                                                                  </span>
                                                            )}
                                                </button>
                                          );
                                    })}
                              </nav>

                              <div className="p-3 border-t border-bg-border">
                                    {isEdit && (
                                          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-body text-accent-red hover:bg-accent-red/10 transition-all">
                                                <Trash2 size={12} />
                                                Delete customer
                                          </button>
                                    )}
                              </div>
                        </aside>

                        {/* ── Main form area ── */}
                        <main className="flex-1 min-w-0 overflow-y-auto">
                              <div className="max-w-2xl mx-auto px-6 py-8 space-y-10">
                                    {globalError && (
                                          <div className="flex items-center gap-3 bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3">
                                                <AlertCircle
                                                      size={16}
                                                      className="text-accent-red shrink-0"
                                                />
                                                <p className="text-sm font-body text-accent-red">
                                                      {globalError}
                                                </p>
                                          </div>
                                    )}

                                    <Identity {...sectionProps} />
                                    <Contact {...sectionProps} />
                                    <Addresses {...sectionProps} />
                                    <Accounts {...sectionProps} />
                                    <Company {...sectionProps} />
                                    <Financial {...sectionProps} />
                                    <Loyalty {...sectionProps} />
                                    <Notes {...sectionProps} />

                                    {/* ── Sticky save bar ── */}
                                    <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-bg-base/90 backdrop-blur-md border-t border-bg-border flex items-center justify-between gap-4">
                                          <button
                                                type="button"
                                                onClick={() => navigate(-1)}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-bg-border text-ink-secondary hover:text-ink-primary hover:border-bg-muted text-sm font-body transition-all"
                                          >
                                                <ChevronLeft size={15} />
                                                Cancel
                                          </button>

                                          <div className="flex items-center gap-3">
                                                {Object.keys(errors).length >
                                                      0 && (
                                                      <p className="text-xs text-accent-red font-body flex items-center gap-1">
                                                            <AlertCircle
                                                                  size={11}
                                                            />
                                                            Fix errors before
                                                            saving
                                                      </p>
                                                )}
                                                {saved && (
                                                      <div className="flex items-center gap-1.5 text-accent-teal text-sm font-body animate-fade-in">
                                                            <Check size={14} />
                                                            Saved!
                                                      </div>
                                                )}
                                                <button
                                                      type="button"
                                                      onClick={handleSave}
                                                      disabled={saving}
                                                      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent-gold/15 border border-accent-gold/30 text-accent-gold text-sm font-mono font-medium hover:bg-accent-gold/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                      {saving ? (
                                                            <>
                                                                  <Loader2
                                                                        size={
                                                                              15
                                                                        }
                                                                        className="animate-spin"
                                                                  />
                                                                  Saving…
                                                            </>
                                                      ) : (
                                                            <>
                                                                  <Save
                                                                        size={
                                                                              15
                                                                        }
                                                                  />
                                                                  {isEdit
                                                                        ? 'Update Customer'
                                                                        : 'Create Customer'}
                                                            </>
                                                      )}
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        </main>
                  </div>
            </div>
      );
}
