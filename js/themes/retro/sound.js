// 音效：Web Audio API 简单 8-bit 蜂鸣（默认静音）
let ctx = null;
let enabled = false;

function ensureCtx() {
  if (!ctx && typeof AudioContext !== 'undefined') {
    ctx = new AudioContext();
  }
  return ctx;
}

export function setSoundEnabled(v) {
  enabled = !!v;
  if (enabled) ensureCtx();
}

export function isSoundEnabled() {
  return enabled;
}

/** @param {{ freq?: number, duration?: number, type?: OscillatorType }} [opts] */
export function blip(opts = {}) {
  if (!enabled) return;
  const c = ensureCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = opts.type || 'square';
  osc.frequency.value = opts.freq ?? 440;
  gain.gain.value = 0.08;
  osc.connect(gain);
  gain.connect(c.destination);
  const t = c.currentTime;
  const dur = opts.duration ?? 0.08;
  osc.start(t);
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.stop(t + dur);
}

export const SFX = {
  enter: () => blip({ freq: 660, duration: 0.12, type: 'square' }),
  open: () => blip({ freq: 520, duration: 0.06, type: 'square' }),
  close: () => blip({ freq: 280, duration: 0.06, type: 'square' }),
  achievement: () => {
    blip({ freq: 660, duration: 0.1 });
    setTimeout(() => blip({ freq: 880, duration: 0.15 }), 110);
  },
  easter: () => {
    blip({ freq: 440, duration: 0.08 });
    setTimeout(() => blip({ freq: 550, duration: 0.08 }), 90);
    setTimeout(() => blip({ freq: 660, duration: 0.12 }), 180);
  },
};
