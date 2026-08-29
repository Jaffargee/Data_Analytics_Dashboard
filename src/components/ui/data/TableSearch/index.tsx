import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowLeft, Search } from 'lucide-react';
import SearchInput from '@/components/ui/data/SearchInput';
import Button from '@/components/ui/controls/Button';
import Select from '@/components/ui/controls/Select';
import type { Option } from '@/types/ui';

interface TableSearchProps {
      withButton?: boolean;
      withFilter?: boolean;
      filterValue?: string;
      filterOption?: Option[];
      buttonIcon?: any;
      icon?: any;
      title?: string;
      search: string;
      setSearch: (v: string) => void;
      setFilter?: (v: string) => void;
      onClick?: () => void;
}

export default function TableSearch({
      search,
      title,
      filterValue,
      withButton,
      withFilter,
      filterOption,
      buttonIcon,
      icon,
      setFilter,
      setSearch,
      onClick,
}: TableSearchProps) {
      const Icon = buttonIcon ?? icon;
      const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
      const [draft, setDraft] = useState(search);

      const openMobileSearch = () => {
            setDraft(search);
            setMobileSearchOpen(true);
      };

      const applyMobileSearch = () => {
            setSearch(draft);
            setMobileSearchOpen(false);
      };

      return (
            <div className="flex w-full relative bg-[#0a0a0b] border-bg-border border-b">
                  {/* ── Desktop (lg+): unchanged inline row ── */}
                  <div className="hidden lg:flex flex-row items-center justify-end flex-1 w-full gap-2 py-2 px-6">
                        <SearchInput
                              placeholder="Search customers…"
                              value={search}
                              onChange={(v: string) => setSearch(v)}
                        />
                        {withButton && Icon && (
                              <Button radius="full" variant="accent" icon={<Icon size={24} />} className="flex-shrink-0" onClick={onClick}>
                                    <span>{title}</span>
                              </Button>
                        )}
                        {withFilter && filterOption && (
                              <Select value={filterValue ?? 'ALL'} options={[{ value: 'ALL', label: 'ALL' }, ...filterOption]} onChange={(v) => setFilter?.(v)} className="max-w-[200px]" />
                        )}
                  </div>

                  {/* ── Mobile / tablet (below lg): icon-only toolbar, full-screen search ── */}
                  <div className="flex lg:hidden items-center justify-end flex-1 w-full gap-2 py-2 px-4">
                        {search && (
                              <span className="text-[11px] text-ink-faint font-body truncate flex-1">
                                    "{search}"
                              </span>
                        )}
                        <button
                              type="button"
                              onClick={openMobileSearch}
                              aria-label="Search"
                              className="w-9 h-9 shrink-0 rounded-full border border-bg-border bg-bg-hover text-ink-muted hover:text-accent-gold flex items-center justify-center transition-colors"
                        >
                              <Search size={16} />
                        </button>
                        {withButton && Icon && (
                              <button
                                    type="button"
                                    onClick={onClick}
                                    aria-label={title ?? 'Add'}
                                    className="w-9 h-9 shrink-0 rounded-full bg-accent-gold/15 border border-accent-gold/30 text-accent-gold flex items-center justify-center transition-colors"
                              >
                                    <Icon size={18} />
                              </button>
                        )}
                  </div>

                  <Dialog.Root open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
                        <Dialog.Portal>
                              <Dialog.Overlay className="fixed inset-0 z-[1100] bg-bg-base lg:hidden" />
                              <Dialog.Content
                                    className="fixed inset-0 z-[1100] flex flex-col bg-bg-base lg:hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                                    onOpenAutoFocus={(e) => e.preventDefault()}
                              >
                                    <Dialog.Title className="sr-only">Search</Dialog.Title>
                                    <div className="flex items-center gap-2 h-14 px-3 border-b border-bg-border shrink-0">
                                          <Dialog.Close asChild>
                                                <button
                                                      type="button"
                                                      aria-label="Close search"
                                                      className="w-9 h-9 shrink-0 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-bg-hover flex items-center justify-center transition-colors"
                                                >
                                                      <ArrowLeft size={18} />
                                                </button>
                                          </Dialog.Close>
                                          <SearchInput
                                                value={draft}
                                                onChange={setDraft}
                                                placeholder="Search…"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                      if (e.key === 'Enter') applyMobileSearch();
                                                }}
                                                className="flex-1"
                                          />
                                          <button
                                                type="button"
                                                onClick={applyMobileSearch}
                                                className="shrink-0 rounded-lg bg-accent-gold/15 border border-accent-gold/30 text-accent-gold text-xs font-body px-3 h-9"
                                          >
                                                Search
                                          </button>
                                    </div>

                                    {withFilter && filterOption && (
                                          <div className="p-4 border-b border-bg-border">
                                                <label className="block text-[10px] uppercase tracking-wide text-ink-faint mb-1.5">Filter</label>
                                                <Select
                                                      value={filterValue ?? 'ALL'}
                                                      options={[{ value: 'ALL', label: 'ALL' }, ...filterOption]}
                                                      onChange={(v) => setFilter?.(v)}
                                                      className="w-full"
                                                />
                                          </div>
                                    )}
                              </Dialog.Content>
                        </Dialog.Portal>
                  </Dialog.Root>
            </div>
      );
}
