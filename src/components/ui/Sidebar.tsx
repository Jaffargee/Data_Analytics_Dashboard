import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, TrendingUp, Package, Users, Truck,
  AlertTriangle, UserCheck, Settings, ChevronRight,
  Search,
} from "lucide-react";

const nav = [
  { label: "Overview",    icon: LayoutDashboard, path: "/" },
  { label: "Revenue",     icon: TrendingUp,      path: "/revenue" },
  { label: "Products",    icon: Package,         path: "/products" },
  { label: "Customers",   icon: Users,           path: "/customers" },
  { label: "Suppliers",   icon: Truck,           path: "/suppliers" },
  { label: "Staff",       icon: UserCheck,       path: "/staff" },
  { label: "Low Stock",   icon: AlertTriangle,   path: "/stock" },
  { label: "Search Engine",   icon: Search,   path: "/search" },
];

export function Sidebar() {
  const location = useLocation();
  return (
    <aside className="w-56 flex-shrink-0 bg-bg-panel border-r border-bg-border flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-bg-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center">
            <span className="text-accent-gold font-display font-bold text-xs">T</span>
          </div>
          <div>
            <p className="font-display font-semibold text-sm text-ink-primary leading-tight">Tahir General</p>
            <p className="font-body text-[10px] text-ink-muted leading-tight">Analytics Suite</p>
          </div>
        </div>
      </div>

      {/* Live indicator */}
      <div className="px-5 py-3 border-b border-bg-border">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse-dot" />
          <span className="text-[10px] font-mono text-ink-muted uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, icon: Icon, path }) => {
          const active = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
          return (
            <NavLink key={path} to={path}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all duration-200 group",
                active
                  ? "bg-accent-gold/10 text-accent-gold border border-accent-gold/20"
                  : "text-ink-secondary hover:text-ink-primary hover:bg-bg-hover"
              )}>
                <Icon size={15} className={cn("flex-shrink-0", active ? "text-accent-gold" : "text-ink-muted group-hover:text-ink-secondary")} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={12} className="text-accent-gold/60" />}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-bg-border">
        <NavLink to="/settings">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-ink-muted hover:text-ink-primary hover:bg-bg-hover transition-all">
            <Settings size={15} />
            <span>Settings</span>
          </div>
        </NavLink>
        <p className="text-[10px] text-ink-faint font-mono px-3 pt-2">v1.0.0 — Supabase</p>
      </div>
    </aside>
  );
}
