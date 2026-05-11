/** Layout léger sans header/footer tracker — pensé pour iframes. */
export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[100dvh] w-full bg-black font-sans text-white">{children}</div>;
}
