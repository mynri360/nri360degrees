import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

declare global {
  interface Window {
    __pwaDeferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

// Immediately capture the native beforeinstallprompt event at window evaluation
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    window.__pwaDeferredPrompt = e as BeforeInstallPromptEvent;
  });
}

interface PWAContextType {
  isInstalled: boolean;
  canInstall: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  triggerInstall: () => Promise<void>;
  deferredPrompt: BeforeInstallPromptEvent | null;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    typeof window !== "undefined" ? window.__pwaDeferredPrompt || null : null
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    const androidDevice = /android/.test(userAgent);
    const desktopDevice = !iosDevice && !androidDevice;

    setIsIOS(iosDevice);
    setIsAndroid(androidDevice);
    setIsDesktop(desktopDevice);

    // Detect standalone mode (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
      }
    };

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleDisplayModeChange);
    }

    // Listener for native beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvt = e as BeforeInstallPromptEvent;
      window.__pwaDeferredPrompt = promptEvt;
      setDeferredPrompt(promptEvt);
    };

    // Listener for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__pwaDeferredPrompt = null;
      toast.success("NRI360 App Installed!", {
        description: "NRI360 has been added to your Home Screen.",
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (window.__pwaDeferredPrompt) {
      setDeferredPrompt(window.__pwaDeferredPrompt);
    }

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("NRI360 Service Worker registered cleanly with scope:", reg.scope);
        })
        .catch((err) => {
          console.error("NRI360 Service Worker registration failed:", err);
        });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleDisplayModeChange);
      }
    };
  }, []);

  const triggerInstall = async () => {
    const activePrompt = deferredPrompt || (typeof window !== "undefined" ? window.__pwaDeferredPrompt : null);

    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const choice = await activePrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setDeferredPrompt(null);
          window.__pwaDeferredPrompt = null;
          toast.success("NRI360 App Installed", {
            description: "NRI360 is added to your Home Screen.",
          });
        }
      } catch (err) {
        console.error("Error triggering native PWA install prompt:", err);
      }
      return;
    }

    // Fallback info toast if browser native event is unavailable (e.g. iOS or manual browser menu install)
    if (isIOS) {
      toast.info("Install NRI360 App", {
        description: "Tap Safari's Share icon, then select 'Add to Home Screen'.",
      });
    } else {
      toast.info("Install NRI360 App", {
        description: "Click the Install icon (⊕ or 📥) in your browser address bar or menu (⋮) to install.",
      });
    }
  };

  const canInstall = !isInstalled;

  return (
    <PWAContext.Provider
      value={{
        isInstalled,
        canInstall,
        isIOS,
        isAndroid,
        isDesktop,
        triggerInstall,
        deferredPrompt: deferredPrompt || (typeof window !== "undefined" ? window.__pwaDeferredPrompt || null : null),
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error("usePWA must be used within a PWAProvider");
  }
  return context;
}




