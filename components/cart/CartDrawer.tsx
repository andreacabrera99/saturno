"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, total, removeItem, updateQuantity } = useCart();

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-50 transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">
            Tu carrito{" "}
            {items.length > 0 && (
              <span className="text-stone-400 font-normal text-sm">
                ({items.length})
              </span>
            )}
          </h2>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-900">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <p className="text-sm">Tu carrito está vacío</p>
              <button
                onClick={onClose}
                className="mt-4 text-sm text-stone-900 underline underline-offset-2"
              >
                Seguir explorando
              </button>
            </div>
          ) : (
            items.map((item) => {
              const image = item.product.images?.[0];
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-20 h-24 bg-stone-100 rounded-md overflow-hidden shrink-0">
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
                    <p className="text-sm font-medium text-stone-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Talla: {item.size}
                    </p>
                    <p className="text-sm font-medium text-stone-900 mt-1">
                      {formatPrice(item.product.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 text-stone-400 hover:text-stone-900 border border-stone-200 rounded"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 text-stone-400 hover:text-stone-900 border border-stone-200 rounded"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto p-1 text-stone-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-100 px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Subtotal</span>
              <span className="font-semibold text-stone-900">
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Envío calculado al momento del pago
            </p>
            <Link href="/checkout" onClick={onClose}>
              <Button className="w-full" size="lg">
                Proceder al pago
              </Button>
            </Link>
            <Link href="/cart" onClick={onClose}>
              <Button variant="secondary" className="w-full" size="lg">
                Ver carrito
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
