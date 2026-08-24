import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { Star, ArrowRight, Plus, MapPin, Maximize2, X, Clock, CheckCircle2, ShieldCheck, Globe2, Sparkles, MessageCircle } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { Counter } from "./Counter";
import { type Service, type MapHotspot } from "@/lib/site-data";
import { whatsappLink } from "@/lib/whatsapp";
import globalMapImg from "@/assets/global-coverage-map.jpg";
import { useCMS } from "@/lib/cms-context";

function getLocalTime(timeOffset: number) {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const targetTime = new Date(utc + 3600000 * timeOffset);
  return targetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Sparkles;
  return <Cmp className={className} />;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-[11px] font-semibold tracking-[0.24em] text-primary uppercase backdrop-blur">
      <span className="gradient-royal h-1.5 w-1.5 rounded-full" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  desc,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  desc?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="mt-5 text-4xl leading-[1.08] font-semibold text-balance sm:text-5xl">{title}</h2>
      </Reveal>
      {desc ? (
        <Reveal delay={160}>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">{desc}</p>
        </Reveal>
      ) : null}
    </div>
  );
}

export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  return (
    <Reveal delay={(index % 4) * 90}>
      <article className="group card-lux hover-lift relative h-full overflow-hidden p-6 flex flex-col justify-between">
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary-glow/20 blur-2xl transition-transform duration-700 group-hover:scale-150" />
        {service.imageUrl && (
          <div className="relative -mx-6 -mt-6 mb-4 h-36 overflow-hidden rounded-t-[1.5rem]">
            <img
              src={service.imageUrl}
              alt={service.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
          </div>
        )}
        <div className="relative flex h-full flex-col">
          <span className="gradient-royal grid h-12 w-12 place-items-center rounded-xl text-primary-foreground shadow-soft transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
            <Icon name={service.icon} className="h-5 w-5" />
          </span>
          <p className="mt-4 text-[11px] font-semibold tracking-[0.2em] text-primary/70 uppercase">
            {service.category}
          </p>
          <h3 className="mt-2 text-xl font-semibold">{service.title}</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{service.blurb}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/services"
              hash={service.slug}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all duration-300 hover:gap-3"
            >
              Learn more <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={whatsappLink({ service: service.title })}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground/80 transition-colors hover:border-primary hover:text-primary"
            >
              Request service
            </a>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export function StatsStrip() {
  const { cms } = useCMS();
  const stats = cms.stats;

  return (
    <section className="relative overflow-hidden gradient-royal py-16 text-primary-foreground">
      <div className="blob top-[-120px] left-[10%] h-64 w-64 animate-drift bg-white/20" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 90} className="text-center">
            <p className="font-display text-4xl font-semibold sm:text-5xl">
              <Counter value={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-xs tracking-[0.2em] text-primary-foreground/75 uppercase">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Testimonials() {
  const { cms } = useCMS();
  const testimonials = cms.testimonials;
  const [index, setIndex] = useState(0);
  const perView = 3;
  const pages = Math.max(1, Math.ceil(testimonials.length / perView));

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % pages), 5200);
    return () => clearInterval(id);
  }, [pages]);

  return (
    <div className="mt-14">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {Array.from({ length: pages }, (_, p) => (
            <div key={p} className="grid w-full shrink-0 gap-6 px-1 md:grid-cols-3">
              {testimonials.slice(p * perView, p * perView + perView).map((t) => (
                <figure key={t.name} className="card-lux hover-lift flex h-full flex-col p-7">
                  <div className="flex items-center gap-1 text-gold">
                    {Array.from({ length: t.rating }, (_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-foreground/85">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                    <span className="gradient-royal grid h-11 w-11 place-items-center rounded-full font-semibold text-primary-foreground">
                      {t.name.charAt(0)}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{t.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {t.role} · {t.flag} {t.country}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          ))}
        </div>
      </div>
      {pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, p) => (
            <button
              key={p}
              type="button"
              aria-label={`Testimonials page ${p + 1}`}
              onClick={() => setIndex(p)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                p === index ? "gradient-royal w-10" : "w-4 bg-border",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function GlobalMap() {
  const { cms } = useCMS();
  const hotspots = cms.hotspots || [];
  const valuePillars = cms.valuePillars || [];

  const [activeHotspot, setActiveHotspot] = useState<MapHotspot>(
    () => hotspots.find((h) => h.id === "india") || hotspots[0] || {
      id: "india",
      name: "India",
      code: "in",
      flag: "🇮🇳",
      x: 64.5,
      y: 54.2,
      nriCount: "100+ Cities Network",
      timezone: "IST (UTC +5:30)",
      timeOffset: 5.5,
      popularServices: ["Senior Care", "Property Diligence"],
      isHub: true,
    }
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      if (activeHotspot) {
        setCurrentTime(getLocalTime(activeHotspot.timeOffset));
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [activeHotspot]);

  return (
    <div className="relative mt-12 space-y-12">
      {/* COUNTRY QUICK SELECTOR TABS */}
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card/60 p-2.5 backdrop-blur-md shadow-sm">
        <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Globe2 className="h-4 w-4 text-primary" /> Select Location:
        </span>
        {hotspots.map((hotspot) => {
          const isActive = activeHotspot.id === hotspot.id;
          return (
            <button
              key={hotspot.id}
              type="button"
              onClick={() => setActiveHotspot(hotspot)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-300",
                isActive
                  ? "gradient-royal text-primary-foreground shadow-md scale-105"
                  : "bg-background/80 text-foreground/80 hover:bg-primary/10 hover:text-primary border border-border/50"
              )}
            >
              <img
                src={`https://flagcdn.com/w80/${hotspot.code}.png`}
                alt={`${hotspot.name} flag`}
                className="h-3.5 w-5 rounded object-cover shrink-0 shadow-xs"
                loading="lazy"
              />
              <span>{hotspot.name.split(" ")[0]}</span>
              {hotspot.isHub && (
                <span className="rounded-full bg-gold/90 px-1.5 py-0.5 text-[9px] font-extrabold text-black uppercase">
                  HUB
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MAP HERO CONTAINER & ACTIVE HOTSPOT CARD */}
      <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr] items-stretch">
        {/* INTERACTIVE MAP DISPLAY */}
        <div className="group relative min-h-[420px] sm:min-h-[500px] w-full overflow-hidden rounded-[2.5rem] border border-primary/20 bg-slate-950 shadow-2xl transition-all duration-500 hover:border-primary/40">
          <img
            src={globalMapImg}
            alt="NRI360 Global Reach Map - Connecting NRIs Worldwide to India"
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            loading="lazy"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />

          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105"
            title="Expand Map Fullscreen"
          >
            <Maximize2 className="h-3.5 w-3.5 text-gold" />
            <span className="hidden sm:inline">Inspect Map</span>
          </button>

          <div className="absolute top-4 left-4 z-20 hidden sm:flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Global Support Network
          </div>

          {hotspots.map((hotspot) => {
            const isSelected = activeHotspot.id === hotspot.id;
            return (
              <div
                key={hotspot.id}
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group/pin"
                onClick={() => setActiveHotspot(hotspot)}
              >
                <div
                  className={cn(
                    "absolute -inset-2 rounded-full transition-all duration-500",
                    isSelected
                      ? "animate-ping bg-gold/50 opacity-75"
                      : "bg-primary/30 opacity-0 group-hover/pin:opacity-100 group-hover/pin:animate-ping"
                  )}
                />

                <button
                  type="button"
                  aria-label={`Select ${hotspot.name}`}
                  className={cn(
                    "relative flex items-center justify-center rounded-full transition-all duration-300 shadow-lg",
                    hotspot.isHub
                      ? "h-9 w-9 bg-gradient-to-r from-amber-500 to-orange-600 ring-4 ring-gold/40 text-black scale-110"
                      : isSelected
                      ? "h-8 w-8 gradient-royal ring-4 ring-primary/40 text-white scale-125"
                      : "h-6 w-6 bg-slate-900/90 text-gold border border-gold/40 hover:scale-125 hover:bg-primary hover:text-white"
                  )}
                >
                  {hotspot.isHub ? (
                    <Sparkles className="h-5 w-5 animate-spin-slow" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5" />
                  )}
                </button>

                <div
                  className={cn(
                    "absolute top-full left-1/2 -translate-x-1/2 mt-1.5 flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-bold shadow-md transition-all duration-300 pointer-events-none",
                    isSelected
                      ? "bg-gold text-black scale-100 opacity-100"
                      : "bg-slate-900/90 text-white/90 opacity-0 group-hover/pin:opacity-100 scale-90 group-hover/pin:scale-100 border border-white/10"
                  )}
                >
                  <img
                    src={`https://flagcdn.com/w80/${hotspot.code}.png`}
                    alt=""
                    className="h-2.5 w-4 rounded object-cover"
                  />
                  <span>{hotspot.name.split(" ")[0]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ACTIVE HOTSPOT DETAILS PANEL */}
        <div className="flex flex-col justify-between rounded-[2.5rem] border border-border/80 bg-card p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary-glow/10 blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={`https://flagcdn.com/w80/${activeHotspot.code}.png`}
                  alt={`${activeHotspot.name} official flag`}
                  className="h-8 w-12 rounded object-cover shadow-sm border border-border shrink-0"
                />
                <div>
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    {activeHotspot.name}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    {activeHotspot.nriCount}
                  </p>
                </div>
              </div>
              {activeHotspot.isHub && (
                <span className="rounded-full bg-gold/15 border border-gold/30 px-3 py-1 text-xs font-bold text-gold">
                  India Headquarters
                </span>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border/60 bg-secondary/50 p-4">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Local Time
                </span>
                <p className="mt-1 text-lg font-bold font-mono text-foreground">{currentTime}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{activeHotspot.timezone}</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-secondary/50 p-4">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Support Status
                </span>
                <p className="mt-1 text-sm font-bold text-emerald-500">24/7 Desk Active</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Response under 4 hrs</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Key Requested Services in {activeHotspot.name.split(" ")[0]}
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeHotspot.popularServices?.map((svc) => (
                  <span
                    key={svc}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/40 transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {svc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={whatsappLink({ country: activeHotspot.name })}
              target="_blank"
              rel="noreferrer noopener"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl gradient-royal px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-lift transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="h-4 w-4" /> Request Support in {activeHotspot.name.split(" ")[0]}
            </a>
          </div>
        </div>
      </div>

      {/* VALUE PILLARS */}
      <div className="mt-12">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Our Core Promises
          </span>
          <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">Six Pillars of World-Class NRI Assistance</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {valuePillars.map((pillar) => (
            <div
              key={pillar.title}
              className={cn(
                "group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/40 cursor-default",
                pillar.color
              )}
            >
              <div className="flex items-start gap-4">
                <span className="gradient-royal grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-primary-foreground shadow-md transition-transform duration-500 group-hover:scale-110">
                  <Icon name={pillar.icon} className="h-6 w-6" />
                </span>
                <div>
                  <span className="text-[10px] font-extrabold tracking-[0.2em] text-primary uppercase">
                    {pillar.title}
                  </span>
                  <h4 className="text-base font-semibold text-foreground mt-0.5">{pillar.subtitle}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{pillar.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAP LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] max-w-5xl w-full overflow-hidden rounded-3xl border border-white/20 bg-slate-950 p-2 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-md transition-all"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="max-h-[85vh] overflow-auto rounded-2xl">
              <img
                src={globalMapImg}
                alt="NRI360 World Coverage Map Full view"
                className="w-full h-auto rounded-2xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function FaqSection({ items }: { items?: { q: string; a: string }[] }) {
  const { cms } = useCMS();
  const faqs = items || cms.faqs;

  return (
    <Accordion type="single" collapsible className="mx-auto mt-12 w-full max-w-3xl space-y-3">
      {faqs.map((f, i) => (
        <Reveal key={f.q} delay={i * 60}>
          <AccordionItem
            value={`i-${i}`}
            className="card-lux overflow-hidden border-b px-6 data-[state=open]:border-primary/40"
          >
            <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        </Reveal>
      ))}
    </Accordion>
  );
}

export function CtaBand({
  title,
  desc,
}: {
  title?: string;
  desc?: string;
}) {
  const { cms } = useCMS();
  const band = cms.ctaBand;
  const displayTitle = title || band.title;
  const displayDesc = desc || band.desc;

  return (
    <section className="section-pad relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] gradient-royal px-6 py-16 text-center text-primary-foreground sm:px-16">
            <div className="blob top-[-100px] left-[8%] h-72 w-72 animate-drift bg-white/25" />
            <div className="blob right-[6%] bottom-[-120px] h-80 w-80 animate-float-slow bg-white/15" />
            <div className="relative mx-auto max-w-3xl">
              <h2 className="text-4xl leading-tight font-semibold text-balance sm:text-5xl">{displayTitle}</h2>
              <p className="mt-5 text-base text-primary-foreground/85 sm:text-lg">{displayDesc}</p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link
                  to={band.primaryCtaHref as any}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-primary shadow-lift transition-transform duration-500 hover:-translate-y-1"
                >
                  {band.primaryCtaText} <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={band.secondaryCtaHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-semibold backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:bg-white/20"
                >
                  <Plus className="h-4 w-4" /> {band.secondaryCtaText}
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
