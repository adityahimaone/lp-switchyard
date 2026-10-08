import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

// Set NEXT_PUBLIC_SITE_URL to the domain that actually serves the site. Every
// canonical URL and og:image resolves against this, so a wrong value is worse
// than none at all.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://switchyardbase.space";
const TITLE = "Switchyard | control plane for coding agents";
const DESCRIPTION = "Queue tasks, dispatch them to the machine that owns your code, and hold every diff in review until you approve it. Claude, Codex, DSH or Hermes run on the host that has the source; the VPS only schedules.";
const KEYWORDS = [
  "switchyard", "control plane for coding agents", "AI coding agent orchestration",
  "human in the loop code review", "kanban for AI agents", "Claude Code", "Codex CLI",
  "DSH CLI", "Hermes", "gRPC task dispatch", "self-hosted agent queue", "Go SQLite kanban",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s | Switchyard" },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: "Switchyard",
  category: "developer tools",
  authors: [{ name: "adityahimaone", url: "https://github.com/adityahimaone" }],
  creator: "adityahimaone",
  publisher: "adityahimaone",
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/brand/switchyard-favicon-blue-32.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/brand/switchyard-favicon-blue-180.png", type: "image/png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Switchyard",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Switchyard — a gate in front of your coding agents" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/opengraph-image.png"],
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f4fd" },
    { media: "(prefers-color-scheme: dark)", color: "#101319" },
  ],
};

const themeScript = `(() => { try { const value = localStorage.getItem('switchyard-theme') || 'system'; const dark = value === 'dark' || (value === 'system' && matchMedia('(prefers-color-scheme: dark)').matches); document.documentElement.dataset.theme = dark ? 'dark' : 'light'; document.documentElement.dataset.themeMode = value; } catch { document.documentElement.dataset.theme = 'light'; } })()`;

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;
const SOFTWARE_ID = `${SITE_URL}/#software`;

const FAQS: [string, string][] = [
  ["Can an agent commit or push without me?", "No. Agents mutate the working tree only. Commit and push happen through the review gate."],
  ["Why not run agents on the VPS?", "The code lives on your Mac or Windows machine. Node-agent runs the executor where the source is."],
  ["What happens if a task fails?", "It retries up to 3 times, then becomes blocked."],
  ["Why is my task stuck in review?", "That is expected. Open the diff, then pick Commit or Commit & Push."],
  ["Do I have to upgrade workers immediately?", "No. Old nodes keep their previous capabilities while you roll out the VPS changes first."],
  ["What if a worker is missing an executor?", "The dispatch is rejected with executor unavailable. Re-register the node after installing that executor."],
];

// A single @graph lets each node point at the others by @id, which is how the
// organization, the site and the product get connected instead of looking like
// three unrelated documents.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "Switchyard",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/switchyard-favicon-blue-180.png`, width: 180, height: 180 },
      sameAs: ["https://github.com/adityahimaone/switchyard", "https://github.com/adityahimaone/node-agent"],
    },
    {
      "@type": "WebSite",
      "@id": SITE_ID,
      url: SITE_URL,
      name: "Switchyard",
      description: DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": ORG_ID },
    },
    {
      "@type": "SoftwareApplication",
      "@id": SOFTWARE_ID,
      name: "Switchyard",
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "AI coding agent control plane",
      operatingSystem: "Linux, macOS, Windows",
      description: DESCRIPTION,
      url: SITE_URL,
      publisher: { "@id": ORG_ID },
      isPartOf: { "@id": SITE_ID },
      codeRepository: "https://github.com/adityahimaone/switchyard",
      programmingLanguage: ["Go", "TypeScript"],
      featureList: [
        "Kanban boards with SQLite per board",
        "A single dispatcher claims each task exactly once",
        "Executors run on the host that owns the source",
        "Review gate holds every result until a human approves the diff",
        "gRPC preferred with HTTP long-poll fallback",
        "Executors: hermes, codex, claude, commandcode, dsh, shell",
      ],
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
    },
    {
      "@type": "TechArticle",
      "@id": `${SITE_URL}/#architecture`,
      headline: "Two planes, one queue: how Switchyard splits control and execution",
      description: "The VPS runs the control plane. Node-agent runs the execution plane on every host that owns source code. Remote workspaces are never used as cwd by local VPS processes.",
      url: `${SITE_URL}/#architecture`,
      inLanguage: "en",
      about: { "@id": SOFTWARE_ID },
      isPartOf: { "@id": SITE_ID },
      author: { "@id": ORG_ID },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      isPartOf: { "@id": SITE_ID },
      mainEntity: FAQS.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
