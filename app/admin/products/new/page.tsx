import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";

async function getCollections() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("id, name")
    .eq("is_active", true);
  return data || [];
}

export default async function NewProductPage() {
  const collections = await getCollections();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-8">
        <Link
          href="/admin/products"
          className="text-stone-400 hover:text-stone-900 text-sm transition-colors"
        >
          Productos
        </Link>
        <span className="text-stone-300">/</span>
        <h1 className="text-sm font-medium text-stone-900">Nuevo producto</h1>
      </div>

      <ProductForm collections={collections} />
    </div>
  );
}
