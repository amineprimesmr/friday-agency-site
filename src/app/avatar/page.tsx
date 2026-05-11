import { AvatarStudio } from "@/components/avatar/avatar-studio";

export const metadata = {
  title: "Avatar Studio — Friday",
  description: "Génère un avatar IA ultra-réaliste et anime-le en vidéo.",
};

export default function AvatarPage() {
  return (
    <main className="min-h-dvh bg-[#080808]">
      <AvatarStudio />
    </main>
  );
}
