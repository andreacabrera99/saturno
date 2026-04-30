import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div>
      <nav className="bg-stone-900 text-white px-4 py-2 flex items-center gap-4 text-sm">
        <Link
          href="/admin"
          className="font-medium text-white tracking-widest uppercase text-xs"
        >
          Saturno Admin
        </Link>
        <span className="text-stone-600">|</span>
        {[
          { href: "/admin/products", label: "Productos" },
          { href: "/admin/collections", label: "Colecciones" },
          { href: "/admin/orders", label: "Pedidos" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-stone-300 hover:text-white transition-colors"
          >
            {l.label}
          </Link>
        ))}
        <Link href="/" className="ml-auto text-stone-400 hover:text-white transition-colors text-xs">
          ← Ver tienda
        </Link>
      </nav>
      {children}
    </div>
  );
}
