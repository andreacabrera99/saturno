"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function CartPage() {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const lineItems = items.map((item) => ({
        name: `${item.product.name} — Talla ${item.size}`,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images?.[0]?.url ?? null,
      }));
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lineItems }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar el pago");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={40} className="text-stone-300 mx-auto mb-4" />
        <h1 className="text-xl font-light text-stone-900 mb-2">
          Tu carrito está vacío
        </h1>
        <p className="text-stone-500 text-sm mb-6">
          Explora nuestra colección y encuentra algo que te encante.
        </p>
        <Link href="/shop">
          <Button size="lg">Ir a la tienda</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light tracking-tight text-stone-900">
          Tu carrito
        </h1>
        <button
          onClick={clearCart}
          className="text-xs text-stone-400 hover:text-red-500 transition-colors"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => {
            const image = item.product.images?.[0];
            return (
              <div
                key={item.id}
                className="flex gap-4 pb-4 border-b border-stone-100"
              >
                <div className="relative w-24 h-28 bg-stone-100 rounded-md overflow-hidden shrink-0">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.alt || item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="text-sm font-medium text-stone-900 hover:text-stone-600 line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-stone-500 mt-1">
                    Talla: {item.size}
                  </p>
                  <p className="text-sm font-medium text-stone-900 mt-1">
                    {formatPrice(item.product.price)}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="p-1.5 text-stone-400 hover:text-stone-900 border border-stone-200 rounded"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="p-1.5 text-stone-400 hover:text-stone-900 border border-stone-200 rounded"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-auto p-1.5 text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-stone-50 rounded-lg p-5 h-fit space-y-4">
          <h2 className="font-medium text-stone-900">Resumen del pedido</h2>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Subtotal</span>
            <span className="font-medium">{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Envío</span>
            <span className="text-stone-400">Se calcula en el pago</span>
          </div>
          <div className="border-t border-stone-200 pt-3 flex justify-between font-medium">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}
          <Button
            size="lg"
            className="w-full mt-2"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? "Redirigiendo..." : "Proceder al pago"}
          </Button>
          <Link href="/shop">
            <Button variant="ghost" size="sm" className="w-full">
              Seguir comprando
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
