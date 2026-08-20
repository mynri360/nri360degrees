import { Link, useRouterState } from "@tanstack/react-router";
import { Download, Menu, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useCMS } from "@/lib/cms-context";
import { usePWA } from "@/lib/pwa-context";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { cms } = useCMS();
  const header = cms.header;
  const { isInstalled, triggerInstall } = usePWA();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);



  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-500", scrolled ? "py-2" : "py-4")}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav
          className={cn(
            "flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-500 sm:px-6",
            scrolled ? "glass shadow-soft" : "border border-transparent bg-transparent",
          )}
        >
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="relative grid h-10 w-10 place-items-center rounded-full bg-white p-0.5 shadow-soft transition-transform duration-500 group-hover:scale-110">
              <img src="/logo.png" alt="NRI360 Logo" className="h-full w-full rounded-full object-contain" />
            </span>
            <span className="flex flex-col leading-none">
              <span
                className={cn(
                  "font-display text-lg font-semibold tracking-tight transition-colors",
                  scrolled ? "text-foreground" : "text-primary-foreground",
                )}
              >
                {header.brandName.slice(0, 3)}
                <span className={cn(scrolled ? "text-gradient" : "text-primary-glow")}>
                  {header.brandName.slice(3) || "360"}
                </span>
              </span>
              <span
                className={cn(
                  "mt-0.5 text-[10px] tracking-[0.24em] uppercase transition-colors",
                  scrolled ? "text-muted-foreground" : "text-primary-foreground/70",
                )}
              >
                {header.brandTagline}
              </span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {header.navLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
                    scrolled
                      ? pathname === l.to
                        ? "text-primary"
                        : "text-foreground/75 hover:text-primary"
                      : pathname === l.to
                        ? "text-primary-foreground"
                        : "text-primary-foreground/75 hover:text-primary-foreground",
                  )}
                >
                  {l.label}
                  <span
                    className={cn(
                      "gradient-royal absolute inset-x-4 -bottom-0.5 h-0.5 origin-left rounded-full transition-transform duration-500",
                      pathname === l.to ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {!isInstalled && (
              <button
                type="button"
                onClick={triggerInstall}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full pl-2 pr-3.5 py-1.5 text-xs font-bold transition-all duration-300 shadow-soft hover:-translate-y-0.5 hover:shadow-lift active:scale-95 cursor-pointer",
                  scrolled
                    ? "gradient-royal text-primary-foreground"
                    : "border border-white/40 bg-white/20 text-white hover:bg-white/30 backdrop-blur-md shadow-lg",
                )}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white p-0.5 shadow-sm">
                  <img src="/logo.png" alt="NRI360 Logo" className="h-full w-full rounded-full object-contain" />
                </span>
                <span>Download App</span>
                <Download className="h-3.5 w-3.5" />
              </button>
            )}

            <Link
              to={header.ctaButtonHref as any}
              className="gradient-royal hidden rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lift sm:inline-flex"
            >
              {header.ctaButtonText}
            </Link>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-accent lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        <div
          className={cn(
            "glass mt-2 overflow-hidden rounded-2xl transition-all duration-500 lg:hidden",
            open ? "max-h-[30rem] opacity-100" : "pointer-events-none max-h-0 opacity-0",
          )}
        >
          <ul className="flex flex-col p-3">
            {header.navLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {!isInstalled && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    triggerInstall();
                  }}
                  className="mt-1 flex w-full items-center justify-center gap-2.5 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white p-0.5 shadow-sm">
                    <img src="/logo.png" alt="NRI360 Logo" className="h-full w-full rounded-full object-contain" />
                  </span>
                  <span>Download App</span>
                  <Download className="h-4 w-4" />
                </button>
              </li>
            )}

            <li>
              <Link
                to={header.ctaButtonHref as any}
                className="gradient-royal mt-2 block rounded-xl px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                {header.ctaButtonText}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
