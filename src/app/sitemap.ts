import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://switchyardbase.space";

export const dynamic = "force-static";

// A single-page site, so the sitemap lists the one canonical URL. Section
// anchors are deliberately excluded: fragments are the same document and
// listing them would just ask Google to crawl the page six more times.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date("2026-10-08"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
