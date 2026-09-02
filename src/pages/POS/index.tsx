import { useState } from 'react';
import { TopBar } from '@/components/ui';
import { ShoppingCart } from 'lucide-react';
import { ProductGrid } from './components/ProductGrid';
import { CartPanel } from './components/CartPanel';
import { useCart } from './useCart';
import { fmtCurrency } from '@/lib/utils';

export default function POSPage() {
      const cart = useCart();
      const [mobileCartOpen, setMobileCartOpen] = useState(false);

      return (
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                  <TopBar title="New Sale" subtitle="Point of sale" />

                  <div className="flex-1 flex min-h-0">
                        {/* Product grid — always visible */}
                        <div className="flex-1 min-w-0 border-r border-bg-border">
                              <ProductGrid onAdd={cart.addItem} />
                        </div>

                        {/* Cart — permanent panel on desktop, slide-up drawer on mobile/tablet */}
                        <div className="hidden lg:flex lg:w-[380px] xl:w-[420px] shrink-0 border-l border-bg-border bg-bg-panel/40">
                              <CartPanel cart={cart} />
                        </div>
                  </div>

                  {/* Mobile/tablet: floating cart button + bottom sheet */}
                  {cart.itemCount > 0 && (
                        <button
                              type="button"
                              onClick={() => setMobileCartOpen(true)}
                              className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 rounded-full bg-accent-gold text-bg-base px-5 py-3 shadow-lg font-body text-sm font-medium"
                        >
                              <ShoppingCart size={16} />
                              {cart.itemCount} item{cart.itemCount === 1 ? '' : 's'} · {fmtCurrency(cart.total)}
                        </button>
                  )}

                  {mobileCartOpen && (
                        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-bg-base">
                              <div className="flex items-center justify-between h-14 px-4 border-b border-bg-border shrink-0">
                                    <p className="text-sm font-body text-ink-primary font-medium">Cart</p>
                                    <button
                                          type="button"
                                          onClick={() => setMobileCartOpen(false)}
                                          className="text-xs font-body text-accent-gold"
                                    >
                                          Back to products
                                    </button>
                              </div>
                              <div className="flex-1 min-h-0">
                                    <CartPanel cart={cart} />
                              </div>
                        </div>
                  )}
            </div>
      );
}
