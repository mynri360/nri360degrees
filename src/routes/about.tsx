import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import careImg from "@/assets/service-care.jpg";
import realEstateImg from "@/assets/service-realestate.jpg";
import legalImg from "@/assets/service-legal.jpg";
import heroImg from "@/assets/hero.jpg";
import { Reveal } from "@/components/site/Reveal";
import { Particles } from "@/components/site/Chrome";
import { CtaBand, GlobalMap, Icon, SectionHeading, StatsStrip } from "@/components/site/Sections";
import { useCMS } from "@/lib/cms-context";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About NRI360 | A Global Team Serving NRIs Since 2019" },
      {
        name: "description",
        content:
          "Meet NRI360 — our vision, mission, values, professional network and the milestones behind trusted NRI assistance across 10+ countries and 100+ Indian cities.",
      },
      { property: "og:title", content: "About NRI360" },
      {
        property: "og:description",
        content: "Our story, values and global support network for Non-Resident Indians.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

// Fallback images for team members
const FALLBACK_TEAM_IMGS = [careImg, legalImg, legalImg, realEstateImg];

function AboutPage() {
  const { cms } = useCMS();
  const about = cms.about;
  const whyUs = cms.whyUs;

  // Resolve images: use CMS URL if set, else fallback to local asset
  const headerBgImg = about.headerImageUrl || careImg;
  const storyImg = about.storyImageUrl || careImg;

  // Gallery: use CMS gallery if has valid items, else fallback to local assets
  const activeGallery = (about.gallery || []).filter((g) => Boolean(g && g.trim()));
  const gallery: string[] =
    activeGallery.length > 0
      ? activeGallery
      : [heroImg, careImg, realEstateImg, legalImg, careImg, realEstateImg];

  return (
    <>
      {/* PAGE HERO HEADER */}
      <section className="relative overflow-hidden bg-slate-950 pt-28 pb-14 text-white">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={headerBgImg}
            alt="About NRI360 Background"
            className="h-full w-full object-cover object-center scale-105 transition-transform duration-[3000ms] opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/90" />
        </div>
        <Particles count={18} />
        <div className="blob top-[-100px] left-[12%] h-80 w-80 animate-float-slow bg-white/10" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.24em] uppercase backdrop-blur">
              {about.badgeText}
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-6 max-w-4xl text-5xl leading-[1.05] font-semibold text-balance sm:text-6xl">
              {about.title}
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-6 max-w-2xl text-base text-primary-foreground/85 sm:text-lg">
              {about.subtitle}
            </p>
          </Reveal>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="section-pad">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="relative">
              <img
                src={storyImg}
                alt="NRI360 team assisting a family in India"
                loading="lazy"
                width={1024}
                height={768}
                className="w-full rounded-[2rem] object-cover shadow-lift"
              />
              <div className="glass absolute -right-4 -bottom-8 hidden max-w-xs rounded-2xl p-5 sm:block">
                <p className="font-display text-3xl font-semibold text-gradient">{about.storyYear}</p>
                <p className="mt-1 text-sm text-muted-foreground">{about.storyYearDesc}</p>
              </div>
            </div>
          </Reveal>
          <div>
            <SectionHeading
              align="left"
              eyebrow="Who We Are"
              title={about.storyTitle}
              desc={about.storyParagraphs.join(" ")}
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {[
                { iconName: "Compass", title: about.visionTitle, text: about.visionDesc },
                { iconName: "Target", title: about.missionTitle, text: about.missionDesc },
              ].map((b, i) => (
                <Reveal key={b.title} delay={i * 100}>
                  <div className="card-lux h-full p-6">
                    <Icon name={b.iconName} className="h-6 w-6 text-primary" />
                    <h3 className="mt-4 text-lg font-semibold">{b.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="section-pad bg-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Core Values" title="What we refuse to compromise on" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(about.coreValues || []).map((v, i) => (
              <Reveal key={v.title} delay={(i % 3) * 90}>
                <div className="card-lux hover-lift h-full p-7">
                  <span className="font-display text-4xl font-semibold text-primary/20">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHY NRI360 */}
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Why NRI360" title="Reasons families stay with us" />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyUs.map((w, i) => (
              <Reveal key={w.title} delay={(i % 4) * 80}>
                <div className="card-lux hover-lift group h-full p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary transition-transform duration-500 group-hover:rotate-6">
                    <Icon name={w.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="section-pad bg-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Professional Team"
            title="The specialists behind every request"
            desc="Photographs and profiles of named team members can be added here as they are provided."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(about.team || []).map((t, i) => {
              const imgSrc = t.imageUrl || FALLBACK_TEAM_IMGS[i % FALLBACK_TEAM_IMGS.length];
              return (
                <Reveal key={t.name} delay={i * 90}>
                  <article className="group card-lux h-full overflow-hidden">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={imgSrc}
                        alt={t.name}
                        loading="lazy"
                        width={1024}
                        height={768}
                        className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,oklch(0.3_0.15_265/0.72))]" />
                      <div className="absolute inset-x-5 bottom-5 text-primary-foreground">
                        <h3 className="text-base font-semibold">{t.name}</h3>
                        <p className="text-xs text-primary-foreground/80">{t.role}</p>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Our Story" title="Milestones on the way here" />
          <ol className="relative mx-auto mt-16 max-w-3xl">
            <span className="absolute top-0 bottom-0 left-4 w-px bg-gradient-to-b from-primary/10 via-primary/40 to-primary/10 sm:left-1/2" />
            {(about.milestones || []).map((m, i) => (
              <Reveal key={m.year} delay={i * 90}>
                <li
                  className={`relative mb-10 pl-12 sm:w-1/2 sm:pl-0 ${
                    i % 2 === 0 ? "sm:pr-12 sm:text-right" : "sm:ml-auto sm:pl-12"
                  }`}
                >
                  <span
                    className={`gradient-royal absolute top-2 left-2.5 h-3 w-3 rounded-full ring-4 ring-background sm:left-auto ${
                      i % 2 === 0 ? "sm:-right-1.5" : "sm:-left-1.5"
                    }`}
                  />
                  <p className="font-display text-2xl font-semibold text-gradient">{m.year}</p>
                  <h3 className="mt-1 text-lg font-semibold">{m.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <StatsStrip />

      {/* ACHIEVEMENTS */}
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Achievements" title="Proof, not promises" />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {(about.achievements || []).map((a, i) => (
              <Reveal key={a.title} delay={i * 100}>
                <div className="card-lux hover-lift h-full p-7">
                  <Trophy className="h-6 w-6 text-gold" />
                  <h3 className="mt-4 text-lg font-semibold">{a.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* GLOBAL NETWORK */}
      <section className="section-pad bg-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Global Support Network"
            title="Countries served, cities covered"
            desc="Client-facing support in your time zone, execution teams across India."
          />
          <GlobalMap />
        </div>
      </section>

      {/* GALLERY */}
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Gallery" title="Moments from our work" />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((g, i) => (
              <Reveal key={i} delay={(i % 3) * 90}>
                <div className="group overflow-hidden rounded-2xl shadow-soft">
                  <img
                    src={g}
                    alt="NRI360 service moment"
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Let's take care of India together." />
    </>
  );
}
