import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
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
