export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/products/ProductGrid";
import { Product, Category, CATEGORY_LABELS } from "@/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

const VALID_CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ size?: string; sort?: string }>;
}

async function getProducts(category: Category, size?: string, sort?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(`*, images:product_images(*), sizes:product_sizes(*)`)
    .eq("is_active", true)
    .eq("is_archived", false)
    .eq("category", category);

  if (sort === "price_asc") query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data } = await query;
  let products = (data || []) as Product[];

  if (size) {
    products = products.filter((p) =>
      p.sizes?.some((s) => s.size === size && s.stock > 0)
    );
  }

  return products;
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const sp = await searchParams;

  if (!VALID_CATEGORIES.includes(category as Category)) notFound();

  const cat = category as Category;
  const products = await getProducts(cat, sp.size, sp.sort);

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const sorts = [
    { value: "", label: "Más recientes" },
    { value: "price_asc", label: "Precio: menor a mayor" },
    { value: "price_desc", label: "Precio: mayor a menor" },
  ];

  function buildHref(size?: string, sort?: string) {
    const p = new URLSearchParams();
    if (size) p.set("size", size);
    if (sort) p.set("sort", sort);
    const s = p.toString();
    return `/shop/${category}${s ? `?${s}` : ""}`;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-light tracking-tight text-stone-900">
          {CATEGORY_LABELS[cat]}
        </h1>
        <p className="text-sm text-stone-500 mt-1">{products.length} piezas</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-stone-400 self-center">Talla:</span>
          <Link
            href={buildHref(undefined, sp.sort)}
            className={cn(
              "px-3 py-1 text-xs border rounded-full transition-colors",
              !sp.size
                ? "bg-stone-900 text-white border-stone-900"
                : "border-stone-300 text-stone-600 hover:border-stone-900"
            )}
          >
            Todas
          </Link>
          {sizes.map((s) => (
            <Link
              key={s}
              href={buildHref(s, sp.sort)}
              className={cn(
                "px-3 py-1 text-xs border rounded-full transition-colors",
                sp.size === s
                  ? "bg-stone-900 text-white border-stone-900"
                  : "border-stone-300 text-stone-600 hover:border-stone-900"
              )}
            >
              {s}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-stone-400">Ordenar:</span>
          <div className="flex gap-1">
            {sorts.map((sort) => (
              <Link
                key={sort.value}
                href={buildHref(sp.size, sort.value || undefined)}
                className={cn(
                  "px-3 py-1 text-xs border rounded-full transition-colors",
                  (sp.sort || "") === sort.value
                    ? "bg-stone-900 text-white border-stone-900"
                    : "border-stone-300 text-stone-600 hover:border-stone-900"
                )}
              >
                {sort.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({ category }));
}
