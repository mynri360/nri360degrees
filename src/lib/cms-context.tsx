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

export type LegalPageContent = {
  title: string;
  lastUpdated: string;
  content: string;
};

export type LegalPagesData = {
  privacyPolicy: LegalPageContent;
  termsAndConditions: LegalPageContent;
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
  legal: LegalPagesData;
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

export const DEFAULT_LEGAL: LegalPagesData = {
  privacyPolicy: {
    title: "Privacy Policy",
    lastUpdated: "September 2026",
    content: `<h2>1. Introduction</h2>
<p>This Privacy Policy describes how NRI360DEGREES ("we", "us", "our"), operating the website nri360degrees.com under the brand NRI360DEGREES, collects, uses, stores, shares, and protects your personal data when you use our website and services. We provide professional assistance services to Non-Resident Indians (NRIs), Overseas Citizens of India (OCI) cardholders, and Persons of Indian Origin, including real estate assistance, OCI application assistance, and documentation support. By using our website or services, you consent to the practices described in this Policy. This Policy is published in accordance with the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and has been prepared with reference to the Digital Personal Data Protection Act, 2023 and the Digital Personal Data Protection Rules, 2025.</p>

<h2>2. Information We Collect</h2>
<p>Depending on the service you engage, we may collect:</p>
<ul>
  <li><strong>Identity information:</strong> full name, date of birth, place of birth, photographs, signature, nationality, and details of Indian origin.</li>
  <li><strong>Identity and travel documents:</strong> passport copies, OCI/PIO card copies, visa copies, PAN, and, only where a specific government process mandates it, Aadhaar or other government-issued identifiers.</li>
  <li><strong>Contact information:</strong> email address, phone/WhatsApp number, current overseas address, and Indian address.</li>
  <li><strong>Property and legal documents:</strong> title deeds, sale agreements, power of attorney, tax receipts, society/AMC records, and related papers, where you engage property services.</li>
  <li><strong>Financial information:</strong> bank account details required for a specific transaction or refund. We do NOT collect or store your card numbers, CVV, UPI PIN, or net-banking credentials; these are handled directly by our payment gateway.</li>
  <li><strong>Technical information:</strong> IP address, browser type, device information, and cookies, collected automatically when you browse the website.</li>
</ul>

<h2>3. Purpose of Collection</h2>
<p>We use your data only to:</p>
<ul>
  <li><strong>(a)</strong> provide the specific service you have engaged;</li>
  <li><strong>(b)</strong> prepare, verify, and submit applications and documents to the relevant authorities or counterparties on your instruction;</li>
  <li><strong>(c)</strong> communicate with you about your engagement;</li>
  <li><strong>(d)</strong> process payments and refunds;</li>
  <li><strong>(e)</strong> comply with legal, tax, and regulatory obligations;</li>
  <li><strong>(f)</strong> maintain records of engagements; and</li>
  <li><strong>(g)</strong> improve our website.</li>
</ul>
<p>We do not use your data for purposes incompatible with these without fresh consent. In practice, this means the documents you share for one engagement are used only for that engagement, and we will ask you before reusing them for any new matter. We may use your contact details to send you service updates and reminders connected to your engagement, and, only if you have subscribed, occasional newsletters that you can opt out of at any time. We do not carry out automated profiling of clients, and we do not use client documents for marketing or training of any kind.</p>

<h2>4. Consent</h2>
<p>We collect and process personal data, including sensitive personal data such as passport and financial information, only with your consent, which you provide when you submit a form, upload documents, sign an engagement, or make a payment. You may withdraw consent at any time by writing to <a href="mailto:mynri360@gmail.com">mynri360@gmail.com</a>; withdrawal will not affect processing already completed, and may make it impossible for us to continue or complete the engaged service.</p>

<h2>5. Sharing of Information</h2>
<p>We never sell or rent your personal data. We share it only:</p>
<ul>
  <li><strong>(a)</strong> with government authorities, ministries, missions, registries, and their authorised service providers, strictly as required to process your application or transaction on your instruction;</li>
  <li><strong>(b)</strong> with empanelled professionals such as advocates, chartered accountants, and title-search agents engaged for your matter;</li>
  <li><strong>(c)</strong> with courier and logistics partners for physical document movement;</li>
  <li><strong>(d)</strong> with our payment gateway partner Razorpay Software Private Limited for processing payments, subject to their own privacy policy;</li>
  <li><strong>(e)</strong> with our IT service providers under confidentiality obligations; and</li>
  <li><strong>(f)</strong> where required by law, court order, or government direction.</li>
</ul>

<h2>6. Payments</h2>
<p>All online payments are processed by Razorpay, an RBI-regulated payment aggregator, over secure encrypted connections. We do not store your card or banking credentials on our servers.</p>

<h2>7. International Users and Data Location</h2>
<p>Our clients are primarily located outside India. By using our services from overseas, you understand that your data will be transferred to and processed in India, where our operations are based, and shared with Indian authorities as needed for your engagement.</p>

<h2>8. Data Retention</h2>
<p>We retain personal data only as long as needed for the purpose it was collected, to comply with legal and tax record-keeping obligations, and to establish or defend legal claims. Copies of engagement documents are retained for up to eight years in line with Indian record-keeping norms, after which they are securely deleted or destroyed. You may request earlier deletion of documents not required by law to be retained.</p>

<h2>9. Security</h2>
<p>We follow reasonable security practices and procedures as required under Section 43A of the Information Technology Act, 2000, including encrypted transmission (HTTPS), access controls, and restricted staff access to client documents. Client documents are stored in access-controlled systems and shared internally strictly on a need-to-know basis for your matter. Physical documents in our custody are kept in secure storage at our office and moved only through reputed courier partners with tracking. We review our security practices periodically and update them as technology and threats evolve. In the unlikely event of a data breach affecting your personal data, we will notify you and the relevant authorities as required by applicable law.</p>

<h2>10. Your Rights</h2>
<p>You may at any time:</p>
<ul>
  <li><strong>(a)</strong> request access to the personal data we hold about you;</li>
  <li><strong>(b)</strong> request correction or updating of inaccurate data;</li>
  <li><strong>(c)</strong> request erasure of data no longer required by law;</li>
  <li><strong>(d)</strong> withdraw consent; and</li>
  <li><strong>(e)</strong> nominate another individual to exercise your rights in case of death or incapacity.</li>
</ul>
<p>Write to <a href="mailto:mynri360@gmail.com">mynri360@gmail.com</a> to exercise any right; we will respond within 30 days.</p>

<h2>11. Minors</h2>
<p>Our services are contracted only by persons aged 18 or above. Where a service concerns a minor (for example, an OCI application for a child), we process the minor's data only on the documented instruction and consent of the parent or legal guardian.</p>

<h2>12. Cookies</h2>
<p>We use essential cookies and basic analytics cookies to run and improve the website. You can disable cookies in your browser; some features may not function correctly.</p>
<p>For analytics we use Google Analytics, which helps us understand how many people visit the website, which pages they find useful, and which countries and devices they visit from. This information is aggregated and statistical:</p>
<ul>
  <li>We do not use it to identify you personally.</li>
  <li>Your IP address is anonymised before it is stored.</li>
  <li>We do not sell or share this data with advertisers.</li>
</ul>
<p>You can opt out of Google Analytics across all websites using the Google Analytics Opt-out Browser Add-on.</p>

<h2>13. Grievance Officer</h2>
<p>In accordance with the Information Technology Act, 2000, the rules made thereunder, and the Consumer Protection (E-Commerce) Rules, 2020, the Grievance Officer for this website is:</p>
<p><strong>The Proprietor, NRI360DEGREES</strong><br/>79-18-18/2, Primala Nilayam, Omkar Street, Gandhipuram, Rajahmundry, East Godavari, Andhra Pradesh, 533103.<br/>Email: <a href="mailto:mynri360@gmail.com">mynri360@gmail.com</a> | Phone: +91 95051 63369</p>
<p>Grievances will be acknowledged within 48 hours and resolved within 30 days of receipt.</p>

<h2>14. Changes to this Policy</h2>
<p>We may update this Policy from time to time. The "Last updated" date reflects the latest version. Continued use of the website after changes constitutes acceptance.</p>

<h2>15. Governing Law</h2>
<p>This Policy is governed by the laws of India, and courts at Rajahmundry, Andhra Pradesh shall have exclusive jurisdiction.</p>`
  },
  termsAndConditions: {
    title: "Terms & Conditions",
    lastUpdated: "September 2026",
    content: `<h2>1. Acceptance of Terms</h2>
<p>These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("Client", "you") and NRI360DEGREES ("we", "us", "our"), a sole proprietorship with its office at 79-18-18/2, Primala Nilayam, Omkar Street, Gandhipuram, Rajahmundry, East Godavari, Andhra Pradesh, 533103, operating nri360degrees.com under the brand NRI360DEGREES. By using this website, submitting an enquiry, engaging any service, or making a payment, you accept these Terms, our Privacy Policy, Refund and Cancellation Policy, Disclaimer, and Service Delivery Policy, all of which are incorporated into these Terms by reference.</p>

<h2>2. Nature of Our Business</h2>
<p>We are a private professional services consultancy. We are NOT a government department, agency, or authorised representative of the Government of India, the Ministry of Home Affairs, the Ministry of External Affairs, any Indian Embassy, Consulate or Mission, FRRO, UIDAI, the Income Tax Department, any state government, or any government-appointed outsourcing agency. All statutory applications are decided solely by the relevant authorities. We charge fees only for our own professional assistance, preparation, coordination, and advisory services.</p>

<h2>3. Scope of Services</h2>
<p>We offer assistance services to NRIs, OCIs, and PIOs, including:</p>
<ul>
  <li>assistance with OCI card applications and renewals;</li>
  <li>documentation and certificate procurement support;</li>
  <li>real estate search, coordination, and documentation support in India;</li>
  <li>income tax return filing assistance;</li>
  <li>investment coordination for shares and mutual funds;</li>
  <li>astrology consultations;</li>
  <li>home loan assistance; and</li>
  <li>related services as listed on this website.</li>
</ul>
<p>The exact scope, deliverables, timeline, and fee for your matter are as stated on the relevant service page or in your written engagement confirmation, whichever is more specific.</p>

<h2>4. Eligibility and Authority</h2>
<p>You confirm that you are at least 18 years of age and legally competent to contract, and that where you engage us on behalf of another person (including a minor child or a family member), you hold lawful authority to do so.</p>

<h2>5. Client Obligations</h2>
<p>You agree to:</p>
<ul>
  <li><strong>(a)</strong> provide true, accurate, complete, and genuine information and documents;</li>
  <li><strong>(b)</strong> respond to our requests for information or documents within a reasonable time;</li>
  <li><strong>(c)</strong> pay all applicable government, statutory, and third-party fees when due; and</li>
  <li><strong>(d)</strong> comply with all applicable laws, including the Foreign Exchange Management Act, 1999 (FEMA) and Indian tax laws in respect of any property or financial transaction.</li>
</ul>
<p>Submission of forged, tampered, or fraudulent documents will result in immediate termination of the engagement without refund, and may be reported to the appropriate authorities.</p>

<h2>6. Fees and Payment</h2>
<p><strong>(a)</strong> Our service fees are as displayed on this website or as agreed in writing, and are exclusive of government fees, statutory charges, stamp duty, registration charges, courier charges, and professional fees of independent third parties (advocates, CAs, valuers), which are payable at actuals.</p>
<p><strong>(b)</strong> Payments on this website are processed in Indian Rupees through Razorpay.</p>
<p><strong>(c)</strong> We do not collect any amount in the name of the Government of India. Government fees are either paid by you directly to the authority, or remitted by us to the authority at actuals on your behalf with your authorisation, and are itemised separately.</p>

<h2>7. No Guarantee of Outcome</h2>
<p>Grant, rejection, or delay of any application (including OCI applications), registration, or approval is at the sole discretion of the concerned government authority. Timelines we indicate are estimates based on experience and are not commitments. We do not and cannot guarantee approval, processing time, or outcome of any statutory process, property negotiation, or transaction.</p>

<h2>8. Real Estate Services: Specific Terms</h2>
<p><strong>(a)</strong> Our real estate services are facilitation and coordination services. We act as a referral and coordination consultancy and do not act as a real estate agent for RERA-registered projects; for such projects we will connect you with RERA-registered agents or developers.</p>
<p><strong>(b)</strong> You acknowledge that under FEMA and RBI regulations, NRIs and OCIs may generally acquire residential and commercial immovable property in India but may not acquire agricultural land, plantation property, or farmhouses. Compliance with FEMA, including the mode of payment through permitted banking channels (NRE/NRO/FCNR accounts or inward remittance), and with applicable tax laws including TDS obligations, is your responsibility, and we recommend independent advice from a chartered accountant.</p>
<p><strong>(c)</strong> We do not certify or guarantee title to any property. Any title search or due diligence report is prepared by independent empanelled advocates based on available public records, and you should obtain independent legal advice before any purchase, sale, or transfer.</p>
<p><strong>(d)</strong> Property prices, availability, and market conditions change without notice, and any listing or estimate on this website is indicative only.</p>

<h2>9. Professional Services Disclaimer</h2>
<p>We are not a law firm and do not provide legal opinions or appear before courts; where legal work is required, it is performed by independent advocates engaged for your matter. We are not chartered accountants; tax filings and opinions, where needed, are performed by independent CAs. Information on this website is general information and not legal, tax, or investment advice.</p>

<h2>10. Intellectual Property</h2>
<p>All content on this website, including text, graphics, logos, and page layouts, is our property or licensed to us, and may not be copied, republished, or exploited commercially without written permission.</p>

<h2>11. Limitation of Liability</h2>
<p>To the maximum extent permitted by law:</p>
<ul>
  <li><strong>(a)</strong> our total aggregate liability arising out of or in connection with any service shall not exceed the service fee actually paid by you to us for that specific service;</li>
  <li><strong>(b)</strong> we shall not be liable for any indirect, incidental, consequential, or special losses, loss of profit, loss of opportunity, travel costs, or currency fluctuation losses; and</li>
  <li><strong>(c)</strong> we shall not be liable for acts, omissions, delays, or decisions of any government authority, bank, developer, seller, buyer, courier, or other third party.</li>
</ul>

<h2>12. Indemnity</h2>
<p>You agree to indemnify and hold us harmless from any claim, loss, or expense arising from your breach of these Terms, your violation of applicable law, or any inaccurate or fraudulent information or document supplied by you.</p>

<h2>13. Force Majeure</h2>
<p>We are not liable for delay or failure caused by events beyond our reasonable control, including changes in government policy, portal outages, strikes, natural calamities, or acts of government.</p>

<h2>14. Termination</h2>
<p>We may suspend or terminate an engagement for non-payment, non-cooperation for more than 60 days, abusive conduct, or suspected fraud. Refunds on termination are governed by the Refund and Cancellation Policy.</p>

<h2>15. Grievance Redressal</h2>
<p>Complaints may be addressed to our Grievance Officer, The Proprietor, NRI360DEGREES, at <a href="mailto:mynri360@gmail.com">mynri360@gmail.com</a> or 79-18-18/2, Primala Nilayam, Omkar Street, Gandhipuram, Rajahmundry, East Godavari, Andhra Pradesh, 533103. Grievances will be acknowledged within 48 hours and resolved within 30 days, in line with the Consumer Protection (E-Commerce) Rules, 2020.</p>

<h2>16. Governing Law and Jurisdiction</h2>
<p>These Terms are governed by the laws of India. Subject to any mandatory consumer law rights available to you, all disputes shall be subject to the exclusive jurisdiction of the courts at Rajahmundry, Andhra Pradesh, India.</p>

<h2>17. Contact</h2>
<p><strong>NRI360DEGREES</strong><br/>79-18-18/2, Primala Nilayam, Omkar Street, Gandhipuram, Rajahmundry, East Godavari, Andhra Pradesh, 533103.<br/>Email: <a href="mailto:mynri360@gmail.com">mynri360@gmail.com</a> | Phone: +91 95051 63369</p>`
  }
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
  legal: DEFAULT_LEGAL,
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
  updateLegalPages: (data: Partial<LegalPagesData>) => void;
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
    legal: {
      privacyPolicy: {
        title: cloudData?.legal?.privacyPolicy?.title || DEFAULT_LEGAL.privacyPolicy.title,
        lastUpdated: cloudData?.legal?.privacyPolicy?.lastUpdated || DEFAULT_LEGAL.privacyPolicy.lastUpdated,
        content: cloudData?.legal?.privacyPolicy?.content || DEFAULT_LEGAL.privacyPolicy.content,
      },
      termsAndConditions: {
        title: cloudData?.legal?.termsAndConditions?.title || DEFAULT_LEGAL.termsAndConditions.title,
        lastUpdated: cloudData?.legal?.termsAndConditions?.lastUpdated || DEFAULT_LEGAL.termsAndConditions.lastUpdated,
        content: cloudData?.legal?.termsAndConditions?.content || DEFAULT_LEGAL.termsAndConditions.content,
      },
    },
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
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(splashTimer);
  }, []);

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

  const updateLegalPages = (data: Partial<LegalPagesData>) => {
    updateCmsData((prev) => ({
      ...prev,
      legal: {
        ...prev.legal,
        ...data,
        privacyPolicy: {
          ...prev.legal.privacyPolicy,
          ...(data.privacyPolicy || {}),
        },
        termsAndConditions: {
          ...prev.legal.termsAndConditions,
          ...(data.termsAndConditions || {}),
        },
      },
    }));
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
        updateLegalPages,
        updateAdminPassword,
        addSubmission,
        updateSubmissionStatus,
        deleteSubmission,
        resetToDefaults,
        saveToCloud,
        loading,
      }}
    >
      {showSplash ? <FullPageCmsLoader /> : children}
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
