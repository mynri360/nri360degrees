import { useEffect, useState } from "react";
import { ShieldCheck, Clock } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";
import { useCMS } from "@/lib/cms-context";

type CountryItem = {
  country: string;
  code: string;
  count: string;
  status: string;
  timezone: string;
  offset: number; // UTC offset in hours
  hub?: boolean;
};

const GLOBAL_REGIONS: CountryItem[] = [
  { country: "India (Headquarters)", code: "in", count: "100+ Cities Network", status: "Active Hub 24/7", timezone: "IST", offset: 5.5, hub: true },
  { country: "United States", code: "us", count: "2,100+ NRIs", status: "Active 24/7", timezone: "EST", offset: -5 },
  { country: "Canada", code: "ca", count: "950+ NRIs", status: "Active 24/7", timezone: "EST", offset: -5 },
  { country: "United Kingdom", code: "gb", count: "800+ NRIs", status: "Active 24/7", timezone: "GMT", offset: 0 },
  { country: "UAE & Gulf", code: "ae", count: "1,200+ NRIs", status: "Active 24/7", timezone: "GST", offset: 4 },
  { country: "Singapore", code: "sg", count: "650+ NRIs", status: "Active 24/7", timezone: "SGT", offset: 8 },
  { country: "Australia", code: "au", count: "550+ NRIs", status: "Active 24/7", timezone: "AEST", offset: 10 },
  { country: "Germany", code: "de", count: "420+ NRIs", status: "Active 24/7", timezone: "CET", offset: 1 },
  { country: "France", code: "fr", count: "310+ NRIs", status: "Active 24/7", timezone: "CET", offset: 1 },
  { country: "Saudi Arabia", code: "sa", count: "400+ NRIs", status: "Active 24/7", timezone: "AST", offset: 3 },
  { country: "Qatar", code: "qa", count: "280+ NRIs", status: "Active 24/7", timezone: "AST", offset: 3 },
  { country: "South Africa", code: "za", count: "250+ NRIs", status: "Active 24/7", timezone: "SAST", offset: 2 },
];

function formatLocalTime(offset: number) {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const target = new Date(utc + 3600000 * offset);
  return target.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
}

export function VerifiedOperationsMarquee() {
  const { cms } = useCMS();
  const [times, setTimes] = useState<Record<string, string>>({});

  const activeRegions: CountryItem[] =
    cms.hotspots && cms.hotspots.length > 0
      ? cms.hotspots.map((h) => ({
          country: h.name,
          code: h.code || "in",
          count: h.nriCount || "Active Support",
          status: "Active 24/7",
          timezone: h.timezone || "IST",
          offset: h.timeOffset || 5.5,
          hub: Boolean(h.isHub),
        }))
      : GLOBAL_REGIONS;

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: Record<string, string> = {};
      activeRegions.forEach((item) => {
        newTimes[item.country] = formatLocalTime(item.offset);
      });
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 10000);
    return () => clearInterval(interval);
  }, [cms.hotspots]);

  // Duplicate items twice to create seamless loop
  const marqueeItems = [...activeRegions, ...activeRegions, ...activeRegions];

  return (
    <section className="border-y border-border bg-card/70 backdrop-blur-md py-10 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-8 text-center">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.25em] text-primary uppercase bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
          <ShieldCheck className="h-3.5 w-3.5" /> Verified Global Operations
        </span>
        <h3 className="mt-3 text-2xl font-semibold sm:text-3xl text-foreground">
          Trusted by 5,000+ NRIs Across 10+ Nations
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Live real-time operational status across global time zones · Hover to pause auto-scroll
        </p>
      </div>

      {/* INFINITE HORIZONTAL AUTO-SCROLL MARQUEE CONTAINER */}
      <div className="relative w-full overflow-hidden py-2">
        {/* Left & Right Fading Gradient Overlays */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-32 bg-gradient-to-r from-card to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-32 bg-gradient-to-l from-card to-transparent z-10" />

        <div className="flex w-max animate-marquee space-x-4 hover:[animation-play-state:paused]">
          {marqueeItems.map((item, index) => (
            <a
              key={`${item.country}-${index}`}
              href={whatsappLink({ country: item.country })}
              target="_blank"
              rel="noreferrer noopener"
              className="group relative flex w-80 shrink-0 items-center justify-between rounded-2xl border border-border/80 bg-background/90 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0 overflow-hidden rounded-md border border-border shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <img
                    src={`https://flagcdn.com/w80/${item.code}.png`}
                    alt={`${item.country} official flag`}
                    className="h-6 w-9 object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.country}
                    </p>
                    {item.hub && (
                      <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-600 dark:text-gold uppercase">
                        HQ
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{item.count}</p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end shrink-0">
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  {item.status}
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md border border-border/50">
                  <Clock className="h-2.5 w-2.5 text-primary" />
                  {times[item.country] || "Live"} {item.timezone}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
