import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Order } from "@/types";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { Package } from "lucide-react";

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_VARIANTS: Record<
  Order["status"],
  "default" | "success" | "warning" | "danger"
> = {
  pending: "warning",
  confirmed: "default",
  shipped: "default",
  delivered: "success",
  cancelled: "danger",
};

async function getOrders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data || []) as Order[];
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-8">
        <Link
          href="/account"
          className="text-stone-400 hover:text-stone-900 text-sm transition-colors"
        >
          Mi cuenta
        </Link>
        <span className="text-stone-300">/</span>
        <h1 className="text-sm font-medium text-stone-900">Mis pedidos</h1>
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <Package size={36} className="text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">Aún no tienes pedidos.</p>
          <Link href="/shop" className="block mt-4">
            <span className="text-sm text-stone-900 underline underline-offset-2">
              Explorar tienda
            </span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-stone-100 rounded-lg p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-mono text-stone-400">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_VARIANTS[order.status]}>
                    {STATUS_LABELS[order.status]}
                  </Badge>
                  <span className="font-medium text-stone-900 text-sm">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="text-sm text-stone-500 space-y-1">
                  {order.items.map((item) => (
                    <p key={item.id}>
                      {item.product_name} × {item.quantity} — Talla {item.size}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
