export interface Variant {
  id: string;
  _id?: string;
  color?: string;
  size?: string;
  price: number;
  sale_price?: number;
  stock_qty: number;
  sku: string;
}

export interface Category {
  _id: string;
  name: string;
  parentId?: string | Category;
  slug?: string;
}
export interface ProductImage {
  id?: string;
  _id?: string;
  url: string;
  is_main?: boolean;
  public_id?: string;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  description: string;
  brand: string;
  category: string | Category;
  image: string;
  images: ProductImage[] | string[];
  has_variants: boolean;
  variants: Variant[];
  price?: number;
  sale_price?: number;
  specifications?: Record<string, string>;
  stock_qty?: number;
  stockQty?: number;
  sku?: string;
  salePrice?: number;
  isActive: boolean;
  mainImageIndex: number;
  availability:
    | "in-stock"
    | "out-of-stock"
    | "INSTOCK"
    | "OUTSTOCK"
    | "OUTOFSTOCK"
    | "PREORDER"
    | "available"
    | "unavailable";
  average_rating?: number;
  total_reviews?: number;
  averageRating?: number;
  reviewCount?: number;
  count?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryTree extends Category {
  children?: CategoryTree[];
  parent?: string | Category;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  name?: string;
  mobile?: string;
  role: "user" | "admin";
  isEmailVerified: boolean;
  avatar?: string;
  access_token?: string;
  token?: string;
  accessToken?: string;
}

export interface Review {
  _id: string;
  user: User | string;
  product: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  variant?: Variant;
  variant_id?: string;
  quantity: number;
  price: number;
}

export interface CartData {
  _id?: string;
  user?: string;
  items: CartItem[];
  totalAmount?: number;
  totalPrice?: number;
  discountAmount?: number;
  finalTotal?: number;
  appliedCoupon?: Coupon | null;
  updatedAt?: string;
}

export interface Coupon {
  _id: string;
  id?: string;
  code: string;
  discount_type: "percentage" | "fixed" | "PERCENTAGE" | "FIXED";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  expiry_date?: string;
  start_date?: string;
  end_date?: string;
  isActive: boolean;
  is_active?: boolean;
  usage_limit: number;
  used_count: number;
  applicable_products?: string[];
  products?: any[];
}

export interface Address {
  id: string;
  _id?: string;
  user: string;
  addressLine1: string;
  address_line_1?: string;
  addressLine2?: string;
  address_line_2?: string;
  city: string;
  state: string;
  postalCode: string;
  postal_code?: string;
  country: string;
  addressType: "home" | "office" | "other";
  isDefault: boolean;
  is_default?: boolean;
  isdefault?: boolean;
  full_name?: string;
  fullname?: string;
  addressline1?: string;
  postalcode?: string;
}

export interface Order {
  id: string;
  _id?: string;
  user?: string | User;
  userId?: string | User;
  items: CartItem[];
  totalAmount: number;
  total_amount?: number;
  totalPrice?: number;
  status: string;
  orderStatus?: string;
  order_status?: string;
  paymentStatus?: string;
  payment_status?: string;
  isPaid?: boolean;
  shippingAddress: Address | string;
  address?: Address;
  coupon?: string | Coupon;
  payments?: any[];
  payment?: any;
  createdAt: string;
  created_at?: string;
}

export interface OrderMeta {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface Payment {
  _id: string;
  id?: string;
  orderId?: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  created_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    totalItems?: number;
    pageCount?: number;
    count?: number;
  };
  pagination?: any;
  categories?: any[];
  products?: any[];
}

export interface VariantFormData {
  id?: string;
  _id?: string;
  color?: string;
  size?: string;
  price: string | number;
  stock_qty: string | number;
  sku: string;
  stockQty?: string | number;
}

export interface ProductFormData {
  name: string;
  description: string;
  brand: string;
  category: string;
  image: File | string | null;
  images: (File | string | ProductImage)[];
  has_variants: boolean;
  variants: VariantFormData[];
  specifications?: Record<string, string>;
  isActive: boolean;
  mainImageIndex: number;
  availability: string;
  [key: string]: any;
}
