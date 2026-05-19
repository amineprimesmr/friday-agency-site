import { TaActivationFlow } from "@/components/trackapp/auth/trackapp-activation-flow";

export const metadata = {
  title: "Activation — Trackapp",
  description: "Finalise ton compte Trackapp après paiement.",
};

export default function TrackappActivationPage() {
  return (
    <div className="ta-font min-h-dvh bg-neutral-950 antialiased">
      <TaActivationFlow />
    </div>
  );
}
