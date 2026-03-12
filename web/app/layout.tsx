import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Telligent — Voice AI Operator",
  description: "Control any system by speaking. No technical knowledge required.",
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
