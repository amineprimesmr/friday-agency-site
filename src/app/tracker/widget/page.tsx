import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import QRCode from "qrcode";

const SHORTCUT_URL =
  "https://www.icloud.com/shortcuts/15ffc694f45844dfabcf7e48198545d7";

export const metadata: Metadata = {
  title: "Raccourci iOS — Trackapp",
  description: "Scanne le QR code avec ton iPhone pour ouvrir le raccourci Trackapp.",
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
    width: 280,
    color: { dark: "#000000", light: "#ffffff" },
  });

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      <div dangerouslySetInnerHTML={{ __html: qrSvg }} aria-label="QR code raccourci iOS" />
    </div>
  );
}
