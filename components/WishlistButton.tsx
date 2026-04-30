"use client";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Props {
  productId: string;
  className?: string;
  size?: number;
}

export default function WishlistButton({ productId, className, size = 16 }: Props) {
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle()
        .then(({ data }) => setWishlisted(!!data));
    });
  }, [productId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    if (loading) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setLoading(true);
    if (wishlisted) {
      await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
      setWishlisted(false);
    } else {
      await supabase.from("wishlists").insert({ user_id: user.id, product_id: productId });
      setWishlisted(true);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={wishlisted ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={cn(
        "p-1.5 rounded-full bg-white/80 backdrop-blur-sm transition-colors",
        className
      )}
    >
      <Heart
        size={size}
        className={cn(
        "block mx-auto transition-colors",
        wishlisted
        ? "fill-red-500 text-red-500"
        : "text-stone-400 hover:text-red-400"
        )}
/>
    </button>
  );
}
