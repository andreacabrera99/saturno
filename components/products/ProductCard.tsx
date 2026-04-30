"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import WishlistButton from "@/components/WishlistButton";

interface ProductCardProps {
  product: Product;
  onWishlistToggle?: (productId: string) => void;
  isWishlisted?: boolean;
}

export default function ProductCard({
  product,
  onWishlistToggle,
  isWishlisted = false,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const images = product.images || [];
  const primaryImage = images[0];
  const hoverImage = images[1];

  return (
    <div className="group">
      <Link href={`/products/${product.slug}`}>
        <div
          className="relative aspect-[3/4] bg-stone-100 rounded-md overflow-hidden mb-3"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {primaryImage ? (
            <>
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt || product.name}
                fill
                className={cn(
                  "object-cover transition-opacity duration-500",
                  hovered && hoverImage ? "opacity-0" : "opacity-100"
                )}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {hoverImage && (
                <Image
                  src={hoverImage.url}
                  alt={hoverImage.alt || product.name}
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-500 absolute inset-0",
                    hovered ? "opacity-100" : "opacity-0"
                  )}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-stone-200 flex items-center justify-center">
              <span className="text-stone-400 text-sm">Sin imagen</span>
            </div>
          )}

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <WishlistButton productId={product.id} />
          </div>
        </div>
      </Link>

      <div>
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-medium text-stone-900 hover:text-stone-600 transition-colors line-clamp-1"
        >
          {product.name}
        </Link>
        <p className="text-sm text-stone-500 mt-0.5">{formatPrice(product.price)}</p>
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {product.sizes
              .filter((s) => s.stock > 0)
              .map((s) => (
                <span key={s.id} className="text-xs text-stone-400">
                  {s.size}
                </span>
              ))
              .reduce<React.ReactNode[]>((acc, el, i) => {
                if (i > 0) acc.push(<span key={`sep-${i}`} className="text-xs text-stone-300">·</span>);
                acc.push(el);
                return acc;
              }, [])}
          </div>
        )}
      </div>
    </div>
  );
}
