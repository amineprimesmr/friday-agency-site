export type SaleDemo = {
  id: string;
  brand: string;
  line: string;
  accent: "" | "notif-accent-a" | "notif-accent-b";
};

export const TRACKER_SALE_DEMO_TEMPLATES: Omit<SaleDemo, "id">[] = [
  { brand: "Nouvelle vente 🎉", line: "Abonnement mensuel : +7,99 € MRR", accent: "" },
  { brand: "Nouvelle vente ✨", line: "Vente à l’unité : 12,99 € encaissée", accent: "notif-accent-a" },
  { brand: "Nouvelle vente 🎉", line: "Renouvellement : 29,99 € / mois confirmé", accent: "notif-accent-b" },
  { brand: "Nouvelle vente ✨", line: "Offre annuelle : +49,99 € (Facture 12 mois)", accent: "notif-accent-a" },
  { brand: "Nouvelle vente 🎉", line: "Achat in-app : module Pro · 9,99 €", accent: "" },
  { brand: "Nouvelle vente ✨", line: "Essai → abonnement : 4,99 € / mois activé", accent: "notif-accent-b" },
  { brand: "Nouvelle vente 🎉", line: "Panier complété : 24,90 € · paiement réussi", accent: "notif-accent-a" },
];

export function nextSaleDemo(index: number, prefix: string): SaleDemo {
  const template = TRACKER_SALE_DEMO_TEMPLATES[index % TRACKER_SALE_DEMO_TEMPLATES.length];
  return { ...template, id: `${prefix}-${index}` };
}

export function seedSaleDemoSlots(count: number): SaleDemo[] {
  return TRACKER_SALE_DEMO_TEMPLATES.slice(0, count)
    .map((sale, i) => ({ ...sale, id: `seed-${i}` }))
    .reverse();
}
