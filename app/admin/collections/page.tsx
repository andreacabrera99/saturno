export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { Collection } from "@/types";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import Badge from "@/components/ui/Badge";
import ToggleCollectionButton from "@/components/admin/ToggleCollectionButton";

async function getCollections() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("*")
    .order("created_at", { ascending: false });
  return (data || []) as Collection[];
}

export default async function AdminCollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light tracking-tight text-stone-900">
          Colecciones
        </h1>
        <Link
          href="/admin/collections/new"
          className="inline-flex items-center gap-2 bg-stone-900 text-white px-4 py-2 text-sm font-medium hover:bg-stone-700 transition-colors rounded-md"
        >
          <Plus size={16} />
          Nueva
        </Link>
      </div>

      <div className="space-y-2">
        {collections.map((col) => (
          <div
            key={col.id}
            className="flex items-center gap-4 p-4 border border-stone-100 rounded-lg"
          >
            <div className="w-12 h-12 bg-stone-100 rounded overflow-hidden shrink-0">
              {col.cover_image_url && (
                <img
                  src={col.cover_image_url}
                  alt={col.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-stone-900">{col.name}</p>
              {col.description && (
                <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
                  {col.description}
                </p>
              )}
            </div>
            <Badge variant={col.is_active ? "success" : "default"}>
              {col.is_active ? "Activa" : "Inactiva"}
            </Badge>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/collections/${col.id}/edit`}
                className="p-1.5 text-stone-400 hover:text-stone-900 transition-colors"
              >
                <Pencil size={14} />
              </Link>
              <ToggleCollectionButton
                collectionId={col.id}
                isActive={col.is_active}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
