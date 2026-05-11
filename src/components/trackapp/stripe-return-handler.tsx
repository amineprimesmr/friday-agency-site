"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function Inner() {
  const sp = useSearchParams();
  const sessionId = sp?.get("session_id");
  const [status, setStatus] = useState<"idle" | "checking" | "done" | "error">(
    sessionId ? "checking" : "idle",
  );

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      const res = await fetch("/api/trackapp/verify-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      const okJson = await res.json().catch(() => ({}));

      const url = typeof window !== "undefined" ? new URL(window.location.href) : null;
      if (url) {
        url.searchParams.delete("session_id");
        window.history.replaceState({}, "", `${url.pathname}${url.search}`);
      }

      setStatus(res.ok ? "done" : "error");

      const message = (okJson as { detail?: string })?.detail;
      if (message && typeof window !== "undefined" && console) {
        if (!res.ok) console.warn(message);
      }
    })().catch(() => {
      setStatus("error");
    });
  }, [sessionId]);

  if (!sessionId) return null;

  const copy =
    status === "checking" ?
      "Vérification paiement Stripe…"
    : status === "done" ?
      "Paiement traité · accès complet activé après webhook éventuelle."
    : status === "error" ?
      "Impossible de vérifier automatiquement. Si tu es payeur, attends la confirmation ou vérifie le webhook."
    : null;

  if (!copy) return null;

  return (
    <div className="mb-10 rounded-2xl border border-violet-500/36 bg-violet-500/[0.12] px-5 py-3 text-[13px] text-white/92">
      {copy}
      {status !== "checking" ?
        <>
          {" "}
          <button type="button" className="text-violet-200 underline" onClick={() => window.location.reload()}>
            Recharger
          </button>
        </>
      : null}
    </div>
  );
}

export function StripeReturnHandler() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
