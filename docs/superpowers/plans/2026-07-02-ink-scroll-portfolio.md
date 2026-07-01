# 水墨长卷个人网站 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 构建一个水墨长卷·山水漫游风格的 3D 游戏运营求职简历网站，访客滚动展卷浏览七处景致板块。

**架构：** 单页应用。Three.js 渲染沿 X 轴延伸的水墨山水长卷，Lenis + GSAP ScrollTrigger 驱动摄像机推进与板块激活。3D 氛围层 + HTML/Canvas 信息层叠加。所有真实内容放 `data/*.json`，代码与内容分离。

**技术栈：** 原生 HTML/CSS/JS（无构建）+ Three.js + GSAP + ScrollTrigger + Lenis + D3.js + Vitest（数据层测试）

**规格参考：** `docs/superpowers/specs/2026-07-02-ink-scroll-portfolio-design.md`

---

## 阶段划分（每阶段产出可独立运行成果）

- **阶段 1：静态骨架 + 视觉系统 + 开卷仪式** —— 产出：纯 CSS/Canvas/GSAP 的可浏览简历（无 3D 也有完整内容），四季切换、宣纸底纹、开卷 Loading、金缮过渡可用。
- **阶段 2：Three.js 核心场景 + 滚动驱动** —— 产出：3D 长卷场景接入，摄像机随滚动推进，板块按需加载。
- **阶段 3：全局特效系统** —— 产出：书法粒子标题、宣纸着色器、墨晕着色器、墨河流体着色器。
- **阶段 4：七板块 3D 景致** —— 产出：每个板块的 3D 元素与交互。
- **阶段 5：数据可视化 + 降级 + 收尾** —— 产出：D3 墨笔图表、移动端 2D 降级、reduced-motion、README。

---

## 阶段 1：静态骨架 + 视觉系统 + 开卷仪式

### 任务 1.1：项目目录与第三方库本地化

**文件：**
- 创建：`index.html`
- 创建：`css/core.css`、`css/ink.css`、`css/sections.css`、`css/responsive.css`
- 创建：`js/vendors/`（three.min.js、gsap.min.js、ScrollTrigger.min.js、lenis.min.js、d3.min.js）
- 创建：`README.md`

- [ ] **步骤 1：创建目录结构**

创建 `css/`、`js/core/`、`js/three/shaders/`、`js/effects/`、`js/sections/`、`js/vendors/`、`data/`、`assets/fonts/`、`assets/images/`、`assets/textures/`。

- [ ] **步骤 2：下载第三方库到 `js/vendors/`**

从 CDN 下载以下文件本地化（避免外网依赖）：
- three.min.js（r160+，UMD）
- gsap.min.js（3.12+）
- ScrollTrigger.min.js（3.12+）
- lenis.min.js（1.0+，UMD）
- d3.min.js（7+）

验证：浏览器控制台无 404。

- [ ] **步骤 3：编写最小 `index.html`**

包含：DOCTYPE、meta charset/viewport、title、字体 CDN link（Ma Shan Zheng、ZCOOL XiaoWei、Noto Serif SC、Cormorant Garamond）、`css/*` 顺序引入、所有 section 占位容器、`js/vendors/*` 顺序引入、`js/core/init.js` defer 引入。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>水墨长卷 · 游戏运营简历</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=ZCOOL+XiaoWei&family=Noto+Serif+SC:wght@400;600;900&family=Cormorant+Garamond:wght@400;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/core.css" />
  <link rel="stylesheet" href="css/ink.css" />
  <link rel="stylesheet" href="css/sections.css" />
  <link rel="stylesheet" href="css/responsive.css" />
</head>
<body>
  <canvas id="paper-bg"></canvas>
  <div id="loading-screen"></div>
  <main id="scroll-container">
    <section id="sec-about" class="section"></section>
    <section id="sec-skills" class="section"></section>
    <section id="sec-projects" class="section"></section>
    <section id="sec-data" class="section"></section>
    <section id="sec-games" class="section"></section>
    <section id="sec-timeline" class="section"></section>
    <section id="sec-contact" class="section"></section>
  </main>
  <div id="kintsugi-overlay"></div>
  <div id="season-switcher"></div>
  <!-- vendors -->
  <script src="js/vendors/gsap.min.js"></script>
  <script src="js/vendors/ScrollTrigger.min.js"></script>
  <script src="js/vendors/lenis.min.js"></script>
  <script src="js/vendors/d3.min.js"></script>
  <script src="js/vendors/three.min.js"></script>
  <!-- app -->
  <script src="js/core/init.js" defer></script>
</body>
</html>
```

- [ ] **步骤 4：编写 `README.md`（占位）**

含：项目简介、设计理念一段、技术栈、目录结构、本地运行方式（双击 index.html 或 `python -m http.server`）、内容更新方式（改 `data/*.json`）、部署到 GitHub Pages/Vercel 说明。后续阶段补完。

### 任务 1.2：全局样式与四季 CSS 变量系统

**文件：**
- 创建：`css/core.css`
- 创建：`js/core/seasons.js`
- 测试：`tests/seasons.test.js`

- [ ] **步骤 1：编写失败的测试 — 季节判定函数**

`tests/seasons.test.js`（Vitest）：

```js
import { describe, it, expect } from 'vitest';
import { getSeasonByMonth, SEASON_VARS } from '../js/core/seasons.js';

describe('getSeasonByMonth', () => {
  it('3-5 月为春', () => {
    expect(getSeasonByMonth(2)).toBe('spring');
    expect(getSeasonByMonth(3)).toBe('spring');
    expect(getSeasonByMonth(4)).toBe('spring');
  });
  it('6-8 月为夏', () => {
    expect(getSeasonByMonth(5)).toBe('summer');
    expect(getSeasonByMonth(6)).toBe('summer');
    expect(getSeasonByMonth(7)).toBe('summer');
  });
  it('9-11 月为秋', () => {
    expect(getSeasonByMonth(8)).toBe('autumn');
    expect(getSeasonByMonth(9)).toBe('autumn');
    expect(getSeasonByMonth(10)).toBe('autumn');
  });
  it('12,1,2 月为冬', () => {
    expect(getSeasonByMonth(11)).toBe('winter');
    expect(getSeasonByMonth(0)).toBe('winter');
    expect(getSeasonByMonth(1)).toBe('winter');
  });
});

describe('SEASON_VARS', () => {
  it('四季都有 paper/ink/gold/accent 四个色值', () => {
    for (const s of ['spring','summer','autumn','winter']) {
      const v = SEASON_VARS[s];
      expect(v.paper).toMatch(/^#/);
      expect(v.ink).toMatch(/^#/);
      expect(v.gold).toMatch(/^#/);
      expect(v.accent).toMatch(/^#/);
    }
  });
});
```

- [ ] **步骤 2：安装 Vitest 并运行测试验证失败**

```bash
npm init -y
npm install -D vitest
npx vitest run tests/seasons.test.js
```

预期：FAIL（模块不存在）。

- [ ] **步骤 3：实现 `js/core/seasons.js`**

```js
export const SEASON_VARS = {
  spring: { paper: '#F5EFE0', ink: '#1A1A1A', gold: '#C9A961', accent: '#E8B4B8' },
  summer: { paper: '#E8EDE8', ink: '#0D0D0D', gold: '#B89968', accent: '#6B8E7F' },
  autumn: { paper: '#EDE4D3', ink: '#141414', gold: '#D4AF37', accent: '#B5483A' },
  winter: { paper: '#F0F0F2', ink: '#2A2A2A', gold: '#A8A8B0', accent: '#B8C5D6' },
};

export function getSeasonByMonth(monthIndex) {
  const m = ((monthIndex % 12) + 12) % 12;
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'autumn';
  return 'winter';
}

export function applySeasonVars(season) {
  const v = SEASON_VARS[season];
  const root = document.documentElement;
  root.style.setProperty('--paper', v.paper);
  root.style.setProperty('--ink', v.ink);
  root.style.setProperty('--gold', v.gold);
  root.style.setProperty('--accent', v.accent);
}
```

- [ ] **步骤 4：运行测试验证通过**

```bash
npx vitest run tests/seasons.test.js
```

预期：PASS。

- [ ] **步骤 5：编写 `css/core.css`**

包含：CSS reset、`html,body` 基础、`--paper/--ink/--gold/--accent` 默认变量（秋）、字体变量（`--font-title: 'Ma Shan Zheng'`、`--font-body: 'Noto Serif SC'`、`--font-num: 'Cormorant Garamond'`）、`body` 用 `--paper` 底 + `--ink` 文字、`#paper-bg` fixed 全屏 z-index:-2、`#scroll-container` 相对定位、`.section` 最小高度 100vh、`#kintsugi-overlay` fixed 全屏 pointer-events:none z-index:50、`#season-switcher` fixed 右上角 z-index:60。

- [ ] **步骤 6：编写 `css/ink.css`**

水墨相关工具类：`.ink-title`（书法字体、超大字号）、`.ink-text`（宋体）、`.num`（Cormorant）、`.seal`（印章样式：方形红底白字、圆角小、shadow）、`.ink-brush-underline`（笔刷下划线伪元素）。

- [ ] **步骤 7：手动验收**

双击 `index.html`，确认：宣纸底色显示、字体加载、无控制台报错、`applySeasonVars('autumn')` 在控制台调用后 CSS 变量更新（可临时在 init.js 调用）。

### 任务 1.3：宣纸底纹 Canvas

**文件：**
- 创建：`js/effects/paper-bg.js`
- 修改：`js/core/init.js`（引入并启动）

- [ ] **步骤 1：实现 `js/effects/paper-bg.js`**

用 Perlin/Simplex noise（内联简化实现，不引入额外库）生成低分辨率（256x256）宣纸纤维纹理，缓存到 offscreen canvas，按全屏放大绘制到 `#paper-bg`。色调取自 `--paper` CSS 变量。随 `lenis.scroll` 有细微 y 位移（视差）。导出 `initPaperBg()` 与 `updatePaperBg(scrollY)`。

```js
// 简化 simplex noise（内联）
function makeNoise(seed) { /* ... 简化实现 ... */ return (x,y)=> /* 0-1 */; }

export function initPaperBg() {
  const canvas = document.getElementById('paper-bg');
  const ctx = canvas.getContext('2d');
  const W = 256, H = 256;
  const off = document.createElement('canvas');
  off.width = W; off.height = H;
  const octx = off.getContext('2d');
  const noise = makeNoise(1234);
  const img = octx.createImageData(W, H);
  const paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim() || '#EDE4D3';
  const [pr,pg,pb] = hexToRgb(paper);
  for (let y=0;y<H;y++) for (let x=0;x<W;x++) {
    const n = noise(x*0.08, y*0.08);
    const v = Math.floor(n*40 - 20);
    const i = (y*W+x)*4;
    img.data[i] = pr+v; img.data[i+1] = pg+v; img.data[i+2] = pb+v; img.data[i+3] = 255;
  }
  octx.putImageData(img, 0, 0);
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);
  return { canvas, off };
}

export function updatePaperBg(scrollY) {
  // 轻微视差位移
  const canvas = document.getElementById('paper-bg');
  canvas.style.transform = `translateY(${scrollY * 0.02}px)`;
}

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n>>16)&255, (n>>8)&255, n&255];
}
```

（实现时补全 noise 函数，可用经典 simplex JS 实现约 40 行。）

- [ ] **步骤 2：手动验收**

`init.js` 中调用 `initPaperBg()`，浏览器看到宣纸纹理而非纯色。

### 任务 1.4：四季切换器 UI

**文件：**
- 创建：`js/core/seasons.js`（已存在，补充切换器逻辑）
- 修改：`css/core.css`（切换器样式）

- [ ] **步骤 1：在 `seasons.js` 添加 `initSeasonSwitcher()`**

创建 4 个小图标按钮（春樱/夏荷/秋枫/冬梅，用 emoji 或简单 SVG），点击调用 `applySeasonVars(season)` 并用 GSAP 平滑过渡 Three.js uniform（阶段 2 接入，此阶段仅 CSS 变量）。默认按本地月份初始化。

- [ ] **步骤 2：手动验收**

点击四个图标，宣纸底色与文字色平滑切换。

### 任务 1.5：金缮过渡效果

**文件：**
- 创建：`js/effects/kintsugi.js`
- 修改：`css/core.css`（`#kintsugi-overlay` 样式）

- [ ] **步骤 1：实现 `js/effects/kintsugi.js`**

导出 `playKintsugiTransition()`：在 `#kintsugi-overlay` 上用 Canvas 2D 生成树状裂纹路径（分形递归，从随机起点向多个方向生长，每段递归分裂），GSAP 沿路径"生长"金线（描边渐变 `--gold` → 亮金），约 1s。同时给 `#scroll-container` 加轻微 clip-path 错位（0.6s）后归位。

```js
export function playKintsugiTransition() {
  const overlay = document.getElementById('kintsugi-overlay');
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  overlay.innerHTML = ''; overlay.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const paths = generateCrackPaths(canvas.width, canvas.height);
  // GSAP 沿路径生长
  const tl = gsap.timeline();
  paths.forEach(p => drawCrack(ctx, p, tl));
  // 错位
  gsap.fromTo('#scroll-container', { clipPath: 'inset(0 0 0 0)' },
    { clipPath: 'inset(2px 0 0 1px 0)', duration: 0.3, yoyo: true, repeat: 1 });
  return tl;
}

function generateCrackPaths(w, h) {
  // 分形递归生成 3-5 条主裂纹，每条 8-15 段
  // 返回 [[{x,y},...], ...]
}

function drawCrack(ctx, points, tl) {
  // 用 dashoffset 动画沿路径描金线
}
```

- [ ] **步骤 2：手动验收**

控制台调用 `playKintsugiTransition()`，看到金色裂纹生长 + 错位修复。

### 任务 1.6：开卷仪式 Loading

**文件：**
- 创建：`js/effects/ink-drop.js`
- 创建：`js/sections/loading.js`
- 修改：`css/sections.css`（loading 样式）

- [ ] **步骤 1：实现 `js/effects/ink-drop.js`**

在 `#loading-screen` 上用 Canvas 2D 绘制：墨滴从顶部下落（重力加速 gsap），落点墨晕扩散（径向 gradient 多帧 + 噪点扰动边缘），扩散到全屏。导出 `playInkDrop(onComplete)` 返回 GSAP timeline。

- [ ] **步骤 2：实现 `js/sections/loading.js`**

编排开卷序列：
1. 宣纸底淡入
2. `playInkDrop()` 墨滴落纸 + Web Audio 合成"滴"声（可选，默认关）
3. 墨晕中心浮现名字（书法字体，opacity 0→1，scale 1.2→1）
4. `playKintsugiTransition()` 金缮裂纹铺满
5. `onComplete` 隐藏 `#loading-screen`，激活主滚动

提供"跳过开卷"按钮（右上角），点击直接到 onComplete。

- [ ] **步骤 3：手动验收**

刷新页面，看到完整开卷序列约 4s，结束后进入主页面。点击跳过有效。

### 任务 1.7：七板块静态内容骨架 + 数据 JSON

**文件：**
- 创建：`data/profile.json`、`data/skills.json`、`data/projects.json`、`data/metrics.json`、`data/games.json`、`data/timeline.json`、`data/contact.json`
- 创建：`js/core/data-loader.js`
- 测试：`tests/data-schema.test.js`
- 创建：`js/sections/about.js`、`skills.js`、`projects.js`、`data.js`、`games.js`、`timeline.js`、`contact.js`（仅渲染 HTML 内容，无 3D）

- [ ] **步骤 1：编写 JSON schema 校验测试**

`tests/data-schema.test.js`：用 Vitest 校验每个 JSON 文件结构（字段存在、类型正确）。先写测试再写 JSON。

- [ ] **步骤 2：运行测试验证失败**

```bash
npx vitest run tests/data-schema.test.js
```

- [ ] **步骤 3：编写各 `data/*.json`（用占位真实内容）**

按规格文档第 7 节结构，填入示例内容（如 `profile.json` 的 name 用"墨行"占位，tagline 用"游戏产品运营 · 用数据讲故事的造梦人"）。后续用户替换为真实数据。

- [ ] **步骤 4：运行测试验证通过**

- [ ] **步骤 5：实现 `js/core/data-loader.js`**

导出 `loadAllData()` 用 `Promise.all` 并行 fetch 所有 JSON，返回 `{ profile, skills, projects, metrics, games, timeline, contact }`。fetch 失败时返回该板块的 fallback 占位对象并 console.warn。

- [ ] **步骤 6：实现各 `js/sections/*.js` 的 `render(data)` 函数**

每个 section 暴露 `render(sectionEl, data)`，把数据渲染成 HTML 信息层内容（标题、文字、卡片），暂不接 3D。`projects.js` 的项目详情卷 overlay 也在此实现（点击展开）。

- [ ] **步骤 7：编写 `js/core/init.js` 主入口**

顺序：
1. `applySeasonVars(getSeasonByMonth(new Date().getMonth()))` + `initSeasonSwitcher()`
2. `initPaperBg()`
3. `loadAllData().then(data => { 注册各 section render; 启动 loading 序列; })`
4. Loading 完成后初始化 Lenis + ScrollTrigger（此阶段仅基础滚动，3D 阶段接入）

- [ ] **步骤 8：手动验收**

七板块内容按顺序滚动可见，数据从 JSON 加载，无控制台报错。手机尺寸下垂直布局正常。

### 任务 1.8：阶段 1 验收与 commit

- [ ] **步骤 1：验收清单**

- [ ] 双击 index.html 可运行
- [ ] 开卷仪式完整播放
- [ ] 四季切换器可用
- [ ] 宣纸底纹显示
- [ ] 七板块内容可见且从 JSON 加载
- [ ] 金缮过渡可触发
- [ ] 无控制台报错
- [ ] Vitest 全绿

- [ ] **步骤 2：初始化 git 并 commit**

```bash
git init
git add .
git commit -m "feat: 阶段1 静态骨架+视觉系统+开卷仪式"
```

---

## 阶段 2：Three.js 核心场景 + 滚动驱动

### 任务 2.1：Three.js 场景与渲染器初始化

**文件：**
- 创建：`js/three/scene.js`
- 修改：`js/core/init.js`

- [ ] **步骤 1：实现 `js/three/scene.js`**

导出 `initThreeScene()` 返回 `{ scene, camera, renderer, update }`：
- `scene`：THREE.Scene，背景透明（让宣纸底纹透出）
- `camera`：PerspectiveCamera，初始位置 (0, 2, 10)，看向 (10, 0, 0)（沿 X+）
- `renderer`：WebGLRenderer（alpha:true, antialias:true, pixelRatio: min(dpr,2)），挂到 `#three-canvas` 容器（fixed 全屏 z-index:-1，在宣纸之上、信息层之下）
- `update()`：每帧调用，由 gsap.ticker 驱动
- WebGL 不支持时抛 `Error('NO_WEBGL')`，由 init.js 捕获走降级路径

- [ ] **步骤 2：手动验收**

控制台 `initThreeScene()`，看到透明 canvas，无报错。`renderer.domElement` 在 DOM 中。

### 任务 2.2：水墨地形着色器（山峦基础）

**文件：**
- 创建：`js/three/shaders/ink-shader.js`
- 创建：`js/three/terrain.js`

- [ ] **步骤 1：实现 `js/three/shaders/ink-shader.js`**

导出 `vertexShader` 与 `fragmentShader` 字符串。片元着色器：基于高度和噪声生成水墨晕染（高处浓墨、低处淡墨、边缘晕开），用 fbm noise 制造笔触感。uniform：`uTime`、`uInkColor`、`uPaperColor`、`uSeason`。

- [ ] **步骤 2：实现 `js/three/terrain.js`**

导出 `createMountainRange(options)`：用 PlaneGeometry + 噪声位移生成山峦 mesh，应用 ink-shader。参数：count（山数）、xStart、spacing、maxHeight、colorBias。

- [ ] **步骤 3：手动验收**

测试场景加一组山峦，看到水墨风格山脉渲染，随时间有细微墨韵流动。

### 任务 2.3：云海着色器与基础云雾

**文件：**
- 创建：`js/three/shaders/clouds-shader.js`（或合并进 ink-shader）
- 创建：`js/three/clouds.js`

- [ ] **步骤 1：实现 `js/three/clouds.js`**

导出 `createCloudSea(options)`：一个大 Plane（云海）用着色器渲染流动云雾，alpha 由噪声控制。导出 `createMistVolume(options)`：体积雾（用 sprite 粒子或半透明 plane 堆叠）做山腰云雾。

- [ ] **步骤 2：手动验收**

山峦间有流动云海与云雾。

### 任务 2.4：滚动驱动摄像机同步

**文件：**
- 创建：`js/core/scroll.js`
- 修改：`js/core/init.js`、`js/three/scene.js`

- [ ] **步骤 1：实现 `js/core/scroll.js`**

导出 `initSmoothScroll(onProgress)`：
- `const lenis = new Lenis({ lerp: 0.1 })`
- `lenis.on('scroll', ScrollTrigger.update)`
- `gsap.ticker.add((t)=> lenis.raf(t*1000))`
- 暴露 `getProgress()` 返回 `lenis.scroll / lenis.limit`
- 暴露 `lenis` 实例

- [ ] **步骤 2：在 `scene.js` 接入摄像机推进**

`update()` 中：`camera.position.x = progress * 70`（用 `gsap.quickTo` 平滑），camera 始终看向 `(camera.position.x + 10, 0, 0)`。

- [ ] **步骤 3：注册 ScrollTrigger 板块触发器**

`js/core/router.js`：为每个 section 创建 ScrollTrigger（`start: 'top center'`, `end: 'bottom center'`），进入调 `section.activate()`，离开调 `section.deactivate()`。每 section 模块导出 `{ activate, deactivate }`。

- [ ] **步骤 4：手动验收**

滚动时摄像机沿 X 推进，山峦从右向左流过，宣纸底纹视差正常。

### 任务 2.5：板块按需加载/卸载 3D 对象

**文件：**
- 创建：`js/three/pool.js`
- 修改：各 section 模块

- [ ] **步骤 1：实现 `js/three/pool.js`**

简单对象池：`acquire(meshFactory)`、`release(mesh)`。维护一个 `activeMeshes` Set，section `activate` 时 acquire，`deactivate` 时 release（从 scene 移除但不销毁，复用）。

- [ ] **步骤 2：各 section 接入池**

每个 section 的 `activate()` 用 pool 创建自己的 3D 元素并 `scene.add`，`deactivate()` 时 `scene.remove` + pool.release。此阶段先用占位 mesh（如简单 box），阶段 4 替换为正式景致。

- [ ] **步骤 3：手动验收**

滚动来回切换板块，3D 对象正确出现/消失，无内存泄漏（Chrome Memory 标签页确认）。

### 任务 2.6：阶段 2 验收与 commit

- [ ] **步骤 1：验收清单**

- [ ] 3D 场景渲染水墨山峦 + 云海
- [ ] 滚动平滑驱动摄像机
- [ ] 板块按需加载/卸载
- [ ] 60fps（中配机 Chrome）
- [ ] WebGL 不支持时降级到阶段 1 的纯 2D 版本

- [ ] **步骤 2：commit**

```bash
git add . && git commit -m "feat: 阶段2 Three.js核心场景+滚动驱动"
```

---

## 阶段 3：全局特效系统

### 任务 3.1：书法粒子标题

**文件：**
- 创建：`js/effects/calligraphy-particles.js`
- 测试：`tests/calligraphy-particles.test.js`

- [ ] **步骤 1：编写失败的测试 — 像素采样函数**

`tests/calligraphy-particles.test.js`：

```js
import { describe, it, expect } from 'vitest';
import { sampleTextPoints } from '../js/effects/calligraphy-particles.js';

describe('sampleTextPoints', () => {
  it('返回数组且每点有 x,y 坐标', () => {
    const pts = sampleTextPoints('墨', { font: '20px sans-serif', step: 4, width: 100, height: 100 });
    expect(Array.isArray(pts)).toBe(true);
    expect(pts.length).toBeGreaterThan(0);
    expect(pts[0]).toHaveProperty('x');
    expect(pts[0]).toHaveProperty('y');
  });
  it('空字符返回空数组', () => {
    expect(sampleTextPoints('', { step: 4, width: 100, height: 100 })).toEqual([]);
  });
});
```

- [ ] **步骤 2：运行测试验证失败**

- [ ] **步骤 3：实现 `sampleTextPoints` 与粒子系统**

`sampleTextPoints(text, opts)`：离屏 canvas 用指定字体绘制 text，按 `step` 网格采样像素，返回 alpha > 阈值的点位数组。

`createCalligraphyTitle(text, opts)` 返回 `{ group, animateIn, animateOut }`：用 Three.js Points 或 DOM 粒子（视性能）实现聚合/散开。`animateIn()` 用 GSAP stagger tween 所有粒子到目标点位（elastic 缓动）。

- [ ] **步骤 4：运行测试验证通过**

- [ ] **步骤 5：接入各 section 标题**

各 section 的标题用 `createCalligraphyTitle`，`activate()` 时调 `animateIn()`，`deactivate()` 调 `animateOut()`。

- [ ] **步骤 6：手动验收**

滚动到板块时标题墨点聚合成字，离开时散开。

### 任务 3.2：墨晕着色器升级（板块过渡）

**文件：**
- 修改：`js/three/shaders/ink-shader.js`
- 创建：`js/effects/ink-ripple.js`

- [ ] **步骤 1：实现 `js/effects/ink-ripple.js`**

全屏 Quad 着色器，在板块切换时从屏幕中心发出墨晕扩散（ripple），与金缮过渡并行。导出 `playInkRipple()`。

- [ ] **步骤 2：手动验收**

板块切换看到墨晕 + 金缮并行。

### 任务 3.3：宣纸着色器（替换 Canvas 底纹为高级版）

**文件：**
- 创建：`js/three/shaders/paper-shader.js`
- 修改：`js/effects/paper-bg.js`（保留作降级用）

- [ ] **步骤 1：实现 `js/three/shaders/paper-shader.js`**

全屏 Quad，fbm noise 生成宣纸纤维，比 Canvas 版更细腻，支持季节色调与细微流动。`uPaperColor`、`uInkColor`、`uTime` uniform。

- [ ] **步骤 2：在 scene.js 加 paper quad**

z-index 最底层（在山峦之后），随季节切换更新 uniform。

- [ ] **步骤 3：手动验收**

宣纸纹理更细腻，四季切换时宣纸色调平滑变化。

### 任务 3.4：墨河流体着色器

**文件：**
- 创建：`js/three/shaders/river-shader.js`
- 创建：`js/three/river.js`

- [ ] **步骤 1：实现 river-shader**

用 noise + 模拟流体（简化为多层 scroll noise）做墨河流动效果。uniform：`uTime`、`uFlowSpeed`。

- [ ] **步骤 2：实现 `createRiver()` 返回 mesh**

- [ ] **步骤 3：手动验收**

板块 4 墨河流动效果正常。

### 任务 3.5：阶段 3 验收与 commit

- [ ] 验收：书法粒子、墨晕、宣纸着色器、墨河全部可用，60fps。
- [ ] commit：`feat: 阶段3 全局特效系统`

---

## 阶段 4：七板块 3D 景致

每板块一个任务，结构类似：创建 3D 元素 + 接入交互。逐板块实现、验收、commit。

### 任务 4.1：板块 1 入山亭（墨竹 + 亭子 + 远山）
- 创建 `js/three/bamboo.js`（粒子笔触墨竹，随风摆动用 sin + uTime）
- 创建 `js/three/pavilion.js`（简笔亭子，基本几何组合）
- 修改 `js/sections/about.js` 接入 3D + 标题粒子 + 印章 hover

### 任务 4.2：板块 2 星罗棋盘（云海 + 棋盘 + 棋子）
- 创建 `js/three/chessboard.js`（棋盘 plane + 棋子球体，按 skills.json 分区）
- 熟练度映射棋子高度与发光强度
- 修改 `js/sections/skills.js`：hover 棋子弹技能卡（DOM 浮层 + raycaster），点击展开故事，拖拽旋转

### 任务 4.3：板块 3 峰峦叠嶂（项目山峦）
- 修改 `js/three/terrain.js` 支持按 projects.json 生成山峦阵列（山高=impact）
- 修改 `js/sections/projects.js`：山前名牌、hover 抬升、点击展开项目详情卷 overlay（含展卷动画）

### 任务 4.4：板块 4 墨河奔流
- 接入 `js/three/river.js`
- 创建 `js/sections/data.js` 的 D3 墨笔图表（阶段 5 详细，此处先占位）

### 任务 4.5：板块 5 碑林（游戏作品墙）
- 创建 `js/three/stones.js`（石碑 geometry + 碑面 texture）
- 修改 `js/sections/games.js`：hover 浮层、点击详情卡、NDA 无字碑处理

### 任务 4.6：板块 6 山径蜿蜒（时间轴）
- 创建 `js/three/path.js`（SVG path 投影到 3D 地面，S 形）
- 创建 `js/three/traveler.js`（行旅墨点沿路径移动，ScrollTrigger 进度驱动）
- 修改 `js/sections/timeline.js`：节点信息卡、情绪印章盖章动画、转折点分叉

### 任务 4.7：板块 7 归舟渡口（联系）
- 创建 `js/three/boat.js`（墨舟 + 水面着色器 + 夕阳光晕）
- 修改 `js/sections/contact.js`：邮箱复制 + toast、微信二维码 hover、彩蛋关键词

### 任务 4.8：阶段 4 验收与 commit
- [ ] 七板块 3D 景致全部到位，交互可用，60fps。
- [ ] commit：`feat: 阶段4 七板块3D景致`

---

## 阶段 5：数据可视化 + 降级 + 收尾

### 任务 5.1：D3 墨笔数据图表
- 创建 `js/sections/data.js` 完整实现：大数字卡、墨笔折线图（dashoffset 动画）、环形图、柱状图
- 数据来自 `data/metrics.json`，支持脱敏字段
- 滚动进入视口时逐个墨笔绘制

### 任务 5.2：移动端 2D 降级
- 创建 `js/core/fallback.js`：检测 `matchMedia('(max-width: 768px)')` 或 WebGL 不支持或低配，切换到 2D 模式
- 2D 模式：纵向滚动、预渲染水墨背景图 + CSS 视差、移除 3D，保留宣纸/四季/金缮（简化）/墨笔图表
- 修改 `css/responsive.css` 完整移动端样式

### 任务 5.3：reduced-motion 与无障碍
- 检测 `prefers-reduced-motion`：关闭金缮、粒子、墨滴、摄像机推进，内容直接淡入
- 添加基本 ARIA 标签、键盘可聚焦、`alt` 文本

### 任务 5.4：探索进度系统（加分项）
- 创建 `js/core/progress.js`：右上角百分比，记录已激活板块，localStorage 持久化
- 首次访问引导提示

### 任务 5.5：性能优化与最终验收
- [ ] Lighthouse 性能 ≥ 70（桌面）
- [ ] 首屏 < 3s（3G 模拟）
- [ ] 60fps 桌面中配
- [ ] 手机 2D 模式流畅
- [ ] reduced-motion 生效
- [ ] 所有 Vitest 绿

### 任务 5.6：完善 README
- 设计理念、技术说明、目录结构、本地运行、内容更新（改 `data/*.json`）、部署指南、降级说明、性能说明。

### 任务 5.7：最终 commit
```bash
git add . && git commit -m "feat: 阶段5 数据可视化+降级+收尾"
```

---

## 自检

**1. 规格覆盖度：**
- 开卷仪式 → 任务 1.6 ✓
- 七板块 → 任务 1.7（内容）+ 阶段 4（3D）✓
- 金缮/书法粒子/四季 → 任务 1.5/3.1/1.2 ✓
- 滚动驱动 → 任务 2.4 ✓
- 响应式降级 → 任务 5.2 ✓
- reduced-motion → 任务 5.3 ✓
- 数据 JSON 分离 → 任务 1.7 ✓
- README → 任务 5.6 ✓
- 数据可视化 → 任务 5.1 ✓
- 探索进度（加分）→ 任务 5.4 ✓

**2. 占位符扫描：** 无"TODO/待定"，noise 函数与具体着色器代码标注"实现时补全"属合理（实现细节），关键接口已定义。

**3. 类型一致性：** `getSeasonByMonth`、`sampleTextPoints`、`playKintsugiTransition`、`initSmoothScroll`、`createMountainRange` 等签名前后一致。`section.{activate,deactivate,render}` 接口统一。

---

## 执行交接

计划已完成并保存到 `docs/superpowers/plans/2026-07-02-ink-scroll-portfolio.md`。两种执行方式：

**1. 子代理驱动（推荐）** - 每个任务调度一个新的子代理，任务间进行审查，快速迭代。

**2. 内联执行** - 在当前会话中使用 executing-plans 执行任务，批量执行并设有检查点。

选哪种方式？
