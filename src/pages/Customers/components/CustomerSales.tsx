import DataTable, { ColumnDef } from '../../../components/ui/DataTable';
import TableSearch from '../../../components/ui/TableSearch';
import useCustomerSalesData from "../ctmSalesData"
import {
      Plus,
} from 'lucide-react';

export default function CustomerSales () {
      
      const { chartData, navigate, ctm_name, loading, filtered, columns, query, filter, setFilter, setQuery, ctm_category } = useCustomerSalesData();

	return (
		<div>
                  <TableSearch
                        search={query}
                        filterValue={filter}
                        title="Add Sale"
                        buttonIcon={Plus}
                        setFilter={setFilter}
                        setSearch={setQuery}
                        filterOption={ctm_category}
                        withButton
                        withFilter
                  />
	            <DataTable
	                  data={filtered}
	                  columns={columns}
	                  getRowId={(row) => row.pos_sale_id}
	                  onRowClick={(row) =>
	                        navigate(`/customers/customer/${row.pos_customer_id}/sales/${row.pos_sale_id}?ctm_name=${ctm_name}`)
	                  }
	                  ariaLabel="Customer sales table"
	                  emptyMessage="No sales match your search"
	                  defaultSortKey="invoice_datetime"
	                  defaultSortDir="desc"
	            />
      	</div>
	)
}