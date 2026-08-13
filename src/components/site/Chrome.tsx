import { useEffect, useRef, useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent">
      <div
        className="gradient-royal h-full origin-left transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed right-5 bottom-24 z-40 grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-primary shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}

export function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Chat with NRI360 on WhatsApp"
      className="group fixed right-5 bottom-6 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3.5 font-semibold text-white shadow-lift transition-transform duration-500 hover:-translate-y-1"
    >
      <span className="absolute inset-0 -z-10 animate-pulse-ring rounded-full bg-[#25D366]/50" />
      <MessageCircle className="h-5 w-5" />
      <span className="max-w-0 overflow-hidden text-sm whitespace-nowrap transition-all duration-500 group-hover:max-w-[10rem]">
        Chat with us
      </span>
    </a>
  );
}

export function CursorGlow() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    const loop = () => {
      pos.x += (target.x - pos.x) * 0.12;
      pos.y += (target.y - pos.y) * 0.12;
      el.style.transform = `translate3d(${pos.x - 220}px, ${pos.y - 220}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-0 hidden h-[440px] w-[440px] rounded-full opacity-60 blur-[90px] md:block"
      style={{
        background:
          "radial-gradient(circle, color-mix(in oklab, var(--primary-glow) 45%, transparent), transparent 65%)",
      }}
    />
  );
}

export function Particles({ count = 18 }: { count?: number }) {
  const dots = Array.from({ length: count }, (_, i) => ({
    left: (i * 37) % 100,
    top: (i * 61) % 100,
    size: 3 + ((i * 7) % 6),
    delay: (i % 9) * 0.7,
    dur: 8 + (i % 7),
  }));

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-current opacity-25"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            animation: `float-slow ${d.dur}s ease-in-out ${d.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
