// 季节切换转场：一道季节色波纹从切换器位置扩散扫过全屏。
// 扫过之处山河变色、季节元素替换。配合 3D uniform 平滑过渡。
function readVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

// 从元素中心位置发射波纹（屏幕坐标）
export function playSeasonWave(fromEl) {
  if (typeof gsap === 'undefined') return Promise.resolve();

  let cx = window.innerWidth / 2;
  let cy = 60;
  if (fromEl) {
    const r = fromEl.getBoundingClientRect();
    cx = r.left + r.width / 2;
    cy = r.top + r.height / 2;
  }

  // 创建/复用波纹 canvas
  let canvas = document.getElementById('season-wave-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'season-wave-canvas';
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:55;';
    document.body.appendChild(canvas);
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const accent = readVar('--accent', '#B5483A');
  const gold = readVar('--gold', '#D4AF37');

  const maxR = Math.hypot(canvas.width, canvas.height) * 1.1;
  const wave = { r: 0, alpha: 1 };

  return new Promise((resolve) => {
    gsap.to(wave, {
      r: maxR,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 主波纹环
        const grad = ctx.createRadialGradient(cx, cy, Math.max(0, wave.r - 60), cx, cy, wave.r);
        grad.addColorStop(0, `${accent}00`);
        grad.addColorStop(0.7, `${accent}66`);
        grad.addColorStop(1, `${accent}00`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, wave.r, 0, Math.PI * 2);
        ctx.fill();
        // 金边
        ctx.beginPath();
        ctx.arc(cx, cy, wave.r, 0, Math.PI * 2);
        ctx.strokeStyle = `${gold}${Math.floor(wave.alpha * 200).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 2;
        ctx.stroke();
        // 内圈次波
        if (wave.r > 80) {
          ctx.beginPath();
          ctx.arc(cx, cy, wave.r - 50, 0, Math.PI * 2);
          ctx.strokeStyle = `${accent}55`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      },
      onComplete() {
        // 淡出
        gsap.to(wave, {
          alpha: 0,
          duration: 0.4,
          onUpdate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.arc(cx, cy, wave.r, 0, Math.PI * 2);
            ctx.strokeStyle = `${gold}${Math.floor(wave.alpha * 200).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 2;
            ctx.stroke();
          },
          onComplete() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            resolve();
          },
        });
      },
    });
  });
}
