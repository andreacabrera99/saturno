"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Order } from "@/types";

const STATUSES: Order["status"][] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default function UpdateOrderStatusButton({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState<Order["status"]>(order.status);
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("orders")
      .update({ status })
      .eq("id", order.id);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as Order["status"])}
        className="px-3 py-1.5 border border-stone-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <button
        onClick={handleUpdate}
        disabled={loading || status === order.status}
        className="px-3 py-1.5 text-sm bg-stone-900 text-white rounded hover:bg-stone-700 transition-colors disabled:opacity-50"
      >
        {loading ? "..." : "Actualizar"}
      </button>
    </div>
  );
}
