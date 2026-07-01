// 宣纸底纹：低分辨率 Perlin/Simplex 噪声生成纤维纹理，全屏 fixed，
// 随滚动有细微视差位移。色调取自 --paper CSS 变量。

// --- 简化 2D 噪声（基于 hash 的 value noise + fbm） ---
function makeNoise(seed) {
  const s = seed >>> 0;
  function hash(x, y) {
    let h = (x * 374761393 + y * 668265263) ^ s;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function valueAt(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const v00 = hash(xi, yi);
    const v10 = hash(xi + 1, yi);
    const v01 = hash(xi, yi + 1);
    const v11 = hash(xi + 1, yi + 1);
    const u = smooth(xf), v = smooth(yf);
    return lerp(lerp(v00, v10, u), lerp(v01, v11, u), v);
  }
  return function fbm(x, y) {
    let total = 0, amp = 0.5, freq = 1, max = 0;
    for (let i = 0; i < 4; i++) {
      total += valueAt(x * freq, y * freq) * amp;
      max += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return total / max;
  };
}

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function readPaperColor() {
  const c = getComputedStyle(document.documentElement)
    .getPropertyValue('--paper')
    .trim() || '#EDE4D3';
  return c.startsWith('#') ? c : '#EDE4D3';
}

let state = null;

export function initPaperBg() {
  const canvas = document.getElementById('paper-bg');
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');

  const W = 256, H = 256;
  const off = document.createElement('canvas');
  off.width = W; off.height = H;
  const octx = off.getContext('2d');

  const noise = makeNoise(20260702);
  const img = octx.createImageData(W, H);

  function renderTexture() {
    const paper = readPaperColor();
    const [pr, pg, pb] = hexToRgb(paper);
    const data = img.data;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        // 多尺度纤维：横向拉伸 + 噪声
        const n = noise(x * 0.06, y * 0.18);
        const fiber = noise(x * 0.4, y * 0.02) * 0.3;
        const v = Math.floor((n * 0.7 + fiber) * 50 - 25);
        const i = (y * W + x) * 4;
        data[i] = Math.max(0, Math.min(255, pr + v));
        data[i + 1] = Math.max(0, Math.min(255, pg + v));
        data[i + 2] = Math.max(0, Math.min(255, pb + v));
        data[i + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
    paint();
  }

  function paint() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
  }

  renderTexture();
  window.addEventListener('resize', paint);

  state = { canvas, off, renderTexture, paint };
  return state;
}

// 滚动时调用：轻微视差
export function updatePaperBg(scrollY) {
  if (state && state.canvas) {
    state.canvas.style.transform = `translateY(${scrollY * 0.015}px)`;
  }
}

// 季节切换时重渲纹理
export function refreshPaperBg() {
  if (state) state.renderTexture();
}
