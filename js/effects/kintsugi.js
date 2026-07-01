// 金缮过渡：板块切换时在屏幕上生成树状金色裂纹，再以金线"修复"。
// 裂纹用分形递归生成路径，GSAP 沿路径生长描金。

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function readVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

// 生成分形树状裂纹路径，返回多条折线
function generateCrackPaths(w, h, seed) {
  const rand = mulberry32(seed);
  const paths = [];
  const mainCount = 3 + Math.floor(rand() * 2); // 3-4 主裂纹
  for (let i = 0; i < mainCount; i++) {
    const path = [];
    // 起点偏边/中心
    const sx = w * (0.2 + rand() * 0.6);
    const sy = h * (0.2 + rand() * 0.6);
    const angle = rand() * Math.PI * 2;
    grow(path, sx, sy, angle, w * 0.4, rand);
    paths.push(path);
  }
  return paths;
}

function grow(path, x, y, angle, remaining, rand) {
  if (remaining <= 4 || path.length > 14) return;
  const step = 8 + rand() * 18;
  const nx = x + Math.cos(angle) * step;
  const ny = y + Math.sin(angle) * step;
  path.push({ x, y });
  // 主干继续
  grow(path, nx, ny, angle + (rand() - 0.5) * 0.6, remaining - step, rand);
  // 偶尔分叉（不单独保存，简化为单条路径）
}

// 简易伪随机
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function playKintsugiTransition() {
  if (typeof gsap === 'undefined') return Promise.resolve();
  const overlay = document.getElementById('kintsugi-overlay');
  if (!overlay) return Promise.resolve();

  const w = window.innerWidth;
  const h = window.innerHeight;
  let canvas = overlay.querySelector('canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    overlay.appendChild(canvas);
  }
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);

  overlay.classList.add('is-active');

  const gold = readVar('--gold', '#D4AF37');
  const [gr, gg, gb] = hexToRgb(gold);

  const paths = generateCrackPaths(w, h, Date.now() & 0xffffffff);

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete() {
        // 淡出后清理
        gsap.to(canvas, {
          opacity: 0, duration: 0.5, delay: 0.25,
          onComplete() {
            ctx.clearRect(0, 0, w, h);
            canvas.style.opacity = 1;
            overlay.classList.remove('is-active');
            resolve();
          },
        });
      },
    });

    // 屏幕轻微错位（破坏感）
    const container = document.getElementById('scroll-container');
    if (container) {
      tl.fromTo(container,
        { clipPath: 'inset(0 0 0 0)' },
        { clipPath: 'inset(2px 0 1px 0)', duration: 0.18, yoyo: true, repeat: 1, ease: 'none' },
        0,
      );
    }

    paths.forEach((pts, idx) => {
      if (pts.length < 2) return;
      const progress = { v: 0 };
      tl.to(progress, {
        v: pts.length - 1,
        duration: 0.45 + (pts.length - 1) * 0.04,
        ease: 'power1.inOut',
        onStart() { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; },
        onUpdate() {
          const i = Math.floor(progress.v);
          const frac = progress.v - i;
          // 重绘整条已完成部分（叠加发光）
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let k = 1; k <= i; k++) ctx.lineTo(pts[k].x, pts[k].y);
          if (i + 1 < pts.length) {
            const cx = pts[i].x + (pts[i + 1].x - pts[i].x) * frac;
            const cy = pts[i].y + (pts[i + 1].y - pts[i].y) * frac;
            ctx.lineTo(cx, cy);
          }
          ctx.strokeStyle = `rgba(${gr},${gg},${gb},0.9)`;
          ctx.lineWidth = 1.6;
          ctx.shadowColor = `rgba(${gr},${gg},${gb},0.8)`;
          ctx.shadowBlur = 6;
          ctx.stroke();
        },
      }, idx * 0.05);
    });
  });
}
