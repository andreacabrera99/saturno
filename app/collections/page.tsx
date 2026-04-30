export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { Collection } from "@/types";
import Link from "next/link";

async function getCollections() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  return (data || []) as Collection[];
}

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-light tracking-tight text-stone-900 mb-8">
        Colecciones
      </h1>

      {collections.length === 0 ? (
        <p className="text-stone-400 text-sm py-16 text-center">
          Próximamente...
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group"
            >
              <div className="relative aspect-[4/3] bg-stone-100 rounded-md overflow-hidden mb-3">
                {col.cover_image_url ? (
                  <img
                    src={col.cover_image_url}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-200" />
                )}
              </div>
              <h2 className="font-medium text-stone-900">{col.name}</h2>
              {col.description && (
                <p className="text-sm text-stone-500 mt-0.5 line-clamp-2">
                  {col.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
