"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Archive, ArchiveRestore } from "lucide-react";

interface Props {
  productId: string;
  isArchived: boolean;
}

export default function ArchiveProductButton({ productId, isArchived }: Props) {
  const router = useRouter();

  async function handleToggle() {
    const supabase = createClient();
    await supabase
      .from("products")
      .update({ is_archived: !isArchived, is_active: isArchived })
      .eq("id", productId);
    router.refresh();
  }

  return (
    <button
      onClick={handleToggle}
      className="p-1.5 text-stone-400 hover:text-stone-900 transition-colors"
      title={isArchived ? "Desarchivar" : "Archivar"}
    >
      {isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
    </button>
  );
}
