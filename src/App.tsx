import React from "react";
import { Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/ui/Sidebar";
import OverviewPage  from "@/pages/Overview";
import RevenuePage   from "@/pages/Revenue";
import ProductsPage  from "@/pages/Products";
import CustomersPage from "@/pages/Customers";
import SuppliersPage from "@/pages/Suppliers";
import StaffPage     from "@/pages/Staff";
import StockPage     from "@/pages/LowStock";
import SearchEngine from "./pages/SearchEngine";
import AIDataAnalyticsChat from "./pages/AIDataAnalyticsChat";

function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-3 text-ink-muted">
      <span className="font-display text-5xl font-bold text-ink-faint">404</span>
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
          <Route path="/"          element={<OverviewPage />}  />
          <Route path="/revenue"   element={<RevenuePage />}   />
          <Route path="/products"  element={<ProductsPage />}  />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/staff"     element={<StaffPage />}     />
          <Route path="/stock"     element={<StockPage />}     />
          <Route path="/search"     element={<SearchEngine />}     />
          <Route path="/chat"     element={<AIDataAnalyticsChat />}     />
          <Route path="*"          element={<NotFound />}      />
        </Routes>
      </div>
    </div>
  );
}
