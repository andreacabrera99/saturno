export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Package, FolderOpen, ShoppingCart } from "lucide-react";

async function getStats() {
  const supabase = await createClient();
  const [
    { count: products },
    { count: collections },
    { count: orders },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_archived", false),
    supabase
      .from("collections")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);
  return { products: products ?? 0, collections: collections ?? 0, orders: orders ?? 0 };
}

export default async function AdminPage() {
  const stats = await getStats();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-light tracking-tight text-stone-900 mb-8">
        Panel de administración
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          {
            icon: Package,
            label: "Productos activos",
            value: stats.products,
            href: "/admin/products",
          },
          {
            icon: FolderOpen,
            label: "Colecciones",
            value: stats.collections,
            href: "/admin/collections",
          },
          {
            icon: ShoppingCart,
            label: "Pedidos pendientes",
            value: stats.orders,
            href: "/admin/orders",
          },
        ].map((stat) => (
          <Link
            key={stat.href}
            href={stat.href}
            className="flex items-center gap-4 p-5 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <stat.icon size={24} className="text-stone-400" />
            <div>
              <p className="text-2xl font-semibold text-stone-900">
                {stat.value}
              </p>
              <p className="text-sm text-stone-500">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { href: "/admin/products/new", label: "Agregar producto" },
          { href: "/admin/collections/new", label: "Nueva colección" },
          { href: "/admin/orders", label: "Ver pedidos" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="block text-center py-3 border border-stone-200 rounded-lg text-sm text-stone-700 hover:border-stone-900 hover:text-stone-900 transition-colors"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
