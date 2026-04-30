"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface FormData {
  full_name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState<FormData>({
    full_name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paypalError, setPaypalError] = useState<string | null>(null);

  if (items.length === 0 && !orderId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-stone-500 mb-4">Tu carrito está vacío.</p>
        <Link href="/shop">
          <Button>Ir a la tienda</Button>
        </Link>
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-light text-stone-900 mb-2">¡Pedido confirmado!</h1>
        <p className="text-stone-500 text-sm mb-2">
          Tu número de pedido es:{" "}
          <span className="font-mono text-stone-900 font-medium">
            {orderId.slice(0, 8).toUpperCase()}
          </span>
        </p>
        <p className="text-stone-400 text-sm mb-8">
          Recibirás confirmación por correo pronto. Gracias por apoyar a Saturno 🌿
        </p>
        <Link href="/account/orders">
          <Button size="lg">Ver mis pedidos</Button>
        </Link>
        <Link href="/shop" className="block mt-3">
          <Button variant="ghost" size="lg">Seguir comprando</Button>
        </Link>
      </div>
    );
  }

  function validate() {
    const e: Partial<FormData> = {};
    if (!form.full_name.trim()) e.full_name = "Campo requerido";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Email inválido";
    if (!form.address.trim()) e.address = "Campo requerido";
    if (!form.city.trim()) e.city = "Campo requerido";
    if (!form.state.trim()) e.state = "Campo requerido";
    if (!form.zip.trim()) e.zip = "Campo requerido";
    return e;
  }

  async function createPayPalOrder() {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      throw new Error("Formulario incompleto");
    }
    setErrors({});
    const res = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al crear pago");
    return data.id as string;
  }

  async function onApprove({ orderID }: { orderID: string }) {
    setPaypalError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const serializedItems = items.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.images?.[0]?.url ?? null,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.product.price,
    }));

    const res = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paypalOrderId: orderID,
        form,
        items: serializedItems,
        userId: user?.id ?? null,
        total,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setPaypalError(data.error || "Error al confirmar el pago.");
      return;
    }
    clearCart();
    setOrderId(data.orderId);
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        currency: "MXN",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-light tracking-tight text-stone-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Shipping form */}
          <div className="space-y-4">
            <h2 className="font-medium text-stone-900">Datos de envío</h2>

            <Input
              label="Nombre completo"
              id="full_name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              error={errors.full_name}
            />
            <Input
              label="Correo electrónico"
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />
            <Input
              label="Dirección"
              id="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              error={errors.address}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Ciudad"
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                error={errors.city}
              />
              <Input
                label="Estado"
                id="state"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                error={errors.state}
              />
            </div>
            <Input
              label="Código postal"
              id="zip"
              value={form.zip}
              onChange={(e) => setForm({ ...form, zip: e.target.value })}
              error={errors.zip}
            />
            <div className="flex flex-col gap-1">
              <label htmlFor="notes" className="text-sm font-medium text-stone-700">
                Notas del pedido (opcional)
              </label>
              <textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="px-3 py-2.5 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition-colors resize-none"
                placeholder="Instrucciones especiales de entrega..."
              />
            </div>

            <div className="pt-2">
              {paypalError && (
                <p className="text-sm text-red-500 mb-3">{paypalError}</p>
              )}
              <PayPalButtons
                style={{ layout: "vertical", shape: "rect", label: "pay" }}
                createOrder={createPayPalOrder}
                onApprove={onApprove}
                onError={() => setPaypalError("Ocurrió un error con PayPal. Intenta de nuevo.")}
              />
            </div>
          </div>

          {/* Order summary */}
          <div>
            <h2 className="font-medium text-stone-900 mb-4">Tu pedido</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => {
                const image = item.product.images?.[0];
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-14 h-16 bg-stone-100 rounded shrink-0 overflow-hidden">
                      {image ? (
                        <Image src={image.url} alt={item.product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-stone-200" />
                      )}
                      <span className="absolute -top-1 -right-1 bg-stone-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-stone-500">Talla: {item.size}</p>
                    </div>
                    <p className="text-sm font-medium text-stone-900 shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-stone-200 pt-3 flex justify-between font-medium">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
