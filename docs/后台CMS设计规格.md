# 后台 CMS 设计规格 · 墨行个人介绍网站

## 1. 背景与目标

当前网站是纯静态站点，所有内容固化在 `data/*.json` 里。改内容需要手改 JSON 文件并重新部署，对非技术使用者不友好、迭代慢。

**目标**：增加一个可视化后台，让作者（游戏产品运营）能在线增删改各板块内容、实时更新到线上，方便快速迭代简历内容。运营碑石特别增强，支持上传封面图、嵌入演示录屏视频，让"闪光亮点"用视频展示比文字更有说服力。

**成功标准**：
- 打开 `域名/admin` 登录后，可视化表单编辑所有内容板块
- 改完点保存，30-60 秒内线上生效
- 能快速增删条目、用草稿开关临时隐藏某条而不删除
- 运营碑石能配封面图 + 演示视频，点击碑石弹出视频播放器
- 保持现有免费静态托管架构，零后端零数据库

## 2. 方案选型

采用 **D 方案：Decap CMS（原 Netlify CMS）+ GitHub 仓库 + Netlify 自动部署**。

**理由**：
- 不需要重新部署独立后端，只在现有站点加 `admin.html` + `config.yml`
- 保持 Netlify 免费静态托管，零后端零数据库
- 可视化表单编辑（不是改 JSON 文本）
- 保存即 git commit，触发 Netlify 自动重新部署
- Netlify Identity 登录，只有作者账号能进后台

**架构**：
```
GitHub 仓库（代码 + data/*.json 内容）
   ↓ push 触发
Netlify 自动构建 + 部署静态站点（免费）
   ↓ 访问
域名/admin → Decap CMS 后台
   ↓ 登录
Netlify Identity（免费，仅作者）
   ↓ 保存
Decap 把改好的 JSON commit 回 GitHub → 触发重新部署
```

## 3. 纳入后台管理的板块

对齐现有 `data/*.json` 结构，每个文件对应一个 CMS collection。

### 3.1 关于（profile）· `data/profile.json` · single file
- `name` 姓名（string）
- `tagline` 标语（string）
- `summary` 自我介绍（list of string，多条）
- `seal` 印章字（string）
- 头像（新增 `avatar` image 字段，可选）

### 3.2 技艺（skills）· `data/skills.json` · list
按 category 分组，每个 category 下多个 item。
- `category` 分类名（string）
- `items` 列表：
  - `name` 技能名（string）
  - `level` 熟练度 0-1（number）
  - `story` 技能故事（text）
- 草稿开关（`draft` boolean）

### 3.3 项目（projects）· `data/projects.json` · list
- `name` 项目名（string）
- `period` 时间段（string）
- `role` 角色（string）
- `metrics` 指标对象（dau/retention/revenue，object）
- `duties` 职责列表（list of string）
- `actions` 关键动作列表（list of string）
- `image` 项目图（image，可选）
- `impact` 影响权重 0-1（number）
- 草稿开关

### 3.4 数据成河（metrics）· `data/metrics.json` · single file
- `highlights` 高亮指标卡列表（label/value/unit）
- `dauCurve` DAU 曲线（month/dau）
- `userSources` 用户来源（label/value）
- `roiBars` ROI 柱状图（activity/roi）

### 3.5 运营碑石（games）· `data/games.json` · list · **重点增强**
- `name` 游戏名（string）
- `type` 类型（string）
- `period` 时间段（string）
- `role` 角色（string）
- `cover` 封面图（image，上传到仓库 `uploads/` 或填 URL）
- `note` 一句话亮点（string）
- **`video` 演示视频（string，智能识别链接类型）** ← 新增
- **`description` 详细描述（markdown 富文本）** ← 新增
- **`metrics` 数据指标列表（多条 label/value/unit）** ← 新增
- **`period` 已有**
- `nda` 保密协议标记（boolean，标记后显示"无字碑"不展开详情）
- 草稿开关

### 3.6 时间轴（timeline）· `data/timeline.json` · list
- `year` 时间（string）
- `title` 标题（string）
- `org` 组织（string）
- `desc` 描述（text）
- `stamp` 印章字（string）
- 草稿开关

### 3.7 联系（contact）· `data/contact.json` · single file
- `email` 邮箱
- `wechat` 微信号
- `wechatQr` 微信二维码（image，可选）
- `phone` 电话（可选）
- `linkedin` LinkedIn
- `maimai` 脉脉
- `invite` 邀请语

## 4. 运营碑石视频增强（核心新功能）

### 4.1 后台字段
`video` 字段为 string，作者填链接。前端智能识别：
- `.mp4` / `.webm` 直链 → 用 `<video controls>` 标签直接播放
- `bilibili.com` 链接 → 提取 BV 号，用 B 站 iframe embed
- `youtube.com` / `youtu.be` 链接 → 提取 video id，用 YouTube iframe embed
- 空 → 不显示视频区域

### 4.2 前端详情面板改造
现有 `openGameDetail`（`js/sections/games.js`）详情面板扩展为：
1. 封面大图（如有）
2. 标题 + meta（类型/周期/角色）
3. **视频播放器**（如有 video 字段，按链接类型渲染）
4. 详细描述（markdown 渲染，如有 description）
5. 数据指标卡列表（如有 metrics）
6. 一句话亮点（note）

### 4.3 视频存储建议（非强制）
作者视频为自己录屏，文件较大。推荐：
- 传到对象存储（阿里云 OSS / 腾讯云 COS）拿 mp4 直链 → 前端 `<video>` 播放，最专业、无广告、国内访问稳定，费用极低
- 或传 B 站填链接（有广告/推荐，不太适合理简历场景）
- 后台字段三种都支持，作者自行选择

## 5. 草稿/发布开关

每个 list 类 collection 的条目带 `draft` 字段（boolean，默认 false）。
- 前端加载 JSON 后过滤掉 `draft: true` 的条目，不渲染
- 作者可在后台用开关临时隐藏某条而不删除，方便"快速拿掉某内容"
- Decap CMS 原生支持 draft 状态

## 6. 不纳入后台的部分（保持代码控制）

这些是"形式"而非"内容"，放后台反而混乱：
- 季节系统（春夏秋冬视觉变换）
- 3D 水墨长卷场景、飞行模式
- 整体视觉主题、动画、shader
- 路由/导航结构

## 7. 部署与前置准备

### 作者需完成：
1. 注册 GitHub 账号（如无）
2. 项目推到一个 GitHub 仓库
3. Netlify 连接该仓库部署（已有则只需连仓库）
4. Netlify 后台开启 Identity 服务 + Git Gateway，添加作者为用户

### 我会完成：
1. 添加 `admin/admin.html`（Decap CMS 入口）
2. 添加 `admin/config.yml`（定义所有 collection 字段）
3. 前端各 section 渲染逻辑适配 `draft` 过滤
4. `games.js` 详情面板增强（视频/富文本/指标卡）
5. 添加 markdown 渲染依赖（如 marked.js，CDN 引入）
6. 添加视频智能识别工具函数 `js/utils/video.js`
7. 文档：部署配置步骤说明

## 8. 实现范围拆分（供后续 writing-plans）

1. **阶段 1 · 基础后台接入**：admin.html + config.yml + Netlify Identity 配置文档，让作者能登录进后台
2. **阶段 2 · 内容 collection 配置**：把所有 7 个板块的 JSON schema 配成 Decap collection，能编辑保存
3. **阶段 3 · 草稿过滤**：前端各 section 加载后过滤 `draft: true`
4. **阶段 4 · 运营碑石视频增强**：video 字段识别 + 详情面板视频播放器 + 富文本描述 + 指标卡
5. **阶段 5 · 部署联调文档**：GitHub 仓库 + Netlify Identity + Git Gateway 配置步骤

## 9. 不做的事（明确排除）

- 不做用户注册/多用户（只有作者一人用，Netlify Identity 单用户即可）
- 不做真实时更新（30-60 秒部署延迟可接受）
- 不做后端服务器/数据库
- 不做内容版本历史 UI（git 自带历史，需要时看 GitHub）
- 不做后台自定义视觉主题/3D 场景配置
