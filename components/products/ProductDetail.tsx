"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import { Product, Size } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";
import ProductGrid from "./ProductGrid";
import WishlistButton from "@/components/WishlistButton";
import StripeBuyButton from "@/components/StripeBuyButton";
import { STRIPE_BUY_BUTTONS } from "@/lib/stripe-buttons";

interface Props {
  product: Product;
  pairings?: Product[];
}

export default function ProductDetail({ product, pairings = [] }: Props) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [fitOpen, setFitOpen] = useState(false);
  const [careOpen, setCareOpen] = useState(false);

  const images = product.images || [];
  const availableSizes = (product.sizes || []).filter((s) => s.stock > 0);

  function handleAddToCart() {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addItem(product, selectedSize);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-[3/4] bg-stone-100 rounded-md overflow-hidden">
            {images[activeImage] ? (
              <Image
                src={images[activeImage].url}
                alt={images[activeImage].alt || product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-stone-200 flex items-center justify-center">
                <span className="text-stone-400 text-sm">Sin imagen</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative w-16 h-20 shrink-0 rounded overflow-hidden border-2 transition-colors",
                    activeImage === i
                      ? "border-stone-900"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || product.name}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">
              {product.category.replace("-", " ")}
            </p>
            <h1 className="text-2xl font-medium text-stone-900">
              {product.name}
            </h1>
            <p className="text-xl text-stone-700 mt-2">
              {formatPrice(product.price)}
            </p>
          </div>

          <p className="text-sm text-stone-600 leading-relaxed">
            {product.description}
          </p>

          {/* Size selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-stone-900">Talla</p>
              <div className="flex items-center gap-3">
                {sizeError && (
                  <p className="text-xs text-red-500">Selecciona una talla</p>
                )}
                <Link href="/tallas" className="text-xs text-stone-400 hover:text-stone-700 underline underline-offset-2 transition-colors">
                  Guía de tallas
                </Link>
              </div>
            </div>
            {availableSizes.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {availableSizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedSize(s.size as Size);
                      setSizeError(false);
                    }}
                    className={cn(
                      "px-4 py-2 text-sm border rounded-md transition-colors",
                      selectedSize === s.size
                        ? "bg-stone-900 text-white border-stone-900"
                        : "border-stone-300 text-stone-700 hover:border-stone-900"
                    )}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-red-500">Agotado</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={availableSizes.length === 0}
            >
              <ShoppingBag size={16} className="mr-2" />
              {addedToCart ? "¡Agregado!" : "Agregar al carrito"}
            </Button>
            <WishlistButton
              productId={product.id}
              size={18}
              className="w-12 h-12 border border-stone-200 rounded-md bg-white hover:border-stone-400"
            />
          </div>

          {STRIPE_BUY_BUTTONS[product.slug] && (
            <div className="mt-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-stone-100" />
                <span className="text-xs text-stone-400">
                  o compra directamente
                </span>
                <div className="flex-1 h-px bg-stone-100" />
              </div>
              <div className="flex justify-center">
                <StripeBuyButton buyButtonId={STRIPE_BUY_BUTTONS[product.slug]} />
              </div>
            </div>
          )}

          {/* Fit notes */}
          {product.fit_notes && (
            <div className="border-t border-stone-100 pt-4">
              <button
                onClick={() => setFitOpen(!fitOpen)}
                className="flex items-center justify-between w-full text-sm font-medium text-stone-900 py-1"
              >
                Tallas y ajuste
                {fitOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {fitOpen && (
                <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                  {product.fit_notes}
                </p>
              )}
            </div>
          )}

          {/* Care instructions */}
          {product.care_instructions && (
            <div className="border-t border-stone-100 pt-4">
              <button
                onClick={() => setCareOpen(!careOpen)}
                className="flex items-center justify-between w-full text-sm font-medium text-stone-900 py-1"
              >
                Cuidados
                {careOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {careOpen && (
                <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                  {product.care_instructions}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Outfit pairings */}
      {pairings.length > 0 && (
        <div className="mt-16 border-t border-stone-100 pt-12">
          <h2 className="text-lg font-light tracking-tight text-stone-900 mb-6">
            Combínalo con
          </h2>
          <ProductGrid products={pairings} />
        </div>
      )}
    </div>
  );
}
