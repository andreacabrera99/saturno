"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  collectionId: string;
  isActive: boolean;
}

export default function ToggleCollectionButton({ collectionId, isActive }: Props) {
  const router = useRouter();

  async function handleToggle() {
    const supabase = createClient();
    await supabase
      .from("collections")
      .update({ is_active: !isActive })
      .eq("id", collectionId);
    router.refresh();
  }

  return (
    <button
      onClick={handleToggle}
      className="p-1.5 text-stone-400 hover:text-stone-900 transition-colors"
      title={isActive ? "Desactivar" : "Activar"}
    >
      {isActive ? <EyeOff size={14} /> : <Eye size={14} />}
    </button>
  );
}
