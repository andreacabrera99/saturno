import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-light text-stone-900 mb-2">
        ¡Pago exitoso!
      </h1>
      <p className="text-stone-500 text-sm mb-8">
        Gracias por tu compra. Recibirás un correo de confirmación pronto.
        Gracias por apoyar a Saturno 🌿
      </p>
      <Link href="/account/orders">
        <Button size="lg">Ver mis pedidos</Button>
      </Link>
      <Link href="/shop" className="block mt-3">
        <Button variant="ghost" size="lg">
          Seguir comprando
        </Button>
      </Link>
    </div>
  );
}
