// 墨滴效果：开卷仪式用。墨滴从顶部下落（重力），落纸后墨晕扩散。
// 在 #loading-canvas 上绘制。

function readVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// 简易 noise（用于墨晕边缘扰动）
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function playInkDrop(opts = {}) {
  const { onLand, onRippleComplete } = opts;
  if (typeof gsap === 'undefined') return Promise.resolve();

  const canvas = document.getElementById('loading-canvas');
  if (!canvas) return Promise.resolve();
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const ink = readVar('--ink', '#141414');
  const [ir, ig, ib] = hexToRgb(ink);

  const cx = canvas.width / 2;
  const startY = -40;
  const landY = canvas.height / 2;
  const drop = { y: startY, r: 14, opacity: 1 };
  const ripple = { progress: 0 };

  return new Promise((resolve) => {
    const tl = gsap.timeline({ onComplete: resolve });

    // 1. 墨滴下落（重力加速）
    tl.to(drop, {
      y: landY,
      duration: 0.7,
      ease: 'power2.in',
      onUpdate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(cx, drop.y, drop.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ir},${ig},${ib},${drop.opacity})`;
        ctx.fill();
        // 拖尾
        ctx.beginPath();
        ctx.ellipse(cx, drop.y - 12, drop.r * 0.5, drop.r * 1.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ir},${ig},${ib},${drop.opacity * 0.3})`;
        ctx.fill();
      },
      onComplete() {
        if (onLand) onLand();
      },
    });

    // 2. 墨晕扩散
    tl.to(ripple, {
      progress: 1,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const maxR = Math.hypot(canvas.width, canvas.height) * 0.55;
        const r = maxR * ripple.progress;
        // 多层渐变墨晕
        const grad = ctx.createRadialGradient(cx, landY, 0, cx, landY, r);
        grad.addColorStop(0, `rgba(${ir},${ig},${ib},${0.5 * (1 - ripple.progress * 0.5)})`);
        grad.addColorStop(0.5, `rgba(${ir},${ig},${ib},${0.18 * (1 - ripple.progress)})`);
        grad.addColorStop(1, `rgba(${ir},${ig},${ib},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, landY, r, 0, Math.PI * 2);
        ctx.fill();

        // 边缘扰动（不规则墨晕）
        const rand = mulberry32(99);
        ctx.beginPath();
        const segs = 64;
        for (let i = 0; i <= segs; i++) {
          const a = (i / segs) * Math.PI * 2;
          const noise = 1 + (rand() - 0.5) * 0.12 * ripple.progress;
          const rr = r * noise;
          const px = cx + Math.cos(a) * rr;
          const py = landY + Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(${ir},${ig},${ib},${0.35 * (1 - ripple.progress)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      },
      onComplete() {
        if (onRippleComplete) onRippleComplete();
      },
    });

    // 3. 名字浮现（由调用方在 onRippleComplete 处理 DOM）
    tl.to({}, { duration: 0.6 });
  });
}
