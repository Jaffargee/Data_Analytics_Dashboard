import { useMemo, useState } from 'react';
import { Minus, Plus, Trash2, User, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCustomers, usePaymentAccounts } from '@/hooks/data';
import type { Customer } from '@/hooks/data';
import { fmtCurrency } from '@/lib/utils';
import type { UseCartResult } from '../useCart';
import type { CheckoutCustomer, PaymentLine } from '../types';
import { submitSale, CheckoutError, type SaleResponse } from '../api';

const SELECT_CLASS =
      'w-full rounded-md border border-bg-border bg-bg-hover px-2.5 py-1.5 text-xs font-body text-ink-primary focus:outline-none focus:ring-1 focus:ring-accent-gold';

function newPaymentId() {
      return `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface CartPanelProps {
      cart: UseCartResult;
}

export function CartPanel({ cart }: CartPanelProps) {
      const customers = useCustomers();
      const accounts = usePaymentAccounts();

      const [customerQuery, setCustomerQuery] = useState('');
      const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
      const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
      const [salesperson, setSalesperson] = useState('');
      const [payments, setPayments] = useState<PaymentLine[]>([]);
      const [submitting, setSubmitting] = useState(false);
      const [result, setResult] = useState<SaleResponse | null>(null);
      const [error, setError] = useState<string | null>(null);

      const accountRows = accounts.data?.data ?? [];
      const amountTendered = useMemo(() => payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0), [payments]);
      const changeDue = amountTendered - cart.total;

      const customerMatches = useMemo(() => {
            const q = customerQuery.trim().toLowerCase();
            if (!q) return [];
            return (customers.data?.data ?? [])
                  .filter((c) => `${c.first_name} ${c.last_name ?? ''}`.toLowerCase().includes(q))
                  .slice(0, 8);
      }, [customers.data, customerQuery]);

      const addPaymentLine = () => {
            const remaining = Math.max(0, cart.total - amountTendered);
            setPayments((prev) => [
                  ...prev,
                  { id: newPaymentId(), account: accountRows[0]?.name ?? 'Cash', amount: remaining || cart.total },
            ]);
      };

      const updatePayment = (id: string, patch: Partial<PaymentLine>) => {
            setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      };

      const removePayment = (id: string) => {
            setPayments((prev) => prev.filter((p) => p.id !== id));
      };

      const canCheckout =
            cart.lines.length > 0 && payments.length > 0 && amountTendered >= cart.total && !submitting;

      const handleCheckout = async () => {
            setSubmitting(true);
            setError(null);
            const customer: CheckoutCustomer = selectedCustomer
                  ? {
                          pos_customer_id: selectedCustomer.pos_customer_id,
                          customer_name: `${selectedCustomer.first_name} ${selectedCustomer.last_name ?? ''}`.trim(),
                          customer_phone: selectedCustomer.company_phone,
                          is_anonymous: false,
                    }
                  : { pos_customer_id: null, customer_name: 'Walk-in Customer', customer_phone: null, is_anonymous: true };

            try {
                  const response = await submitSale(customer, salesperson || null, cart.lines, payments, null);
                  setResult(response);
            } catch (err) {
                  setError(err instanceof CheckoutError ? err.message : 'Something went wrong completing this sale.');
            } finally {
                  setSubmitting(false);
            }
      };

      const startNewSale = () => {
            cart.clear();
            setPayments([]);
            setSelectedCustomer(null);
            setSalesperson('');
            setResult(null);
            setError(null);
      };

      if (result) {
            return (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-4">
                        <div
                              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                                    result.is_stub ? 'bg-accent-gold/15 text-accent-gold' : 'bg-accent-teal/15 text-accent-teal'
                              }`}
                        >
                              <CheckCircle2 size={28} />
                        </div>
                        <div>
                              <p className="text-base font-body text-ink-primary font-medium">
                                    {result.is_stub ? 'Sale validated (stub mode)' : 'Sale completed'}
                              </p>
                              <p className="text-xs text-ink-muted font-mono mt-1">#{result.pos_sale_id}</p>
                        </div>
                        <div className="w-full max-w-xs space-y-1.5 text-sm font-mono">
                              <div className="flex justify-between"><span className="text-ink-muted">Total</span><span className="text-ink-primary">{fmtCurrency(result.invoice_total)}</span></div>
                              <div className="flex justify-between"><span className="text-ink-muted">Tendered</span><span className="text-ink-primary">{fmtCurrency(result.amount_tendered)}</span></div>
                              <div className="flex justify-between"><span className="text-ink-muted">Change</span><span className="text-accent-gold">{fmtCurrency(result.change_due)}</span></div>
                        </div>
                        {result.is_stub && result.message && (
                              <p className="text-[11px] text-ink-faint max-w-xs">{result.message}</p>
                        )}
                        <button
                              type="button"
                              onClick={startNewSale}
                              className="rounded-lg bg-accent-gold/15 border border-accent-gold/30 text-accent-gold text-sm font-body px-5 py-2.5 mt-2"
                        >
                              Start New Sale
                        </button>
                  </div>
            );
      }

      return (
            <div className="flex flex-col h-full min-h-0">
                  {/* Customer */}
                  <div className="p-3 sm:p-4 border-b border-bg-border shrink-0 relative">
                        <label className="block text-[10px] uppercase tracking-wide text-ink-faint mb-1.5">Customer</label>
                        {selectedCustomer ? (
                              <div className="flex items-center justify-between rounded-md border border-bg-border bg-bg-hover px-3 py-2">
                                    <span className="text-xs font-body text-ink-primary truncate">
                                          {selectedCustomer.first_name} {selectedCustomer.last_name}
                                    </span>
                                    <button type="button" onClick={() => setSelectedCustomer(null)} aria-label="Remove customer">
                                          <X size={14} className="text-ink-faint hover:text-accent-red" />
                                    </button>
                              </div>
                        ) : (
                              <div className="relative">
                                    <User size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                                    <input
                                          value={customerQuery}
                                          onChange={(e) => {
                                                setCustomerQuery(e.target.value);
                                                setCustomerPickerOpen(true);
                                          }}
                                          onFocus={() => setCustomerPickerOpen(true)}
                                          placeholder="Search or leave blank for walk-in"
                                          className="w-full rounded-md border border-bg-border bg-bg-hover pl-8 pr-3 py-2 text-xs font-body text-ink-primary placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-accent-gold"
                                    />
                                    {customerPickerOpen && customerMatches.length > 0 && (
                                          <div className="absolute z-20 mt-1 w-full rounded-md border border-bg-border bg-bg-panel shadow-lg max-h-48 overflow-y-auto">
                                                {customerMatches.map((c) => (
                                                      <button
                                                            key={c.pos_customer_id}
                                                            type="button"
                                                            onClick={() => {
                                                                  setSelectedCustomer(c);
                                                                  setCustomerQuery('');
                                                                  setCustomerPickerOpen(false);
                                                            }}
                                                            className="w-full text-left px-3 py-2 text-xs font-body text-ink-primary hover:bg-bg-hover"
                                                      >
                                                            {c.first_name} {c.last_name}
                                                      </button>
                                                ))}
                                          </div>
                                    )}
                              </div>
                        )}
                  </div>

                  {/* Cart lines */}
                  <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
                        {cart.lines.length === 0 ? (
                              <p className="text-xs text-ink-faint text-center py-8">Cart is empty — tap a product to add it.</p>
                        ) : (
                              cart.lines.map((line) => (
                                    <div key={line.pos_item_id} className="rounded-lg border border-bg-border bg-bg-card p-2.5">
                                          <div className="flex items-start justify-between gap-2">
                                                <p className="text-xs font-body text-ink-primary flex-1 min-w-0 truncate">{line.item_name}</p>
                                                <button type="button" onClick={() => cart.removeItem(line.pos_item_id)} aria-label="Remove">
                                                      <Trash2 size={13} className="text-ink-faint hover:text-accent-red shrink-0" />
                                                </button>
                                          </div>
                                          <div className="flex items-center justify-between mt-1.5">
                                                <div className="flex items-center gap-1.5">
                                                      <button
                                                            type="button"
                                                            onClick={() => cart.updateQuantity(line.pos_item_id, line.quantity - 1)}
                                                            className="w-6 h-6 rounded-md border border-bg-border text-ink-muted hover:text-accent-gold flex items-center justify-center"
                                                      >
                                                            <Minus size={11} />
                                                      </button>
                                                      <span className="w-7 text-center text-xs font-mono text-ink-primary">{line.quantity}</span>
                                                      <button
                                                            type="button"
                                                            onClick={() => cart.updateQuantity(line.pos_item_id, line.quantity + 1)}
                                                            className="w-6 h-6 rounded-md border border-bg-border text-ink-muted hover:text-accent-gold flex items-center justify-center"
                                                      >
                                                            <Plus size={11} />
                                                      </button>
                                                      <span className="text-[10px] text-ink-faint ml-1">× {fmtCurrency(line.unit_price)}</span>
                                                </div>
                                                <span className="text-xs font-mono text-accent-gold font-medium">{fmtCurrency(cart.lineTotal(line))}</span>
                                          </div>
                                          <div className="flex items-center gap-1.5 mt-1.5">
                                                <label className="text-[10px] text-ink-faint">Discount %</label>
                                                <input
                                                      type="number"
                                                      min={0}
                                                      max={100}
                                                      value={line.discount_pct}
                                                      onChange={(e) => cart.updateDiscount(line.pos_item_id, Number(e.target.value))}
                                                      className="w-14 rounded border border-bg-border bg-bg-hover px-1.5 py-0.5 text-[11px] font-mono text-ink-primary"
                                                />
                                          </div>
                                    </div>
                              ))
                        )}
                  </div>

                  {/* Totals + payment + checkout */}
                  <div className="border-t border-bg-border p-3 sm:p-4 space-y-3 shrink-0">
                        <div className="space-y-1 text-xs font-mono">
                              <div className="flex justify-between text-ink-muted"><span>Subtotal</span><span>{fmtCurrency(cart.subtotal)}</span></div>
                              {cart.discountTotal > 0 && (
                                    <div className="flex justify-between text-accent-red"><span>Discount</span><span>-{fmtCurrency(cart.discountTotal)}</span></div>
                              )}
                              <div className="flex justify-between text-sm font-medium text-ink-primary pt-1 border-t border-bg-border">
                                    <span>Total</span><span className="text-accent-gold">{fmtCurrency(cart.total)}</span>
                              </div>
                        </div>

                        <div>
                              <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-[10px] uppercase tracking-wide text-ink-faint">Payment</label>
                                    <button type="button" onClick={addPaymentLine} className="text-[11px] text-accent-gold">+ Add method</button>
                              </div>
                              {payments.length === 0 ? (
                                    <p className="text-[11px] text-ink-faint">No payment added yet.</p>
                              ) : (
                                    <div className="space-y-1.5">
                                          {payments.map((p) => (
                                                <div key={p.id} className="flex items-center gap-1.5">
                                                      <select
                                                            value={p.account}
                                                            onChange={(e) => updatePayment(p.id, { account: e.target.value })}
                                                            className={SELECT_CLASS + ' flex-1'}
                                                      >
                                                            {(accountRows.length ? accountRows.map((a) => a.name) : ['Cash']).map((name) => (
                                                                  <option key={name} value={name}>{name}</option>
                                                            ))}
                                                      </select>
                                                      <input
                                                            type="number"
                                                            value={p.amount}
                                                            onChange={(e) => updatePayment(p.id, { amount: Number(e.target.value) })}
                                                            className="w-24 rounded-md border border-bg-border bg-bg-hover px-2 py-1.5 text-xs font-mono text-ink-primary"
                                                      />
                                                      <button type="button" onClick={() => removePayment(p.id)} aria-label="Remove payment">
                                                            <X size={13} className="text-ink-faint hover:text-accent-red" />
                                                      </button>
                                                </div>
                                          ))}
                                          <div className="flex justify-between text-[11px] font-mono pt-1">
                                                <span className="text-ink-muted">Tendered</span>
                                                <span className={amountTendered >= cart.total ? 'text-accent-teal' : 'text-accent-red'}>
                                                      {fmtCurrency(amountTendered)}
                                                </span>
                                          </div>
                                          {amountTendered >= cart.total && changeDue > 0 && (
                                                <div className="flex justify-between text-[11px] font-mono">
                                                      <span className="text-ink-muted">Change due</span>
                                                      <span className="text-accent-gold">{fmtCurrency(changeDue)}</span>
                                                </div>
                                          )}
                                    </div>
                              )}
                        </div>

                        <input
                              value={salesperson}
                              onChange={(e) => setSalesperson(e.target.value)}
                              placeholder="Salesperson (optional)"
                              className="w-full rounded-md border border-bg-border bg-bg-hover px-2.5 py-1.5 text-xs font-body text-ink-primary placeholder:text-ink-faint"
                        />

                        {error && (
                              <p className="flex items-start gap-1.5 text-[11px] text-accent-red">
                                    <AlertCircle size={13} className="shrink-0 mt-0.5" /> {error}
                              </p>
                        )}

                        <button
                              type="button"
                              disabled={!canCheckout}
                              onClick={handleCheckout}
                              className="w-full rounded-lg bg-accent-gold text-bg-base font-body text-sm font-medium py-3 flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                              {submitting ? 'Processing…' : `Charge ${fmtCurrency(cart.total)}`}
                        </button>
                  </div>
            </div>
      );
}
