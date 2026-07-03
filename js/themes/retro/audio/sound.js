let ctx = null;
let enabled = false;
const STORAGE_KEY = 'mx-retro-sound';

try { enabled = localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) { /* ignore */ }

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function noiseBurst(duration, { gain = 0.2, type = 'white' } = {}) {
  const c = ensureCtx();
  if (!c || !enabled) return;
  const buffer = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buffer;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(g).connect(c.destination);
  src.start();
}

function tone(freq, duration, { gain = 0.15, type = 'sine', sweepTo } = {}) {
  const c = ensureCtx();
  if (!c || !enabled) return;
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  if (sweepTo) {
    osc.frequency.exponentialRampToValueAtTime(sweepTo, c.currentTime + duration);
  }
  const g = c.createGain();
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(g).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export const SFX = {
  keypress() { noiseBurst(0.05, { gain: 0.3 }); tone(120, 0.05, { gain: 0.1, type: 'square' }); },
  crtOn() { tone(60, 0.2, { gain: 0.15, type: 'sine' }); },
  static() { noiseBurst(0.3, { gain: 0.1 }); },
  ding() { tone(880, 0.3, { gain: 0.15, type: 'sine' }); },
  tick() { tone(2000, 0.02, { gain: 0.05, type: 'square' }); },
  dive() {
    tone(200, 1.2, { gain: 0.2, type: 'sawtooth', sweepTo: 2000 });
    noiseBurst(1.2, { gain: 0.15 });
  },
  open() { tone(440, 0.1, { gain: 0.1, type: 'sine' }); },
  achievement() { tone(660, 0.2, { gain: 0.15 }); setTimeout(() => tone(880, 0.3, { gain: 0.15 }), 150); },
  easter() { tone(1320, 0.15, { gain: 0.1, type: 'triangle' }); },
};

export function setSoundEnabled(v) {
  enabled = v;
  try { localStorage.setItem(STORAGE_KEY, v ? '1' : '0'); } catch (e) { /* ignore */ }
  if (v) ensureCtx();
}

export function isSoundEnabled() { return enabled; }
