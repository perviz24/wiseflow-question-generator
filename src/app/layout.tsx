import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  openGraph: {
    title: "TentaGen — Smartare tentafrågor för utbildningsorganisationer",
    description: "Generera högkvalitativa tentafrågor med AI. Stöder WISEflow, QTI, Word och fler format.",
    url: "https://www.tentagen.se",
    siteName: "TentaGen",
    locale: "sv_SE",
    type: "website",
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
      </body>
    </html>
  );
}
