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
import { Avatar } from "@fluentui/react-components";
import NavItem from './NavItem';

const nav = [
      {
            group: 'Analytics',
            items: [
                  { label: 'Overview', icon: LayoutDashboard, path: '/' },
                  { label: 'Revenue', icon: TrendingUp, path: '/revenue' },
                  { label: 'Reports', icon: FileBarChart, path: '/reports' },
                  { label: 'Business Health', icon: TrendingUp, path: '/rev_intel' },
                  { label: 'Analytics', icon: TrendingUp, path: '/analytics' },
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
                              <Avatar activeAppearance='shadow' active='active' color='neutral' name='Tahir General' shape='circular' size={36} />
                              <div className='flex flex-col'>
                                    <div className="font-display font-semibold text-sm text-ink-primary leading-tight">
                                          Tahir General
                                    </div>
                                    <div className="font-body text-[12px] text-ink-subtle leading-tight">
                                          Analytics Suite
                                    </div>
                              </div>
                        </div>
                  </div>

                  {/* Nav groups */}
                  <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
                        {nav.map((group) => (
                              <div key={group.group}>
                                    <div className="px-4 mb-1 text-[12px] font-mono uppercase text-ink-subtle">
                                          {group.group}
                                    </div>
                                    <div className="space-y-0.5">
                                          {group.items.map(
                                                ({
                                                      label,
                                                      icon,
                                                      path,
                                                }) => {
                                                      const active = isActive(path);
                                                      return (
                                                            <NavItem key={path} active={active} path={path} label={label} icon={icon} />
                                                      );
                                                }
                                          )}
                                    </div>
                              </div>
                        ))}
                  </nav>

                  {/* Footer */}
                  <div className="p-3 border-t border-bg-border">
                        <NavItem key={'/settings'} active={isActive('/settings')} path={'/settings'} label={'Settings'} icon={Settings} />
                        <div className="text-[10px] text-ink-faint font-mono px-3 pt-2">
                              v1.0.0 — Supabase
                        </div>
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
