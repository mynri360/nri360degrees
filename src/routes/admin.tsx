import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  useCMS,
  type FaqItem,
  type TestimonialItem,
  type WhyUsItem,
  type ProcessItem,
  type StatItem,
  type TeamMember,
  type CoreValue,
  type Milestone,
  type Achievement,
  type ContactSubmission,
} from "@/lib/cms-context";
import { type Service, type MapHotspot } from "@/lib/site-data";
import { Icon } from "@/components/site/Sections";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { hashPassword, INITIAL_ADMIN_PASSWORD_HASH } from "@/lib/auth-security";
import { toast } from "sonner";
import {
  Lock,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  CloudUpload,
  Download,
  Sliders,
  Layers,
  MessageSquareQuote,
  HelpCircle,
  Award,
  ShieldCheck,
  Globe2,
  Navigation,
  FileText,
  PhoneCall,
  BookOpen,
  Sparkles,
  MapPin,
  Zap,
  Home as HomeIcon,
  Settings,
  Image as ImageIcon,
  Users,
  Trophy,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  X,
  Eye,
  KeyRound,
  Inbox,
  AlertTriangle,
} from "lucide-react";

function isValidGoogleMapsUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return false;
  try {
    const parsed = new URL(trimmed);
    return (
      parsed.hostname.includes("google.com") ||
      parsed.hostname.includes("goo.gl") ||
      parsed.hostname.includes("maps.app.goo.gl")
    );
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "CMS Admin Portal | NRI360" }],
  }),
  component: AdminPage,
});

type MainTabType = "home" | "services" | "about" | "contact" | "global";

function AdminPage() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Main Page-Based Navigation Tab State
  const [activeTab, setActiveTab] = useState<MainTabType>("home");

  // Sub-Section Filter State per Page
  const [subTab, setSubTab] = useState<string>("all");

  // Category filter and search state for Services tab
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [serviceSearch, setServiceSearch] = useState<string>("");

  // State for Password Change Form
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  // State for Contact Submissions View & Delete Confirmation Modal
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [deletingSubmissionId, setDeletingSubmissionId] = useState<string | null>(null);

  const {
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
    deleteService,
    updateFaqs,
    updateTestimonials,
    updateWhyUs,
    updateProcess,
    updateStats,
    updateHotspots,
    updateValuePillars,
    updateAdminPassword,
    updateSubmissionStatus,
    deleteSubmission,
    resetToDefaults,
    saveToCloud,
  } = useCMS();

  // Editing state for Service modal
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isNewService, setIsNewService] = useState(false);

  // Helper component for uploading/pasting image URLs
  const ImagePicker = ({
    label,
    value,
    onChange,
    previewClass = "h-28 rounded-xl object-cover w-full",
  }: {
    label: string;
    value: string;
    onChange: (url: string) => void;
    previewClass?: string;
  }) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const toBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const result = await uploadToCloudinary(file, "nri360_unsigned", "nri360/cms");
        onChange(result.secureUrl);
        toast.success("Image uploaded to Cloudinary! ✅");
      } catch (_err) {
        try {
          const b64 = await toBase64(file);
          onChange(b64);
          toast.success("Image saved locally (base64).");
        } catch {
          toast.error("Failed to process image. Please paste a URL instead.");
        }
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    };

    return (
      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted-foreground">{label}</label>
        {value && (
          <img src={value} alt="preview" className={previewClass} onError={(e) => (e.currentTarget.style.display = "none")} />
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste any image URL (https://...) or click Upload ↓"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="shrink-0 rounded-lg border border-primary/50 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "📂 Upload"}
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredHash = await hashPassword(passcode);
    const storedHash = cms.adminPasswordHash || INITIAL_ADMIN_PASSWORD_HASH;
    if (enteredHash === storedHash) {
      setIsAuthenticated(true);
      toast.success("Authenticated successfully as Admin");
    } else {
      toast.error("Invalid Admin Password. Please try again.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentHash = await hashPassword(currentPass);
    const storedHash = cms.adminPasswordHash || INITIAL_ADMIN_PASSWORD_HASH;

    if (currentHash !== storedHash) {
      toast.error("Current password is incorrect.");
      return;
    }
    if (!newPass.trim()) {
      toast.error("New password cannot be empty.");
      return;
    }
    if (newPass.length < 4) {
      toast.error("New password must be at least 4 characters long.");
      return;
    }
    if (newPass === currentPass) {
      toast.error("New password should not be the same as the current password.");
      return;
    }
    if (newPass !== confirmPass) {
      toast.error("New passwords do not match.");
      return;
    }
    setChangingPass(true);
    try {
      await updateAdminPassword(newPass);
      toast.success("Password changed successfully!", {
        description: "Please log in again with your new password.",
      });
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      setIsAuthenticated(false);
    } catch (_err) {
      toast.error("Failed to update password. Please try again.");
    } finally {
      setChangingPass(false);
    }
  };

  const handleSaveAll = async () => {
    const tid = toast.loading("Saving changes to Cloud...");
    const ok = await saveToCloud(cms);
    toast.dismiss(tid);
    if (ok) {
      toast.success("All CMS changes saved and synced live!");
    } else {
      toast.success("CMS changes saved locally!");
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all CMS content to factory defaults?")) {
      resetToDefaults();
      toast.info("CMS data reset to defaults.");
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cms, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nri360-cms-backup-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("CMS data exported successfully!");
  };

  const handleTabChange = (tab: MainTabType) => {
    setActiveTab(tab);
    setSubTab("all");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[90vh] items-center justify-center px-4 py-12">
        <div className="card-lux w-full max-w-md p-8 shadow-2xl border border-primary/20">
          <div className="flex flex-col items-center text-center">
            <div className="gradient-royal grid h-16 w-16 place-items-center rounded-2xl text-primary-foreground shadow-lift">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-2xl font-bold">Admin CMS Portal</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter admin password to access the CMS portal.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Admin Password
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter admin password..."
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="gradient-royal w-full rounded-xl py-3.5 text-sm font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5"
            >
              Unlock CMS Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered Services List
  const serviceCategories = Array.from(new Set(cms.services.map((s) => s.category)));
  const filteredServices = cms.services.filter((s) => {
    const matchesCat = selectedCategory === "All" || s.category === selectedCategory;
    const matchesSearch =
      serviceSearch === "" ||
      s.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      s.blurb.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      s.slug.toLowerCase().includes(serviceSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase">
            <ShieldCheck className="h-3.5 w-3.5" /> Pin-to-Pin CMS Live
          </span>
          <h1 className="mt-2 text-3xl font-bold">NRI360 Website Manager</h1>
          <p className="text-sm text-muted-foreground">
            Organized according to public website structure: Home, Services, About, Contact & Global Settings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSaveAll}
            className="inline-flex items-center gap-2 rounded-xl gradient-royal px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-soft transition-all hover:scale-105"
          >
            <CloudUpload className="h-4 w-4" /> Save & Sync Live Site
          </button>
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground transition-all hover:bg-accent"
          >
            <Download className="h-4 w-4" /> Export Backup
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/20"
          >
            <RotateCcw className="h-4 w-4" /> Reset Defaults
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <Lock className="h-4 w-4" /> Lock
          </button>
        </div>
      </div>

      {/* Primary Page Navigation Tabs (Matching Actual Website Routes) */}
      <div className="mt-6 flex flex-wrap gap-2.5 border-b border-border/80 pb-4">
        {[
          { id: "home", label: "HOME PAGE ( / )", icon: HomeIcon },
          { id: "services", label: `SERVICES PAGE ( /services )`, icon: Layers, badge: `${cms.services.length}` },
          { id: "about", label: "ABOUT PAGE ( /about )", icon: BookOpen },
          { id: "contact", label: "CONTACT PAGE ( /contact )", icon: PhoneCall },
          { id: "global", label: "GLOBAL SETTINGS", icon: Settings },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as MainTabType)}
              className={`inline-flex items-center gap-2.5 rounded-xl px-5 py-3 text-xs font-bold transition-all ${
                isActive
                  ? "gradient-royal text-primary-foreground shadow-lift scale-[1.02]"
                  : "border border-border/60 bg-card/70 text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <IconComp className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Secondary Section Sub-Pills Filter for the Active Page */}
      <div className="mt-4 flex flex-wrap items-center gap-2 bg-muted/40 p-2.5 rounded-2xl border border-border/50">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2">
          Jump to Section:
        </span>

        {activeTab === "home" &&
          [
            { id: "all", label: "All Home Sections" },
            { id: "hero", label: "Hero & Video Banner" },
            { id: "servicesPreview", label: "Services Preview" },
            { id: "whyus", label: "Why Choose Us" },
            { id: "process", label: "Process Steps" },
            { id: "stats", label: "Impact Stats" },
            { id: "testimonials", label: "Testimonials" },
            { id: "map", label: "Global Coverage & Map" },
            { id: "faqs", label: "FAQs" },
            { id: "cta", label: "Home CTA" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSubTab(pill.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                subTab === pill.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:text-foreground border border-border/50"
              }`}
            >
              {pill.label}
            </button>
          ))}

        {activeTab === "services" &&
          [
            { id: "all", label: "All Services Sections" },
            { id: "header", label: "Services Page Hero Header" },
            { id: "catalog", label: `Services Catalog (${cms.services.length})` },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSubTab(pill.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                subTab === pill.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:text-foreground border border-border/50"
              }`}
            >
              {pill.label}
            </button>
          ))}

        {activeTab === "about" &&
          [
            { id: "all", label: "All About Sections" },
            { id: "hero", label: "About Hero Header" },
            { id: "story", label: "Story & Vision/Mission" },
            { id: "values", label: "Core Values" },
            { id: "team", label: "Professional Team" },
            { id: "milestones", label: "Story Milestones" },
            { id: "achievements", label: "Achievements & Proof" },
            { id: "gallery", label: "Photo Gallery" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSubTab(pill.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                subTab === pill.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:text-foreground border border-border/50"
              }`}
            >
              {pill.label}
            </button>
          ))}

        {activeTab === "contact" &&
          [
            { id: "all", label: "All Contact Sections" },
            {
              id: "submissions",
              label: `Contact Form Submissions${
                (cms.submissions || []).filter((s) => s.status === "New").length > 0
                  ? ` [${(cms.submissions || []).filter((s) => s.status === "New").length} New]`
                  : ""
              }`,
            },
            { id: "hero", label: "Contact Hero Header" },
            { id: "map", label: "Contact Map / Location" },
            { id: "channels", label: "Phone, Email & Socials" },
            { id: "hours", label: "Office Hours & Response Promise" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSubTab(pill.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                subTab === pill.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:text-foreground border border-border/50"
              }`}
            >
              {pill.label}
            </button>
          ))}

        {activeTab === "global" &&
          [
            { id: "all", label: "All Global Settings" },
            { id: "security", label: "Security & Admin Password" },
            { id: "header", label: "Header & Navigation" },
            { id: "footer", label: "Footer & Legal" },
            { id: "cta", label: "Shared Call To Action" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSubTab(pill.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                subTab === pill.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:text-foreground border border-border/50"
              }`}
            >
              {pill.label}
            </button>
          ))}
      </div>

      <div className="mt-8 space-y-8">
        {/* ========================================================================= */}
        {/* 1. HOME PAGE MANAGEMENT                                                   */}
        {/* ========================================================================= */}
        {activeTab === "home" && (
          <>
            {/* HERO & VIDEO BANNER */}
            {(subTab === "all" || subTab === "hero") && (
              <div className="card-lux p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-primary" /> Home Hero & Background Video Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Badge Text</label>
                    <input
                      type="text"
                      value={cms.hero.badgeText}
                      onChange={(e) => updateHero({ badgeText: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Hero Title</label>
                    <input
                      type="text"
                      value={cms.hero.title}
                      onChange={(e) => updateHero({ title: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground">Hero Subtitle</label>
                    <textarea
                      rows={2}
                      value={cms.hero.subtitle}
                      onChange={(e) => updateHero({ subtitle: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Primary CTA Button Text</label>
                    <input
                      type="text"
                      value={cms.hero.primaryCtaText}
                      onChange={(e) => updateHero({ primaryCtaText: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Primary CTA Target Link</label>
                    <input
                      type="text"
                      value={cms.hero.primaryCtaHref}
                      onChange={(e) => updateHero({ primaryCtaHref: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Secondary CTA Button Text</label>
                    <input
                      type="text"
                      value={cms.hero.secondaryCtaText}
                      onChange={(e) => updateHero({ secondaryCtaText: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Secondary CTA Target Link</label>
                    <input
                      type="text"
                      value={cms.hero.secondaryCtaHref}
                      onChange={(e) => updateHero({ secondaryCtaHref: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2 pt-4 border-t border-border">
                    <label className="block text-xs font-medium text-muted-foreground">
                      Hero Video URL (YouTube Embed/Watch Link or direct MP4 URL)
                    </label>
                    <input
                      type="text"
                      value={cms.hero.videoUrl}
                      onChange={(e) => updateHero({ videoUrl: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Enter a YouTube link (e.g. https://www.youtube.com/watch?v=lgYbOKV5zI4) or direct .mp4 video URL.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">
                      Video Opacity ({cms.hero.videoOpacity ?? 85}%)
                    </label>
                    <input
                      type="range"
                      min={30}
                      max={100}
                      value={cms.hero.videoOpacity ?? 85}
                      onChange={(e) => updateHero({ videoOpacity: Number(e.target.value) })}
                      className="mt-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">
                      Video Blur ({cms.hero.videoBlur ?? 0}px)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={cms.hero.videoBlur ?? 0}
                      onChange={(e) => updateHero({ videoBlur: Number(e.target.value) })}
                      className="mt-2 w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SERVICES PREVIEW GRID OVERVIEW */}
            {(subTab === "all" || subTab === "servicesPreview") && (
              <div className="card-lux p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" /> Core Services Preview (Home Page Grid)
                  </h2>
                  <button
                    onClick={() => handleTabChange("services")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    Manage Full Services Catalog ({cms.services.length}) →
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  The Home page renders the top 4 services from your main Services Catalog as a quick-access preview grid.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {cms.services.slice(0, 4).map((s) => (
                    <div key={s.slug} className="rounded-xl border border-border/80 bg-card p-3.5 text-xs space-y-1">
                      <div className="flex items-center gap-2 font-bold text-foreground">
                        <Icon name={s.icon} className="h-4 w-4 text-primary" />
                        <span className="truncate">{s.title}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{s.blurb}</p>
                      <span className="inline-block rounded bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
                        {s.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WHY CHOOSE US */}
            {(subTab === "all" || subTab === "whyus") && (
              <div className="card-lux p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" /> Why Choose Us Section
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Eyebrow</label>
                    <input
                      type="text"
                      value={cms.whyUsSection.eyebrow}
                      onChange={(e) => updateWhyUsSection({ eyebrow: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Title</label>
                    <input
                      type="text"
                      value={cms.whyUsSection.title}
                      onChange={(e) => updateWhyUsSection({ title: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Description</label>
                    <input
                      type="text"
                      value={cms.whyUsSection.desc || ""}
                      onChange={(e) => updateWhyUsSection({ desc: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Why Us Feature Cards ({cms.whyUs.length})</h3>
                    <button
                      onClick={() =>
                        updateWhyUs([
                          ...cms.whyUs,
                          { icon: "ShieldCheck", title: "New Feature", desc: "Feature description goes here." },
                        ])
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Reason
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cms.whyUs.map((w, idx) => (
                      <div key={idx} className="rounded-xl border border-border p-4 space-y-3 bg-card/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">Reason #{idx + 1}</span>
                          <button
                            onClick={() => updateWhyUs(cms.whyUs.filter((_, i) => i !== idx))}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground">Title</label>
                          <input
                            type="text"
                            value={w.title}
                            onChange={(e) => {
                              const next = [...cms.whyUs];
                              next[idx] = { ...next[idx]!, title: e.target.value };
                              updateWhyUs(next);
                            }}
                            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground">Description</label>
                          <textarea
                            rows={2}
                            value={w.desc}
                            onChange={(e) => {
                              const next = [...cms.whyUs];
                              next[idx] = { ...next[idx]!, desc: e.target.value };
                              updateWhyUs(next);
                            }}
                            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground">Icon Name</label>
                          <input
                            type="text"
                            value={w.icon}
                            onChange={(e) => {
                              const next = [...cms.whyUs];
                              next[idx] = { ...next[idx]!, icon: e.target.value };
                              updateWhyUs(next);
                            }}
                            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PROCESS STEPS */}
            {(subTab === "all" || subTab === "process") && (
              <div className="card-lux p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" /> Process & Journey Steps
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Eyebrow</label>
                    <input
                      type="text"
                      value={cms.processSection.eyebrow}
                      onChange={(e) => updateProcessSection({ eyebrow: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Title</label>
                    <input
                      type="text"
                      value={cms.processSection.title}
                      onChange={(e) => updateProcessSection({ title: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Description</label>
                    <input
                      type="text"
                      value={cms.processSection.desc || ""}
                      onChange={(e) => updateProcessSection({ desc: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Process Steps ({cms.process.length})</h3>
                    <button
                      onClick={() =>
                        updateProcess([
                          ...cms.process,
                          {
                            step: String(cms.process.length + 1).padStart(2, "0"),
                            title: "New Process Step",
                            desc: "Step description goes here.",
                          },
                        ])
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Step
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cms.process.map((p, idx) => (
                      <div key={idx} className="rounded-xl border border-border p-4 space-y-3 bg-card/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary">Step {p.step}</span>
                          <button
                            onClick={() => updateProcess(cms.process.filter((_, i) => i !== idx))}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground">Title</label>
                          <input
                            type="text"
                            value={p.title}
                            onChange={(e) => {
                              const next = [...cms.process];
                              next[idx] = { ...next[idx]!, title: e.target.value };
                              updateProcess(next);
                            }}
                            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground">Description</label>
                          <textarea
                            rows={3}
                            value={p.desc}
                            onChange={(e) => {
                              const next = [...cms.process];
                              next[idx] = { ...next[idx]!, desc: e.target.value };
                              updateProcess(next);
                            }}
                            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* IMPACT STATS STRIP */}
            {(subTab === "all" || subTab === "stats") && (
              <div className="card-lux p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" /> Impact Numbers & Statistics Strip
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Stats Counter Cards ({cms.stats.length})</h3>
                    <button
                      onClick={() => updateStats([...cms.stats, { value: 100, suffix: "+", label: "Cities Covered" }])}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Stat
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {cms.stats.map((st, idx) => (
                      <div key={idx} className="rounded-xl border border-border p-4 space-y-2.5 bg-card/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary">Stat #{idx + 1}</span>
                          <button
                            onClick={() => updateStats(cms.stats.filter((_, i) => i !== idx))}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-muted-foreground">Number Value</label>
                          <input
                            type="text"
                            value={st.value}
                            onChange={(e) => {
                              const next = [...cms.stats];
                              const numVal = isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value);
                              next[idx] = { ...next[idx]!, value: numVal as any };
                              updateStats(next);
                            }}
                            className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-bold text-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-muted-foreground">Suffix (e.g. +, %)</label>
                          <input
                            type="text"
                            value={st.suffix || ""}
                            onChange={(e) => {
                              const next = [...cms.stats];
                              next[idx] = { ...next[idx]!, suffix: e.target.value };
                              updateStats(next);
                            }}
                            className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-muted-foreground">Label</label>
                          <input
                            type="text"
                            value={st.label}
                            onChange={(e) => {
                              const next = [...cms.stats];
                              next[idx] = { ...next[idx]!, label: e.target.value };
                              updateStats(next);
                            }}
                            className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TESTIMONIALS */}
            {(subTab === "all" || subTab === "testimonials") && (
              <div className="card-lux p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquareQuote className="h-5 w-5 text-primary" /> Testimonials Section
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Eyebrow</label>
                    <input
                      type="text"
                      value={cms.testimonialsSection.eyebrow}
                      onChange={(e) => updateTestimonialsSection({ eyebrow: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Title</label>
                    <input
                      type="text"
                      value={cms.testimonialsSection.title}
                      onChange={(e) => updateTestimonialsSection({ title: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Testimonial Reviews ({cms.testimonials.length})</h3>
                    <button
                      onClick={() =>
                        updateTestimonials([
                          ...cms.testimonials,
                          {
                            name: "Client Name",
                            role: "NRI Client",
                            country: "United States",
                            flag: "🇺🇸",
                            rating: 5,
                            quote: "NRI360 provided exceptional support for our family.",
                          },
                        ])
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Testimonial
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cms.testimonials.map((t, idx) => (
                      <div key={idx} className="rounded-xl border border-border p-4 space-y-3 bg-card/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">Review #{idx + 1}</span>
                          <button
                            onClick={() => updateTestimonials(cms.testimonials.filter((_, i) => i !== idx))}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground">Quote</label>
                          <textarea
                            rows={3}
                            value={t.quote}
                            onChange={(e) => {
                              const next = [...cms.testimonials];
                              next[idx] = { ...next[idx]!, quote: e.target.value };
                              updateTestimonials(next);
                            }}
                            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-medium text-muted-foreground">Client Name</label>
                            <input
                              type="text"
                              value={t.name}
                              onChange={(e) => {
                                const next = [...cms.testimonials];
                                next[idx] = { ...next[idx]!, name: e.target.value };
                                updateTestimonials(next);
                              }}
                              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-muted-foreground">Role / Title</label>
                            <input
                              type="text"
                              value={t.role}
                              onChange={(e) => {
                                const next = [...cms.testimonials];
                                next[idx] = { ...next[idx]!, role: e.target.value };
                                updateTestimonials(next);
                              }}
                              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-muted-foreground">Country</label>
                            <input
                              type="text"
                              value={t.country}
                              onChange={(e) => {
                                const next = [...cms.testimonials];
                                next[idx] = { ...next[idx]!, country: e.target.value };
                                updateTestimonials(next);
                              }}
                              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-muted-foreground">Flag Emoji</label>
                            <input
                              type="text"
                              value={t.flag}
                              onChange={(e) => {
                                const next = [...cms.testimonials];
                                next[idx] = { ...next[idx]!, flag: e.target.value };
                                updateTestimonials(next);
                              }}
                              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* GLOBAL COVERAGE & MAP */}
            {(subTab === "all" || subTab === "map") && (
              <div className="card-lux p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Globe2 className="h-5 w-5 text-primary" /> Global Operations Map & Hotspots
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Eyebrow</label>
                    <input
                      type="text"
                      value={cms.mapSection.eyebrow}
                      onChange={(e) => updateMapSection({ eyebrow: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Title</label>
                    <input
                      type="text"
                      value={cms.mapSection.title}
                      onChange={(e) => updateMapSection({ title: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Description</label>
                    <input
                      type="text"
                      value={cms.mapSection.desc || ""}
                      onChange={(e) => updateMapSection({ desc: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Hotspot Locations ({cms.hotspots.length})</h3>
                    <button
                      onClick={() =>
                        updateHotspots([
                          ...cms.hotspots,
                          {
                            id: `city-${Date.now()}`,
                            name: "New City, India",
                            code: "in",
                            flag: "🇮🇳",
                            x: 64.5,
                            y: 54.2,
                            nriCount: "100+ Families",
                            timezone: "IST (UTC +5:30)",
                            timeOffset: 5.5,
                            popularServices: ["Senior Care"],
                          },
                        ])
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Location
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {cms.hotspots.map((hs, idx) => (
                      <div key={idx} className="rounded-xl border border-border p-3 space-y-2 bg-card/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">
                            {hs.flag} {hs.name}
                          </span>
                          <button
                            onClick={() => updateHotspots(cms.hotspots.filter((_, i) => i !== idx))}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-muted-foreground">Location Name</label>
                            <input
                              type="text"
                              value={hs.name}
                              onChange={(e) => {
                                const next = [...cms.hotspots];
                                next[idx] = { ...next[idx]!, name: e.target.value };
                                updateHotspots(next);
                              }}
                              className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-muted-foreground">NRI Count Badge</label>
                            <input
                              type="text"
                              value={hs.nriCount}
                              onChange={(e) => {
                                const next = [...cms.hotspots];
                                next[idx] = { ...next[idx]!, nriCount: e.target.value };
                                updateHotspots(next);
                              }}
                              className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* HOME FAQS */}
            {(subTab === "all" || subTab === "faqs") && (
              <div className="card-lux p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" /> Frequently Asked Questions (Home FAQs)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Eyebrow</label>
                    <input
                      type="text"
                      value={cms.faqSection.eyebrow}
                      onChange={(e) => updateFaqSection({ eyebrow: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Title</label>
                    <input
                      type="text"
                      value={cms.faqSection.title}
                      onChange={(e) => updateFaqSection({ title: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">FAQ Items ({cms.faqs.length})</h3>
                    <button
                      onClick={() =>
                        updateFaqs([...cms.faqs, { q: "New Question?", a: "Answer text goes here." }])
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add FAQ
                    </button>
                  </div>
                  <div className="space-y-3">
                    {cms.faqs.map((faq, idx) => (
                      <div key={idx} className="rounded-xl border border-border p-4 space-y-3 bg-card/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary">FAQ #{idx + 1}</span>
                          <button
                            onClick={() => updateFaqs(cms.faqs.filter((_, i) => i !== idx))}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground">Question</label>
                          <input
                            type="text"
                            value={faq.q}
                            onChange={(e) => {
                              const next = [...cms.faqs];
                              next[idx] = { ...next[idx]!, q: e.target.value };
                              updateFaqs(next);
                            }}
                            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-muted-foreground">Answer</label>
                          <textarea
                            rows={3}
                            value={faq.a}
                            onChange={(e) => {
                              const next = [...cms.faqs];
                              next[idx] = { ...next[idx]!, a: e.target.value };
                              updateFaqs(next);
                            }}
                            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* HOME CTA */}
            {(subTab === "all" || subTab === "cta") && (
              <div className="card-lux p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Home Call To Action (CTA Banner)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground">Title</label>
                    <input
                      type="text"
                      value={cms.ctaBand.title}
                      onChange={(e) => updateCtaBand({ title: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground">Description</label>
                    <textarea
                      rows={2}
                      value={cms.ctaBand.desc}
                      onChange={(e) => updateCtaBand({ desc: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Primary Button Text</label>
                    <input
                      type="text"
                      value={cms.ctaBand.primaryCtaText}
                      onChange={(e) => updateCtaBand({ primaryCtaText: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Primary Button Link</label>
                    <input
                      type="text"
                      value={cms.ctaBand.primaryCtaHref}
                      onChange={(e) => updateCtaBand({ primaryCtaHref: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* 2. SERVICES PAGE MANAGEMENT                                               */}
        {/* ========================================================================= */}
        {activeTab === "services" && (
          <>
            {/* SERVICES PAGE HEADER */}
            {(subTab === "all" || subTab === "header") && (
              <div className="card-lux p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" /> Services Page Hero Header
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Eyebrow Badge</label>
                    <input
                      type="text"
                      value={cms.servicesSection.eyebrow}
                      onChange={(e) => updateServicesSection({ eyebrow: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Title</label>
                    <input
                      type="text"
                      value={cms.servicesSection.title}
                      onChange={(e) => updateServicesSection({ title: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Description</label>
                    <input
                      type="text"
                      value={cms.servicesSection.desc || ""}
                      onChange={(e) => updateServicesSection({ desc: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <ImagePicker
                      label="Services Page Hero/Banner Background Image"
                      value={cms.servicesSection.headerImageUrl || ""}
                      onChange={(url) => updateServicesSection({ headerImageUrl: url })}
                      previewClass="h-28 rounded-xl object-cover w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FULL SERVICES CATALOG MANAGER */}
            {(subTab === "all" || subTab === "catalog") && (
              <div className="card-lux p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" /> Full Services Catalog Manager ({cms.services.length})
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add, edit, search, or delete services rendered across the live website.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingService({
                        title: "",
                        slug: "",
                        category: serviceCategories[0] || "Family & Care",
                        icon: "ShieldCheck",
                        blurb: "",
                        benefits: [],
                        documents: [],
                        timeline: "1–3 days",
                      });
                      setIsNewService(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl gradient-royal px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-soft transition-all hover:scale-105"
                  >
                    <Plus className="h-4 w-4" /> Add New Service
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Category:</span>
                    {["All", ...serviceCategories].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                          selectedCategory === cat
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search services…"
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-xs"
                    />
                  </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredServices.map((service) => (
                    <div
                      key={service.slug}
                      className="rounded-xl border border-border bg-card p-4 space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                            <Icon name={service.icon} className="h-3.5 w-3.5" />
                            {service.category}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">/{service.slug}</span>
                        </div>
                        <h3 className="text-base font-bold text-foreground">{service.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{service.blurb}</p>
                      </div>

                      <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3 text-primary" /> {service.timeline}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingService({ ...service });
                              setIsNewService(false);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-accent"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-primary" /> Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete service "${service.title}"?`)) {
                                deleteService(service.slug);
                                toast.success("Service deleted.");
                              }
                            }}
                            className="rounded-lg border border-destructive/30 bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </>
        )}

        {/* ========================================================================= */}
        {/* 3. ABOUT PAGE MANAGEMENT                                                  */}
        {/* ========================================================================= */}
        {activeTab === "about" && (
          <>
            {/* ABOUT HERO HEADER */}
            {(subTab === "all" || subTab === "hero") && (
              <div className="card-lux p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> About Page Hero Header
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Badge Text</label>
                    <input
                      type="text"
                      value={cms.about.badgeText}
                      onChange={(e) => updateAbout({ badgeText: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Title</label>
                    <input
                      type="text"
                      value={cms.about.title}
                      onChange={(e) => updateAbout({ title: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground">Subtitle</label>
                    <textarea
                      rows={2}
                      value={cms.about.subtitle}
                      onChange={(e) => updateAbout({ subtitle: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ImagePicker
                      label="Header Background Image URL"
                      value={cms.about.headerImageUrl || ""}
                      onChange={(url) => updateAbout({ headerImageUrl: url })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STORY & VISION/MISSION */}
            {(subTab === "all" || subTab === "story") && (
              <div className="card-lux p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Who We Are (Story & Vision / Mission)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Story Section Title</label>
                    <input
                      type="text"
                      value={cms.about.storyTitle}
                      onChange={(e) => updateAbout({ storyTitle: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Established Year (Badge)</label>
                    <input
                      type="text"
                      value={cms.about.storyYear}
                      onChange={(e) => updateAbout({ storyYear: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground">
                      Story Paragraphs (One paragraph per line)
                    </label>
                    <textarea
                      rows={4}
                      value={(cms.about.storyParagraphs || []).join("\n")}
                      onChange={(e) => updateAbout({ storyParagraphs: e.target.value.split("\n") })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ImagePicker
                      label="Story Section Photo URL"
                      value={cms.about.storyImageUrl || ""}
                      onChange={(url) => updateAbout({ storyImageUrl: url })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Vision Title</label>
                    <input
                      type="text"
                      value={cms.about.visionTitle}
                      onChange={(e) => updateAbout({ visionTitle: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <label className="block text-xs font-medium text-muted-foreground mt-2">Vision Description</label>
                    <textarea
                      rows={2}
                      value={cms.about.visionDesc}
                      onChange={(e) => updateAbout({ visionDesc: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Mission Title</label>
                    <input
                      type="text"
                      value={cms.about.missionTitle}
                      onChange={(e) => updateAbout({ missionTitle: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <label className="block text-xs font-medium text-muted-foreground mt-2">Mission Description</label>
                    <textarea
                      rows={2}
                      value={cms.about.missionDesc}
                      onChange={(e) => updateAbout({ missionDesc: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CORE VALUES */}
            {(subTab === "all" || subTab === "values") && (
              <div className="card-lux p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" /> Core Values ({(cms.about.coreValues || []).length})
                  </h2>
                  <button
                    onClick={() =>
                      updateAbout({
                        coreValues: [...(cms.about.coreValues || []), { title: "New Value", desc: "Description here." }],
                      })
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Core Value
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(cms.about.coreValues || []).map((v, idx) => (
                    <div key={idx} className="rounded-xl border border-border p-4 bg-card/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">Value #{idx + 1}</span>
                        <button
                          onClick={() =>
                            updateAbout({
                              coreValues: (cms.about.coreValues || []).filter((_, i) => i !== idx),
                            })
                          }
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground">Title</label>
                        <input
                          type="text"
                          value={v.title}
                          onChange={(e) => {
                            const next = [...(cms.about.coreValues || [])];
                            next[idx] = { ...next[idx]!, title: e.target.value };
                            updateAbout({ coreValues: next });
                          }}
                          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground">Description</label>
                        <textarea
                          rows={2}
                          value={v.desc}
                          onChange={(e) => {
                            const next = [...(cms.about.coreValues || [])];
                            next[idx] = { ...next[idx]!, desc: e.target.value };
                            updateAbout({ coreValues: next });
                          }}
                          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TEAM MEMBERS */}
            {(subTab === "all" || subTab === "team") && (
              <div className="card-lux p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" /> Professional Team ({(cms.about.team || []).length})
                  </h2>
                  <button
                    onClick={() =>
                      updateAbout({
                        team: [...(cms.about.team || []), { name: "Team Member", role: "Specialist", imageUrl: "" }],
                      })
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Team Member
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {(cms.about.team || []).map((t, idx) => (
                    <div key={idx} className="rounded-xl border border-border p-4 bg-card/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Member #{idx + 1}</span>
                        <button
                          onClick={() =>
                            updateAbout({
                              team: (cms.about.team || []).filter((_, i) => i !== idx),
                            })
                          }
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground">Name</label>
                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) => {
                            const next = [...(cms.about.team || [])];
                            next[idx] = { ...next[idx]!, name: e.target.value };
                            updateAbout({ team: next });
                          }}
                          className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground">Role</label>
                        <input
                          type="text"
                          value={t.role}
                          onChange={(e) => {
                            const next = [...(cms.about.team || [])];
                            next[idx] = { ...next[idx]!, role: e.target.value };
                            updateAbout({ team: next });
                          }}
                          className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1 text-xs"
                        />
                      </div>
                      <ImagePicker
                        label="Photo URL"
                        value={t.imageUrl}
                        onChange={(url) => {
                          const next = [...(cms.about.team || [])];
                          next[idx] = { ...next[idx]!, imageUrl: url };
                          updateAbout({ team: next });
                        }}
                        previewClass="h-20 w-full rounded-lg object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MILESTONES */}
            {(subTab === "all" || subTab === "milestones") && (
              <div className="card-lux p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" /> Story Milestones ({(cms.about.milestones || []).length})
                  </h2>
                  <button
                    onClick={() =>
                      updateAbout({
                        milestones: [
                          ...(cms.about.milestones || []),
                          { year: "2024", title: "New Milestone", desc: "Milestone detail." },
                        ],
                      })
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Milestone
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(cms.about.milestones || []).map((m, idx) => (
                    <div key={idx} className="rounded-xl border border-border p-4 bg-card/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">{m.year}</span>
                        <button
                          onClick={() =>
                            updateAbout({
                              milestones: (cms.about.milestones || []).filter((_, i) => i !== idx),
                            })
                          }
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground">Year</label>
                        <input
                          type="text"
                          value={m.year}
                          onChange={(e) => {
                            const next = [...(cms.about.milestones || [])];
                            next[idx] = { ...next[idx]!, year: e.target.value };
                            updateAbout({ milestones: next });
                          }}
                          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1 text-xs font-bold text-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground">Title</label>
                        <input
                          type="text"
                          value={m.title}
                          onChange={(e) => {
                            const next = [...(cms.about.milestones || [])];
                            next[idx] = { ...next[idx]!, title: e.target.value };
                            updateAbout({ milestones: next });
                          }}
                          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground">Description</label>
                        <textarea
                          rows={2}
                          value={m.desc}
                          onChange={(e) => {
                            const next = [...(cms.about.milestones || [])];
                            next[idx] = { ...next[idx]!, desc: e.target.value };
                            updateAbout({ milestones: next });
                          }}
                          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ACHIEVEMENTS */}
            {(subTab === "all" || subTab === "achievements") && (
              <div className="card-lux p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" /> Achievements & Proof ({(cms.about.achievements || []).length})
                  </h2>
                  <button
                    onClick={() =>
                      updateAbout({
                        achievements: [
                          ...(cms.about.achievements || []),
                          { title: "New Achievement", desc: "Proof detail." },
                        ],
                      })
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Achievement
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(cms.about.achievements || []).map((a, idx) => (
                    <div key={idx} className="rounded-xl border border-border p-4 bg-card/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">Proof #{idx + 1}</span>
                        <button
                          onClick={() =>
                            updateAbout({
                              achievements: (cms.about.achievements || []).filter((_, i) => i !== idx),
                            })
                          }
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground">Title</label>
                        <input
                          type="text"
                          value={a.title}
                          onChange={(e) => {
                            const next = [...(cms.about.achievements || [])];
                            next[idx] = { ...next[idx]!, title: e.target.value };
                            updateAbout({ achievements: next });
                          }}
                          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground">Description</label>
                        <textarea
                          rows={2}
                          value={a.desc}
                          onChange={(e) => {
                            const next = [...(cms.about.achievements || [])];
                            next[idx] = { ...next[idx]!, desc: e.target.value };
                            updateAbout({ achievements: next });
                          }}
                          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PHOTO GALLERY */}
            {(subTab === "all" || subTab === "gallery") && (
              <div className="card-lux p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" /> Photo Gallery ({(cms.about.gallery || []).length} photos)
                  </h2>
                  <button
                    onClick={() => updateAbout({ gallery: [...(cms.about.gallery || []), ""] })}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Photo
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(cms.about.gallery || []).map((url, idx) => (
                    <div key={idx} className="rounded-xl border border-border p-4 bg-card/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">Photo #{idx + 1}</span>
                        <button
                          onClick={() => updateAbout({ gallery: (cms.about.gallery || []).filter((_, i) => i !== idx) })}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <ImagePicker
                        label="Image URL"
                        value={url}
                        onChange={(newUrl) => {
                          const next = [...(cms.about.gallery || [])];
                          next[idx] = newUrl;
                          updateAbout({ gallery: next });
                        }}
                        previewClass="h-28 rounded-lg object-cover w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* 4. CONTACT PAGE MANAGEMENT                                                */}
        {/* ========================================================================= */}
        {activeTab === "contact" && (
          <>
            {/* CONTACT FORM SUBMISSIONS MANAGER */}
            {(subTab === "all" || subTab === "submissions") && (
              <div className="card-lux p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Inbox className="h-5 w-5 text-primary" /> Contact Form Submissions
                      {(cms.submissions || []).filter((s) => s.status === "New").length > 0 && (
                        <span className="rounded-full bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 text-xs font-bold">
                          {(cms.submissions || []).filter((s) => s.status === "New").length} New
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      View, review details, update status, and manage enquiries received from the public Contact form.
                    </p>
                  </div>
                </div>

                {(cms.submissions || []).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-12 text-center">
                    <Inbox className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
                    <p className="mt-3 text-sm font-semibold">No submissions received yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submissions sent via the public website Contact form will automatically appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 border-b border-border font-semibold uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3">User / Location</th>
                          <th className="px-4 py-3">Email & Contact</th>
                          <th className="px-4 py-3">Service / Method</th>
                          <th className="px-4 py-3">Submitted At</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {(cms.submissions || []).map((sub) => (
                          <tr
                            key={sub.id}
                            className={`transition-colors hover:bg-muted/30 ${
                              sub.status === "New" ? "bg-primary/5 font-medium" : ""
                            }`}
                          >
                            <td className="px-4 py-3">
                              <p className="font-bold text-foreground">{sub.name}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {sub.country} {sub.city ? `· ${sub.city}` : ""}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-primary">{sub.email}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {sub.phone || sub.whatsapp || "No phone provided"}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold">{sub.service || "General Inquiry"}</p>
                              <p className="text-[11px] text-muted-foreground">via {sub.method || "Form"}</p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                              {sub.submittedAt}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() =>
                                  updateSubmissionStatus(sub.id, sub.status === "New" ? "Read" : "New")
                                }
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border transition-all ${
                                  sub.status === "New"
                                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                }`}
                              >
                                {sub.status === "New" ? "New" : "Read"}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setSelectedSubmission(sub);
                                  if (sub.status === "New") {
                                    updateSubmissionStatus(sub.id, "Read");
                                  }
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-muted hover:text-primary transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" /> View
                              </button>
                              <button
                                onClick={() => setDeletingSubmissionId(sub.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* CONTACT PAGE HERO HEADER */}
            {(subTab === "all" || subTab === "hero") && (
              <div className="card-lux p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Contact Page Hero/Banner Header
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Badge Text</label>
                    <input
                      type="text"
                      value={cms.contactHero?.badgeText || "CONTACT"}
                      onChange={(e) => updateContactHero({ badgeText: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground">Title</label>
                    <input
                      type="text"
                      value={cms.contactHero?.title || ""}
                      onChange={(e) => updateContactHero({ title: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-muted-foreground">Subtitle / Description</label>
                    <textarea
                      rows={2}
                      value={cms.contactHero?.subtitle || ""}
                      onChange={(e) => updateContactHero({ subtitle: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <ImagePicker
                      label="Contact Page Hero/Banner Background Image"
                      value={cms.contactHero?.headerImageUrl || ""}
                      onChange={(url) => updateContactHero({ headerImageUrl: url })}
                      previewClass="h-28 rounded-xl object-cover w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CONTACT MAP / LOCATION */}
            {(subTab === "all" || subTab === "map") && (
              <div className="card-lux p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Contact Map / Location
                </h2>
                <p className="text-xs text-muted-foreground">
                  Configure the primary office location card displayed on the public Contact page.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Location Name</label>
                    <input
                      type="text"
                      value={cms.contact.locationName || "Rajahmundry"}
                      onChange={(e) => updateContact({ locationName: e.target.value })}
                      placeholder="e.g. Rajahmundry"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Location / Address</label>
                    <input
                      type="text"
                      value={cms.contact.address || "Happy Street, Rajahmundry"}
                      onChange={(e) => updateContact({ address: e.target.value })}
                      placeholder="e.g. Happy Street, Rajahmundry"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground">
                      Google Maps / Search URL
                    </label>
                    <input
                      type="text"
                      value={cms.contact.mapUrl || ""}
                      onChange={(e) => {
                        const newUrl = e.target.value;
                        updateContact({ mapUrl: newUrl });
                        if (newUrl && !isValidGoogleMapsUrl(newUrl)) {
                          toast.warning("Invalid Google Maps URL format", {
                            description: "URL should start with http:// or https:// and belong to a Google domain.",
                          });
                        }
                      }}
                      placeholder="https://www.google.com/search?q=happy+street+rajahmundry..."
                      className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm font-mono ${
                        cms.contact.mapUrl && !isValidGoogleMapsUrl(cms.contact.mapUrl)
                          ? "border-amber-500 bg-amber-500/5 focus:border-amber-500"
                          : "border-border bg-background"
                      }`}
                    />
                    {cms.contact.mapUrl && !isValidGoogleMapsUrl(cms.contact.mapUrl) ? (
                      <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                        ⚠️ URL does not match standard Google Maps/Search domain (e.g. https://www.google.com/maps/... or https://www.google.com/search?q=...)
                      </p>
                    ) : (
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        Users clicking the map card on the Contact page will be redirected to this Google Maps destination in a new tab.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CONTACT DETAILS & DIRECT CHANNELS */}
            {(subTab === "all" || subTab === "channels" || subTab === "hours") && (
              <div className="card-lux p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <PhoneCall className="h-5 w-5 text-primary" /> Contact Page Details & Direct Channels
                </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">Phone Number (Display)</label>
                <input
                  type="text"
                  value={cms.contact.phone}
                  onChange={(e) => updateContact({ phone: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground">Phone Number (International Dialing)</label>
                <input
                  type="text"
                  value={cms.contact.phoneIntl}
                  onChange={(e) => updateContact({ phoneIntl: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground">Email Address</label>
                <input
                  type="text"
                  value={cms.contact.email}
                  onChange={(e) => updateContact({ email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground">Instagram Handle</label>
                <input
                  type="text"
                  value={cms.contact.instagram}
                  onChange={(e) => updateContact({ instagram: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground">Instagram URL</label>
                <input
                  type="text"
                  value={cms.contact.instagramUrl}
                  onChange={(e) => updateContact({ instagramUrl: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground">Office Hours Text</label>
                <input
                  type="text"
                  value={cms.contact.hours}
                  onChange={(e) => updateContact({ hours: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </>
    )}

        {/* ========================================================================= */}
        {/* 5. GLOBAL SETTINGS MANAGEMENT                                             */}
        {/* ========================================================================= */}
        {activeTab === "global" && (
          <>
            {/* SECURITY & CHANGE ADMIN PASSWORD */}
            {(subTab === "all" || subTab === "security") && (
              <div className="card-lux p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-primary" /> Security & Change Admin Password
                </h2>
                <p className="text-xs text-muted-foreground">
                  Update the password required to access the Admin Panel. Password updates persist across sessions.
                </p>
                <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="Enter current password"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Enter new password"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Re-enter new password"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
                    />
                  </div>
                  <div className="md:col-span-3 pt-2">
                    <button
                      type="submit"
                      disabled={changingPass}
                      className="gradient-royal inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-lift disabled:opacity-50"
                    >
                      <Lock className="h-3.5 w-3.5" /> {changingPass ? "Updating Password…" : "Change Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* HEADER & NAVIGATION */}
            {(subTab === "all" || subTab === "header") && (
              <div className="card-lux p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" /> Global Header & Navigation Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Brand Name</label>
                    <input
                      type="text"
                      value={cms.header.brandName}
                      onChange={(e) => updateHeader({ brandName: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Brand Tagline</label>
                    <input
                      type="text"
                      value={cms.header.brandTagline}
                      onChange={(e) => updateHeader({ brandTagline: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">CTA Button Text</label>
                    <input
                      type="text"
                      value={cms.header.ctaButtonText}
                      onChange={(e) => updateHeader({ ctaButtonText: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">CTA Button Target Link</label>
                    <input
                      type="text"
                      value={cms.header.ctaButtonHref}
                      onChange={(e) => updateHeader({ ctaButtonHref: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold mb-3">Navigation Menu Links</h3>
                  <div className="space-y-3">
                    {cms.header.navLinks.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => {
                            const newLinks = [...cms.header.navLinks];
                            newLinks[idx] = { ...newLinks[idx]!, label: e.target.value };
                            updateHeader({ navLinks: newLinks });
                          }}
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold"
                          placeholder="Link Label"
                        />
                        <input
                          type="text"
                          value={link.to}
                          onChange={(e) => {
                            const newLinks = [...cms.header.navLinks];
                            newLinks[idx] = { ...newLinks[idx]!, to: e.target.value };
                            updateHeader({ navLinks: newLinks });
                          }}
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-mono"
                          placeholder="Target URL / Path"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* FOOTER & LEGAL */}
            {(subTab === "all" || subTab === "footer") && (
              <div className="card-lux p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Global Footer & Legal Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Footer Tagline</label>
                    <input
                      type="text"
                      value={cms.footer.brandTagline}
                      onChange={(e) => updateFooter({ brandTagline: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Quick Links Column Title</label>
                    <input
                      type="text"
                      value={cms.footer.quickLinksTitle}
                      onChange={(e) => updateFooter({ quickLinksTitle: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground">Footer About Description</label>
                    <textarea
                      rows={2}
                      value={cms.footer.description}
                      onChange={(e) => updateFooter({ description: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Service Links Column Title</label>
                    <input
                      type="text"
                      value={cms.footer.serviceLinksTitle}
                      onChange={(e) => updateFooter({ serviceLinksTitle: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Contact Column Title</label>
                    <input
                      type="text"
                      value={cms.footer.contactTitle}
                      onChange={(e) => updateFooter({ contactTitle: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground">Copyright Notice Text</label>
                    <input
                      type="text"
                      value={cms.footer.copyrightText}
                      onChange={(e) => updateFooter({ copyrightText: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SHARED CTA BANNER */}
            {(subTab === "all" || subTab === "cta") && (
              <div className="card-lux p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Shared Call To Action (CTA Banner)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground">Title</label>
                    <input
                      type="text"
                      value={cms.ctaBand.title}
                      onChange={(e) => updateCtaBand({ title: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground">Description</label>
                    <textarea
                      rows={2}
                      value={cms.ctaBand.desc}
                      onChange={(e) => updateCtaBand({ desc: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Primary Button Text</label>
                    <input
                      type="text"
                      value={cms.ctaBand.primaryCtaText}
                      onChange={(e) => updateCtaBand({ primaryCtaText: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Primary Button Link</label>
                    <input
                      type="text"
                      value={cms.ctaBand.primaryCtaHref}
                      onChange={(e) => updateCtaBand({ primaryCtaHref: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SERVICE EDITING / ADDING MODAL DIALOG                                     */}
      {/* ========================================================================= */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="card-lux w-full max-w-2xl p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl font-bold">
                {isNewService ? "Add New Service" : `Edit Service: ${editingService.title}`}
              </h2>
              <button
                onClick={() => setEditingService(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">Service Title</label>
                <input
                  type="text"
                  value={editingService.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = isNewService
                      ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
                      : editingService.slug;
                    setEditingService({ ...editingService, title, slug });
                  }}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">URL Slug</label>
                <input
                  type="text"
                  value={editingService.slug}
                  onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">Category</label>
                <select
                  value={editingService.category}
                  onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {["Family & Care", "Property", "Legal & Documentation", "Finance", "Travel", "Concierge", "Custom"].map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">Lucide Icon Name</label>
                <input
                  type="text"
                  value={editingService.icon}
                  onChange={(e) => setEditingService({ ...editingService, icon: e.target.value })}
                  placeholder="e.g. Heart, Home, Scale, ShieldCheck"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <ImagePicker
                  label="Service Poster Image (Photos/Banners for this specific service)"
                  value={editingService.imageUrl || ""}
                  onChange={(url) => setEditingService({ ...editingService, imageUrl: url })}
                  previewClass="h-28 rounded-xl object-cover w-full"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground">Service Summary Blurb</label>
                <textarea
                  rows={3}
                  value={editingService.blurb}
                  onChange={(e) => setEditingService({ ...editingService, blurb: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">Estimated Timeline</label>
                <input
                  type="text"
                  value={editingService.timeline}
                  onChange={(e) => setEditingService({ ...editingService, timeline: e.target.value })}
                  placeholder="e.g. 1–3 business days"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground">
                  Key Benefits (One benefit per line)
                </label>
                <textarea
                  rows={3}
                  value={editingService.benefits.join("\n")}
                  onChange={(e) =>
                    setEditingService({ ...editingService, benefits: e.target.value.split("\n") })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground">
                  Required Documents (One document per line)
                </label>
                <textarea
                  rows={3}
                  value={editingService.documents.join("\n")}
                  onChange={(e) =>
                    setEditingService({ ...editingService, documents: e.target.value.split("\n") })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingService.title || !editingService.slug) {
                    toast.error("Please enter both title and slug.");
                    return;
                  }
                  if (isNewService) {
                    addService(editingService);
                    toast.success(`Added service "${editingService.title}"`);
                  } else {
                    const next = cms.services.map((s) => (s.slug === editingService.slug ? editingService : s));
                    updateServices(next);
                    toast.success(`Updated service "${editingService.title}"`);
                  }
                  setEditingService(null);
                }}
                className="rounded-xl gradient-royal px-5 py-2 text-xs font-semibold text-primary-foreground shadow-soft"
              >
                <Save className="h-4 w-4 inline mr-1" /> Save Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSION DETAIL MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="card-lux w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Contact Submission Detail</span>
                <h3 className="text-xl font-bold mt-0.5">{selectedSubmission.name}</h3>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-border p-3 bg-muted/30">
                <span className="block font-medium text-muted-foreground">Full Name</span>
                <span className="block text-sm font-bold mt-0.5">{selectedSubmission.name}</span>
              </div>
              <div className="rounded-xl border border-border p-3 bg-muted/30">
                <span className="block font-medium text-muted-foreground">Email Address</span>
                <span className="block text-sm font-bold text-primary mt-0.5">{selectedSubmission.email}</span>
              </div>
              <div className="rounded-xl border border-border p-3 bg-muted/30">
                <span className="block font-medium text-muted-foreground">Location</span>
                <span className="block text-sm font-semibold mt-0.5">
                  {selectedSubmission.country} {selectedSubmission.city ? `(${selectedSubmission.city})` : ""}
                </span>
              </div>
              <div className="rounded-xl border border-border p-3 bg-muted/30">
                <span className="block font-medium text-muted-foreground">Phone / WhatsApp</span>
                <span className="block text-sm font-semibold mt-0.5">
                  {selectedSubmission.phone || selectedSubmission.whatsapp || "N/A"}
                </span>
              </div>
              <div className="rounded-xl border border-border p-3 bg-muted/30">
                <span className="block font-medium text-muted-foreground">Service Required</span>
                <span className="block text-sm font-semibold text-foreground mt-0.5">
                  {selectedSubmission.service || "General Consultation"}
                </span>
              </div>
              <div className="rounded-xl border border-border p-3 bg-muted/30">
                <span className="block font-medium text-muted-foreground">Preferred Contact Method</span>
                <span className="block text-sm font-semibold mt-0.5">{selectedSubmission.method || "Form"}</span>
              </div>
              <div className="rounded-xl border border-border p-3 bg-muted/30">
                <span className="block font-medium text-muted-foreground">Preferred Date & Time</span>
                <span className="block text-sm font-semibold mt-0.5">
                  {selectedSubmission.date || "Any date"} {selectedSubmission.time ? `at ${selectedSubmission.time}` : ""}
                </span>
              </div>
              <div className="rounded-xl border border-border p-3 bg-muted/30">
                <span className="block font-medium text-muted-foreground">Submitted At</span>
                <span className="block text-sm font-semibold mt-0.5">{selectedSubmission.submittedAt}</span>
              </div>
              {selectedSubmission.fileName && (
                <div className="sm:col-span-2 rounded-xl border border-border p-3 bg-muted/30">
                  <span className="block font-medium text-muted-foreground">Attached Document</span>
                  <span className="block text-sm font-semibold text-primary mt-0.5">
                    📎 {selectedSubmission.fileName}
                  </span>
                </div>
              )}
              <div className="sm:col-span-2 rounded-xl border border-border p-4 bg-card">
                <span className="block font-medium text-muted-foreground mb-1">Message Content</span>
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {selectedSubmission.message || "No detailed message provided."}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="rounded-xl border border-border px-5 py-2 text-xs font-semibold hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingSubmissionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="card-lux w-full max-w-md p-6 space-y-5">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-foreground">Confirm Submission Deletion</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this submission? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingSubmissionId(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteSubmission(deletingSubmissionId);
                  setDeletingSubmissionId(null);
                  toast.success("Submission deleted successfully.");
                }}
                className="rounded-xl bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, Delete Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
