import React, { lazy, Suspense } from "react";
import { ShopifyProvider, useShopify } from "./context/ShopifyContext";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { SEOHead } from "./components/common/SEOHead";
import { AnnouncementBar } from "./components/common/AnnouncementBar";
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import { BottomNav } from "./components/common/BottomNav";
import { CartDrawer } from "./components/common/CartDrawer";
import { WishlistDrawer } from "./components/common/WishlistDrawer";
import { CompareDrawer } from "./components/common/CompareDrawer";
import { MobileNav } from "./components/common/MobileNav";

// Dynamic lazy-loaded pages for optimized chunking
const HomePage = lazy(() => import("./components/home/HomePage").then((m) => ({ default: m.HomePage })));
const ProductPage = lazy(() => import("./components/product/ProductPage").then((m) => ({ default: m.ProductPage })));
const CollectionPage = lazy(() => import("./components/collection/CollectionPage").then((m) => ({ default: m.CollectionPage })));
const CollectionsListPage = lazy(() => import("./components/collection/CollectionsListPage").then((m) => ({ default: m.CollectionsListPage })));
const BlogPage = lazy(() => import("./components/blog/BlogPage").then((m) => ({ default: m.BlogPage })));
const AccountPage = lazy(() => import("./components/account/AccountPage").then((m) => ({ default: m.AccountPage })));
const ShopPage = lazy(() => import("./components/shop/ShopPage").then((m) => ({ default: m.ShopPage })));
const AboutPage = lazy(() => import("./components/about/AboutPage").then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import("./components/contact/ContactPage").then((m) => ({ default: m.ContactPage })));
const FAQPage = lazy(() => import("./components/faq/FAQPage").then((m) => ({ default: m.FAQPage })));
const LegalPage = lazy(() => import("./components/page/LegalPage").then((m) => ({ default: m.LegalPage })));
const CartPage = lazy(() => import("./components/cart/CartPage").then((m) => ({ default: m.CartPage })));
const SearchPage = lazy(() => import("./components/search/SearchPage").then((m) => ({ default: m.SearchPage })));
const CheckoutPage = lazy(() => import("./components/CheckoutPage").then((m) => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = lazy(() => import("./components/OrderConfirmationPage").then((m) => ({ default: m.OrderConfirmationPage })));
const TrackOrderPage = lazy(() => import("./components/order/TrackOrderPage").then((m) => ({ default: m.TrackOrderPage })));

// Dynamic lazy-loaded modals
const QuickViewModal = lazy(() => import("./components/common/QuickViewModal").then((m) => ({ default: m.QuickViewModal })));
const SearchModal = lazy(() => import("./components/common/SearchModal").then((m) => ({ default: m.SearchModal })));
const ShopifyConfigModal = lazy(() => import("./components/common/ShopifyConfigModal").then((m) => ({ default: m.ShopifyConfigModal })));

const PageFallback: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#C0FE2D] border-t-transparent rounded-full animate-spin" />
  </div>
);

const MainLayout: React.FC = () => {
  const { viewState, toastMessage } = useShopify();
  const currentType = viewState.type;
  const activeHandle = "handle" in viewState ? viewState.handle : "";
  const activeQuery = "query" in viewState ? viewState.query : "";
  const activeOrderRef = "orderReference" in viewState ? (viewState as any).orderReference : "";
  const trackOrderNum = "initialOrderNumber" in viewState ? (viewState as any).initialOrderNumber : undefined;
  const trackOrderEmail = "initialEmail" in viewState ? (viewState as any).initialEmail : undefined;

  return (
    <div className="min-h-screen bg-[#161616] text-slate-100 flex flex-col font-sans selection:bg-[#C0FE2D] selection:text-[#161616]">
      <SEOHead />

      {/* Header Navigation Stack */}
      <AnnouncementBar />
      <Header />

      {/* Dynamic Route View Switching */}
      <main className="flex-1 pb-20 lg:pb-0">
        <Suspense fallback={<PageFallback />}>
          {currentType === "home" && <HomePage />}
          {(currentType === "shop" || currentType === "explore_all" || currentType === "sale") && (
            <ShopPage
              isExploreAll={currentType === "explore_all"}
              isSalePage={currentType === "sale"}
            />
          )}
          {currentType === "product" && <ProductPage handle={activeHandle} />}
          {currentType === "collection" && <CollectionPage handle={activeHandle} />}
          {currentType === "collections_list" && <CollectionsListPage />}
          {currentType === "blog" && <BlogPage />}
          {currentType === "article" && <BlogPage articleHandle={activeHandle} />}
          {currentType === "account" && <AccountPage />}
          {currentType === "about" && <AboutPage />}
          {currentType === "contact" && <ContactPage />}
          {currentType === "faq" && <FAQPage />}
          {currentType === "search" && <SearchPage initialQuery={activeQuery} />}
          {currentType === "cart" && <CartPage />}
          {currentType === "checkout" && <CheckoutPage />}
          {currentType === "order_confirmation" && (
            <OrderConfirmationPage orderReference={activeOrderRef} />
          )}
          {currentType === "track_order" && (
            <TrackOrderPage
              initialOrderNumber={trackOrderNum}
              initialEmail={trackOrderEmail}
            />
          )}
          {currentType === "page" && <LegalPage handle={activeHandle} />}
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />
      <BottomNav />

      {/* Drawers & Modals */}
      <CartDrawer />
      <WishlistDrawer />
      <CompareDrawer />
      <MobileNav />
      <Suspense fallback={null}>
        <QuickViewModal />
        <SearchModal />
        <ShopifyConfigModal />
      </Suspense>

      {/* Floating Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#C0FE2D] text-[#161616] px-4 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-[#D4FF66] animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#161616]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ShopifyProvider>
        <MainLayout />
      </ShopifyProvider>
    </ErrorBoundary>
  );
}
