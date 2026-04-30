import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types";
import ProductGrid from "@/components/products/ProductGrid";
import { Heart } from "lucide-react";

async function getWishlist() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("wishlists")
    .select(
      `product:products(*, images:product_images(*), sizes:product_sizes(*))`
    )
    .eq("user_id", user.id);

  return {
    products: (data || [])
      .map((d: any) => d.product as Product)
      .filter(Boolean),
    userId: user.id,
  };
}

export default async function WishlistPage() {
  const { products } = await getWishlist();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-8">
        <Link
          href="/account"
          className="text-stone-400 hover:text-stone-900 text-sm transition-colors"
        >
          Mi cuenta
        </Link>
        <span className="text-stone-300">/</span>
        <h1 className="text-sm font-medium text-stone-900">Lista de deseos</h1>
      </div>

      {products.length === 0 ? (
        <div className="py-16 text-center">
          <Heart size={36} className="text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">
            Aún no has guardado ningún producto.
          </p>
          <Link href="/shop" className="block mt-4">
            <span className="text-sm text-stone-900 underline underline-offset-2">
              Explorar tienda
            </span>
          </Link>
        </div>
      ) : (
        <ProductGrid
          products={products}
          wishlistedIds={products.map((p) => p.id)}
        />
      )}
    </div>
  );
}
