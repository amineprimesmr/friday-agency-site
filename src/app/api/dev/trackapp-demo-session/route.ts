import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

const DEMO_EMAIL_DEFAULT = "dev-local@trackapp.invalid";

/** Profil minimal pour accéder au SaaS en local (session démo). */
const DEMO_ONBOARDING = {
  app_name: "App démo locale",
  accent_color: "#7c3aed",
  audience: "Utilisateurs iOS français",
  business_model: "freemium",
  tone: "coach",
  app_experience: "debutant",
  horizon: "",
};

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Non disponible en production." }, { status: 403 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const admin = createAdminClient();

  if (!url || !anon || !admin) {
    return NextResponse.json(
      { error: "Supabase non configuré (URL, clé anon ou service role)." },
      { status: 503 },
    );
  }

  const demoEmail = (process.env.TRACKAPP_DEV_DEMO_EMAIL ?? DEMO_EMAIL_DEFAULT).trim().toLowerCase();

  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: demoEmail,
    options: {
      redirectTo: `${new URL(req.url).origin}/trackapp/accueil`,
    },
  });

  if (linkErr || !linkData?.properties?.hashed_token) {
    return NextResponse.json(
      { error: linkErr?.message ?? "Impossible de générer le lien démo." },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();

  const response = NextResponse.json({ ok: true });

  const sb = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const primary = await sb.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "magiclink",
  });

  const resolved =
    !primary.error && primary.data.user ?
      primary
    : await sb.auth.verifyOtp({
        token_hash: linkData.properties.hashed_token,
        type: "email",
      });

  if (resolved.error || !resolved.data.user) {
    return NextResponse.json(
      {
        error:
          resolved.error?.message
          ?? primary.error?.message
          ?? "Échec de la session démo (verifyOtp).",
      },
      { status: 500 },
    );
  }

  await admin.from("trackapp_profiles").upsert(
    {
      id: resolved.data.user.id,
      onboarding: DEMO_ONBOARDING,
      onboarding_completed_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  return response;
}
