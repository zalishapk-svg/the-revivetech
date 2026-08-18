export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ImageNode {
  id: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku?: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice?: Money | null;
  image?: ImageNode;
  selectedOptions?: { name: string; value: string }[];
  quantityAvailable?: number;
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface Metafield {
  key: string;
  value: string;
  namespace: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  vendor: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  compareAtPriceRange?: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  } | null;
  featuredImage?: ImageNode;
  images: ImageNode[];
  options: ProductOption[];
  variants: ProductVariant[];
  metafields?: Metafield[];
  rating?: number;
  reviewsCount?: number;
  reviews?: Review[];
  specs?: Record<string, string>;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isFlashDeal?: boolean;
  discountPercentage?: number;
  seo?: { title?: string; description?: string };
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description?: string;
  image?: ImageNode;
  productsCount?: number;
  products?: Product[];
  seo?: { title?: string; description?: string };
}

export interface BlogArticle {
  id: string;
  handle: string;
  title: string;
  content: string;
  contentHtml?: string;
  excerpt?: string;
  publishedAt: string;
  author?: string;
  image?: ImageNode;
  tags?: string[];
  readingTimeMinutes?: number;
  seo?: { title?: string; description?: string };
}

export interface Blog {
  id: string;
  handle: string;
  title: string;
  articles: BlogArticle[];
}

export interface CartLineItem {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage?: ImageNode;
      vendor: string;
    };
    price: Money;
    image?: ImageNode;
    selectedOptions?: { name: string; value: string }[];
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount?: Money;
  };
  lines: CartLineItem[];
}

export interface CategoryDepartment {
  id: string;
  name: string;
  iconName: string;
  description: string;
  collectionHandles: string[];
  featuredProductHandle?: string;
  promoBanner?: {
    title: string;
    subtitle: string;
    imageUrl: string;
    buttonText: string;
    linkUrl: string;
  };
}

export interface NavigationMenuItem {
  title: string;
  url: string;
  items?: NavigationMenuItem[];
}

export interface CustomerOrder {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: Money;
  lineItems: {
    title: string;
    quantity: number;
    price: Money;
    imageUrl?: string;
  }[];
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  orders: CustomerOrder[];
}

export interface CheckoutCustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface CheckoutShippingAddress {
  address1: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface ShippingOption {
  id: string;
  title: string;
  price: number;
  currency: string;
  estimatedDays: string;
  description: string;
}

export interface OrderConfirmationItem {
  id: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface OrderConfirmationData {
  orderReference: string;
  orderNumber: string;
  shopifyOrderId?: string | number;
  createdAt: string;
  customer: CheckoutCustomerData;
  shippingAddress: CheckoutShippingAddress;
  items: OrderConfirmationItem[];
  shippingLine: {
    title: string;
    price: number;
  };
  subtotal: number;
  discount: number;
  discountCode?: string;
  total: number;
  currency: string;
  paymentMethod: string;
  financialStatus: string;
  notes?: string;
}

export type ViewState = 
  | { type: 'home' }
  | { type: 'shop' }
  | { type: 'explore_all' }
  | { type: 'sale' }
  | { type: 'product'; handle: string }
  | { type: 'collection'; handle: string }
  | { type: 'collections_list' }
  | { type: 'blog' }
  | { type: 'article'; handle: string }
  | { type: 'account' }
  | { type: 'about' }
  | { type: 'contact' }
  | { type: 'faq' }
  | { type: 'search'; query?: string }
  | { type: 'cart' }
  | { type: 'checkout' }
  | { type: 'order_confirmation'; orderReference: string }
  | { type: 'page'; handle: string };
