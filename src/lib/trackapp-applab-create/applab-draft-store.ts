import type { SupabaseClient } from "@supabase/supabase-js";

import type { ApplabPromptVersion } from "@/lib/trackapp-applab-create/mvp-prompt-types";
import type { ApplabCreateDraft } from "@/lib/trackapp-applab-create/types";

const MAX_SERVER_VERSIONS = 20;

export async function loadApplabDraftFromServer(
  sb: SupabaseClient,
  userId: string,
): Promise<ApplabCreateDraft | null> {
  const { data, error } = await sb
    .from("trackapp_applab_drafts")
    .select("draft, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.draft || typeof data.draft !== "object") return null;
  return data.draft as ApplabCreateDraft;
}

export async function saveApplabDraftToServer(
  sb: SupabaseClient,
  userId: string,
  draft: ApplabCreateDraft,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await sb.from("trackapp_applab_drafts").upsert(
    {
      user_id: userId,
      draft,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function loadApplabPromptVersionsFromServer(
  sb: SupabaseClient,
  userId: string,
  limit = MAX_SERVER_VERSIONS,
): Promise<readonly ApplabPromptVersion[]> {
  const { data, error } = await sb
    .from("trackapp_applab_prompt_versions")
    .select(
      "id, version_number, stack, files, blueprint, quality, full_prompt, generated_at",
    )
    .eq("user_id", userId)
    .order("generated_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: String(row.id),
    version: Number(row.version_number),
    stack: row.stack as ApplabPromptVersion["stack"],
    generatedAt: row.generated_at ?? new Date().toISOString(),
    files: row.files as ApplabPromptVersion["files"],
    fullPrompt: String(row.full_prompt ?? ""),
    blueprint: row.blueprint as ApplabPromptVersion["blueprint"],
    quality: row.quality as ApplabPromptVersion["quality"],
  }));
}

export async function saveApplabPromptVersionToServer(
  sb: SupabaseClient,
  userId: string,
  version: ApplabPromptVersion,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await sb.from("trackapp_applab_prompt_versions").insert({
    id: version.id,
    user_id: userId,
    version_number: version.version,
    stack: version.stack,
    files: version.files,
    blueprint: version.blueprint,
    quality: version.quality,
    full_prompt: version.fullPrompt,
    generated_at: version.generatedAt,
  });

  if (error) return { ok: false, error: error.message };

  const { data: excess } = await sb
    .from("trackapp_applab_prompt_versions")
    .select("id")
    .eq("user_id", userId)
    .order("generated_at", { ascending: false })
    .range(MAX_SERVER_VERSIONS, MAX_SERVER_VERSIONS + 50);

  if (excess && excess.length > 0) {
    await sb
      .from("trackapp_applab_prompt_versions")
      .delete()
      .in(
        "id",
        excess.map((r) => r.id),
      );
  }

  return { ok: true };
}
