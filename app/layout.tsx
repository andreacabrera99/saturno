import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/layout/Header";
import ConditionalFooter from "@/components/layout/ConditionalFooter";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Saturno", template: "%s | Saturno" },
  description:
    "Moda consciente hecha con amor. Cada pieza es un homenaje a nuestra hermosa madre Tierra.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${geist.className} text-stone-900 bg-white antialiased`}
      >
        <CartProvider>
          <Header />
          <main>{children}</main>
          <ConditionalFooter />
        </CartProvider>
      </body>
    </html>
  );
}
