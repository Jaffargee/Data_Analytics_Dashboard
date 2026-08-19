import { TopBar } from "../../components/ui/TopBar";
import { TopCustomer } from '@/hooks/data/';
import { useTopCustomers } from '@/hooks/data/';
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/ui/primitives/StatCard"
import { Award, Clock, ShoppingBag, Users, Plus } from "lucide-react";
import { fmt, fmtCurrency } from "../../lib/utils";
import Charts from "./components/Charts";
import Table from "./components/Table";
import SearchInput from '../../components/ui/SearchInput';
import Button from '../../components/ui/Button';
import TableSearch from '../../components/ui/TableSearch';
import { ctm_category } from '../../constants';
import Fuse from 'fuse.js';


// Fuse Config
const options = {
      keys: ["customer_name", "category"],
      threshold: 0.4, 
}

export default function Customer() {
      const customers = useTopCustomers(1000);
      const [searchQuery, setSearchQuery] = useState<string>('');
      const [filterQuery, setFilterQuery] = useState<string>('ALL');
      const navigate = useNavigate();

      const all: TopCustomer[] = customers.data?.data ?? [];

      const totalRevenue = all.reduce((s, c: TopCustomer) => s + Number(c.lifetime_value), 0);

      const totalPurchases = all.reduce((s, c: TopCustomer) => s + Number(c.total_purchases), 0);
      
      const avgLTV = all.length ? totalRevenue / all.length : 0;

      const top10Chart = all.slice(0, 10).map((c: TopCustomer) => ({
            label: c.customer_name.split(' ')[0],
            value: Number(c.lifetime_value),
      }));

      const freq = { once: 0, repeat: 0, loyal: 0 };
      all.forEach((c: TopCustomer) => {
            const n = Number(c.total_purchases);
            if (n === 1) freq.once++;
            else if (n <= 5) freq.repeat++;
            else freq.loyal++;
      });


      // Fuse Searching

      const fuse = useMemo(() => new Fuse(all, options), [all]);

      const results = useMemo(() => {
            let filtered = all;
            if (filterQuery !== 'ALL') {
                  filtered = filtered.filter(c => c.category === filterQuery);
            }
            if (searchQuery && searchQuery.length > 0) {
                  return new Fuse(filtered, options).search(searchQuery).map(r => r.item);
            }
            return filtered;
      }, [searchQuery, filterQuery, all]);


      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar 
                        title="Customers"
                        subtitle="Lifetime value and purchase analysis"
                  />
                  <main className="flex-1 space-y-6">

                        {/* KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 px-6 py-4">
                              <StatCard
                                    label="Total Customers"
                                    value={fmt(all.length)}
                                    icon={<Users size={14} />}
                                    accent="gold"
                                    delay={0}
                              />
                              <StatCard
                                    label="Total Purchases"
                                    value={fmt(totalPurchases)}
                                    icon={<ShoppingBag size={14} />}
                                    accent="teal"
                                    delay={100}
                              />
                              <StatCard
                                    label="Avg Lifetime Value"
                                    value={fmtCurrency(avgLTV)}
                                    icon={<Award size={14} />}
                                    accent="purple"
                                    delay={200}
                              />
                              <StatCard
                                    label="Repeat Customers"
                                    value={fmt(freq.repeat + freq.loyal)}
                                    icon={<Clock size={14} />}
                                    accent="gold"
                                    delay={300}
                              />
                        </div>

                        <Charts customers={customers} />

                        <TableSearch 
                              search={searchQuery} 
                              filterValue={filterQuery} 
                              title="New Customer" 
                              buttonIcon={Plus} 
                              setFilter={setFilterQuery} 
                              setSearch={setSearchQuery} 
                              filterOption={ctm_category} 
                              withButton 
                              withFilter  
                        />

                        <Table customers={results} />

                  </main>
            </div>
      )
}
