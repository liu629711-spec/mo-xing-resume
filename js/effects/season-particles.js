// 四季粒子系统：每个季节有特定飘落元素（春樱/夏荷/秋枫/冬雪），
// 切换季节时播放爆发特效。
// 全屏 Canvas，pointer-events:none，z-index 在宣纸之上、信息层之下。

const SEASON_PARTICLES = {
  spring: { color: '#E8B4B8', type: 'petal', count: 40, fallSpeed: 0.4, sway: 0.8, size: 6 },
  summer: { color: '#6B8E7F', type: 'dot', count: 30, fallSpeed: 0.3, sway: 0.4, size: 4 },
  autumn: { color: '#B5483A', type: 'maple', count: 35, fallSpeed: 0.5, sway: 1.0, size: 7 },
  winter: { color: '#F0F0F2', type: 'snow', count: 60, fallSpeed: 0.25, sway: 0.5, size: 3 },
};

let canvas, ctx, particles = [], currentType = null, raf = 0, W = 0, H = 0;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function makeParticle(season, burst = false) {
  const cfg = SEASON_PARTICLES[season];
  return {
    type: cfg.type,
    color: cfg.color,
    size: cfg.size * (0.7 + Math.random() * 0.6),
    x: burst ? W / 2 : Math.random() * W,
    y: burst ? H / 2 : -10 - Math.random() * 100,
    vx: burst ? (Math.random() - 0.5) * 8 : (Math.random() - 0.5) * cfg.sway,
    vy: burst ? (Math.random() - 0.5) * 8 : cfg.fallSpeed * (0.6 + Math.random() * 0.8),
    rot: Math.random() * Math.PI * 2,
    vrot: (Math.random() - 0.5) * 0.05,
    swayPhase: Math.random() * Math.PI * 2,
    swayAmp: cfg.sway * (0.5 + Math.random()),
    alpha: 0,
    targetAlpha: 0.5 + Math.random() * 0.4,
    burst,
  };
}

function drawParticle(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha = p.alpha;
  ctx.fillStyle = p.color;
  switch (p.type) {
    case 'petal': {
      // 樱花瓣：椭圆 + 凹口
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = p.alpha * 0.6;
      ctx.beginPath();
      ctx.ellipse(0, p.size * 0.4, p.size * 0.4, p.size * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      break;
    }
    case 'dot': {
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = p.alpha * 0.3;
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'maple': {
      // 枫叶：5 角星简化
      ctx.beginPath();
      const r = p.size;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const a2 = a + Math.PI / 5;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        ctx.lineTo(Math.cos(a2) * r * 0.45, Math.sin(a2) * r * 0.45);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'snow': {
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      // 六角线
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 0.6;
      ctx.globalAlpha = p.alpha * 0.7;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * p.size * 1.8, Math.sin(a) * p.size * 1.8);
        ctx.stroke();
      }
      break;
    }
  }
  ctx.restore();
}

function tick() {
  ctx.clearRect(0, 0, W, H);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    // 淡入
    if (p.alpha < p.targetAlpha) p.alpha = Math.min(p.targetAlpha, p.alpha + 0.02);
    // 摆动
    p.swayPhase += 0.02;
    p.x += p.vx + Math.sin(p.swayPhase) * p.swayAmp * 0.3;
    p.y += p.vy;
    p.rot += p.vrot;
    // burst 转为飘落
    if (p.burst) {
      p.vx *= 0.96;
      p.vy = p.vy * 0.96 + 0.05;
      if (Math.abs(p.vx) < 0.2 && Math.abs(p.vy) < 0.6) {
        const cfg = SEASON_PARTICLES[currentType];
        p.vy = cfg.fallSpeed * (0.6 + Math.random() * 0.8);
        p.vx = (Math.random() - 0.5) * cfg.sway;
        p.burst = false;
      }
    }
    drawParticle(p);
    // 出界回收
    if (p.y > H + 20 || p.x < -50 || p.x > W + 50) {
      if (!p.burst) {
        // 重新从顶部生成
        const cfg = SEASON_PARTICLES[currentType];
        p.x = Math.random() * W;
        p.y = -10;
        p.vy = cfg.fallSpeed * (0.6 + Math.random() * 0.8);
        p.alpha = 0;
      } else {
        particles.splice(i, 1);
      }
    }
  }
  // 维持飘落粒子数量
  const cfg = SEASON_PARTICLES[currentType];
  if (cfg && particles.length < cfg.count) {
    particles.push(makeParticle(currentType, false));
  }
  raf = requestAnimationFrame(tick);
}

// 初始化（不立即启动，等 setSeason）
export function initSeasonParticles() {
  canvas = document.createElement('canvas');
  canvas.id = 'season-particles';
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:5;';
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

// 设置季节粒子（首次）或切换（带爆发特效）
export function setSeasonParticles(season, withBurst = false) {
  if (!SEASON_PARTICLES[season]) return;
  const prevType = currentType;
  currentType = season;
  if (!canvas) initSeasonParticles();
  if (prevType !== season) {
    // 清掉旧飘落粒子（淡出后移除）
    particles.forEach((p) => { p.targetAlpha = 0; });
    // 爆发新粒子
    const burstCount = withBurst ? 30 : 18;
    for (let i = 0; i < burstCount; i++) {
      particles.push(makeParticle(season, true));
    }
  }
  if (!raf) raf = requestAnimationFrame(tick);
}
