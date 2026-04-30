import CollectionForm from "@/components/admin/CollectionForm";
import Link from "next/link";

export default function NewCollectionPage() {
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
        <h1 className="text-sm font-medium text-stone-900">Nueva colección</h1>
      </div>

      <CollectionForm />
    </div>
  );
}
