"use client";
import { useEffect, useRef, useState } from "react";

export default function ScrollDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full flex items-center justify-center py-12 bg-white overflow-hidden">
      <div
        className="h-px bg-stone-200 w-full max-w-2xl origin-center transition-transform duration-1000 ease-out"
        style={{ transform: visible ? "scaleX(1)" : "scaleX(0)" }}
      />
    </div>
  );
}
