import { Product } from "@/types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  wishlistedIds?: string[];
  onWishlistToggle?: (productId: string) => void;
}

export default function ProductGrid({
  products,
  wishlistedIds = [],
  onWishlistToggle,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center text-stone-400">
        <p className="text-sm">No hay productos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isWishlisted={wishlistedIds.includes(product.id)}
          onWishlistToggle={onWishlistToggle}
        />
      ))}
    </div>
  );
}
