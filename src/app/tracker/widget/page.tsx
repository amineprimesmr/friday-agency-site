import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import QRCode from "qrcode";

const SHORTCUT_URL =
  "https://www.icloud.com/shortcuts/15ffc694f45844dfabcf7e48198545d7";

export const metadata: Metadata = {
  title: "Raccourci iOS — Trackapp",
  description:
    "Ouvre directement le raccourci iOS sur iPhone — sinon affiche un QR à scanner.",
};

function isMobileUserAgent(ua: string | null): boolean {
  if (!ua) return false;
  return /iPhone|iPad|iPod|Android|Mobile/i.test(ua);
}

export default async function WidgetPage() {
  const h = await headers();
  const ua = h.get("user-agent");

  if (isMobileUserAgent(ua)) {
    redirect(SHORTCUT_URL);
  }

  const qrSvg = await QRCode.toString(SHORTCUT_URL, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    width: 360,
    color: { dark: "#000000", light: "#ffffff" },
  });

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-black p-8">
      <div
        className="rounded-2xl bg-white p-5 shadow-2xl"
        aria-label="QR code vers le raccourci iOS"
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />
      <p className="max-w-xs text-center text-sm text-white/70">
        Scanne ce QR code avec ton iPhone pour ouvrir le raccourci
      </p>
    </div>
  );
}
