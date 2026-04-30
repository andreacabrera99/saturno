export const dynamic = "force-dynamic";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Product, Collection } from "@/types";
import { ArrowRight } from "lucide-react";
import IntroAnimation from "@/components/IntroAnimation";

async function getHomeData() {
  const supabase = await createClient();

  const [{ data: products }, { data: collections }] = await Promise.all([
    supabase
      .from("products")
      .select(`*, images:product_images(*)`)
      .eq("is_active", true)
      .eq("is_archived", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("collections")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  return {
    products: (products || []) as Product[],
    collections: (collections || []) as Collection[],
  };
}

export default async function HomePage() {
  const { products, collections } = await getHomeData();
  const images = products
    .flatMap((p) => (p.images || []).map((img) => img.url))
    .filter(Boolean);

  return (
    <div className="bg-white">
      <IntroAnimation images={images} />
      <BrandHero collections={collections} />
    </div>
  );
}

function BrandHero({ collections }: { collections: Collection[] }) {
  return (
    <>
      {/* Logo section */}
      <section
        id="brand"
        className="w-full min-h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden px-4"
      >
        <div className="text-center max-w-sm">
          <Image
            src="/logo.avif"
            alt="Saturno"
            width={800}
            height={260}
            className="object-contain mx-auto mb-8"
            priority
          />
          <p className="text-stone-400 text-sm leading-relaxed mb-8">
            Moda consciente.
  
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-stone-900 text-white text-sm px-6 py-2.5 rounded-full hover:bg-stone-700 transition-colors"
          >
            Explorar tienda
          </Link>
        </div>
      </section>

      {/* Collections */}
      {collections.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-base font-medium text-stone-900 tracking-tight">
              Colecciones
            </h2>
            <Link
              href="/collections"
              className="text-xs text-stone-400 hover:text-stone-900 flex items-center gap-1 transition-colors"
            >
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {collections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.slug}`}
                className="group relative aspect-[4/3] bg-stone-100 rounded-2xl overflow-hidden"
              >
                {col.cover_image_url && (
                  <img
                    src={col.cover_image_url}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4">
                  <span className="text-white text-sm font-medium bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                    {col.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* About strip */}
      <section className="bg-white border-t border-stone-100">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-xs tracking-[0.25em] uppercase mb-4 text-stone-400">
            Sobre Saturno
          </p>
          <p className="text-stone-600 text-sm leading-relaxed mb-6 max-w-md mx-auto">
            Soy Xim, diseñadora de modas y creadora de Saturno. Nació en la
            pandemia y se volvió mi estilo de vida. Cada pieza tiene mucha
            dedicación y amor por la Tierra.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 border border-stone-200 px-4 py-2 rounded-full hover:border-stone-400 transition-colors"
          >
            Conocer más <ArrowRight size={12} />
          </Link>
        </div>
      </section>
    </>
  );
}
