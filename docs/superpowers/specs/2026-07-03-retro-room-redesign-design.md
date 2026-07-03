# 复古主题 R1 重新设计 —— 现实层房间 + Enter 穿越魔法

> 版本：2026-07-03
> 状态：待用户审查
> 范围：复古（retro）主题**第一阶段 R1**，覆盖参考2.md 的第一幕~第三幕
> 灵感来源：[samsy-ninja](https://github.com/254558/samsy-ninja)（沉浸式 3D 作品集的相机运镜与后处理质感）
> 前序规格：`2026-07-03-multi-theme-retro-design.md`（双主题骨架，本规格在其上重做 retro 主题内部实现）

---

## 1. 设计目标与范围

### 1.1 目标

把当前复古主题（DOM 像素房间 + Win95 桌面 + 窗口式板块）**全部丢弃**，重新设计为一场沉浸式 3D 叙事体验的开端：访客以第一人称进入"我"的房间，坐到电脑前，按下 Enter，被吸进显示器屏幕——完成"穿越魔法时刻"。

**记忆点检验**：访客能复述"我走进一间真实的房间，坐下来按了回车，被吸进了屏幕里，然后世界正在生成"。

### 1.2 范围（R1）

| 幕 | 内容 | 是否本次实现 |
|----|------|--------------|
| 第一幕 | 记忆的房间（3D 第一人称、可环顾） | ✅ |
| 第二幕 | 坐到电脑前（运镜过渡） | ✅ |
| 第三幕 | 按下 Enter + 屏幕启动序列 + 白光穿越 | ✅ |
| 占位收尾 | 白光消散 → "世界生成中…"占位 + 返回房间 | ✅ |
| 第四幕 | 进入 3D 游戏世界（悬浮岛屿） | ❌ R2 |
| 第五幕 | 探索记忆岛屿 / 技能树 / 成就神殿 | ❌ R2 |
| 第六幕 | 主菜单系统 | ❌ R3 |
| 第七幕 | 通关结算 | ❌ R3 |
| 第八幕 | 联系我 | ❌ R3 |

**R1 终点**：白光穿越后显示"世界生成中…"占位画面 + "返回房间"按钮。R2 完成后再接真正的 3D 游戏世界入口。

### 1.3 关键决策汇总

| 决策 | 结论 |
|------|------|
| 技术栈 | vanilla JS + Three.js + GSAP（与 ink 一致，不引入 Vue） |
| 渲染风格 | 清新自然风（青绿/天蓝 + 阳光体积光 + 云层，阿尔宙斯风），非赛博朋克 |
| 多人联机 | 不做（R2 阶段做"假多人"NPC 虚拟形象） |
| 素材路线 | 完整 GLB 场景 + VRM 角色（R1 仅房间 GLB，VRM 在 R2） |
| 房间交互 | 纯运镜式（鼠标轻移受限转动 + 点击 GSAP 运镜），非自由走动 |
| Enter 触发 | 键盘 Enter/Space + 屏幕点击双触发 |
| 摆件彩蛋 | 生活物品为主 + 少数游戏摆件 CMS 配置彩蛋 |
| 穿越实现 | 方案 A：全 Three.js 着色器流（屏幕内容用 ShaderMaterial，非 DOM 叠层） |
| CMS | 保留分主题编辑，新增 boot-config 可配字段 |
| 终点 | "世界生成中…"占位 + 返回房间按钮 |

---

## 2. 从 samsy-ninja 继承什么

| samsy-ninja 要素 | R1 是否采用 | 说明 |
|------------------|-------------|------|
| Three.js + GSAP 相机运镜 | ✅ | R1 核心 |
| 后处理 Bloom 过曝 | ✅ | 穿越魔法的关键质感 |
| Draco 压缩 GLB + Web Worker 解码 | ✅ | 房间模型加载 |
| 自定义着色器做屏幕内容 | ✅ | 方案 A 的核心 |
| BMFont 3D 文字 | ❌ | R1 不需要 3D 空间文字，提示用 DOM |
| WebGPU 优先 WebGL2 兜底 | ❌ | 沿用项目现有 Three.js 0.160 WebGL 渲染器 |
| PartyKit 多人联机 | ❌ | R1 单人体验 |
| VRM 虚拟形象 | ❌ | R2 才涉及 |
| 视频墙双缓冲 | ❌ | R2/R3 才涉及 |

**不采用 samsy-ninja 的赛博朋克视觉**：色调改为清新自然（青绿/天蓝/暖白），不用霓虹蓝紫、下雨、CRT 全局像素化。

---

## 3. 架构

### 3.1 文件结构（R1 范围，替换现有 retro 主题）

```
js/themes/retro/
├── index.js                    # 主题入口：boot/init/destroy lifecycle
├── state-machine.js            # 场景状态机
├── room/
│   ├── room-scene.js           # Three.js 场景：加载房间 GLB、灯光、雾、后处理
│   ├── room-camera.js          # 相机控制器：GSAP 运镜 + 鼠标受限视角
│   ├── room-props.js           # 摆件加载（GLB 内 anchor + CMS room-props 数据）
│   └── room-lights.js          # 清新自然风灯光
├── monitor/
│   ├── monitor-screen.js       # 显示器屏幕 Mesh + 着色器阶段切换
│   ├── shaders/
│   │   ├── static-noise.glsl.js   # 阶段0 静电噪声
│   │   ├── snow.glsl.js           # 阶段1 雪花点
│   │   ├── logo-reveal.glsl.js    # 阶段2 像素 LOGO 显现
│   │   ├── progress-bar.glsl.js   # 阶段3 进度条
│   │   └── white-burst.glsl.js    # 阶段4 白光爆发
│   └── screen-projection.js    # 屏幕局部坐标→相机视野（dive 用）
├── transitions/
│   ├── dive-animation.js       # 相机 dive + Bloom 过曝 timeline
│   └── white-flash.js          # 全屏白闪叠层（峰值切层到占位）
├── audio/
│   └── sound.js                # 机械键盘音、CRT 启动音、穿越音效
├── ui/
│   ├── hint-overlay.js         # 底部提示文字
│   └── placeholder-screen.js   # "世界生成中…"占位 + 返回房间按钮
└── boot.js                     # 编排：state-machine 驱动各阶段串联

css/themes/retro/
├── retro-root.css              # #retro-root 容器、全屏 canvas 布局
├── hint-overlay.css            # 提示文字样式
└── placeholder.css             # 占位画面样式

data/themes/retro/
├── room-props/                 # 保留现有 CMS 摆件数据
└── boot-config.json            # 新增：启动序列可配字段

tests/themes/retro/
├── state-machine.test.js
├── room-camera.test.js
└── boot-config.test.js
```

### 3.2 与现有架构集成

**保留**：`ThemeManager` / `theme-registry` / `data-loader` / `data-schema` 骨架；`js/themes/retro/index.js` 仍导出 `boot` / `init` / `destroy` 三个 lifecycle 函数；`data/themes/retro/` 内容目录；`admin/config.yml` 分主题 collections 骨架。

**丢弃**（R1 不重建，R2/R3 按需重做）：
- `js/themes/retro/room-dom.js`（DOM 像素房间，改 Three.js 场景）
- `js/themes/retro/desktop.js`（Win95 桌面，R3 重做）
- `js/themes/retro/window-manager.js`（窗口管理，R3 重做）
- `js/themes/retro/sections/*.js`（各板块窗口，R2/R3 重做）
- `js/themes/retro/screensaver.js`、`ending.js`、`exploration.js`（R3 重做）
- `js/themes/retro/sound.js`（重写为 `audio/sound.js`）
- `css/themes/retro/room.css`、`desktop.css`、`extras.css`、`crt.css`（按新结构重写）

### 3.3 lifecycle 约定

```javascript
// js/themes/retro/index.js
export const id = 'retro';

// boot：构建场景、加载资源、播放 ROOM→...→PLACEHOLDER 全流程
export async function boot(ctx) { ... }

// init：ThemeManager.start 会先调 boot 再调 init；R1 中 init 为空操作（boot 已完成全部）
export async function init(ctx) { ... }

// destroy：销毁 Three.js 场景、移除 DOM、解绑监听、释放内存
export async function destroy() { ... }
```

---

## 4. 场景状态机

### 4.1 状态与转换

```
ROOM          入场：相机在房间门口，鼠标轻移→受限视角转动，提示"点击任意位置继续..."
   │ 点击
DESK          GSAP 运镜到书桌前坐姿（3s），轻微坐下震动，提示"按 Enter 启动..."
   │ Enter / Space / 点击
ENTER         Enter 键帽下沉动画 + 机械音效，相机微聚焦显示器
   │ 200ms
BOOT_SEQ      屏幕着色器序列：静电(100ms)→雪花(200ms)→LOGO(500ms)→进度条(800ms)→变白(400ms)
   │ 进度条走完
DIVE          屏幕白光爆发 + Bloom 过曝 + 相机 dive 进屏幕（1.5s）+ 失重眩晕感
   │ 白闪峰值
PLACEHOLDER   全屏白闪切层 → 淡入"世界生成中…"占位 + "返回房间"按钮
   │ 点击返回
ROOM          回到 ROOM 状态（重置相机）
```

### 4.2 跳过逻辑

- 全程显示右上角"跳过"按钮
- 点击或按 Esc → `currentTimeline.kill()` → 直接跳到 `PLACEHOLDER`
- reduced-motion 模式下"跳过"按钮高亮提示

### 4.3 reduced-motion

- 房间相机运镜：替换为 0.3s 淡入到 DESK 关键帧（不移动相机）
- 鼠标受限视角：禁用
- 呼吸感：禁用
- 屏幕启动序列：保留（不引起前庭不适，且是叙事核心）
- dive 动画：替换为白闪直接切层（不做相机冲刺）

### 4.4 移动端适配

- 触摸拖拽 = 视角转动（单指）
- 点击 = 触发下一步
- 运镜时长 ×1.3（给慢设备缓冲）
- 像素 LOGO 纹理分辨率降级（256→128）
- Bloom 强度降低 30%
- 桌面优先，移动端能用即可

---

## 5. 房间场景

### 5.1 GLB 资源

`public/assets/retro/room.glb`：风格化写实卧室，Draco 压缩，目标 < 3MB。

**固定几何**（GLB 内烘焙，不可点击，纯装饰）：书桌、CRT 显示器、主机、机械键盘、鼠标、椅子、马克杯、便签、耳机、床、窗户、海报、时钟、木质地板。

**动态锚点**（GLB 内空对象，运行时由 `room-props.js` 从 CMS 数据加载游戏摆件）：
- `propDesk_1`、`propDesk_2`、`propWall_1`、`propShelf_1` 等：摆件 anchor 空对象

**关键 mesh 命名约定**（Blender 导出时遵守）：
- `key_Enter`：Enter 键单独命名（按键动画用）
- `monitor_screen_anchor`：显示器屏幕锚点空对象（屏幕 Plane 挂载点）
- `propDesk_*` / `propWall_*` / `propShelf_*` / `propFloor_*`：摆件 anchor 空对象（仅用于游戏摆件彩蛋）

**区分**：生活物品（马克杯/便签/耳机等）是 GLB 内固定装饰，**不可点击**；只有从 anchor 动态加载的游戏摆件**可点击触发彩蛋卡片**。

### 5.2 场景图

```
Scene
├── room.glb 加载后的 Group（含所有家具）
├── 灯光组（room-lights.js）
├── monitor-screen Mesh（独立 Plane，挂到 monitor_screen_anchor）
├── 摆件 meshes（room-props.js 从 anchor 加载）
└── 阳光体积光柱（CylinderGeometry + additive 材质）
```

### 5.3 清新自然风灯光

| 灯光 | 类型 | 参数 | 作用 |
|------|------|------|------|
| 阳光 | `DirectionalLight` | 暖白 5500K，强度 1.2，从窗户斜射 | 主光，模拟下午 3-4 点 |
| 天空反弹 | `AmbientLight` | 天蓝，强度 0.4 | 填充阴影 |
| 台灯 | `RectAreaLight` | 暖黄 3200K，强度 0.6 | 照亮桌面 |
| 雾 | `Fog` | 青绿色，密度 0.015 | 远处柔化 |
| 体积光柱 | `CylinderGeometry` + additive | 半透明，沿阳光方向 | 窗外阳光光柱（非 raymarch，性能友好） |

### 5.4 风格化写实材质

- GLB 内 PBR 材质保留，全局 roughness 偏高（0.6-0.8）做柔和感
- `renderer.toneMapping = ACESFilmic`，`toneMappingExposure = 1.1`
- 不用 toon shading（房间保持风格化写实，toon 留给 R2 角色）

### 5.5 后处理

- `UnrealBloom`：强度 0.4、半径 0.6、阈值 0.85（阳光光柱和台灯柔和辉光）
- `N8AO` 或 `SAO` 环境光遮蔽（性能允许时启用，移动端关闭）
- **不用** CRT 全局像素化后处理（与清新自然风冲突）

---

## 6. 相机运镜

### 6.1 关键帧

```javascript
export const CAMERA_KEYS = {
  room:      { pos: [0, 1.6, 3.8],  look: [0, 1.2, 0],  fov: 55 },
  desk:      { pos: [0, 1.25, 1.2], look: [0, 1.05, 0], fov: 50 },
  enter:     { pos: [0, 1.2, 0.95], look: [0, 1.05, 0], fov: 45 },
  diveStart: { pos: [0, 1.15, 0.6], look: [0, 1.05, 0], fov: 40 },
  diveEnd:   { pos: [0, 1.08, 0.15],look: [0, 1.05, 0], fov: 90 },
};
```

### 6.2 运镜编排

| 转换 | 时长 | ease | 备注 |
|------|------|------|------|
| ROOM→DESK | 3s | `power2.inOut` | pos/look/fov 同时插值，中段加 0.1 Y 抖动模拟坐下震动 |
| DESK→ENTER | 0.4s | `power2.out` | 微推近聚焦显示器 |
| ENTER→DIVE | 1.5s | 前 0.8s `power1.out`，后 0.7s `power4.in` | 加速冲入，fov 40→90 吸入感 |

### 6.3 鼠标受限视角

- 监听 `pointermove`，鼠标位置映射到 `look` 偏移
- `offsetX ∈ [-0.15, 0.15]`，`offsetY ∈ [-0.08, 0.08]`（小范围，不晕）
- `gsap.to(camera, { lookAtX, lookAtY, duration: 0.6, ease: "power2.out" })` 平滑跟随
- DESK 状态范围更小（坐着微环顾），ROOM 状态略大
- 移动端：单指拖拽映射同样偏移

### 6.4 呼吸感

相机 Y 位置叠加 `Math.sin(t * 0.5) * 0.01` 正弦微起伏，模拟呼吸。reduced-motion 时禁用。

---

## 7. Enter 交互

### 7.1 触发

DESK 状态监听 `keydown`（Enter 或 Space）和 `pointerdown`。首次触发后移除监听，防止重复。

### 7.2 按键动画

从 GLB 内找到 `key_Enter` mesh：
- 按下：`gsap.to(keyMesh.position, { y: "-=0.008", duration: 0.08, ease: "power2.in" })` + 机械键盘音效
- 回弹：`gsap.to(keyMesh.position, { y: "+=0.008", duration: 0.12, ease: "back.out(2)" })`

### 7.3 音效

`audio/sound.js`，默认 WebAudio 合成（零资源），CMS 可配切换到 MP3：

| 事件 | 音效 | 实现 |
|------|------|------|
| 机械键盘按下 | 短促"咔哒"（~50ms） | WebAudio 短脉冲 + 噪声 |
| CRT 启动 | 电视通电"嗡"声（~200ms） | 低频正弦 |
| 静电沙沙 | 白噪声 | WebAudio `BufferSource` |
| LOGO 出现 | "叮" | 正弦衰减 |
| 进度条滴答 | 滴答 | 短脉冲序列 |
| 穿越白光 | 上扬 sweep + 白噪声爆发（~1.5s） | 频率扫描 + 噪声 |

沿用现有 `sound.js` 的 `setSoundEnabled` / `isSoundEnabled` 模式，默认静音按钮在状态栏。

### 7.4 提示文字

`ui/hint-overlay.js`（DOM 层）：
- ROOM 状态：底部居中淡入"点击任意位置继续..."
- DESK 状态：底部居中"按 Enter 启动..."（移动端显示"点击屏幕启动..."）
- 像素字体（`Press Start 2P` 或 `VT323`，Google Fonts），半透明，缓慢呼吸闪烁
- 触发后淡出

---

## 8. 屏幕启动序列着色器（方案 A 核心）

### 8.1 屏幕 Mesh

显示器屏幕 = `PlaneGeometry` mesh，贴在 `monitor_screen_anchor` 上，材质为自定义 `ShaderMaterial`。

### 8.2 共享 uniforms

| uniform | 类型 | 作用 |
|---------|------|------|
| `uTime` | float | 时间 |
| `uPhase` | int | 阶段：0=静电, 1=雪花, 2=LOGO, 3=进度条, 4=白光 |
| `uPhaseProgress` | float | 当前阶段进度 0→1 |
| `uEmissive` | float | 屏幕整体亮度（dive 阶段 1→10） |
| `uLogoTex` | sampler2D | 像素 LOGO 纹理（Canvas 程序化生成） |
| `uAccentColor` | vec3 | 清新自然风主色（青绿 `#7DD3C0`），从 boot-config 读 |
| `uBgColor` | vec3 | 屏幕底色（深墨绿 `#0a2a25`） |

### 8.3 阶段实现

**阶段 0 · 静电噪声（100ms）**：
- `hash13(uv + uTime)` 生成黑白噪声
- `gl_FragColor = vec4(noise, noise, noise, 1.0) * uEmissive`

**阶段 1 · 雪花点（200ms）**：
- 多层噪声叠加：`snow = hash13(uv * 3.0 + uTime * 2.0) * 0.6 + hash13(uv * 8.0 - uTime) * 0.4`
- 横向扫描线：`step(0.97, sin(uv.y * 800.0))`
- 整体偏暗

**阶段 2 · 像素 LOGO 显现（500ms）**：
- 雪花淡出：`mix(snow, logoColor, uPhaseProgress)`
- LOGO 纹理采样：`texture2D(uLogoTex, uv)`，`nearest` filter 像素化
- 中心向外揭示：`mask = step(uPhaseProgress, distance(uv, vec2(0.5)))`
- LOGO 文字："我的一生"（像素字体，CMS 可配 `logoText`）
- 配色：LOGO 用 `uAccentColor`，背景 `uBgColor`

**阶段 3 · 进度条（800ms）**：
- LOGO 缩小到屏幕上 40% 区域（uv 重映射）
- 进度条：`bar = step(abs(uv.y - 0.3), 0.02) * step(uv.x, uProgress)`，`uProgress = uPhaseProgress`
- 填充用 `uAccentColor`，槽底暗灰
- 加载文案像素化："LOADING... {percent}%"
- 边缘 vignette 暗角

**阶段 4 · 白光爆发（400ms，穿越触发）**：
- `gl_FragColor = vec4(uPhaseProgress)` 全屏白渐强
- `uEmissive` 1→10 驱动 Bloom 过曝
- 屏幕外溢：屏幕 mesh 周围一圈 `Sprite` 白光晕，随 `uEmissive` 同步增强

### 8.4 着色器开发策略

- 用传统 GLSL（`ShaderMaterial` + `gl_FragColor`），不用 TSL（Three.js 0.160 TSL 支持不完整）
- 每阶段单独写 GLSL 片段，组合到主 fragment，便于单元测试
- 像素 LOGO 纹理用 Canvas 2D 程序化生成（像素字体绘制到 offscreen canvas → `CanvasTexture`），避免 PNG 资源

---

## 9. 穿越魔法

### 9.1 dive timeline 编排（1.5s）

`transitions/dive-animation.js`：

| 时刻 | 事件 |
|------|------|
| t=0.0s | 屏幕进入阶段 4，`uEmissive` 开始 1→10 |
| t=0.2s | `bloomPass.strength` 0.4 → 2.5 |
| t=0.4s | 相机从 `diveStart` 推向 `diveEnd`，`power4.in` 加速；FOV 40→90 吸入感 |
| t=0.8s | `uEmissive` 达到 10，屏幕几乎纯白过曝 |
| t=1.0s | `bloomPass.strength` → 4.0，画面被白光淹没 |
| t=1.2s | 全屏白闪叠层 opacity 0→1（DOM，`pointer-events:none`） |
| t=1.5s | 白闪峰值 100% → 隐藏 Three.js canvas → 切到 PLACEHOLDER |

### 9.2 关键细节

- 相机 dive 路径加 `0.02` 横向正弦扰动模拟失重晃动
- 后 0.3s 加 `camera.shake(0.005)` 轻微抖动
- 音效：1.2s 处白噪声爆发 + 上扬 sweep 同时触发

### 9.3 白闪叠层

`transitions/white-flash.js`：
- 固定全屏 `div`，背景 `#fff`，`opacity` 由 GSAP 控制
- `pointer-events: none`
- 峰值回调：`onComplete: () => { hideThreeCanvas(); showPlaceholder(); }`

这是方案 A 唯一的 DOM 参与点，确保切层无缝。

---

## 10. 终点占位

### 10.1 占位画面

`ui/placeholder-screen.js`（DOM 层），白闪切层后淡入：

```
┌─────────────────────────────────────┐
│         ✦  世界生成中  ✦            │
│      ▓▓▓▓▓▓░░░░░░░░░  42%           │
│   ─────────────────────────────     │
│   "记忆正在汇集成岛屿..."            │
│         [ 返回房间 ]                 │
└─────────────────────────────────────┘
```

- 像素字体，青绿主色 + 暗夜底色（与屏幕启动序列配色一致，保持视觉延续）
- 假进度条缓慢推进，3s 走到 99% 后停住
- 配文"等待世界生成完成…"，诚实告知这是占位
- "返回房间"按钮 → 销毁占位 → 重置 Three.js 相机到 ROOM 状态 → 重新显示 canvas

### 10.2 占位文案可配

文案从 `boot-config.json` 读：`placeholder.title` / `placeholder.subtitle` / `placeholder.returnLabel`，CMS 可配。

---

## 11. 资源

### 11.1 3D 资源

`public/assets/retro/`：
- `room.glb`：风格化写实卧室，Draco 压缩，目标 < 3MB
- `key_Enter` mesh 单独命名
- 摆件 anchor 空节点

### 11.2 纹理

- LOGO 纹理：Canvas 2D 程序化生成，无外部文件
- 屏幕着色器无外部纹理依赖（纯数学）

### 11.3 音频

`public/assets/retro/audio/`（可选）：
- `keypress.mp3`（~10KB）
- `crt-on.mp3`（~15KB）
- `dive-whoosh.mp3`（~40KB）
- 默认 WebAudio 合成（零资源），CMS 可配切换到 MP3

### 11.4 字体

- `Press Start 2P` 或 `VT323`（Google Fonts CDN）
- 中文像素字体：`Zpix` 或 `Cubic 11`（本地托管 `public/assets/retro/fonts/`）

### 11.5 加载策略

```
boot() 启动
  ├─ 显示 DOM 加载提示"准备进入房间..."
  ├─ 并行：GLTFLoader(room.glb) + CanvasTexture(logo) + 字体 ready
  ├─ 加载完成后构建场景
  └─ 进入 ROOM 状态
```

- GLB 用 `DRACOLoader`（Web Worker 解码）
- 首次加载 < 5s（3MB GLB + 字体）
- 加载失败：显示错误提示 + "返回水墨主题"按钮（`ThemeManager.switchTo('ink')`）

---

## 12. 数据 / CMS

### 12.1 boot-config.json

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

### 12.2 room-props（保留现有 CMS）

沿用现有 schema（`gameName` / `propLabel` / `tooltip` / `position` / `image`）：
- `room-props.js` 从 GLB 内 anchor 名 `prop{Position}_{n}` 映射 prop 数据
- 摆件点击：射线检测 → 弹出致敬卡片（沿用现有 `showPropEasterCard` 逻辑迁移）
- 有 `image` 用 `TextureLoader` 贴 Plane；无图用彩色占位盒 + label sprite

### 12.3 admin/config.yml 扩展

新增 `【复古】启动配置` collection（`boot-config.json` 单文件），字段：
- `logoText`（string）
- `accentColor`（string，hex）
- `bgColor`（string，hex）
- `loadingText`（string）
- `placeholder.title` / `placeholder.subtitle` / `placeholder.returnLabel`（string）
- `hints.room` / `hints.desk` / `hints.deskMobile`（string）
- `durations.roomToDesk` / `durations.bootSeq` / `durations.dive`（number）

现有 `retro_room_props` collection 保留。

### 12.4 data-loader / data-schema 扩展

- `loadAllData('retro')` 返回新增 `bootConfig` 字段
- `data-schema.js` 新增 `validateBootConfig`：校验颜色 hex 格式、时长数值范围（100-10000ms）、必填字段

---

## 13. 性能

### 13.1 60fps 目标

- 房间 polygon 数 < 50k（GLB 控制面数）
- 屏幕着色器 fragment 复杂度可控（无 raymarch，纯噪声 + step）
- Bloom + AO 后处理总耗时 < 4ms/帧
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`（移动端限 1.5）

### 13.2 首屏体验

- `boot()` 先显示 DOM 加载提示，GLB 异步加载
- GLB 加载时显示进度（`GLTFLoader.onProgress`）
- 加载完成才进入 ROOM，避免黑屏

### 13.3 内存

- 切换到 ink 主题时 `destroy()` 完整释放：`scene.traverse(dispose)` 几何/材质/纹理、`renderer.dispose()`、移除 canvas
- 切回 retro 重新加载（不缓存，避免内存累积）

### 13.4 故障降级

| 故障 | 降级 |
|------|------|
| WebGL 不支持 | 显示提示 + 切回 ink |
| GLB 加载失败 | 显示提示 + 切回 ink |
| 着色器编译失败 | fallback `MeshBasicMaterial` 白色屏幕 + DOM 启动序列 |

---

## 14. 无障碍

- 跳过按钮全程可用（Esc / 点击）
- `prefers-reduced-motion`：运镜禁用，启动序列保留（详见 §4.3）
- 键盘可访问性：所有可点击元素 `tabindex` + focus 状态；Enter/Space 等效点击
- ARIA：`role="dialog"` 给占位画面，`aria-live="polite"` 给提示文字

---

## 15. 测试

### 15.1 单元测试（Vitest）

**`tests/themes/retro/state-machine.test.js`**：
- 状态转换合法性：ROOM→DESK→ENTER→BOOT_SEQ→DIVE→PLACEHOLDER 合法
- 非法转换抛错（如 ROOM→DIVE）
- 跳过逻辑：任意状态 → PLACEHOLDER

**`tests/themes/retro/room-camera.test.js`**：
- 关键帧插值：`lerpKey(room, desk, 0.5)` 返回正确中间值
- 鼠标偏移映射：`mapPointer(0.5, 0.5)` → `(0, 0)`
- 边界 clamp：`mapPointer(1, 1)` → `(0.15, 0.08)`

**`tests/themes/retro/boot-config.test.js`**：
- `validateBootConfig`：合法配置通过
- 非法颜色 hex 抛错
- 时长负数 / 超范围抛错

### 15.2 手动验收清单

- [ ] 全流程：ROOM→DESK→ENTER→屏幕序列→dive→占位 流畅
- [ ] 跳过：任意阶段 Esc / 点击跳过到占位
- [ ] reduced-motion：运镜禁用，序列保留
- [ ] 移动端：触摸视角、点击触发、运镜时长 ×1.3
- [ ] 切 ink 再切 retro：内存无累积，流程可重复
- [ ] GLB 加载失败：降级切 ink
- [ ] 着色器编译失败：fallback 白屏 + DOM 序列
- [ ] CMS 改 boot-config：LOGO 文字 / 配色生效
- [ ] 摆件点击：弹卡片正常
- [ ] Enter 键动画 + 机械音效同步
- [ ] 白闪切层无缝（无黑帧、无闪烁错位）

---

## 16. 交付标准

### 16.1 R1 完成标准

- [ ] 房间 GLB 加载 + 清新自然风灯光 + 后处理 Bloom
- [ ] 相机运镜 ROOM→DESK→ENTER（GSAP timeline + 鼠标受限视角 + 呼吸感）
- [ ] Enter 按键动画 + 机械音效
- [ ] 屏幕启动序列着色器 5 阶段完整
- [ ] 穿越魔法 dive + Bloom 过曝 + 白闪切层
- [ ] "世界生成中…"占位 + 返回房间
- [ ] 跳过逻辑 + reduced-motion + 移动端适配
- [ ] boot-config CMS 可配 + 校验
- [ ] room-props 摆件彩蛋 + 致敬卡片
- [ ] 单元测试通过 + 手动验收清单全过
- [ ] 切换 ink ↔ retro 零回归

### 16.2 不在 R1 范围

- 3D 游戏世界 / 记忆岛屿 / 技能树 / 成就神殿（R2）
- 主菜单 / 通关结算 / 联系我窗口（R3）
- 多人联机 / VRM 角色（R2）
- 音效 MP3 资源（默认 WebAudio 合成即可）

---

## 17. 风险与缓解

| 风险 | 缓解 |
|------|------|
| GLB 模型制作成本高 | 先用 Sketchfab CC0 占位模型验证管线，正式模型后续替换 |
| 着色器调试曲线陡 | 每阶段单独 GLSL 片段 + 单元测试；先做白屏 fallback 再细化 |
| 白闪切层无缝衔接难 | 白闪峰值时 DOM 接管全屏，Three.js canvas 隐藏；时序由 GSAP timeline 精确控制 |
| 中文像素字体加载慢 | LOGO 优先用英文/符号，中文像素字体作为渐进增强 |
| 移动端性能不足 | Bloom 强度降 30%、AO 关闭、pixelRatio 限 1.5、运镜时长 ×1.3 |
