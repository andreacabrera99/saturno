"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Heart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import CartDrawer from "@/components/cart/CartDrawer";
import Image from "next/image";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const CATEGORIES = [
  { label: "Todo", href: "/shop" },
  { label: "Bolsas", href: "/shop/bolsas" },
  { label: "Chamarras", href: "/shop/chamarras" },
  { label: "Faldas", href: "/shop/faldas" },
  { label: "Pantalones", href: "/shop/pantalones" },
  { label: "Playeras y tops", href: "/shop/playeras-y-tops" },
  { label: "Chicos", href: "/shop/chicos" },
  { label: "Colecciones", href: "/collections" },
  { label: "Tallas", href: "/tallas" },
];

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { itemCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-colors",
          isHome
            ? "bg-white/70 backdrop-blur-md border-b border-white/20"
            : "bg-white border-b border-stone-100"
        )}
      >
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          {/* Left — hamburger + Shop pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
              aria-label="Menú"
            >
              {menuOpen ? <X size={14} /> : <Menu size={14} />}
            </button>
            <Link
              href="/shop"
              className="hidden sm:flex items-center h-8 px-4 rounded-full bg-stone-100 text-stone-700 text-xs font-medium hover:bg-stone-200 transition-colors"
            >
              Tienda
            </Link>
          </div>

          {/* Center — logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Image
              src="/logo.avif"
              alt="Saturno"
              width={100}
              height={32}
              className="object-contain h-8 w-auto"
              priority
            />
          </Link>

          {/* Right — cart count */}
          <div className="flex items-center gap-2">
            <Link
              href={user ? "/account" : "/login"}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
            >
              <User size={14} />
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-700 text-xs font-medium hover:bg-stone-200 transition-colors relative"
              aria-label="Carrito"
            >
              {itemCount > 0 ? (
                <span className="font-medium text-xs">{itemCount > 9 ? "9+" : itemCount}</span>
              ) : (
                <span className="text-xs text-stone-400">0</span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile full-menu drawer */}
        {menuOpen && (
          <div className="border-t border-stone-100 bg-white">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className={cn(
                  "block px-6 py-3.5 text-sm border-b border-stone-50 last:border-0 transition-colors",
                  pathname === cat.href
                    ? "text-stone-900 font-medium"
                    : "text-stone-500 hover:text-stone-900"
                )}
              >
                {cat.label}
              </Link>
            ))}
            <div className="px-6 py-3 border-t border-stone-100 flex flex-col gap-4">
              <Link href="/account/wishlist" className="flex items-center gap-1.5 text-xs text-stone-400">
                <Heart size={13} /> Favoritos
              </Link>
              <Link href={user ? "/account" : "/login"} className="flex items-center gap-1.5 text-xs text-stone-400">
                <User size={13} /> Cuenta
              </Link>
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
