import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "سامانه صدور و اصالت‌سنجی گواهی الکترونیکی",
  description: "سامانه صدور و تأیید اصالت گواهی‌های الکترونیکی",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="font-vazir bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
