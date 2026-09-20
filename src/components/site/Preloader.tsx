import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const PINS = [
  { x: 26, y: 34 },
  { x: 48, y: 26 },
  { x: 62, y: 44 },
  { x: 76, y: 58 },
  { x: 84, y: 72 },
];

export function Preloader() {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // 5-second total loading time (5000ms)
    const TOTAL_DURATION = 5000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.floor((elapsed / TOTAL_DURATION) * 100));
      setProgress(currentProgress);

      if (elapsed >= 1000 && elapsed < 2500) {
        setPhase(1);
      } else if (elapsed >= 2500 && elapsed < 3800) {
        setPhase(2);
      } else if (elapsed >= 3800) {
        setPhase(3);
      }

      if (elapsed >= TOTAL_DURATION) {
        clearInterval(interval);
        setDone(true);
      }
    }, 30);

    return () => clearInterval(interval);
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
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center gradient-royal transition-all duration-700 ease-in-out",
        done && "pointer-events-none -translate-y-full opacity-0",
      )}
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Globe Orbit Lines & Pins */}
        <div className="relative h-36 w-36 flex items-center justify-center sm:h-44 sm:w-44">
          <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-spin-slow opacity-90">
            <circle cx="100" cy="100" r="78" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.2" />
            <ellipse cx="100" cy="100" rx="78" ry="30" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="78" ry="56" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="30" ry="78" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="56" ry="78" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
          </svg>

          {/* Logo badge in the center */}
          <div className="relative z-10 h-20 w-20 overflow-hidden rounded-full border-2 border-white/30 bg-white p-1.5 shadow-2xl animate-pulse-ring sm:h-24 sm:w-24">
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
                    style={{ animation: `dash 0.4s ${i * 0.12}s forwards ease-out` }}
                  />
                ),
              )}
          </svg>

          {phase >= 1 &&
            PINS.map((p, i) => (
              <span
                key={`p-${i}`}
                className="animate-pin-pop absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)]"
                style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${i * 100}ms` }}
              />
            ))}
        </div>

        {/* Brand Text */}
        <div className="mt-6 text-center transition-all duration-500 sm:mt-8">
          <p className="font-display text-2xl font-bold tracking-[0.2em] text-white sm:text-3xl drop-shadow-md">
            NRI360
          </p>
          <p className="mt-1 text-[11px] tracking-[0.35em] text-white/80 uppercase sm:mt-2 sm:text-xs font-medium">
            Connecting NRIs to India
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="mt-6 flex flex-col items-center gap-2 w-56 sm:w-64">
          <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden backdrop-blur-sm p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 via-white to-amber-400 transition-all duration-75 ease-out shadow-[0_0_12px_rgba(255,255,255,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between w-full text-[11px] font-semibold text-white/70 tracking-widest">
            <span>{progress < 40 ? "INITIALIZING..." : progress < 85 ? "CONNECTING..." : "READY"}</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      <style>{`@keyframes dash { to { stroke-dashoffset: 0; } }`}</style>
    </div>
  );
}
