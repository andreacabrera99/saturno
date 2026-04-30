import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data: products } = await supabase
  .from("products")
  .select("id")
  .neq("category", "bolsas");

const ids = products.map((p) => p.id);

const { error } = await supabase
  .from("product_sizes")
  .delete()
  .in("product_id", ids)
  .eq("size", "Única");

if (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
console.log(`✓ Removed 'Única' from ${ids.length} non-bolsa products`);
