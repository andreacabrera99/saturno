import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Order } from "@/types";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { Package, Heart, LogOut } from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";

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

async function getAccountData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return { profile, orders: (orders || []) as Order[] };
}

export default async function AccountPage() {
  const { profile, orders } = await getAccountData();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-stone-900">
            Mi cuenta
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Hola, {profile?.full_name || "bienvenida"}
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link
          href="/account/orders"
          className="flex items-center gap-3 p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <Package size={20} className="text-stone-400" />
          <div>
            <p className="text-sm font-medium text-stone-900">Mis pedidos</p>
            <p className="text-xs text-stone-400">{orders.length} en total</p>
          </div>
        </Link>
        <Link
          href="/account/wishlist"
          className="flex items-center gap-3 p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <Heart size={20} className="text-stone-400" />
          <div>
            <p className="text-sm font-medium text-stone-900">
              Lista de deseos
            </p>
            <p className="text-xs text-stone-400">Ver guardados</p>
          </div>
        </Link>
      </div>

      {orders.length > 0 && (
        <div>
          <h2 className="font-medium text-stone-900 mb-4">Pedidos recientes</h2>
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="border border-stone-100 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-mono text-stone-400">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm font-medium text-stone-900 mt-0.5">
                      {formatPrice(order.total)}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANTS[order.status]}>
                    {STATUS_LABELS[order.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/account/orders"
            className="block text-center text-sm text-stone-500 hover:text-stone-900 mt-4 transition-colors"
          >
            Ver todos los pedidos →
          </Link>
        </div>
      )}
    </div>
  );
}
