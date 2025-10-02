"use client";

import React, { useEffect, useMemo, useState } from "react";

type SplashScreenProps = {
  children: React.ReactNode;
};

export default function SplashScreen({ children }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  // Respect reduced motion preferences
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }, []);

  useEffect(() => {
    let fadeTimeout: ReturnType<typeof setTimeout> | undefined;
    let hardTimeout: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      if (prefersReducedMotion) {
        setIsVisible(false);
      } else {
        setIsFading(true);
        fadeTimeout = setTimeout(() => setIsVisible(false), 300);
      }
    };

    const onWindowLoad = () => finish();

    // If the page is already loaded, finish immediately; otherwise wait for load
    if (typeof document !== "undefined" && document.readyState === "complete") {
      finish();
    } else if (typeof window !== "undefined") {
      window.addEventListener("load", onWindowLoad, { once: true });
    }

    // Hard fallback in case load never fires (e.g., SPA nav)
    hardTimeout = setTimeout(finish, 2000);

    // Prevent background scroll while splash is visible
    if (typeof document !== "undefined") {
      // Store original values
      const body = document.body;
      const originalOverflow = body.style.overflow;
      const originalOverflowY = body.style.overflowY;
      
      // Disable scroll
      body.style.overflow = "hidden";
      body.style.overflowY = "hidden";
      
      // Store cleanup function
      const cleanup = () => {
        body.style.overflow = originalOverflow;
        body.style.overflowY = originalOverflowY;
      };
      
      // Return cleanup function
      return () => {
        if (typeof window !== "undefined") {
          window.removeEventListener("load", onWindowLoad);
        }
        if (fadeTimeout) clearTimeout(fadeTimeout);
        if (hardTimeout) clearTimeout(hardTimeout);
        cleanup();
      };
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("load", onWindowLoad);
      }
      if (fadeTimeout) clearTimeout(fadeTimeout);
      if (hardTimeout) clearTimeout(hardTimeout);
    };
  }, [prefersReducedMotion]);

  return (
    <>
      {children}
      {isVisible && (
        <div
          aria-hidden
          className={[
            "fixed inset-0 z-[9998]",
            "flex items-center justify-center",
            "bg-background",
            "pointer-events-auto",
            prefersReducedMotion ? "" : isFading ? "opacity-0 transition-opacity duration-300" : "opacity-100",
          ].join(" ")}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center px-6">
            {/* Background pattern using design system colors */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(var(--primary)),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--primary)),transparent_50%)]" />
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center space-y-8 text-center">
              {/* Logo */}
              <div className="relative">
                <div className="w-20 h-20 rounded-xl shadow-lg border border-border flex items-center justify-center">
                  <img
                    src="/SplashScreen.png"
                    alt="Budgo Logo"
                    className="w-full h-full object-contain"
                    decoding="async"
                  />
                </div>
                {/* Pulse animation for logo using design system colors */}
                {!prefersReducedMotion && (
                  <div className="absolute inset-0 rounded-xl bg-primary animate-ping opacity-20" />
                )}
              </div>

              {/* App name and tagline */}
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-foreground">
                  Budgo
                </h1>
                <p className="text-lg text-muted-foreground max-w-md">
                  Quản lý nhóm và chuyến đi một cách thông minh
                </p>
              </div>

              {/* Loading indicator */}
              <div className="flex flex-col items-center space-y-4">
                <div className="flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={[
                        "w-2 h-2 rounded-full bg-primary",
                        !prefersReducedMotion ? "animate-bounce" : "",
                      ].join(" ")}
                      style={{
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: "1s",
                      }}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Đang tải ứng dụng...
                </p>
              </div>
            </div>

            {/* Bottom status indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                <span>Đã sẵn sàng</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


