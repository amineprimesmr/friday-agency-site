import { TaActivationFlow } from "@/components/trackapp/auth/trackapp-activation-flow";

export const metadata = {
  title: "Activation — Trackapp",
  description: "Finalisez votre compte Trackapp après paiement.",
};

export default function TrackappActivationPage() {
  return (
    <div className="ta-font min-h-dvh bg-neutral-950 antialiased">
      <TaActivationFlow />
    </div>
  );
}
