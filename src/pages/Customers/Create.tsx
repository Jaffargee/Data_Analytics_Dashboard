import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, UserPlus } from 'lucide-react';
import { TopBar } from '@/components/ui/TopBar';
import Button from '@/components/ui/controls/Button';
import CustomerForm from './components/CustomerForm';
import {
      EMPTY_CUSTOMER_FORM,
      useSaveCustomer,
      validateCustomerForm,
      type CustomerFormErrors,
      type CustomerProfileForm,
} from '@/hooks/data/use-customer-profile';

export default function CustomerCreate() {
      const navigate = useNavigate();
      const save = useSaveCustomer();
      const [form, setForm] = useState<CustomerProfileForm>(EMPTY_CUSTOMER_FORM);
      const [errors, setErrors] = useState<CustomerFormErrors>({});

      const handleChange = (next: CustomerProfileForm) => {
            setForm(next);
            // clear stale validation once the user edits again
            if (Object.keys(errors).length > 0) setErrors(validateCustomerForm(next));
      };

      const handleSubmit = async () => {
            const found = validateCustomerForm(form);
            setErrors(found);
            if (Object.keys(found).length > 0) return;

            try {
                  const id = await save.mutateAsync({ form });
                  // new customers have no POS number yet, so open them by their uuid
                  navigate(`/customers/customer/${id}`, { replace: true });
            } catch {
                  /* surfaced through save.error below */
            }
      };

      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar title="New Customer" subtitle="Create a customer profile" shouldNavigateBack />

                  <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-4 space-y-6">
                        {save.error && (
                              <div
                                    role="alert"
                                    className="flex items-start gap-3 rounded-xl border border-accent-red/30 bg-accent-red/10 px-4 py-3"
                              >
                                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-accent-red" />
                                    <p className="text-sm font-body text-accent-red">
                                          {save.error.message}
                                    </p>
                              </div>
                        )}

                        <CustomerForm
                              form={form}
                              onChange={handleChange}
                              errors={errors}
                              disabled={save.isPending}
                        />
                  </main>

                  <div className="sticky bottom-0 z-10 border-t border-bg-border bg-bg-base/90 backdrop-blur-md">
                        <div className="mx-auto flex w-full max-w-3xl items-center justify-end gap-3 px-4 sm:px-6 py-3">
                              <Button variant="secondary" onClick={() => navigate(-1)} disabled={save.isPending}>
                                    Cancel
                              </Button>
                              <Button
                                    variant="primary"
                                    icon={<UserPlus />}
                                    loading={save.isPending}
                                    onClick={handleSubmit}
                              >
                                    Create customer
                              </Button>
                        </div>
                  </div>
            </div>
      );
}
