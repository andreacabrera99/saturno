import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface LineItem {
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
}

export async function POST(req: NextRequest) {
  const { items } = await req.json() as { items: LineItem[] };

  const origin = req.headers.get("origin") ?? `https://${req.headers.get("host")}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: items.map((item) => ({
      price_data: {
        currency: "mxn",
        product_data: {
          name: item.name,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    success_url: `${origin}/checkout/success`,
    cancel_url: `${origin}/cart`,
  });

  return NextResponse.json({ url: session.url });
}
