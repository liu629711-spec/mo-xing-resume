# 多主题（水墨 + 复古像素房间）实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在零回归前提下接入双主题架构；水墨保持现有体验；新增复古主题（像素 3D 房间 → Enter → 进屏 → 桌面），CMS 分主题独立内容，房间游戏摆件可后台配置。

**架构：** `ThemeManager` 注册 `ink` / `retro` 两套 lifecycle（`boot` → `init` → `destroy`）；`data-loader` 按 `activeThemeId` 读 `data/themes/{id}/`；P0 仅迁移数据路径与 orchestrator，水墨 JS 暂保留原目录通过 `ink/index.js` 适配层调用；P1 起开发 `js/themes/retro/`。

**技术栈：** 现有 Three.js + GSAP + Lenis + D3 + Vitest；复古房间复用 Three.js；屏内 UI 为 DOM + CSS（CRT 滤镜）；CMS Decap（git-gateway）。

**规格依据：** `docs/superpowers/specs/2026-07-03-multi-theme-retro-design.md`

---

## 文件结构（本计划将创建/修改）

| 路径 | 职责 |
|------|------|
| `data/themes.json` | 主题清单：`id`, `label`, `default`, `bootSkippable` |
| `data/themes/ink/**` | 水墨内容（从 `data/` 平移） |
| `data/themes/retro/**` | 复古内容 + `room-props/` |
| `js/core/theme-manager.js` | 注册、切换、持久化、`?theme=` 解析 |
| `js/core/theme-registry.js` | 导出 ink/retro 主题 descriptor |
| `js/themes/ink/index.js` | 水墨适配层：调用现有 `init` 逻辑 |
| `js/themes/retro/index.js` | 复古入口（P1 起实现） |
| `js/themes/retro/boot.js` | 房间分镜 GSAP timeline（P1） |
| `js/themes/retro/room-scene.js` | 像素 3D 房间 + 摆件 mesh（P1） |
| `js/themes/retro/desktop.js` | Win95 桌面 + 图标（P1） |
| `js/themes/retro/sections/*.js` | 屏内各板块 UI（P1–P2） |
| `css/themes/retro/crt.css` | 扫描线、 vignette（P1） |
| `css/themes/retro/desktop.css` | 桌面/窗口（P1） |
| `js/core/init.js` | 改为 orchestrator，不再直接跑水墨 |
| `js/core/data-loader.js` | 路径前缀 `data/themes/{themeId}/` |
| `js/core/data-schema.js` | 新增 `validateRoomProps`、retro 扩展字段 |
| `scripts/gen-index.mjs` | 扫描 `data/themes/*/skills` 等 |
| `scripts/migrate-data-to-themes.mjs` | 一次性迁移脚本（P0） |
| `admin/config.yml` | 分主题 collections + room-props |
| `index.html` | 主题切换器 mount 点、免责声明 footer |
| `tests/core/theme-manager.test.js` | 主题解析单测 |
| `tests/core/data-loader-theme.test.js` | 主题路径单测 |

---

## 阶段 P0：主题框架 + 数据迁移 + CMS（水墨零回归）

### 任务 1：`themes.json` 与主题 ID 解析（TDD）

**文件：**
- 创建：`data/themes.json`
- 创建：`js/core/theme-manager.js`
- 测试：`tests/core/theme-manager.test.js`

- [ ] **步骤 1：编写失败的测试**

`tests/core/theme-manager.test.js`：

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseThemeFromSearch,
  resolveThemeId,
  STORAGE_KEY,
} from '../../js/core/theme-manager.js';

describe('parseThemeFromSearch', () => {
  it('?theme=retro 返回 retro', () => {
    expect(parseThemeFromSearch('?theme=retro')).toBe('retro');
  });
  it('无参数返回 null', () => {
    expect(parseThemeFromSearch('')).toBeNull();
  });
  it('非法 id 返回 null', () => {
    expect(parseThemeFromSearch('?theme=unknown')).toBeNull();
  });
});

describe('resolveThemeId', () => {
  beforeEach(() => localStorage.clear());

  it('URL 优先于 localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'ink');
    expect(resolveThemeId('?theme=retro', ['ink', 'retro'])).toBe('retro');
  });
  it('无 URL 时用 localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'ink');
    expect(resolveThemeId('', ['ink', 'retro'])).toBe('ink');
  });
  it('都没有时用 defaultTheme', () => {
    expect(resolveThemeId('', ['ink', 'retro'], 'ink')).toBe('ink');
  });
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npx vitest run tests/core/theme-manager.test.js`  
预期：FAIL，`theme-manager.js` 不存在

- [ ] **步骤 3：实现最少代码**

`data/themes.json`：

```json
{
  "default": "ink",
  "themes": [
    { "id": "ink", "label": "水墨长卷", "bootSkippable": true },
    { "id": "retro", "label": "复古电脑", "bootSkippable": true }
  ]
}
```

`js/core/theme-manager.js`（核心导出，完整类在任务 4 扩展）：

```javascript
export const STORAGE_KEY = 'mx-resume-theme';
const ALLOWED = new Set(['ink', 'retro']);

export function parseThemeFromSearch(search) {
  const id = new URLSearchParams(search).get('theme');
  return id && ALLOWED.has(id) ? id : null;
}

export function resolveThemeId(search, allowedIds, defaultTheme = 'ink') {
  const fromUrl = parseThemeFromSearch(search);
  if (fromUrl && allowedIds.includes(fromUrl)) return fromUrl;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && allowedIds.includes(stored)) return stored;
  return defaultTheme;
}
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npx vitest run tests/core/theme-manager.test.js`  
预期：PASS

- [ ] **步骤 5：Commit**

```bash
git add data/themes.json js/core/theme-manager.js tests/core/theme-manager.test.js
git commit -m "feat(theme): 主题 ID 解析与 themes.json 清单"
```

---

### 任务 2：数据迁移到 `data/themes/ink/` 并更新 loader

**文件：**
- 创建：`scripts/migrate-data-to-themes.mjs`
- 修改：`js/core/data-loader.js`
- 修改：`tests/data-schema.test.js`（如有路径 mock）
- 创建：`tests/core/data-loader-theme.test.js`

- [ ] **步骤 1：编写迁移脚本**

`scripts/migrate-data-to-themes.mjs`：将 `data/profile.json`、`data/metrics.json`、`data/contact.json` 及 `data/skills|projects|games|timeline/` 复制到 `data/themes/ink/`（不删除原文件，脚本可重复运行用 `exists` 跳过）。

- [ ] **步骤 2：运行迁移**

```bash
node scripts/migrate-data-to-themes.mjs
```

- [ ] **步骤 3：修改 data-loader 支持 theme 前缀**

在 `loadAllData(themeId = 'ink')` 内，将 fetch 前缀改为 `` `data/themes/${themeId}/` ``；`load('profile')` → `` `data/themes/${themeId}/profile.json` ``；`loadDir('skills')` → `` `data/themes/${themeId}/skills/` ``。

保留向后兼容（可选，仅 P0 过渡期）：若 `themes/ink/profile.json` 404，回退 `data/profile.json` 并 `console.warn`。

- [ ] **步骤 4：编写测试**

`tests/core/data-loader-theme.test.js`：mock fetch，断言 `loadAllData('ink')` 请求 URL 含 `data/themes/ink/profile.json`。

- [ ] **步骤 5：运行全量测试**

```bash
npx vitest run
```

预期：全部 PASS

- [ ] **步骤 6：Commit**

```bash
git add data/themes/ scripts/migrate-data-to-themes.mjs js/core/data-loader.js tests/core/data-loader-theme.test.js
git commit -m "feat(data): 内容迁入 data/themes/ink，loader 支持 themeId"
```

---

### 任务 3：更新 `gen-index.mjs` 与 CI

**文件：**
- 修改：`scripts/gen-index.mjs`
- 修改：`.gitignore`
- 修改：`.github/workflows/deploy.yml`（无需改，仍跑 gen-index）

- [ ] **步骤 1：gen-index 扫描 themed 目录**

```javascript
const THEMES = ['ink', 'retro'];
const DIRS = ['skills', 'projects', 'games', 'timeline'];

for (const theme of THEMES) {
  for (const dir of DIRS) {
    await genIndex(join('themes', theme, dir));
  }
  // retro room-props
  await genIndex(join('themes', theme, 'room-props'));
}
```

- [ ] **步骤 2：.gitignore 增加**

```
data/themes/*/skills/index.json
data/themes/*/projects/index.json
data/themes/*/games/index.json
data/themes/*/timeline/index.json
data/themes/*/room-props/index.json
```

- [ ] **步骤 3：本地验证**

```bash
node scripts/gen-index.mjs
```

- [ ] **步骤 4：Commit**

```bash
git add scripts/gen-index.mjs .gitignore
git commit -m "chore(build): gen-index 支持 data/themes/* 目录"
```

---

### 任务 4：ThemeManager 完整 lifecycle + ink 适配层

**文件：**
- 修改：`js/core/theme-manager.js`
- 创建：`js/core/theme-registry.js`
- 创建：`js/themes/ink/index.js`
- 创建：`js/themes/retro/index.js`（stub）
- 修改：`js/core/init.js`

- [ ] **步骤 1：定义主题 descriptor 接口**

```javascript
// js/core/theme-registry.js
import * as ink from '../themes/ink/index.js';
import * as retro from '../themes/retro/index.js';

export const themes = { ink, retro };

export function getTheme(id) {
  const t = themes[id];
  if (!t) throw new Error(`Unknown theme: ${id}`);
  return t;
}
```

每个主题导出：

```javascript
export const id = 'ink';
export async function boot(ctx) { /* 开卷仪式 */ }
export async function init(ctx) { /* 主界面 */ }
export async function destroy() { /* 清理 Three/GSAP/监听器 */ }
```

- [ ] **步骤 2：ink 适配层**

`js/themes/ink/index.js`：将现有 `init.js` 中 `main()` 逻辑拆为 `boot`（`playLoadingSequence`）+ `init`（渲染板块、Three、ScrollTrigger）。**P0 可整段移入 ink/index.js，init.js 只留 orchestrator**，避免双份逻辑。

- [ ] **步骤 3：retro stub**

`js/themes/retro/index.js`：

```javascript
export const id = 'retro';
export async function boot() {
  document.body.innerHTML = '<div class="retro-placeholder">复古主题开发中…</div>';
}
export async function init() {}
export async function destroy() {}
```

- [ ] **步骤 4：init.js orchestrator**

```javascript
import { resolveThemeId, ThemeManager } from './theme-manager.js';

async function main() {
  const meta = await fetch('data/themes.json').then(r => r.json());
  const themeId = resolveThemeId(location.search, meta.themes.map(t => t.id), meta.default);
  const manager = new ThemeManager(meta, themeId);
  await manager.start();
}
main().catch(console.error);
```

`ThemeManager.start()`：`destroy 旧主题` → `loadAllData(themeId)` → `boot()` → `init()`。

- [ ] **步骤 5：手动验收水墨**

```bash
npx serve .
# 打开 http://localhost:3000 与 ?theme=ink
```

检查：开卷、长卷、七大板块、四季切换与迁移前一致。

- [ ] **步骤 6：Commit**

```bash
git add js/core/init.js js/core/theme-manager.js js/core/theme-registry.js js/themes/
git commit -m "feat(theme): ThemeManager lifecycle，水墨迁入 ink 主题模块"
```

---

### 任务 5：主题切换器 UI + 页脚免责声明

**文件：**
- 修改：`index.html`
- 创建：`css/core/theme-switcher.css`
- 修改：`css/core.css`（import 或 link）

- [ ] **步骤 1：HTML 增加 mount 点**

```html
<nav id="theme-switcher" aria-label="风格切换"></nav>
<footer id="site-disclaimer" class="site-disclaimer">
  本站部分界面与素材致敬经典游戏作品，相关版权归原权利人所有。
  如有侵权，请联系 <a href="mailto:YOUR_EMAIL">YOUR_EMAIL</a> 删除。
</footer>
```

邮箱从 `data/themes/ink/contact.json` 运行时填充，或 P0 写死占位后 P1 动态。

- [ ] **步骤 2：切换器组件**

`js/core/theme-switcher.js`：读取 `themes.json` 渲染按钮；点击 → `ThemeManager.switchTo(id)` → 写 localStorage → 重新 boot。

P0：切换 retro 显示 stub 占位；切回 ink 正常。

- [ ] **步骤 3：Commit**

```bash
git add index.html css/core/theme-switcher.css js/core/theme-switcher.js
git commit -m "feat(ui): 主题切换器与版权免责声明 footer"
```

---

### 任务 6：CMS 分主题 + retro 数据脚手架

**文件：**
- 修改：`admin/config.yml`
- 创建：`data/themes/retro/profile.json`（占位）
- 创建：`data/themes/retro/room-props/` 示例 JSON ×3

- [ ] **步骤 1：ink collections 路径改前缀**

将所有 `file: 'data/profile.json'` 改为 `file: 'data/themes/ink/profile.json'`；folder 同理。

- [ ] **步骤 2：新增 retro collections 组**

使用 Decap `files` / `folder`，label 前缀 `【复古】`，路径 `data/themes/retro/...`。

`room-props` folder collection：

```yaml
- name: 'retro_room_props'
  label: '【复古】房间摆件'
  folder: 'data/themes/retro/room-props'
  create: true
  delete: true
  extension: 'json'
  format: 'json'
  slug: '{{gameName}}'
  fields:
    - { label: '游戏名', name: 'gameName', widget: 'string' }
    - { label: '摆件名', name: 'propLabel', widget: 'string' }
    - { label: '说明', name: 'tooltip', widget: 'string', required: false }
    - { label: '位置', name: 'position', widget: 'select', options: ['desk','wall','shelf','floor'] }
    - { label: '图片', name: 'image', widget: 'image', required: false }
    - { label: '草稿', name: 'draft', widget: 'boolean', default: false, required: false }
```

- [ ] **步骤 3：示例摆件（LOL / GTA / CF）**

创建 3 个 json 占位，验证 CMS 与 loader。

- [ ] **步骤 4：validateRoomProps + filterDraft**

`js/core/data-schema.js` 新增校验；retro boot 暂不读，P1 使用。

- [ ] **步骤 5：Commit**

```bash
git add admin/config.yml data/themes/retro js/core/data-schema.js tests/
git commit -m "feat(cms): 分主题 collections 与 retro room-props 脚手架"
```

---

### 任务 7：P0 回归与 CMS 发布路径验证

- [ ] **步骤 1：运行测试**

```bash
npx vitest run
```

- [ ] **步骤 2：本地水墨全流程**

开卷 → 滚动七板块 → 切换 retro stub → 切回 ink。

- [ ] **步骤 3：后台编辑 ink profile 发布**

确认 GitHub Actions 部署后前台更新（`data/themes/ink/` 路径）。

- [ ] **步骤 4：更新 README 目录结构说明**

- [ ] **步骤 5：Commit**

```bash
git add README.md
git commit -m "docs: README 更新多主题目录说明"
```

**P0 完成标准：** 水墨零回归；`?theme=ink|retro` 可用；CMS 分主题编辑；retro 为 stub。

---

## 阶段 P1：复古像素房间 Boot + 桌面 + 关于/联系

### 任务 8：像素后处理与 CRT 样式

**文件：**
- 创建：`js/themes/retro/pixel-pass.js`
- 创建：`css/themes/retro/crt.css`
- 修改：`index.html`（retro 时加载 retro css）

- [ ] **步骤 1：CRT 叠加层**

全屏 `pointer-events:none` 扫描线 + vignette；`prefers-reduced-motion` 时禁用动画。

- [ ] **步骤 2：Three.js 低分辨率 render target**

`pixel-pass.js`：`setSize(floor(w*0.4), floor(h*0.4))` 渲染到 RT，再 `NearestFilter` 拉伸到全屏。

- [ ] **步骤 3：Commit**

```bash
git commit -m "feat(retro): CRT 滤镜与像素化 render pass"
```

---

### 任务 9：像素 3D 房间场景 + 摆件加载

**文件：**
- 创建：`js/themes/retro/room-scene.js`
- 创建：`js/themes/retro/props-loader.js`

- [ ] **步骤 1：房间几何**

Box 房间：地面、三面墙、书桌（显示器、主机、键盘、鼠标、椅）。材质：MeshBasicMaterial 纯色 + 像素 pass。

- [ ] **步骤 2：相机路径关键点**

```javascript
export const CAMERA_KEYS = {
  start: { pos: [0, 1.6, 4], look: [0, 1, 0] },
  desk: { pos: [0, 1.25, 1.2], look: [0, 0.95, 0] },
  headDown: { rotX: 0.45 },
  headUp: { rotX: 0 },
  screenDive: { pos: [0, 1.1, 0.35], look: [0, 1.05, 0] },
};
```

- [ ] **步骤 3：props-loader**

读取 `data.themes.retro.roomProps`（loader 扩展 `loadDir('room-props')` 聚合数组）；每个 prop：`position` 映射到预设 anchor（desk/wall/shelf/floor）；有 `image` 则 `TextureLoader` 贴到 PlaneGeometry，无图则彩色占位盒 + label sprite。

- [ ] **步骤 4：Hover tooltip（DOM）**

射线检测 prop mesh，显示 `gameName` + `tooltip`。

- [ ] **步骤 5：Commit**

```bash
git commit -m "feat(retro): 像素房间场景与 CMS 摆件加载"
```

---

### 任务 10：Boot 分镜 timeline

**文件：**
- 创建：`js/themes/retro/boot.js`
- 修改：`js/themes/retro/index.js`

- [ ] **步骤 1：GSAP timeline 实现 §5.1 分镜**

顺序：入场 → 移近 desk（3s）→ 低头 → 显示「按 Enter」→ Enter 键帽动画 → 抬头 → 显示器 emissive 0→1 → 镜头 dive + 白闪。

- [ ] **步骤 2：跳过逻辑**

Esc / 点击「跳过」→ `timeline.kill()` → 直接 `onBootComplete()`。

- [ ] **步骤 3：reduced-motion**

跳过相机动画，0.3s 淡入桌面。

- [ ] **步骤 4：Commit**

```bash
git commit -m "feat(retro): 第一人称像素房间 boot 分镜"
```

---

### 任务 11：复古桌面 + 关于/联系窗口

**文件：**
- 创建：`js/themes/retro/desktop.js`
- 创建：`js/themes/retro/window-manager.js`
- 创建：`js/themes/retro/sections/about-window.js`
- 创建：`js/themes/retro/sections/contact-window.js`
- 创建：`css/themes/retro/desktop.css`

- [ ] **步骤 1：桌面 HTML 结构**

```html
<div id="retro-desktop">
  <div class="retro-icons">…关于我.exe / 组队招募.url …</div>
  <div class="retro-taskbar">…</div>
  <div id="retro-windows"></div>
</div>
```

- [ ] **步骤 2：window-manager**

双击图标 → 窗口 scale 弹出（GSAP `fromTo scale 0→1`）；Esc 关闭顶层窗口。

- [ ] **步骤 3：关于/联系渲染**

从 `data.profile` / `data.contact` 读 retro 字段（`className`, `level`, `titleScreen` 等）；无则用 ink 字段 fallback。

- [ ] **步骤 4：boot 完成回调进入 desktop**

`boot.js` 结束 → 隐藏 canvas 房间 → 显示 `#retro-desktop`。

- [ ] **步骤 5：手动验收**

Enter 全流程；跳过；切换回 ink 再切 retro。

- [ ] **步骤 6：Commit**

```bash
git commit -m "feat(retro): Win95 桌面与关于/联系窗口"
```

**P1 完成标准：** 完整 boot 可跳过；房间内有 ≥3 个可配置摆件；桌面可开关于/联系；两主题切换正常。

---

## 阶段 P2：复古屏内其余板块

### 任务 12：项目（FF 列表 + 详情窗口）

**文件：** `js/themes/retro/sections/projects-window.js`，扩展 CMS retro projects 字段。

- [ ] 实现 FF 风格列表 UI；点击条目打开详情（P2 横版关卡简化为滚动详情页，完整横版放 P3）。

### 任务 13：技能（ARPG 技能树）

**文件：** `js/themes/retro/sections/skills-window.js`

- [ ] 中央立绘 + 环绕技能球；数据来自 `data/themes/retro/skills/`。

### 任务 14：时间轴（DQ 对话框）

**文件：** `js/themes/retro/sections/timeline-window.js`

- [ ] 逐页 `chapterTitle` + `dialogue`；下一页按钮。

### 任务 15：数据成就 + 运营碑石

**文件：** `metrics-window.js`, `games-window.js`

- [ ] 塞尔达式符文 grid；碑石=卡带架 grid，点击可复用 ink 的 video 解析。

### 任务 16：loader 聚合 retro 全量数据 + CMS 字段补全

- [ ] `loadAllData('retro')` 返回 `{ profile, skills, projects, metrics, games, timeline, contact, roomProps }`。
- [ ] `admin/config.yml` 补全 retro 专有字段（见规格 §7.2）。

**P2 完成标准：** 复古主题七大内容类型均可读可编辑。

---

## 阶段 P3：加分项

### 任务 17：通关结算 + 探索度

- [ ] 访问板块写入 `sessionStorage.retroVisited`；全部访问后桌面弹出结算 overlay。

### 任务 18：音效（可选）

- [ ] `js/themes/retro/sound.js`；Enter 键、窗口打开、成就叮；默认静音按钮。

### 任务 19：屏保 + 摆件点击彩蛋

- [ ] 60s 无操作 → 屏保；摆件 click 弹出卡片。

### 任务 20：CMS 简化 publish 流程（独立）

- [ ] `admin/config.yml` 移除 `publish_mode: editorial_workflow`，改 simple publish。

---

## 规格覆盖自检

| 规格章节 | 对应任务 |
|---------|---------|
| 双主题架构 | 任务 4–5 |
| 水墨零回归 | 任务 2、4、7 |
| 独立内容 CMS | 任务 6、16 |
| 像素房间 boot | 任务 9–10 |
| 游戏摆件可配置 | 任务 6、9 |
| 屏内桌面/板块 | 任务 11–15 |
| 免责声明 | 任务 5 |
| 性能/reduced-motion | 任务 10、8 |
| 切换持久化 URL | 任务 1、5 |

---

## 执行选项

**计划已保存到 `docs/superpowers/plans/2026-07-03-multi-theme-retro-plan.md`。两种执行方式：**

1. **子代理驱动（推荐）** — 每个任务新子代理，任务间 review；技能：`subagent-driven-development`
2. **内联执行** — 当前会话按 P0→P1 顺序执行；技能：`executing-plans`

**建议：** 先完成 **P0 全部任务** 并部署验证水墨零回归后，再启动 P1（复古房间工作量较大）。

**选哪种方式？**
