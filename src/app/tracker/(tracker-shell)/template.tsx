/** Template sans framer-motion : évite le blocage SWC en dev local sur macOS. */
export default function TrackerTemplate({ children }: { children: React.ReactNode }) {
  return <div className="contents">{children}</div>;
}
