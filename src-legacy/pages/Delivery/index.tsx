import useDelivery from './hooks/delivery_hook'
import { METHODS, NIGERIAN_STATES_OPTION, PRIORITIES, SECTIONS, STATUSES } from './constants'
import { Section as SectionCard, Toggle, CustomerSearch } from './components';
import { TopBar } from '@/components/ui/TopBar'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { DeliveryStatus } from '@/types'
import {
	BoxRegular as Package,
	Map16Filled as MapPin,
	PersonRegular as User,
	VehicleTruckRegular as Truck,
	CurrencyDollarEuroRegular as DollarSign,
	CalendarRegular as Calendar,
	DocumentTextRegular as FileText,
	ChevronLeftRegular as ChevronLeft,
	SaveRegular as Save,
	SpinnerIosRegular as Loader2,
	AlertUrgentRegular as AlertCircle,
	CheckmarkRegular as Check,
	AddRegular as Plus,
	FlashRegular as Zap,
	StarRegular as Star,
	ChevronDownRegular as ChevronDown,
	NumberSymbolRegular as Hash,
	ScalesRegular as Weight,
	PhoneRegular as Phone,
	Calendar16Regular,
	Clock16Regular
} from '@fluentui/react-icons';
import { Combobox } from '../../components/ui/';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

export default function DeliveryFormPage() {

	const navigate = useNavigate()
	const { loading, isEdit, trackingNo, form, activeSection, globalError, errors, saved, saving, setActiveSection, handleSave, scrollTo, patch } = useDelivery();

	if (loading) return (
		<div className="flex-1 flex flex-col min-h-screen">
			<TopBar title={isEdit ? 'Edit Delivery' : 'New Delivery'} />
			<div className="flex-1 flex items-center justify-center gap-3">
				<Loader2 fontSize={20} className="animate-spin text-accent-gold" />
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
					<div className="p-4 border-b border-bg-border">
						<div className="w-12 h-12 rounded-2xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center mx-auto mb-2">
							<Truck fontSize={20} className="text-accent-gold" />
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
									"w-full flex items-center gap-2.5 px-3 py-2.5 rounded-full text-sm font-body transition-all text-left outline-none",
									activeSection === s.id
										? "bg-accent-gold/10 text-accent-gold border border-accent-gold/20"
										: "text-ink-secondary hover:text-ink-primary border border-transparent hover:bg-bg-hover"
								)}>
								<s.icon fontSize={24} className={activeSection === s.id ? "text-accent-gold" : "text-ink-muted"} />
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
								<AlertCircle fontSize={24} className="text-accent-red shrink-0" />
								<p className="text-sm font-body text-accent-red">{globalError}</p>
							</div>
						)}

						{/* ── CUSTOMER ── */}
						<SectionCard id="customer" title="Customer" icon={User}
							active={activeSection === 'customer'} onActivate={() => setActiveSection('customer')}>
							<CustomerSearch
								value={form.customer_name}
								onSelect={c => {
									patch('customer_id', c.id)
									patch('customer_name', c.name)
									if (c.phone_number) patch('customer_phone', c.phone_number)
								}}
							/>
							<div className="grid grid-cols-2 gap-4">
								<Input value={form.customer_name} onChange={(v: string) => patch('customer_name', v)}
									placeholder="Full name" error={errors.customer_name} />
								<Input value={form.customer_phone} onChange={(v: string) => patch('customer_phone', v)}
									placeholder="Phone No." prefix={<Phone fontSize={20} />} />
							</div>
							<Input value={form.pos_sale_id} onChange={(v: string) => patch('pos_sale_id', v)}
								placeholder="Sale ID" prefix={<Hash fontSize={20} />} />
						</SectionCard>

						{/* ── DELIVERY ── */}
						<SectionCard id="delivery" title="Delivery Details" icon={Truck}
							active={activeSection === 'delivery'} onActivate={() => setActiveSection('delivery')}>

							<div className="grid grid-cols-5 gap-2">
								{METHODS.map(m => (
									<button key={m.id} type="button" onClick={() => patch('method', m.id)}
										className={cn(
											"flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border text-[10px] font-mono transition-all",
											form.method === m.id
												? "bg-accent-gold/15 border-accent-gold/30 text-accent-gold"
												: "text-ink-muted border-bg-border hover:border-bg-muted"
										)}>
										<m.icon fontSize={24} />
										{m.label}
										<span className="text-[8px] text-center leading-tight opacity-70">{m.desc}</span>
									</button>
								))}
							</div>

							<div className="grid grid-cols-3 gap-3">
								{PRIORITIES.map(p => (
									<button key={p.id} onClick={() => patch('priority', p.id)}
										className={cn(
											"flex items-center justify-center gap-2 py-2.5 rounded-full border text-xs font-mono transition-all",
											form.priority === p.id ? p.color : "text-ink-muted border-bg-border hover:border-bg-muted"
										)}>
										{p.id === 'URGENT' && <Zap fontSize={14} />}
										{p.id === 'EXPRESS' && <Star fontSize={14} />}
										{p.label}
									</button>
								))}
							</div>

							{isEdit && (
								<div className="relative">
									<select value={form.status} onChange={e => patch('status', e.target.value as DeliveryStatus)}
										className="w-full appearance-none bg-bg-hover border border-bg-border rounded-xl px-3 py-2.5 pr-8 text-sm font-body text-ink-primary outline-none focus:border-accent-gold/50 transition-all">
										{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
									</select>
									<ChevronDown fontSize={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
								</div>
							)}

							<div className="grid grid-cols-2 gap-4">
								<Input value={form.assigned_to} onChange={(v: string) => patch('assigned_to', v)}
									placeholder="Assigned staff / rider" prefix={<User fontSize={24} />} />
								<Input value={form.vehicle_info} onChange={(v: string) => patch('vehicle_info', v)}
									placeholder="Plate, type, colour" prefix={<Truck fontSize={24} />} />
							</div>

							{form.method === 'COURIER' && (
								<div className="grid grid-cols-2 gap-4">
									<Input value={form.courier_name} onChange={(v: string) => patch('courier_name', v)}
										placeholder="Courier company" />
									<Input value={form.courier_tracking} onChange={(v: string) => patch('courier_tracking', v)}
										placeholder="Courier tracking no." />
								</div>
							)}
						</SectionCard>

						{/* ── DESTINATION ── */}
						<SectionCard id="destination" title="Destination" icon={MapPin}
							active={activeSection === 'destination'} onActivate={() => setActiveSection('destination')}>
							<Input value={form.destination_label} onChange={(v: string) => patch('destination_label', v)}
								placeholder="Location label (e.g. Home, Shop, Warehouse)" />
							<Input value={form.destination_line_1} onChange={(v: string) => patch('destination_line_1', v)}
								placeholder="Address line 1 — street, building, house number" error={errors.destination_line_1} />
							<Input value={form.destination_line_2} onChange={(v: string) => patch('destination_line_2', v)}
								placeholder="Address line 2 — landmark, area (optional)" />
							<div className="grid grid-cols-2 gap-4">
								<Input value={form.destination_city} onChange={(v: string) => patch('destination_city', v)}
									placeholder="City (e.g. Kano)" error={errors.destination_city} />
								<Combobox placeholder="State" value={form.destination_state}
									onChange={value => patch('destination_state', value)} options={NIGERIAN_STATES_OPTION} />
							</div>
						</SectionCard>

						{/* ── PACKAGE ── */}
						<SectionCard id="package" title="Package Contents" icon={Package}
							active={activeSection === 'package'} onActivate={() => setActiveSection('package')}>

							<div className="grid grid-cols-2 gap-4">
								<Input value={form.package_count} onChange={(v: string) => patch('package_count', v)}
									type="number" placeholder="Package count" suffix={<span className="text-xs">pcs</span>} />
								<Input value={form.package_weight} onChange={(v: string) => patch('package_weight', v)}
									type="number" placeholder="Weight"
									prefix={<Weight fontSize={14} />} suffix={<span className="text-xs">kg</span>} />
							</div>

							<Input value={form.package_description} onChange={(v: string) => patch('package_description', v)}
								placeholder="Package description" />
						</SectionCard>

						{/* ── FINANCIAL ── */}
						<SectionCard id="financial" title="Financial" icon={DollarSign}
							active={activeSection === 'financial'} onActivate={() => setActiveSection('financial')}>
							<div className="grid grid-cols-2 gap-4">
								<Input value={form.delivery_fee} onChange={(v: string) => patch('delivery_fee', v)}
									type="number" prefix="₦" placeholder="Delivery fee" />
								<Input value={form.cod_amount} onChange={(v: string) => patch('cod_amount', v)}
									type="number" prefix="₦" placeholder="Cash on delivery" />
							</div>
							<Toggle
								checked={form.is_paid}
								onChange={(v: boolean) => patch('is_paid', v)}
								label="Delivery fee paid"
								description="Customer has paid the delivery charge"
							/>
						</SectionCard>

						{/* ── SCHEDULE ── */}
						<SectionCard id="schedule" title="Schedule" icon={Calendar}
							active={activeSection === 'schedule'} onActivate={() => setActiveSection('schedule')}>
							<div className="grid grid-cols-2 gap-4">
								<Input suffix={<Calendar16Regular fontSize={14} />} type="date" value={form.scheduled_date} onChange={(v: any) => patch('scheduled_date', v)} />
								<Input suffix={<Clock16Regular fontSize={14} />} type="time" value={form.scheduled_time} onChange={(v: any) => patch('scheduled_time', v)} />
							</div>
						</SectionCard>

						{/* ── NOTES ── */}
						<SectionCard id="notes" title="Notes" icon={FileText}
							active={activeSection === 'notes'} onActivate={() => setActiveSection('notes')}>
							<Textarea value={form.notes} onChange={(v: string) => patch('notes', v)}
								placeholder="Special instructions, access codes, gate info, customer preferences…" rows={4} />
						</SectionCard>

						{/* ── Save bar ── */}
						<div className="sticky bottom-0 -mx-6 px-6 py-4 bg-bg-base/90 backdrop-blur-md border-t border-bg-border flex items-center justify-between gap-4">
							<Button variant="secondary" onClick={() => navigate(-1)}
								// className="flex items-center gap-2 px-4 py-2.5 border border-bg-border text-ink-secondary hover:text-ink-primary text-sm font-body transition-all">
							>
								<ChevronLeft fontSize={18} />Cancel
							</Button>
							<div className="flex items-center gap-3">
								{Object.keys(errors).length > 0 && (
									<p className="text-xs text-accent-red font-body flex items-center gap-1">
										<AlertCircle fontSize={14} />Fix errors first
									</p>
								)}
								{saved && (
									<div className="flex items-center gap-1.5 text-accent-teal text-sm font-body animate-fade-in">
										<Check fontSize={24} />Saved!
									</div>
								)}
								<Button variant="accent" onClick={handleSave} disabled={saving}
									className="flex items-center gap-2 px-6 py-2.5 bg-accent-gold/15 border border-accent-gold/30 text-accent-gold text-sm font-mono font-medium hover:bg-accent-gold/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
									{saving
										? <><Loader2 fontSize={18} className="animate-spin" />Saving…</>
										: <><Save fontSize={18} />{isEdit ? 'Update Delivery' : 'Create Delivery'}</>
									}
								</Button>
							</div>
						</div>

					</div>
				</main>
			</div>
		</div>
	)
}
