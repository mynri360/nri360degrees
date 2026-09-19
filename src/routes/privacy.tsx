import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Calendar, Lock, FileText, CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { Particles } from "@/components/site/Chrome";
import { CtaBand } from "@/components/site/Sections";
import { useCMS } from "@/lib/cms-context";
import { useState } from "react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | NRI360" },
      {
        name: "description",
        content:
          "Privacy Policy for NRI360DEGREES. Learn how we collect, use, store, share and protect your personal data in accordance with IT Act 2000 and DPDP Act 2023.",
      },
      { property: "og:title", content: "Privacy Policy | NRI360" },
      {
        property: "og:description",
        content: "Data protection and privacy policy of NRI360DEGREES.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PrivacyPolicyPage,
});

export function PrivacyPolicyPage() {
  const { cms } = useCMS();
  const privacy = cms.privacyPolicy;
  const [activeSectionId, setActiveSectionId] = useState<string>("sec-1");

  return (
    <>
      {/* PAGE HERO HEADER */}
      <section className="relative overflow-hidden bg-slate-950 pt-28 pb-16 text-white">
        <Particles count={15} />
        <div className="blob top-[-80px] left-[15%] h-72 w-72 animate-float-slow bg-primary/20" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-primary uppercase backdrop-blur-md shadow-sm">
              <ShieldCheck className="h-4 w-4" /> Official Compliance Document
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-5 text-4xl leading-[1.1] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {privacy.title || "Privacy Policy"}
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
              {privacy.subtitle}
            </p>
          </Reveal>
          <Reveal delay={280}>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {privacy.lastUpdated || "Last updated: March 2026"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                IT Act 2000 &amp; DPDP Act 2023 Compliant
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PRIVACY POLICY CONTENT & TABLE OF CONTENTS */}
      <section className="section-pad bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12">
            
            {/* Left Sidebar Table of Contents */}
            <aside className="lg:col-span-4 hidden lg:block">
              <div className="sticky top-28 space-y-3 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Policy Outline
                  </h3>
                </div>
                <nav className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1 space-y-1 text-xs">
                  {(privacy.sections || []).map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={() => setActiveSectionId(sec.id)}
                      className={`block rounded-xl px-3 py-2 transition-colors font-medium truncate ${
                        activeSectionId === sec.id
                          ? "bg-primary/10 text-primary font-bold border-l-2 border-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      {sec.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Right Main Policy Content Body */}
            <main className="lg:col-span-8 space-y-8">
              {(privacy.sections || []).map((sec, idx) => (
                <Reveal key={sec.id || idx} delay={(idx % 4) * 50}>
                  <article
                    id={sec.id}
                    className="scroll-mt-28 rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs hover:border-primary/30 transition-colors"
                  >
                    <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5 border-b border-border/60 pb-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-extrabold text-primary">
                        {idx + 1}
                      </span>
                      <span>{sec.title}</span>
                    </h2>
                    
                    <div className="mt-5 space-y-3 text-sm leading-relaxed text-foreground/80">
                      {sec.content.split("\n\n").map((paragraph, pIdx) => (
                        <div key={pIdx}>
                          {paragraph.includes("\n•") || paragraph.startsWith("•") ? (
                            <ul className="space-y-2 pl-1 my-2">
                              {paragraph
                                .split("\n")
                                .filter((line) => line.trim().length > 0)
                                .map((line, lIdx) => {
                                  if (line.startsWith("•")) {
                                    const cleanText = line.replace(/^•\s*/, "");
                                    return (
                                      <li key={lIdx} className="flex items-start gap-2.5">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                                        <span>{cleanText}</span>
                                      </li>
                                    );
                                  }
                                  return <p key={lIdx} className="mb-1">{line}</p>;
                                })}
                            </ul>
                          ) : (
                            <p className="leading-relaxed whitespace-pre-line">{paragraph}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </article>
                </Reveal>
              ))}
            </main>

          </div>
        </div>
      </section>

      <CtaBand title="Have questions about how your data is protected?" />
    </>
  );
}
