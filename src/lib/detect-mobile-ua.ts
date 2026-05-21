/** UA mobile / tactile — utilisé côté serveur pour activer le mode perf dès le premier paint. */
export function isMobileUserAgent(ua: string): boolean {
  return /iPhone|iPad|iPod|Android|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}
