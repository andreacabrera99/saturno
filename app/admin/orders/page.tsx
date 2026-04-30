export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { Order } from "@/types";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import UpdateOrderStatusButton from "@/components/admin/UpdateOrderStatusButton";

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
  const { data } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false });
  return (data || []) as Order[];
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-light tracking-tight text-stone-900 mb-8">
        Pedidos
      </h1>

      {orders.length === 0 ? (
        <p className="text-stone-400 text-sm py-10 text-center">
          Aún no hay pedidos.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-stone-100 rounded-lg p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs font-mono text-stone-400">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="font-medium text-stone-900 mt-0.5">
                    {order.shipping_name}
                  </p>
                  <p className="text-xs text-stone-400">
                    {order.shipping_email}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {order.shipping_address}, {order.shipping_city},{" "}
                    {order.shipping_state} {order.shipping_zip}
                  </p>
                  <p className="text-xs text-stone-300 mt-0.5">
                    {new Date(order.created_at).toLocaleString("es-MX")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-stone-900">
                    {formatPrice(order.total)}
                  </span>
                  <Badge variant={STATUS_VARIANTS[order.status]}>
                    {STATUS_LABELS[order.status]}
                  </Badge>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="text-sm text-stone-600 space-y-1 mb-3 border-t border-stone-50 pt-3">
                  {order.items.map((item) => (
                    <p key={item.id}>
                      {item.product_name} × {item.quantity} — Talla {item.size}{" "}
                      — {formatPrice(item.unit_price * item.quantity)}
                    </p>
                  ))}
                </div>
              )}

              {order.notes && (
                <p className="text-xs text-stone-500 italic mb-3">
                  Nota: {order.notes}
                </p>
              )}

              <UpdateOrderStatusButton order={order} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
