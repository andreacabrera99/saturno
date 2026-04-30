import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BASE = process.env.PAYPAL_BASE_URL!;

async function getToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token as string;
}

export async function POST(req: NextRequest) {
  const { paypalOrderId, form, items, userId, total } = await req.json();

  // Capture PayPal payment
  const token = await getToken();
  const captureRes = await fetch(`${BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const capture = await captureRes.json();

  if (capture.status !== "COMPLETED") {
    return NextResponse.json({ error: "Pago no completado" }, { status: 400 });
  }

  // Create Supabase order with service role (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId ?? null,
      total,
      status: "confirmed",
      shipping_name: form.full_name,
      shipping_email: form.email,
      shipping_address: form.address,
      shipping_city: form.city,
      shipping_state: form.state,
      shipping_zip: form.zip,
      notes: form.notes || null,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message }, { status: 500 });
  }

  await supabase.from("order_items").insert(
    items.map((item: {
      productId: string;
      productName: string;
      productImage: string | null;
      size: string;
      quantity: number;
      unitPrice: number;
    }) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_image: item.productImage,
      size: item.size,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }))
  );

  return NextResponse.json({ orderId: order.id });
}
