import { Link } from "@tanstack/react-router";
import { Mail, Phone, Instagram, Send, Download, Smartphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { COUNTRIES } from "@/lib/site-data";
import { useCMS } from "@/lib/cms-context";
import { usePWA } from "@/lib/pwa-context";

import araneaLogo from "@/assets/aranea-den-logo.jpeg";

export function Footer() {
  const [email, setEmail] = useState("");
  const { cms } = useCMS();
  const footer = cms.footer;
  const contact = cms.contact;
  const services = cms.services;
  const { isInstalled, triggerInstall } = usePWA();

  return (
    <footer className="relative overflow-hidden gradient-royal text-primary-foreground">
      <div className="blob top-[-140px] left-[-80px] h-80 w-80 animate-drift bg-white/25" />
      <div className="blob right-[-120px] bottom-[-160px] h-96 w-96 animate-float-slow bg-white/15" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative grid h-10 w-10 place-items-center rounded-full bg-white p-0.5 shadow-soft">
                <img src="/logo.png" alt="NRI360 Logo" className="h-full w-full rounded-full object-contain" />
              </span>
              <span className="font-display text-xl font-semibold tracking-tight">{cms.header.brandName}</span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-primary-foreground/80">
              {footer.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              {["100% Professional", "Trusted Assistance", "Worldwide Support"].map((t) => (
                <span key={t} className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-7">
              {!isInstalled ? (
                <button
                  type="button"
                  onClick={triggerInstall}
                  className="group relative inline-flex items-center gap-3 rounded-2xl border border-white/30 bg-white/15 px-4 py-3 text-left shadow-lift backdrop-blur-md transition-all duration-300 hover:border-white/50 hover:bg-white/25 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white p-0.5 shadow-soft transition-transform duration-300 group-hover:scale-105">
                    <img src="/logo.png" alt="NRI360 Logo" className="h-full w-full rounded-full object-contain" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium tracking-wider uppercase text-primary-foreground/80">
                      Get the Mobile App
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                      <span>Download App</span>
                      <Download className="h-4 w-4 text-white transition-transform group-hover:translate-y-0.5" />
                    </span>
                  </div>
                </button>
              ) : (
                <div className="inline-flex items-center gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-3 text-left backdrop-blur-md">
                  <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white p-0.5 shadow-soft">
                    <img src="/logo.png" alt="NRI360 Logo" className="h-full w-full rounded-full object-contain" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium tracking-wider uppercase text-emerald-200">
                      NRI360 PWA
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                      <Smartphone className="h-4 w-4 text-emerald-300" />
                      <span>App Installed</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-[0.2em] uppercase">{footer.quickLinksTitle}</h3>
            <ul className="mt-5 space-y-3 text-sm text-primary-foreground/80">
              {cms.header.navLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to as any} className="transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                {!isInstalled ? (
                  <button
                    type="button"
                    onClick={triggerInstall}
                    className="inline-flex items-center gap-1.5 text-primary-foreground/90 transition-colors hover:text-white font-medium"
                  >
                    <Download className="h-3.5 w-3.5 text-white/80" />
                    <span>Download App</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-white/80 font-medium">
                    <Smartphone className="h-3.5 w-3.5 text-emerald-300" />
                    <span>NRI360 App</span>
                  </span>
                )}
              </li>
              <li>
                <Link to="/admin" className="transition-colors hover:text-white">
                  Admin Portal ⚙️
                </Link>
              </li>
            </ul>
            <h3 className="mt-8 text-sm font-semibold tracking-[0.2em] uppercase">Useful Links</h3>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>
                <a
                  href={`https://instagram.com/${contact.instagram}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="transition-colors hover:text-white"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-[0.2em] uppercase">{footer.serviceLinksTitle}</h3>
            <ul className="mt-5 space-y-3 text-sm text-primary-foreground/80">
              {services.slice(0, 8).map((s) => (
                <li key={s.slug}>
                  <Link to="/services" hash={s.slug} className="transition-colors hover:text-white">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-[0.2em] uppercase">{footer.contactTitle}</h3>
            <ul className="mt-5 space-y-3 text-sm text-primary-foreground/85">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${contact.email}`} className="hover:text-white">
                  {contact.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0" />
                <a href={`tel:+91${contact.phone}`} className="hover:text-white">
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Instagram className="h-4 w-4 shrink-0" />
                <a
                  href={`https://instagram.com/${contact.instagram}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-white"
                >
                  @{contact.instagram}
                </a>
              </li>
            </ul>

            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                if (!email) return;
                setEmail("");
                toast.success("Subscribed", { description: "You'll receive our NRI insights digest." });
              }}
            >
              <label htmlFor="newsletter" className="text-xs tracking-[0.2em] uppercase text-primary-foreground/70">
                Newsletter
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-full border border-white/25 bg-white/10 p-1.5 backdrop-blur">
                <input
                  id="newsletter"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full bg-transparent px-3 text-sm text-white placeholder:text-white/60 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-primary transition-transform duration-500 hover:scale-105"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-14 border-t border-white/20 pt-6">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-primary-foreground/70">
            {COUNTRIES.map((c) => (
              <span key={c.name}>
                {c.flag} {c.name}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-primary-foreground/80">
            <p>{footer.copyrightText}</p>
            <a
              href="https://www.araneaden.com"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 font-medium text-white/90 transition-all hover:bg-white/20 hover:text-white hover:border-white/40 shadow-sm"
            >
              <span>Made by</span>
              <img src={araneaLogo} alt="Aranea Den" className="h-4.5 w-auto rounded-full object-contain" />
              <span className="font-bold tracking-tight">Aranea Den</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
