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
import { ref, get, set } from "firebase/database";
import { rtdb } from "./firebase";
import { hashPassword, INITIAL_ADMIN_PASSWORD_HASH } from "./auth-security";
import { safeGetItem, safeSetItem } from "./utils";

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

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always initialize with DEFAULT_CMS so SSR and initial client render match exactly.
  // Firebase data is fetched and merged in useEffect (client-only).
  const [cms, setCms] = useState<CMSData>(DEFAULT_CMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Step 1: Safely purge oversized legacy localStorage keys to ensure browser storage quota is never exceeded
    safeClearLegacyCMSCache();

    // Step 2: Fetch latest data from Firebase RTDB with a strict 2.5s timeout to prevent stalled loading
    async function loadFromRTDB() {
      if (typeof window === "undefined" || !window.navigator.onLine) {
        setLoading(false);
        return;
      }
      try {
        const cmsRef = ref(rtdb, "settings/cms");
        const fetchPromise = get(cmsRef);
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
        const snapshot = await Promise.race([fetchPromise, timeoutPromise]);

        if (snapshot && snapshot.exists()) {
          const cloudData = snapshot.val() as Partial<CMSData>;
          setCms((prev) => ({
            ...prev,
            ...cloudData,
            about: { ...prev.about, ...(cloudData.about || {}) },
            hero: { ...prev.hero, ...(cloudData.hero || {}) },
            servicesSection: { ...prev.servicesSection, ...(cloudData.servicesSection || {}) },
            contactHero: { ...prev.contactHero, ...(cloudData.contactHero || {}) },
            contact: { ...DEFAULT_CMS.contact, ...(prev.contact || {}), ...(cloudData.contact || {}) },
          }));
        }
      } catch (_err) {
        console.warn("Could not fetch CMS data from Firebase RTDB:", _err);
      } finally {
        setLoading(false);
      }
    }
    loadFromRTDB();
  }, []);

  const saveCmsState = (newData: CMSData) => {
    setCms(newData);
    // Directly persist updates to Firebase RTDB without writing heavy objects to localStorage
    saveToCloud(newData);
  };

  const saveToCloud = async (overrideData?: CMSData): Promise<boolean> => {
    try {
      const dataToSave = overrideData || cms;
      const cmsRef = ref(rtdb, "settings/cms");
      const timeoutPromise = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 3500));
      const savePromise = set(cmsRef, dataToSave).then(() => true).catch(() => false);
      return await Promise.race([savePromise, timeoutPromise]);
    } catch (err) {
      console.error("Failed to save to Firebase RTDB:", err);
      return false;
    }
  };

  const updateHeader = (data: Partial<HeaderData>) => {
    saveCmsState({ ...cms, header: { ...cms.header, ...data } });
  };

  const updateFooter = (data: Partial<FooterData>) => {
    saveCmsState({ ...cms, footer: { ...cms.footer, ...data } });
  };

  const updateHero = (data: Partial<HeroData>) => {
    const updatedHero = { ...cms.hero, ...data };
    if (updatedHero.videoUrl && updatedHero.videoUrl.includes("lgYbOKV5zl4")) {
      updatedHero.videoUrl = updatedHero.videoUrl.replace("lgYbOKV5zl4", "lgYbOKV5zI4");
    }
    saveCmsState({ ...cms, hero: updatedHero });
  };

  const updateAbout = (data: Partial<AboutData>) => {
    saveCmsState({ ...cms, about: { ...cms.about, ...data } });
  };

  const updateServicesSection = (data: Partial<ServicesSectionData>) => {
    saveCmsState({ ...cms, servicesSection: { ...cms.servicesSection, ...data } });
  };

  const updateContactHero = (data: Partial<ContactHeroData>) => {
    saveCmsState({ ...cms, contactHero: { ...cms.contactHero, ...data } });
  };

  const updateProcessSection = (data: Partial<SectionMeta>) => {
    saveCmsState({ ...cms, processSection: { ...cms.processSection, ...data } });
  };

  const updateWhyUsSection = (data: Partial<SectionMeta>) => {
    saveCmsState({ ...cms, whyUsSection: { ...cms.whyUsSection, ...data } });
  };

  const updateMapSection = (data: Partial<SectionMeta>) => {
    saveCmsState({ ...cms, mapSection: { ...cms.mapSection, ...data } });
  };

  const updateFaqSection = (data: Partial<SectionMeta>) => {
    saveCmsState({ ...cms, faqSection: { ...cms.faqSection, ...data } });
  };

  const updateTestimonialsSection = (data: Partial<SectionMeta>) => {
    saveCmsState({ ...cms, testimonialsSection: { ...cms.testimonialsSection, ...data } });
  };

  const updateCtaBand = (data: Partial<CtaBandData>) => {
    saveCmsState({ ...cms, ctaBand: { ...cms.ctaBand, ...data } });
  };

  const updateContact = (data: Partial<ContactData>) => {
    saveCmsState({ ...cms, contact: { ...cms.contact, ...data } });
  };

  const updateServices = (services: Service[]) => {
    saveCmsState({ ...cms, services });
  };

  const addService = (service: Service) => {
    saveCmsState({ ...cms, services: [service, ...cms.services] });
  };

  const editService = (slug: string, updated: Partial<Service>) => {
    const newServices = cms.services.map((s) => (s.slug === slug ? { ...s, ...updated } : s));
    saveCmsState({ ...cms, services: newServices });
  };

  const deleteService = (slug: string) => {
    const newServices = cms.services.filter((s) => s.slug !== slug);
    saveCmsState({ ...cms, services: newServices });
  };

  const updateFaqs = (faqs: FaqItem[]) => {
    saveCmsState({ ...cms, faqs });
  };

  const updateTestimonials = (testimonials: TestimonialItem[]) => {
    saveCmsState({ ...cms, testimonials });
  };

  const updateWhyUs = (items: WhyUsItem[]) => {
    saveCmsState({ ...cms, whyUs: items });
  };

  const updateProcess = (items: ProcessItem[]) => {
    saveCmsState({ ...cms, process: items });
  };

  const updateStats = (items: StatItem[]) => {
    saveCmsState({ ...cms, stats: items });
  };

  const updateInsights = (items: InsightItem[]) => {
    saveCmsState({ ...cms, insights: items });
  };

  const updateHotspots = (hotspots: MapHotspot[]) => {
    saveCmsState({ ...cms, hotspots });
  };

  const updateValuePillars = (valuePillars: ValuePillar[]) => {
    saveCmsState({ ...cms, valuePillars });
  };

  const updateAdminPassword = async (password: string): Promise<boolean> => {
    const passwordHash = await hashPassword(password);
    const updated = { ...cms, adminPasswordHash: passwordHash };
    saveCmsState(updated);
    return await saveToCloud(updated);
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
    const currentSubs = cms.submissions || [];
    const updated = { ...cms, submissions: [newSubmission, ...currentSubs] };
    saveCmsState(updated);
    await saveToCloud(updated);
  };

  const updateSubmissionStatus = (id: string, status: "New" | "Read") => {
    const currentSubs = cms.submissions || [];
    const nextSubs = currentSubs.map((s) => (s.id === id ? { ...s, status } : s));
    const updated = { ...cms, submissions: nextSubs };
    saveCmsState(updated);
    saveToCloud(updated);
  };

  const deleteSubmission = (id: string) => {
    const currentSubs = cms.submissions || [];
    const nextSubs = currentSubs.filter((s) => s.id !== id);
    const updated = { ...cms, submissions: nextSubs };
    saveCmsState(updated);
    saveToCloud(updated);
  };

  const resetToDefaults = () => {
    saveCmsState(DEFAULT_CMS);
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
      {children}
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
