import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ConvexClientProvider } from "@/providers/convex-client-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tentagen.se"),
  title: "TentaGen — Smartare tentafrågor för utbildningsorganisationer",
  description: "AI-driven tentafråge-generator som skapar högkvalitativa examensfrågor för utbildningsorganisationer. Stöder WISEflow, QTI, Word och fler format.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/logo.svg", color: "#0d9488" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "TentaGen — Smartare tentafrågor för utbildningsorganisationer",
    description: "Generera högkvalitativa tentafrågor med AI. Stöder WISEflow, QTI, Word och fler format.",
    url: "https://www.tentagen.se",
    siteName: "TentaGen",
    locale: "sv_SE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TentaGen — Smartare tentafrågor för utbildningsorganisationer",
    description: "Generera högkvalitativa tentafrågor med AI. Stöder WISEflow, QTI, Word och fler format.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClientProvider>
          {children}
          <Toaster />
        </ConvexClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
