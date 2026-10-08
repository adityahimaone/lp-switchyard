import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Switchyard | control plane for coding agents",
  description: "Queue tasks, dispatch to the machine that owns your code, and review every diff before it lands.",
  icons: { icon: "/brand/switchyard-favicon-blue-180.png", apple: "/brand/switchyard-favicon-blue-180.png" },
  openGraph: {
    title: "Switchyard | control plane for coding agents",
    description: "Queue tasks, dispatch to the machine that owns your code, and review every diff before it lands.",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Switchyard | control plane for coding agents",
    description: "Queue tasks, dispatch to the machine that owns your code, and review every diff before it lands.",
  },
};

export const viewport: Viewport = { colorScheme: "light dark" };

const themeScript = `(() => { try { const value = localStorage.getItem('switchyard-theme') || 'system'; const dark = value === 'dark' || (value === 'system' && matchMedia('(prefers-color-scheme: dark)').matches); document.documentElement.dataset.theme = dark ? 'dark' : 'light'; document.documentElement.dataset.themeMode = value; } catch { document.documentElement.dataset.theme = 'light'; } })()`;
const sourceCode = {
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  name: "Switchyard",
  description: "Control plane for coding agents",
  codeRepository: "https://github.com/adityahimaone/switchyard",
  programmingLanguage: ["Go", "TypeScript"],
  runtimePlatform: "Web",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sourceCode) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
