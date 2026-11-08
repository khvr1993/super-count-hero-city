type SfxName =
  | 'tick'
  | 'squeak'
  | 'pop'
  | 'correct'
  | 'wrong'
  | 'whoosh'
  | 'engine'
  | 'fanfare'
  | 'bolt'
  | 'cheer';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let soundOn = true;

function ensureAudio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function unlockAudio() {
  const c = ensureAudio();
  if (c && c.state === 'suspended') void c.resume();
}

export function setSoundEnabled(on: boolean) {
  soundOn = on;
  if (on) unlockAudio();
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType,
  gain = 0.5,
  delay = 0,
  slideTo?: number,
) {
  const c = ensureAudio();
  if (!c || !master) return;
  const start = c.currentTime + delay;
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(env);
  env.connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

function noise(duration: number, gain = 0.3, delay = 0) {
  const c = ensureAudio();
  if (!c || !master) return;
  const start = c.currentTime + delay;
  const length = Math.max(1, Math.floor(c.sampleRate * duration));
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const source = c.createBufferSource();
  source.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1400, start);
  filter.frequency.exponentialRampToValueAtTime(300, start + duration);
  const env = c.createGain();
  env.gain.setValueAtTime(gain, start);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter);
  filter.connect(env);
  env.connect(master);
  source.start(start);
  source.stop(start + duration);
}

export function sfx(name: SfxName) {
  if (!soundOn) return;
  switch (name) {
    case 'tick':
      tone(720, 0.07, 'square', 0.25);
      break;
    case 'squeak':
      tone(640 + Math.random() * 180, 0.09, 'sine', 0.4, 0, 1080 + Math.random() * 220);
      break;
    case 'pop':
      tone(520, 0.09, 'triangle', 0.4, 0, 220);
      break;
    case 'correct':
      tone(523, 0.12, 'triangle', 0.42);
      tone(659, 0.12, 'triangle', 0.42, 0.09);
      tone(784, 0.18, 'triangle', 0.45, 0.18);
      break;
    case 'wrong':
      tone(360, 0.16, 'sine', 0.3, 0, 300);
      tone(280, 0.2, 'sine', 0.25, 0.13, 220);
      break;
    case 'whoosh':
      noise(0.32, 0.35);
      break;
    case 'engine':
      tone(85, 0.55, 'sawtooth', 0.25, 0, 190);
      noise(0.4, 0.12);
      break;
    case 'fanfare':
      [523, 659, 784, 1047, 1319].forEach((f, i) =>
        tone(f, 0.2, 'triangle', 0.4, i * 0.1),
      );
      break;
    case 'bolt':
      tone(1200, 0.12, 'sine', 0.32, 0, 1800);
      break;
    case 'cheer':
      tone(660, 0.1, 'triangle', 0.3);
      tone(880, 0.1, 'triangle', 0.3, 0.08);
      tone(1100, 0.22, 'triangle', 0.33, 0.16);
      break;
  }
}
