import React from "react";
import { ShopifyProvider, useShopify } from "./context/ShopifyContext";
import { SEOHead } from "./components/common/SEOHead";
import { CustomCursor } from "./components/common/CustomCursor";
import { LenisSmoothScroll } from "./components/common/LenisSmoothScroll";
import { AnnouncementBar } from "./components/common/AnnouncementBar";
import { Header } from "./components/common/Header";
import { MobileNav } from "./components/common/MobileNav";
import { Footer } from "./components/common/Footer";
import { CartDrawer } from "./components/common/CartDrawer";
import { WishlistDrawer } from "./components/common/WishlistDrawer";
import { CompareDrawer } from "./components/common/CompareDrawer";
import { QuickViewModal } from "./components/common/QuickViewModal";
import { SearchModal } from "./components/common/SearchModal";
import { ShopifyConfigModal } from "./components/common/ShopifyConfigModal";

import { HomePage } from "./components/home/HomePage";
import { ProductPage } from "./components/product/ProductPage";
import { CollectionPage } from "./components/collection/CollectionPage";
import { CollectionsListPage } from "./components/collection/CollectionsListPage";
import { BlogPage } from "./components/blog/BlogPage";
import { AccountPage } from "./components/account/AccountPage";
import { ShopPage } from "./components/shop/ShopPage";
import { AboutPage } from "./components/about/AboutPage";
import { ContactPage } from "./components/contact/ContactPage";
import { FAQPage } from "./components/faq/FAQPage";
import { LegalPage } from "./components/page/LegalPage";
import { CartPage } from "./components/cart/CartPage";
import { SearchPage } from "./components/search/SearchPage";

const MainLayout: React.FC = () => {
  const { viewState, toastMessage } = useShopify();
  const currentType = viewState.type;
  const activeHandle = "handle" in viewState ? viewState.handle : "";
  const activeQuery = "query" in viewState ? viewState.query : "";

  return (
    <div className="min-h-screen bg-[#030e07] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <SEOHead />
      <CustomCursor />
      <LenisSmoothScroll />

      {/* Header Navigation Stack */}
      <AnnouncementBar />
      <Header />
      <MobileNav />

      {/* Dynamic Route View Switching */}
      <main className="flex-1">
        {currentType === "home" && <HomePage />}
        {currentType === "shop" && <ShopPage />}
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
        {currentType === "page" && <LegalPage handle={activeHandle} />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Drawers & Modals */}
      <CartDrawer />
      <WishlistDrawer />
      <CompareDrawer />
      <QuickViewModal />
      <SearchModal />
      <ShopifyConfigModal />

      {/* Floating Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-emerald-300 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ShopifyProvider>
      <MainLayout />
    </ShopifyProvider>
  );
}
