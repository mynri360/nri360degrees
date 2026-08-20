import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePWA } from "@/lib/pwa-context";
import {
  Download,
  Share,
  PlusSquare,
  MoreVertical,
  CheckCircle2,
  Monitor,
  Smartphone,
  Apple,
  ArrowRight,
  ShieldCheck,
  Zap,
  Loader2,
} from "lucide-react";

export function PWAInstallModal() {
  const {
    showInstallModal,
    closeInstallModal,
    markAsInstalled,
    isIOS,
    isAndroid,
    deferredPrompt,
  } = usePWA();

  const [activeTab, setActiveTab] = useState<"desktop" | "ios" | "android">("desktop");
  // null = still trying, true = prompt fired, false = no prompt available
  const [promptState, setPromptState] = useState<"idle" | "waiting" | "ready" | "unavailable">("idle");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const promptFiredRef = useRef(false);

  useEffect(() => {
    if (isIOS) setActiveTab("ios");
    else if (isAndroid) setActiveTab("android");
    else setActiveTab("desktop");
  }, [isIOS, isAndroid]);

  useEffect(() => {
    if (!showInstallModal) {
      setPromptState("idle");
      promptFiredRef.current = false;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    // Try to fire native install prompt immediately
    const tryPrompt = () => {
      if (typeof window === "undefined") return false;
      if (promptFiredRef.current) return false;
      const p = (window as any).__pwaDeferredPrompt;
      if (!p) return false;

      promptFiredRef.current = true;
      setPromptState("ready");

      // Fire it — .prompt() returns void, userChoice is separate promise
      try {
        p.prompt();
        p.userChoice.then((choice: { outcome: string }) => {
          if (choice.outcome === "accepted") {
            markAsInstalled();
            closeInstallModal();
          }
          (window as any).__pwaDeferredPrompt = null;
        }).catch(() => {
          (window as any).__pwaDeferredPrompt = null;
        });
      } catch {
        (window as any).__pwaDeferredPrompt = null;
      }
      return true;
    };

    if (tryPrompt()) return;

    // No prompt yet — poll for up to 8 seconds
    setPromptState("waiting");
    let attempts = 0;
    pollRef.current = setInterval(() => {
      attempts++;
      if (tryPrompt()) {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
        return;
      }
      if (attempts >= 16) {
        // 8 seconds elapsed, give up and show instructions
        setPromptState("unavailable");
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 500);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [showInstallModal]);

  // Handle manual "Install App" button press
  const handleManualInstall = () => {
    if (typeof window === "undefined") return;
    const p = (window as any).__pwaDeferredPrompt;
    if (p && !promptFiredRef.current) {
      promptFiredRef.current = true;
      try {
        p.prompt();
        p.userChoice.then((choice: { outcome: string }) => {
          if (choice.outcome === "accepted") {
            markAsInstalled();
            closeInstallModal();
          }
          (window as any).__pwaDeferredPrompt = null;
        }).catch(() => {});
      } catch {
        (window as any).__pwaDeferredPrompt = null;
      }
    }
  };

  return (
    <Dialog open={showInstallModal} onOpenChange={(open) => !open && closeInstallModal()}>
      <DialogContent className="max-w-md border-0 bg-card p-0 shadow-2xl overflow-hidden sm:rounded-3xl">
        {/* Top Header Card */}
        <div className="relative overflow-hidden gradient-royal px-6 pt-8 pb-6 text-white text-center">
          <div className="blob top-[-50px] right-[-30px] h-40 w-40 bg-white/20" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-white p-1 shadow-lift">
              <img src="/logo.png" alt="NRI360 Logo" className="h-full w-full rounded-xl object-contain" />
              <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white shadow">
                <Zap className="h-3.5 w-3.5" />
              </span>
            </div>
            <DialogTitle className="font-display text-xl font-bold tracking-tight text-white">
              Install NRI360 App
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs leading-relaxed text-white/80">
              Get instant 1-tap access to senior care, property management &amp; legal support.
            </DialogDescription>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">

          {/* Waiting for prompt */}
          {(promptState === "idle" || promptState === "waiting") && (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-bold text-foreground">Opening install dialog…</p>
              <p className="text-xs text-muted-foreground">Please wait while Chrome prepares the install prompt</p>
            </div>
          )}

          {/* Prompt fired or unavailable — show content */}
          {(promptState === "ready" || promptState === "unavailable") && (
            <>
              {/* Big install button — tries to fire prompt, or shows it's being processed */}
              <button
                type="button"
                onClick={handleManualInstall}
                className="gradient-royal flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 px-4 text-base font-bold text-white shadow-2xl transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Download className="h-5 w-5" />
                <span>Install App Now</span>
                <ArrowRight className="h-5 w-5 opacity-80" />
              </button>

              {/* Instructions for when no prompt */}
              {promptState === "unavailable" && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 text-center">
                    Or follow these steps
                  </p>

                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-accent/50 p-1 rounded-xl">
                      <TabsTrigger value="desktop" className="flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg">
                        <Monitor className="h-3.5 w-3.5" />
                        <span>Desktop</span>
                      </TabsTrigger>
                      <TabsTrigger value="ios" className="flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg">
                        <Apple className="h-3.5 w-3.5" />
                        <span>iOS</span>
                      </TabsTrigger>
                      <TabsTrigger value="android" className="flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg">
                        <Smartphone className="h-3.5 w-3.5" />
                        <span>Android</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="desktop" className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-border bg-accent/20 p-4 space-y-3 text-xs">
                        <div className="flex items-start gap-3">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary text-xs">1</span>
                          <div>
                            <p className="font-semibold text-foreground">Address Bar Install Icon</p>
                            <p className="mt-0.5 text-muted-foreground leading-relaxed">
                              Look at the right side of your Chrome / Edge address bar. Click the{" "}
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent font-mono text-[10px] text-foreground border border-border">
                                <Download className="h-3 w-3" /> Install
                              </span>{" "}
                              button.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary text-xs">2</span>
                          <div>
                            <p className="font-semibold text-foreground">Browser Menu Method</p>
                            <p className="mt-0.5 text-muted-foreground leading-relaxed">
                              Click <MoreVertical className="inline h-3.5 w-3.5 text-foreground" /> menu → select{" "}
                              <strong className="text-foreground">"Install NRI360..."</strong>.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="ios" className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-border bg-accent/20 p-4 space-y-3 text-xs">
                        <div className="flex items-start gap-3">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary text-xs">1</span>
                          <div>
                            <p className="font-semibold text-foreground">Tap the Share Button</p>
                            <p className="mt-0.5 text-muted-foreground leading-relaxed">
                              In Safari, tap <Share className="inline h-3.5 w-3.5 text-primary" /> <strong>Share</strong> icon in the bottom menu bar.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary text-xs">2</span>
                          <div>
                            <p className="font-semibold text-foreground">Add to Home Screen</p>
                            <p className="mt-0.5 text-muted-foreground leading-relaxed">
                              Tap <PlusSquare className="inline h-3.5 w-3.5 text-foreground" /> <strong className="text-foreground">Add to Home Screen</strong> then <strong className="text-primary">Add</strong>.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="android" className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-border bg-accent/20 p-4 space-y-3 text-xs">
                        <div className="flex items-start gap-3">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary text-xs">1</span>
                          <div>
                            <p className="font-semibold text-foreground">Open Chrome Menu</p>
                            <p className="mt-0.5 text-muted-foreground leading-relaxed">
                              Tap <MoreVertical className="inline h-3.5 w-3.5 text-foreground" /> menu in top-right corner of Chrome.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary text-xs">2</span>
                          <div>
                            <p className="font-semibold text-foreground">Tap 'Add to Home Screen'</p>
                            <p className="mt-0.5 text-muted-foreground leading-relaxed">
                              Select <strong className="text-foreground">"Add to Home screen"</strong> from the menu.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Benefits */}
              <div className="flex items-center justify-around py-2 px-3 rounded-xl bg-accent/40 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span>Fast 1-Tap Access</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  <span>Offline Support</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => markAsInstalled()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-input bg-background py-2.5 px-3 text-xs font-semibold text-foreground transition-colors hover:bg-accent cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>I've Installed It</span>
                </button>
                <button
                  type="button"
                  onClick={closeInstallModal}
                  className="rounded-xl border border-transparent px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
