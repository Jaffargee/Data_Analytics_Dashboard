import { Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/ui/layout/Sidebar';
import Overview from '@/pages/Overview';
import Customers from '@/pages/Customers';
import CustomerProfile from '@/pages/Customers/Customer';
import CustomerSales from '@/pages/Customers/Sales';
import Products from '@/pages/Products';
import Product from '@/pages/Products/Product';
import ProductForm from '@/pages/Products/Create';
import Analytics from '@/pages/Analytics';
import Reports from '@/pages/Reports';
import RevIntelligence from '@/pages/RevIntelligence';
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { FluentProvider, teamsDarkTheme, } from '@fluentui/react-components';

export const queryClient = new QueryClient();

function NotFound() {
      return (
            <div className="flex-1 flex items-center justify-center flex-col gap-4 text-ink-muted">
                  <span className="font-display text-5xl font-bold text-ink-faint">404</span>
                  <p className="font-body text-sm">Page not found</p>
            </div>
      );
}

export default function App() {
      return (
            <QueryClientProvider client={queryClient}>
                  <FluentProvider theme={teamsDarkTheme}>
                        <div className="flex min-h-screen bg-bg-base">
                              <Sidebar />
                              <div className="flex-1 flex flex-col min-w-0">
                                    <Routes>
                                          <Route path="/" element={<Overview />} />
                                          <Route path="/analytics" element={<Analytics />} />
                                          <Route path="/reports" element={<Reports />} />
                                          <Route path="/rev_intel" element={<RevIntelligence />} />
                                          <Route path="/customers" element={<Customers />} />
                                          <Route path="/customers/customer/:id" element={<CustomerProfile />} />
                                          <Route path="/customers/customer/:id/sales" element={<CustomerSales />} />
                                          <Route path="/products" element={<Products />} />
                                          <Route path="/products/new" element={<ProductForm />} />
                                          <Route path="/products/:pos_item_id" element={<Product />} />

                                          <Route path="*" element={<NotFound />} />
                                    </Routes>
                              </div>
                        </div>
                  </FluentProvider>
            </QueryClientProvider>
      );
}
