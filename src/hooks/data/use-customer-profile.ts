/**
 * Customer profile: load / create / update through the two Supabase RPCs
 * defined in sql.customer_profile.sql (get_customer_profile, save_customer).
 *
 * The tables themselves are RLS-locked, so everything goes through the RPCs.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/services/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────
export type ProfileContactType = 'phone' | 'email';

export interface ProfileContact {
      id?: string;
      type: ProfileContactType;
      value: string;
      is_primary: boolean;
}

export interface ProfileAddress {
      id?: string;
      label: string;
      is_primary: boolean;
      line_1: string;
      line_2: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
}

export interface ProfileAccount {
      id?: string;
      bank_name: string;
      account_no: string;
      account_name: string;
}

/** Shape returned by get_customer_profile (nullable columns as the DB has them). */
export interface CustomerProfile {
      id: string;
      pos_customer_id: number | null;
      first_name: string;
      last_name: string | null;
      customer_name: string;
      category: string;
      status_level: string;
      is_active: boolean;
      company_name: string | null;
      internal_notes: string | null;
      created_at: string;
      contacts: ProfileContact[];
      addresses: Array<Omit<ProfileAddress, 'line_2' | 'postal_code'> & {
            line_2: string | null;
            postal_code: string | null;
      }>;
      accounts: ProfileAccount[];
}

/** Controlled-input friendly form state (never null). */
export interface CustomerProfileForm {
      first_name: string;
      last_name: string;
      company_name: string;
      category: string;
      status_level: string;
      is_active: boolean;
      internal_notes: string;
      contacts: ProfileContact[];
      addresses: ProfileAddress[];
      accounts: ProfileAccount[];
}

export type CustomerFormErrors = Partial<Record<string, string>>;

export const EMPTY_CUSTOMER_FORM: CustomerProfileForm = {
      first_name: '',
      last_name: '',
      company_name: '',
      category: 'END_USER',
      status_level: 'SILVER',
      is_active: true,
      internal_notes: '',
      contacts: [],
      addresses: [],
      accounts: [],
};

export const EMPTY_ADDRESS: ProfileAddress = {
      label: 'Home',
      is_primary: false,
      line_1: '',
      line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Nigeria',
};

export const EMPTY_ACCOUNT: ProfileAccount = {
      bank_name: '',
      account_no: '',
      account_name: '',
};

export function profileToForm(p: CustomerProfile): CustomerProfileForm {
      return {
            first_name: p.first_name ?? '',
            last_name: p.last_name ?? '',
            company_name: p.company_name ?? '',
            category: p.category,
            status_level: p.status_level,
            is_active: p.is_active,
            internal_notes: p.internal_notes ?? '',
            contacts: (p.contacts ?? []).map((c) => ({ ...c })),
            addresses: (p.addresses ?? []).map((a) => ({
                  ...a,
                  line_2: a.line_2 ?? '',
                  postal_code: a.postal_code ?? '',
            })),
            accounts: (p.accounts ?? []).map((a) => ({ ...a })),
      };
}

// ── Validation (mirrors the checks inside save_customer) ──────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCustomerForm(form: CustomerProfileForm): CustomerFormErrors {
      const errors: CustomerFormErrors = {};

      if (!form.first_name.trim()) errors.first_name = 'First name is required';

      form.contacts.forEach((c, i) => {
            const v = c.value.trim();
            if (!v) return;
            if (c.type === 'email' && !EMAIL_RE.test(v)) {
                  errors[`contact_${i}`] = 'Enter a valid email address';
            }
            if (c.type === 'phone' && v.replace(/\D/g, '').length < 7) {
                  errors[`contact_${i}`] = 'Enter a valid phone number';
            }
      });

      form.accounts.forEach((a, i) => {
            const filled = [a.bank_name, a.account_no, a.account_name].filter((x) => x.trim());
            if (filled.length > 0 && filled.length < 3) {
                  errors[`account_${i}`] = 'Bank, account number and account name are all required';
            }
      });

      return errors;
}

/** Drop rows the user added but left empty. */
function cleanForm(form: CustomerProfileForm): CustomerProfileForm {
      return {
            ...form,
            contacts: form.contacts.filter((c) => c.value.trim()),
            addresses: form.addresses.filter((a) => a.line_1.trim()),
            accounts: form.accounts.filter(
                  (a) => a.bank_name.trim() || a.account_no.trim() || a.account_name.trim()
            ),
      };
}

// ── Queries ───────────────────────────────────────────────────────────────────
export const CUSTOMER_PROFILE_KEY = 'customer-profile';

interface ProfileKey {
      /** customers.id (uuid) */
      id?: string;
      /** POS customer number — what the existing /customers/customer/:id route uses */
      posId?: number;
}

export function useCustomerProfile({ id, posId }: ProfileKey) {
      const enabled = Boolean(id) || (posId !== undefined && Number.isFinite(posId));

      return useQuery({
            queryKey: [CUSTOMER_PROFILE_KEY, id ?? null, posId ?? null],
            enabled,
            // the profile is an edit form: never refetch under the user's unsaved edits
            refetchOnWindowFocus: false,
            queryFn: async (): Promise<CustomerProfile | null> => {
                  const { data, error } = await supabase.rpc('get_customer_profile', {
                        p_id: id ?? null,
                        p_pos_customer_id: id ? null : posId ?? null,
                  });
                  if (error) throw new Error(error.message);
                  return (data as CustomerProfile | null) ?? null;
            },
      });
}

// ── Mutation ──────────────────────────────────────────────────────────────────
export function useSaveCustomer() {
      const queryClient = useQueryClient();

      return useMutation({
            /** id = undefined → create; id = uuid → update. Resolves to the customer's uuid. */
            mutationFn: async ({
                  id,
                  form,
            }: {
                  id?: string;
                  form: CustomerProfileForm;
            }): Promise<string> => {
                  const { data, error } = await supabase.rpc('save_customer', {
                        p_id: id ?? null,
                        p_data: cleanForm(form),
                  });
                  if (error) throw new Error(error.message);
                  return data as string;
            },
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: [CUSTOMER_PROFILE_KEY] });
                  queryClient.invalidateQueries({ queryKey: ['view', 'v_top_customers'] });
                  queryClient.invalidateQueries({ queryKey: ['view', 'customer_directory'] });
            },
      });
}
