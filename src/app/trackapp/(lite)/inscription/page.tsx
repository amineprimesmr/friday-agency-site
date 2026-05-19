import { redirect } from "next/navigation";

/** Nouveaux utilisateurs : le parcours commence par le paiement, puis /trackapp/activation. */
export default function InscriptionPage() {
  redirect("/trackapp/paiement");
}
