import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Clock, ExternalLink, Instagram, Mail, MapPin, MessageCircle, Paperclip, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Reveal } from "@/components/site/Reveal";
import { Particles } from "@/components/site/Chrome";
import { FaqSection, SectionHeading } from "@/components/site/Sections";
import { CONTACT, SERVICE_OPTIONS } from "@/lib/site-data";
import { whatsappLink } from "@/lib/whatsapp";
import legalImg from "@/assets/service-legal.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact NRI360 | Talk to an NRI Services Expert" },
      {
        name: "description",
        content:
          "Reach NRI360 by phone, email, Instagram or WhatsApp. Share your service request and an expert responds within four working hours, in your time zone.",
      },
      { property: "og:title", content: "Contact NRI360" },
      {
        property: "og:description",
        content: "Talk to an NRI services expert — phone, email, WhatsApp or the detailed request form.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});


const CONTACT_FAQS = [
  {
    q: "When will I hear back?",
    a: "Within four working hours for enquiries received on any channel, and an expert consultation is scheduled within one working day.",
  },
  {
    q: "Can we speak in my time zone?",
    a: "Yes. Choose your preferred date and time in the form and we will call you within that window, adjusted to your local time.",
  },
  {
    q: "Which language will the call be in?",
    a: "English, Hindi, Telugu, Tamil, Malayalam or Kannada — mention your preference in the message field.",
  },
  {
    q: "Is the first consultation free?",
    a: "Yes. The initial consultation and the written scope with a fixed quote are provided at no charge.",
  },
];

const initialForm = {
  name: "",
  country: "",
  city: "",
  email: "",
  phone: "",
  whatsapp: "",
  service: "",
  method: "WhatsApp",
  date: "",
  time: "",
  message: "",
};

import { useCMS } from "@/lib/cms-context";

function ContactPage() {
  const { cms, addSubmission } = useCMS();
  const CONTACT = cms.contact;
  const SERVICE_OPTIONS = cms.services.map((s) => s.title);
  const [form, setForm] = useState(initialForm);
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.country.trim() || !form.email.trim()) {
      toast.error("Please fill in all required fields (Name, Country, Email).");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        country: form.country,
        city: form.city,
        email: form.email,
        phone: form.phone,
        whatsapp: form.whatsapp,
        service: form.service,
        method: form.method,
        date: form.date,
        time: form.time,
        message: form.message,
        ...(fileName ? { fileName } : {}),
      };
      await addSubmission(payload);
      toast.success("Request received", {
        description: "Our team will contact you within four working hours.",
      });
      setForm(initialForm);
      setFileName("");
    } catch (_err) {
      toast.error("Failed to save submission. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const waHref = whatsappLink({
    name: form.name,
    country: form.country,
    city: form.city,
    phone: form.phone || form.whatsapp,
    email: form.email,
    service: form.service,
    date: form.date,
    time: form.time,
    message: form.message,
  });

  return (
    <>
      <section className="relative overflow-hidden bg-slate-950 pt-28 pb-14 text-white">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={cms.contactHero?.headerImageUrl || legalImg}
            alt="Contact NRI360 Background"
            className="h-full w-full object-cover object-center scale-105 transition-transform duration-[3000ms] opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/90" />
        </div>
        <Particles count={18} />
        <div className="blob right-[10%] bottom-[-120px] h-80 w-80 animate-drift bg-white/10" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.24em] uppercase backdrop-blur">
              {cms.contactHero?.badgeText || "Contact"}
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-6 max-w-4xl text-5xl leading-[1.05] font-semibold text-balance sm:text-6xl">
              {cms.contactHero?.title || "Tell us what you need in India."}
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-6 max-w-2xl text-base text-primary-foreground/85 sm:text-lg">
              {cms.contactHero?.subtitle || "One message is enough. A specialist will map your request, share a fixed quote and take it from there."}
            </p>
          </Reveal>
        </div>
      </section>

      {/* CONTACT CARDS */}
      <section className="relative -mt-14 pb-4">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Phone, label: "Phone", value: CONTACT.phone, href: `tel:${CONTACT.phoneIntl || CONTACT.phone}` },
            { icon: Mail, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
            { icon: Instagram, label: "Instagram", value: `@${CONTACT.instagram}`, href: CONTACT.instagramUrl || `https://instagram.com/${CONTACT.instagram}` },
            { icon: Clock, label: "Office Hours", value: CONTACT.hours },
          ].map((c, i) => (
            <Reveal key={c.label} delay={i * 90}>
              <div className="card-lux hover-lift h-full p-6">
                <span className="gradient-royal grid h-11 w-11 place-items-center rounded-xl text-primary-foreground">
                  <c.icon className="h-5 w-5" />
                </span>
                <p className="mt-5 text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  {c.label}
                </p>
                {c.href ? (
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer noopener"
                    className="mt-1.5 block text-base font-semibold break-words transition-colors hover:text-primary"
                  >
                    {c.value}
                  </a>
                ) : (
                  <p className="mt-1.5 text-sm font-medium">{c.value}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FORM + MAP */}
      <section className="section-pad">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          <Reveal>
            <form
              className="card-lux p-7 sm:p-9"
              onSubmit={handleSubmit}
            >
              <h2 className="text-2xl font-semibold">Send a detailed request</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                The more you share, the faster we can match you with the right specialist.
              </p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field label="Full Name" required value={form.name} onChange={set("name")} />
                <Field label="Country" required value={form.country} onChange={set("country")} />
                <Field label="Current City" value={form.city} onChange={set("city")} />
                <Field label="Email" type="email" required value={form.email} onChange={set("email")} />
                <Field
                  label="Phone Number (with country code)"
                  placeholder="+1 555 000 1234"
                  value={form.phone}
                  onChange={set("phone")}
                />
                <Field label="WhatsApp Number" placeholder="+1 555 000 1234" value={form.whatsapp} onChange={set("whatsapp")} />

                <label className="flex flex-col gap-2 text-sm font-medium">
                  Select Service
                  <select
                    value={form.service}
                    onChange={set("service")}
                    className="h-12 rounded-xl border border-input bg-background px-4 text-sm transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30 focus:outline-none"
                  >
                    <option value="">Choose a service…</option>
                    {SERVICE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium">
                  Preferred Contact Method
                  <select
                    value={form.method}
                    onChange={set("method")}
                    className="h-12 rounded-xl border border-input bg-background px-4 text-sm transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30 focus:outline-none"
                  >
                    {["WhatsApp", "Phone Call", "Email", "Video Call"].map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </label>

                <Field label="Preferred Date" type="date" value={form.date} onChange={set("date")} />
                <Field label="Preferred Time" type="time" value={form.time} onChange={set("time")} />

                <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
                  Message
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={set("message")}
                    placeholder="Describe your requirement…"
                    className="rounded-xl border border-input bg-background px-4 py-3 text-sm transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30 focus:outline-none"
                  />
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-input bg-muted/40 px-4 py-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:col-span-2">
                  <Paperclip className="h-4 w-4" />
                  {fileName || "Attach a document (optional)"}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                  />
                </label>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="gradient-royal inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform duration-500 hover:-translate-y-1 hover:shadow-lift"
                >
                  <Send className="h-4 w-4" /> Submit Request
                </button>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-semibold text-white transition-transform duration-500 hover:-translate-y-1"
                >
                  <MessageCircle className="h-4 w-4" /> Get Assistance on WhatsApp
                </a>
              </div>
            </form>
          </Reveal>

          <div className="space-y-6">
            <Reveal delay={100}>
              <a
                href={CONTACT.mapUrl || "https://www.google.com/search?q=happy+street+rajahmundry"}
                target="_blank"
                rel="noreferrer noopener"
                className="group card-lux hover-lift block overflow-hidden cursor-pointer relative rounded-[2rem]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  {/* Automatic visual Google Map preview derived from Address / Location Name */}
                  <iframe
                    title="Google Map Location Preview"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(CONTACT.address || CONTACT.locationName || "Rajahmundry")}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    className="absolute inset-0 h-full w-full border-0 pointer-events-none opacity-85 transition-opacity duration-300 group-hover:opacity-100 scale-105"
                    loading="lazy"
                  />
                  {/* Gradient overlays for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20 pointer-events-none" />

                  {/* Floating Header */}
                  <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 border border-white/20 px-3.5 py-1.5 text-xs font-bold text-white uppercase tracking-wider backdrop-blur-md shadow-lg">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> {CONTACT.locationName || "Rajahmundry"}
                    </span>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-950/80 border border-white/20 text-white group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 shadow-lg backdrop-blur-md">
                      <ExternalLink className="h-4 w-4" />
                    </span>
                  </div>

                  {/* Floating Footer info */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 space-y-1.5 p-4 rounded-2xl bg-slate-950/80 border border-white/15 backdrop-blur-md pointer-events-none">
                    <p className="text-base sm:text-lg font-bold text-white group-hover:text-primary-glow transition-colors line-clamp-1">
                      {CONTACT.address || "Happy Street, Rajahmundry"}
                    </p>
                    <p className="text-xs text-primary-foreground/90 flex items-center gap-1.5 font-semibold">
                      Click to open in Google Maps <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </p>
                  </div>
                </div>
              </a>
            </Reveal>

            <Reveal delay={180}>
              <div className="card-lux p-7">
                <h3 className="text-lg font-semibold">Quick contact</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Prefer speed over forms? Reach us directly on any channel below.
                </p>
                <div className="mt-5 space-y-3">
                  <a
                    href={`tel:${CONTACT.phoneIntl}`}
                    className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium transition-all duration-500 hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                  >
                    <Phone className="h-4 w-4" /> {CONTACT.phone}
                  </a>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium transition-all duration-500 hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                  >
                    <Mail className="h-4 w-4" /> {CONTACT.email}
                  </a>
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-3 rounded-xl bg-[#25D366]/10 px-4 py-3 text-sm font-semibold text-[#128C4A] transition-all duration-500 hover:-translate-y-0.5"
                  >
                    <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={240}>
              <div className="relative overflow-hidden rounded-[1.5rem] gradient-royal p-7 text-primary-foreground">
                <div className="blob top-[-60px] right-[-40px] h-48 w-48 animate-float-slow bg-white/25" />
                <h3 className="relative text-lg font-semibold">Response promise</h3>
                <p className="relative mt-2 text-sm text-primary-foreground/85">
                  Every enquiry is acknowledged within four working hours, with a named manager assigned the same day.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-pad bg-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="FAQ" title="Before you reach out" />
          <FaqSection items={CONTACT_FAQS} />
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      {label}
      {required ? <span className="sr-only">required</span> : null}
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={onChange}
        className="h-12 rounded-xl border border-input bg-background px-4 text-sm transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30 focus:outline-none"
      />
    </label>
  );
}
