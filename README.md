# 水墨长卷 · 游戏运营求职简历

> 一轴可展卷的 3D 水墨山水个人介绍网站。访客滚动即"展卷"，职业生涯在云雾山峦间徐徐浮现。

## 设计理念

把简历做成一台"3D 水墨长卷展卷机"。拒绝标准单页滚动的信息罗列，追求**空间叙事**与**情绪引导**：

- **水墨生成艺术**：Three.js 自定义着色器渲染流动的水墨山水、墨河、云海，每个特效都有叙事意义而非炫技。
- **金缮过渡**：板块切换时屏幕生成金色裂纹再修复，隐喻"经历塑造人"。
- **书法粒子标题**：标题文字由飞舞墨点聚合成字，离开时散开。
- **四季流转**：宣纸色调随访客本地季节变化（春樱 / 夏荷 / 秋枫 / 冬雪），每次访问感受不同。

七大板块对应七处景致：入山亭（介绍）→ 星罗棋盘（技能）→ 峰峦叠嶂（项目）→ 墨河奔流（数据）→ 碑林（游戏作品）→ 山径蜿蜒（时间轴）→ 归舟渡口（联系）。

## 技术栈

- **渲染**：Three.js（3D 水墨山水 + 自定义着色器）
- **动画**：GSAP + ScrollTrigger（滚动驱动 + 编排）
- **滚动**：Lenis（平滑滚动）
- **数据可视化**：D3.js（墨笔风格图表）
- **架构**：原生 HTML/CSS/JS（ES Module，无构建步骤）
- **测试**：Vitest（数据层纯函数）

## 目录结构

```
个人介绍网站/
├── index.html                 # 单页入口
├── css/                       # 全局样式、水墨工具类、板块样式、响应式
├── js/
│   ├── core/                  # 初始化、状态、四季、滚动、数据加载
│   ├── three/                 # Three.js 场景、着色器、3D 元素
│   ├── effects/               # 金缮、书法粒子、墨滴、宣纸底纹
│   └── sections/              # 七大板块逻辑
├── data/                      # 简历内容（JSON，与代码分离）
├── assets/                    # 字体、图片、贴图
├── tests/                     # Vitest 测试
└── docs/superpowers/          # 设计规格与实现计划
```

## 本地运行

无需构建。任选其一：

```bash
# 方式 1：Python
python -m http.server 8000
# 访问 http://localhost:8000

# 方式 2：Node
npx serve .

# 方式 3：直接双击 index.html（部分 ES Module 特性需 http 协议，推荐前两种）
```

## 内容更新

所有简历内容在 `data/*.json`，改 JSON 即可更新，无需改代码：

- `profile.json` — 名字、定位、自我评价
- `skills.json` — 技能矩阵（分类 + 熟练度 + 故事）
- `projects.json` — 项目案例（数据指标、职责、举措）
- `metrics.json` — 数据成果可视化（大数字、曲线、构成、ROI）
- `games.json` — 运营过的游戏作品
- `timeline.json` — 经历时间轴
- `contact.json` — 联系方式

## 部署

静态站点，部署到任意静态托管：

- **Vercel**：`vercel --prod`
- **GitHub Pages**：推送仓库，Settings → Pages → main 分支
- **Netlify**：拖拽文件夹即可

## 适配

- **桌面**：完整 3D + 全部特效（开卷仪式 / 金缮 / 书法粒子 / 四季流转 / 水墨山水）
- **平板**：3D 渲染降分辨率（pixelRatio 限制为 2），保留全部特效
- **手机（<768px）**：自动切换 2D 水墨卷轴模式（纵向滚动 + 保留宣纸底纹/四季/金缮/D3 图表/时间轴），不启动 Three.js
- **减弱动画**：尊重 `prefers-reduced-motion`，跳过开卷仪式、书法粒子聚合、3D 摄像机推进，内容直接淡入

## 性能

- Three.js 像素比限制 `min(devicePixelRatio, 2)`
- 视锥外 3D 对象 `frustumCulled = false`（长卷沿 X，统一管理）但材质透明度按距离衰减
- D3 图表懒绘制（仅进入视口时绘制一次）
- 宣纸底纹低分辨率（256×256）生成 + CSS 放大
- 季节切换用 CSS transition + GSAP uniform tween，1s 平滑过渡

## 测试

```bash
npm install
npm test
```

数据层纯函数单元测试（Vitest + jsdom）：
- 季节判定 `getSeasonByMonth`（7 测试）
- 数据 schema 校验（18 测试）
- 书法粒子像素采样 `samplePointsFromImageData`（4 测试）

视觉/3D 部分采用手动验收清单（见规格文档第 10 节）。

## 文档

- 设计规格：`docs/superpowers/specs/2026-07-02-ink-scroll-portfolio-design.md`
- 实现计划：`docs/superpowers/plans/2026-07-02-ink-scroll-portfolio.md`

## 浏览器支持

- Chrome / Edge / Firefox / Safari 最新版（需 WebGL2）
- 不支持 WebGL 的环境自动降级为纯 2D 模式
