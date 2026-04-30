import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tallas" };

export default function TallasPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <Image
        src="/sizes.webp"
        alt="Tabla de medidas Saturno"
        width={600}
        height={800}
        className="w-full max-w-lg"
        priority
      />
    </div>
  );
}
