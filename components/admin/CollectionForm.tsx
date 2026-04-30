"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Collection } from "@/types";
import { slugify } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Props {
  collection?: Collection;
}

export default function CollectionForm({ collection }: Props) {
  const router = useRouter();
  const isEditing = !!collection;

  const [name, setName] = useState(collection?.name || "");
  const [description, setDescription] = useState(collection?.description || "");
  const [coverUrl, setCoverUrl] = useState(collection?.cover_image_url || "");
  const [isActive, setIsActive] = useState(collection?.is_active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) {
      setError("El nombre es requerido.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const slug = slugify(name);

      if (isEditing && collection) {
        await supabase
          .from("collections")
          .update({
            name,
            slug,
            description: description || null,
            cover_image_url: coverUrl || null,
            is_active: isActive,
          })
          .eq("id", collection.id);
      } else {
        await supabase.from("collections").insert({
          name,
          slug,
          description: description || null,
          cover_image_url: coverUrl || null,
          is_active: isActive,
        });
      }

      router.push("/admin/collections");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al guardar.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <Input
        label="Nombre *"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-stone-700">Descripción</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="px-3 py-2.5 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
        />
      </div>

      <Input
        label="URL de imagen de portada"
        id="cover_url"
        type="url"
        value={coverUrl}
        onChange={(e) => setCoverUrl(e.target.value)}
        placeholder="https://..."
      />

      {coverUrl && (
        <img
          src={coverUrl}
          alt="Preview"
          className="w-full aspect-[4/3] object-cover rounded-md"
        />
      )}

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_active"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="is_active" className="text-sm text-stone-700">
          Colección activa (visible en la tienda)
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" size="lg" disabled={loading}>
          {loading
            ? "Guardando..."
            : isEditing
            ? "Guardar cambios"
            : "Crear colección"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
