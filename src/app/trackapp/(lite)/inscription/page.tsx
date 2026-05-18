import { TaInscriptionFlow } from "@/components/trackapp/auth/trackapp-inscription-flow";
import { TrackappDevSaasBypassButton } from "@/components/trackapp/trackapp-dev-saas-bypass";

export default function InscriptionPage() {
  return (
    <div className="ta-font min-h-dvh bg-neutral-950 antialiased">
      <TaInscriptionFlow />
      <footer className="ta-auth-page-footer flex justify-center">
        <TrackappDevSaasBypassButton />
      </footer>
    </div>
  );
}
