import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: { default: "CreatorFlow — Grow campaigns. Reward editors.", template: "%s | CreatorFlow" },
  description: "CreatorFlow connects creators and editors through transparent campaigns, content approvals, and virtual rewards.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "CreatorFlow", title: "Grow campaigns. Reward editors.", description: "Campaigns, approvals, and rewards in one platform." },
  twitter: { card: "summary_large_image", title: "CreatorFlow", description: "The content rewards marketplace for creators and editors." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CreatorFlow",
    url: "https://creatorflow.app",
    description: "Content rewards marketplace for creators and editors.",
  };
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('creatorflow-theme')==='dark'||(!localStorage.getItem('creatorflow-theme')&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      </body>
    </html>
  );
}
