// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Helvetia Financial Services",
    template: "%s — Helvetia Financial Services",
  },
  description: "Secure client area for Helvetia Financial Services.",
  applicationName: "Helvetia Financial Services",
  themeColor: "#0A2342",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
