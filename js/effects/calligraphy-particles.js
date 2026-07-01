// 书法粒子标题：文字预渲染到离屏 Canvas，按网格采样像素点位，
// 生成飞舞墨点粒子，GSAP 控制聚合/散开。
const THREE = window.THREE;

// 纯函数：从 ImageData 采样 alpha 超过阈值的点位（可测试）
export function samplePointsFromImageData(imageData, opts = {}) {
  const { step = 3, threshold = 128 } = opts;
  const { width, height, data } = imageData;
  const pts = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > threshold) pts.push({ x, y });
    }
  }
  return pts;
}

// 渲染文字到离屏 canvas，返回 ImageData
function textToImageData(text, opts = {}) {
  const {
    font = "100px 'Ma Shan Zheng', serif",
    fillStyle = '#000',
    padding = 20,
  } = opts;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  ctx.font = font;
  const metrics = ctx.measureText(text || '');
  const w = Math.ceil(metrics.width) + padding * 2;
  const h = Math.ceil((metrics.actualBoundingBoxAscent || 100) + (metrics.actualBoundingBoxDescent || 20) + padding * 2);
  c.width = w; c.height = h;
  ctx.font = font;
  ctx.fillStyle = fillStyle;
  ctx.textBaseline = 'top';
  ctx.fillText(text, padding, padding);
  return ctx.getImageData(0, 0, w, h);
}

// 采样文字点位（浏览器用）
export function sampleTextPoints(text, opts = {}) {
  if (!text) return [];
  const { step = 4, threshold = 128, font = "120px 'Ma Shan Zheng', serif" } = opts;
  try {
    const img = textToImageData(text, { font });
    return samplePointsFromImageData(img, { step, threshold });
  } catch (e) {
    return [];
  }
}

// 创建书法粒子标题（DOM 粒子版，性能友好）
// 返回 { el, animateIn, animateOut }
export function createCalligraphyTitle(text, opts = {}) {
  const {
    color = 'var(--ink)',
    font = "clamp(3rem,10vw,7rem) 'Ma Shan Zheng', serif",
    particleSize = 3,
    step = 5,
  } = opts;

  const wrap = document.createElement('div');
  wrap.className = 'calligraphy-title';
  wrap.setAttribute('aria-label', text);
  Object.assign(wrap.style, {
    position: 'relative', display: 'inline-block',
    fontFamily: font, color: 'transparent',
  });
  // 隐藏的实底层文字（用于占位/无 JS 动画时显示）
  const ghost = document.createElement('span');
  ghost.textContent = text;
  ghost.style.cssText = 'opacity:0;';
  wrap.appendChild(ghost);

  // 采样
  const pts = sampleTextPoints(text, {
    step,
    font: `120px 'Ma Shan Zheng', serif`,
  });

  if (!pts.length || typeof gsap === 'undefined') {
    // 回退：直接显示文字
    ghost.style.opacity = '1';
    ghost.style.color = color;
    return { el: wrap, animateIn() {}, animateOut() {} };
  }

  // 计算目标尺寸
  const maxX = Math.max(...pts.map((p) => p.x));
  const maxY = Math.max(...pts.map((p) => p.y));
  const scale = measureFontScale(font, text);
  const targetW = maxX * scale;
  const targetH = maxY * scale;

  wrap.style.width = `${targetW}px`;
  wrap.style.height = `${targetH}px`;

  // 用 canvas 绘制粒子（比 DOM 粒子性能更好）
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  canvas.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;';
  wrap.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const inkColor = resolveColor(color);
  const particles = pts.map((p) => ({
    tx: p.x * scale,
    ty: p.y * scale,
    x: Math.random() * targetW,
    y: Math.random() * targetH,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
  }));

  let state = 'idle'; // idle | in | out
  let raf = 0;

  function draw() {
    ctx.clearRect(0, 0, targetW, targetH);
    ctx.fillStyle = inkColor;
    for (const p of particles) {
      if (state === 'in') {
        p.x += (p.tx - p.x) * 0.12;
        p.y += (p.ty - p.y) * 0.12;
      } else if (state === 'out' || state === 'idle') {
        p.x += p.vx;
        p.y += p.vy;
        // 边界反弹
        if (p.x < 0 || p.x > targetW) p.vx *= -1;
        if (p.y < 0 || p.y > targetH) p.vy *= -1;
      }
      ctx.globalAlpha = state === 'in' ? 0.85 : 0.3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, particleSize, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }

  function animateIn() {
    state = 'in';
    if (!raf) raf = requestAnimationFrame(draw);
  }
  function animateOut() {
    state = 'out';
    // 给粒子随机速度飞散
    for (const p of particles) {
      p.vx = (Math.random() - 0.5) * 2;
      p.vy = (Math.random() - 0.5) * 2;
    }
    setTimeout(() => {
      cancelAnimationFrame(raf);
      raf = 0;
      ctx.clearRect(0, 0, targetW, targetH);
    }, 1500);
  }

  // 初始漂浮
  if (!state || state === 'idle') {
    state = 'idle';
    raf = requestAnimationFrame(draw);
  }

  return { el: wrap, animateIn, animateOut };
}

function measureFontScale(cssFont, text) {
  // 用实尺寸 canvas 测量字体缩放比
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  ctx.font = cssFont;
  const m1 = ctx.measureText(text).width;
  ctx.font = "120px 'Ma Shan Zheng', serif";
  const m2 = ctx.measureText(text).width || 1;
  return m1 / m2;
}

function resolveColor(c) {
  if (c.startsWith('var(')) {
    const name = c.slice(4, -1).trim();
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#141414';
  }
  return c;
}

// 增强 section 内的标题元素为书法粒子标题
// 返回 { animateIn, animateOut }
export function enhanceTitles(scopeEl, selector = '.section-title, .about-name') {
  const titles = scopeEl.querySelectorAll(selector);
  const enhanced = [];
  titles.forEach((el) => {
    const text = el.textContent.trim();
    if (!text) return;
    const font = window.getComputedStyle(el).font;
    const color = window.getComputedStyle(el).color;
    const { el: particleEl, animateIn, animateOut } = createCalligraphyTitle(text, {
      color: color || 'var(--ink)',
      font: font || "clamp(3rem,10vw,7rem) 'Ma Shan Zheng', serif",
      step: 5,
      particleSize: 2.5,
    });
    particleEl.style.cssText += el.getAttribute('style') || '';
    // 复制类名（保留布局相关）
    particleEl.classList.add(...el.classList);
    el.replaceWith(particleEl);
    enhanced.push({ animateIn, animateOut });
  });
  return {
    animateIn() { enhanced.forEach((t) => t.animateIn()); },
    animateOut() { enhanced.forEach((t) => t.animateOut()); },
  };
}
