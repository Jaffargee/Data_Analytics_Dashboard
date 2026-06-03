import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TopBar } from '@/components/ui/TopBar'
import { supabase } from '@/lib/supabase'
import { cn, fmtCurrency } from '@/lib/utils'
import {
	Package, MapPin, User, Phone, Truck, DollarSign,
	Calendar, Clock, FileText, ChevronLeft, Save,
	Loader2, AlertCircle, Check, Plus, X, Search,
	Zap, Star, ChevronDown, Hash, Weight,
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

// ── Types ─────────────────────────────────────────────────────
type DeliveryStatus   = 'PENDING'|'CONFIRMED'|'PACKED'|'DISPATCHED'|'IN_TRANSIT'|'OUT_FOR_DELIVERY'|'DELIVERED'|'FAILED'|'RETURNED'|'CANCELLED'
type DeliveryMethod   = 'PICKUP'|'LOCAL_DELIVERY'|'COURIER'|'BUS_TRANSPORT'|'AGENT'
type DeliveryPriority = 'STANDARD'|'EXPRESS'|'URGENT'

interface DeliveryItem {
	_key:      string
	id?:       string
	item_name: string
	quantity:  number
	notes:     string
}

interface DeliveryForm {
	// Customer
	customer_id:    string
	customer_name:  string
	customer_phone: string
	pos_sale_id:    string
	// Delivery
	method:         DeliveryMethod
	priority:       DeliveryPriority
	status:         DeliveryStatus
	// Destination
	destination_label:   string
	destination_line_1:  string
	destination_line_2:  string
	destination_city:    string
	destination_state:   string
	destination_country: string
	// Logistics
	assigned_to:     string
	courier_name:    string
	courier_tracking:string
	vehicle_info:    string
	// Package
	package_description: string
	package_weight:      string
	package_count:       string
	// Financial
	delivery_fee:  string
	is_paid:       boolean
	cod_amount:    string
	// Timeline
	scheduled_date: string
	scheduled_time: string
	notes:          string
}

interface CustomerSuggestion {
	id:           string
	name:         string
	pos_customer_id: number
	phone_number: string | null
	company_name: string | null
}

const EMPTY: DeliveryForm = {
	customer_id: '', customer_name: '', customer_phone: '', pos_sale_id: '',
	method: 'LOCAL_DELIVERY', priority: 'STANDARD', status: 'PENDING',
	destination_label: '', destination_line_1: '', destination_line_2: '',
	destination_city: '', destination_state: '', destination_country: 'Nigeria',
	assigned_to: '', courier_name: '', courier_tracking: '', vehicle_info: '',
	package_description: '', package_weight: '', package_count: '1',
	delivery_fee: '0', is_paid: false, cod_amount: '',
	scheduled_date: '', scheduled_time: '', notes: '',
}

// ── Constants ─────────────────────────────────────────────────
const METHODS: { id: DeliveryMethod; label: string; icon: React.ElementType; desc: string }[] = [
	{ id: 'PICKUP',         label: 'Pickup',        icon: User,    desc: 'Customer collects' },
	{ id: 'LOCAL_DELIVERY', label: 'Local',         icon: MapPin,  desc: 'Staff delivers' },
	{ id: 'COURIER',        label: 'Courier',       icon: Package, desc: '3rd party courier' },
	{ id: 'BUS_TRANSPORT',  label: 'Bus',           icon: Truck,   desc: 'Via transport' },
	{ id: 'AGENT',          label: 'Agent',         icon: User,    desc: 'Via agent/rep' },
]

const PRIORITIES: { id: DeliveryPriority; label: string; color: string }[] = [
	{ id: 'STANDARD', label: 'Standard', color: 'text-ink-secondary border-bg-border bg-bg-hover' },
	{ id: 'EXPRESS',  label: 'Express',  color: 'text-accent-gold border-accent-gold/30 bg-accent-gold/10' },
	{ id: 'URGENT',   label: 'Urgent',   color: 'text-accent-red border-accent-red/30 bg-accent-red/10' },
]

const STATUSES: DeliveryStatus[] = [
	'PENDING','CONFIRMED','PACKED','DISPATCHED',
	'IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED','FAILED','RETURNED','CANCELLED',
]

const NIGERIAN_STATES = [
	'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
	'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
	'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
	'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
	'Yobe','Zamfara',
]

const SECTIONS = [
	{ id: 'customer',   label: 'Customer',    icon: User      },
	{ id: 'delivery',   label: 'Delivery',    icon: Truck     },
	{ id: 'destination',label: 'Destination', icon: MapPin    },
	{ id: 'package',    label: 'Package',     icon: Package   },
	{ id: 'financial',  label: 'Financial',   icon: DollarSign},
	{ id: 'schedule',   label: 'Schedule',    icon: Calendar  },
	{ id: 'notes',      label: 'Notes',       icon: FileText  },
]

// ── Field primitives ──────────────────────────────────────────
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
	return (
		<label className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-ink-muted mb-1.5">
			{children}{required && <span className="text-accent-gold">*</span>}
		</label>
	)
}

function Input({
	value, onChange, placeholder, type = 'text',
	prefix, suffix, error, disabled,
}: {
	value: string; onChange: (v: string) => void; placeholder?: string
	type?: string; prefix?: React.ReactNode; suffix?: React.ReactNode
	error?: string; disabled?: boolean
}) {
	return (
		<div>
			<div className={cn(
				"flex items-center bg-bg-hover border rounded-xl overflow-hidden transition-all",
				error ? "border-accent-red/40" : "border-bg-border focus-within:border-accent-gold/50",
				disabled && "opacity-50 cursor-not-allowed"
			)}>
				{prefix && <span className="pl-3 text-ink-faint flex items-center shrink-0">{prefix}</span>}
				<input
					type={type} value={value} disabled={disabled}
					onChange={e => onChange(e.target.value)} placeholder={placeholder}
					className="flex-1 bg-transparent px-3 py-2.5 text-sm font-body text-ink-primary placeholder:text-ink-faint outline-none"
				/>
				{suffix && <span className="pr-3 text-ink-faint flex items-center shrink-0">{suffix}</span>}
			</div>
			{error && <p className="flex items-center gap-1 mt-1 text-[11px] text-accent-red"><AlertCircle size={10}/>{error}</p>}
		</div>
	)
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
	value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
	return (
		<textarea value={value} onChange={e => onChange(e.target.value)}
			placeholder={placeholder} rows={rows}
			className="w-full bg-bg-hover border border-bg-border rounded-xl px-3 py-2.5 text-sm font-body text-ink-primary placeholder:text-ink-faint outline-none focus:border-accent-gold/50 transition-all resize-none"
		/>
	)
}

function Toggle({ checked, onChange, label, description }: {
	checked: boolean; onChange: (v: boolean) => void; label: string; description?: string
}) {
	return (
		<button type="button" onClick={() => onChange(!checked)}
			className="flex items-center justify-between w-full p-3 rounded-xl border border-bg-border bg-bg-hover hover:border-accent-gold/20 transition-all">
			<div className="text-left">
				<p className="text-sm font-body text-ink-primary">{label}</p>
				{description && <p className="text-[11px] text-ink-muted font-body mt-0.5">{description}</p>}
			</div>
			<div className={cn("relative flex-shrink-0 ml-4 w-10 h-[22px] rounded-full transition-all duration-200",
				checked ? "bg-accent-gold" : "bg-bg-muted border border-bg-border")}>
				<div className={cn("absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200",
					checked ? "left-[22px]" : "left-[3px]")} />
			</div>
		</button>
	)
}

function SectionCard({ id, title, icon: Icon, children, active, onActivate }: {
	id: string; title: string; icon: React.ElementType
	children: React.ReactNode; active?: boolean; onActivate?: () => void
}) {
	return (
		<div id={id} className="scroll-mt-6">
			<button type="button" onClick={onActivate} className="w-full flex items-center gap-3 mb-4 group">
				<div className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-all",
					active ? "bg-accent-gold/20 border border-accent-gold/30" : "bg-bg-hover border border-bg-border group-hover:border-accent-gold/20")}>
					<Icon size={14} className={active ? "text-accent-gold" : "text-ink-muted"} />
				</div>
				<h3 className={cn("font-display font-semibold text-sm uppercase tracking-widest transition-colors",
					active ? "text-accent-gold" : "text-ink-secondary group-hover:text-ink-primary")}>{title}</h3>
				<div className="flex-1 h-px bg-bg-border" />
			</button>
			<div className="space-y-4">{children}</div>
		</div>
	)
}

// ── Delivery item row ─────────────────────────────────────────
function DeliveryItemRow({ item, onChange, onRemove, showRemove }: {
	item: DeliveryItem; onChange: (i: DeliveryItem) => void
	onRemove: () => void; showRemove: boolean
}) {
	const patch = <K extends keyof DeliveryItem>(k: K, v: DeliveryItem[K]) => onChange({ ...item, [k]: v })
	return (
		<div className="flex items-start gap-3 p-3 bg-bg-hover/60 border border-bg-border rounded-xl">
			<div className="flex-1 grid grid-cols-3 gap-3">
				<div className="col-span-2">
					<Label>Item / Product Name</Label>
					<Input value={item.item_name} onChange={v => patch('item_name', v)} placeholder="e.g. Swiss Luxury Lace C" />
				</div>
				<div>
					<Label>Qty</Label>
					<Input value={String(item.quantity)} onChange={v => patch('quantity', parseInt(v)||1)} type="number" />
				</div>
				<div className="col-span-3">
					<Label>Notes</Label>
					<Input value={item.notes} onChange={v => patch('notes', v)} placeholder="Colour, size, special instructions…" />
				</div>
			</div>
			{showRemove && (
				<button type="button" onClick={onRemove}
					className="mt-6 w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg text-ink-faint hover:text-accent-red hover:bg-accent-red/10 border border-transparent hover:border-accent-red/20 transition-all">
					<X size={13} />
				</button>
			)}
		</div>
	)
}

// ── Customer autocomplete ─────────────────────────────────────
function CustomerSearch({ value, onSelect }: {
	value: string
	onSelect: (c: CustomerSuggestion) => void
}) {
	const [query, setQuery]           = useState(value)
	const [results, setResults]       = useState<CustomerSuggestion[]>([])
	const [open, setOpen]             = useState(false)
	const [loading, setLoading]       = useState(false)
	const debounce                    = useRef<ReturnType<typeof setTimeout>>()
	const ref                         = useRef<HTMLDivElement>(null)

	useEffect(() => { setQuery(value) }, [value])

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [])

	const search = (q: string) => {
		setQuery(q)
		clearTimeout(debounce.current)
		if (!q.trim()) { setResults([]); setOpen(false); return }
		debounce.current = setTimeout(async () => {
			setLoading(true)
			const { data } = await supabase
				.from('customers')
				.select('id, name, pos_customer_id, company_name')
				.or(`name.ilike.%${q}%,company_name.ilike.%${q}%`)
				.limit(8)
			setResults((data ?? []) as CustomerSuggestion[])
			setOpen(true)
			setLoading(false)
		}, 280)
	}

	return (
		<div ref={ref} className="relative">
			<div className="flex items-center bg-bg-hover border border-bg-border rounded-xl overflow-hidden focus-within:border-accent-gold/50 transition-all">
				<span className="pl-3 text-ink-faint flex items-center shrink-0"><Search size={13} /></span>
				<input
					value={query}
					onChange={e => search(e.target.value)}
					onFocus={() => query && setOpen(true)}
					placeholder="Search customer by name…"
					className="flex-1 bg-transparent px-3 py-2.5 text-sm font-body text-ink-primary placeholder:text-ink-faint outline-none"
				/>
				{loading && <span className="pr-3"><Loader2 size={13} className="animate-spin text-ink-muted" /></span>}
			</div>
			{open && results.length > 0 && (
				<div className="absolute z-50 top-full mt-1 left-0 right-0 bg-bg-panel border border-bg-border rounded-xl shadow-2xl overflow-hidden">
					{results.map(c => (
						<button key={c.id} type="button"
							onClick={() => { onSelect(c); setQuery(c.name); setOpen(false) }}
							className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-bg-hover text-left transition-colors border-b border-bg-border/50 last:border-0">
							<div className="w-7 h-7 rounded-lg bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center shrink-0">
								<span className="text-[10px] font-display font-bold text-accent-gold">{c.name?.slice(0,1)}</span>
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-xs font-body text-ink-primary truncate">{c.name}</p>
								{c.company_name && <p className="text-[10px] font-body text-ink-muted truncate">{c.company_name}</p>}
							</div>
							<span className="text-[10px] font-mono text-ink-faint shrink-0">#{c.pos_customer_id}</span>
						</button>
					))}
				</div>
			)}
		</div>
	)
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function DeliveryFormPage() {
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

	const patch = <K extends keyof DeliveryForm>(k: K, v: DeliveryForm[K]) =>
		setForm(prev => ({ ...prev, [k]: v }))

	// ── Load edit data ────────────────────────────────────────
	useEffect(() => {
		if (!isEdit || !id) return
		Promise.all([
			supabase.from('deliveries').select('*').eq('id', id).single(),
			supabase.from('delivery_items').select('*').eq('delivery_id', id),
		]).then(([delRes, itemsRes]) => {
			if (delRes.error || !delRes.data) { setGlobalError('Delivery not found'); setLoading(false); return }
			const d = delRes.data
			setTrackingNo(d.tracking_no)
			setForm({
				customer_id:         d.customer_id ?? '',
				customer_name:       d.customer_name ?? '',
				customer_phone:      d.customer_phone ?? '',
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
				courier_name:        d.courier_name ?? '',
				courier_tracking:    d.courier_tracking ?? '',
				vehicle_info:        d.vehicle_info ?? '',
				package_description: d.package_description ?? '',
				package_weight:      String(d.package_weight ?? ''),
				package_count:       String(d.package_count ?? 1),
				delivery_fee:        String(d.delivery_fee ?? 0),
				is_paid:             d.is_paid ?? false,
				cod_amount:          String(d.cod_amount ?? ''),
				scheduled_date:      d.scheduled_date ?? '',
				scheduled_time:      d.scheduled_time?.slice(0,5) ?? '',
				notes:               d.notes ?? '',
			})
			const loadedItems: DeliveryItem[] = (itemsRes.data ?? []).map(i => ({
				_key: i.id, id: i.id,
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
		if (!form.destination_line_1.trim()) errs.destination_line_1 = 'Address is required'
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
				tracking_no:          tno,
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
				courier_name:         form.courier_name.trim() || null,
				courier_tracking:     form.courier_tracking.trim() || null,
				vehicle_info:         form.vehicle_info.trim() || null,
				package_description:  form.package_description.trim() || null,
				package_weight:       form.package_weight ? parseFloat(form.package_weight) : null,
				package_count:        parseInt(form.package_count) || 1,
				delivery_fee:         parseFloat(form.delivery_fee) || 0,
				is_paid:              form.is_paid,
				cod_amount:           form.cod_amount ? parseFloat(form.cod_amount) : null,
				scheduled_date:       form.scheduled_date || null,
				scheduled_time:       form.scheduled_time ? form.scheduled_time + ':00' : null,
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

	if (loading) return (
		<div className="flex-1 flex flex-col min-h-screen">
			<TopBar title={isEdit ? 'Edit Delivery' : 'New Delivery'} />
			<div className="flex-1 flex items-center justify-center gap-3">
				<Loader2 size={20} className="animate-spin text-accent-gold" />
				<span className="text-ink-muted font-body text-sm">Loading…</span>
			</div>
		</div>
	)

	return (
		<div className="flex-1 flex flex-col min-h-screen">
			<TopBar
				title={isEdit ? `Edit Delivery ${trackingNo}` : 'New Delivery'}
				subtitle={isEdit ? form.customer_name : 'Create a new delivery record'}
			/>
			<div className="flex-1 flex min-h-0">

				{/* ── Sidebar ── */}
				<aside className="w-52 flex-shrink-0 border-r border-bg-border bg-bg-panel sticky top-14 h-[calc(100vh-56px)] flex flex-col">
					{/* Preview */}
					<div className="p-4 border-b border-bg-border">
						<div className="w-12 h-12 rounded-2xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center mx-auto mb-2">
							<Truck size={20} className="text-accent-gold" />
						</div>
						{trackingNo && (
							<p className="text-[10px] font-mono text-center text-accent-gold truncate">{trackingNo}</p>
						)}
						<p className="text-xs font-body text-center text-ink-secondary truncate mt-0.5">
							{form.customer_name || 'New Delivery'}
						</p>
						<div className="flex items-center justify-center gap-2 mt-2">
							<span className={cn("text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase",
								PRIORITIES.find(p => p.id === form.priority)?.color ?? '')}>
								{form.priority}
							</span>
						</div>
					</div>

					<nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
						{SECTIONS.map(s => (
							<button key={s.id} type="button" onClick={() => scrollTo(s.id)}
								className={cn(
									"w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-body transition-all text-left",
									activeSection === s.id
										? "bg-accent-gold/10 text-accent-gold border border-accent-gold/20"
										: "text-ink-secondary hover:text-ink-primary hover:bg-bg-hover"
								)}>
								<s.icon size={14} className={activeSection === s.id ? "text-accent-gold" : "text-ink-muted"} />
								{s.label}
							</button>
						))}
					</nav>
				</aside>

				{/* ── Main form ── */}
				<main className="flex-1 min-w-0 overflow-y-auto">
					<div className="max-w-2xl mx-auto px-6 py-8 space-y-10">

						{globalError && (
							<div className="flex items-center gap-3 bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3">
								<AlertCircle size={16} className="text-accent-red shrink-0" />
								<p className="text-sm font-body text-accent-red">{globalError}</p>
							</div>
						)}

						{/* ── CUSTOMER ── */}
						<SectionCard id="customer" title="Customer" icon={User}
							active={activeSection === 'customer'} onActivate={() => setActiveSection('customer')}>
							<div>
								<Label>Search Customer</Label>
								<CustomerSearch
									value={form.customer_name}
									onSelect={c => {
										patch('customer_id', c.id)
										patch('customer_name', c.name)
										if (c.phone_number) patch('customer_phone', c.phone_number)
									}}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label required>Customer Name</Label>
									<Input value={form.customer_name} onChange={v => patch('customer_name', v)}
										placeholder="Full name" error={errors.customer_name} />
								</div>
								<div>
									<Label>Phone Number</Label>
									<Input value={form.customer_phone} onChange={v => patch('customer_phone', v)}
										placeholder="+234 803 000 0000" prefix={<Phone size={12}/>} />
								</div>
							</div>
							<div>
								<Label>Linked Sale ID <span className="text-ink-faint font-body normal-case tracking-normal">(optional)</span></Label>
								<Input value={form.pos_sale_id} onChange={v => patch('pos_sale_id', v)}
									placeholder="POS sale ID" prefix={<Hash size={12}/>} />
							</div>
						</SectionCard>

						{/* ── DELIVERY ── */}
						<SectionCard id="delivery" title="Delivery Details" icon={Truck}
							active={activeSection === 'delivery'} onActivate={() => setActiveSection('delivery')}>

							{/* Method picker */}
							<div>
								<Label required>Delivery Method</Label>
								<div className="grid grid-cols-5 gap-2">
									{METHODS.map(m => (
										<button key={m.id} type="button" onClick={() => patch('method', m.id)}
											className={cn(
												"flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border text-[10px] font-mono transition-all",
												form.method === m.id
													? "bg-accent-gold/15 border-accent-gold/30 text-accent-gold"
													: "text-ink-faint border-bg-border hover:border-bg-muted"
											)}>
											<m.icon size={15} />
											{m.label}
											<span className="text-[8px] text-center leading-tight opacity-70">{m.desc}</span>
										</button>
									))}
								</div>
							</div>

							{/* Priority picker */}
							<div>
								<Label required>Priority</Label>
								<div className="grid grid-cols-3 gap-3">
									{PRIORITIES.map(p => (
										<button key={p.id} type="button" onClick={() => patch('priority', p.id)}
											className={cn(
												"flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-mono transition-all",
												form.priority === p.id ? p.color : "text-ink-faint border-bg-border hover:border-bg-muted"
											)}>
											{p.id === 'URGENT' && <Zap size={12} />}
											{p.id === 'EXPRESS' && <Star size={12} />}
											{p.label}
										</button>
									))}
								</div>
							</div>

							{/* Status */}
							{isEdit && (
								<div>
									<Label>Status</Label>
									<div className="relative">
										<select value={form.status} onChange={e => patch('status', e.target.value as DeliveryStatus)}
											className="w-full appearance-none bg-bg-hover border border-bg-border rounded-xl px-3 py-2.5 pr-8 text-sm font-body text-ink-primary outline-none focus:border-accent-gold/50 transition-all">
											{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
										</select>
										<ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
									</div>
								</div>
							)}

							{/* Logistics */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label>Assigned Staff / Rider</Label>
									<Input value={form.assigned_to} onChange={v => patch('assigned_to', v)}
										placeholder="e.g. Musa, Rider 1" prefix={<User size={12}/>} />
								</div>
								<div>
									<Label>Vehicle Info</Label>
									<Input value={form.vehicle_info} onChange={v => patch('vehicle_info', v)}
										placeholder="Plate, type, colour" prefix={<Truck size={12}/>} />
								</div>
							</div>

							{(form.method === 'COURIER') && (
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label>Courier Company</Label>
										<Input value={form.courier_name} onChange={v => patch('courier_name', v)} placeholder="DHL, GIG, etc." />
									</div>
									<div>
										<Label>Courier Tracking No.</Label>
										<Input value={form.courier_tracking} onChange={v => patch('courier_tracking', v)} placeholder="Courier's ref" />
									</div>
								</div>
							)}
						</SectionCard>

						{/* ── DESTINATION ── */}
						<SectionCard id="destination" title="Destination" icon={MapPin}
							active={activeSection === 'destination'} onActivate={() => setActiveSection('destination')}>
							<div>
								<Label>Location Label <span className="text-ink-faint font-body normal-case tracking-normal">(optional)</span></Label>
								<Input value={form.destination_label} onChange={v => patch('destination_label', v)}
									placeholder="e.g. Home, Shop, Warehouse" />
							</div>
							<div>
								<Label required>Address Line 1</Label>
								<Input value={form.destination_line_1} onChange={v => patch('destination_line_1', v)}
									placeholder="Street, building, house number" error={errors.destination_line_1} />
							</div>
							<div>
								<Label>Address Line 2</Label>
								<Input value={form.destination_line_2} onChange={v => patch('destination_line_2', v)}
									placeholder="Landmark, area (optional)" />
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label required>City</Label>
									<Input value={form.destination_city} onChange={v => patch('destination_city', v)}
										placeholder="e.g. Kano" error={errors.destination_city} />
								</div>
								<div>
									<Label required>State</Label>
									<div className="relative">
										<select value={form.destination_state}
											onChange={e => patch('destination_state', e.target.value)}
											className="w-full appearance-none bg-bg-hover border border-bg-border rounded-xl px-3 py-2.5 pr-8 text-sm font-body text-ink-primary outline-none focus:border-accent-gold/50 transition-all">
											<option value="">Select state…</option>
											{NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
										</select>
										<ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
									</div>
								</div>
							</div>
						</SectionCard>

						{/* ── PACKAGE ── */}
						<SectionCard id="package" title="Package Contents" icon={Package}
							active={activeSection === 'package'} onActivate={() => setActiveSection('package')}>

							{/* Items */}
							<div className="space-y-3">
								{items.map((item, i) => (
									<DeliveryItemRow key={item._key} item={item}
										onChange={updated => setItems(prev => prev.map((x,j) => j===i ? updated : x))}
										onRemove={() => setItems(prev => prev.filter((_,j) => j!==i))}
										showRemove={items.length > 1}
									/>
								))}
							</div>

							<button type="button"
								onClick={() => setItems(prev => [...prev, { _key: crypto.randomUUID(), item_name: '', quantity: 1, notes: '' }])}
								className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-bg-muted text-ink-muted hover:border-accent-gold/40 hover:text-accent-gold text-xs font-mono transition-all">
								<Plus size={13} />Add Another Item
							</button>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label>Total Package Count</Label>
									<Input value={form.package_count} onChange={v => patch('package_count', v)}
										type="number" placeholder="1" suffix={<span className="text-xs">pcs</span>} />
								</div>
								<div>
									<Label>Package Weight</Label>
									<Input value={form.package_weight} onChange={v => patch('package_weight', v)}
										type="number" placeholder="0.0"
										prefix={<Weight size={12}/>} suffix={<span className="text-xs">kg</span>} />
								</div>
							</div>

							<div>
								<Label>Package Description</Label>
								<Input value={form.package_description} onChange={v => patch('package_description', v)}
									placeholder="Brief description of the package contents" />
							</div>
						</SectionCard>

						{/* ── FINANCIAL ── */}
						<SectionCard id="financial" title="Financial" icon={DollarSign}
							active={activeSection === 'financial'} onActivate={() => setActiveSection('financial')}>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label>Delivery Fee (₦)</Label>
									<Input value={form.delivery_fee} onChange={v => patch('delivery_fee', v)}
										type="number" prefix="₦" placeholder="0" />
								</div>
								<div>
									<Label>Cash on Delivery (₦)</Label>
									<Input value={form.cod_amount} onChange={v => patch('cod_amount', v)}
										type="number" prefix="₦" placeholder="0" />
								</div>
							</div>
							<Toggle
								checked={form.is_paid}
								onChange={v => patch('is_paid', v)}
								label="Delivery fee paid"
								description="Customer has paid the delivery charge"
							/>
						</SectionCard>

						{/* ── SCHEDULE ── */}
						<SectionCard id="schedule" title="Schedule" icon={Calendar}
							active={activeSection === 'schedule'} onActivate={() => setActiveSection('schedule')}>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label>Scheduled Date</Label>
									<input type="date" value={form.scheduled_date}
										onChange={e => patch('scheduled_date', e.target.value)}
										className="w-full bg-bg-hover border border-bg-border rounded-xl px-3 py-2.5 text-sm font-mono text-ink-primary outline-none focus:border-accent-gold/50 transition-all" />
								</div>
								<div>
									<Label>Scheduled Time</Label>
									<input type="time" value={form.scheduled_time}
										onChange={e => patch('scheduled_time', e.target.value)}
										className="w-full bg-bg-hover border border-bg-border rounded-xl px-3 py-2.5 text-sm font-mono text-ink-primary outline-none focus:border-accent-gold/50 transition-all" />
								</div>
							</div>
						</SectionCard>

						{/* ── NOTES ── */}
						<SectionCard id="notes" title="Notes" icon={FileText}
							active={activeSection === 'notes'} onActivate={() => setActiveSection('notes')}>
							<div>
								<Label>Internal Notes</Label>
								<Textarea value={form.notes} onChange={v => patch('notes', v)}
									placeholder="Special instructions, access codes, gate info, customer preferences…" rows={4} />
							</div>
						</SectionCard>

						{/* ── Save bar ── */}
						<div className="sticky bottom-0 -mx-6 px-6 py-4 bg-bg-base/90 backdrop-blur-md border-t border-bg-border flex items-center justify-between gap-4">
							<button type="button" onClick={() => navigate(-1)}
								className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-bg-border text-ink-secondary hover:text-ink-primary text-sm font-body transition-all">
								<ChevronLeft size={15} />Cancel
							</button>
							<div className="flex items-center gap-3">
								{Object.keys(errors).length > 0 && (
									<p className="text-xs text-accent-red font-body flex items-center gap-1">
										<AlertCircle size={11}/>Fix errors first
									</p>
								)}
								{saved && (
									<div className="flex items-center gap-1.5 text-accent-teal text-sm font-body animate-fade-in">
										<Check size={14}/>Saved!
									</div>
								)}
								<button type="button" onClick={handleSave} disabled={saving}
									className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent-gold/15 border border-accent-gold/30 text-accent-gold text-sm font-mono font-medium hover:bg-accent-gold/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
									{saving
										? <><Loader2 size={15} className="animate-spin"/>Saving…</>
										: <><Save size={15}/>{isEdit ? 'Update Delivery' : 'Create Delivery'}</>
									}
								</button>
							</div>
						</div>

					</div>
				</main>
			</div>
		</div>
	)
}