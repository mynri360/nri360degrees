import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { safeGetItem, safeSetItem } from "./utils";


interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

declare global {
  interface Window {
    __pwaDeferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

interface PWAContextType {
  isInstalled: boolean;
  canInstall: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  showInstallModal: boolean;
  setShowInstallModal: (show: boolean) => void;
  closeInstallModal: () => void;
  markAsInstalled: () => void;
  triggerInstall: () => Promise<void>;
  deferredPrompt: BeforeInstallPromptEvent | null;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    typeof window !== "undefined" ? window.__pwaDeferredPrompt || null : null
  );
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(
    typeof window !== "undefined" ? window.__pwaDeferredPrompt || null : null
  );

  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect iOS
    const ua = window.navigator.userAgent;
    const iosDevice =
      /iPhone|iPad|iPod/.test(ua) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
    const androidDevice = /android/i.test(ua);
    const desktopDevice = !iosDevice && !androidDevice;

    setIsIOS(iosDevice);
    setIsAndroid(androidDevice);
    setIsDesktop(desktopDevice);

    // Only mark as installed when actually running as a standalone PWA window
    // Clear any stale localStorage flags that may cause false "already installed" state
    const isStandaloneNow =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandaloneNow) {
      setIsInstalled(true);
    } else {
      // Clear stale flag — being in browser tab means the PWA is NOT installed/running standalone
      localStorage.removeItem("pwa_installed");
    }



    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        safeSetItem("pwa_installed", "true");
        setShowInstallModal(false);
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
      deferredPromptRef.current = promptEvt;
      setDeferredPrompt(promptEvt);
    };

    // Listener for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      safeSetItem("pwa_installed", "true");
      setDeferredPrompt(null);
      deferredPromptRef.current = null;
      window.__pwaDeferredPrompt = null;
      setShowInstallModal(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (window.__pwaDeferredPrompt) {
      deferredPromptRef.current = window.__pwaDeferredPrompt;
      setDeferredPrompt(window.__pwaDeferredPrompt);
    }

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
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

  const markAsInstalled = () => {
    // Don't persist to localStorage — isInstalled is derived from actual display-mode:standalone
    setIsInstalled(true);
    setShowInstallModal(false);
    setDeferredPrompt(null);
    deferredPromptRef.current = null;
    if (typeof window !== "undefined") {
      window.__pwaDeferredPrompt = null;
    }
  };

  const closeInstallModal = () => {
    setShowInstallModal(false);
  };

  const triggerInstall = async () => {
    if (isInstalled) return;

    // Directly fire Chrome/Android native "Install app" dialog overlay
    const activePrompt =
      deferredPromptRef.current ||
      deferredPrompt ||
      (typeof window !== "undefined" ? window.__pwaDeferredPrompt : null);

    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const choice = await activePrompt.userChoice;
        if (choice && choice.outcome === "accepted") {
          markAsInstalled();
        }
      } catch (err) {
        console.error("Native PWA prompt invocation error:", err);
      }
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
        showInstallModal,
        setShowInstallModal,
        closeInstallModal,
        markAsInstalled,
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






