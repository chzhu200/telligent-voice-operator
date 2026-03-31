import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Telligent — Voice AI Operator",
  description: "Control any system by speaking. No technical knowledge required.",
  openGraph: {
    title: "Telligent — Voice AI Operator",
    description: "Anyone can control any system by speaking. PMs, founders, business owners — zero technical knowledge required.",
    type: "website",
    url: "https://telligent-voice-operator.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Telligent — Voice AI Operator",
    description: "Anyone can control any system by speaking. Zero technical knowledge required.",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  manifest: "/manifest.json",
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
