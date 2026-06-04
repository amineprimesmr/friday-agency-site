/** Retour haptique + son type notification (débloqué après 1ère interaction utilisateur). */

let audioCtx: AudioContext | null = null;
let unlocked = false;

function prefersReducedFeedback(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function playTriToneChime(ctx: AudioContext, volume = 0.14) {
  const t0 = ctx.currentTime;
  const notes = [
    { freq: 880, at: 0, dur: 0.22 },
    { freq: 1318.5, at: 0.09, dur: 0.2 },
  ];

  for (const { freq, at, dur } of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t0 + at);
    gain.gain.setValueAtTime(0.0001, t0 + at);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0 + at);
    osc.stop(t0 + at + dur + 0.02);
  }
}

/** À appeler une fois après un geste utilisateur (autoplay navigateur). */
export function unlockSaleNotificationFeedback(): void {
  if (unlocked || typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    audioCtx = new Ctx();
    void audioCtx.resume();
    unlocked = true;
  } catch {
    /* ignore */
  }
}

export function playSaleNotificationFeedback(options?: { touch?: boolean }): void {
  if (typeof window === "undefined" || document.hidden) return;
  if (prefersReducedFeedback()) return;

  if ("vibrate" in navigator && options?.touch !== false) {
    try {
      navigator.vibrate([10, 35, 12]);
    } catch {
      /* ignore */
    }
  }

  if (!audioCtx || !unlocked) return;

  void audioCtx.resume().then(() => {
    if (!audioCtx) return;
    playTriToneChime(audioCtx, options?.touch ? 0.16 : 0.11);
  }).catch(() => undefined);
}
