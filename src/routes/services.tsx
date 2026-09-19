import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Clock, FileCheck2 } from "lucide-react";
import { useState, useEffect } from "react";
import careImg from "@/assets/service-care.jpg";
import realEstateImg from "@/assets/service-realestate.jpg";
import legalImg from "@/assets/service-legal.jpg";
import heroImg from "@/assets/hero.jpg";
import { Reveal } from "@/components/site/Reveal";
import { Particles } from "@/components/site/Chrome";
import { CtaBand, FaqSection, Icon, SectionHeading, ServiceCard } from "@/components/site/Sections";
import { whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { useCMS } from "@/lib/cms-context";
import { type Service } from "@/lib/site-data";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "NRI Services | Property, Legal, Tax & Family Care — NRI360" },
      {
        name: "description",
        content:
          "Explore 20+ NRI360 services for NRIs: senior citizen care, real estate, property management, legal, PAN, Aadhaar, tax filing, banking, travel and concierge.",
      },
      { property: "og:title", content: "NRI Services in India | NRI360" },
      {
        property: "og:description",
        content: "Benefits, process, timelines and required documents for every NRI360 service.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

const SERVICE_FAQS = [
  {
    q: "Can you handle multiple services together?",
    a: "Yes. Most clients combine two or three services — for example property management with tax filing — under a single relationship manager and one consolidated update cycle.",
  },
  {
    q: "Do you need a Power of Attorney?",
    a: "Only for transactions that legally require representation, such as property registration. We draft, guide the attestation abroad and register it in India.",
  },
  {
    q: "How do I track progress?",
    a: "You receive scheduled updates over WhatsApp or email with documents, photos and receipts attached at every milestone.",
  },
  {
    q: "Are the timelines guaranteed?",
    a: "Timelines shown are typical ranges based on past cases. Government processing times can vary, and we flag any deviation as soon as it is known.",
  },
];

// Local fallbacks for category images when no CMS image is set
const LOCAL_CATEGORY_IMAGES: Record<string, string> = {
  "Family & Care": careImg,
  Property: realEstateImg,
  "Legal & Documentation": legalImg,
  Finance: legalImg,
  Travel: realEstateImg,
  "Taste of India": careImg,
  Concierge: careImg,
};

function ServicesPage() {
  const { cms } = useCMS();
  const services = cms.services;
  const categories = Array.from(new Set(services.map((s) => s.category)));
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || "Family & Care");

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(activeCategory)) {
      setActiveCategory(categories[0] || "Family & Care");
    }
  }, [categories, activeCategory]);

  const activeItems = services.filter((s) => s.category === activeCategory);

  // Resolve service poster image: custom service imageUrl → category asset fallback
  const getServicePosterImage = (s: Service): string => {
    if (s.imageUrl) return s.imageUrl;
    return LOCAL_CATEGORY_IMAGES[s.category] ?? careImg;
  };

  return (
    <>
      <section className="relative overflow-hidden bg-slate-950 pt-28 pb-14 text-white">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={cms.servicesSection.headerImageUrl || heroImg}
            alt="NRI Services Background"
            className="h-full w-full object-cover object-center scale-105 transition-transform duration-[3000ms] opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/90" />
        </div>
        <Particles count={20} />
        <div className="blob top-[-120px] right-[10%] h-80 w-80 animate-drift bg-white/10" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.24em] uppercase backdrop-blur">
              {cms.servicesSection.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-6 max-w-4xl text-5xl leading-[1.05] font-semibold text-balance sm:text-6xl">
              {cms.servicesSection.title}
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-6 max-w-2xl text-base text-primary-foreground/85 sm:text-lg">
              {cms.servicesSection.desc}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Categories" title="What do you need help with?" />
          <Reveal delay={100}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c as string)}
                  className={cn(
                    "rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-1 shadow-sm",
                    activeCategory === c
                      ? "gradient-royal text-primary-foreground shadow-lift"
                      : "bg-background text-foreground hover:bg-muted"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-pad scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow={activeCategory} title={`${activeCategory} Services`} />

          <div className="mt-12 space-y-8">
            {activeItems.map((s, i) => (
              <Reveal key={s.slug} delay={i * 70}>
                <article
                  id={s.slug}
                  className="card-lux hover-lift scroll-mt-28 p-6 lg:p-8 rounded-[2.5rem] border border-border/80 bg-card/90 shadow-lift animate-in slide-in-from-bottom-6 fade-in duration-500 fill-mode-both"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                    {/* Image Side (Left - 5 Columns) */}
                    <div className="lg:col-span-5 relative overflow-hidden rounded-[2rem] aspect-[4/3] lg:aspect-auto lg:h-full min-h-[260px] group">
                      <img
                        src={getServicePosterImage(s)}
                        alt={s.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="gradient-royal grid h-10 w-10 place-items-center rounded-xl text-primary-foreground shadow-lift">
                          <Icon name={s.icon} className="h-5 w-5" />
                        </span>
                        <span className="glass rounded-full px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                          {s.category}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-xs font-semibold text-white/90 line-clamp-1">{s.title}</p>
                      </div>
                    </div>

                    {/* Matter Side (Right - 7 Columns with Two Equal Boxes) */}
                    <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="gradient-royal grid h-9 w-9 place-items-center rounded-lg text-primary-foreground lg:hidden">
                            <Icon name={s.icon} className="h-4 w-4" />
                          </span>
                          <h3 className="text-2xl font-bold tracking-tight text-foreground">{s.title}</h3>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.blurb}</p>
                      </div>

                      {/* Matter in Two Equal Boxes */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Box 1: Benefits */}
                        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3 shadow-sm">
                          <p className="text-[11px] font-bold tracking-[0.18em] text-primary uppercase flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            Benefits
                          </p>
                          <ul className="space-y-2">
                            {s.benefits.map((b) => (
                              <li key={b} className="flex items-start gap-2.5 text-xs font-medium text-foreground/85 leading-snug">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Box 2: Required Documents */}
                        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-sm">
                          <p className="text-[11px] font-bold tracking-[0.18em] text-primary uppercase flex items-center gap-2">
                            <FileCheck2 className="h-4 w-4 text-primary/80 shrink-0" />
                            Required Docs
                          </p>
                          <ul className="space-y-2">
                            {s.documents.map((d) => (
                              <li key={d} className="flex items-start gap-2.5 text-xs font-medium text-foreground/85 leading-snug">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/70 shrink-0" />
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Action Footer Bar */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/60">
                        <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground">
                          <Clock className="h-3.5 w-3.5 text-primary" /> {s.timeline}
                        </span>
                        <div className="flex items-center gap-3">
                          <a
                            href={whatsappLink({ service: s.title })}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="gradient-royal inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-soft transition-transform duration-300 hover:-translate-y-0.5"
                          >
                            WhatsApp us
                          </a>
                          <Link
                            to="/contact"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-all duration-300 hover:gap-2.5"
                          >
                            Quote <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="FAQ" title="Service questions, answered" />
          <FaqSection items={SERVICE_FAQS} />
        </div>
      </section>

      <CtaBand
        title="Not sure which service you need?"
        desc="Describe your situation and we'll map it to the right specialists — no obligation, no charge for the first consultation."
      />
    </>
  );
}
