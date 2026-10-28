import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: { default: "Reviral — Long videos in. Short clips out.", template: "%s | Reviral" },
  description: "Reviral connects brands with editors who cut long videos into viral short clips. Pay only for views that actually happen.",
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: { type: "website", siteName: "Reviral", title: "Long videos in. Short clips out.", description: "Pay only for views that actually happen." },
  twitter: { card: "summary_large_image", title: "Reviral", description: "Brands share footage. Editors cut clips. Everyone earns from real views." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Reviral",
    url: "https://reviral.app",
    description: "Brands share long videos. Editors cut clips and post. Everyone earns from real views.",
  };
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('reviral-theme')||localStorage.getItem('creatorflow-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      </body>
    </html>
  );
}
