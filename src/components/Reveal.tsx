"use client";

import { useEffect, useRef, useState } from "react";

type Variant = "up" | "left" | "right" | "zoom" | "fade";

/** Anima la entrada al aparecer en pantalla y la salida al desaparecer. */
export function Reveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), {
      threshold: 0.12,
      rootMargin: "0px 0px -5% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-variant={variant}
      style={{ transitionDelay: on ? `${delay}ms` : "0ms" }}
      className={`reveal ${on ? "in" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
