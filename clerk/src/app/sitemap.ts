import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

/** Public pages only. Prospect demos are deliberately excluded. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicEnv.NEXT_PUBLIC_SITE_URL;
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/tools/foia-deadline-calculator`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
