// 墨晕过渡：板块切换时从屏幕中心发出墨晕扩散，与金缮并行。
// 用 #ink-ripple-canvas 全屏 2D Canvas 绘制。
function readVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function playInkRipple() {
  if (typeof gsap === 'undefined') return Promise.resolve();
  const overlay = document.getElementById('ink-ripple-overlay');
  const canvas = document.getElementById('ink-ripple-canvas');
  if (!overlay || !canvas) return Promise.resolve();

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  overlay.classList.add('is-active');

  const ink = readVar('--ink', '#141414');
  const [ir, ig, ib] = hexToRgb(ink);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const maxR = Math.hypot(canvas.width, canvas.height) * 0.6;
  const ripple = { p: 0 };

  return new Promise((resolve) => {
    gsap.to(ripple, {
      p: 1,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const r = maxR * ripple.p;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `rgba(${ir},${ig},${ib},${0.25 * (1 - ripple.p * 0.7)})`);
        grad.addColorStop(0.6, `rgba(${ir},${ig},${ib},${0.08 * (1 - ripple.p)})`);
        grad.addColorStop(1, `rgba(${ir},${ig},${ib},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      },
      onComplete() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        overlay.classList.remove('is-active');
        resolve();
      },
    });
  });
}
