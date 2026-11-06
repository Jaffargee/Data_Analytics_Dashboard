import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, AlertTriangle, Check, Loader2, Save } from 'lucide-react';
import Button from '@/components/ui/controls/Button';
import CustomerForm from './CustomerForm';
import {
      profileToForm,
      useCustomerProfile,
      useSaveCustomer,
      validateCustomerForm,
      type CustomerFormErrors,
      type CustomerProfileForm,
} from '@/hooks/data/use-customer-profile';

interface CustomerProfileTabProps {
      /** POS customer number (the id used by /customers/customer/:id for synced customers) */
      posId?: number;
      /** customers.id (uuid) — for customers created in the dashboard that have no POS number yet */
      uuid?: string;
}

export default function CustomerProfileTab({ posId, uuid }: CustomerProfileTabProps) {
      const profile = useCustomerProfile({ id: uuid, posId });
      const save = useSaveCustomer();

      const [form, setForm] = useState<CustomerProfileForm | null>(null);
      const [baseline, setBaseline] = useState('');
      const [errors, setErrors] = useState<CustomerFormErrors>({});
      const [justSaved, setJustSaved] = useState(false);

      // (re)load the form whenever the server copy changes — first load and after each save
      useEffect(() => {
            if (!profile.data) return;
            const next = profileToForm(profile.data);
            setForm(next);
            setBaseline(JSON.stringify(next));
            setErrors({});
      }, [profile.data]);

      useEffect(() => {
            if (!justSaved) return;
            const t = setTimeout(() => setJustSaved(false), 2500);
            return () => clearTimeout(t);
      }, [justSaved]);

      const dirty = useMemo(
            () => form !== null && JSON.stringify(form) !== baseline,
            [form, baseline]
      );

      if (profile.isLoading) {
            return (
                  <div className="flex items-center justify-center gap-2 py-16">
                        <Loader2 size={18} className="animate-spin text-accent-gold" />
                        <p className="text-ink-muted font-body">Loading profile…</p>
                  </div>
            );
      }

      if (profile.error) {
            return (
                  <div className="flex items-center justify-center gap-2 py-16 text-accent-red">
                        <AlertCircle size={18} />
                        <p className="font-body text-sm">{profile.error.message}</p>
                  </div>
            );
      }

      if (!profile.data || !form) {
            return (
                  <div className="flex flex-col items-center justify-center gap-2 py-16 text-ink-muted">
                        <AlertTriangle size={24} />
                        <p className="font-body text-sm">
                              No profile record found for this customer.
                        </p>
                  </div>
            );
      }

      const customerId = profile.data.id;

      const handleChange = (next: CustomerProfileForm) => {
            setForm(next);
            setJustSaved(false);
            if (Object.keys(errors).length > 0) setErrors(validateCustomerForm(next));
      };

      const handleSave = async () => {
            const found = validateCustomerForm(form);
            setErrors(found);
            if (Object.keys(found).length > 0) return;

            try {
                  await save.mutateAsync({ id: customerId, form });
                  setJustSaved(true);
            } catch {
                  /* surfaced through save.error below */
            }
      };

      const handleDiscard = () => {
            setForm(JSON.parse(baseline) as CustomerProfileForm);
            setErrors({});
            save.reset();
      };

      return (
            <div className="w-full max-w-3xl space-y-6">
                  {profile.data.pos_customer_id === null && (
                        <p className="rounded-xl border border-bg-border px-4 py-3 text-[13px] font-body text-ink-subtle">
                              This customer was created in the dashboard and has no POS number yet, so sales
                              history will appear once they are linked to a POS customer.
                        </p>
                  )}

                  {save.error && (
                        <div
                              role="alert"
                              className="flex items-start gap-3 rounded-xl border border-accent-red/30 bg-accent-red/10 px-4 py-3"
                        >
                              <AlertCircle size={16} className="mt-0.5 shrink-0 text-accent-red" />
                              <p className="text-sm font-body text-accent-red">{save.error.message}</p>
                        </div>
                  )}

                  <CustomerForm
                        form={form}
                        onChange={handleChange}
                        errors={errors}
                        disabled={save.isPending}
                  />

                  <div className="sticky bottom-0 z-10 -mx-3 sm:-mx-6 border-t border-bg-border bg-bg-base/90 backdrop-blur-md px-3 sm:px-6 py-3 flex items-center justify-end gap-3">
                        <span className="mr-auto text-[13px] font-body">
                              {justSaved ? (
                                    <span className="inline-flex items-center gap-1.5 text-accent-teal">
                                          <Check size={14} /> Saved
                                    </span>
                              ) : dirty ? (
                                    <span className="text-ink-subtle">Unsaved changes</span>
                              ) : null}
                        </span>
                        <Button variant="secondary" onClick={handleDiscard} disabled={!dirty || save.isPending}>
                              Discard
                        </Button>
                        <Button
                              variant="primary"
                              icon={<Save />}
                              loading={save.isPending}
                              disabled={!dirty}
                              onClick={handleSave}
                        >
                              Save changes
                        </Button>
                  </div>
            </div>
      );
}
