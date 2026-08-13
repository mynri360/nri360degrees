import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, PlayCircle, ShieldCheck, Zap, Globe2, BadgeCheck, Quote } from "lucide-react";
import careImg from "@/assets/service-care.jpg";
import realEstateImg from "@/assets/service-realestate.jpg";
import legalImg from "@/assets/service-legal.jpg";
import { Reveal } from "@/components/site/Reveal";
import { Particles } from "@/components/site/Chrome";
import {
  CtaBand,
  Eyebrow,
  FaqSection,
  GlobalMap,
  Icon,
  SectionHeading,
  ServiceCard,
  StatsStrip,
  Testimonials,
} from "@/components/site/Sections";
import { INSIGHTS, PROCESS, SERVICES, WHY_US } from "@/lib/site-data";
import { whatsappLink } from "@/lib/whatsapp";
import { useCMS } from "@/lib/cms-context";
import { VerifiedOperationsMarquee } from "@/components/site/VerifiedOperationsMarquee";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NRI360 | Trusted NRI Services for Family, Property & Legal" },
      {
        name: "description",
        content:
          "NRI360 delivers reliable senior citizen care, real estate management, legal aid, tax filing, PAN/Aadhaar & concierge services across 100+ cities in India for NRIs.",
      },
      { property: "og:title", content: "NRI360 — End-to-End Assistance in India for NRIs" },
      {
        property: "og:description",
        content:
          "Senior citizen care, property management, legal assistance, tax filing and concierge support delivered with verified proof.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const HERO_PILLARS = [
  { label: "100+ Cities Covered", icon: ShieldCheck },
  { label: "Worldwide Support", icon: Globe2 },
  { label: "Fast Response", icon: Zap },
];

const FEATURED = [
  { img: careImg, ...SERVICES[0]! },
  { img: realEstateImg, ...SERVICES[2]! },
  { img: legalImg, ...SERVICES[6]! },
];

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function parseVideoUrl(url: string) {
  if (!url) return { type: "youtube" as const, id: "lgYbOKV5zI4" };
  let trimmed = url.trim();

  // Auto-correct typo 'zl4' -> 'zI4'
  if (trimmed.includes("lgYbOKV5zl4")) {
    trimmed = trimmed.replace("lgYbOKV5zl4", "lgYbOKV5zI4");
  }

  // Direct HTML5 video URL (.mp4, .webm, .mov, etc.)
  if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(trimmed)) {
    return { type: "html5" as const, url: trimmed };
  }

  // Direct 11-char YouTube ID
  if (/^[\w-]{11}$/.test(trimmed)) {
    return { type: "youtube" as const, id: trimmed };
  }

  // Parse standard YouTube URLs
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  const id = match && match[1] ? match[1] : "lgYbOKV5zI4";
  return { type: "youtube" as const, id };
}

function YouTubePlayer({ videoId, opacity, blur }: { videoId: string; opacity: number; blur: number }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const play = () => {
      if (iframeRef.current?.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "mute", args: [] }),
            "*"
          );
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "playVideo", args: [] }),
            "*"
          );
        } catch (_e) {}
      }
    };

    const t1 = setTimeout(play, 300);
    const t2 = setTimeout(play, 1000);
    const t3 = setTimeout(play, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [videoId]);

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:8080";
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&muted=1&controls=0&loop=1&playlist=${videoId}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&enablejsapi=1&playsinline=1&origin=${encodeURIComponent(origin)}`;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <iframe
        ref={iframeRef}
        key={videoId}
        className="absolute top-1/2 left-1/2 h-[56.25vw] min-h-[135%] w-[177.77vh] min-w-[135%] -translate-x-1/2 -translate-y-1/2 scale-[1.25] pointer-events-none border-0"
        style={{
          opacity,
          filter: `blur(${blur}px)`,
        }}
        src={src}
        title="NRI360 Video Background"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
      />
    </div>
  );
}

function Home() {
  const { cms } = useCMS();
  const videoSource = parseVideoUrl(cms.hero.videoUrl || "https://www.youtube.com/embed/lgYbOKV5zI4");
  const opacity = Math.max(cms.hero.videoOpacity ?? 85, 75) / 100;
  const blur = cms.hero.videoBlur ?? 0;

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[92svh] items-center overflow-hidden justify-center text-center text-white">
        {/* Background Video Layer Only (z-0) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-950">
          {videoSource.type === "html5" ? (
            <video
              key={videoSource.url}
              src={videoSource.url}
              autoPlay
              loop
              muted
              playsInline
              className="absolute top-1/2 left-1/2 h-full min-h-full w-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover scale-[1.05] pointer-events-none border-0"
              style={{
                opacity,
                filter: `blur(${blur}px)`,
              }}
            />
          ) : (
            <YouTubePlayer videoId={videoSource.id} opacity={opacity} blur={blur} />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/90" />
        </div>

        <div className="absolute inset-0 z-0 text-white pointer-events-none">
          <Particles count={35} />
        </div>
        <div className="blob top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] animate-pulse bg-primary-glow/20 z-0" />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pt-24 pb-14 sm:px-6 flex flex-col items-center">
          <div className="text-primary-foreground flex flex-col items-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-semibold tracking-[0.24em] uppercase backdrop-blur-md shadow-lg shadow-black/20 hover:bg-white/10 transition-colors cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                </span>
                {cms.hero.badgeText}
              </span>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="mt-6 text-4xl leading-tight font-semibold text-balance sm:text-5xl lg:text-6xl tracking-tight">
                {cms.hero.title}
              </h1>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
                {cms.hero.subtitle}
              </p>
            </Reveal>
            <Reveal delay={340}>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  to={(cms.hero.primaryCtaHref || "/services") as any}
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-primary shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)]"
                >
                  {cms.hero.primaryCtaText || "Explore Services"}
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                </Link>
                <a
                  href={cms.hero.secondaryCtaHref || whatsappLink()}
                  target={cms.hero.secondaryCtaHref?.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 hover:border-white/40"
                >
                  <PlayCircle className="h-5 w-5 text-gold" /> {cms.hero.secondaryCtaText || "Watch Introduction"}
                </a>
              </div>
            </Reveal>

            <Reveal delay={460}>
              <div className="mt-10 flex flex-wrap justify-center gap-3 sm:gap-5">
                {HERO_PILLARS.map((t) => (
                  <div
                    key={t.label}
                    className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-sm transition-transform hover:scale-105 hover:bg-white/10"
                  >
                    <t.icon className="h-4 w-4 shrink-0 text-gold" />
                    {t.label}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TRUSTED BY ACROSS THE GLOBE (AUTOSCROLL MARQUEE WITH REALTIME FLAGS) */}
      <VerifiedOperationsMarquee />

      {/* CORE SERVICES PREVIEW (REDUCED CONTENT) */}
      <section className="section-pad relative overflow-hidden">
        <div className="blob top-[10%] left-[-100px] h-96 w-96 bg-primary-glow/25" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={cms.servicesSection?.eyebrow || "Core Specialisations"}
            title={cms.servicesSection?.title || "Key Services Handled With Complete Trust"}
            desc={cms.servicesSection?.desc || "Focused solutions for Senior Care, Real Estate, Legal Representation, and Tax Filings in India."}
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cms.services.slice(0, 4).map((s, i) => (
              <ServiceCard key={s.slug} service={s} index={i} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-7 py-3 text-sm font-semibold text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-lift"
            >
              Explore All 20+ NRI Services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="section-pad relative overflow-hidden bg-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="lg:sticky lg:top-32">
              <SectionHeading
                align="left"
                eyebrow={cms.whyUsSection?.eyebrow || "Why NRI360"}
                title={cms.whyUsSection?.title || "Multinational standards, personal care"}
                desc={cms.whyUsSection?.desc || "We combine verified professionals, transparent pricing and disciplined reporting so that distance never becomes a disadvantage."}
              />
              <Reveal delay={200}>
                <Link
                  to="/about"
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary/30 px-6 py-3 text-sm font-semibold text-primary transition-all duration-500 hover:-translate-y-1 hover:bg-primary hover:text-primary-foreground"
                >
                  Our story <ArrowRight className="h-4 w-4" />
                </Link>
              </Reveal>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {cms.whyUs.map((w, i) => (
                <Reveal key={w.title} delay={(i % 2) * 90}>
                  <div className="card-lux hover-lift group h-full p-6">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary transition-transform duration-500 group-hover:scale-110">
                      <Icon name={w.icon} className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold">{w.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="section-pad relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={cms.processSection?.eyebrow || "How It Works"}
            title={cms.processSection?.title || "A six-step journey, fully visible to you"}
            desc={cms.processSection?.desc || "From the first enquiry to the final handover, you always know exactly where your request stands."}
          />
          <ol className="relative mt-16 grid gap-8 md:grid-cols-3">
            <span className="absolute inset-x-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />
            {cms.process.map((p, i) => (
              <Reveal key={p.step} delay={i * 90}>
                <li className="card-lux hover-lift relative h-full p-7">
                  <span className="gradient-royal absolute -top-6 left-7 grid h-12 w-12 place-items-center rounded-2xl font-display text-sm font-bold text-primary-foreground shadow-lift">
                    {p.step}
                  </span>
                  <h3 className="mt-7 text-lg font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <StatsStrip />

      {/* TESTIMONIALS */}
      <section className="section-pad relative overflow-hidden">
        <div className="blob right-[-80px] bottom-[10%] h-80 w-80 bg-primary-glow/25" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={cms.testimonialsSection?.eyebrow || "Testimonials"}
            title={cms.testimonialsSection?.title || "Families who stopped worrying"}
          />
          <Testimonials />
        </div>
      </section>

      {/* GLOBAL COVERAGE */}
      <section className="section-pad bg-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={cms.mapSection?.eyebrow || "Global Coverage"}
            title={cms.mapSection?.title || "Wherever you live, India is one message away"}
            desc={cms.mapSection?.desc || "Support scheduled in your local time zone, execution on the ground across 100+ Indian cities."}
          />
          <GlobalMap />
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad bg-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={cms.faqSection?.eyebrow || "FAQ"}
            title={cms.faqSection?.title || "Questions NRIs ask us first"}
          />
          <FaqSection items={cms.faqs} />
          <Reveal delay={120} className="mt-10 text-center">
            <Eyebrow>Still unsure? Talk to a specialist</Eyebrow>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
