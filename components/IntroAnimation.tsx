"use client";
import { useEffect, useState } from "react";

const FRAME_MS = 80;
const SIZE = 150;

export default function IntroAnimation({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(images.length === 0);

  useEffect(() => {
    if (images.length === 0) { setDone(true); return; }

    const id = setInterval(() => {
      setIndex((prev) => {
        const next = prev + 1;
        if (next >= images.length) {
          clearInterval(id);
          setDone(true);
          return prev;
        }
        return next;
      });
    }, FRAME_MS);

    return () => clearInterval(id);
  }, [images]);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => {
      document.getElementById("brand")?.scrollIntoView({ behavior: "smooth" });
    }, 120);
    return () => clearTimeout(t);
  }, [done]);

  const url = images[index] ?? "";

  return (
    <section className="w-full h-screen bg-white flex items-center justify-center">
      <div
        style={{
          width: SIZE,
          height: SIZE,
          backgroundImage: url ? `url('${url}')` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </section>
  );
}
