import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
      LayoutDashboard,
      TrendingUp,
      Package,
      Users,
      Truck,
      AlertTriangle,
      UserCheck,
      Settings,
      ChevronRight,
      Search,
      MessageSquare,
      FileBarChart,
      MessageCircle,
      Plus,
      Menu,
      X,
      TruckIcon,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

const nav = [
      {
            group: 'Analytics',
            items: [
                  { label: 'Overview', icon: LayoutDashboard, path: '/' },
                  { label: 'Revenue', icon: TrendingUp, path: '/revenue' },
                  { label: 'Reports', icon: FileBarChart, path: '/reports' },
            ],
      },
      {
            group: 'Inventory',
            items: [
                  { label: 'Products', icon: Package, path: '/products' },
                  { label: 'Low Stock', icon: AlertTriangle, path: '/stock' },
                  { label: 'Suppliers', icon: Truck, path: '/suppliers' },
            ],
      },
      {
            group: 'People',
            items: [
                  { label: 'Customers', icon: Users, path: '/customers' },
                  { label: 'Staff', icon: UserCheck, path: '/staff' },
            ],
      },
      {
            group: 'AI Tools',
            items: [
                  { label: 'Search', icon: Search, path: '/search' },
                  { label: 'AI Analyst', icon: MessageCircle, path: '/chat' },
                  { label: 'WA Posts', icon: MessageSquare, path: '/posts' },
            ],
      },
      {
            group: 'Others',
            items: [
                  { label: 'Delivery', icon: TruckIcon, path: '/delivery' },
            ],
      },
];

const quickActions = [
      { label: 'New Customer', path: '/customers/new' },
      { label: 'New Product', path: '/products/new' },
];

interface SidebarContentProps {
      onClose?: () => void;
}

function SidebarContent({ onClose }: SidebarContentProps) {
      const location = useLocation();

      const isActive = (path: string) =>
            path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(path);

      return (
            <div className="w-full flex-shrink-0 bg-bg-panel border-r border-bg-border flex flex-col h-full overflow-hidden">
                  {/* Brand */}
                  <div className="px-5 py-5 border-b border-bg-border">
                        <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center">
                                    <span className="text-accent-gold font-display font-bold text-xs">
                                          T
                                    </span>
                              </div>
                              <div>
                                    <p className="font-display font-semibold text-sm text-ink-primary leading-tight">
                                          Tahir General
                                    </p>
                                    <p className="font-body text-[10px] text-ink-muted leading-tight">
                                          Analytics Suite
                                    </p>
                              </div>
                        </div>
                  </div>

                  {/* Live indicator */}
                  <div className="px-5 py-2.5 border-b border-bg-border">
                        <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse-dot" />
                              <span className="text-[10px] font-mono text-ink-muted uppercase tracking-widest">
                                    Live
                              </span>
                        </div>
                  </div>

                  {/* Quick actions */}
                  <div className="px-3 py-3 border-b border-bg-border flex gap-2">
                        {quickActions.map((a) => (
                              <NavLink
                                    key={a.path}
                                    to={a.path}
                                    className="flex-1"
                                    onClick={onClose}
                              >
                                    <div className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-accent-gold/10 border border-accent-gold/20 hover:bg-accent-gold/20 transition-all">
                                          <Plus
                                                size={10}
                                                className="text-accent-gold"
                                          />
                                          <span className="text-[10px] font-mono text-accent-gold truncate">
                                                {a.label.replace('New ', '')}
                                          </span>
                                    </div>
                              </NavLink>
                        ))}
                  </div>

                  {/* Nav groups */}
                  <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
                        {nav.map((group) => (
                              <div key={group.group}>
                                    <p className="px-3 mb-1 text-[9px] font-mono uppercase tracking-[0.15em] text-ink-faint">
                                          {group.group}
                                    </p>
                                    <div className="space-y-0.5">
                                          {group.items.map(
                                                ({
                                                      label,
                                                      icon: Icon,
                                                      path,
                                                }) => {
                                                      const active =
                                                            isActive(path);
                                                      return (
                                                            <NavLink
                                                                  key={path}
                                                                  to={path}
                                                                  onClick={
                                                                        onClose
                                                                  }
                                                            >
                                                                  <div
                                                                        className={cn(
                                                                              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all duration-200 group',
                                                                              active
                                                                                    ? 'bg-accent-gold/10 text-accent-gold border border-accent-gold/20'
                                                                                    : 'text-ink-secondary hover:text-ink-primary hover:bg-bg-hover'
                                                                        )}
                                                                  >
                                                                        <Icon
                                                                              size={
                                                                                    14
                                                                              }
                                                                              className={cn(
                                                                                    'flex-shrink-0 transition-colors',
                                                                                    active
                                                                                          ? 'text-accent-gold'
                                                                                          : 'text-ink-muted group-hover:text-ink-secondary'
                                                                              )}
                                                                        />
                                                                        <span className="flex-1 truncate">
                                                                              {
                                                                                    label
                                                                              }
                                                                        </span>
                                                                        {active && (
                                                                              <ChevronRight
                                                                                    size={
                                                                                          11
                                                                                    }
                                                                                    className="text-accent-gold/60 flex-shrink-0"
                                                                              />
                                                                        )}
                                                                  </div>
                                                            </NavLink>
                                                      );
                                                }
                                          )}
                                    </div>
                              </div>
                        ))}
                  </nav>

                  {/* Footer */}
                  <div className="p-3 border-t border-bg-border">
                        <NavLink to="/settings" onClick={onClose}>
                              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-ink-muted hover:text-ink-primary hover:bg-bg-hover transition-all">
                                    <Settings size={14} />
                                    <span>Settings</span>
                              </div>
                        </NavLink>
                        <p className="text-[10px] text-ink-faint font-mono px-3 pt-2">
                              v1.0.0 — Supabase
                        </p>
                  </div>
            </div>
      );
}

export function Sidebar() {
      return (
            <aside className="hidden lg:flex w-56 flex-shrink-0 h-screen sticky top-0">
                  <SidebarContent />
            </aside>
      );
}

export function MobileSideBar() {
      return (
            <Dialog.Root>
                  <Dialog.Trigger asChild>
                        <button
                              aria-label="Open menu"
                              className="lg:hidden relative p-2 rounded-lg bg-bg-panel border border-bg-border hover:bg-bg-hover transition-colors"
                        >
                              <Menu size={20} className="text-ink-primary" />
                        </button>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                        <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[300px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-300">
                              <SidebarContent />
                              <Dialog.Close className="absolute top-4 right-4 p-1 rounded-lg bg-bg-panel border border-bg-border hover:bg-bg-hover transition-colors">
                                    <X size={16} className="text-ink-primary" />
                              </Dialog.Close>
                        </Dialog.Content>
                  </Dialog.Portal>
            </Dialog.Root>
      );
}
