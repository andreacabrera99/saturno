import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types";
import ProductDetail from "@/components/products/ProductDetail";
import ProductGrid from "@/components/products/ProductGrid";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      `*,
      images:product_images(*),
      sizes:product_sizes(*),
      collections:product_collections(collection:collections(*))`
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return data as (Product & { collections: { collection: any }[] }) | null;
}

async function getPairings(productId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("outfit_pairings")
    .select(
      `paired_product:products!outfit_pairings_paired_product_id_fkey(
        *, images:product_images(*), sizes:product_sizes(*)
      )`
    )
    .eq("product_id", productId);
  return (data || []).map((d: any) => d.paired_product as Product).filter(Boolean);
}

async function getRelated(category: string, currentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(`*, images:product_images(*), sizes:product_sizes(*)`)
    .eq("category", category)
    .eq("is_active", true)
    .eq("is_archived", false)
    .neq("id", currentId)
    .limit(4);
  return (data || []) as Product[];
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [pairings, related] = await Promise.all([
    getPairings(product.id),
    getRelated(product.category, product.id),
  ]);

  return (
    <div>
      <ProductDetail product={product} pairings={pairings} />

      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12 border-t border-stone-100">
          <h2 className="text-lg font-light tracking-tight text-stone-900 mb-6">
            También te puede gustar
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
