import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const PINS = [
  { x: 26, y: 34 },
  { x: 48, y: 26 },
  { x: 62, y: 44 },
  { x: 76, y: 58 },
  { x: 84, y: 72 },
];

function safeSessionGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(key);
  } catch (_e) {
    return null;
  }
}

export function Preloader() {
  const [phase, setPhase] = useState(() => {
    if (safeSessionGet("nri360_preloader_seen")) {
      return 3;
    }
    return 0;
  });
  const [done, setDone] = useState(() => {
    if (safeSessionGet("nri360_preloader_seen")) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (safeSessionGet("nri360_preloader_seen")) {
      setDone(true);
      return;
    }

    const timers = [
      setTimeout(() => setPhase(1), 120),
      setTimeout(() => setPhase(2), 280),
      setTimeout(() => setPhase(3), 440),
      setTimeout(() => {
        setDone(true);
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("nri360_preloader_seen", "true");
          } catch (_e) {}
        }
      }, 620),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = done ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [done]);

  if (done) return null;

  return (
    <div
      aria-hidden={done}
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center gradient-royal transition-all duration-500",
        done && "pointer-events-none -translate-y-full opacity-0",
      )}
    >
      <div className="relative flex flex-col items-center">
        <div className="relative h-36 w-36 flex items-center justify-center sm:h-40 sm:w-40">
          <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-spin-slow opacity-90">
            <circle cx="100" cy="100" r="78" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.2" />
            <ellipse cx="100" cy="100" rx="78" ry="30" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="78" ry="56" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="30" ry="78" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="56" ry="78" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
          </svg>

          {/* Logo badge in the center */}
          <div className="relative z-10 h-20 w-20 overflow-hidden rounded-full border-2 border-white/20 bg-white p-1.5 shadow-lg animate-pulse-ring sm:h-24 sm:w-24">
            <img 
              src="/logo.png" 
              alt="NRI360 Logo" 
              className="h-full w-full rounded-full object-contain"
              loading="eager"
              decoding="sync"
            />
          </div>

          <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
            {phase >= 2 &&
              PINS.map((p, i) =>
                i === 0 ? null : (
                  <line
                    key={`l-${i}`}
                    x1={(PINS[0]?.x ?? 0) * 2}
                    y1={(PINS[0]?.y ?? 0) * 2}
                    x2={p.x * 2}
                    y2={p.y * 2}
                    stroke="white"
                    strokeOpacity="0.55"
                    strokeWidth="1"
                    strokeDasharray="220"
                    strokeDashoffset="220"
                    style={{ animation: `dash 0.4s ${i * 0.08}s forwards ease-out` }}
                  />
                ),
              )}
          </svg>

          {phase >= 1 &&
            PINS.map((p, i) => (
              <span
                key={`p-${i}`}
                className="animate-pin-pop absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)]"
                style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${i * 60}ms` }}
              />
            ))}
        </div>

        <div
          className={cn(
            "mt-6 text-center transition-all duration-500 sm:mt-8",
            phase >= 3 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          )}
        >
          <p className="font-display text-2xl font-semibold tracking-[0.18em] text-white sm:text-3xl">NRI360</p>
          <p className="mt-1 text-[11px] tracking-[0.35em] text-white/70 uppercase sm:mt-2 sm:text-xs">Connecting NRIs to India</p>
        </div>
      </div>

      <style>{`@keyframes dash { to { stroke-dashoffset: 0; } }`}</style>
    </div>
  );
}
