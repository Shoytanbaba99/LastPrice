import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "./_components/ThemeProvider";
import { Navbar } from "./_components/Navbar";

export const metadata: Metadata = {
  title: "LastPrice | Silent Auction Marketplace",
  description:
    "A curated silent auction marketplace. Minimal. Silent. Precise.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans surface-primary text-ui-primary pt-16">
        <TRPCReactProvider>
          <ThemeProvider>
            <div className="noise-bg" />
            <div className="cinematic-overlay" />
            <Navbar />
            <div className="flex-1 flex flex-col">{children}</div>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
