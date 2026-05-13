import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/ui/Sidebar';
import OverviewPage from '@/pages/Overview';
import RevenuePage from '@/pages/Revenue';
import ProductsPage from '@/pages/Products';
import CustomersPage from '@/pages/Customers';
import ProductFormPage from '@/pages/Products/Create';
import CustomerFormPage from '@/pages/Customers/Create';
import SuppliersPage from '@/pages/Suppliers';
import StaffPage from '@/pages/Staff';
import StockPage from '@/pages/LowStock';
import SearchEnginePage from '@/pages/SearchEngine';
import AIAnalyticsChat from '@/pages/AIDataAnalyticsChat';
import ReportGenerator from '@/pages/ReportGenerator';
import NigeriaIntelMap from './pages/Map';
import Customer from './pages/Customers/Customer';
import CustomerSales from './pages/Customers/Sales';
import Profile from './pages/Customers/Profile';
// import WhatsAppTracker    from "@/pages/WhatsAppPostTracker";

function NotFound() {
      return (
            <div className="flex-1 flex items-center justify-center flex-col gap-3 text-ink-muted">
                  <span className="font-display text-5xl font-bold text-ink-faint">
                        404
                  </span>
                  <p className="font-body text-sm">Page not found</p>
            </div>
      );
}

export default function App() {
      return (
            <div className="flex min-h-screen bg-bg-base">
                  <Sidebar />
                  <div className="flex-1 flex flex-col min-w-0">
                        <Routes>
                              {/* Dashboard */}
                              <Route path="/" element={<OverviewPage />} />
                              <Route
                                    path="/revenue"
                                    element={<RevenuePage />}
                              />

                              {/* Products */}
                              <Route
                                    path="/products"
                                    element={<ProductsPage />}
                              />
                              <Route
                                    path="/products/new"
                                    element={<ProductFormPage />}
                              />
                              <Route
                                    path="/products/:id/edit"
                                    element={<ProductFormPage />}
                              />

                              {/* Customers */}
                              <Route
                                    path="/customers"
                                    element={<CustomersPage />}
                              />
                              <Route
                                    path="/customers/customer/profile/:id"
                                    element={<Profile />}
                              />
                              <Route
                                    path="/customers/customer/:id/sales/:p_id"
                                    element={<CustomerSales />}
                              />
                              <Route
                                    path="/customers/customer/:id"
                                    element={<Customer />}
                              />
                              <Route
                                    path="/customers/new"
                                    element={<CustomerFormPage />}
                              />
                              <Route
                                    path="/customers/:id/edit"
                                    element={<CustomerFormPage />}
                              />

                              {/* Other sections */}
                              <Route
                                    path="/suppliers"
                                    element={<SuppliersPage />}
                              />
                              <Route path="/staff" element={<StaffPage />} />
                              <Route path="/stock" element={<StockPage />} />

                              {/* AI & Tools */}
                              <Route
                                    path="/search"
                                    element={<SearchEnginePage />}
                              />
                              <Route
                                    path="/chat"
                                    element={<AIAnalyticsChat />}
                              />
                              <Route
                                    path="/reports"
                                    element={<ReportGenerator />}
                              />
                              <Route
                                    path="/map"
                                    element={<NigeriaIntelMap />}
                              />

                              <Route path="*" element={<NotFound />} />
                        </Routes>
                  </div>
            </div>
      );
}
