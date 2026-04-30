import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(`*, images:product_images(*), sizes:product_sizes(*)`)
    .eq("id", id)
    .single();
  return data as Product | null;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

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
        <h1 className="text-sm font-medium text-stone-900">
          Editar: {product.name}
        </h1>
      </div>

      <ProductForm product={product} />
    </div>
  );
}
