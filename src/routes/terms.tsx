import { createFileRoute, Link } from "@tanstack/react-router";
import { useCMS, DEFAULT_LEGAL } from "@/lib/cms-context";
import { Scale, Calendar, Printer, Share2, ArrowLeft, Mail, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | NRI360" },
      { name: "description", content: "NRI360 Terms & Conditions and service agreements for Non-Resident Indians globally." },
    ],
  }),
  component: TermsPage,
});

export function TermsPage() {
  const { cms } = useCMS();
  const termsData = cms?.legal?.termsAndConditions || DEFAULT_LEGAL.termsAndConditions;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Terms & Conditions page link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-slate-950 pt-28 pb-16 text-white border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-primary/20 to-slate-900 pointer-events-none" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs text-white/60">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/40">Legal</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white font-medium">{termsData.title}</span>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary backdrop-blur">
                <Scale className="h-3.5 w-3.5" />
                <span>NRI360 Legal Terms</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                {termsData.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>Effective Date: <strong>{termsData.lastUpdated}</strong></span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-all cursor-pointer shadow-sm"
              >
                <Printer className="h-4 w-4" /> Print Terms
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-all cursor-pointer shadow-sm"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Legal Content Container */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-xl">
            {termsData.content ? (
              <article
                className="prose prose-slate dark:prose-invert max-w-none text-foreground/90 space-y-6 leading-relaxed text-sm sm:text-base [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:border-b [&_h2]:border-border/50 [&_h2]:pb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2 [&_a]:text-primary [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: termsData.content }}
              />
            ) : (
              <div className="py-16 text-center space-y-4">
                <Scale className="mx-auto h-12 w-12 text-muted-foreground opacity-40" />
                <h3 className="text-lg font-bold text-foreground">No Content Configured</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  The Terms &amp; Conditions content has not been configured in the CMS yet.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Home
                </Link>
              </div>
            )}
          </div>

          {/* Contact Legal Support Card */}
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm sm:text-base">Inquiries Regarding Service Agreements?</h4>
                <p className="text-xs text-muted-foreground">Contact our Legal &amp; Compliance team for contract questions.</p>
              </div>
            </div>
            <a
              href="mailto:mynri360@gmail.com"
              className="gradient-royal shrink-0 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-soft hover:shadow-lift transition-all"
            >
              Contact Legal Desk
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
