import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Delivery, DeliveryForm, DeliveryItem } from "../types"
import { v4 as uuidv4 } from 'uuid'
import { EMPTY } from "../constants"
import { supabase } from '@/lib/supabase'

export default function useDelivery() {

      const navigate    = useNavigate()
	const { id }      = useParams<{ id?: string }>()
	const isEdit      = Boolean(id)

	const [form,          setForm]          = useState<DeliveryForm>(EMPTY)
	const [items,         setItems]         = useState<DeliveryItem[]>([{ _key: uuidv4(), item_name: '', quantity: 1, notes: '' }])
	const [activeSection, setActiveSection] = useState('customer')
	const [saving,        setSaving]        = useState(false)
	const [loading,       setLoading]       = useState(isEdit)
	const [saved,         setSaved]         = useState(false)
	const [errors,        setErrors]        = useState<Record<string, string>>({})
	const [globalError,   setGlobalError]   = useState<string | null>(null)
	const [trackingNo,    setTrackingNo]    = useState<string>('')

	const patch = <K extends keyof DeliveryForm>(k: K, v: DeliveryForm[K]) => setForm(prev => ({ ...prev, [k]: v }))

	// ── Load edit data ────────────────────────────────────────
	useEffect(() => {
		if (!isEdit || !id) return

		Promise.all([
			supabase.from('deliveries').select('*, delivery_items(*)').eq('id', id).single(),
		]).then(([delRes]) => {

			if (delRes.error || !delRes.data) { setGlobalError('Delivery not found'); setLoading(false); return }
			const d = delRes.data as Delivery;
                  const itemsRes = d.delivery_items;
			setTrackingNo(d.tracking_no)

			setForm({
				customer_id:         d.customer_id ?? '',
				customer_name:       d.customer_name ?? '',
				customer_phone:      d.customer_phone ?? '',
				driver_phone:        d.driver_phone ?? '',
				pos_sale_id:         String(d.pos_sale_id ?? ''),
				method:              d.method ?? 'LOCAL_DELIVERY',
				priority:            d.priority ?? 'STANDARD',
				status:              d.status ?? 'PENDING',
				destination_label:   d.destination_label ?? '',
				destination_line_1:  d.destination_line_1 ?? '',
				destination_line_2:  d.destination_line_2 ?? '',
				destination_city:    d.destination_city ?? '',
				destination_state:   d.destination_state ?? '',
				destination_country: d.destination_country ?? 'Nigeria',
				assigned_to:         d.assigned_to ?? '',
				package_description: d.package_description ?? '',
				package_weight:      String(d.package_weight ?? ''),
				package_count:       String(d.package_count ?? 1),
				delivery_fee:        String(d.delivery_fee ?? 0),
				is_paid:             d.is_paid ?? false,
				notes:               d.notes ?? '',
			})

			const loadedItems: DeliveryItem[] = (itemsRes).map(i => ({
				_key: i.id ?? crypto.randomUUID(), id: i.id,
				item_name: i.item_name, quantity: i.quantity, notes: i.notes ?? '',
			}))

			if (loadedItems.length) setItems(loadedItems)
			setLoading(false)
		})
	}, [id, isEdit])

	// ── Validate ──────────────────────────────────────────────
	const validate = (): boolean => {
		const errs: Record<string, string> = {}
		if (!form.customer_name.trim()) errs.customer_name = 'Customer name is required'
		if (!form.destination_city.trim())   errs.destination_city = 'City is required'
		if (!form.destination_state.trim())  errs.destination_state = 'State is required'
		setErrors(errs)
		if (errs.customer_name) setActiveSection('customer')
		else if (errs.destination_line_1 || errs.destination_city) setActiveSection('destination')
		return Object.keys(errs).length === 0
	}

	// ── Save ──────────────────────────────────────────────────
	const handleSave = async () => {
		if (!validate()) return
		setSaving(true); setGlobalError(null)

		try {
			// Generate tracking number for new deliveries
			let tno = trackingNo
			if (!isEdit) {
				const { data } = await supabase.rpc('generate_tracking_no')
				tno = data ?? `TGD-${Date.now()}`
				setTrackingNo(tno)
			}

			const payload = {
				customer_id:          form.customer_id || null,
				customer_name:        form.customer_name.trim(),
				customer_phone:       form.customer_phone.trim() || null,
				pos_sale_id:          form.pos_sale_id ? parseInt(form.pos_sale_id) : null,
				method:               form.method,
				priority:             form.priority,
				status:               form.status,
				destination_label:    form.destination_label.trim() || null,
				destination_line_1:   form.destination_line_1.trim(),
				destination_line_2:   form.destination_line_2.trim() || null,
				destination_city:     form.destination_city.trim(),
				destination_state:    form.destination_state.trim(),
				destination_country:  form.destination_country.trim() || 'Nigeria',
				assigned_to:          form.assigned_to.trim() || null,
				package_description:  form.package_description.trim() || null,
				package_weight:       form.package_weight ? parseFloat(form.package_weight) : null,
				package_count:        parseInt(form.package_count) || 1,
				delivery_fee:         parseFloat(form.delivery_fee) || 0,
				is_paid:              form.is_paid,
				notes:                form.notes.trim() || null,
				dispatched_at:        form.status === 'DISPATCHED' && !isEdit ? new Date().toISOString() : undefined,
				delivered_at:         form.status === 'DELIVERED' && !isEdit ? new Date().toISOString() : undefined,
			}

			let deliveryId = id
			if (isEdit) {
				const { error } = await supabase.from('deliveries').update(payload).eq('id', id)
				if (error) throw error
			} else {
				const { data, error } = await supabase.from('deliveries').insert(payload).select('id').single()
				if (error) throw error
				deliveryId = data.id
			}

			// Upsert items
			const validItems = items.filter(i => i.item_name.trim())
			for (const item of validItems) {
				const itemPayload = { delivery_id: deliveryId, item_name: item.item_name.trim(), quantity: item.quantity, notes: item.notes.trim() || null }
				if (item.id) {
					await supabase.from('delivery_items').update(itemPayload).eq('id', item.id)
				} else {
					await supabase.from('delivery_items').insert(itemPayload)
				}
			}

			setSaved(true)
			setTimeout(() => navigate('/deliveries'), 1200)
		} catch (err: unknown) {
			setGlobalError(err instanceof Error ? err.message : 'Save failed')
		} finally {
			setSaving(false)
		}
	}

	const scrollTo = (s: string) => { setActiveSection(s); document.getElementById(s)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }

      return {
            validate,
            handleSave,
            scrollTo,
            setForm,
            patch,
            setItems,
            setActiveSection,
            form,
            items,
            activeSection,
            saving,
            loading,
            saved,
            errors,
            globalError,
            trackingNo,
            isEdit
      }

}