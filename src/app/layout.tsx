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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Budgo",
  description: "Quản lý nhóm, chuyến đi và chia sẻ chi phí một cách minh bạch và dễ dàng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <html lang="vi">
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </head>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased pb-mobile-nav`}
            suppressHydrationWarning={true}
          >
                    <AuthProvider>
                      <ProfileProvider>
                        <NotificationProvider>
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
