import "@fontsource-variable/public-sans";
import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { publicEnv } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "Township Clerk Agent by Adbyrd",
    template: "%s | Township Clerk Agent",
  },
  description:
    "A done-for-you assistant for Michigan township clerks: FOIA requests answered on time, board minutes drafted within the Open Meetings Act deadline, and resident calls handled.",
  applicationName: "Township Clerk Agent",
  authors: [{ name: "Adbyrd" }],
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#1A4B7C",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-US">
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-navy-700 focus:shadow"
        >
          Skip to content
        </a>
        {children}
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
