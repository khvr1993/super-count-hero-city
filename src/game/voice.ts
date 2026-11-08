let enabled = true;
let chosen: SpeechSynthesisVoice | null = null;
let interruptTimer: number | null = null;

function supported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function pickVoice() {
  if (!supported()) return;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;
  const english = voices.filter((v) => /^en(-|_)/i.test(v.lang));
  const preferred =
    english.find((v) => /samantha/i.test(v.name)) ??
    english.find((v) => /google us english/i.test(v.name)) ??
    english.find((v) => /karen|moira|tessa|serena/i.test(v.name)) ??
    english.find((v) => v.lang === 'en-US') ??
    english[0];
  chosen = preferred ?? null;
}

export function configureVoice(opts: { enabled: boolean }) {
  enabled = opts.enabled;
  if (!enabled && supported()) window.speechSynthesis.cancel();
}

/** Must be called from a user gesture at least once (iOS requirement). */
export function unlockVoice() {
  if (!supported()) return;
  try {
    const primer = new SpeechSynthesisUtterance(' ');
    primer.volume = 0;
    window.speechSynthesis.speak(primer);
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  } catch {
    // ignore
  }
}

interface SpeakOptions {
  interrupt?: boolean;
  rate?: number;
  pitch?: number;
  volume?: number;
  delayMs?: number;
}

export function speak(text: string, opts: SpeakOptions = {}) {
  if (!enabled || !supported() || !text) return;
  const { interrupt = true, rate = 0.95, pitch = 1.08, volume = 1, delayMs = 0 } = opts;

  const run = () => {
    try {
      if (interrupt) window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      if (!chosen) pickVoice();
      if (chosen) utter.voice = chosen;
      utter.lang = chosen?.lang ?? 'en-US';
      utter.rate = rate;
      utter.pitch = pitch;
      utter.volume = volume;
      window.speechSynthesis.speak(utter);
    } catch {
      // ignore
    }
  };

  if (interruptTimer !== null) {
    window.clearTimeout(interruptTimer);
    interruptTimer = null;
  }

  // iOS occasionally drops an utterance issued in the same tick as cancel().
  if (interrupt) {
    interruptTimer = window.setTimeout(() => {
      interruptTimer = null;
      run();
    }, 50);
  } else {
    if (delayMs > 0) window.setTimeout(run, delayMs);
    else run();
  }
}

export function stopSpeaking() {
  if (!supported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}
