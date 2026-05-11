import { ForgotPasswordForm } from "@/components/trackapp/forgot-password-form";

export default function ForgotPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-10 px-4 py-20">
      <div>
        <h1 className="text-2xl font-semibold text-white">Mot de passe oublié</h1>
        <p className="mt-2 text-[14px] text-white/48">
          Nous envoyons via Supabase un lien sécurisé (selon projet). En dev rudimentaire, confirmez la config SMTP /
          redirection.
        </p>
      </div>
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8">
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
