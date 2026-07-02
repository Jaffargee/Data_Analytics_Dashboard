import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/ui/Sidebar';
import Overview from './pages/Overview';
import Customers from './pages/Customers';
import Profile from './pages/Customers/Profile';
import Customer from './pages/Customers/Customer';
import CustomerSales from './pages/Customers/Sales';
import CustomerFormPage from './pages/Customers/Create';
import { FluentProvider, teamsDarkTheme, } from '@fluentui/react-components';
import SearchEngine from './pages/SearchEngine.tsx';

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
            <FluentProvider theme={teamsDarkTheme}>
                  <div className="flex min-h-screen bg-bg-base">
                        <Sidebar />
                        <div className="flex-1 flex flex-col min-w-0">
                              <Routes>
                                    {/* Dashboard */}
                                    <Route path="/" element={<Overview />} />
                                    <Route path="/search" element={<SearchEngine />} />
                                    <Route path="/customers" element={<Customers />} />
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
                              
                                    <Route path="*" element={<NotFound />} />
                              </Routes>
                        </div>
                  </div>
            </FluentProvider>
      );
}
