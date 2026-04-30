import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { extname, join } from "path";
import { config } from "dotenv";
import { createRequire } from "module";

config({ path: ".env.local" });

const require = createRequire(import.meta.url);
const data = require("../data.js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error(
    "❌  Falta SUPABASE_SERVICE_ROLE_KEY en .env.local\n" +
    "   Ve a tu proyecto en supabase.com → Settings → API → service_role"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function toSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function getContentType(filename) {
  const ext = extname(filename).slice(1).toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  return "image/png";
}

async function uploadImage(filename, slug) {
  const ext = extname(filename).slice(1).toLowerCase();
  const storageName = `products/${slug}.${ext}`;
  const localPath = join(process.cwd(), "public", "products", filename);
  const fileBuffer = readFileSync(localPath);

  const { error } = await supabase.storage
    .from("product-images")
    .upload(storageName, fileBuffer, {
      contentType: getContentType(filename),
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(storageName);

  return urlData.publicUrl;
}

async function upsertProduct(item, imageUrl) {
  const slug = toSlug(item.name);
  const price = parseInt(item.price.replace(/[$,]/g, ""), 10);

  const { data: product, error: pErr } = await supabase
    .from("products")
    .upsert(
      { name: item.name, slug, description: "", price, category: item.category, is_active: true, is_archived: false },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (pErr) throw new Error(`Product upsert failed: ${pErr.message}`);

  await supabase.from("product_images").delete().eq("product_id", product.id);

  const { error: imgErr } = await supabase
    .from("product_images")
    .insert({ product_id: product.id, url: imageUrl, position: 0 });

  if (imgErr) throw new Error(`Image insert failed: ${imgErr.message}`);

  const sizes =
    item.category === "bolsas"
      ? [{ size: "Única", stock: 1 }]
      : ["XS", "S", "M", "L", "XL", "XXL"].map((size) => ({ size, stock: 1 }));

  await supabase.from("product_sizes").delete().eq("product_id", product.id);

  const { error: sizeErr } = await supabase
    .from("product_sizes")
    .insert(sizes.map((s) => ({ product_id: product.id, ...s })));

  if (sizeErr) throw new Error(`Size upsert failed: ${sizeErr.message}`);
}

async function main() {
  const { items } = data;
  console.log(`\n🌱 Seeding ${items.length} productos...\n`);

  let ok = 0;
  let fail = 0;

  for (const item of items) {
    try {
      const filename = item.image.split("/").pop();
      const slug = toSlug(item.name);
      const imageUrl = await uploadImage(filename, slug);
      await upsertProduct(item, imageUrl);
      console.log(`✓  [${String(item.id).padStart(2, "0")}] ${item.name}`);
      ok++;
    } catch (err) {
      console.error(`✗  [${String(item.id).padStart(2, "0")}] ${item.name}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\n${ok} ok · ${fail} errores\n`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
