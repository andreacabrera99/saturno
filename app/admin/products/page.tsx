export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Plus, Pencil } from "lucide-react";
import ArchiveProductButton from "@/components/admin/ArchiveProductButton";
import Badge from "@/components/ui/Badge";

async function getProducts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(`*, images:product_images(*), sizes:product_sizes(*)`)
    .order("created_at", { ascending: false });
  return (data || []) as Product[];
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-stone-900">
            Productos
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            {products.length} en total
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-stone-900 text-white px-4 py-2 text-sm font-medium hover:bg-stone-700 transition-colors rounded-md"
        >
          <Plus size={16} />
          Agregar
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left py-3 px-2 text-xs font-medium text-stone-400 uppercase tracking-wider">
                Producto
              </th>
              <th className="text-left py-3 px-2 text-xs font-medium text-stone-400 uppercase tracking-wider">
                Categoría
              </th>
              <th className="text-left py-3 px-2 text-xs font-medium text-stone-400 uppercase tracking-wider">
                Precio
              </th>
              <th className="text-left py-3 px-2 text-xs font-medium text-stone-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="py-3 px-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-12 bg-stone-100 rounded overflow-hidden shrink-0">
                      {product.images?.[0] && (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span className="font-medium text-stone-900 line-clamp-1">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2 text-stone-500 capitalize">
                  {product.category.replace("-", " ")}
                </td>
                <td className="py-3 px-2 text-stone-900">
                  {formatPrice(product.price)}
                </td>
                <td className="py-3 px-2">
                  {product.is_archived ? (
                    <Badge variant="danger">Archivado</Badge>
                  ) : product.is_active ? (
                    <Badge variant="success">Activo</Badge>
                  ) : (
                    <Badge variant="warning">Inactivo</Badge>
                  )}
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="p-1.5 text-stone-400 hover:text-stone-900 transition-colors"
                    >
                      <Pencil size={14} />
                    </Link>
                    <ArchiveProductButton
                      productId={product.id}
                      isArchived={product.is_archived}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
