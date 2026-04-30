import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Sobre Saturno" };

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-3">
        Sobre nosotras
      </p>
      <h1 className="text-3xl font-light tracking-tight text-stone-900 mb-8">
        La historia de Saturno
      </h1>

      <div className="prose prose-stone prose-sm max-w-none space-y-5 text-stone-600 leading-relaxed">
        <p>
          Hola, soy Ximena y de cariño me dicen Xim. Soy la diseñadora y
          creadora de Saturno :)
        </p>
        <p>
          Actualmente me dedico a estudiar diseño de modas y también me encanta
          la fotografía, el maximalismo y la naturaleza. 
        </p>
        <p>
          En la pandemia nació Saturno como una forma de solventar gastos
          propios, y poco a poco se volvió mi estilo de vida, al llegar al punto
          de estudiar seriamente diseño de modas.
        </p>
        <p>
          Saturno actualmente somos mi mamá y yo en este hermoso proyecto; ella
          me motivó muchísimo a creer en mí y gracias a eso Saturno ha crecido.
        </p>
        <p>
          Cada pieza es un homenaje a nuestra hermosa madre Tierra; intentamos
          cuidar el planeta por lo cual aprovechamos al máximo los recursos que
          los textiles nos dan ♥
        </p>
      </div>

      <div className="mt-10">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-stone-900 text-white px-6 py-3 text-sm font-medium hover:bg-stone-700 transition-colors rounded-md"
        >
          Explorar la tienda
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
