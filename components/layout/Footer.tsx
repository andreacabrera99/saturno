import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-stone-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-stone-400">
        <div className="col-span-2 md:col-span-1">
          <p className="font-medium text-stone-600 mb-2 tracking-widest uppercase text-[10px]">
            Saturno
          </p>
          <p className="leading-relaxed">
            Moda consciente.
          </p>
        </div>

        <div>
          <p className="font-medium text-stone-500 mb-2 uppercase tracking-widest text-[10px]">
            Tienda
          </p>
          <ul className="space-y-1.5">
            {[
              { href: "/shop", label: "Todo" },
              { href: "/shop/bolsas", label: "Bolsas" },
              { href: "/shop/chamarras", label: "Chamarras" },
              { href: "/shop/faldas", label: "Faldas" },
              { href: "/collections", label: "Colecciones" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-stone-700 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-medium text-stone-500 mb-2 uppercase tracking-widest text-[10px]">
            Cuenta
          </p>
          <ul className="space-y-1.5">
            {[
              { href: "/account", label: "Mi cuenta" },
              { href: "/account/orders", label: "Mis pedidos" },
              { href: "/account/wishlist", label: "Favoritos" },
              { href: "/about", label: "Sobre Saturno" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-stone-700 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-between">
          <a
            href="https://instagram.com/satuurnoooo"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone-700 transition-colors"
          >
            @satuurnoooo
          </a>
          <p className="mt-6">© {new Date().getFullYear()} Saturno</p>
        </div>
      </div>
    </footer>
  );
}
