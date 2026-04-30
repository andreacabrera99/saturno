import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Collection } from "@/types";
import CollectionForm from "@/components/admin/CollectionForm";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

async function getCollection(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("*")
    .eq("id", id)
    .single();
  return data as Collection | null;
}

export default async function EditCollectionPage({ params }: Props) {
  const { id } = await params;
  const collection = await getCollection(id);
  if (!collection) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-8">
        <Link
          href="/admin/collections"
          className="text-stone-400 hover:text-stone-900 text-sm transition-colors"
        >
          Colecciones
        </Link>
        <span className="text-stone-300">/</span>
        <h1 className="text-sm font-medium text-stone-900">
          Editar: {collection.name}
        </h1>
      </div>

      <CollectionForm collection={collection} />
    </div>
  );
}
