/** Annule une requête fetch sans déclencher l’overlay Next « aborted without reason ». */
export function abortInFlightRequest(controller: AbortController): void {
  if (controller.signal.aborted) return;
  controller.abort(new DOMException("Requête annulée", "AbortError"));
}

export function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { name?: string; message?: string };
  if (e.name === "AbortError") return true;
  const msg = String(e.message ?? "").toLowerCase();
  return msg.includes("aborted") || msg.includes("abort");
}
