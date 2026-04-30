export type Category =
  | "bolsas"
  | "chamarras"
  | "chicos"
  | "faldas"
  | "pantalones"
  | "playeras-y-tops";

export const CATEGORY_LABELS: Record<Category, string> = {
  bolsas: "Bolsas",
  chamarras: "Chamarras",
  chicos: "Chicos",
  faldas: "Faldas",
  pantalones: "Pantalones",
  "playeras-y-tops": "Playeras y tops",
};

export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "Única";

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  position: number;
}

export interface ProductSize {
  id: string;
  product_id: string;
  size: Size;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: Category;
  is_active: boolean;
  is_archived: boolean;
  care_instructions: string | null;
  fit_notes: string | null;
  created_at: string;
  updated_at: string;
  images: ProductImage[];
  sizes: ProductSize[];
  collections?: Collection[];
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface OutfitPairing {
  id: string;
  product_id: string;
  paired_product_id: string;
  paired_product?: Product;
}

export interface CartItem {
  id: string;
  product: Product;
  size: Size;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  total: number;
  shipping_name: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  notes: string | null;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  size: Size;
  quantity: number;
  unit_price: number;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "customer" | "admin";
  created_at: string;
}
