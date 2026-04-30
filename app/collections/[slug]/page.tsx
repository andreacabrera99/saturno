import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Product, Collection } from "@/types";
import ProductGrid from "@/components/products/ProductGrid";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCollection(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return data as Collection | null;
}

async function getCollectionProducts(collectionId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_collections")
    .select(
      `product:products(*, images:product_images(*), sizes:product_sizes(*))`
    )
    .eq("collection_id", collectionId);
  return (data || [])
    .map((d: any) => d.product as Product)
    .filter((p) => p?.is_active && !p?.is_archived);
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) notFound();

  const products = await getCollectionProducts(collection.id);

  return (
    <div>
      {/* Banner */}
      <div className="relative bg-stone-100 overflow-hidden">
        {collection.cover_image_url && (
          <img
            src={collection.cover_image_url}
            alt={collection.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="relative bg-black/30 px-4 py-20 text-center">
          <h1 className="text-3xl md:text-4xl font-light text-white tracking-tight">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-white/80 mt-3 max-w-md mx-auto text-sm leading-relaxed">
              {collection.description}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-sm text-stone-400 mb-8">{products.length} piezas</p>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
