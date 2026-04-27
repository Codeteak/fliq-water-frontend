import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AppHeader } from "@/components/common/app-header";
import { AppFooter } from "@/components/common/app-footer";
import { FabCartButton } from "@/components/common/fab-cart-button";
import { AppProviders } from "@/components/providers/app-providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const bantayog = localFont({
  src: "../../public/font/bentayog/Bantayog-Regular.otf",
  variable: "--font-bantayog",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WaterFlow Frontend",
    template: "%s | WaterFlow",
  },
  description:
    "Book 20L cans, bottles, and subscriptions with smart delivery slots.",
  icons: {
    icon: [{ url: "/icon.png" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${geist.variable} ${bantayog.variable} h-full antialiased`}
    >
      <body
        className="bg-background text-foreground min-h-full overflow-x-hidden font-sans"
        suppressHydrationWarning
      >
        <AppProviders>
          <AppHeader />
          <main className="min-h-[calc(100vh-8rem)] overflow-x-hidden pb-20 pt-16 md:pb-0">
            {children}
          </main>
          <FabCartButton />
          <AppFooter />
        </AppProviders>
      </body>
    </html>
  );
}
