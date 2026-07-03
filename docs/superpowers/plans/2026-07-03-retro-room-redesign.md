# 复古主题 R1 实现计划 —— 现实层房间 + Enter 穿越魔法

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 把当前复古主题（DOM 像素房间 + Win95 桌面）全部丢弃，重新实现为沉浸式 3D 叙事体验的开端——访客进入房间、坐到电脑前、按 Enter、被吸进屏幕，最终落到"世界生成中…"占位。

**架构：** 保留 `ThemeManager` / `theme-registry` / `data-loader` / `data-schema` 骨架；重写 `js/themes/retro/**` 为 Three.js 场景 + GSAP 运镜 + 自定义着色器屏幕；`init(ctx)` 做容器/样式/隐藏 ink shell，`boot(ctx)` 编排 ROOM→DESK→ENTER→BOOT_SEQ→DIVE→PLACEHOLDER 全流程。

**技术栈：** vanilla JS + Three.js 0.160（CDN，已引入）+ GSAP 3.12（CDN，已引入）+ Vitest（jsdom）。不引入 Vue。GLB 用 DRACOLoader 解码。后处理用 UnrealBloom。屏幕内容用自定义 ShaderMaterial（传统 GLSL，非 TSL）。

**规格依据：** `docs/superpowers/specs/2026-07-03-retro-room-redesign-design.md`

**关键约束：**
- Three.js / GSAP 通过 CDN 全局变量 `window.THREE` / `window.gsap` 访问（见 index.html 第 72-74 行），ES module 内用 `const THREE = window.THREE; const gsap = window.gsap;`
- `ThemeManager.start()` 调用顺序是 `init(ctx)` → `boot(ctx)`
- vitest 运行：`npx vitest run`（jsdom 环境，globals true）
- PowerShell 不支持 `&&`，commit 命令用 `;` 分隔
- 切换主题是整页重载（`ThemeManager.switchTo` 已实现）

---

## 文件结构（本计划将创建/修改/删除）

| 路径 | 操作 | 职责 |
|------|------|------|
| `js/themes/retro/index.js` | 重写 | 主题入口：init/boot/destroy lifecycle |
| `js/themes/retro/state-machine.js` | 创建 | 场景状态机（纯函数，TDD） |
| `js/themes/retro/room/room-scene.js` | 创建 | Three.js 场景/renderer/camera/后处理 |
| `js/themes/retro/room/room-camera.js` | 创建 | 相机关键帧插值 + 鼠标映射（纯函数 TDD） + 视角控制（DOM 交互） |
| `js/themes/retro/room/room-lights.js` | 创建 | 清新自然风灯光 |
| `js/themes/retro/room/room-props.js` | 创建 | 摆件加载 + 射线点击彩蛋 |
| `js/themes/retro/monitor/monitor-screen.js` | 创建 | 屏幕 Mesh + ShaderMaterial + 阶段切换 |
| `js/themes/retro/monitor/shaders/*.glsl.js` | 创建 | 5 阶段 GLSL 片段 |
| `js/themes/retro/monitor/logo-texture.js` | 创建 | Canvas 程序化生成像素 LOGO 纹理 |
| `js/themes/retro/transitions/dive-animation.js` | 创建 | 相机 dive + Bloom 过曝 timeline |
| `js/themes/retro/transitions/white-flash.js` | 创建 | 全屏白闪叠层 |
| `js/themes/retro/audio/sound.js` | 创建 | WebAudio 合成音效 |
| `js/themes/retro/ui/hint-overlay.js` | 创建 | 底部提示文字 |
| `js/themes/retro/ui/placeholder-screen.js` | 创建 | "世界生成中…"占位 |
| `js/themes/retro/boot.js` | 创建 | 编排 state-machine 驱动各阶段串联 |
| `css/themes/retro/retro-root.css` | 创建 | #retro-root 容器布局 |
| `css/themes/retro/hint-overlay.css` | 创建 | 提示文字样式 |
| `css/themes/retro/placeholder.css` | 创建 | 占位画面样式 |
| `data/themes/retro/boot-config.json` | 创建 | 启动序列可配字段 |
| `js/core/data-schema.js` | 修改 | 新增 `validateBootConfig` |
| `js/core/data-loader.js` | 修改 | retro 加载 `bootConfig` |
| `admin/config.yml` | 修改 | 新增【复古】启动配置 collection |
| `tests/themes/retro/state-machine.test.js` | 创建 | 状态机单测 |
| `tests/themes/retro/room-camera.test.js` | 创建 | 相机数学单测 |
| `tests/themes/retro/boot-config.test.js` | 创建 | boot-config 校验单测 |

**删除（R1 不重建，R2/R3 按需重做）：**
- `js/themes/retro/room-dom.js`
- `js/themes/retro/desktop.js`
- `js/themes/retro/window-manager.js`
- `js/themes/retro/sections/*.js`（about/contact/games/metrics/projects/skills/timeline-window.js）
- `js/themes/retro/screensaver.js`
- `js/themes/retro/ending.js`
- `js/themes/retro/exploration.js`
- `js/themes/retro/sound.js`（重写为 `audio/sound.js`）
- `js/themes/retro/boot.js`（旧 DOM 开场，重写为新编排）
- `css/themes/retro/room.css`、`desktop.css`、`extras.css`、`crt.css`

**保留：** `data/themes/retro/room-props/*.json`（现有摆件数据沿用）、`data/themes/retro/profile.json` 等（CMS 内容沿用）。

---

## 任务 1：清理旧 retro 实现 + 创建目录骨架

**文件：**
- 删除：上述"删除"清单中的所有文件
- 创建：`js/themes/retro/` 下的 `room/`、`monitor/shaders/`、`transitions/`、`audio/`、`ui/` 空目录（通过创建首个文件自动生成）

- [ ] **步骤 1：删除旧 retro JS**

```powershell
Remove-Item -Force js/themes/retro/room-dom.js, js/themes/retro/desktop.js, js/themes/retro/window-manager.js, js/themes/retro/screensaver.js, js/themes/retro/ending.js, js/themes/retro/exploration.js, js/themes/retro/sound.js, js/themes/retro/boot.js
Remove-Item -Recurse -Force js/themes/retro/sections
```

- [ ] **步骤 2：删除旧 retro CSS**

```powershell
Remove-Item -Force css/themes/retro/room.css, css/themes/retro/desktop.css, css/themes/retro/extras.css, css/themes/retro/crt.css
```

- [ ] **步骤 3：删除针对旧 retro 的测试**

```powershell
Remove-Item -Force tests/core/retro-exploration.test.js, tests/core/retro-windows.test.js
```

- [ ] **步骤 4：运行剩余测试确认未破坏核心**

运行：`npx vitest run`
预期：除被删测试外，其余 PASS（`theme-manager.test.js`、`data-loader-theme.test.js`、`data-schema.test.js` 等仍通过）

- [ ] **步骤 5：Commit**

```powershell
git add -A; git commit -m "chore(retro): 清理旧 DOM 像素房间与 Win95 桌面实现"
```

---

## 任务 2：boot-config 数据层（TDD）

**文件：**
- 创建：`data/themes/retro/boot-config.json`
- 修改：`js/core/data-schema.js`（新增 `validateBootConfig`）
- 修改：`js/core/data-loader.js`（retro 加载 `bootConfig`）
- 创建：`tests/themes/retro/boot-config.test.js`

- [ ] **步骤 1：编写失败的测试**

`tests/themes/retro/boot-config.test.js`：

```javascript
import { describe, it, expect } from 'vitest';
import { validateBootConfig } from '../../js/core/data-schema.js';

const valid = {
  pageTitle: '我的一生 · 复古电脑',
  logoText: '我的一生',
  accentColor: '#7DD3C0',
  bgColor: '#0a2a25',
  loadingText: 'LOADING...',
  placeholder: { title: '世界生成中', subtitle: '记忆正在汇集成岛屿...', returnLabel: '返回房间' },
  hints: { room: '点击任意位置继续...', desk: '按 Enter 启动...', deskMobile: '点击屏幕启动...' },
  durations: { roomToDesk: 3000, bootSeq: 2000, dive: 1500 },
};

describe('validateBootConfig', () => {
  it('合法配置通过', () => {
    expect(validateBootConfig(valid)).toBe(true);
  });
  it('非对象返回 false', () => {
    expect(validateBootConfig(null)).toBe(false);
    expect(validateBootConfig('x')).toBe(false);
  });
  it('缺少 logoText 返回 false', () => {
    const { logoText, ...rest } = valid;
    expect(validateBootConfig(rest)).toBe(false);
  });
  it('accentColor 非 hex 返回 false', () => {
    expect(validateBootConfig({ ...valid, accentColor: 'red' })).toBe(false);
    expect(validateBootConfig({ ...valid, accentColor: '#123' })).toBe(false);
  });
  it('durations 超范围返回 false', () => {
    expect(validateBootConfig({ ...valid, durations: { ...valid.durations, roomToDesk: 50 } })).toBe(false);
    expect(validateBootConfig({ ...valid, durations: { ...valid.durations, dive: 99999 } })).toBe(false);
  });
  it('placeholder 缺少 title 返回 false', () => {
    expect(validateBootConfig({ ...valid, placeholder: { ...valid.placeholder, title: '' } })).toBe(false);
  });
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npx vitest run tests/themes/retro/boot-config.test.js`
预期：FAIL，`validateBootConfig` 未导出

- [ ] **步骤 3：实现 validateBootConfig**

在 `js/core/data-schema.js` 末尾追加：

```javascript
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/**
 * @param {any} c
 * @returns {boolean}
 */
export function validateBootConfig(c) {
  if (!is.obj(c)) return false;
  if (!is.str(c.logoText) || !c.logoText) return false;
  if (!is.str(c.accentColor) || !HEX_RE.test(c.accentColor)) return false;
  if (!is.str(c.bgColor) || !HEX_RE.test(c.bgColor)) return false;
  if (!is.str(c.loadingText)) return false;
  if ('pageTitle' in c && !is.str(c.pageTitle)) return false;
  if (!is.obj(c.placeholder)) return false;
  if (!is.str(c.placeholder.title) || !c.placeholder.title) return false;
  if (!is.str(c.placeholder.subtitle)) return false;
  if (!is.str(c.placeholder.returnLabel)) return false;
  if (!is.obj(c.hints)) return false;
  if (!is.str(c.hints.room) || !is.str(c.hints.desk) || !is.str(c.hints.deskMobile)) return false;
  if (!is.obj(c.durations)) return false;
  const d = c.durations;
  if (!is.num(d.roomToDesk) || d.roomToDesk < 100 || d.roomToDesk > 10000) return false;
  if (!is.num(d.bootSeq) || d.bootSeq < 100 || d.bootSeq > 10000) return false;
  if (!is.num(d.dive) || d.dive < 100 || d.dive > 10000) return false;
  return true;
}
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npx vitest run tests/themes/retro/boot-config.test.js`
预期：PASS

- [ ] **步骤 5：创建 boot-config.json**

`data/themes/retro/boot-config.json`：

```json
{
  "pageTitle": "我的一生 · 复古电脑",
  "logoText": "我的一生",
  "accentColor": "#7DD3C0",
  "bgColor": "#0a2a25",
  "loadingText": "LOADING...",
  "placeholder": {
    "title": "世界生成中",
    "subtitle": "记忆正在汇集成岛屿...",
    "returnLabel": "返回房间"
  },
  "hints": {
    "room": "点击任意位置继续...",
    "desk": "按 Enter 启动...",
    "deskMobile": "点击屏幕启动..."
  },
  "durations": {
    "roomToDesk": 3000,
    "bootSeq": 2000,
    "dive": 1500
  }
}
```

- [ ] **步骤 6：扩展 data-loader**

修改 `js/core/data-loader.js`：
- 在 `FALLBACK` 末尾加 `bootConfig: { logoText: '我的一生', accentColor: '#7DD3C0', bgColor: '#0a2a25', loadingText: 'LOADING...', placeholder: { title: '世界生成中', subtitle: '...', returnLabel: '返回房间' }, hints: { room: '点击继续', desk: '按 Enter', deskMobile: '点击启动' }, durations: { roomToDesk: 3000, bootSeq: 2000, dive: 1500 } }`
- 在 import 行加入 `validateBootConfig`
- 在 `loadAllData` 的 retro 分支：`results` 末尾追加 `load('boot-config', validateBootConfig, themeId)`，并 `payload.bootConfig = results[8]`
- 注意 `load('boot-config', ...)` 会请求 `data/themes/retro/boot-config.json`，与现有 `load()` 逻辑兼容（`name` 参数支持任意文件名）

完整 retro 分支改造：

```javascript
const results = themeId === 'retro'
  ? await Promise.all([...baseLoaders, loadDir('room-props', validateRoomProps, themeId), load('boot-config', validateBootConfig, themeId)])
  : await Promise.all(baseLoaders);

const [profile, skills, projects, metrics, games, timeline, contact] = results;
const payload = { profile, skills, projects, metrics, games, timeline, contact };

if (themeId === 'retro') {
  payload.roomProps = results[7] || [];
  payload.bootConfig = results[8] || FALLBACK.bootConfig;
}
```

- [ ] **步骤 7：运行全量测试**

运行：`npx vitest run`
预期：全 PASS

- [ ] **步骤 8：Commit**

```powershell
git add data/themes/retro/boot-config.json js/core/data-schema.js js/core/data-loader.js tests/themes/retro/boot-config.test.js; git commit -m "feat(retro): boot-config 数据层与校验"
```

---

## 任务 3：场景状态机（TDD）

**文件：**
- 创建：`js/themes/retro/state-machine.js`
- 创建：`tests/themes/retro/state-machine.test.js`

- [ ] **步骤 1：编写失败的测试**

`tests/themes/retro/state-machine.test.js`：

```javascript
import { describe, it, expect } from 'vitest';
import { STATES, canTransition, nextBootState, skipTarget } from '../../js/themes/retro/state-machine.js';

describe('canTransition', () => {
  it('ROOM→DESK 合法', () => {
    expect(canTransition('ROOM', 'DESK')).toBe(true);
  });
  it('完整 boot 链合法', () => {
    expect(canTransition('ROOM', 'DESK')).toBe(true);
    expect(canTransition('DESK', 'ENTER')).toBe(true);
    expect(canTransition('ENTER', 'BOOT_SEQ')).toBe(true);
    expect(canTransition('BOOT_SEQ', 'DIVE')).toBe(true);
    expect(canTransition('DIVE', 'PLACEHOLDER')).toBe(true);
  });
  it('ROOM→DIVE 非法（跳步）', () => {
    expect(canTransition('ROOM', 'DIVE')).toBe(false);
  });
  it('PLACEHOLDER→ROOM 合法（返回房间）', () => {
    expect(canTransition('PLACEHOLDER', 'ROOM')).toBe(true);
  });
});

describe('nextBootState', () => {
  it('ROOM 的下一个是 DESK', () => {
    expect(nextBootState('ROOM')).toBe('DESK');
  });
  it('PLACEHOLDER 没有下一个（返回 null）', () => {
    expect(nextBootState('PLACEHOLDER')).toBe(null);
  });
});

describe('skipTarget', () => {
  it('任意状态跳过都到 PLACEHOLDER', () => {
    for (const s of ['ROOM', 'DESK', 'ENTER', 'BOOT_SEQ', 'DIVE']) {
      expect(skipTarget(s)).toBe('PLACEHOLDER');
    }
  });
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npx vitest run tests/themes/retro/state-machine.test.js`
预期：FAIL，模块不存在

- [ ] **步骤 3：实现 state-machine.js**

`js/themes/retro/state-machine.js`：

```javascript
export const STATES = {
  ROOM: 'ROOM',
  DESK: 'DESK',
  ENTER: 'ENTER',
  BOOT_SEQ: 'BOOT_SEQ',
  DIVE: 'DIVE',
  PLACEHOLDER: 'PLACEHOLDER',
};

const BOOT_ORDER = ['ROOM', 'DESK', 'ENTER', 'BOOT_SEQ', 'DIVE', 'PLACEHOLDER'];

const TRANSITIONS = new Map([
  ['ROOM', ['DESK']],
  ['DESK', ['ENTER']],
  ['ENTER', ['BOOT_SEQ']],
  ['BOOT_SEQ', ['DIVE']],
  ['DIVE', ['PLACEHOLDER']],
  ['PLACEHOLDER', ['ROOM']],
]);

export function canTransition(from, to) {
  const allowed = TRANSITIONS.get(from);
  return allowed ? allowed.includes(to) : false;
}

export function nextBootState(current) {
  const idx = BOOT_ORDER.indexOf(current);
  if (idx < 0 || idx >= BOOT_ORDER.length - 1) return null;
  return BOOT_ORDER[idx + 1];
}

export function skipTarget() {
  return 'PLACEHOLDER';
}
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npx vitest run tests/themes/retro/state-machine.test.js`
预期：PASS

- [ ] **步骤 5：Commit**

```powershell
git add js/themes/retro/state-machine.js tests/themes/retro/state-machine.test.js; git commit -m "feat(retro): 场景状态机"
```

---

## 任务 4：相机关键帧数学（TDD）

**文件：**
- 创建：`js/themes/retro/room/room-camera.js`（先只导出纯函数，DOM 交互在任务 12 加）
- 创建：`tests/themes/retro/room-camera.test.js`

- [ ] **步骤 1：编写失败的测试**

`tests/themes/retro/room-camera.test.js`：

```javascript
import { describe, it, expect } from 'vitest';
import { CAMERA_KEYS, lerpKey, mapPointer, clamp } from '../../js/themes/retro/room/room-camera.js';

describe('CAMERA_KEYS', () => {
  it('包含 5 个关键帧', () => {
    expect(CAMERA_KEYS.room).toBeDefined();
    expect(CAMERA_KEYS.desk).toBeDefined();
    expect(CAMERA_KEYS.enter).toBeDefined();
    expect(CAMERA_KEYS.diveStart).toBeDefined();
    expect(CAMERA_KEYS.diveEnd).toBeDefined();
  });
  it('每帧有 pos/look/fov', () => {
    for (const k of Object.values(CAMERA_KEYS)) {
      expect(k.pos).toHaveLength(3);
      expect(k.look).toHaveLength(3);
      expect(typeof k.fov).toBe('number');
    }
  });
});

describe('lerpKey', () => {
  it('t=0 返回起点', () => {
    const r = lerpKey(CAMERA_KEYS.room, CAMERA_KEYS.desk, 0);
    expect(r.pos).toEqual(CAMERA_KEYS.room.pos);
    expect(r.fov).toBe(CAMERA_KEYS.room.fov);
  });
  it('t=1 返回终点', () => {
    const r = lerpKey(CAMERA_KEYS.room, CAMERA_KEYS.desk, 1);
    expect(r.pos).toEqual(CAMERA_KEYS.desk.pos);
  });
  it('t=0.5 返回中点', () => {
    const r = lerpKey(CAMERA_KEYS.room, CAMERA_KEYS.desk, 0.5);
    expect(r.pos[0]).toBeCloseTo((CAMERA_KEYS.room.pos[0] + CAMERA_KEYS.desk.pos[0]) / 2);
    expect(r.fov).toBeCloseTo((CAMERA_KEYS.room.fov + CAMERA_KEYS.desk.fov) / 2);
  });
});

describe('mapPointer', () => {
  it('中心 (0.5,0.5) 无偏移', () => {
    const [ox, oy] = mapPointer(0.5, 0.5);
    expect(ox).toBeCloseTo(0);
    expect(oy).toBeCloseTo(0);
  });
  it('右上角 (1,0) 映射到正边界', () => {
    const [ox, oy] = mapPointer(1, 0);
    expect(ox).toBeCloseTo(0.15);
    expect(oy).toBeCloseTo(0.08);
  });
  it('超出范围被 clamp', () => {
    const [ox, oy] = mapPointer(2, -1);
    expect(ox).toBeCloseTo(0.15);
    expect(oy).toBeCloseTo(-0.08);
  });
});

describe('clamp', () => {
  it('低于下限取下限', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });
  it('高于上限取上限', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npx vitest run tests/themes/retro/room-camera.test.js`
预期：FAIL，模块不存在

- [ ] **步骤 3：实现 room-camera.js 纯函数部分**

`js/themes/retro/room/room-camera.js`：

```javascript
export const CAMERA_KEYS = {
  room:      { pos: [0, 1.6, 3.8],  look: [0, 1.2, 0],  fov: 55 },
  desk:      { pos: [0, 1.25, 1.2], look: [0, 1.05, 0], fov: 50 },
  enter:     { pos: [0, 1.2, 0.95], look: [0, 1.05, 0], fov: 45 },
  diveStart: { pos: [0, 1.15, 0.6], look: [0, 1.05, 0], fov: 40 },
  diveEnd:   { pos: [0, 1.08, 0.15],look: [0, 1.05, 0], fov: 90 },
};

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function lerpKey(from, to, t) {
  return {
    pos: [lerp(from.pos[0], to.pos[0], t), lerp(from.pos[1], to.pos[1], t), lerp(from.pos[2], to.pos[2], t)],
    look: [lerp(from.look[0], to.look[0], t), lerp(from.look[1], to.look[1], t), lerp(from.look[2], to.look[2], t)],
    fov: lerp(from.fov, to.fov, t),
  };
}

// 鼠标坐标 [0,1] → look 偏移，范围 offsetX ∈ [-0.15,0.15], offsetY ∈ [-0.08,0.08]
// 注意：屏幕 Y 向下，所以 pointerY=0（顶部）映射到 +0.08（向上看）
export function mapPointer(px, py) {
  const ox = clamp((px - 0.5) * 0.3, -0.15, 0.15);
  const oy = clamp((0.5 - py) * 0.16, -0.08, 0.08);
  return [ox, oy];
}
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npx vitest run tests/themes/retro/room-camera.test.js`
预期：PASS

- [ ] **步骤 5：Commit**

```powershell
git add js/themes/retro/room/room-camera.js tests/themes/retro/room-camera.test.js; git commit -m "feat(retro): 相机关键帧与鼠标映射纯函数"
```

---

## 任务 5：retro 主题 lifecycle 骨架

**文件：**
- 创建：`js/themes/retro/index.js`（重写）
- 创建：`css/themes/retro/retro-root.css`

- [ ] **步骤 1：实现 index.js 骨架**

`js/themes/retro/index.js`（先写骨架，boot 编排在任务 16 完成）：

```javascript
import { STATES } from './state-machine.js';

export const id = 'retro';

let root = null;
let sceneCtx = null; // Three.js 场景上下文，任务 6 填充

export async function init(ctx) {
  hideInkShell();
  loadRetroStyles();

  const cfg = ctx.data.bootConfig || {};
  document.title = cfg.pageTitle || '我的一生 · 复古电脑';

  root = ensureRoot();
  root.innerHTML = `
    <div id="retro-loading" class="retro-loading">准备进入房间...</div>
    <canvas id="retro-canvas" class="retro-canvas"></canvas>
    <div id="retro-hint" class="retro-hint" aria-live="polite"></div>
    <div id="retro-white-flash" class="retro-white-flash"></div>
    <div id="retro-placeholder" class="retro-placeholder" hidden></div>
    <button id="retro-skip" class="retro-skip" type="button" aria-label="跳过开场">跳过</button>
  `;
  document.body.classList.remove('theme-ink-active');
  document.body.classList.add('theme-retro-active');
}

export async function boot(ctx) {
  // 任务 16 填充完整编排
  // 当前骨架：仅占位，确保生命周期不报错
  const loading = root?.querySelector('#retro-loading');
  if (loading) loading.textContent = '房间场景加载中...（待实现）';
}

export async function destroy() {
  sceneCtx?.dispose?.();
  sceneCtx = null;
  root?.remove();
  root = null;
  document.body.classList.remove('theme-retro-active');
  document.body.classList.add('theme-ink-active');
}

function ensureRoot() {
  let el = document.getElementById('retro-root');
  if (!el) {
    el = document.createElement('div');
    el.id = 'retro-root';
    el.className = 'retro-root';
    document.body.appendChild(el);
  }
  return el;
}

function hideInkShell() {
  ['paper-bg', 'three-canvas', 'loading-screen', 'scroll-container',
   'kintsugi-overlay', 'ink-ripple-overlay', 'season-switcher', 'explore-progress',
   'project-detail-overlay'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function loadRetroStyles() {
  ['css/themes/retro/retro-root.css', 'css/themes/retro/hint-overlay.css', 'css/themes/retro/placeholder.css'].forEach((href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  });
}
```

- [ ] **步骤 2：实现 retro-root.css**

`css/themes/retro/retro-root.css`：

```css
.retro-root {
  position: fixed;
  inset: 0;
  background: #0a2a25;
  overflow: hidden;
  z-index: 10;
}

.retro-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.retro-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #7DD3C0;
  font-family: 'VT323', 'Press Start 2P', monospace;
  font-size: 1.5rem;
  letter-spacing: 0.1em;
  z-index: 20;
}

.retro-white-flash {
  position: absolute;
  inset: 0;
  background: #fff;
  opacity: 0;
  pointer-events: none;
  z-index: 30;
}

.retro-skip {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 40;
  padding: 0.4rem 0.8rem;
  background: rgba(10, 42, 37, 0.7);
  color: #7DD3C0;
  border: 1px solid #7DD3C0;
  font-family: 'VT323', monospace;
  font-size: 1rem;
  cursor: pointer;
}
.retro-skip:hover { background: rgba(125, 211, 192, 0.2); }
.retro-skip:focus-visible { outline: 2px solid #7DD3C0; outline-offset: 2px; }
```

- [ ] **步骤 3：创建 hint-overlay.css 和 placeholder.css 占位文件**

`css/themes/retro/hint-overlay.css`：

```css
.retro-hint {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-family: 'VT323', 'Press Start 2P', monospace;
  font-size: 1.25rem;
  letter-spacing: 0.08em;
  z-index: 25;
  text-align: center;
  pointer-events: none;
  animation: retro-hint-breath 2.4s ease-in-out infinite;
}
@keyframes retro-hint-breath {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.9; }
}
```

`css/themes/retro/placeholder.css`：

```css
.retro-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  background: #0a2a25;
  color: #7DD3C0;
  font-family: 'VT323', monospace;
  z-index: 35;
}
.retro-placeholder[hidden] { display: none; }
.retro-placeholder__title { font-size: 2.5rem; letter-spacing: 0.1em; }
.retro-placeholder__bar {
  width: 18rem;
  height: 0.8rem;
  border: 1px solid #7DD3C0;
  background: rgba(125, 211, 192, 0.15);
  overflow: hidden;
}
.retro-placeholder__bar-fill {
  height: 100%;
  width: 0%;
  background: #7DD3C0;
  transition: width 0.3s linear;
}
.retro-placeholder__subtitle { font-size: 1.1rem; opacity: 0.8; }
.retro-placeholder__return {
  margin-top: 1rem;
  padding: 0.5rem 1.2rem;
  background: transparent;
  color: #7DD3C0;
  border: 1px solid #7DD3C0;
  font-family: inherit;
  font-size: 1.1rem;
  cursor: pointer;
}
.retro-placeholder__return:hover { background: rgba(125, 211, 192, 0.2); }
```

- [ ] **步骤 4：手动验证生命周期**

```powershell
npx serve .
```
打开 `http://localhost:3000/?theme=retro`，确认：页面显示"房间场景加载中...（待实现）"+ 跳过按钮 + 空白画布；切回 `?theme=ink` 水墨正常。

- [ ] **步骤 5：运行全量测试**

运行：`npx vitest run`
预期：全 PASS

- [ ] **步骤 6：Commit**

```powershell
git add js/themes/retro/index.js css/themes/retro/; git commit -m "feat(retro): 主题 lifecycle 骨架与样式"
```

---

## 任务 6：Three.js 场景与后处理

**文件：**
- 创建：`js/themes/retro/room/room-scene.js`

**实现要点：**
- 导出 `createRoomScene(canvas, opts)` 返回 `{ scene, camera, renderer, bloomPass, composer, dispose, render }`
- `renderer = new THREE.WebGLRenderer({ canvas, antialias: true })`，`setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2))`，`toneMapping = ACESFilmicToneMapping`，`toneMappingExposure = 1.1`
- `scene.fog = new THREE.Fog(0x0a2a25, 5, 15)`（青绿雾）
- `camera = new THREE.PerspectiveCamera(55, w/h, 0.1, 100)`，初始位置 `CAMERA_KEYS.room.pos`
- 后处理：`EffectComposer` + `RenderPass` + `UnrealBloomPass(new THREE.Vector2(w, h), 0.4, 0.6, 0.85)`
- `render()` 调 `composer.render()`
- `dispose()` 释放 renderer / composer / 几何 / 材质
- **故障降级**：`try { new THREE.WebGLRenderer(...) } catch { throw new Error('NO_WEBGL') }`，由 `index.js` 捕获后切回 ink
- `resize(w, h)` 方法同步 camera aspect / renderer / composer

**关键代码骨架：**

```javascript
const THREE = window.THREE;

export function createRoomScene(canvas, { isMobile = false } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile });
  } catch (e) {
    throw new Error('NO_WEBGL');
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a2a25);
  scene.fog = new THREE.Fog(0x0a2a25, 5, 15);

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 1.6, 3.8);

  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));
  const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(1, 1), 0.4, 0.6, 0.85);
  composer.addPass(bloomPass);

  function resize(w, h) {
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize(window.innerWidth, window.innerHeight);

  function render() { composer.render(); }

  function dispose() {
    scene.traverse((o) => {
      o.geometry?.dispose?.();
      if (o.material) {
        Array.isArray(o.material) ? o.material.forEach((m) => m.dispose()) : o.material.dispose();
      }
    });
    composer.dispose();
    renderer.dispose();
  }

  return { scene, camera, renderer, bloomPass, composer, resize, render, dispose };
}
```

**注意事项：**
- `EffectComposer` / `UnrealBloomPass` 需要 `examples/jsm` 路径。Three.js 0.160 CDN（`three.min.js`）**不包含**这些。需要额外引入 `three/examples/jsm/postprocessing/EffectComposer.js` 等，或改用全局 UMD。
- **降级方案**：若 CDN 不便引入后处理模块，则 P1 先用 `renderer.outputColorSpace` + 手写全屏白闪 DOM 叠层模拟 Bloom 过曝效果（dive 阶段用 DOM 白闪 + `renderer.toneMappingExposure` 拉高），后续再补真正的 UnrealBloomPass。在任务 16 编排时根据 `window.THREE.EffectComposer` 是否存在做能力探测。

- [ ] **步骤 1：实现 room-scene.js（含 Bloom 能力探测）**

按上方骨架实现，加 `hasBloom = typeof THREE.EffectComposer === 'function'` 探测；无 Bloom 时 `render()` fallback 到 `renderer.render(scene, camera)`，并暴露 `setExposure(v)` 方法供 dive 阶段拉高曝光模拟过曝。

- [ ] **步骤 2：手动验证**

临时在 `index.js` 的 `boot` 里调用 `createRoomScene(canvas)`，确认画布显示青绿色空场景（雾色背景），无报错。

- [ ] **步骤 3：Commit**

```powershell
git add js/themes/retro/room/room-scene.js; git commit -m "feat(retro): Three.js 场景与后处理（含 Bloom 能力探测）"
```

---

## 任务 7：清新自然风灯光

**文件：**
- 创建：`js/themes/retro/room/room-lights.js`

**实现要点：**
- 导出 `addRoomLights(scene)` 返回 `dispose()` 函数
- 阳光 `DirectionalLight(0xfff4e0, 1.2)`，位置 `[-3, 4, 2]`，指向 `(0, 1, 0)`，`castShadow = false`（R1 不开阴影，性能）
- 环境光 `AmbientLight(0x88aacc, 0.4)`（天蓝填充）
- 台灯 `RectAreaLight(0xffcc88, 0.6, 1, 1)`，位置 `[0.3, 1.1, 0.8]`，指向桌面。**注意 `RectAreaLight` 需 `RectAreaLightUniformsLib.load()`**，若 CDN 不支持则 fallback 到 `PointLight(0xffcc88, 0.5, 3)`
- 体积光柱：`CylinderGeometry(0.3, 0.5, 4, 12, 1, true)` + `MeshBasicMaterial({ color: 0xfff4e0, transparent: true, opacity: 0.08, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })`，位置 `[-2, 2, 0]`，旋转匹配阳光方向

- [ ] **步骤 1：实现 room-lights.js**

按要点实现，`addRoomLights(scene)` 把所有灯光和体积光柱加到 scene，返回 `dispose()` 遍历释放。

- [ ] **步骤 2：手动验证**

在 room-scene 验证流程中调用 `addRoomLights(scene)`，确认场景有明亮层次（非纯黑）。

- [ ] **步骤 3：Commit**

```powershell
git add js/themes/retro/room/room-lights.js; git commit -m "feat(retro): 清新自然风灯光与体积光柱"
```

---

## 任务 8：GLB 加载与摆件彩蛋

**文件：**
- 创建：`public/assets/retro/room.glb`（占位 GLB，可用任意 CC0 简单房间模型，或用 BoxGeometry 程序化构造一个 `room-fallback.js`）
- 创建：`js/themes/retro/room/room-props.js`

**实现要点：**

**8.1 占位房间几何（GLB 未就绪时用）**

创建 `js/themes/retro/room/room-fallback.js`，用 `BoxGeometry` 程序化构造房间：地板、三面墙、书桌、显示器外壳、键盘占位、椅子、床、窗户（发光 plane）、海报。材质用 `MeshStandardMaterial` 纯色。显示器屏幕位置预留 `monitor_screen_anchor` 空对象 `Object3D`。Enter 键用单独 `mesh.name = 'key_Enter'`。摆件 anchor 用 `Object3D` 命名 `propDesk_1` 等。

**8.2 GLB 加载**

`room-scene` 增加 `loadRoomModel(url)` 函数：
```javascript
const loader = new THREE.GLTFLoader();
const draco = new THREE.DRACOLoader();
draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/');
loader.setDRACOLoader(draco);
loader.load(url, (gltf) => { scene.add(gltf.scene); ... }, onProgress, onError);
```
若 CDN 不含 `GLTFLoader`，从 `https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js` 动态 import。

**能力探测策略**：优先尝试加载 `room.glb`；404 或加载失败 → fallback 到 `room-fallback.js` 程序化构造。这样即使没有 GLB 资源也能跑通流程。

**8.3 摆件加载 `room-props.js`**

```javascript
export function loadRoomProps(scene, propsData, { onPropClick }) {
  const meshes = [];
  for (const prop of propsData) {
    const anchorName = `prop${cap(prop.position)}_${prop.index || (meshes.filter(m => m.userData.position === prop.position).length + 1)}`;
    const anchor = scene.getObjectByName(anchorName);
    if (!anchor) continue;
    const mesh = prop.image ? createImageProp(prop) : createBoxProp(prop);
    mesh.position.copy(anchor.position);
    mesh.userData = { ...prop, isProp: true };
    scene.add(mesh);
    meshes.push(mesh);
  }
  return { meshes, dispose: () => meshes.forEach((m) => { m.geometry?.dispose(); m.material?.dispose?.(); scene.remove(m); }) };
}
```

- `createImageProp`：`PlaneGeometry(0.15, 0.15)` + `TextureLoader` 加载 `prop.image` → `MeshBasicMaterial({ map })`
- `createBoxProp`：`BoxGeometry(0.08, 0.08, 0.08)` + `MeshStandardMaterial({ color: randomWarm() })`，加 `CanvasTexture` label sprite 显示 `propLabel`
- 点击处理在任务 12 的相机交互里用 `Raycaster` 检测 `mesh.userData.isProp`，触发 `onPropClick(prop)` → 弹出致敬卡片（HTML DOM，沿用旧 `showPropEasterCard` 视觉，青绿配色）

- [ ] **步骤 1：实现 room-fallback.js 程序化房间**

构造最小可跑通的房间几何，含 `monitor_screen_anchor`、`key_Enter`、3 个 `propDesk_*` anchor。

- [ ] **步骤 2：实现 room-props.js**

按要点实现 `loadRoomProps`。

- [ ] **步骤 3：手动验证**

在 room-scene 验证流程中加载 fallback 房间 + 摆件（用现有 `data/themes/retro/room-props/*.json` 数据），确认场景出现房间几何和摆件盒。

- [ ] **步骤 4：Commit**

```powershell
git add js/themes/retro/room/room-fallback.js js/themes/retro/room/room-props.js; git commit -m "feat(retro): 程序化占位房间与摆件加载"
```

---

## 任务 9：屏幕着色器框架与阶段切换

**文件：**
- 创建：`js/themes/retro/monitor/monitor-screen.js`
- 创建：`js/themes/retro/monitor/shaders/main.fragment.glsl.js`
- 创建：`js/themes/retro/monitor/shaders/main.vertex.glsl.js`

**实现要点：**

`monitor-screen.js` 导出 `createMonitorScreen(anchor, cfg)` 返回 `{ mesh, setPhase, setEmissive, dispose }`：
- `PlaneGeometry(0.5, 0.38)` 贴到 anchor 位置，朝向相机
- `ShaderMaterial({ uniforms, vertexShader, fragmentShader })`
- uniforms: `uTime`, `uPhase` (int), `uPhaseProgress` (float), `uEmissive` (float, 默认 1), `uLogoTex` (Texture, 默认空), `uAccentColor` (vec3 from cfg.accentColor), `uBgColor` (vec3 from cfg.bgColor), `uProgress` (float, 进度条用)
- `setPhase(phase, progress)` 更新 `uPhase` / `uPhaseProgress`
- `setEmissive(v)` 更新 `uEmissive`
- 每帧 `uTime` 由外部 render loop 更新（暴露 `update(dt)` 或由 `boot.js` 在 raf 里调）

`main.vertex.glsl.js`：标准变换：
```glsl
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

`main.fragment.glsl.js`：5 阶段分支骨架（具体 GLSL 在任务 10 填充）：
```glsl
uniform float uTime;
uniform int uPhase;
uniform float uPhaseProgress;
uniform float uEmissive;
uniform sampler2D uLogoTex;
uniform vec3 uAccentColor;
uniform vec3 uBgColor;
uniform float uProgress;
varying vec2 vUv;

// hash13 噪声函数（任务 10 实现）
float hash13(vec3 p) { /* ... */ }

void main() {
  vec3 color = uBgColor;
  if (uPhase == 0) { /* 静电，任务 10 */ }
  else if (uPhase == 1) { /* 雪花，任务 10 */ }
  else if (uPhase == 2) { /* LOGO，任务 10 */ }
  else if (uPhase == 3) { /* 进度条，任务 10 */ }
  else if (uPhase == 4) { color = vec3(uPhaseProgress); }
  gl_FragColor = vec4(color * uEmissive, 1.0);
}
```

- [ ] **步骤 1：实现 monitor-screen.js + 骨架着色器**

按要点实现，5 阶段先留 `color = uBgColor` 占位（任务 10 填充各阶段 GLSL）。

- [ ] **步骤 2：手动验证**

在房间场景中创建屏幕 mesh，调用 `setPhase(4, 1)` 确认屏幕变白。

- [ ] **步骤 3：Commit**

```powershell
git add js/themes/retro/monitor/; git commit -m "feat(retro): 显示器屏幕 ShaderMaterial 框架"
```

---

## 任务 10：着色器 5 阶段 GLSL 实现

**文件：**
- 修改：`js/themes/retro/monitor/shaders/main.fragment.glsl.js`

**实现要点：**

`hash13` 噪声函数：
```glsl
float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
```

**阶段 0 静电：**
```glsl
if (uPhase == 0) {
  float n = hash13(vec3(floor(vUv * 256.0), floor(uTime * 60.0)));
  color = vec3(n);
}
```

**阶段 1 雪花：**
```glsl
else if (uPhase == 1) {
  float snow = hash13(vec3(floor(vUv * 300.0), floor(uTime * 50.0))) * 0.6
             + hash13(vec3(floor(vUv * 800.0), floor(uTime * 80.0))) * 0.4;
  float scan = step(0.97, sin(vUv.y * 800.0));
  color = vec3(snow * 0.7) + vec3(scan * 0.3);
  color *= 0.5;
}
```

**阶段 2 LOGO 显现：**
```glsl
else if (uPhase == 2) {
  vec4 logo = texture2D(uLogoTex, vUv);
  float dist = distance(vUv, vec2(0.5));
  float mask = step(uPhaseProgress, dist);
  vec3 snow = vec3(hash13(vec3(floor(vUv * 200.0), floor(uTime * 40.0))) * 0.3);
  color = mix(snow + uBgColor, mix(uBgColor, logo.rgb * uAccentColor, logo.a), 1.0 - mask);
}
```

**阶段 3 进度条：**
```glsl
else if (uPhase == 3) {
  // 上 40% 区域显示 LOGO（缩小）
  vec2 logoUv = vec2(vUv.x * 1.0, (vUv.y - 0.6) / 0.4);
  vec4 logo = (vUv.y > 0.6) ? texture2D(uLogoTex, logoUv) : vec4(0.0);
  vec3 logoColor = mix(uBgColor, logo.rgb * uAccentColor, logo.a);
  // 进度条 y=0.3
  float bar = step(abs(vUv.y - 0.3), 0.015) * step(vUv.x, uProgress);
  float barSlot = step(abs(vUv.y - 0.3), 0.015) * 0.3;
  // 暗角
  float vig = smoothstep(0.9, 0.4, distance(vUv, vec2(0.5)));
  color = logoColor * vig + barSlot * uBgColor * 0.5 + bar * uAccentColor * 1.5;
}
```

**阶段 4 白光：**（已在任务 9 骨架中：`color = vec3(uPhaseProgress)`）

- [ ] **步骤 1：填充 5 阶段 GLSL**

按上方代码替换 `main.fragment.glsl.js` 中的分支。

- [ ] **步骤 2：手动验证**

依次调用 `setPhase(0..4, t)` 配合 raf 更新 `uTime`，确认每个阶段视觉正确（静电/雪花/LOGO 渐显/进度条/白光）。LOGO 纹理先用 1x1 白色占位（任务 11 接入真实纹理）。

- [ ] **步骤 3：Commit**

```powershell
git add js/themes/retro/monitor/shaders/main.fragment.glsl.js; git commit -m "feat(retro): 屏幕着色器 5 阶段 GLSL（静电/雪花/LOGO/进度条/白光）"
```

---

## 任务 11：LOGO Canvas 纹理生成

**文件：**
- 创建：`js/themes/retro/monitor/logo-texture.js`

**实现要点：**
- 导出 `createLogoTexture(text, { accent, bg })` 返回 `THREE.CanvasTexture`
- 创建 offscreen canvas 256×128，`ctx.fillStyle = bg`，`ctx.fillRect`
- 用像素字体 `VT323`（已通过 Google Fonts 加载，但 canvas 需等字体 ready：`document.fonts.ready`）
- `ctx.fillStyle = accent`，`ctx.font = '64px "VT323", monospace'`，`ctx.textAlign = 'center'`，`ctx.textBaseline = 'middle'`，绘制 `text` 居中
- `texture.magFilter = THREE.NearestFilter`，`texture.minFilter = THREE.NearestFilter`（像素化）
- `texture.needsUpdate = true`

**中文像素字体降级**：若 `logoText` 含中文且 `VT323` 不支持中文，fallback 用 `ZCOOL XiaoWei`（已在 index.html 加载）或 `monospace`。LOGO 字体在 `boot-config` 可选字段 `logoFont` 配置（可选，非必填）。

- [ ] **步骤 1：实现 logo-texture.js**

按要点实现，含 `document.fonts.ready` await。

- [ ] **步骤 2：接入 monitor-screen**

在 `createMonitorScreen` 接收 `logoTexture` 参数，赋给 `uLogoTex` uniform。在 `boot.js` 编排时调用 `createLogoTexture(cfg.logoText, ...)` 传入。

- [ ] **步骤 3：手动验证**

调用 `setPhase(2, 1)` 确认屏幕显示"我的一生"像素 LOGO。

- [ ] **步骤 4：Commit**

```powershell
git add js/themes/retro/monitor/logo-texture.js js/themes/retro/monitor/monitor-screen.js; git commit -m "feat(retro): 程序化生成像素 LOGO Canvas 纹理"
```

---

## 任务 12：鼠标视角 + Enter 交互 + 音效

**文件：**
- 修改：`js/themes/retro/room/room-camera.js`（追加交互函数）
- 创建：`js/themes/retro/audio/sound.js`

**实现要点：**

`room-camera.js` 追加：
- `bindPointerLook(camera, { range, enabled })`：监听 `pointermove`，用 `mapPointer` 计算偏移，`gsap.to(camera look offset, { duration: 0.6, ease: 'power2.out' })` 平滑跟随。返回 `dispose()` 解绑。
- `applyBreathing(camera, { enabled })`：在 raf loop 里 `camera.position.y += Math.sin(t * 0.5) * 0.0001` 累积（每帧增量）。返回 `stop()`。
- `tweenTo(camera, fromKey, toKey, { duration, ease, onComplete })`：GSAP timeline 插值 pos/look/fov。
- `bindResize(sceneCtx)`：`window.resize` → `sceneCtx.resize(w, h)`。

`audio/sound.js` 导出：
- `SFX` 对象：`keypress()` / `crtOn()` / `static()` / `ding()` / `tick()` / `dive()` 方法
- `setSoundEnabled(bool)` / `isSoundEnabled()`（沿用旧 sound.js 模式，localStorage 持久化）
- 用 `Web Audio API`：`const ctx = new (window.AudioContext || window.webkitAudioContext)()`，每个 SFX 用 `OscillatorNode` + `GainNode` 合成短脉冲
- `keypress`：白噪声 50ms + 短暂 click
- `crtOn`：低频正弦 200ms
- `dive`：频率扫描 200→2000Hz + 白噪声爆发 1.5s
- 默认 `enabled = false`，需用户点击触发后 `ctx.resume()`（浏览器自动播放策略）

- [ ] **步骤 1：实现 room-camera.js 交互函数**

追加 `bindPointerLook` / `applyBreathing` / `tweenTo` / `bindResize`。

- [ ] **步骤 2：实现 audio/sound.js**

按要点实现 WebAudio 合成。

- [ ] **步骤 3：手动验证**

在 boot 流程中绑定鼠标视角，确认移动鼠标时相机微微跟随；调用 `SFX.keypress()` 确认有声音（需先点击页面激活 AudioContext）。

- [ ] **步骤 4：Commit**

```powershell
git add js/themes/retro/room/room-camera.js js/themes/retro/audio/sound.js; git commit -m "feat(retro): 鼠标受限视角、呼吸感与 WebAudio 音效"
```

---

## 任务 13：提示文字 UI

**文件：**
- 创建：`js/themes/retro/ui/hint-overlay.js`

**实现要点：**
- 导出 `createHintOverlay(rootEl, cfg)` 返回 `{ show(state), hide(), dispose() }`
- `show('room')` → `hintEl.textContent = cfg.hints.room`，`hintEl.style.display = 'block'`，GSAP 淡入
- `show('desk')` → 桌面/移动端分支：`state.isMobile ? cfg.hints.deskMobile : cfg.hints.desk`
- `hide()` → GSAP 淡出后 `display: none`
- 复用 `index.js` 已创建的 `#retro-hint` 元素

- [ ] **步骤 1：实现 hint-overlay.js**

- [ ] **步骤 2：手动验证**

调用 `show('room')` / `show('desk')` / `hide()`，确认提示文字正确显示/隐藏。

- [ ] **步骤 3：Commit**

```powershell
git add js/themes/retro/ui/hint-overlay.js; git commit -m "feat(retro): 底部提示文字 UI"
```

---

## 任务 14：穿越魔法（dive + 白闪）

**文件：**
- 创建：`js/themes/retro/transitions/dive-animation.js`
- 创建：`js/themes/retro/transitions/white-flash.js`

**实现要点：**

`white-flash.js` 导出 `createWhiteFlash(rootEl)` 返回 `{ flash(duration, onComplete), dispose() }`：
- 复用 `#retro-white-flash` 元素
- `flash(1.5, onComplete)`：GSAP `to(el, { opacity: 1, duration: 1.2, ease: 'power2.in' })` 然后 `to(el, { opacity: 1, duration: 0.3 })` 峰值回调 `onComplete`，再 `to(el, { opacity: 0, duration: 0.5 })`
- 实际：`gsap.timeline()` → `to(opacity 1, 1.2)` → `add(onComplete)` → `to(opacity 0, 0.5)`

`dive-animation.js` 导出 `playDive({ sceneCtx, camera, monitor, bloomPass, sound, durations, onComplete })`：
- 返回 GSAP timeline，编排：
  - t=0：`monitor.setPhase(4)`，开始 `uEmissive` 1→10（用 GSAP `to({ v: 1 }, { v: 10, duration: 1.5, onUpdate: () => monitor.setEmissive(v) })`）
  - t=0.2：`bloomPass.strength` 0.4→2.5（若有 Bloom）；无 Bloom 则 `renderer.toneMappingExposure` 1.1→3.0
  - t=0.4：相机 `tweenTo(diveStart, diveEnd, { duration: 1.1, ease: 'power4.in' })`，FOV 40→90
  - t=0.8：`uEmissive` 达 10
  - t=1.0：bloom/exposure 拉满
  - t=1.2：`SFX.dive()`
  - t=1.5：`onComplete()`（由 boot.js 触发白闪 + 切占位）
- 相机路径加横向正弦扰动：在 `onUpdate` 里 `camera.position.x += Math.sin(t * 8) * 0.002`
- 后 0.3s 加 `camera.shake`（手动抖动 `position.x/y += (Math.random()-0.5)*0.005`）

- [ ] **步骤 1：实现 white-flash.js + dive-animation.js**

- [ ] **步骤 2：手动验证**

在 boot 流程中触发 `playDive`，确认相机冲刺 + 屏幕白光 + Bloom 过曝 + 白闪切层。

- [ ] **步骤 3：Commit**

```powershell
git add js/themes/retro/transitions/; git commit -m "feat(retro): 穿越魔法——相机 dive + Bloom 过曝 + 白闪切层"
```

---

## 任务 15：占位画面

**文件：**
- 创建：`js/themes/retro/ui/placeholder-screen.js`

**实现要点：**
- 导出 `createPlaceholder(rootEl, cfg, { onReturn })` 返回 `{ show(), hide(), dispose() }`
- 复用 `#retro-placeholder` 元素，填充 innerHTML：
  ```html
  <div class="retro-placeholder__title">✦ {placeholder.title} ✦</div>
  <div class="retro-placeholder__bar"><div class="retro-placeholder__bar-fill"></div></div>
  <div class="retro-placeholder__subtitle">{placeholder.subtitle}</div>
  <button class="retro-placeholder__return" type="button">{placeholder.returnLabel}</button>
  ```
- `show()`：`hidden = false`，GSAP 淡入；启动假进度条：`gsap.to(fill, { width: '99%', duration: 3, ease: 'power1.out' })` 停在 99%
- "返回房间"按钮 click → `onReturn()`（由 boot.js 重置相机到 ROOM 状态）
- `hide()`：`hidden = true`

- [ ] **步骤 1：实现 placeholder-screen.js**

- [ ] **步骤 2：手动验证**

调用 `show()` 确认占位画面显示、进度条走到 99%；点返回按钮确认回调触发。

- [ ] **步骤 3：Commit**

```powershell
git add js/themes/retro/ui/placeholder-screen.js; git commit -m "feat(retro): 世界生成中占位画面"
```

---

## 任务 16：boot 编排 + 跳过 + 无障碍 + 故障降级

**文件：**
- 修改：`js/themes/retro/index.js`（完成 boot 实现）
- 创建：`js/themes/retro/boot.js`（编排器）

**实现要点：**

`boot.js` 导出 `playBootSequence({ ctx, root, sceneCtx, monitor, hint, placeholder, flash, sound, cfg, state, onComplete })`：
- 内部 `currentState = 'ROOM'`，`currentTimeline = null`
- raf loop：`sceneCtx.render()` + `monitor.update(dt)` + `camera breathing`
- 各阶段串联：
  1. **ROOM**：`hint.show('room')`，绑定 pointerlook，等待点击/按键 → `tweenTo(room→desk)` → 进入 DESK
  2. **DESK**：`hint.show('desk')`，等待 Enter/Space/click → 触发 ENTER
  3. **ENTER**：`SFX.keypress()` + Enter 键下沉回弹动画 + `tweenTo(desk→enter, 0.4)` → 进入 BOOT_SEQ
  4. **BOOT_SEQ**：依次 `monitor.setPhase(0,0)`→(0,1) 100ms →(1,*) 200ms →(2,*) 500ms →(3,*) 800ms（uProgress 0→1）→(4,*) 400ms → 进入 DIVE
  5. **DIVE**：`playDive(...)` → onComplete 进入 PLACEHOLDER
  6. **PLACEHOLDER**：`sceneCtx hide canvas` + `placeholder.show()` + 绑定返回按钮 → onReturn 重置相机回 ROOM

- **跳过**：`#retro-skip` click 或 Esc → `currentTimeline?.kill()` → 直接 `placeholder.show()` + hide canvas
- **reduced-motion**（`state.reducedMotion`）：跳过 ROOM→DESK 和 DESK→ENTER 相机运镜，直接淡入到 desk 关键帧；保留 BOOT_SEQ 屏幕序列；DIVE 替换为白闪直接切层
- **移动端**（`state.isMobile`）：运镜时长 ×1.3，提示用 deskMobile

`index.js` 的 `boot(ctx)` 完整实现：
```javascript
export async function boot(ctx) {
  const cfg = ctx.data.bootConfig;
  const state = ctx.state; // { isMobile, reducedMotion }
  const canvas = root.querySelector('#retro-canvas');
  const loading = root.querySelector('#retro-loading');

  let sceneCtx;
  try {
    sceneCtx = createRoomScene(canvas, { isMobile: state.isMobile });
  } catch (e) {
    return failbackToInk('WebGL 不可用');
  }
  sceneCtxRef = sceneCtx;

  // 加载房间模型（GLB 优先，fallback 程序化）
  try {
    await loadRoomModel(sceneCtx.scene, cfg); // 内部处理 GLB/fallback
  } catch (e) {
    console.warn('[retro] 房间模型加载失败，使用程序化占位', e);
  }

  addRoomLights(sceneCtx.scene);
  const props = loadRoomProps(sceneCtx.scene, ctx.data.roomProps || [], { onPropClick: showPropCard });
  const monitor = createMonitorScreen(sceneCtx.scene, cfg, await createLogoTexture(cfg.logoText, cfg));
  const hint = createHintOverlay(root, cfg);
  const placeholder = createPlaceholder(root, cfg, { onReturn: resetToRoom });
  const flash = createWhiteFlash(root);

  loading?.remove();
  bindResize(sceneCtx);

  playBootSequence({ ctx, root, sceneCtx, monitor, hint, placeholder, flash, sound: SFX, cfg, state, onComplete: () => {} });
}
```

- **故障降级 `failbackToInk(reason)`**：显示提示后 `ctx.manager.switchTo('ink')`（整页重载）
- **destroy()** 完善：`sceneCtx.dispose()` + `props.dispose()` + `monitor.dispose()` + `hint.dispose()` + `placeholder.dispose()` + `flash.dispose()` + 移除 raf loop + 移除 resize/pointermove/keydown 监听

- [ ] **步骤 1：实现 boot.js 编排器**

按要点实现 6 阶段串联 + 跳过 + reduced-motion + 移动端。

- [ ] **步骤 2：完善 index.js 的 boot/destroy**

按上方代码实现。

- [ ] **步骤 3：手动全流程验证**

`npx serve .` → `?theme=retro` → 走完整流程：房间→点击→坐下→Enter→屏幕序列→dive→占位→返回房间。验证跳过、reduced-motion（DevTools 勾选）、移动端（DevTools 移动模拟）。

- [ ] **步骤 4：Commit**

```powershell
git add js/themes/retro/index.js js/themes/retro/boot.js; git commit -m "feat(retro): boot 编排与跳过/无障碍/故障降级"
```

---

## 任务 17：CMS 配置与零回归验收

**文件：**
- 修改：`admin/config.yml`

**实现要点：**

在 `admin/config.yml` 新增 `【复古】启动配置` collection（单文件）：

```yaml
- name: 'retro_boot_config'
  label: '【复古】启动配置'
  file: 'data/themes/retro/boot-config.json'
  fields:
    - { label: '页面标题', name: 'pageTitle', widget: 'string' }
    - { label: 'LOGO 文字', name: 'logoText', widget: 'string' }
    - { label: '主色', name: 'accentColor', widget: 'string', hint: 'hex 格式 #RRGGBB' }
    - { label: '底色', name: 'bgColor', widget: 'string', hint: 'hex 格式 #RRGGBB' }
    - { label: '加载文案', name: 'loadingText', widget: 'string' }
    - label: '占位画面'
      name: 'placeholder'
      widget: 'object'
      fields:
        - { label: '标题', name: 'title', widget: 'string' }
        - { label: '副标题', name: 'subtitle', widget: 'string' }
        - { label: '返回按钮', name: 'returnLabel', widget: 'string' }
    - label: '提示语'
      name: 'hints'
      widget: 'object'
      fields:
        - { label: '房间阶段', name: 'room', widget: 'string' }
        - { label: '桌面阶段', name: 'desk', widget: 'string' }
        - { label: '桌面阶段(移动端)', name: 'deskMobile', widget: 'string' }
    - label: '时长(ms)'
      name: 'durations'
      widget: 'object'
      fields:
        - { label: '房间→书桌', name: 'roomToDesk', widget: 'number', value_type: 'int', min: 100, max: 10000 }
        - { label: '屏幕启动序列', name: 'bootSeq', widget: 'number', value_type: 'int', min: 100, max: 10000 }
        - { label: '穿越', name: 'dive', widget: 'number', value_type: 'int', min: 100, max: 10000 }
```

现有 `retro_room_props` collection 保留不动。

- [ ] **步骤 1：修改 admin/config.yml**

按上方 YAML 追加 collection。

- [ ] **步骤 2：运行全量测试**

运行：`npx vitest run`
预期：全 PASS

- [ ] **步骤 3：手动验收清单（规格 §15.2）**

逐项确认：
- [ ] 全流程：ROOM→DESK→ENTER→屏幕序列→dive→占位 流畅
- [ ] 跳过：任意阶段 Esc / 点击跳过到占位
- [ ] reduced-motion：运镜禁用，序列保留
- [ ] 移动端：触摸视角、点击触发、运镜时长 ×1.3
- [ ] 切 ink 再切 retro：内存无累积，流程可重复（连续切 3 次）
- [ ] GLB 加载失败：fallback 到程序化房间（不报错）
- [ ] 着色器编译失败：fallback 白屏（控制台不崩）
- [ ] CMS 改 boot-config：LOGO 文字 / 配色生效（本地修改 JSON 验证）
- [ ] 摆件点击：弹卡片正常
- [ ] Enter 键动画 + 机械音效同步
- [ ] 白闪切层无缝（无黑帧、无闪烁错位）

- [ ] **步骤 4：Commit**

```powershell
git add admin/config.yml; git commit -m "feat(cms): 复古启动配置 collection"
```

- [ ] **步骤 5：更新 README（可选）**

在 README 目录结构说明里更新 retro 主题新结构。

---

## 规格覆盖自检

| 规格章节 | 对应任务 |
|---------|---------|
| §1 范围与决策 | 全计划（决策固化在技术栈与各任务） |
| §3 架构与文件结构 | 任务 1（清理）+ 任务 5（骨架）+ 各任务文件 |
| §3.3 lifecycle（init/boot/destroy） | 任务 5 + 任务 16 |
| §4 状态机 | 任务 3 |
| §4.2 跳过 | 任务 16 |
| §4.3 reduced-motion | 任务 16 |
| §4.4 移动端 | 任务 16 |
| §5 房间场景（GLB/灯光/材质/后处理） | 任务 6 + 任务 7 + 任务 8 |
| §6 相机运镜 | 任务 4（数学）+ 任务 12（交互）+ 任务 16（编排） |
| §7 Enter 交互（触发/按键/音效/提示） | 任务 12 + 任务 13 + 任务 16 |
| §8 屏幕启动序列着色器 | 任务 9 + 任务 10 + 任务 11 |
| §9 穿越魔法 | 任务 14 + 任务 16 |
| §10 终点占位 | 任务 15 |
| §11 资源 | 任务 8（GLB/fallback）+ 任务 11（LOGO 纹理）+ 任务 12（音效） |
| §12 数据/CMS | 任务 2 + 任务 17 |
| §13 性能 | 任务 6（pixelRatio/Bloom 探测）+ 任务 16（reduced-motion） |
| §13.4 故障降级 | 任务 6（WebGL）+ 任务 8（GLB fallback）+ 任务 9（着色器 fallback）+ 任务 16 |
| §14 无障碍 | 任务 5（ARIA）+ 任务 16（跳过/reduced-motion） |
| §15 测试 | 任务 2/3/4（单测）+ 任务 17（手动验收） |
| §16 交付标准 | 任务 17 验收清单 |

**遗漏：** 无。所有规格章节均有任务覆盖。

**占位符扫描：** 计划中无"待定/TODO/后续实现"，视觉任务均给了实现要点 + 关键代码 + 验收标准。

**类型一致性：** `createRoomScene` / `createMonitorScreen` / `loadRoomProps` / `createHintOverlay` / `createPlaceholder` / `createWhiteFlash` / `playDive` / `playBootSequence` / `SFX` / `validateBootConfig` 命名在各任务间一致。

---

## 执行交接

**计划已完成并保存到 `docs/superpowers/plans/2026-07-03-retro-room-redesign.md`。两种执行方式：**

**1. 子代理驱动（推荐）** - 每个任务调度一个新的子代理，任务间进行审查，快速迭代
- 必需子技能：`superpowers:subagent-driven-development`

**2. 内联执行** - 在当前会话中使用 `executing-plans` 执行任务，批量执行并设有检查点
- 必需子技能：`superpowers:executing-plans`

**建议：** 任务 1-4（清理 + 数据层 + 状态机 + 相机数学）是纯逻辑/TDD，可连续执行；任务 6-15（Three.js 场景/着色器/视觉）建议逐任务手动验证后再推进，因为视觉问题难以自动测试发现；任务 16-17（编排 + 验收）需完整手动走查。

**选哪种方式？**
