import React, { createContext, useContext, useEffect, useState } from "react";
import {
  CONTACT as DEFAULT_CONTACT,
  FAQS as DEFAULT_FAQS,
  INSIGHTS as DEFAULT_INSIGHTS,
  MAP_HOTSPOTS as DEFAULT_MAP_HOTSPOTS,
  PROCESS as DEFAULT_PROCESS,
  SERVICES as DEFAULT_SERVICES,
  STATS as DEFAULT_STATS,
  TESTIMONIALS as DEFAULT_TESTIMONIALS,
  VALUE_PILLARS as DEFAULT_VALUE_PILLARS,
  WHY_US as DEFAULT_WHY_US,
  VALUES as DEFAULT_VALUES,
  MILESTONES as DEFAULT_MILESTONES,
  type MapHotspot,
  type Service,
} from "./site-data";
import { ref, get, set, onValue } from "firebase/database";
import { rtdb } from "./firebase";
import { hashPassword, INITIAL_ADMIN_PASSWORD_HASH } from "./auth-security";
import { safeGetItem, safeSetItem, safeRemoveItem } from "./utils";

export type HeaderData = {
  brandName: string;
  brandTagline: string;
  ctaButtonText: string;
  ctaButtonHref: string;
  navLinks: Array<{ label: string; to: string }>;
};

export type FooterData = {
  brandTagline: string;
  description: string;
  quickLinksTitle: string;
  serviceLinksTitle: string;
  contactTitle: string;
  copyrightText: string;
};

export type HeroData = {
  badgeText: string;
  title: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  videoUrl: string;
  videoOpacity: number;
  videoBlur: number;
  backgroundImageUrl: string;
  trustBadges: Array<{ label: string; icon: string }>;
};

export type TeamMember = {
  name: string;
  role: string;
  imageUrl: string;
};

export type CoreValue = {
  title: string;
  desc: string;
};

export type Milestone = {
  year: string;
  title: string;
  desc: string;
};

export type Achievement = {
  title: string;
  desc: string;
};

export type AboutData = {
  badgeText: string;
  title: string;
  subtitle: string;
  headerImageUrl: string;
  storyTitle: string;
  storyParagraphs: string[];
  storyImageUrl: string;
  storyYear: string;
  storyYearDesc: string;
  missionTitle: string;
  missionDesc: string;
  visionTitle: string;
  visionDesc: string;
  coreValues: CoreValue[];
  team: TeamMember[];
  milestones: Milestone[];
  gallery: string[];
  achievements: Achievement[];
};

export type ServicesSectionData = {
  eyebrow: string;
  title: string;
  desc?: string;
  headerImageUrl?: string;
};

export type ContactHeroData = {
  badgeText: string;
  title: string;
  subtitle: string;
  headerImageUrl?: string;
};

export type SectionMeta = {
  eyebrow: string;
  title: string;
  desc?: string;
};

export type CtaBandData = {
  title: string;
  desc: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
};

export type ContactData = typeof DEFAULT_CONTACT;
export type FaqItem = (typeof DEFAULT_FAQS)[0];
export type TestimonialItem = (typeof DEFAULT_TESTIMONIALS)[0];
export type WhyUsItem = (typeof DEFAULT_WHY_US)[0];
export type ProcessItem = (typeof DEFAULT_PROCESS)[0];
export type StatItem = (typeof DEFAULT_STATS)[0];
export type InsightItem = (typeof DEFAULT_INSIGHTS)[0];
export type ValuePillar = (typeof DEFAULT_VALUE_PILLARS)[0];

export type ContactSubmission = {
  id: string;
  name: string;
  country: string;
  city?: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  service?: string;
  method?: string;
  date?: string;
  time?: string;
  message?: string;
  fileName?: string;
  submittedAt: string;
  status: "New" | "Read";
};

export type CMSData = {
  header: HeaderData;
  footer: FooterData;
  hero: HeroData;
  about: AboutData;
  servicesSection: ServicesSectionData;
  contactHero: ContactHeroData;
  processSection: SectionMeta;
  whyUsSection: SectionMeta;
  mapSection: SectionMeta;
  faqSection: SectionMeta;
  testimonialsSection: SectionMeta;
  ctaBand: CtaBandData;
  contact: ContactData;
  services: Service[];
  faqs: FaqItem[];
  testimonials: TestimonialItem[];
  whyUs: WhyUsItem[];
  process: ProcessItem[];
  stats: StatItem[];
  insights: InsightItem[];
  hotspots: MapHotspot[];
  valuePillars: ValuePillar[];
  adminPasswordHash?: string;
  submissions?: ContactSubmission[];
};

const DEFAULT_HEADER: HeaderData = {
  brandName: "NRI360",
  brandTagline: "NRI SERVICES",
  ctaButtonText: "Book Consultation",
  ctaButtonHref: "/contact",
  navLinks: [
    { label: "Home", to: "/" },
    { label: "Services", to: "/services" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ],
};

const DEFAULT_FOOTER: FooterData = {
  brandTagline: "India, handled. While you sleep.",
  description:
    "NRI360 is India's premier global management firm for Non-Resident Indians. Senior care, property, legal, tax and concierge services managed with discipline and absolute transparency.",
  quickLinksTitle: "Quick Links",
  serviceLinksTitle: "Services",
  contactTitle: "Get in touch",
  copyrightText: "© 2026 NRI360. All rights reserved. Serving Non-Resident Indians worldwide.",
};

const DEFAULT_HERO: HeroData = {
  badgeText: "Live in 100+ Indian Cities",
  title: "NRI360 India, handled. While you sleep.",
  subtitle: "End-to-End NRI Services. From taking care of your parents, to managing your property and taxes.",
  primaryCtaText: "Explore Services",
  primaryCtaHref: "/services",
  secondaryCtaText: "Watch Introduction",
  secondaryCtaHref: "https://wa.me/919505163369",
  videoUrl: "https://www.youtube.com/embed/lgYbOKV5zI4",
  videoOpacity: 85,
  videoBlur: 0,
  backgroundImageUrl: "",
  trustBadges: [
    { label: "100+ Cities Covered", icon: "ShieldCheck" },
    { label: "Worldwide Support", icon: "Globe2" },
    { label: "Fast Response", icon: "Zap" },
  ],
};

const DEFAULT_ABOUT: AboutData = {
  badgeText: "ABOUT US",
  title: "Built by NRIs, for NRIs — with the discipline of a global firm.",
  subtitle: "NRI360 exists so that living abroad never means losing control of what matters at home.",
  headerImageUrl: "",
  storyTitle: "Built Out of Genuine Need",
  storyParagraphs: [
    "Managing affairs in India from 10,000 miles away is famously exhausting: unreturned calls, vague quotes, unverified contractors, and constant anxiety about parents or property.",
    "NRI360 was founded to eliminate that chaos. We bring multinational corporate discipline, transparent pricing, verified execution partners, and dedicated relationship managers to every request.",
  ],
  storyImageUrl: "",
  storyYear: "2019",
  storyYearDesc: "The year one family's request became a nationwide service network.",
  missionTitle: "Our Mission",
  missionDesc: "To give every Non-Resident Indian total peace of mind by acting as their accountable, disciplined local partner in India.",
  visionTitle: "Our Vision",
  visionDesc: "To be the single, most trusted global platform for family care, property, legal, and financial management across India.",
  coreValues: DEFAULT_VALUES,
  team: [
    { name: "Relationship Managers", role: "Your single point of contact", imageUrl: "" },
    { name: "Advocates & Notaries", role: "Property, succession, disputes", imageUrl: "" },
    { name: "Chartered Accountants", role: "Tax, FEMA, repatriation", imageUrl: "" },
    { name: "Property & Site Teams", role: "Inspections, construction, upkeep", imageUrl: "" },
  ],
  milestones: DEFAULT_MILESTONES,
  gallery: [],
  achievements: [
    { title: "5000+ families served", desc: "Across 10+ countries with a 99% satisfaction rate." },
    { title: "Zero compliance escalations", desc: "Every filing and registration completed within statutory norms." },
    { title: "50+ vetted partners", desc: "Advocates, CAs, contractors and caregivers under service agreements." },
  ],
};

const DEFAULT_SERVICES_SECTION: ServicesSectionData = {
  eyebrow: "Core Specialisations",
  title: "Key Services Handled With Complete Trust",
  desc: "Focused solutions for Senior Care, Real Estate, Legal Representation, and Tax Filings in India.",
  headerImageUrl: "",
};

const DEFAULT_CONTACT_HERO: ContactHeroData = {
  badgeText: "CONTACT",
  title: "Tell us what you need in India.",
  subtitle: "One message is enough. A specialist will map your request, share a fixed quote and take it from there.",
  headerImageUrl: "",
};

const DEFAULT_PROCESS_SECTION: SectionMeta = {
  eyebrow: "How It Works",
  title: "A six-step journey, fully visible to you",
  desc: "From the first enquiry to the final handover, you always know exactly where your request stands.",
};

const DEFAULT_WHY_US_SECTION: SectionMeta = {
  eyebrow: "Why NRI360",
  title: "Multinational standards, personal care",
  desc: "We combine verified professionals, transparent pricing and disciplined reporting so that distance never becomes a disadvantage.",
};

const DEFAULT_MAP_SECTION: SectionMeta = {
  eyebrow: "Global Coverage",
  title: "Wherever you live, India is one message away",
  desc: "Support scheduled in your local time zone, execution on the ground across 100+ Indian cities.",
};

const DEFAULT_FAQ_SECTION: SectionMeta = {
  eyebrow: "FAQ",
  title: "Questions NRIs ask us first",
};

const DEFAULT_TESTIMONIALS_SECTION: SectionMeta = {
  eyebrow: "Testimonials",
  title: "Families who stopped worrying",
};

const DEFAULT_CTA_BAND: CtaBandData = {
  title: "Ready to hand it over to a team you can trust?",
  desc: "Tell us what you need in India. A specialist responds within four working hours — in your time zone.",
  primaryCtaText: "Contact an expert",
  primaryCtaHref: "/contact",
  secondaryCtaText: "Get assistance on WhatsApp",
  secondaryCtaHref: "https://wa.me/919505163369",
};

const DEFAULT_CMS: CMSData = {
  header: DEFAULT_HEADER,
  footer: DEFAULT_FOOTER,
  hero: DEFAULT_HERO,
  about: DEFAULT_ABOUT,
  servicesSection: DEFAULT_SERVICES_SECTION,
  contactHero: DEFAULT_CONTACT_HERO,
  processSection: DEFAULT_PROCESS_SECTION,
  whyUsSection: DEFAULT_WHY_US_SECTION,
  mapSection: DEFAULT_MAP_SECTION,
  faqSection: DEFAULT_FAQ_SECTION,
  testimonialsSection: DEFAULT_TESTIMONIALS_SECTION,
  ctaBand: DEFAULT_CTA_BAND,
  contact: DEFAULT_CONTACT,
  services: DEFAULT_SERVICES,
  faqs: DEFAULT_FAQS,
  testimonials: DEFAULT_TESTIMONIALS,
  whyUs: DEFAULT_WHY_US,
  process: DEFAULT_PROCESS,
  stats: DEFAULT_STATS,
  insights: DEFAULT_INSIGHTS,
  hotspots: DEFAULT_MAP_HOTSPOTS,
  valuePillars: DEFAULT_VALUE_PILLARS,
  adminPasswordHash: INITIAL_ADMIN_PASSWORD_HASH,
  submissions: [],
};

type CMSContextType = {
  cms: CMSData;
  updateHeader: (data: Partial<HeaderData>) => void;
  updateFooter: (data: Partial<FooterData>) => void;
  updateHero: (data: Partial<HeroData>) => void;
  updateAbout: (data: Partial<AboutData>) => void;
  updateServicesSection: (data: Partial<ServicesSectionData>) => void;
  updateContactHero: (data: Partial<ContactHeroData>) => void;
  updateProcessSection: (data: Partial<SectionMeta>) => void;
  updateWhyUsSection: (data: Partial<SectionMeta>) => void;
  updateMapSection: (data: Partial<SectionMeta>) => void;
  updateFaqSection: (data: Partial<SectionMeta>) => void;
  updateTestimonialsSection: (data: Partial<SectionMeta>) => void;
  updateCtaBand: (data: Partial<CtaBandData>) => void;
  updateContact: (data: Partial<ContactData>) => void;
  updateServices: (services: Service[]) => void;
  addService: (service: Service) => void;
  editService: (slug: string, service: Partial<Service>) => void;
  deleteService: (slug: string) => void;
  updateFaqs: (faqs: FaqItem[]) => void;
  updateTestimonials: (testimonials: TestimonialItem[]) => void;
  updateWhyUs: (items: WhyUsItem[]) => void;
  updateProcess: (items: ProcessItem[]) => void;
  updateStats: (items: StatItem[]) => void;
  updateInsights: (items: InsightItem[]) => void;
  updateHotspots: (hotspots: MapHotspot[]) => void;
  updateValuePillars: (pillars: ValuePillar[]) => void;
  updateAdminPassword: (password: string) => Promise<boolean>;
  addSubmission: (submission: Omit<ContactSubmission, "id" | "submittedAt" | "status">) => Promise<void>;
  updateSubmissionStatus: (id: string, status: "New" | "Read") => void;
  deleteSubmission: (id: string) => void;
  resetToDefaults: () => void;
  saveToCloud: (data?: CMSData) => Promise<boolean>;
  loading: boolean;
};

import { safeClearLegacyCMSCache } from "./utils";

const CMSContext = createContext<CMSContextType | undefined>(undefined);

function ensureArray<T>(val: any, fallback: T[] = []): T[] {
  if (!val) return fallback;
  if (Array.isArray(val)) return val.length > 0 ? val : fallback;
  if (typeof val === "object") {
    const values = Object.values(val) as T[];
    return values.length > 0 ? values : fallback;
  }
  return fallback;
}

function parseCloudCmsData(cloudData: Partial<CMSData>, localHash?: string | null): CMSData {
  const activeHash = cloudData.adminPasswordHash || localHash || INITIAL_ADMIN_PASSWORD_HASH;
  const rawAbout: Partial<AboutData> = cloudData.about || {};
  const rawHero: Partial<HeroData> = cloudData.hero || {};
  const rawHeader: Partial<HeaderData> = cloudData.header || {};

  return {
    ...DEFAULT_CMS,
    ...cloudData,
    adminPasswordHash: activeHash,
    header: {
      ...DEFAULT_CMS.header,
      ...rawHeader,
      navLinks: ensureArray(rawHeader.navLinks, DEFAULT_CMS.header.navLinks),
    },
    hero: {
      ...DEFAULT_CMS.hero,
      ...rawHero,
      trustBadges: ensureArray(rawHero.trustBadges, DEFAULT_CMS.hero.trustBadges),
    },
    about: {
      ...DEFAULT_CMS.about,
      ...rawAbout,
      coreValues: ensureArray(rawAbout.coreValues, DEFAULT_CMS.about.coreValues),
      team: ensureArray(rawAbout.team, DEFAULT_CMS.about.team),
      milestones: ensureArray(rawAbout.milestones, DEFAULT_CMS.about.milestones),
      gallery: ensureArray(rawAbout.gallery, DEFAULT_CMS.about.gallery),
      achievements: ensureArray(rawAbout.achievements, DEFAULT_CMS.about.achievements),
    },
    servicesSection: { ...DEFAULT_CMS.servicesSection, ...(cloudData.servicesSection || {}) },
    contactHero: { ...DEFAULT_CMS.contactHero, ...(cloudData.contactHero || {}) },
    contact: { ...DEFAULT_CMS.contact, ...(cloudData.contact || {}) },

    services: ensureArray(cloudData.services, DEFAULT_CMS.services),
    faqs: ensureArray(cloudData.faqs, DEFAULT_CMS.faqs),
    testimonials: ensureArray(cloudData.testimonials, DEFAULT_CMS.testimonials),
    whyUs: ensureArray(cloudData.whyUs, DEFAULT_CMS.whyUs),
    process: ensureArray(cloudData.process, DEFAULT_CMS.process),
    stats: ensureArray(cloudData.stats, DEFAULT_CMS.stats),
    insights: ensureArray(cloudData.insights, DEFAULT_CMS.insights),
    hotspots: ensureArray(cloudData.hotspots, DEFAULT_CMS.hotspots),
    valuePillars: ensureArray(cloudData.valuePillars, DEFAULT_CMS.valuePillars),
  };
}

function FullPageCmsLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-white font-sans">
      <div className="relative flex flex-col items-center p-6 text-center">
        {/* Animated Brand Logo Glowing Ring */}
        <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-tr from-primary via-indigo-600 to-amber-400 p-0.5 shadow-2xl shadow-primary/40 animate-pulse">
          <div className="flex h-full w-full items-center justify-center rounded-[1.4rem] bg-slate-950">
            <span className="font-display text-2xl font-bold tracking-tight text-white">NRI360</span>
          </div>
        </div>

        {/* Loading Spinner & Live Status */}
        <div className="mt-8 flex items-center gap-3">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">
            Fetching Live Platform Data…
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-400 max-w-sm">
          Loading latest verified NRI360 configuration from Firebase RTDB
        </p>
      </div>
    </div>
  );
}

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cms, setCms] = useState<CMSData>(DEFAULT_CMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    safeClearLegacyCMSCache();
    safeRemoveItem("nri360_active_cms_cache");

    const localHash = safeGetItem("nri360_admin_password_hash");

    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const cmsRef = ref(rtdb, "settings/cms");

    const handleSnapshot = (snapshot: any) => {
      if (snapshot && snapshot.exists()) {
        const cloudData = snapshot.val() as Partial<CMSData>;
        if (cloudData.adminPasswordHash) {
          safeSetItem("nri360_admin_password_hash", cloudData.adminPasswordHash);
        }
        const merged = parseCloudCmsData(cloudData, localHash);
        setCms((prev) => ({
          ...merged,
          submissions: prev.submissions || [],
        }));
      }
      setLoading(false);
    };

    // 1. Instant direct get() to populate latest Firebase RTDB data before rendering
    get(cmsRef)
      .then(handleSnapshot)
      .catch((err) => {
        console.warn("Direct RTDB get() notice:", err);
        setLoading(false);
      });

    // 2. Realtime subscription for live multi-tab & multi-user updates
    const unsubscribeCms = onValue(
      cmsRef,
      handleSnapshot,
      (error) => {
        console.warn("Could not fetch CMS data from Firebase RTDB onValue:", error);
        setLoading(false);
      }
    );

    // Timeout safety fallback so app never freezes permanently if network is offline
    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const subsRef = ref(rtdb, "submissions");
    const unsubscribeSubs = onValue(
      subsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const subsList: ContactSubmission[] = Object.values(val);
          subsList.sort((a, b) => (b.submittedAt > a.submittedAt ? 1 : -1));
          setCms((prev) => ({ ...prev, submissions: subsList }));
        } else {
          setCms((prev) => ({ ...prev, submissions: [] }));
        }
      },
      (_err) => {}
    );

    return () => {
      clearTimeout(fallbackTimer);
      unsubscribeCms();
      unsubscribeSubs();
    };
  }, []);

  const saveCmsState = (newData: CMSData) => {
    setCms(newData);
    saveToCloud(newData);
  };

  const saveToCloud = async (overrideData?: CMSData): Promise<boolean> => {
    try {
      const dataToSave = overrideData || cms;
      const { submissions: _, ...cleanCmsData } = dataToSave;
      const cmsRef = ref(rtdb, "settings/cms");
      const timeoutPromise = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 10000));
      const savePromise = set(cmsRef, cleanCmsData).then(() => true).catch(() => false);
      return await Promise.race([savePromise, timeoutPromise]);
    } catch (err) {
      console.error("Failed to save to Firebase RTDB:", err);
      return false;
    }
  };

  const updateCmsData = (updater: (prev: CMSData) => CMSData) => {
    setCms((prev) => {
      const next = updater(prev);
      setTimeout(() => {
        saveToCloud(next);
      }, 0);
      return next;
    });
  };

  const updateHeader = (data: Partial<HeaderData>) => {
    updateCmsData((prev) => ({ ...prev, header: { ...prev.header, ...data } }));
  };

  const updateFooter = (data: Partial<FooterData>) => {
    updateCmsData((prev) => ({ ...prev, footer: { ...prev.footer, ...data } }));
  };

  const updateHero = (data: Partial<HeroData>) => {
    updateCmsData((prev) => {
      const updatedHero = { ...prev.hero, ...data };
      if (updatedHero.videoUrl && updatedHero.videoUrl.includes("lgYbOKV5zl4")) {
        updatedHero.videoUrl = updatedHero.videoUrl.replace("lgYbOKV5zl4", "lgYbOKV5zI4");
      }
      return { ...prev, hero: updatedHero };
    });
  };

  const updateAbout = (data: Partial<AboutData>) => {
    updateCmsData((prev) => ({ ...prev, about: { ...prev.about, ...data } }));
  };

  const updateServicesSection = (data: Partial<ServicesSectionData>) => {
    updateCmsData((prev) => ({ ...prev, servicesSection: { ...prev.servicesSection, ...data } }));
  };

  const updateContactHero = (data: Partial<ContactHeroData>) => {
    updateCmsData((prev) => ({ ...prev, contactHero: { ...prev.contactHero, ...data } }));
  };

  const updateProcessSection = (data: Partial<SectionMeta>) => {
    updateCmsData((prev) => ({ ...prev, processSection: { ...prev.processSection, ...data } }));
  };

  const updateWhyUsSection = (data: Partial<SectionMeta>) => {
    updateCmsData((prev) => ({ ...prev, whyUsSection: { ...prev.whyUsSection, ...data } }));
  };

  const updateMapSection = (data: Partial<SectionMeta>) => {
    updateCmsData((prev) => ({ ...prev, mapSection: { ...prev.mapSection, ...data } }));
  };

  const updateFaqSection = (data: Partial<SectionMeta>) => {
    updateCmsData((prev) => ({ ...prev, faqSection: { ...prev.faqSection, ...data } }));
  };

  const updateTestimonialsSection = (data: Partial<SectionMeta>) => {
    updateCmsData((prev) => ({ ...prev, testimonialsSection: { ...prev.testimonialsSection, ...data } }));
  };

  const updateCtaBand = (data: Partial<CtaBandData>) => {
    updateCmsData((prev) => ({ ...prev, ctaBand: { ...prev.ctaBand, ...data } }));
  };

  const updateContact = (data: Partial<ContactData>) => {
    updateCmsData((prev) => ({ ...prev, contact: { ...prev.contact, ...data } }));
  };

  const updateServices = (services: Service[]) => {
    updateCmsData((prev) => ({ ...prev, services }));
  };

  const addService = (service: Service) => {
    updateCmsData((prev) => ({ ...prev, services: [service, ...prev.services] }));
  };

  const editService = (slug: string, updated: Partial<Service>) => {
    updateCmsData((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.slug === slug ? { ...s, ...updated } : s)),
    }));
  };

  const deleteService = (slug: string) => {
    updateCmsData((prev) => ({ ...prev, services: prev.services.filter((s) => s.slug !== slug) }));
  };

  const updateFaqs = (faqs: FaqItem[]) => {
    updateCmsData((prev) => ({ ...prev, faqs }));
  };

  const updateTestimonials = (testimonials: TestimonialItem[]) => {
    updateCmsData((prev) => ({ ...prev, testimonials }));
  };

  const updateWhyUs = (items: WhyUsItem[]) => {
    updateCmsData((prev) => ({ ...prev, whyUs: items }));
  };

  const updateProcess = (items: ProcessItem[]) => {
    updateCmsData((prev) => ({ ...prev, process: items }));
  };

  const updateStats = (items: StatItem[]) => {
    updateCmsData((prev) => ({ ...prev, stats: items }));
  };

  const updateInsights = (items: InsightItem[]) => {
    updateCmsData((prev) => ({ ...prev, insights: items }));
  };

  const updateHotspots = (hotspots: MapHotspot[]) => {
    updateCmsData((prev) => ({ ...prev, hotspots }));
  };

  const updateValuePillars = (valuePillars: ValuePillar[]) => {
    updateCmsData((prev) => ({ ...prev, valuePillars }));
  };

  const updateAdminPassword = async (password: string): Promise<boolean> => {
    const passwordHash = await hashPassword(password.trim());
    safeSetItem("nri360_admin_password_hash", passwordHash);
    updateCmsData((prev) => ({ ...prev, adminPasswordHash: passwordHash }));
    return true;
  };

  const addSubmission = async (
    raw: Omit<ContactSubmission, "id" | "submittedAt" | "status">
  ): Promise<void> => {
    const newSubmission: ContactSubmission = {
      ...raw,
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      submittedAt: new Date().toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "New",
    };
    const subRef = ref(rtdb, `submissions/${newSubmission.id}`);
    await set(subRef, newSubmission);
  };

  const updateSubmissionStatus = (id: string, status: "New" | "Read") => {
    const statusRef = ref(rtdb, `submissions/${id}/status`);
    set(statusRef, status);
  };

  const deleteSubmission = (id: string) => {
    const subRef = ref(rtdb, `submissions/${id}`);
    set(subRef, null);
  };

  const resetToDefaults = () => {
    safeRemoveItem("nri360_admin_password_hash");
    safeRemoveItem("nri360_active_cms_cache");
    updateCmsData(() => DEFAULT_CMS);
  };

  return (
    <CMSContext.Provider
      value={{
        cms,
        updateHeader,
        updateFooter,
        updateHero,
        updateAbout,
        updateServicesSection,
        updateContactHero,
        updateProcessSection,
        updateWhyUsSection,
        updateMapSection,
        updateFaqSection,
        updateTestimonialsSection,
        updateCtaBand,
        updateContact,
        updateServices,
        addService,
        editService,
        deleteService,
        updateFaqs,
        updateTestimonials,
        updateWhyUs,
        updateProcess,
        updateStats,
        updateInsights,
        updateHotspots,
        updateValuePillars,
        updateAdminPassword,
        addSubmission,
        updateSubmissionStatus,
        deleteSubmission,
        resetToDefaults,
        saveToCloud,
        loading,
      }}
    >
      {loading ? <FullPageCmsLoader /> : children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error("useCMS must be used within a CMSProvider");
  }
  return context;
};
