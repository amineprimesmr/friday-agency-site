import { ConnexionForm } from "@/components/trackapp/connexion-form";

function safeNext(raw: string | string[] | undefined): string {
  const v = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : null;
  if (!v || v.length === 0) return "/trackapp/espace";
  try {
    const path = decodeURIComponent(v.startsWith("/") ? v : `/${v}`).split("#")[0];
    if (path.startsWith("/trackapp/")) return path;
    return "/trackapp/espace";
  } catch {
    return "/trackapp/espace";
  }
}

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const qs = await searchParams;
  const nextHref = safeNext(qs.next);

  return (
    <main className="mx-auto grid max-w-6xl gap-14 px-4 py-14 lg:grid-cols-[1fr,min(460px)] lg:gap-24 lg:py-22">
      <div className="space-y-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-300/85">Connexion Trackapp</p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-white lg:text-[2.75rem]">
          Ton espace playbook iOS avec prompts prêts à coller.
        </h1>
        <p className="max-w-lg text-[15px] leading-relaxed text-white/52">
          Même ambiance sombre inspirée Trendtrack mais en violet fluo. Après paiement Stripe, tous les prompts se débloquent.
        </p>
      </div>
      <div className="rounded-[1.85rem] border border-white/[0.08] bg-white/[0.03] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] lg:p-10">
        <ConnexionForm nextHref={nextHref} />
      </div>
    </main>
  );
}
