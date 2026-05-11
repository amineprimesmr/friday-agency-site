import type { Metadata } from "next";
import "./globals.css";

/** Évite crash au boot si NEXT_PUBLIC_APP_URL est vide ou invalide (new URL(...) throw → 500 opaque). */
function metadataBaseSafe(): URL {
  const fallback = "http://localhost:3000";
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return new URL(fallback);
  try {
    return new URL(/^https?:\/\//i.test(raw) ? raw : `http://${raw}`);
  } catch {
    console.warn("[layout] NEXT_PUBLIC_APP_URL invalide →", fallback);
    return new URL(fallback);
  }
}

export const metadata: Metadata = {
  metadataBase: metadataBaseSafe(),
  title: {
    default: "Friday — App Store Tracker",
    template: "%s · Friday",
  },
  description:
    "Suivez les classements App Store en temps réel : Top Charts, nouveautés, mouvements de rangs par pays et catégorie.",
  openGraph: {
    title: "Friday — App Store Tracker",
    description:
      "Classements iOS en temps réel, top charts, nouveautés et explorer d'apps.",
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
    <html lang="fr" className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-black antialiased">{children}</body>
    </html>
  );
}
