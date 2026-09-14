import { useState, useEffect, useMemo, useRef } from 'react';
import { Product, CartItem, OrderConfirmationDetails, PolicyType, ShutdownStatus, AnnouncementData } from './types';
import { fetchBakeryProducts, fetchApiVersion } from './utils/api';
import { Header } from './components/Header';
import { BakeryHero } from './components/BakeryHero';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { PolicyModal } from './components/PolicyModal';
import { MyOrdersModal } from './components/MyOrdersModal';
import { FloatingCartButton } from './components/FloatingCartButton';
import { ShutdownOverlay } from './components/ShutdownOverlay';
import { AnnouncementModal } from './components/AnnouncementModal';
import { DynamicAnnouncementBanner } from './components/DynamicAnnouncementBanner';
import { Loader2, AlertTriangle, RefreshCw, Cake, Heart, Sparkles, MessageCircle, Mail, Shield, FileText, RotateCcw, Truck } from 'lucide-react';

function normalizeAnnouncement(ann: unknown): AnnouncementData | null {
  if (!ann) return null;
  if (typeof ann === 'string') {
    const trimmed = ann.trim();
    if (!trimmed) return null;
    return {
      message: trimmed,
      ctaLabel: 'Explore Treats',
      scope: 'All',
      itemNames: [],
    };
  }
  if (typeof ann === 'object') {
    const obj = ann as Record<string, unknown>;
    const message = typeof obj.message === 'string' ? obj.message.trim() : '';
    if (!message) return null;
    const ctaLabel = typeof obj.ctaLabel === 'string' && obj.ctaLabel.trim() ? obj.ctaLabel.trim() : 'Explore Treats';
    const scope = typeof obj.scope === 'string' && obj.scope.trim() ? obj.scope.trim() : 'All';
    const itemNames = Array.isArray(obj.itemNames)
      ? obj.itemNames.map((n) => String(n).trim()).filter(Boolean)
      : [];
    return { message, ctaLabel, scope, itemNames };
  }
  return null;
}

export default function App() {
  const [categories, setCategories] = useState<Record<string, Product[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Live updates & polling state (Requirement 1)
  const [storedVersion, setStoredVersion] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [isAnnouncementPopupOpen, setIsAnnouncementPopupOpen] = useState<boolean>(false);
  const [isPersistentBannerVisible, setIsPersistentBannerVisible] = useState<boolean>(false);
  const [highlightedProductName, setHighlightedProductName] = useState<string | null>(null);
  const [shutdown, setShutdown] = useState<ShutdownStatus | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart state persisted in localStorage for convenience
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sweet_treats_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderConfirmationDetails | null>(null);
  const [activePolicy, setActivePolicy] = useState<PolicyType | null>(null);
  const [isOrdersOpen, setIsOrdersOpen] = useState<boolean>(false);

  const menuSectionRef = useRef<HTMLDivElement>(null);

  // Synchronized refs to avoid stale closures in polling interval
  const versionRef = useRef<string | null>(null);
  const isCheckoutOpenRef = useRef<boolean>(false);
  const isPaymentProcessingRef = useRef<boolean>(false);

  useEffect(() => {
    isCheckoutOpenRef.current = isCheckoutOpen;
  }, [isCheckoutOpen]);

  useEffect(() => {
    isPaymentProcessingRef.current = isPaymentProcessing;
  }, [isPaymentProcessing]);

  useEffect(() => {
    versionRef.current = storedVersion;
  }, [storedVersion]);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sweet_treats_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [cart]);

  // Initial Fetch on page load (Requirement 1: Store version in state)
  const loadProducts = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetchBakeryProducts();
      if (res) {
        if (res.categories && Object.keys(res.categories).length > 0) {
          setCategories(res.categories);
        }
        if (res.announcement !== undefined) {
          const normAnn = normalizeAnnouncement(res.announcement);
          setAnnouncement(normAnn);
          if (normAnn !== null) {
            setIsAnnouncementPopupOpen(true);
            setIsPersistentBannerVisible(false);
          }
        }
        if (res.shutdown !== undefined) {
          setShutdown(res.shutdown);
        }
        // 1. Store the current version number in a state variable when the app first loads
        if (res.version !== undefined && res.version !== null) {
          const v = String(res.version);
          versionRef.current = v;
          setStoredVersion(v);
        }
      } else {
        throw new Error('No bakery data received.');
      }
    } catch (err: any) {
      console.error('Failed to load products:', err);
      setFetchError('Unable to load bakery menu. Please check connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Requirements 2, 3, 4, 5, 6: Automatic data refresh polling every 8 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      // Pause polling during active checkout or payment processing
      if (isCheckoutOpenRef.current || isPaymentProcessingRef.current) {
        return;
      }

      try {
        // 2. On each poll (every 8 seconds), fetch version endpoint and parse "version" field
        const res = await fetch(
          'https://script.google.com/macros/s/AKfycbwPFgnfouW9nIs31hIvSSZ_tgQCySy9SCwmDXTdvqBQLyGR6qG7UpmCoBX4_OzGZWOO/exec?action=version',
          {
            method: 'GET',
            headers: { Accept: 'application/json' },
            cache: 'no-store',
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        const fetchedVersion =
          data && data.version !== undefined && data.version !== null
            ? String(data.version)
            : null;

        const currentStoredVersion = versionRef.current;

        // 6. Console log at the top of the polling function that prints current stored and newly fetched versions
        console.log('Current stored version:', currentStoredVersion, 'Newly fetched version:', fetchedVersion);

        if (fetchedVersion === null) return;

        // 3. Compare this newly fetched version to the stored version number using a simple not-equal comparison
        if (currentStoredVersion !== null && fetchedVersion !== currentStoredVersion) {
          // 5. Console log statement right before step 4a
          console.log('Version changed, refetching data');

          // 4a. Fetch the full data from https://script.google.com/macros/s/AKfycbwPFgnfouW9nIs31hIvSSZ_tgQCySy9SCwmDXTdvqBQLyGR6qG7UpmCoBX4_OzGZWOO/exec (no query parameters)
          const fullRes = await fetch(
            'https://script.google.com/macros/s/AKfycbwPFgnfouW9nIs31hIvSSZ_tgQCySy9SCwmDXTdvqBQLyGR6qG7UpmCoBX4_OzGZWOO/exec',
            {
              method: 'GET',
              headers: { Accept: 'application/json' },
              cache: 'no-store',
            }
          );

          if (fullRes.ok) {
            const fullData = await fullRes.json();
            if (fullData) {
              // 4b. Update the products state, shutdown state, and announcement state with this new data
              if (fullData.categories && Object.keys(fullData.categories).length > 0) {
                setCategories(fullData.categories);
              }
              if (fullData.shutdown !== undefined) {
                setShutdown(fullData.shutdown);
              }
              if (fullData.announcement !== undefined) {
                const normAnn = normalizeAnnouncement(fullData.announcement);
                setAnnouncement(normAnn);
                if (normAnn === null) {
                  setIsAnnouncementPopupOpen(false);
                  setIsPersistentBannerVisible(false);
                }
              }

              // 4c. Update the stored version number to match the new version
              const updatedVer =
                fullData.version !== undefined && fullData.version !== null
                  ? String(fullData.version)
                  : fetchedVersion;
              versionRef.current = updatedVer;
              setStoredVersion(updatedVer);
            }
          }
        } else if (currentStoredVersion === null && fetchedVersion !== null) {
          // If stored version was not yet recorded, initialize it
          versionRef.current = fetchedVersion;
          setStoredVersion(fetchedVersion);
        }
      } catch (err) {
        console.warn('Polling version check error:', err);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Cart actions
  const handleAddToCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((i) => i.product.name === product.name);
      if (existingIndex >= 0) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const handleUpdateQuantity = (productName: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.name === productName) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const handleRemoveItem = (productName: string) => {
    setCart((prevCart) => prevCart.filter((i) => i.product.name !== productName));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Cart calculations
  const totalItemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartTotalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );

  // Filtered categories
  const categoryNames = useMemo(() => Object.keys(categories), [categories]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const [cat, products] of Object.entries(categories) as [string, Product[]][]) {
      counts[cat] = products.length;
    }
    return counts;
  }, [categories]);

  const filteredCategories = useMemo(() => {
    const result: Record<string, Product[]> = {};

    for (const [cat, products] of Object.entries(categories) as [string, Product[]][]) {
      if (activeCategory !== 'All' && activeCategory !== cat) {
        continue;
      }

      const matchingProducts = products.filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          cat.toLowerCase().includes(q)
        );
      });

      if (matchingProducts.length > 0) {
        result[cat] = matchingProducts;
      }
    }

    return result;
  }, [categories, activeCategory, searchQuery]);

  // Order handlers
  const handlePaymentSuccess = (orderDetails: OrderConfirmationDetails) => {
    setConfirmedOrder(orderDetails);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsPaymentProcessing(false);
    setIsCartOpen(false);
  };

  const handleWhatsAppOrder = (orderDetails: OrderConfirmationDetails) => {
    setConfirmedOrder(orderDetails);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsPaymentProcessing(false);
    setIsCartOpen(false);
  };

  const scrollToMenu = () => {
    menuSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAnnouncementAction = () => {
    setIsAnnouncementPopupOpen(false);
    setIsPersistentBannerVisible(true);

    if (!announcement) {
      scrollToMenu();
      return;
    }

    const scope = (announcement.scope || 'All').trim().toLowerCase();
    const itemNames = announcement.itemNames || [];

    if (scope === 'specific' && itemNames.length > 0) {
      const targetName = itemNames[0].trim();
      const targetLower = targetName.toLowerCase();

      // Reset filters so that all products are rendered in the DOM
      setActiveCategory('All');
      setSearchQuery('');
      setHighlightedProductName(targetName);

      setTimeout(() => {
        const safeId = `product-${targetName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        let elem = document.getElementById(safeId);

        if (!elem) {
          try {
            elem = document.querySelector(`[data-product-name="${CSS.escape(targetName)}"]`) as HTMLElement;
          } catch {
            elem = null;
          }
        }

        if (!elem) {
          const allCards = document.querySelectorAll('[data-product-name]');
          for (const card of allCards) {
            const attr = card.getAttribute('data-product-name')?.toLowerCase() || '';
            if (attr === targetLower || attr.includes(targetLower) || targetLower.includes(attr)) {
              elem = card as HTMLElement;
              break;
            }
          }
        }

        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          scrollToMenu();
        }

        setTimeout(() => {
          setHighlightedProductName(null);
        }, 4500);
      }, 150);
    } else {
      scrollToMenu();
    }
  };

  const handleCloseAnnouncementPopup = () => {
    setIsAnnouncementPopupOpen(false);
    setIsPersistentBannerVisible(true);
  };

  // Requirement 7: SITE SHUTDOWN POPUP
  // When shutdown.active is true, immediately show a full-screen, non-closeable overlay/popup
  // covering the entire page (no X button, no click-outside-to-dismiss, no ESC key dismissal).
  // Display the message from shutdown.message.
  // Do not render the product listing, cart, or any other page content behind it while shutdown is active.
  // The polling interval continues ticking in the background, so if shutdown.active becomes false,
  // the overlay is automatically dismissed and the site loads normally without a reload.
  if (shutdown?.active) {
    return <ShutdownOverlay message={shutdown.message} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1810] flex flex-col selection:bg-[#E8D5C4] selection:text-[#3B1E12]">
      {/* Requirement 8: Dynamic Announcement Sticky Banner (only when announcement is active and popup closed) */}
      {announcement && isPersistentBannerVisible && (
        <DynamicAnnouncementBanner
          announcement={announcement}
          onClick={handleAnnouncementAction}
        />
      )}

      {/* Navigation Header */}
      <Header
        cartItemCount={totalItemCount}
        cartTotal={cartTotalAmount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Showcase */}
      <BakeryHero onExploreClick={scrollToMenu} />

      {/* Category Navigation Pills */}
      {categoryNames.length > 0 && (
        <CategoryNav
          categories={categoryNames}
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            scrollToMenu();
          }}
          categoryCounts={categoryCounts}
        />
      )}

      {/* Main Menu Section */}
      <main ref={menuSectionRef} className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Loading State */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#EFE5D8] flex items-center justify-center text-[#B45309] mb-4 animate-bounce">
              <Cake className="w-8 h-8" />
            </div>
            <div className="flex items-center gap-2 text-base font-semibold text-[#3B2215] mb-1">
              <Loader2 className="w-5 h-5 animate-spin text-[#B45309]" />
              <span>Fetching freshly baked treats...</span>
            </div>
            <p className="text-xs text-[#7A5B4C]">Loading live menu from our kitchen</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && fetchError && Object.keys(categories).length === 0 && (
          <div className="max-w-md mx-auto py-12 px-6 bg-white rounded-2xl border border-[#FCA5A5] text-center shadow-sm">
            <AlertTriangle className="w-10 h-10 text-[#DC2626] mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-[#2E190F] mb-1">Menu Unavailable</h3>
            <p className="text-xs text-[#7A5B4C] mb-4">{fetchError}</p>
            <button
              onClick={loadProducts}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#B45309] text-white text-xs font-semibold rounded-full shadow-xs hover:bg-[#92400E] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Fetch
            </button>
          </div>
        )}

        {/* Search Results Notice */}
        {!isLoading && searchQuery && (
          <div className="mb-6 flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-[#EADBCE]">
            <p className="text-xs sm:text-sm text-[#5C3F32]">
              Showing results for <span className="font-bold text-[#B45309]">"{searchQuery}"</span>
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#8C3A16] hover:underline font-semibold cursor-pointer"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Products by Category Sections */}
        {!isLoading && (
          <div className="space-y-12 sm:space-y-16">
            {Object.keys(filteredCategories).length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#E9DECE] p-8 max-w-lg mx-auto">
                <Cake className="w-12 h-12 text-[#B45309]/50 mx-auto mb-3" />
                <h3 className="font-display text-xl font-bold text-[#2E190F] mb-1">
                  No delicious treats found
                </h3>
                <p className="text-xs sm:text-sm text-[#7A5B4C] mb-4">
                  We couldn't find any baked items matching your current filters.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-[#B45309] text-white text-xs font-semibold rounded-full shadow-xs hover:bg-[#92400E] transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              (Object.entries(filteredCategories) as [string, Product[]][]).map(([categoryName, products]) => (
                <section
                  key={categoryName}
                  id={`category-${categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  className="scroll-mt-36"
                >
                  {/* Category Heading with artistic divider */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-[#B45309]" />
                      <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#2C1810]">
                        {categoryName}
                      </h3>
                      <span className="text-xs font-semibold text-[#8C624D] bg-[#F2E8DC] px-2.5 py-0.5 rounded-full">
                        {products.length} {products.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-[#E6D8C8]" />
                  </div>

                  {/* Product Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                    {products.map((product) => (
                      <ProductCard
                        key={product.name}
                        product={product}
                        category={categoryName}
                        onAddToCart={handleAddToCart}
                        isHighlighted={
                          highlightedProductName !== null &&
                          (product.name.toLowerCase() === highlightedProductName.toLowerCase() ||
                            product.name.toLowerCase().includes(highlightedProductName.toLowerCase()) ||
                            highlightedProductName.toLowerCase().includes(product.name.toLowerCase()))
                        }
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      <FloatingCartButton
        itemCount={totalItemCount}
        totalAmount={cartTotalAmount}
        onClick={() => setIsCartOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Form Modal - Razorpay with WhatsApp Fallback */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setIsPaymentProcessing(false);
        }}
        items={cart}
        totalAmount={cartTotalAmount}
        onPaymentSuccess={handlePaymentSuccess}
        onWhatsAppOrder={handleWhatsAppOrder}
        onPaymentStateChange={setIsPaymentProcessing}
      />

      {/* Order Confirmation Screen Modal */}
      <OrderSuccessModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onViewOrders={() => setIsOrdersOpen(true)}
      />

      {/* My Orders History Modal (Browser Local Storage & Live Server Verification) */}
      <MyOrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
      />

      {/* Customer Policy Modal */}
      <PolicyModal
        isOpen={activePolicy !== null}
        selectedPolicy={activePolicy}
        onClose={() => setActivePolicy(null)}
        onSelectPolicy={(p) => setActivePolicy(p)}
      />

      {/* Requirement 8: Announcement Modal Popup (reappears on every page load/visit) */}
      <AnnouncementModal
        isOpen={isAnnouncementPopupOpen}
        announcement={announcement}
        onClose={handleCloseAnnouncementPopup}
        onCtaClick={handleAnnouncementAction}
      />

      {/* Footer */}
      <footer className="mt-16 bg-[#32170D] text-[#E5D2C5] border-t border-[#4A2415]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {/* Main Footer Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-[#4A2415]/80 text-xs sm:text-sm">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#B45309] flex items-center justify-center text-white font-serif font-bold italic">
                  CH
                </div>
                <div>
                  <h4 className="font-display text-lg font-bold text-white leading-tight">Choco House</h4>
                  <p className="text-[10px] text-[#A88876] uppercase tracking-wider">Artisanal Bakery & Patisserie</p>
                </div>
              </div>
              <p className="text-[#BCA393] leading-relaxed">
                Handmade chocolate cakes, celebration patisserie, biscuits, and chilled beverages crafted with pure passion and the finest ingredients.
              </p>
            </div>

            {/* Kitchen Hours & Delivery */}
            <div className="space-y-2.5">
              <h5 className="font-semibold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" /> Fresh Bake & Delivery
              </h5>
              <p className="text-[#BCA393]">Morning Bake: 8:00 AM – 11:30 AM</p>
              <p className="text-[#BCA393]">Afternoon Batches: 3:00 PM – 6:00 PM</p>
              <p className="text-[#BCA393]">Chennai City Delivery: 24–48 Hours</p>
            </div>

            {/* Contact Details */}
            <div className="space-y-2.5">
              <h5 className="font-semibold text-white uppercase tracking-wider text-xs">
                Bakery Support & Orders
              </h5>
              <div className="space-y-2 text-[#BCA393]">
                <a
                  href="https://wa.me/919486123975"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>WhatsApp: +91 9486123975</span>
                </a>
                <a
                  href="mailto:team.framelabs@gmail.com"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                  <span>Email: team.framelabs@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Minimal Policy Links Row */}
          <div className="py-5 border-b border-[#4A2415]/60 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#C7AF9F]">
            <button
              id="footer-link-terms"
              onClick={() => setActivePolicy('terms')}
              className="hover:text-white transition-colors hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-3 h-3 text-[#B45309]" />
              <span>Terms & Conditions</span>
            </button>
            <span className="text-[#5A3828] hidden sm:inline">•</span>
            <button
              id="footer-link-privacy"
              onClick={() => setActivePolicy('privacy')}
              className="hover:text-white transition-colors hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <Shield className="w-3 h-3 text-[#B45309]" />
              <span>Privacy Policy</span>
            </button>
            <span className="text-[#5A3828] hidden sm:inline">•</span>
            <button
              id="footer-link-refund"
              onClick={() => setActivePolicy('refund')}
              className="hover:text-white transition-colors hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3 text-[#B45309]" />
              <span>Refund & Cancellation Policy</span>
            </button>
            <span className="text-[#5A3828] hidden sm:inline">•</span>
            <button
              id="footer-link-shipping"
              onClick={() => setActivePolicy('shipping')}
              className="hover:text-white transition-colors hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <Truck className="w-3 h-3 text-[#B45309]" />
              <span>Shipping & Delivery Policy</span>
            </button>
            <span className="text-[#5A3828] hidden sm:inline">•</span>
            <button
              id="footer-link-contact"
              onClick={() => setActivePolicy('contact')}
              className="hover:text-white transition-colors hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <MessageCircle className="w-3 h-3 text-emerald-500" />
              <span>Contact Us</span>
            </button>
          </div>

          {/* Bottom copyright line */}
          <div className="pt-5 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9C7F6E] gap-2">
            <p>© {new Date().getFullYear()} Choco House. All rights reserved.</p>
            <p className="flex items-center gap-1">
              <span>Freshly baked with</span>
              <Heart className="w-3.5 h-3.5 text-[#DC2626] fill-current" />
              <span>in Chennai</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
