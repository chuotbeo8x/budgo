import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { ProfileProvider } from "@/components/auth/ProfileProvider";
import NotificationProvider from "@/components/NotificationProvider";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import WelcomeNotification from "@/components/WelcomeNotification";
import PWAProvider from "@/components/PWAProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QA Tracker - Quản lý chuyến đi thông minh",
  description: "Ứng dụng quản lý chuyến đi, nhóm và chi phí một cách thông minh",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "QA Tracker",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "QA Tracker",
    title: "QA Tracker - Quản lý chuyến đi thông minh",
    description: "Ứng dụng quản lý chuyến đi, nhóm và chi phí một cách thông minh",
  },
  twitter: {
    card: "summary",
    title: "QA Tracker - Quản lý chuyến đi thông minh",
    description: "Ứng dụng quản lý chuyến đi, nhóm và chi phí một cách thông minh",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <html lang="vi">
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
            <meta name="theme-color" content="#2563eb" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="QA Tracker" />
            <meta name="format-detection" content="telephone=no" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="msapplication-config" content="/browserconfig.xml" />
            <meta name="msapplication-TileColor" content="#2563eb" />
            <meta name="msapplication-tap-highlight" content="no" />
            <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
            <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
            <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
            <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
            <link rel="manifest" href="/manifest.json" />
            <link rel="mask-icon" href="/icons/icon-192x192.png" color="#2563eb" />
            <link rel="shortcut icon" href="/favicon.ico" />
          </head>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased pb-mobile-nav`}
            suppressHydrationWarning={true}
          >
                    <AuthProvider>
                      <ProfileProvider>
                        <NotificationProvider>
                          <PWAProvider />
                          <WelcomeNotification />
                          <Header />
                          <MaintenanceGuard>
                            {children}
                          </MaintenanceGuard>
                          <Footer />
                          <MobileBottomNav />
                              <Toaster position="top-right" />
                        </NotificationProvider>
                      </ProfileProvider>
                    </AuthProvider>
          </body>
        </html>
  );
}
