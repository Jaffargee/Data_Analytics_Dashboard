import { DeliveryForm, DeliveryMethod, DeliveryPriority, DeliveryStatus } from "./types";
import { 
      CalendarMonth24Regular as Calendar,
      Money24Regular as DollarSign,
      DocumentText24Regular as FileText,
      Location24Regular as MapPin,
      Box24Regular as Package,
      VehicleTruck24Regular as Truck,
      Person24Regular as User
} from "@fluentui/react-icons";


// ── Constants ─────────────────────────────────────────────────
export const EMPTY: DeliveryForm = {
	customer_id: '', customer_name: '', customer_phone: '', pos_sale_id: '',
	method: 'LOCAL_DELIVERY', priority: 'STANDARD', status: 'PENDING',
	destination_label: '', destination_line_1: '', destination_line_2: '',
	destination_city: '', destination_state: '', destination_country: 'Nigeria',
	assigned_to: '', courier_name: '', courier_tracking: '', vehicle_info: '',
	package_description: '', package_weight: '', package_count: '1',
	delivery_fee: '0', is_paid: false, cod_amount: '',
	scheduled_date: '', scheduled_time: '', notes: '',
}

export const METHODS: { id: DeliveryMethod; label: string; icon: React.ElementType; desc: string }[] = [
	{ id: 'PICKUP',         label: 'Pickup',        icon: User,    desc: 'Customer collects' },
	{ id: 'LOCAL_DELIVERY', label: 'Local',         icon: MapPin,  desc: 'Staff delivers' },
	{ id: 'COURIER',        label: 'Courier',       icon: Package, desc: '3rd party courier' },
	{ id: 'BUS_TRANSPORT',  label: 'Bus',           icon: Truck,   desc: 'Via transport' },
	{ id: 'AGENT',          label: 'Agent',         icon: User,    desc: 'Via agent/rep' },
]

export const PRIORITIES: { id: DeliveryPriority; label: string; color: string }[] = [
	{ id: 'STANDARD', label: 'Standard', color: 'text-ink-secondary border-bg-border bg-bg-hover' },
	{ id: 'EXPRESS',  label: 'Express',  color: 'text-accent-gold border-accent-gold/30 bg-accent-gold/10' },
	{ id: 'URGENT',   label: 'Urgent',   color: 'text-accent-red border-accent-red/30 bg-accent-red/10' },
]

export const STATUSES: DeliveryStatus[] = [
	'PENDING','CONFIRMED','PACKED','DISPATCHED',
	'IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED','FAILED','RETURNED','CANCELLED',
]

export const NIGERIAN_STATES = [
	'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
	'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
	'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
	'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
	'Yobe','Zamfara',
]

type Option = { value: string; label: string };
export const NIGERIAN_STATES_OPTION: Option[] = [
      { value: 'abia', label: 'Abia' },
      { value: 'adamawa', label: 'Adamawa' },
      { value: 'akwa_ibom', label: 'Akwa Ibom' },
      { value: 'anambra', label: 'Anambra' },
      { value: 'bauchi', label: 'Bauchi' },
      { value: 'bayelsa', label: 'Bayelsa' },
      { value: 'benue', label: 'Benue' },
      { value: 'borno', label: 'Borno' },
      { value: 'cross_river', label: 'Cross River' },
      { value: 'delta', label: 'Delta' },
      { value: 'ebonyi', label: 'Ebonyi' },
      { value: 'edo', label: 'Edo' },
      { value: 'ekiti', label: 'Ekiti' },
      { value: 'enugu', label: 'Enugu' },
      { value: 'fct', label: 'FCT' },
      { value: 'gombe', label: 'Gombe' },
      { value: 'imo', label: 'Imo' },
      { value: 'jigawa', label: 'Jigawa' },
      { value: 'kaduna', label: 'Kaduna' },
      { value: 'kano', label: 'Kano' },
      { value: 'katsina', label: 'Katsina' },
      { value: 'kebbi', label: 'Kebbi' },
      { value: 'kogi', label: 'Kogi' },
      { value: 'kwara', label: 'Kwara' },
      { value: 'lagos', label: 'Lagos' },
      { value: 'nasarawa', label: 'Nasarawa' },
      { value: 'niger', label: 'Niger' },
      { value: 'ogun', label: 'Ogun' },
      { value: 'ondo', label: 'Ondo' },
      { value: 'osun', label: 'Osun' },
      { value: 'oyo', label: 'Oyo' },
      { value: 'plateau', label: 'Plateau' },
      { value: 'rivers', label: 'Rivers' },
      { value: 'sokoto', label: 'Sokoto' },
      { value: 'taraba', label: 'Taraba' },
      { value: 'yobe', label: 'Yobe' },
      { value: 'zamfara', label: 'Zamfara' }
];

export const SECTIONS = [
	{ id: 'customer',   label: 'Customer',    icon: User      },
	{ id: 'delivery',   label: 'Delivery',    icon: Truck     },
	{ id: 'destination',label: 'Destination', icon: MapPin    },
	{ id: 'package',    label: 'Package',     icon: Package   },
	{ id: 'financial',  label: 'Financial',   icon: DollarSign},
	{ id: 'schedule',   label: 'Schedule',    icon: Calendar  },
	{ id: 'notes',      label: 'Notes',       icon: FileText  },
]