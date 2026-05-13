import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopBar } from '@/components/ui/TopBar';
import { supabase } from '@/lib/supabase';
import { fmtCurrency, cn } from '@/lib/utils';
import * as Tabs from '@radix-ui/react-tabs';
import {
      Package,
      Tag,
      DollarSign,
      Archive,
      Layers,
      Settings2,
      ChevronLeft,
      Save,
      Loader2,
      AlertCircle,
      Check,
      Barcode,
      Truck,
      Star,
      Trash2,
      Plus,
      Info,
      Weight,
      Ruler,
      ToggleLeft,
      Hash,
      Percent,
      Calendar,
      Box,
      ShoppingCart,
      Repeat,
      AlertTriangle,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Supplier {
      pos_supplier_id: number;
      company_name: string;
}

interface ProductForm {
      // Details
      item_name: string;
      item_number: string;
      product_id: string;
      barcode_display_name: string;
      category: string;
      supplier_id: string;
      variation: string;
      description: string;
      long_description: string;
      information_popup_when_adding_to_sale: string;
      manufacturer: string;
      location_at_store: string;
      tags: string;
      is_service: boolean;
      is_favorite: boolean;
      is_barcoded: boolean;
      inactive: boolean;
      // Pricing
      cost_price: string;
      supply_price: string;
      selling_price: string;
      promo_price: string;
      promo_start_date: string;
      promo_end_date: string;
      price_includes_tax: boolean;
      tax_group: string;
      allow_price_override_regardless_of_permissions: boolean;
      disable_from_price_rules: boolean;
      change_cost_price_during_sale: boolean;
      // Inventory
      quantity: string;
      quantity_unit_quantity: string;
      reorder_level: string;
      replenish_level: string;
      default_quantity_when_selling_or_receiving: string;
      only_allow_items_to_be_sold_in_whole_numbers: boolean;
      days_to_expiration: string;
      item_has_serial_number: boolean;
      // Dimensions
      weight: string;
      weight_unit: string;
      length: string;
      width: string;
      height: string;
      // Variations
      sold_in_a_series: boolean;
      series_quantity: string;
      number_of_days_series_must_be_used_within: string;
      allow_alt_description: boolean;
      // Commission
      commission: string;
      commission_percent_based_on_profit: boolean;
}

const EMPTY: ProductForm = {
      item_name: '',
      item_number: '',
      product_id: '',
      barcode_display_name: '',
      category: '',
      supplier_id: '',
      variation: '',
      description: '',
      long_description: '',
      information_popup_when_adding_to_sale: '',
      manufacturer: '',
      location_at_store: '',
      tags: '',
      is_service: false,
      is_favorite: false,
      is_barcoded: false,
      inactive: false,
      cost_price: '',
      supply_price: '',
      selling_price: '',
      promo_price: '',
      promo_start_date: '',
      promo_end_date: '',
      price_includes_tax: false,
      tax_group: '',
      allow_price_override_regardless_of_permissions: false,
      disable_from_price_rules: false,
      change_cost_price_during_sale: false,
      quantity: '0',
      quantity_unit_quantity: '1',
      reorder_level: '',
      replenish_level: '',
      default_quantity_when_selling_or_receiving: '1',
      only_allow_items_to_be_sold_in_whole_numbers: false,
      days_to_expiration: '',
      item_has_serial_number: false,
      weight: '',
      weight_unit: 'kg',
      length: '',
      width: '',
      height: '',
      sold_in_a_series: false,
      series_quantity: '',
      number_of_days_series_must_be_used_within: '',
      allow_alt_description: false,
      commission: '',
      commission_percent_based_on_profit: false,
};

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
      { id: 'details', label: 'Details', icon: Package },
      { id: 'pricing', label: 'Pricing', icon: DollarSign },
      { id: 'inventory', label: 'Inventory', icon: Archive },
      { id: 'dimensions', label: 'Dimensions', icon: Ruler },
      { id: 'variations', label: 'Variations', icon: Layers },
      { id: 'commission', label: 'Commission', icon: Percent },
];

// ── Shared field components ───────────────────────────────────────────────────
function Field({
      label,
      required,
      error,
      children,
      hint,
      col,
}: {
      label: string;
      required?: boolean;
      error?: string;
      children: React.ReactNode;
      hint?: string;
      col?: boolean;
}) {
      return (
            <div className={cn('flex flex-col gap-1.5', col && 'col-span-1')}>
                  <label className="flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-ink-muted">
                        {label}
                        {required && (
                              <span className="text-accent-gold">*</span>
                        )}
                  </label>
                  {children}
                  {hint && !error && (
                        <p className="text-[11px] text-ink-faint font-body">
                              {hint}
                        </p>
                  )}
                  {error && (
                        <p className="flex items-center gap-1 text-[11px] text-accent-red">
                              <AlertCircle size={10} />
                              {error}
                        </p>
                  )}
            </div>
      );
}

function Input({
      value,
      onChange,
      placeholder,
      type = 'text',
      prefix,
      suffix,
      disabled,
}: {
      value: string;
      onChange: (v: string) => void;
      placeholder?: string;
      type?: string;
      prefix?: string;
      suffix?: string;
      disabled?: boolean;
}) {
      return (
            <div className="relative flex items-center">
                  {prefix && (
                        <span className="absolute left-3 text-xs font-mono text-ink-muted z-10 pointer-events-none">
                              {prefix}
                        </span>
                  )}
                  <input
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={cn(
                              'w-full bg-bg-hover border border-bg-border rounded-xl py-2.5 text-sm font-body text-ink-primary',
                              'placeholder:text-ink-faint outline-none transition-all',
                              'focus:border-accent-gold/50 focus:bg-bg-card disabled:opacity-50 disabled:cursor-not-allowed',
                              prefix
                                    ? 'pl-8 pr-3'
                                    : suffix
                                      ? 'pl-3 pr-10'
                                      : 'px-3'
                        )}
                  />
                  {suffix && (
                        <span className="absolute right-3 text-xs font-mono text-ink-muted pointer-events-none">
                              {suffix}
                        </span>
                  )}
            </div>
      );
}

function Textarea({
      value,
      onChange,
      placeholder,
      rows = 3,
}: {
      value: string;
      onChange: (v: string) => void;
      placeholder?: string;
      rows?: number;
}) {
      return (
            <textarea
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  rows={rows}
                  className="w-full bg-bg-hover border border-bg-border rounded-xl px-3 py-2.5 text-sm font-body text-ink-primary placeholder:text-ink-faint outline-none focus:border-accent-gold/50 focus:bg-bg-card transition-all resize-none"
            />
      );
}

function Toggle({
      checked,
      onChange,
      label,
      description,
}: {
      checked: boolean;
      onChange: (v: boolean) => void;
      label: string;
      description?: string;
}) {
      return (
            <button
                  type="button"
                  onClick={() => onChange(!checked)}
                  className="flex items-center justify-between w-full p-3 rounded-xl border border-bg-border bg-bg-hover hover:border-accent-gold/20 transition-all"
            >
                  <div className="text-left">
                        <p className="text-sm font-body text-ink-primary">
                              {label}
                        </p>
                        {description && (
                              <p className="text-xs text-ink-muted font-body mt-0.5">
                                    {description}
                              </p>
                        )}
                  </div>
                  <div
                        className={cn(
                              'relative w-10 h-[22px] rounded-full transition-all duration-200 flex-shrink-0 ml-4',
                              checked
                                    ? 'bg-accent-gold'
                                    : 'bg-bg-muted border border-bg-border'
                        )}
                  >
                        <div
                              className={cn(
                                    'absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200',
                                    checked ? 'left-[22px]' : 'left-[3px]'
                              )}
                        />
                  </div>
            </button>
      );
}

function Divider({ label }: { label: string }) {
      return (
            <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-bg-border" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-ink-faint">
                        {label}
                  </span>
                  <div className="flex-1 h-px bg-bg-border" />
            </div>
      );
}

// ── Margin calculator pill ────────────────────────────────────────────────────
function MarginPill({ cost, sell }: { cost: string; sell: string }) {
      const c = parseFloat(cost) || 0;
      const s = parseFloat(sell) || 0;
      if (!c || !s) return null;
      const margin = (((s - c) / s) * 100).toFixed(1);
      const markup = (((s - c) / c) * 100).toFixed(1);
      const profit = s - c;
      const isGood = parseFloat(margin) >= 20;
      return (
            <div
                  className={cn(
                        'flex items-center gap-4 p-3 rounded-xl border text-xs font-mono',
                        isGood
                              ? 'bg-accent-teal/5 border-accent-teal/20'
                              : 'bg-accent-red/5 border-accent-red/20'
                  )}
            >
                  <div className="flex items-center gap-1.5">
                        <span className="text-ink-muted">Margin:</span>
                        <span
                              className={
                                    isGood
                                          ? 'text-accent-teal'
                                          : 'text-accent-red'
                              }
                        >
                              {margin}%
                        </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                        <span className="text-ink-muted">Markup:</span>
                        <span className="text-ink-secondary">+{markup}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                        <span className="text-ink-muted">Profit/unit:</span>
                        <span className="text-accent-gold">
                              ₦{profit.toLocaleString()}
                        </span>
                  </div>
            </div>
      );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProductFormPage() {
      const navigate = useNavigate();
      const { id } = useParams<{ id?: string }>();
      const isEdit = Boolean(id);

      const [form, setForm] = useState<ProductForm>(EMPTY);
      const [suppliers, setSuppliers] = useState<Supplier[]>([]);
      const [activeTab, setActiveTab] = useState('details');
      const [saving, setSaving] = useState(false);
      const [loading, setLoading] = useState(isEdit);
      const [saved, setSaved] = useState(false);
      const [errors, setErrors] = useState<
            Partial<Record<keyof ProductForm, string>>
      >({});
      const [globalError, setGlobalError] = useState<string | null>(null);

      const set = (key: keyof ProductForm) => (value: string | boolean) =>
            setForm((prev) => ({ ...prev, [key]: value }));

      // ── Load suppliers ────────────────────────────────────────────────────────
      useEffect(() => {
            supabase
                  .from('suppliers')
                  .select('pos_supplier_id, company_name')
                  .order('company_name')
                  .then(({ data }) => setSuppliers(data ?? []));
      }, []);

      // ── Load product ──────────────────────────────────────────────────────────
      useEffect(() => {
            if (!isEdit || !id) return;
            supabase
                  .from('items')
                  .select('*')
                  .eq('pos_item_id', id)
                  .single()
                  .then(({ data, error }) => {
                        if (error || !data) {
                              setGlobalError('Product not found');
                              return;
                        }
                        const d = data;
                        setForm({
                              item_name: d.item_name ?? '',
                              item_number: d.item_number ?? '',
                              product_id: d.product_id ?? '',
                              barcode_display_name:
                                    d.barcode_display_name ?? '',
                              category: d.category ?? '',
                              supplier_id: String(d.supplier_id ?? ''),
                              variation: d.variation ?? '',
                              description: d.description ?? '',
                              long_description: d.long_description ?? '',
                              information_popup_when_adding_to_sale:
                                    d.information_popup_when_adding_to_sale ??
                                    '',
                              manufacturer: d.manufacturer ?? '',
                              location_at_store: d.location_at_store ?? '',
                              tags: d.tags ?? '',
                              is_service: d.is_service ?? false,
                              is_favorite: d.is_favorite ?? false,
                              is_barcoded: d.is_barcoded ?? false,
                              inactive: d.inactive ?? false,
                              cost_price: String(d.cost_price ?? ''),
                              supply_price: String(d.supply_price ?? ''),
                              selling_price: String(d.selling_price ?? ''),
                              promo_price: String(d.promo_price ?? ''),
                              promo_start_date: d.promo_start_date ?? '',
                              promo_end_date: d.promo_end_date ?? '',
                              price_includes_tax: d.price_includes_tax ?? false,
                              tax_group: d.tax_group ?? '',
                              allow_price_override_regardless_of_permissions:
                                    d.allow_price_override_regardless_of_permissions ??
                                    false,
                              disable_from_price_rules:
                                    d.disable_from_price_rules ?? false,
                              change_cost_price_during_sale:
                                    d.change_cost_price_during_sale ?? false,
                              quantity: String(d.quantity ?? 0),
                              quantity_unit_quantity: String(
                                    d.quantity_unit_quantity ?? 1
                              ),
                              reorder_level: String(d.reorder_level ?? ''),
                              replenish_level: String(d.replenish_level ?? ''),
                              default_quantity_when_selling_or_receiving:
                                    String(
                                          d.default_quantity_when_selling_or_receiving ??
                                                1
                                    ),
                              only_allow_items_to_be_sold_in_whole_numbers:
                                    d.only_allow_items_to_be_sold_in_whole_numbers ??
                                    false,
                              days_to_expiration: String(
                                    d.days_to_expiration ?? ''
                              ),
                              item_has_serial_number:
                                    d.item_has_serial_number ?? false,
                              weight: String(d.weight ?? ''),
                              weight_unit: d.weight_unit ?? 'kg',
                              length: String(d.length ?? ''),
                              width: String(d.width ?? ''),
                              height: String(d.height ?? ''),
                              sold_in_a_series: d.sold_in_a_series ?? false,
                              series_quantity: String(d.series_quantity ?? ''),
                              number_of_days_series_must_be_used_within: String(
                                    d.number_of_days_series_must_be_used_within ??
                                          ''
                              ),
                              allow_alt_description:
                                    d.allow_alt_description ?? false,
                              commission: String(d.commission ?? ''),
                              commission_percent_based_on_profit:
                                    d.commission_percent_based_on_profit ??
                                    false,
                        });
                        setLoading(false);
                  });
      }, [id, isEdit]);

      // ── Validate ──────────────────────────────────────────────────────────────
      const validate = () => {
            const errs: typeof errors = {};
            if (!form.item_name.trim())
                  errs.item_name = 'Product name is required';
            if (!form.selling_price || parseFloat(form.selling_price) < 0)
                  errs.selling_price = 'Valid selling price required';
            setErrors(errs);
            if (Object.keys(errs).length > 0) {
                  if (errs.item_name || errs.category) setActiveTab('details');
                  else if (errs.selling_price) setActiveTab('pricing');
            }
            return Object.keys(errs).length === 0;
      };

      // ── Save ──────────────────────────────────────────────────────────────────
      const handleSave = async () => {
            if (!validate()) return;
            setSaving(true);
            setGlobalError(null);

            const n = (v: string) => (v.trim() === '' ? null : parseFloat(v));
            const ni = (v: string) => (v.trim() === '' ? null : parseInt(v));

            const payload = {
                  item_name: form.item_name.trim(),
                  item_number: form.item_number.trim() || null,
                  product_id: form.product_id.trim() || null,
                  barcode_display_name:
                        form.barcode_display_name.trim() || null,
                  category: form.category.trim() || null,
                  supplier_id: form.supplier_id
                        ? parseInt(form.supplier_id)
                        : null,
                  variation: form.variation.trim() || null,
                  description: form.description.trim() || null,
                  long_description: form.long_description.trim() || null,
                  information_popup_when_adding_to_sale:
                        form.information_popup_when_adding_to_sale.trim() ||
                        null,
                  manufacturer: form.manufacturer.trim() || null,
                  location_at_store: form.location_at_store.trim() || null,
                  tags: form.tags.trim() || null,
                  is_service: form.is_service,
                  is_favorite: form.is_favorite,
                  is_barcoded: form.is_barcoded,
                  inactive: form.inactive,
                  cost_price: n(form.cost_price),
                  supply_price: n(form.supply_price),
                  selling_price: n(form.selling_price),
                  promo_price: n(form.promo_price),
                  promo_start_date: form.promo_start_date || null,
                  promo_end_date: form.promo_end_date || null,
                  price_includes_tax: form.price_includes_tax,
                  tax_group: form.tax_group || null,
                  allow_price_override_regardless_of_permissions:
                        form.allow_price_override_regardless_of_permissions,
                  disable_from_price_rules: form.disable_from_price_rules,
                  change_cost_price_during_sale:
                        form.change_cost_price_during_sale,
                  quantity: n(form.quantity) ?? 0,
                  quantity_unit_quantity: n(form.quantity_unit_quantity) ?? 1,
                  reorder_level: n(form.reorder_level),
                  replenish_level: n(form.replenish_level),
                  default_quantity_when_selling_or_receiving:
                        n(form.default_quantity_when_selling_or_receiving) ?? 1,
                  only_allow_items_to_be_sold_in_whole_numbers:
                        form.only_allow_items_to_be_sold_in_whole_numbers,
                  days_to_expiration: ni(form.days_to_expiration),
                  item_has_serial_number: form.item_has_serial_number,
                  weight: n(form.weight),
                  weight_unit: form.weight_unit || null,
                  length: n(form.length),
                  width: n(form.width),
                  height: n(form.height),
                  sold_in_a_series: form.sold_in_a_series,
                  series_quantity: ni(form.series_quantity),
                  number_of_days_series_must_be_used_within: ni(
                        form.number_of_days_series_must_be_used_within
                  ),
                  allow_alt_description: form.allow_alt_description,
                  commission: n(form.commission),
                  commission_percent_based_on_profit:
                        form.commission_percent_based_on_profit,
            };

            const { error } = isEdit
                  ? await supabase
                          .from('items')
                          .update(payload)
                          .eq('pos_item_id', id)
                  : await supabase.from('items').insert(payload);

            if (error) {
                  setGlobalError(error.message);
            } else {
                  setSaved(true);
                  setTimeout(() => navigate('/products'), 1200);
            }
            setSaving(false);
      };

      if (loading) {
            return (
                  <div className="flex-1 flex flex-col min-h-screen">
                        <TopBar
                              title={isEdit ? 'Edit Product' : 'New Product'}
                        />
                        <div className="flex-1 flex items-center justify-center gap-3">
                              <Loader2
                                    size={20}
                                    className="animate-spin text-accent-gold"
                              />
                              <span className="text-ink-muted font-body text-sm">
                                    Loading product…
                              </span>
                        </div>
                  </div>
            );
      }

      const hasError = Object.keys(errors).length > 0;

      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar
                        title={
                              isEdit
                                    ? `Edit: ${form.item_name || 'Product'}`
                                    : 'New Product'
                        }
                        subtitle={
                              isEdit
                                    ? `Item #${id}`
                                    : 'Create a new inventory item'
                        }
                  />

                  <main className="flex-1 overflow-y-auto">
                        <div className="max-w-3xl mx-auto px-6 py-8">
                              {/* Global error */}
                              {globalError && (
                                    <div className="flex items-center gap-3 bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3 mb-6">
                                          <AlertCircle
                                                size={16}
                                                className="text-accent-red shrink-0"
                                          />
                                          <p className="text-sm font-body text-accent-red">
                                                {globalError}
                                          </p>
                                    </div>
                              )}

                              {/* Status badges */}
                              <div className="flex items-center gap-3 mb-6 flex-wrap">
                                    <div className="flex items-center gap-2">
                                          {form.is_favorite && (
                                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/20 text-[10px] font-mono text-accent-gold">
                                                      <Star size={9} />
                                                      Favourite
                                                </span>
                                          )}
                                          {form.inactive && (
                                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-red/10 border border-accent-red/20 text-[10px] font-mono text-accent-red">
                                                      Inactive
                                                </span>
                                          )}
                                          {form.is_service && (
                                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-teal/10 border border-accent-teal/20 text-[10px] font-mono text-accent-teal">
                                                      Service
                                                </span>
                                          )}
                                          {form.promo_price &&
                                                parseFloat(form.promo_price) >
                                                      0 && (
                                                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-[10px] font-mono text-accent-purple">
                                                            On Promo
                                                      </span>
                                                )}
                                    </div>
                              </div>

                              {/* Tabs */}
                              <Tabs.Root
                                    value={activeTab}
                                    onValueChange={setActiveTab}
                              >
                                    <Tabs.List className="flex gap-1 bg-bg-panel border border-bg-border rounded-xl p-1 mb-8 flex-wrap">
                                          {TABS.map((tab) => {
                                                const hasTabError =
                                                      (tab.id === 'details' &&
                                                            (errors.item_name ||
                                                                  errors.category)) ||
                                                      (tab.id === 'pricing' &&
                                                            errors.selling_price);
                                                return (
                                                      <Tabs.Trigger
                                                            key={tab.id}
                                                            value={tab.id}
                                                            className={cn(
                                                                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-body transition-all relative',
                                                                  'data-[state=active]:bg-accent-gold/15 data-[state=active]:text-accent-gold data-[state=active]:border data-[state=active]:border-accent-gold/30',
                                                                  'text-ink-secondary hover:text-ink-primary'
                                                            )}
                                                      >
                                                            <tab.icon
                                                                  size={12}
                                                            />
                                                            {tab.label}
                                                            {hasTabError && (
                                                                  <span className="w-1.5 h-1.5 rounded-full bg-accent-red absolute top-1 right-1" />
                                                            )}
                                                      </Tabs.Trigger>
                                                );
                                          })}
                                    </Tabs.List>

                                    {/* ── DETAILS TAB ── */}
                                    <Tabs.Content
                                          value="details"
                                          className="space-y-5"
                                    >
                                          <Field
                                                label="Product Name"
                                                required
                                                error={errors.item_name}
                                          >
                                                <Input
                                                      value={form.item_name}
                                                      onChange={set(
                                                            'item_name'
                                                      )}
                                                      placeholder="e.g. SWISS LUXURY LACE C"
                                                />
                                          </Field>

                                          <div className="grid grid-cols-3 gap-4">
                                                <Field
                                                      label="Item Number"
                                                      hint="Internal SKU"
                                                >
                                                      <Input
                                                            value={
                                                                  form.item_number
                                                            }
                                                            onChange={set(
                                                                  'item_number'
                                                            )}
                                                            placeholder="SKU-001"
                                                      />
                                                </Field>
                                                <Field label="Product ID">
                                                      <Input
                                                            value={
                                                                  form.product_id
                                                            }
                                                            onChange={set(
                                                                  'product_id'
                                                            )}
                                                            placeholder="P-001"
                                                      />
                                                </Field>
                                                <Field label="Barcode Display Name">
                                                      <Input
                                                            value={
                                                                  form.barcode_display_name
                                                            }
                                                            onChange={set(
                                                                  'barcode_display_name'
                                                            )}
                                                            placeholder="Name on barcode"
                                                      />
                                                </Field>
                                          </div>

                                          <div className="grid grid-cols-2 gap-4">
                                                <Field label="Category">
                                                      <select
                                                            value={
                                                                  form.category
                                                            }
                                                            onChange={(e) =>
                                                                  set(
                                                                        'category'
                                                                  )(
                                                                        e.target
                                                                              .value
                                                                  )
                                                            }
                                                            className="w-full bg-bg-hover border border-bg-border rounded-xl px-3 py-2.5 text-sm font-body text-ink-primary outline-none focus:border-accent-gold/50 transition-all"
                                                      >
                                                            <option value="">
                                                                  Select
                                                                  category…
                                                            </option>
                                                            {[
                                                                  'ATAMPA',
                                                                  'LACE',
                                                                  'SHADDA',
                                                                  'LAFAYYA',
                                                                  'VOILE',
                                                                  'MATERIAL',
                                                                  'YARD',
                                                                  'BATIK',
                                                                  'HOLLANDAD',
                                                                  'OTHER',
                                                            ].map((c) => (
                                                                  <option
                                                                        key={c}
                                                                        value={
                                                                              c
                                                                        }
                                                                  >
                                                                        {c}
                                                                  </option>
                                                            ))}
                                                      </select>
                                                </Field>
                                                <Field label="Supplier">
                                                      <select
                                                            value={
                                                                  form.supplier_id
                                                            }
                                                            onChange={(e) =>
                                                                  set(
                                                                        'supplier_id'
                                                                  )(
                                                                        e.target
                                                                              .value
                                                                  )
                                                            }
                                                            className="w-full bg-bg-hover border border-bg-border rounded-xl px-3 py-2.5 text-sm font-body text-ink-primary outline-none focus:border-accent-gold/50 transition-all"
                                                      >
                                                            <option value="">
                                                                  No supplier
                                                            </option>
                                                            {suppliers.map(
                                                                  (s) => (
                                                                        <option
                                                                              key={
                                                                                    s.pos_supplier_id
                                                                              }
                                                                              value={String(
                                                                                    s.pos_supplier_id
                                                                              )}
                                                                        >
                                                                              {
                                                                                    s.company_name
                                                                              }
                                                                        </option>
                                                                  )
                                                            )}
                                                      </select>
                                                </Field>
                                          </div>

                                          <div className="grid grid-cols-2 gap-4">
                                                <Field
                                                      label="Variation"
                                                      hint="e.g. Size, Colour, Pattern"
                                                >
                                                      <Input
                                                            value={
                                                                  form.variation
                                                            }
                                                            onChange={set(
                                                                  'variation'
                                                            )}
                                                            placeholder="e.g. 6 yards / Blue"
                                                      />
                                                </Field>
                                                <Field label="Manufacturer">
                                                      <Input
                                                            value={
                                                                  form.manufacturer
                                                            }
                                                            onChange={set(
                                                                  'manufacturer'
                                                            )}
                                                            placeholder="Brand / manufacturer"
                                                      />
                                                </Field>
                                          </div>

                                          <div className="grid grid-cols-2 gap-4">
                                                <Field
                                                      label="Store Location"
                                                      hint="Where to find it in the shop"
                                                >
                                                      <Input
                                                            value={
                                                                  form.location_at_store
                                                            }
                                                            onChange={set(
                                                                  'location_at_store'
                                                            )}
                                                            placeholder="e.g. Shelf B3"
                                                      />
                                                </Field>
                                                <Field
                                                      label="Tags"
                                                      hint="Comma-separated"
                                                >
                                                      <Input
                                                            value={form.tags}
                                                            onChange={set(
                                                                  'tags'
                                                            )}
                                                            placeholder="e.g. new, trending, sale"
                                                      />
                                                </Field>
                                          </div>

                                          <Field label="Short Description">
                                                <Textarea
                                                      value={form.description}
                                                      onChange={set(
                                                            'description'
                                                      )}
                                                      placeholder="Brief description shown on receipts and invoices…"
                                                      rows={2}
                                                />
                                          </Field>
                                          <Field label="Long Description">
                                                <Textarea
                                                      value={
                                                            form.long_description
                                                      }
                                                      onChange={set(
                                                            'long_description'
                                                      )}
                                                      placeholder="Full product details, specifications, care instructions…"
                                                      rows={4}
                                                />
                                          </Field>
                                          <Field
                                                label="POS Alert"
                                                hint="Shown when product is added to a sale"
                                          >
                                                <Input
                                                      value={
                                                            form.information_popup_when_adding_to_sale
                                                      }
                                                      onChange={set(
                                                            'information_popup_when_adding_to_sale'
                                                      )}
                                                      placeholder="e.g. Check stock before confirming"
                                                />
                                          </Field>

                                          <Divider label="flags" />
                                          <div className="grid grid-cols-1 gap-2">
                                                <Toggle
                                                      checked={form.is_service}
                                                      onChange={set(
                                                            'is_service'
                                                      )}
                                                      label="This is a service"
                                                      description="No stock tracked for service items"
                                                />
                                                <Toggle
                                                      checked={form.is_favorite}
                                                      onChange={set(
                                                            'is_favorite'
                                                      )}
                                                      label="Mark as favourite"
                                                      description="Pinned for quick access on POS"
                                                />
                                                <Toggle
                                                      checked={form.is_barcoded}
                                                      onChange={set(
                                                            'is_barcoded'
                                                      )}
                                                      label="Has barcode"
                                                      description="Scannable barcode attached"
                                                />
                                                <Toggle
                                                      checked={form.inactive}
                                                      onChange={set('inactive')}
                                                      label="Mark as inactive"
                                                      description="Hidden from sales and inventory"
                                                />
                                          </div>
                                    </Tabs.Content>

                                    {/* ── PRICING TAB ── */}
                                    <Tabs.Content
                                          value="pricing"
                                          className="space-y-5"
                                    >
                                          <div className="grid grid-cols-3 gap-4">
                                                <Field
                                                      label="Cost Price (₦)"
                                                      hint="What you pay"
                                                >
                                                      <Input
                                                            value={
                                                                  form.cost_price
                                                            }
                                                            onChange={set(
                                                                  'cost_price'
                                                            )}
                                                            type="number"
                                                            prefix="₦"
                                                            placeholder="0"
                                                      />
                                                </Field>
                                                <Field
                                                      label="Supply Price (₦)"
                                                      hint="Supplier invoice price"
                                                >
                                                      <Input
                                                            value={
                                                                  form.supply_price
                                                            }
                                                            onChange={set(
                                                                  'supply_price'
                                                            )}
                                                            type="number"
                                                            prefix="₦"
                                                            placeholder="0"
                                                      />
                                                </Field>
                                                <Field
                                                      label="Selling Price (₦)"
                                                      required
                                                      error={
                                                            errors.selling_price
                                                      }
                                                      hint="Customer-facing price"
                                                >
                                                      <Input
                                                            value={
                                                                  form.selling_price
                                                            }
                                                            onChange={set(
                                                                  'selling_price'
                                                            )}
                                                            type="number"
                                                            prefix="₦"
                                                            placeholder="0"
                                                      />
                                                </Field>
                                          </div>

                                          {/* Margin calculator */}
                                          <MarginPill
                                                cost={form.cost_price}
                                                sell={form.selling_price}
                                          />

                                          <Divider label="promotional pricing" />
                                          <div className="grid grid-cols-3 gap-4">
                                                <Field label="Promo Price (₦)">
                                                      <Input
                                                            value={
                                                                  form.promo_price
                                                            }
                                                            onChange={set(
                                                                  'promo_price'
                                                            )}
                                                            type="number"
                                                            prefix="₦"
                                                            placeholder="0"
                                                      />
                                                </Field>
                                                <Field label="Promo Start Date">
                                                      <input
                                                            type="date"
                                                            value={
                                                                  form.promo_start_date
                                                            }
                                                            onChange={(e) =>
                                                                  set(
                                                                        'promo_start_date'
                                                                  )(
                                                                        e.target
                                                                              .value
                                                                  )
                                                            }
                                                            className="w-full bg-bg-hover border border-bg-border rounded-xl px-3 py-2.5 text-sm font-mono text-ink-primary outline-none focus:border-accent-gold/50 transition-all"
                                                      />
                                                </Field>
                                                <Field label="Promo End Date">
                                                      <input
                                                            type="date"
                                                            value={
                                                                  form.promo_end_date
                                                            }
                                                            onChange={(e) =>
                                                                  set(
                                                                        'promo_end_date'
                                                                  )(
                                                                        e.target
                                                                              .value
                                                                  )
                                                            }
                                                            className="w-full bg-bg-hover border border-bg-border rounded-xl px-3 py-2.5 text-sm font-mono text-ink-primary outline-none focus:border-accent-gold/50 transition-all"
                                                      />
                                                </Field>
                                          </div>

                                          <Divider label="tax" />
                                          <div className="grid grid-cols-2 gap-4">
                                                <Field label="Tax Group">
                                                      <Input
                                                            value={
                                                                  form.tax_group
                                                            }
                                                            onChange={set(
                                                                  'tax_group'
                                                            )}
                                                            placeholder="e.g. Standard 7.5%"
                                                      />
                                                </Field>
                                          </div>
                                          <Toggle
                                                checked={
                                                      form.price_includes_tax
                                                }
                                                onChange={set(
                                                      'price_includes_tax'
                                                )}
                                                label="Price includes tax"
                                                description="Selling price already includes tax amount"
                                          />

                                          <Divider label="price rules" />
                                          <div className="grid grid-cols-1 gap-2">
                                                <Toggle
                                                      checked={
                                                            form.allow_price_override_regardless_of_permissions
                                                      }
                                                      onChange={set(
                                                            'allow_price_override_regardless_of_permissions'
                                                      )}
                                                      label="Allow price override"
                                                      description="Staff can change price at point of sale regardless of permissions"
                                                />
                                                <Toggle
                                                      checked={
                                                            form.disable_from_price_rules
                                                      }
                                                      onChange={set(
                                                            'disable_from_price_rules'
                                                      )}
                                                      label="Disable from price rules"
                                                      description="Exclude from automatic discounts and price rules"
                                                />
                                                <Toggle
                                                      checked={
                                                            form.change_cost_price_during_sale
                                                      }
                                                      onChange={set(
                                                            'change_cost_price_during_sale'
                                                      )}
                                                      label="Allow cost price change at sale"
                                                      description="Staff can update cost price when processing a sale"
                                                />
                                          </div>
                                    </Tabs.Content>

                                    {/* ── INVENTORY TAB ── */}
                                    <Tabs.Content
                                          value="inventory"
                                          className="space-y-5"
                                    >
                                          <div className="grid grid-cols-3 gap-4">
                                                <Field
                                                      label="Current Stock (qty)"
                                                      hint="Units in hand"
                                                >
                                                      <Input
                                                            value={
                                                                  form.quantity
                                                            }
                                                            onChange={set(
                                                                  'quantity'
                                                            )}
                                                            type="number"
                                                            placeholder="0"
                                                      />
                                                </Field>
                                                <Field
                                                      label="Reorder Level"
                                                      hint="Trigger restocking below this"
                                                >
                                                      <Input
                                                            value={
                                                                  form.reorder_level
                                                            }
                                                            onChange={set(
                                                                  'reorder_level'
                                                            )}
                                                            type="number"
                                                            placeholder="e.g. 5"
                                                      />
                                                </Field>
                                                <Field
                                                      label="Replenish To"
                                                      hint="Target stock after reorder"
                                                >
                                                      <Input
                                                            value={
                                                                  form.replenish_level
                                                            }
                                                            onChange={set(
                                                                  'replenish_level'
                                                            )}
                                                            type="number"
                                                            placeholder="e.g. 20"
                                                      />
                                                </Field>
                                          </div>

                                          {/* Stock level indicator */}
                                          {form.quantity &&
                                                form.reorder_level && (
                                                      <div
                                                            className={cn(
                                                                  'flex items-center gap-3 p-3 rounded-xl border text-xs font-mono',
                                                                  parseFloat(
                                                                        form.quantity
                                                                  ) <=
                                                                        parseFloat(
                                                                              form.reorder_level
                                                                        )
                                                                        ? 'bg-accent-red/5 border-accent-red/20 text-accent-red'
                                                                        : 'bg-accent-teal/5 border-accent-teal/20 text-accent-teal'
                                                            )}
                                                      >
                                                            {parseFloat(
                                                                  form.quantity
                                                            ) <=
                                                            parseFloat(
                                                                  form.reorder_level
                                                            ) ? (
                                                                  <>
                                                                        <AlertTriangle
                                                                              size={
                                                                                    12
                                                                              }
                                                                        />
                                                                        Low
                                                                        stock —
                                                                        reorder
                                                                        needed
                                                                        (current:{' '}
                                                                        {
                                                                              form.quantity
                                                                        }
                                                                        , level:{' '}
                                                                        {
                                                                              form.reorder_level
                                                                        }
                                                                        )
                                                                  </>
                                                            ) : (
                                                                  <>
                                                                        <Check
                                                                              size={
                                                                                    12
                                                                              }
                                                                        />
                                                                        Stock OK
                                                                        (
                                                                        {
                                                                              form.quantity
                                                                        }{' '}
                                                                        units
                                                                        above
                                                                        reorder
                                                                        level of{' '}
                                                                        {
                                                                              form.reorder_level
                                                                        }
                                                                        )
                                                                  </>
                                                            )}
                                                      </div>
                                                )}

                                          <div className="grid grid-cols-2 gap-4">
                                                <Field
                                                      label="Unit Quantity"
                                                      hint="e.g. 6 yards per piece"
                                                >
                                                      <Input
                                                            value={
                                                                  form.quantity_unit_quantity
                                                            }
                                                            onChange={set(
                                                                  'quantity_unit_quantity'
                                                            )}
                                                            type="number"
                                                            placeholder="1"
                                                            suffix="units"
                                                      />
                                                </Field>
                                                <Field
                                                      label="Default Sale Qty"
                                                      hint="Pre-filled quantity at POS"
                                                >
                                                      <Input
                                                            value={
                                                                  form.default_quantity_when_selling_or_receiving
                                                            }
                                                            onChange={set(
                                                                  'default_quantity_when_selling_or_receiving'
                                                            )}
                                                            type="number"
                                                            placeholder="1"
                                                      />
                                                </Field>
                                          </div>

                                          <Divider label="expiry" />
                                          <Field
                                                label="Days to Expiration"
                                                hint="Leave blank if product does not expire"
                                          >
                                                <Input
                                                      value={
                                                            form.days_to_expiration
                                                      }
                                                      onChange={set(
                                                            'days_to_expiration'
                                                      )}
                                                      type="number"
                                                      placeholder="e.g. 365"
                                                      suffix="days"
                                                />
                                          </Field>

                                          <Divider label="restrictions" />
                                          <div className="grid grid-cols-1 gap-2">
                                                <Toggle
                                                      checked={
                                                            form.only_allow_items_to_be_sold_in_whole_numbers
                                                      }
                                                      onChange={set(
                                                            'only_allow_items_to_be_sold_in_whole_numbers'
                                                      )}
                                                      label="Sell in whole numbers only"
                                                      description="Prevent fractional quantities (e.g. 0.5 yards)"
                                                />
                                                <Toggle
                                                      checked={
                                                            form.item_has_serial_number
                                                      }
                                                      onChange={set(
                                                            'item_has_serial_number'
                                                      )}
                                                      label="Track serial numbers"
                                                      description="Require serial number entry when selling or receiving"
                                                />
                                          </div>
                                    </Tabs.Content>

                                    {/* ── DIMENSIONS TAB ── */}
                                    <Tabs.Content
                                          value="dimensions"
                                          className="space-y-5"
                                    >
                                          <p className="text-xs font-body text-ink-muted">
                                                Used for shipping calculations
                                                and display. Leave blank if not
                                                applicable.
                                          </p>

                                          <div className="grid grid-cols-2 gap-4">
                                                <Field label="Weight">
                                                      <Input
                                                            value={form.weight}
                                                            onChange={set(
                                                                  'weight'
                                                            )}
                                                            type="number"
                                                            placeholder="0.0"
                                                      />
                                                </Field>
                                                <Field label="Weight Unit">
                                                      <select
                                                            value={
                                                                  form.weight_unit
                                                            }
                                                            onChange={(e) =>
                                                                  set(
                                                                        'weight_unit'
                                                                  )(
                                                                        e.target
                                                                              .value
                                                                  )
                                                            }
                                                            className="w-full bg-bg-hover border border-bg-border rounded-xl px-3 py-2.5 text-sm font-body text-ink-primary outline-none focus:border-accent-gold/50 transition-all"
                                                      >
                                                            <option value="kg">
                                                                  kg
                                                            </option>
                                                            <option value="g">
                                                                  g
                                                            </option>
                                                            <option value="lb">
                                                                  lb
                                                            </option>
                                                            <option value="oz">
                                                                  oz
                                                            </option>
                                                      </select>
                                                </Field>
                                          </div>

                                          <Divider label="size (cm)" />
                                          <div className="grid grid-cols-3 gap-4">
                                                <Field label="Length (cm)">
                                                      <Input
                                                            value={form.length}
                                                            onChange={set(
                                                                  'length'
                                                            )}
                                                            type="number"
                                                            placeholder="0"
                                                            suffix="cm"
                                                      />
                                                </Field>
                                                <Field label="Width (cm)">
                                                      <Input
                                                            value={form.width}
                                                            onChange={set(
                                                                  'width'
                                                            )}
                                                            type="number"
                                                            placeholder="0"
                                                            suffix="cm"
                                                      />
                                                </Field>
                                                <Field label="Height (cm)">
                                                      <Input
                                                            value={form.height}
                                                            onChange={set(
                                                                  'height'
                                                            )}
                                                            type="number"
                                                            placeholder="0"
                                                            suffix="cm"
                                                      />
                                                </Field>
                                          </div>

                                          {/* Volume display */}
                                          {form.length &&
                                                form.width &&
                                                form.height && (
                                                      <div className="flex items-center gap-2 p-3 rounded-xl border border-bg-border bg-bg-hover text-xs font-mono text-ink-muted">
                                                            <Box size={12} />
                                                            Volume:{' '}
                                                            {(
                                                                  (parseFloat(
                                                                        form.length
                                                                  ) *
                                                                        parseFloat(
                                                                              form.width
                                                                        ) *
                                                                        parseFloat(
                                                                              form.height
                                                                        )) /
                                                                  1000000
                                                            ).toFixed(4)}{' '}
                                                            m³ &nbsp;·&nbsp;
                                                            {form.length} ×{' '}
                                                            {form.width} ×{' '}
                                                            {form.height} cm
                                                      </div>
                                                )}
                                    </Tabs.Content>

                                    {/* ── VARIATIONS TAB ── */}
                                    <Tabs.Content
                                          value="variations"
                                          className="space-y-5"
                                    >
                                          <Toggle
                                                checked={form.sold_in_a_series}
                                                onChange={set(
                                                      'sold_in_a_series'
                                                )}
                                                label="Sold as a series / bundle"
                                                description="Item is sold as a multi-session or bundled set"
                                          />

                                          {form.sold_in_a_series && (
                                                <div className="grid grid-cols-2 gap-4 pl-1 border-l-2 border-accent-gold/20 ml-1">
                                                      <Field
                                                            label="Series Quantity"
                                                            hint="Number of items / sessions in series"
                                                      >
                                                            <Input
                                                                  value={
                                                                        form.series_quantity
                                                                  }
                                                                  onChange={set(
                                                                        'series_quantity'
                                                                  )}
                                                                  type="number"
                                                                  placeholder="e.g. 5"
                                                            />
                                                      </Field>
                                                      <Field
                                                            label="Valid For (days)"
                                                            hint="Series must be used within N days"
                                                      >
                                                            <Input
                                                                  value={
                                                                        form.number_of_days_series_must_be_used_within
                                                                  }
                                                                  onChange={set(
                                                                        'number_of_days_series_must_be_used_within'
                                                                  )}
                                                                  type="number"
                                                                  placeholder="e.g. 90"
                                                                  suffix="days"
                                                            />
                                                      </Field>
                                                </div>
                                          )}

                                          <Divider label="description options" />
                                          <Toggle
                                                checked={
                                                      form.allow_alt_description
                                                }
                                                onChange={set(
                                                      'allow_alt_description'
                                                )}
                                                label="Allow alternate description at sale"
                                                description="Staff can override the product description during a transaction"
                                          />
                                    </Tabs.Content>

                                    {/* ── COMMISSION TAB ── */}
                                    <Tabs.Content
                                          value="commission"
                                          className="space-y-5"
                                    >
                                          <p className="text-xs font-body text-ink-muted">
                                                Configure per-product commission
                                                paid to staff when this item is
                                                sold.
                                          </p>

                                          <Field label="Commission Amount">
                                                <Input
                                                      value={form.commission}
                                                      onChange={set(
                                                            'commission'
                                                      )}
                                                      type="number"
                                                      placeholder="0"
                                                      prefix={
                                                            form.commission_percent_based_on_profit
                                                                  ? ''
                                                                  : '₦'
                                                      }
                                                      suffix={
                                                            form.commission_percent_based_on_profit
                                                                  ? '%'
                                                                  : ''
                                                      }
                                                />
                                          </Field>

                                          <Toggle
                                                checked={
                                                      form.commission_percent_based_on_profit
                                                }
                                                onChange={set(
                                                      'commission_percent_based_on_profit'
                                                )}
                                                label="Commission based on profit"
                                                description="Calculate commission as % of profit margin rather than fixed amount"
                                          />

                                          {/* Commission preview */}
                                          {form.commission &&
                                                form.selling_price && (
                                                      <div className="p-3 rounded-xl border border-bg-border bg-bg-hover text-xs font-mono text-ink-muted space-y-1">
                                                            <p className="text-ink-secondary font-body text-sm">
                                                                  Commission
                                                                  preview
                                                            </p>
                                                            {form.commission_percent_based_on_profit ? (
                                                                  <>
                                                                        <p>
                                                                              Selling:
                                                                              ₦
                                                                              {parseFloat(
                                                                                    form.selling_price
                                                                              ).toLocaleString()}
                                                                        </p>
                                                                        <p>
                                                                              Cost:
                                                                              ₦
                                                                              {parseFloat(
                                                                                    form.cost_price ||
                                                                                          '0'
                                                                              ).toLocaleString()}
                                                                        </p>
                                                                        <p>
                                                                              Profit:
                                                                              ₦
                                                                              {(
                                                                                    parseFloat(
                                                                                          form.selling_price
                                                                                    ) -
                                                                                    parseFloat(
                                                                                          form.cost_price ||
                                                                                                '0'
                                                                                    )
                                                                              ).toLocaleString()}
                                                                        </p>
                                                                        <p className="text-accent-gold">
                                                                              Commission
                                                                              (
                                                                              {
                                                                                    form.commission
                                                                              }
                                                                              %):
                                                                              ₦
                                                                              {(
                                                                                    ((parseFloat(
                                                                                          form.selling_price
                                                                                    ) -
                                                                                          parseFloat(
                                                                                                form.cost_price ||
                                                                                                      '0'
                                                                                          )) *
                                                                                          parseFloat(
                                                                                                form.commission
                                                                                          )) /
                                                                                    100
                                                                              ).toLocaleString()}
                                                                        </p>
                                                                  </>
                                                            ) : (
                                                                  <p className="text-accent-gold">
                                                                        Fixed
                                                                        commission
                                                                        per
                                                                        sale: ₦
                                                                        {parseFloat(
                                                                              form.commission
                                                                        ).toLocaleString()}
                                                                  </p>
                                                            )}
                                                      </div>
                                                )}
                                    </Tabs.Content>
                              </Tabs.Root>

                              {/* ── Save bar ── */}
                              <div className="sticky bottom-0 -mx-6 px-6 py-4 mt-8 bg-bg-base/90 backdrop-blur-md border-t border-bg-border flex items-center justify-between gap-4">
                                    <button
                                          onClick={() => navigate(-1)}
                                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-bg-border text-ink-secondary hover:text-ink-primary hover:border-bg-muted text-sm font-body transition-all"
                                    >
                                          <ChevronLeft size={15} />
                                          Cancel
                                    </button>

                                    <div className="flex items-center gap-3">
                                          {hasError && (
                                                <p className="text-xs text-accent-red font-body flex items-center gap-1">
                                                      <AlertCircle size={11} />
                                                      Fix errors before saving
                                                </p>
                                          )}
                                          {saved && (
                                                <div className="flex items-center gap-1.5 text-accent-teal text-sm font-body animate-fade-in">
                                                      <Check size={14} />
                                                      Saved!
                                                </div>
                                          )}
                                          {isEdit && (
                                                <button
                                                      onClick={() =>
                                                            navigate(
                                                                  '/products'
                                                            )
                                                      }
                                                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-bg-border text-ink-secondary hover:text-accent-red hover:border-accent-red/30 text-sm font-body transition-all"
                                                >
                                                      <Trash2 size={14} />
                                                      Delete
                                                </button>
                                          )}
                                          <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent-gold/15 border border-accent-gold/30 text-accent-gold text-sm font-mono font-medium hover:bg-accent-gold/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                                {saving ? (
                                                      <>
                                                            <Loader2
                                                                  size={15}
                                                                  className="animate-spin"
                                                            />
                                                            Saving…
                                                      </>
                                                ) : (
                                                      <>
                                                            <Save size={15} />
                                                            {isEdit
                                                                  ? 'Update Product'
                                                                  : 'Create Product'}
                                                      </>
                                                )}
                                          </button>
                                    </div>
                              </div>
                        </div>
                  </main>
            </div>
      );
}
