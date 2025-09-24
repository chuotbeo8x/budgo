import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProfileProvider } from "@/components/auth/ProfileProvider";
import NotificationProvider from "@/components/NotificationProvider";
import MaintenanceGuard from "@/components/MaintenanceGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Q&A Tracker",
  description: "Quản lý nhóm, chuyến đi và chia sẻ chi phí một cách minh bạch và dễ dàng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <html lang="vi">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            suppressHydrationWarning={true}
          >
            <AuthProvider>
              <ProfileProvider>
                <NotificationProvider>
                  <Header />
                  <MaintenanceGuard>
                    {children}
                  </MaintenanceGuard>
                  <Footer />
                  <Toaster position="top-right" />
                </NotificationProvider>
              </ProfileProvider>
            </AuthProvider>
          </body>
        </html>
  );
}
