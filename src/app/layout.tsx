import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "ProfileForge — Premium Bio Links",
    template: "%s | ProfileForge",
  },
  description:
    "Create stunning, customizable profile pages with music, animations, and analytics. The premium alternative to bio link tools.",
  keywords: ["bio link", "profile page", "link in bio", "custom profile"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans min-h-screen`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
