import type { Metadata } from "next";
import "./globals.css";

/** Polices chargées en CSS (`globals.css`) pour éviter `next/font` → chaîne PostCSS fragile sur certains setups. */

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Friday — Apps iOS & sites web",
    template: "%s · Friday",
  },
  description:
    "Agence digitale : applications iOS et sites internet livrés avec le même soin que les grandes équipes produit.",
  openGraph: {
    title: "Friday — Apps iOS & sites web",
    description:
      "Agence digitale : applications iOS et sites internet sur mesure.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full bg-black antialiased">{children}</body>
    </html>
  );
}
