import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/primitives';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import { fmtCurrency, fmt, fmtDate } from '@/lib/utils';
import type {
      DeadStockReportRow,
      SlowMovingStockRow,
      LowStockItem,
      SupplierStockValue,
} from '@/hooks/data';

function LastSold({ isoDate }: { isoDate: string | null }) {
      if (!isoDate) {
            return <span className="text-xs font-mono text-ink-faint">Never</span>;
      }
      return <span className="text-xs font-mono text-ink-secondary">{fmtDate(isoDate)}</span>;
}

function TableSkeleton() {
      return <div className="mx-6 h-40 bg-bg-hover animate-pulse rounded-lg" />;
}

// ── Dead Stock ────────────────────────────────────
interface DeadStockTableProps {
      data: DeadStockReportRow[];
      loading: boolean;
}

export function DeadStockTable({ data, loading }: DeadStockTableProps) {
      const navigate = useNavigate();

      const columns: ColumnDef<DeadStockReportRow>[] = [
            {
                  key: 'item_name',
                  label: 'Item',
                  width: '2fr',
                  render: (row) => (
                        <div className="min-w-0">
                              <p className="text-xs font-body text-ink-primary group-hover:text-accent-gold transition-colors truncate">
                                    {row.item_name}
                              </p>
                              <p className="text-[10px] text-ink-muted font-body">{row.category}</p>
                        </div>
                  ),
            },
            {
                  key: 'days_dead',
                  label: 'Days Dead',
                  sortable: true,
                  align: 'right',
                  width: '1fr',
                  sortValue: (row) => Number(row.days_dead) || 0,
                  render: (row) => <span className="text-xs font-mono text-ink-secondary">{fmt(row.days_dead)}</span>,
            },
            {
                  key: 'last_sold_at',
                  label: 'Last Sold',
                  width: '1.2fr',
                  render: (row) => <LastSold isoDate={row.last_sold_at} />,
            },
            {
                  key: 'dead_stock_cost_value',
                  label: 'Cost Value',
                  sortable: true,
                  align: 'right',
                  width: '1.3fr',
                  sortValue: (row) => Number(row.dead_stock_cost_value) || 0,
                  render: (row) => (
                        <span className="text-xs font-mono text-accent-red font-medium">
                              {fmtCurrency(row.dead_stock_cost_value)}
                        </span>
                  ),
            },
            {
                  key: 'dead_stock_retail_value',
                  label: 'Retail Value',
                  sortable: true,
                  align: 'right',
                  width: '1.3fr',
                  sortValue: (row) => Number(row.dead_stock_retail_value) || 0,
                  render: (row) => (
                        <span className="text-xs font-mono text-ink-secondary">
                              {fmtCurrency(row.dead_stock_retail_value)}
                        </span>
                  ),
            },
            {
                  key: 'revival_watch_status',
                  label: 'Status',
                  width: '1.7fr',
                  render: (row) => (
                        <Badge variant={row.revival_watch_status === 'NO MOVEMENT' ? 'red' : 'gold'}>
                              {row.revival_watch_status}
                        </Badge>
                  ),
            },
      ];

      return (
            <section className="space-y-3">
                  <p className="px-6 text-xs text-ink-muted font-body">
                        Items with no qualifying sales — capital tied up on the shelf
                  </p>
                  {loading ? (
                        <TableSkeleton />
                  ) : (
                        <DataTable
                              data={data}
                              columns={columns}
                              getRowId={(row) => row.pos_item_id}
                              ariaLabel="Dead stock"
                              emptyMessage="No dead stock — every item has moved recently."
                              defaultSortKey="dead_stock_cost_value"
                              defaultSortDir="desc"
                              onRowClick={(row) => navigate(`/products/${row.pos_item_id}`)}
                        />
                  )}
            </section>
      );
}

// ── Slow-Moving Stock ────────────────────────────────────
interface SlowStockTableProps {
      data: SlowMovingStockRow[];
      loading: boolean;
}

export function SlowStockTable({ data, loading }: SlowStockTableProps) {
      const navigate = useNavigate();

      const columns: ColumnDef<SlowMovingStockRow>[] = [
            {
                  key: 'item_name',
                  label: 'Item',
                  width: '2fr',
                  render: (row) => (
                        <div className="min-w-0">
                              <p className="text-xs font-body text-ink-primary group-hover:text-accent-gold transition-colors truncate">
                                    {row.item_name}
                              </p>
                              <p className="text-[10px] text-ink-muted font-body">{row.category}</p>
                        </div>
                  ),
            },
            {
                  key: 'days_since_last_sale',
                  label: 'Days Idle',
                  sortable: true,
                  align: 'right',
                  width: '1.1fr',
                  sortValue: (row) => Number(row.days_since_last_sale) || 0,
                  render: (row) => (
                        <span className="text-xs font-mono text-ink-secondary">{fmt(row.days_since_last_sale)}</span>
                  ),
            },
            {
                  key: 'last_sold_at',
                  label: 'Last Sold',
                  width: '1.2fr',
                  render: (row) => <LastSold isoDate={row.last_sold_at} />,
            },
            {
                  key: 'slow_stock_cost_value',
                  label: 'Cost Value',
                  sortable: true,
                  align: 'right',
                  width: '1.3fr',
                  sortValue: (row) => Number(row.slow_stock_cost_value) || 0,
                  render: (row) => (
                        <span className="text-xs font-mono text-accent-gold font-medium">
                              {fmtCurrency(row.slow_stock_cost_value)}
                        </span>
                  ),
            },
      ];

      return (
            <section className="space-y-3">
                  <p className="px-6 text-xs text-ink-muted font-body">
                        Still selling, but slowing down — watch before it goes dead
                  </p>
                  {loading ? (
                        <TableSkeleton />
                  ) : (
                        <DataTable
                              data={data}
                              columns={columns}
                              getRowId={(row) => row.pos_item_id}
                              ariaLabel="Slow-moving stock"
                              emptyMessage="No slow-moving stock right now."
                              defaultSortKey="slow_stock_cost_value"
                              defaultSortDir="desc"
                              onRowClick={(row) => navigate(`/products/${row.pos_item_id}`)}
                        />
                  )}
            </section>
      );
}

// ── Reorder Alerts ────────────────────────────────────
interface ReorderAlertsTableProps {
      data: LowStockItem[];
      loading: boolean;
}

export function ReorderAlertsTable({ data, loading }: ReorderAlertsTableProps) {
      const navigate = useNavigate();

      const columns: ColumnDef<LowStockItem>[] = [
            {
                  key: 'item_name',
                  label: 'Item',
                  width: '2fr',
                  render: (row) => (
                        <div className="min-w-0">
                              <p className="text-xs font-body text-ink-primary group-hover:text-accent-gold transition-colors truncate">
                                    {row.item_name}
                              </p>
                              <p className="text-[10px] text-ink-muted font-body">{row.category}</p>
                        </div>
                  ),
            },
            {
                  key: 'stock_qty',
                  label: 'In Stock',
                  sortable: true,
                  align: 'right',
                  width: '1fr',
                  sortValue: (row) => Number(row.stock_qty) || 0,
                  render: (row) => <span className="text-xs font-mono text-accent-red">{fmt(row.stock_qty)}</span>,
            },
            {
                  key: 'reorder_level',
                  label: 'Reorder At',
                  align: 'right',
                  width: '1.1fr',
                  render: (row) => (
                        <span className="text-xs font-mono text-ink-secondary">{fmt(row.reorder_level)}</span>
                  ),
            },
            {
                  key: 'replenish_level',
                  label: 'Replenish To',
                  align: 'right',
                  width: '1.2fr',
                  render: (row) => (
                        <span className="text-xs font-mono text-ink-secondary">{fmt(row.replenish_level)}</span>
                  ),
            },
      ];

      return (
            <section className="space-y-3">
                  <p className="px-6 text-xs text-ink-muted font-body">
                        Items at or below their reorder level
                  </p>
                  {loading ? (
                        <TableSkeleton />
                  ) : (
                        <DataTable
                              data={data}
                              columns={columns}
                              getRowId={(row) => row.pos_item_id}
                              ariaLabel="Reorder alerts"
                              emptyMessage="Nothing to reorder — or no item has a reorder level set yet. This list stays empty until items.reorder_level is populated."
                              defaultSortKey="stock_qty"
                              defaultSortDir="asc"
                              onRowClick={(row) => navigate(`/products/${row.pos_item_id}`)}
                        />
                  )}
            </section>
      );
}

// ── Supplier Exposure ────────────────────────────────────
interface SupplierExposureTableProps {
      data: SupplierStockValue[];
      loading: boolean;
}

export function SupplierExposureTable({ data, loading }: SupplierExposureTableProps) {
      const columns: ColumnDef<SupplierStockValue>[] = [
            {
                  key: 'supplier_name',
                  label: 'Supplier',
                  width: '2fr',
                  render: (row) => (
                        <span className="text-xs font-body text-ink-primary truncate">{row.supplier_name}</span>
                  ),
            },
            {
                  key: 'num_products',
                  label: 'Products',
                  sortable: true,
                  align: 'right',
                  width: '1fr',
                  sortValue: (row) => Number(row.num_products) || 0,
                  render: (row) => (
                        <span className="text-xs font-mono text-ink-secondary">{fmt(row.num_products)}</span>
                  ),
            },
            {
                  key: 'stock_cost_value',
                  label: 'Stock Cost Value',
                  sortable: true,
                  align: 'right',
                  width: '1.4fr',
                  sortValue: (row) => Number(row.stock_cost_value) || 0,
                  render: (row) => (
                        <span className="text-xs font-mono text-ink-secondary">{fmtCurrency(row.stock_cost_value)}</span>
                  ),
            },
            {
                  key: 'outstanding_balance',
                  label: 'You Owe',
                  sortable: true,
                  align: 'right',
                  width: '1.3fr',
                  sortValue: (row) => Number(row.outstanding_balance) || 0,
                  render: (row) => {
                        const balance = Number(row.outstanding_balance) || 0;
                        return (
                              <Badge variant={balance > 0 ? 'red' : 'muted'}>{fmtCurrency(balance)}</Badge>
                        );
                  },
            },
      ];

      return (
            <section className="space-y-3">
                  <p className="px-6 text-xs text-ink-muted font-body">
                        Stock value and outstanding balance by supplier
                  </p>
                  {loading ? (
                        <TableSkeleton />
                  ) : (
                        <DataTable
                              data={data}
                              columns={columns}
                              getRowId={(row) => row.pos_supplier_id}
                              ariaLabel="Supplier exposure"
                              emptyMessage="No supplier stock data available."
                              defaultSortKey="outstanding_balance"
                              defaultSortDir="desc"
                        />
                  )}
            </section>
      );
}
