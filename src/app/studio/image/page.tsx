import type { Metadata } from "next";
import { HiggsfieldImageStudio } from "@/components/studio/higgsfield-image-studio";

export const metadata: Metadata = {
  title: "Image Studio",
  description: "Génération d’images avec références (GPT Image 2)",
};

export default function StudioImagePage() {
  return <HiggsfieldImageStudio />;
}
