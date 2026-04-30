export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/products/ProductCard";
import { Product, Category, CATEGORY_LABELS } from "@/types";
import Link from "next/link";

const CATEGORIES: Category[] = [
  "bolsas",
  "chamarras",
  "faldas",
  "pantalones",
  "playeras-y-tops",
  "chicos",
];

async function getAllProducts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(`*, images:product_images(*), sizes:product_sizes(*)`)
    .eq("is_active", true)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });
  return (data || []) as Product[];
}

export default async function ShopPage() {
  const products = await getAllProducts();

  const byCategory = new Map<Category, Product[]>(
    CATEGORIES.map((cat) => [cat, products.filter((p) => p.category === cat)])
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-16">
      <h1 className="text-2xl font-light tracking-tight text-stone-900">Tienda</h1>

      {CATEGORIES.map((cat) => {
        const items = byCategory.get(cat) ?? [];
        if (items.length === 0) return null;
        return (
          <section key={cat}>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-xl font-light tracking-tight text-stone-900">
                {CATEGORY_LABELS[cat]}
              </h2>
              <Link
                href={`/shop/${cat}`}
                className="text-xs text-stone-500 hover:text-stone-900 transition-colors"
              >
                Ver todos ({items.length})
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {items.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
