
// ── Types ─────────────────────────────────────────────────────
export type DeliveryStatus   = 'PENDING'|'CONFIRMED'|'PACKED'|'DISPATCHED'|'IN_TRANSIT'|'OUT_FOR_DELIVERY'|'DELIVERED'|'FAILED'|'RETURNED'|'CANCELLED'
export type DeliveryMethod   = 'PICKUP'|'LOCAL_DELIVERY'|'COURIER'|'BUS_TRANSPORT'|'AGENT'
export type DeliveryPriority = 'STANDARD'|'EXPRESS'|'URGENT'

export interface Delivery {
	id: string

	created_at: string // ISO timestamp
	updated_at: string // ISO timestamp

	// Customer
	customer_id: string | null
	customer_name: string
	customer_phone: string | null
	pos_sale_id: string | null
	driver_phone: string | null
	// Delivery
	method: DeliveryMethod
	priority: DeliveryPriority
	status: DeliveryStatus

	// Destination
	destination_label: string | null
	destination_line_1: string | null
	destination_line_2: string | null
	destination_city: string
	destination_state: string
	destination_country: string

	// Logistics
	assigned_to: string | null

	// Package
	package_description: string | null
	package_weight: number | null
	package_count: number

	// Financial
	delivery_fee: number
	is_paid: boolean

	// Tracking Timeline
	dispatched_at: string | null
	delivered_at: string | null

	// Additional Information
	notes: string | null
	failure_reason: string | null
}

export interface DeliveryItem {
	_key:      string
	id?:       string
	item_name: string
	quantity:  number
	notes:     string
}

export interface DeliveryForm {
	// Customer
	customer_id:    string
	customer_name:  string
	customer_phone: string
	pos_sale_id:    string
	// Driver
	driver_phone?: string
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
	// Package
	package_description: string
	package_weight:      string
	package_count:       string
	// Financial
	delivery_fee:  string
	is_paid:       boolean
	notes:          string
}

export interface CustomerSuggestion {
	id:           string
	name:         string
	pos_customer_id: number
	phone_number: string | null
	company_name: string | null
}

export interface DeliveryItemRowProps {
      item: DeliveryItem;
      onChange: (i: DeliveryItem) => void
      onRemove: () => void;
      showRemove: boolean
}

export interface CustomerSearchProps {
      value: string
      onSelect: (c: CustomerSuggestion) => void
}
