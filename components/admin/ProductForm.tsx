"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Product, Category, CATEGORY_LABELS, Size } from "@/types";
import { slugify } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { X, Plus, Upload } from "lucide-react";

const SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];

interface SizeEntry {
  size: Size;
  stock: number;
}

interface Props {
  product?: Product;
  collections?: { id: string; name: string }[];
}

export default function ProductForm({ product, collections = [] }: Props) {
  const router = useRouter();
  const isEditing = !!product;

  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [category, setCategory] = useState<Category>(
    (product?.category as Category) || "playeras-y-tops"
  );
  const [fitNotes, setFitNotes] = useState(product?.fit_notes || "");
  const [careInstructions, setCareInstructions] = useState(
    product?.care_instructions || ""
  );
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [sizes, setSizes] = useState<SizeEntry[]>(
    product?.sizes?.map((s) => ({ size: s.size as Size, stock: s.stock })) || []
  );
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.images?.sort((a, b) => a.position - b.position).map((i) => i.url) || []
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleSize(size: Size) {
    setSizes((prev) => {
      const exists = prev.find((s) => s.size === size);
      if (exists) return prev.filter((s) => s.size !== size);
      return [...prev, { size, stock: 1 }];
    });
  }

  function updateStock(size: Size, stock: number) {
    setSizes((prev) =>
      prev.map((s) => (s.size === size ? { ...s, stock } : s))
    );
  }

  function addImageUrl() {
    if (newImageUrl.trim()) {
      setImageUrls((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price || !category) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const slug = slugify(name);

      if (isEditing && product) {
        await supabase
          .from("products")
          .update({
            name,
            slug,
            description,
            price: parseFloat(price),
            category,
            fit_notes: fitNotes || null,
            care_instructions: careInstructions || null,
            is_active: isActive,
          })
          .eq("id", product.id);

        await supabase
          .from("product_images")
          .delete()
          .eq("product_id", product.id);

        await supabase
          .from("product_sizes")
          .delete()
          .eq("product_id", product.id);

        if (imageUrls.length) {
          await supabase.from("product_images").insert(
            imageUrls.map((url, i) => ({
              product_id: product.id,
              url,
              position: i,
            }))
          );
        }

        if (sizes.length) {
          await supabase.from("product_sizes").insert(
            sizes.map((s) => ({
              product_id: product.id,
              size: s.size,
              stock: s.stock,
            }))
          );
        }
      } else {
        const { data: newProduct } = await supabase
          .from("products")
          .insert({
            name,
            slug,
            description,
            price: parseFloat(price),
            category,
            fit_notes: fitNotes || null,
            care_instructions: careInstructions || null,
            is_active: isActive,
          })
          .select("id")
          .single();

        if (!newProduct) throw new Error("No se pudo crear el producto");

        if (imageUrls.length) {
          await supabase.from("product_images").insert(
            imageUrls.map((url, i) => ({
              product_id: newProduct.id,
              url,
              position: i,
            }))
          );
        }

        if (sizes.length) {
          await supabase.from("product_sizes").insert(
            sizes.map((s) => ({
              product_id: newProduct.id,
              size: s.size,
              stock: s.stock,
            }))
          );
        }

        if (selectedCollections.length) {
          await supabase.from("product_collections").insert(
            selectedCollections.map((cid) => ({
              product_id: newProduct.id,
              collection_id: cid,
            }))
          );
        }
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al guardar el producto.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <Input
        label="Nombre del producto *"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-stone-700">
          Descripción
        </label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="px-3 py-2.5 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Precio (MXN) *"
          id="price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-stone-700">
            Categoría *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="px-3 py-2.5 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <p className="text-sm font-medium text-stone-700 mb-2">Tallas y stock</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {SIZES.map((s) => {
            const selected = sizes.find((x) => x.size === s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                  selected
                    ? "bg-stone-900 text-white border-stone-900"
                    : "border-stone-300 text-stone-600 hover:border-stone-900"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
        {sizes.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((s) => (
              <div key={s.size} className="flex items-center gap-2">
                <span className="text-xs text-stone-500 w-10">{s.size}</span>
                <input
                  type="number"
                  min="0"
                  value={s.stock}
                  onChange={(e) => updateStock(s.size, parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-stone-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900"
                  placeholder="Stock"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Images */}
      <div>
        <p className="text-sm font-medium text-stone-700 mb-2">
          Imágenes (URLs)
        </p>
        <div className="flex gap-2 mb-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
            className="flex-1 px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
            placeholder="https://..."
          />
          <Button type="button" variant="secondary" size="sm" onClick={addImageUrl}>
            <Plus size={14} />
          </Button>
        </div>
        {imageUrls.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative group">
                <img
                  src={url}
                  alt=""
                  className="w-16 h-20 object-cover rounded border border-stone-200"
                />
                <button
                  type="button"
                  onClick={() =>
                    setImageUrls((prev) => prev.filter((_, j) => j !== i))
                  }
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={8} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fit & care */}
      <Input
        label="Notas de talla y ajuste"
        id="fit_notes"
        value={fitNotes}
        onChange={(e) => setFitNotes(e.target.value)}
        placeholder="Ej: Talla regular, se recomienda pedir la talla habitual..."
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-stone-700">
          Instrucciones de cuidado
        </label>
        <textarea
          rows={2}
          value={careInstructions}
          onChange={(e) => setCareInstructions(e.target.value)}
          className="px-3 py-2.5 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
          placeholder="Ej: Lavar a mano, no usar secadora..."
        />
      </div>

      {/* Collections */}
      {collections.length > 0 && !isEditing && (
        <div>
          <p className="text-sm font-medium text-stone-700 mb-2">
            Agregar a colección
          </p>
          <div className="flex flex-wrap gap-2">
            {collections.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() =>
                  setSelectedCollections((prev) =>
                    prev.includes(col.id)
                      ? prev.filter((id) => id !== col.id)
                      : [...prev, col.id]
                  )
                }
                className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                  selectedCollections.includes(col.id)
                    ? "bg-stone-900 text-white border-stone-900"
                    : "border-stone-300 text-stone-600 hover:border-stone-900"
                }`}
              >
                {col.name}
              </button>
            ))}
          </div>
        </div>
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
          Visible en la tienda
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" size="lg" disabled={loading}>
          {loading
            ? "Guardando..."
            : isEditing
            ? "Guardar cambios"
            : "Crear producto"}
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
