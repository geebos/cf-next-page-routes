---
version: 2.0.0
name: Tactip-Cool-Precision-Design-System
status: approved-visual-direction
language: zh-CN
description: >-
  Tactip 具身智能科技公司官网设计规范，基于确认的 V2 冷色科技风预览定稿。
  采用冷白、深石墨蓝、冷蓝灰与 Tactip 原有朱红识别色，强调工程精密、真实接触、可验证的机器人技术。
  常规交互按钮采用 8px 圆角；不再使用暖白/米色/橙色/洋红的大面积装饰体系。

brand:
  name: Tactip
  category: Embodied Intelligence / Robotics Technology
  positioning: 具身智能科技公司
  visual-direction: Cool Precision / Embodied Intelligence
  keywords: [precise, credible, scientific, tactile, human-centered, restrained]
  tagline-zh: 让机器感知接触，理解世界。
  tagline-status: preview-copy-not-verified-as-official-slogan
  logo-source: tactip-logo-transparent.png
  logo-original: logo.png
  logo-wordmark-ink: "#47464B"
  logo-dot-red: "#DC3826"
  logo-color-status: approximate-from-supplied-raster
  preview-reference: tactip-preview-cool.html
  design-inspiration:
    - University of Bristol: editorial typography and narrative section rhythm only
    - Tactip Logo: rounded wordmark and distinctive red dot
    - Engineering / robotics: technical imagery, evidence, precise grids and data

colors:
  # 唯一常规品牌操作色。Logo 红与 CTA 红须分开管理。
  brand-ink: "#47464B"
  brand-red: "#DC3826"
  brand-red-action: "#C63121"
  brand-red-hover: "#AE2D21"
  brand-red-pressed: "#A9271B"
  brand-red-soft: "#FCEDEB"

  # Light surfaces: neutral-to-cool, no warm paper or beige.
  canvas: "#FFFFFF"
  canvas-cool: "#F7F9FC"
  canvas-subtle: "#F4F7FA"
  canvas-steel: "#EDF1F5"
  surface-soft: "#F1F5F9"
  surface-card: "#FFFFFF"
  surface-feature: "#E9F2F7"
  surface-feature-alt: "#E8EEF4"
  surface-feature-3: "#E6EEF5"

  # Dark technical surfaces.
  surface-technical: "#121C2A"
  surface-technical-deep: "#101B29"
  surface-technical-raised: "#1D2A3A"
  surface-technical-toolbar: "#172637"
  surface-technical-panel: "#1C2A3B"
  surface-research-feature: "#20384F"
  surface-careers: "#172638"
  surface-footer: "#111C29"

  # Readable text on light and dark backgrounds.
  ink: "#161D28"
  ink-secondary: "#26384A"
  body: "#4B5868"
  body-muted: "#5B6E7F"
  body-disabled: "#8191A0"
  ink-on-dark: "#F7FAFD"
  body-on-dark: "#C2CEDA"
  body-muted-on-dark: "#9AB0C1"
  on-primary: "#FFFFFF"
  link: "#C63121"
  link-on-dark: "#FF9689"

  # Cool auxiliary graphic colors, NOT competing CTA colors.
  technical-blue: "#647D98"
  technical-blue-mid: "#7394AC"
  technical-blue-bright: "#98C0D8"
  technical-blue-line: "#3D566D"
  technical-blue-pale: "#DEEAF4"

  # Borders, focus, neutral states.
  border: "#DCE3EB"
  border-subtle: "#E7ECF1"
  border-strong: "#A9B7C5"
  border-interactive: "#9FB2C5"
  border-on-dark: "#344E65"
  focus-ring: "#537FA2"
  focus-ring-soft: "#DCEAF4"
  selection: "#DEEAF4"

  # Semantic status colors — never use as brand decorations.
  status-success: "#1D765B"
  status-warning: "#8D6217"
  status-error: "#B32B28"
  status-info: "#315F9A"

  # Visualization semantics. Keep actual units/legends and label all simulated output.
  data-contact: "#DC3826"
  data-force: "#77B8D8"
  data-motion: "#98C0D8"
  data-reference: "#7394AC"
  data-neutral: "#91AEC4"

  # Reserved only for rare editorial campaigns; not part of default UI palette.
  accent-plum-reserved: "#52265F"

typography:
  families:
    display: 'Manrope, Inter, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif'
    body: 'Inter, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif'
    mono: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace'
  hero-display:
    fontFamily: "{typography.families.display}"
    fontSize: 78px
    fontWeight: 800
    lineHeight: 1.18
    letterSpacing: -0.057em
  display-lg:
    fontFamily: "{typography.families.display}"
    fontSize: 56px
    fontWeight: 780
    lineHeight: 1.18
    letterSpacing: -0.04em
  display-md:
    fontFamily: "{typography.families.display}"
    fontSize: 40px
    fontWeight: 750
    lineHeight: 1.2
    letterSpacing: -0.03em
  heading-lg:
    fontFamily: "{typography.families.display}"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.28
    letterSpacing: -0.025em
  heading-md:
    fontFamily: "{typography.families.body}"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: -0.02em
  lead:
    fontFamily: "{typography.families.body}"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.78
    letterSpacing: 0
  body:
    fontFamily: "{typography.families.body}"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: 0
  body-small:
    fontFamily: "{typography.families.body}"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: 0
  eyebrow:
    fontFamily: "{typography.families.mono}"
    fontSize: 11px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: 0.14em
  label:
    fontFamily: "{typography.families.body}"
    fontSize: 14px
    fontWeight: 650
    lineHeight: 1.45
    letterSpacing: 0
  caption:
    fontFamily: "{typography.families.body}"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  nav-link:
    fontFamily: "{typography.families.body}"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  button:
    fontFamily: "{typography.families.body}"
    fontSize: 15px
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: -0.005em
  data-value:
    fontFamily: "{typography.families.mono}"
    fontSize: 36px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: -0.025em
  data-label:
    fontFamily: "{typography.families.mono}"
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0.04em

rounded:
  none: 0px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  pill: 9999px
  full: 9999px

spacing:
  unit: 8px
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  xxxl: 64px
  section: 102px
  section-tablet: 86px
  section-mobile: 64px
  container-max: 1360px
  article-max: 800px
  page-gutter-desktop: 40px
  page-gutter-tablet: 24px
  page-gutter-mobile: 20px

motion:
  duration-fast: 120ms
  duration-normal: 180ms
  duration-slow: 220ms
  duration-reveal: 420ms
  easing-standard: "cubic-bezier(0.2, 0.8, 0.2, 1)"
  easing-exit: "cubic-bezier(0.4, 0, 1, 1)"
  card-hover-translate-y: -3px
  button-pressed-scale: 1

components:
  global-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    height: 76px
    borderBottom: "1px solid {colors.border}"
    sticky: true
  global-nav-mobile:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    height: 68px
  button-primary:
    backgroundColor: "{colors.brand-red-action}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    minHeight: 48px
    padding: 12px 25px
  button-primary-hover:
    backgroundColor: "{colors.brand-red-hover}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
  button-primary-pressed:
    backgroundColor: "{colors.brand-red-pressed}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-secondary}"
    border: "1px solid {colors.border-strong}"
    rounded: "{rounded.sm}"
    minHeight: 48px
    padding: 12px 25px
  button-on-dark:
    backgroundColor: "#E9F1F8"
    textColor: "#172638"
    rounded: "{rounded.sm}"
    minHeight: 48px
    padding: 12px 25px
  button-text:
    backgroundColor: transparent
    textColor: "{colors.link}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
  icon-button:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.sm}"
    size: 44px
  menu-button:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.sm}"
    size: 44px
  section-eyebrow:
    textColor: "{colors.brand-red-action}"
    typography: "{typography.eyebrow}"
  hero-editorial:
    backgroundColor: "{colors.canvas-cool}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    minHeight: 715px
    layout: split-52-48
  hero-visual:
    backgroundColor: "{colors.surface-technical}"
    textColor: "{colors.ink-on-dark}"
    rounded: "{rounded.none}"
  section-light:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    paddingBlock: "{spacing.section}"
  section-cool:
    backgroundColor: "{colors.canvas-cool}"
    textColor: "{colors.ink}"
    paddingBlock: "{spacing.section}"
  section-steel:
    backgroundColor: "{colors.canvas-steel}"
    textColor: "{colors.ink}"
    paddingBlock: "{spacing.section}"
  section-technical:
    backgroundColor: "{colors.surface-technical-deep}"
    textColor: "{colors.ink-on-dark}"
    paddingBlock: "{spacing.section}"
  section-careers:
    backgroundColor: "{colors.surface-careers}"
    textColor: "{colors.ink-on-dark}"
    paddingBlock: 97px
  feature-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    padding: 27px
  research-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    padding: 24px
  research-card-featured:
    backgroundColor: "{colors.surface-research-feature}"
    textColor: "{colors.ink-on-dark}"
    rounded: "{rounded.md}"
    padding: 24px
  product-showcase:
    backgroundColor: "{colors.canvas-steel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    paddingBlock: "{spacing.section}"
  data-panel:
    backgroundColor: "{colors.surface-technical-panel}"
    textColor: "{colors.ink-on-dark}"
    border: "1px solid {colors.border-on-dark}"
    rounded: "{rounded.md}"
    padding: 24px
  data-chip:
    backgroundColor: "{colors.surface-technical-raised}"
    textColor: "{colors.body-on-dark}"
    rounded: "{rounded.sm}"
    padding: 6px 12px
  tag:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.pill}"
    padding: 6px 12px
  filter-chip:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-secondary}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.sm}"
    padding: 10px 14px
  filter-chip-selected:
    backgroundColor: "{colors.surface-research-feature}"
    textColor: "{colors.ink-on-dark}"
    border: "1px solid {colors.surface-research-feature}"
    rounded: "{rounded.sm}"
    padding: 10px 14px
  input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.sm}"
    minHeight: 48px
    padding: 12px 14px
  textarea:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.sm}"
    minHeight: 114px
    padding: 12px 14px
  contact-form:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    padding: 32px
  career-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderBottom: "1px solid {colors.border}"
    rounded: "{rounded.none}"
    padding: 28px 0
  footer:
    backgroundColor: "{colors.surface-footer}"
    textColor: "{colors.ink-on-dark}"
    padding: 74px 0 25px
---

# Tactip Website Design System

> **正式视觉方向：V2 · Cool Precision（冷色科技风）。**
>
> 本文件是 Tactip 官网、产品与研究展示、招聘及联系页面的统一视觉与交互规范。以已确认的 [`tactip-preview-cool.html`](./tactip-preview-cool.html) 为视觉基准；本文 YAML frontmatter 是设计 token 的规范来源，后续代码实现应从这里派生，而不是继续叠加旧版暖色样式。
>
> **业务信息边界：** 预览页中的机器人图、传感数据、文案与交互演示可为概念示意；不得将其自动认定为 Tactip 已发布产品、真实测量、商业合作或官方承诺。

## 1. Overview

### 1.1 品牌定位

Tactip 是面向**具身智能、机器人触觉感知与物理交互**的科技公司。网站必须同时表现：

- **研究可信度：** 有清晰的方法、实验条件、数据出处和技术逻辑，而不依赖通用的 AI 装饰素材。
- **工程完成度：** 排版、网格、控件状态与数值呈现都准确、稳定、可复用。
- **人机交互价值：** 聚焦机器人如何通过接触认识材料、物体和环境，并将感知转化为行动。
- **独立品牌识别：** 以 Tactip Logo 的深灰字标与朱红圆点建立记忆，不使用泛科技蓝作为另一套主品牌色。

### 1.2 已批准的视觉决策

| 设计维度 | 定稿规则 | 不再采用 |
|---|---|---|
| 全局亮色背景 | 冷白 `#F7F9FC`、纯白 `#FFFFFF` | 暖白 `#FAF6F0` |
| 次级亮色背景 | 冷钢灰 `#EDF1F5` | 米色 `#F3EDE4` |
| 技术展示 | 深石墨蓝 `#121C2A`，局部 `#101B29` | 暖紫黑 `#27242E` 大面积底色 |
| 文本 | 冷石墨 `#161D28` + 蓝灰正文 `#4B5868` | 偏紫灰的正文体系 |
| 品牌强调 | Logo 朱红 `#DC3826`，CTA 深红 `#C63121` | 蓝色主 CTA 或多彩品牌按钮 |
| 技术辅助色 | 冷蓝灰 `#647D98`、`#7394AC` | 橙、洋红作为装饰点缀 |
| 普通按钮 | **8px** 圆角，最小高 48px | Pill（9999px）按钮 |
| 卡片 | 12px 圆角、1px 冷灰描边 | 大圆角、多层阴影 |
| 品牌章节 | 深蓝灰、深石墨面；小面积红色点睛 | 大块紫、粉、橙交替 |
| 页面语法 | 编辑式大标题 + 实验画面 + 有序数据 | 消费电商式卡片堆叠或霓虹 AI 模板 |

### 1.3 视觉关键词

**Cool / Precise / Tactile / Measurable / Restraint.**

设计不以“看上去像人工智能”为目标，而以“看上去能做机器人研究、能交付工程产品、能解释触觉技术”为目标。冷色并不等于把一切变蓝：**红色负责品牌与行动，蓝灰负责结构与信息，深色负责技术沉浸，冷白负责可读性。**

### 1.4 与参考的关系

- **Tactip Logo：** 品牌色、字标圆润特征与识别来源。
- **Bristol 页面：** 仅取其大字号编辑式叙事、强弱章节节奏和大胆的留白处理；不复制校园视觉的暖色、高饱和装饰或具体资产。
- **V2 官网预览：** 当前可视化样板。对照目标包括冷白首屏、石墨蓝右侧技术图、深色触觉演示、钢灰产品区、白色研究卡片与深色招聘/页脚。

## 2. Brand & Logo

### 2.1 Logo 保真

原始 Logo 是圆润深灰字标 `Tactip`，其中字母 `i` 的识别点为朱红色。保留原始比例、字形、字距和红点的位置及尺寸。

| 用途 | 规则 |
|---|---|
| 浅色导航 | 深灰字标 `#47464B` + 原始红点 `#DC3826` |
| 深色背景 | 优先使用经设计确认的反白矢量版本，保留红点 |
| Logo 与 CTA | Logo 红 `#DC3826` 不强制替换成按钮红 `#C63121` |
| 导航尺寸 | 桌面可视宽约 124–148px；移动宽约 108–124px |
| 安全距离 | 字标高度 `H` 的约 `0.35H`，最终以正式矢量标志规范为准 |
| 透明素材 | 优先 SVG，或透明 WebP / PNG；避免原始截图周围白色留边影响排版 |

禁止 CSS 重新拼写字母、随意绘制红点替代官方字标、投影/渐变/描边、自动反色、拉伸、旋转、压缩到难以辨认。

当前色值基于所提供位图近似取样，取得官方矢量源后应以原始文件为准。预览所用透明版素材为 `tactip-logo-transparent.png`。

### 2.2 品牌文案

当前预览 Hero 的主句：**「让机器感知接触，理解世界。」** 是已确认视觉方案中的展示文案，但尚不等于经过公司正式确认的品牌 Slogan。对外发布前应独立审定文案、商标与英文翻译。

文案写作原则：短句、明确因果、技术可验证。避免“全球第一”“全场景通用”“零误差”等无数据依据的绝对表述。

## 3. Colors

### 3.1 正式调色板

| 分类 | Token | 色值 | 用途 |
|---|---|---|---|
| 品牌 | `{colors.brand-ink}` | `#47464B` | Logo 深灰 |
| 品牌 | `{colors.brand-red}` | `#DC3826` | Logo 红点、必要接触热点 |
| 操作 | `{colors.brand-red-action}` | `#C63121` | 主按钮、关键链接 |
| 操作 | `{colors.brand-red-pressed}` | `#A9271B` | 按压反馈 |
| 浅色 | `{colors.canvas}` | `#FFFFFF` | 导航、内容块、卡片 |
| 浅色 | `{colors.canvas-cool}` | `#F7F9FC` | 首页 Hero、通用冷白底 |
| 浅色 | `{colors.canvas-subtle}` | `#F4F7FA` | 表单/联系区 |
| 浅色 | `{colors.canvas-steel}` | `#EDF1F5` | 产品展示和浅色分区 |
| 深色 | `{colors.surface-technical}` | `#121C2A` | 技术背景、Hero 视觉区 |
| 深色 | `{colors.surface-technical-deep}` | `#101B29` | 沉浸式实验区 |
| 深色 | `{colors.surface-technical-raised}` | `#1D2A3A` | 数据面板层级 |
| 深色 | `{colors.surface-research-feature}` | `#20384F` | 重点研究卡片 |
| 文字 | `{colors.ink}` | `#161D28` | 主标题、正文强调 |
| 文字 | `{colors.body}` | `#4B5868` | 默认正文 |
| 文字 | `{colors.body-muted}` | `#5B6E7F` | 次要但仍需 AA 可读的元信息 |
| 辅助 | `{colors.technical-blue}` | `#647D98` | 科技图形、结构标注 |
| 辅助 | `{colors.technical-blue-mid}` | `#7394AC` | 数据参考线 |
| 辅助 | `{colors.technical-blue-bright}` | `#98C0D8` | 深色区域的辅助图线 |
| 分割 | `{colors.border}` | `#DCE3EB` | 输入框、卡片描边、分隔线 |
| 焦点 | `{colors.focus-ring}` | `#537FA2` | 键盘焦点轮廓 |

**紫色 `#52265F` 为保留色，不进入默认首页或常规控件。** 仅后续经设计评审批准的独立专题活动可小范围使用，不得替代红色 CTA。橙色、洋红从日常 UI 与技术示意装饰色板中移除。

### 3.2 配色比例

全站采用视觉面积的**指导区间**（不是逐页的硬性统计规则）：

- **约 70%：** 白、冷白、钢灰等中性底色。
- **约 20%：** 深石墨蓝的技术/研究/招聘模块。
- **约 10%：** 品牌朱红、技术蓝灰、图表标注等强调与信息元素。

一个可视区块默认一个明确的高注意力颜色。不得同时把大面积红、紫、洋红和橙叠进同一屏。

### 3.3 背景与文本配对

| 背景 | 默认文字 | CTA | 提醒 |
|---|---|---|---|
| `#FFFFFF` / `#F7F9FC` | `#161D28` / `#4B5868` | 朱红底白字 | 常规内容与首页 |
| `#EDF1F5` | `#161D28` / `#4B5868` | 朱红底白字 | 产品、功能层级 |
| `#101B29` / `#121C2A` | `#F7FAFD` / `#C2CEDA` | 浅蓝白底深字 | 技术演示、数据 |
| `#172638` | `#F7FAFD` / `#C2CEDA` | 浅蓝白底深字 | 招聘或特定 CTA |
| `#20384F` | `#F7FAFD` / `#C2CEDA` | 浅色 CTA、暖亮红短标签 | 重点研究条目 |

`status-success` / `status-error` / `status-warning` 为反馈语义色，不应用作品牌装饰。任何含颜色信息的图表都需要图例、标签及非颜色编码。

### 3.4 色彩与渐变边界

- 常规背景使用**纯色**，不使用大面积无意义的紫/粉/蓝炫光渐变。
- 允许结构化的细网格、坐标线、浅点阵：必须克制，并不得影响文字对比。
- 允许触觉压力、位移、接触分布等**有技术含义**的连续色标；需写明是否是模拟值、数据单位及比例尺。
- 不把技术热力图的红色自动解释成品牌 CTA；二者在语义上相互独立。
- 深色界面层级通过深蓝灰亮度差与 1px 边界区分，不依靠大面积发光和玻璃拟态。

### 3.5 可访问性

- 一般文本目标满足 WCAG 2.2 AA **4.5:1**；大字至少 **3:1**。
- 有功能意义的控件轮廓、图标和焦点指示尽量达到 **3:1**，并以真实叠加背景计算。
- 占位符并非标签；禁用态可适度降低对比，但不可将关键内容变为“看不见”。
- **无障碍微调：** V2 静态预览中部分次级文字采用 `#687B8D`；正式 token 已略调深至 `#5B6E7F`，以确保其在白色、冷白及钢灰背景上的常规小字对比度达到 4.5:1。
- `link-on-dark` 和淡蓝灰小号文字不可仅凭“视觉感觉”通过验收，务必使用对比度工具检测。

## 4. Typography

### 4.1 字体体系

| 用途 | 字体栈 | 原则 |
|---|---|---|
| 英文大标题 | Manrope → Inter → 系统无衬线 | 紧凑且有工程精度，不模仿科幻字体 |
| 中文大标题 | Noto Sans SC → PingFang SC → Microsoft YaHei | 保留自然断句，避免过度负字距 |
| 正文/按钮/导航 | Inter + 中文回退 | 高可读性，优先 400/600/650 |
| 数据、标尺、标签 | IBM Plex Mono + 代码回退 | 等宽数字、清楚单位与状态 |

品牌字标使用图片/矢量资产，不通过上述字体重新排字。引入在线字体时需确认授权、加载策略与内网可用性；未加载时必须有稳定回退。

### 4.2 字级与层级

| 层级 | 桌面 | 移动 | 字重 | 行高 | 典型用途 |
|---|---:|---:|---:|---:|---|
| Hero | 53–78px | 41–62px，窄屏约 43px | 800 | 1.18–1.2 | 首屏核心观点 |
| Section H2 | 36–56px | 36–49px | 750–780 | 1.18 | 内容章节 |
| H3 | 22–32px | 20–28px | 700 | 1.28–1.35 | 卡片与专题 |
| Lead | 17–18px | 16px | 400 | 1.78–1.85 | Hero/章节导语 |
| Body | 16px | 15–16px | 400 | 1.7 | 标准正文 |
| Navigation | 15px | 17px（展开菜单） | 600 | 1.4 | 导航 |
| Button | 15px | 14–15px | 650 | 1.2 | 操作 |
| Eyebrow | 11px | 11px | 700 | 1.5 | 技术分类上标签 |
| Caption / Meta | 11–13px | 11–13px | 400 | 1.5 | 时间、图注、标签 |

数字显示可用 `font-variant-numeric: tabular-nums`，尤其是实时感知值。避免非必要的数字滚动导致布局跳变。

### 4.3 排版原则

- 英文标题字距可参考 `-0.04em`；Hero 可更紧至 `-0.057em`。中文按字形适度放松，禁止强制使用英文负字距造成汉字拥挤。
- Hero 标题最多 2–3 行；简洁的主张要比复杂口号更重要。
- 大字号用于品牌表达，不用于长篇技术说明；长文以可读性与层级为第一优先。
- 正文最大宽度建议 `65–75ch`，研究文章建议整体内容最大宽 `800px`。
- 文案与插图共同解释技术，不能靠难以理解的抽象句子堆叠科技感。

## 5. Layout & Spacing

### 5.1 页面容器

- 最大正文容器：`1360px`，水平居中。
- 技术文章容器：`800px`；有侧栏时可扩大，但正文列仍需易读。
- 边距：桌面 `40px`、平板 `24px`、手机 `20px`。
- 桌面使用 12 栏栅格；平板 8 栏；手机 4 栏。功能卡默认 3→2→1 列。
- 大幅技术视觉可全出血（full-bleed），文本永远在安全边距内。

### 5.2 间距刻度

基础间距为 8px：`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px`。常规正文行距由字体系统决定，不用固定像素强行覆盖。章节上下间距：

| 屏幕 | 章节上下留白 |
|---|---:|
| ≥1024px | 102px |
| 768–1023px | 86px |
| ≤767px | 64px |

### 5.3 首页视觉节奏（V2）

1. **冷白 Hero：** 左侧大标题与按钮，右侧深色机器人触觉概念视觉；桌面按约 **52:48** 分栏。
2. **信息索引条：** 紧凑冷灰信息条，体现主要技术方向，而不是虚构营业数据。
3. **白色能力介绍：** 三个技术卡片，冷蓝灰插图底色和 12px 圆角。
4. **深色技术实验区：** 数据采集与感知过程，可含交互热力图/读取面板。
5. **钢灰产品 / 平台区：** 设备图、方法、实现链路及技术能力边界。
6. **白色研究区：** 研究卡片和一张深蓝灰 Featured 卡。
7. **深色招聘 CTA：** 以技术团队和探索目标为中心。
8. **浅冷灰联系区：** 表单与业务合作入口。
9. **深色页脚：** 品牌、导航、版权、政策与真实联系方式。

这不是每个子页面必须照搬的固定模板；可以调整模块顺序，但**不能回退为多彩暖色大色块交替**。

### 5.4 网格、空白与分割

- 功能卡网格间距 `16px`，减少堆叠感；研究网格根据密度可采用 `16–24px`。
- 相邻浅色块通过底色细微变化和 `1px` 分隔，而不是大阴影。
- 深色与浅色分区优先使用**硬切换**；即背景色本身是叙事节奏。
- 留白是为了让真实设备、数据图和标题获得焦点，不用视觉噪声填满空白。

## 6. Imagery & Technical Visualization

### 6.1 内容优先级

1. **真实机器人物理交互视频/照片**：抓取、接触、形变、表面纹理、触觉传感器、工作台与实验人员。
2. **可信的产品工程图**：CAD 渲染、结构爆炸图、末端执行器与产品细节。
3. **有来源的数据**：压力分布、接触点位、力向量、位姿、时间序列、训练/测试结果。
4. **明确标识的概念图**：在缺乏实拍时可用于讲解触觉机制；不得冒充真实设备或已测量数据。

### 6.2 技术可视化语言

- 背景深蓝灰 `#101B29` / `#121C2A`，浅网格线使用低不透明度蓝灰；避免整屏高亮 HUD。
- 红色仅承担**接触热点或品牌标记**，辅助坐标线、轮廓与数值使用蓝灰。
- 热力图需要图例、范围、单位、数据源；模拟数据直接标注“概念示意 / DEMO”。
- 传感器、机械臂、灵巧手等图形应符合基本机械几何和运动逻辑；不要画没有受力意义的箭头。
- 技术图上文字必须是真正 DOM / SVG 文本或可读标注，不依赖不可缩放的模糊图片字。
- 如果展示流式数值，要说明采样频率/单位与正在采集、暂停、无连接等状态；不可将随机数字显示成实时传感器数据。

### 6.3 图像比例与性能

| 场景 | 比例 | 处理 |
|---|---|---|
| 首页视觉 | 桌面灵活全高，移动 3:4/4:5 可重构图 | 首屏重点加载 |
| 技术视频 | 16:9 | 无声自动播放需满足用户偏好与浏览器规则 |
| 工程 / 产品图 | 4:3 或 1:1 | 主体用 contain，避免裁掉关键结构 |
| 研究图表 | 按原始科学比例 | 保留坐标、比例尺和数据来源 |

使用 `picture`/`srcset`/`sizes`、明确宽高、首屏关键资源优先加载、非首屏懒加载；无视频或脚本时提供静态替代信息。

## 7. Shape, Elevation & Motion

### 7.1 圆角规范（已定稿）

| 组件 | 圆角 | 说明 |
|---|---:|---|
| **主/次/深色按钮** | **8px** | 全站一致，不使用全 Pill |
| 导航菜单、工具按钮 | 8px | 方正、工程化 |
| 输入框、文本域、下拉框 | 8px | 统一操作语法 |
| 筛选按钮、分页按钮 | 8px | 它们属于“操作按钮” |
| 技术 Demo 内控件 | 8px | 交互密集场景也一致 |
| 功能、研究、数据与联系卡片 | 12px | 几何克制 |
| 图片局部遮罩 / 小示意面板 | 0–12px | 避免所有元素完全一致 |
| 全宽章节、Hero 分栏 | 0px | 保持编辑式硬切分 |
| 状态标签、只读分类标签 | 可使用 Pill | **仅为非按钮的标签** |
| 单纯圆形状态灯、圆形控制柄 | 50% | 圆形有自身功能语义 |

规则优先级：**交互按钮 8px > 内容卡片 12px > 非交互状态标签可 Pill > 大分区无圆角。**

### 7.2 阴影和边框

- 常规卡片 `1px solid #DCE3EB`；默认无阴影。
- 悬停卡片可以将边框改为 `#9FB2C5`，并进行最多 `translateY(-3px)` 的轻微位移；**不依靠阴影表现点击性**。
- 深色演示面板可使用 `0 16px 42px rgba(0,0,0,.18)`，其目的是与深色底分离；不泛用到所有卡片。
- 弹窗、抽屉、悬浮菜单可以使用独立的功能性投影，但不能叠多层彩色发光。
- 实物图可以保留与光照一致的自然投影；绝不统一加固定夸张投影。

### 7.3 动效

| 场景 | 建议 |
|---|---|
| 按钮背景/边框反馈 | 180ms |
| 卡片边框/小幅位移 | 180–220ms |
| 内容入场（必要时） | ≤420ms |
| 技术演示连续变化 | 以真实/模拟采样节奏为准，提供暂停 |
| 按压反馈 | 颜色变化，不缩放；`scale(1)` |

禁止持续的品牌光斑、整页视差、滚动绑架，以及仅凭动画才能理解的关键内容。`prefers-reduced-motion: reduce` 下关闭非必要过渡、自动滚动和循环视觉效果。

## 8. Components

### 8.1 Global Navigation

- 桌面高度 `76px`，移动 `68px`，纯白或接近纯白背景，底边 `1px` 冷灰线，可 sticky。
- 左侧透明底 Logo；中部/右侧主要导航可包括“技术、产品、研究、关于我们、加入我们”，最右“联系我们”主 CTA。
- 移动端使用 Logo + **8px 圆角**菜单按钮，展开为可聚焦的纵向链接列表。
- 导航链接文字 `15px/600`；当前页以 `aria-current="page"` 和足够明显的样式标识。
- 展开菜单要支持 Escape 关闭、焦点回退和可用的屏幕阅读器语义。

### 8.2 Buttons

**Primary：** `#C63121` 背景、白字、`8px` 圆角、48px 最小高度，桌面水平 padding 约 `25px`。重要区域最多一个强主 CTA。

**Secondary：** 白底/透明底、`#26384A` 深字、`#A9B7C5` 1px 边框、`8px` 圆角；不要改成白色 Pill。

**On Dark：** 浅蓝白 `#E9F1F8` 背景、深蓝灰 `#172638` 文字，8px 圆角；不应在深色大背景上使用难辨认的深红文字按钮。

**Text Link：** 朱红文字+可选方向箭头，适用于“了解技术”“查看详情”等；正文中的普通链接需有下划线或其他不限于颜色的可识别提示。

状态必须至少覆盖 `default / hover / active / focus-visible / disabled / loading`。键盘焦点使用 `3px solid #537FA2` + `3px` offset（具体组件须校验对比）。所有可点击目标最小 44×44px。

### 8.3 Hero

**浅色编辑式 Hero** 采用左 52% 文案、右 48% 深色技术视觉。

- 左侧：`EMBODIED INTELLIGENCE` 等简短 eyebrow → 大标题（可局部朱红强调）→ 明确技术价值说明 → 主 CTA + 次 CTA。
- 右侧：机器人触觉/传感概念视觉或真实实拍；底色深蓝灰。可放技术编号、局部几何/受力标注，但不得占据主信息层级。
- 右侧技术图允许沿浏览器右侧出血；左侧文案必须保证阅读安全区域。
- 移动端改为**先完整文案、后大幅图像**，而不是将两个栏目硬压进窄屏。
- 禁止恢复旧版紫色关键词+洋红手绘划线；V2 标题强调使用朱红、无装饰性下划线。

### 8.4 Capability Cards

- 3 列能力区采用 `12px` 圆角、白底、1px 蓝灰边框、`16px` gap。
- 上方插图区分别使用 `#E9F2F7` / `#E8EEF4` / `#E6EEF5` 等冷色浅底，不同主题用图形内容而非热色块区分。
- 下方依次为编号/类别、能力标题、一段技术说明、文本链接。
- 用途：触觉/视触觉感知、机器人操作与控制、学习与系统集成；具体方向应受真实业务内容约束。

### 8.5 Technical Data Panel

- 深色 section 采用 `#101B29`，面板 `#1C2A3B`，顶部 toolbar `#172637`，边线 `#344E65`。
- 卡片圆角 `12px`，可用一层受控投影；热力图单元 `3–4px` 小圆角。
- 演示至少展示：数据名称、模拟/真实标识、状态、读数/单位、说明、控制项（如接触强度滑块、重置）。
- 数据与图形要双向对应；滑块变化应驱动所有相关读数，不能只是界面装饰。
- Demo 模拟时，应明确写出 `CONCEPT DEMO` / `模拟数据`，且不能通过表述暗示实际设备已连接。
- 聚焦控件应保持深底可见，滑块轨道和控制柄不以红绿区分唯一状态。

### 8.6 Product / Platform Showcase

- 整个分区使用钢灰底 `#EDF1F5`，用 2 列大幅工程图/产品信息组合。
- 突出结构、材料、传感位置、机械关系和功能路径；可通过受控蓝灰标注说明技术。
- 参数应注明单位、测量条件、兼容边界、版本与发布状态。
- 使用 `未发布`、`概念示意` 等准确状态，不应凭 UI 占位生成性能数据或虚构在售规格。

### 8.7 Research Cards

- 普通卡白底、12px 圆角、1px 冷灰边框；Featured 卡用 `#20384F` 深蓝灰底。
- 内容：研究分类、标题、摘要、日期/作者或团队、成果状态（期刊/会议/预印本/项目/内部研究方向）、可用的正式链接。
- 技术标签可采用只读 Pill 标签；若标签可点击用于筛选，则按 **8px 圆角筛选按钮**处理。
- 不得制造假的论文名称、虚构 DOI、发表状态或未授权的合作方 Logo。
- 移动端堆叠为单列，不能用 `line-clamp` 隐藏关键研究结论或来源。

### 8.8 Careers

- 招聘品牌区为深蓝灰 `#172638`，白字 + 冷蓝灰辅助图线 + 浅色按钮；不使用旧版紫色大块招聘区。
- 正式职位列表是内容型数据表/条目，而非营销卡片：清楚展示岗位名称、一个或多个工作地点、薪资范围或面议、类型、标签和申请入口。
- 筛选项可由后台配置；可包括地点、类型与岗位标签；筛选按钮采用 8px 圆角。
- 岗位详情页包含 JD、岗位状态、申请 CTA，以及按岗位配置的动态表单（文本、单选、多选、附件等）。
- 投递状态必须有提交中、成功、失败、已关闭等明确信息；简历/隐私说明不可缺失。

### 8.9 Forms & Contact

- 联系区 `#F4F7FA`，白色表单卡片，12px 圆角和 1px 边界；输入框 8px 圆角。
- 文本标签始终可见；不得以 placeholder 代替 label。
- 每种控件具备 `normal / focus / invalid / disabled` 等状态；焦点边框/外环建议 `#6794B3` 及浅蓝色软环，具体对比须校验。
- 无服务器连接的静态预览不能伪称消息“已送达”；必须明示是演示提交。
- 应提供隐私说明与必要的提交同意，后台不可回显他人信息。

### 8.10 Footer

- 背景 `#111C29`；白色品牌、冷蓝灰辅助文字及清晰分组导航。
- 包含公司、技术、产品、研究、招聘与必要法律/隐私链接；实际内容以已核实的公司资料为准。
- 不随意拼写变体 Logo；在获得正式白色字标前，深底品牌区可采用文本占位并明确标注为非官方 Logo。
- 不虚构办公地点、联系电话、备案号、合作机构或客户。

## 9. Page Patterns

### 9.1 首页 `/`

目标：让访客迅速理解 Tactip 关注**具身智能及触觉感知**，并知道可以探索技术、了解产品或联系团队。

顺序：Hero → 技术方向索引 → 核心能力 → 深色触觉 Demo → 产品平台 → 研究进展 → 招聘 → 联系 → 页脚。

### 9.2 技术页 `/technology`

问题定义 → 感知/行动流程 → 关键机制 → 实验数据与条件 → 限制与适用范围 → 相关论文/成果 → 交流入口。使用较多白底文章和深色数据面板，避免密集卡片化。

### 9.3 产品页 `/products`、`/products/[slug]`

产品概况 → 实物/工程渲染 → 核心能力 → 使用场景 → 规格/接口/限制 → 文档/SDK（如确有）→ 合作咨询。未发布的功能明确标记状态。

### 9.4 研究页 `/research`、`/research/[slug]`

展示类型筛选、真实日期、论文/项目链接、实验资源与状态；文章正文保留引用、公式、数据图例和可访问的视频替代内容。

### 9.5 关于我们 `/about`

公司定位 → 技术使命 → 实验与团队工作方式 → 真实团队/工作环境 → 对外联系。不要堆砌人像图库或无法证明的品牌里程碑。

### 9.6 招聘 `/careers`、`/careers/[slug]`

真实岗位列表 + 标签/地点/类型筛选 → JD 详情 → 定制化申请表单；提交过程与个人信息处理透明可理解。

### 9.7 联系 `/contact`

说明合作类别与预期沟通方式；仅索取必要数据，提供表单反馈、真实联系渠道与隐私政策。

## 10. Responsive Behavior

### 10.1 断点

| 范围 | 页面策略 | 核心变化 |
|---|---|---|
| `<480px` 小手机 | 单列 | Hero 约 43px，图像向下，Demo 内部单列 |
| `480–767px` 手机 | 单列 | Hero 约 43–62px，导航为展开菜单 |
| `768–1023px` 平板 | 2 列卡片/单列技术区 | Hero 视内容可保留分栏，压缩边距 |
| `1024–1190px` 小桌面 | 12 栏缩进 | 导航更紧凑，技术面板缩小 |
| `≥1191px` 桌面 | 完整 52:48 Hero | 3 列功能卡、主容器居中 |
| `≥1440px` 大屏 | 容器锁定 1360px | 全宽画面仍可出血，文字不可无限变宽 |

### 10.2 触控与折叠

- 按钮与主要交互目标至少 **44×44px**；常规按钮最小高度 48px。
- Hero 先文案后图像；导航折叠为 8px 菜单按钮。
- 技术 Demo 的图像/数据表允许分层堆叠；需要滚动的技术图表应有可见提示，而不是裁切关键信息。
- 长职位标题、地点列表和薪资信息可换行，不得以省略号隐藏重要信息。
- 不强制用 `100vh` 将 CTA 挤出可见区域；优先内容高度和 `min-height`。
- 所有移动弹层需可键盘关闭，并有明确返回主内容的焦点顺序。

### 10.3 无障碍与体验指标

- 每页唯一 `h1`，正文语义层级清晰，所有可点击图标有名称。
- WCAG 2.2 AA 是最低设计目标；用真实组件和背景检查文本、非文本对比度。
- 动图与自动更新数据可暂停、减少运动，有不依赖动画的描述。
- 建议核心 Web Vitals 目标：LCP ≤2.5s、CLS ≤0.1、INP ≤200ms（真实用户 75 百分位）。
- 关键品牌文案、技术描述、导航与联系 CTA 不依赖 JavaScript 才能显示。

## 11. Implementation Tokens

### 11.1 CSS 变量基线

以下为与 V2 设计一致的**推荐基础变量**。应从文档顶部 YAML 自动同步或定期校验，避免颜色值在实现中再次漂移。

```css
:root {
  /* Brand */
  --brand-ink: #47464B;
  --brand-red: #DC3826;
  --action: #C63121;
  --action-hover: #AE2D21;
  --action-pressed: #A9271B;

  /* Surfaces */
  --canvas: #FFFFFF;
  --canvas-cool: #F7F9FC;
  --canvas-subtle: #F4F7FA;
  --canvas-steel: #EDF1F5;
  --technical: #121C2A;
  --technical-deep: #101B29;
  --technical-raised: #1D2A3A;
  --research-feature: #20384F;
  --careers: #172638;
  --footer: #111C29;

  /* Text / structure */
  --ink: #161D28;
  --body: #4B5868;
  --muted: #5B6E7F;
  --body-on-dark: #C2CEDA;
  --line: #DCE3EB;
  --line-soft: #E7ECF1;
  --focus: #537FA2;
  --technical-blue: #647D98;
  --technical-blue-mid: #7394AC;

  /* Typography */
  --font-display: Manrope, Inter, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  --font-body: Inter, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  --font-mono: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;

  /* Geometry */
  --container: 1360px;
  --gutter: 40px;
  --radius-button: 8px;
  --radius-input: 8px;
  --radius-card: 12px;
  --section-space: 102px;
}

* { box-sizing: border-box; }
body { margin: 0; background: var(--canvas-cool); color: var(--ink); font-family: var(--font-body); }
.container { width: min(calc(100% - 2 * var(--gutter)), var(--container)); margin-inline: auto; }
.btn { min-height: 48px; border-radius: var(--radius-button); padding: 12px 25px; font-weight: 650; }
.btn-primary { color: #FFFFFF; background: var(--action); border: 1px solid transparent; }
.btn-primary:hover { background: var(--action-hover); }
.btn-primary:active { background: var(--action-pressed); }
.btn-secondary { color: #26384A; background: #FFFFFF; border: 1px solid #A9B7C5; }
.card { border: 1px solid var(--line); border-radius: var(--radius-card); background: #FFFFFF; }
input, textarea, select { border: 1px solid var(--line); border-radius: var(--radius-input); }
:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
::selection { background: #DEEAF4; color: var(--ink); }

@media (max-width: 1023px) { :root { --gutter: 24px; --section-space: 86px; } }
@media (max-width: 767px)  { :root { --gutter: 20px; --section-space: 64px; } }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 11.2 工程实施规则

1. **一个 Token 来源。** 以 YAML frontmatter 为准生成 CSS/TS/Tailwind tokens；不要同时在 `:root` 和组件中复制维护多套 HEX。
2. **不要继承旧预览的基础样式。** 原 V1 可能残留暖色变量和 Pill 默认按钮；V2 实现应直接以最终值覆盖或删除，避免 cascade 顺序意外复活。
3. **组件基类先落实。** `Button`、`Input`、`Card`、`Navigation`、`DataPanel` 的颜色、圆角和状态需全局统一。
4. **亮/暗明确变体。** 用语义属性（例如 `data-theme="dark"`）管理文本、图标、边界与背景，而不是在业务页面临时塞硬编码色值。
5. **示意数据可追溯。** 演示组件写清楚 `demo/simulated/live`，禁止在生产数据组件中静默回退到虚构读数。
6. **图片资产治理。** 用正式 Logo，独立的产品摄影与插图资源；在替换预览图时保留图例、说明与 alt 文本。
7. **样式验收基线。** 参考 `tactip-preview-cool.html` 的布局、色彩和节奏，但实际生产页面以无障碍、真实内容和设备兼容为最终标准。

## 12. Do's and Don'ts

### Do

- 让**冷白与深石墨蓝**构成稳定主体，红色只做品牌识别、主要操作和接触重点。
- 用真实设备、显微/触觉近景、工程结构和来源明确的数据建立科技感。
- 保持按钮/输入框 **8px**、内容卡片 **12px**、全宽版块 **0px** 的圆角语法。
- 在研究与技术页面显示方法、范围、限制、出处、版本和模拟/实测状态。
- 以整洁栅格、适量留白、明显字级和有节制的细线体现研究机构与工程团队的专业性。
- 在移动端保留技术内容的完整含义与表单可操作性。

### Don't

- 不再将旧版暖白、米色、洋红、橙色作为全站主色或卡片底色。
- 不把全 Pill 按钮带回常规 UI，也不把所有圆角都放大到 20px 以上。
- 不使用泛科技蓝的主 CTA，不增加第二套竞争品牌主色。
- 不使用无解释的霓虹网格、光球、粒子、伪仪表盘或悬浮 3D 机器人填充空白。
- 不把模拟图、概念器件、随机数与虚构功能误写成真实成果。
- 不复制 Bristol 大学的品牌资产；只保留其编辑叙事思路。
- 不依赖动画、颜色差异或小字号弱对比完成关键交互信息传达。

## 13. Iteration Guide

1. **先评估技术内容与证据**：公司定位、产品状态、研究成果、联系方式必须真实。
2. **先选择页面背景类型**：`canvas-cool` / `canvas` / `canvas-steel` / `surface-technical`，再选择相应的文本与 CTA 变体。
3. **从已存在的 token 选择颜色与圆角**；新增项必须有明确的语义和使用范围。
4. **按单个组件迭代**：一个修改同时覆盖默认、聚焦、禁用、加载、深色和移动状态。
5. **先实现静态可读内容，再实现演示交互**；无 JS 和 reduced-motion 均需可用。
6. **用完整页面判断色彩比例**：单个卡片好看，不代表整页有节奏。
7. **对照 V2 截图与正式设计规范验收**：确保暖色/Pill 旧样式没有从复用组件中回流。

## 14. Acceptance Checklist

- [ ] Logo 使用正式深灰字标与朱红点，不拉伸、重绘或错配红色。
- [ ] 页面主背景为冷白/白/钢灰，深色区为石墨蓝；没有未获批准的大面积暖米色、紫色、橙色、洋红色。
- [ ] 常规按钮、输入、筛选/工具按钮均为 **8px 圆角**；卡片默认为 **12px**。
- [ ] 主 CTA 为 `#C63121`，品牌 Logo 红点仍为 `#DC3826`。
- [ ] 首页呈现编辑式大标题 + 深色技术视觉，主标题与 CTA 在移动端优先可见。
- [ ] 技术实验图有状态、单位、图例、来源和明确的真实/模拟区分。
- [ ] 产品、研究、团队、合作、招聘信息可核实，未把概念示意标成已发布成果。
- [ ] 导航、按钮、表单、模态框可键盘操作，焦点清晰可见。
- [ ] 文字、按钮和非文本控件满足 WCAG 2.2 AA 相应对比度要求。
- [ ] 页面在 390 / 768 / 1024 / 1440px 等典型宽度无横向溢出。
- [ ] 减少动态效果、禁用 JavaScript、图片加载失败时，主要内容和 CTA 不丢失。
- [ ] 图像按真实内容匹配裁切、alt、延迟加载与尺寸占位。
- [ ] 全站没有沿用暖色 V1 的 CSS 变量或 Pill 默认样式。

## 15. Known Gaps / Content Requirements

- **Logo 原始矢量文件：** 当前以位图导出的透明 Logo 为预览资产。正式设计如需反白字标、favicon、图标版，应由品牌源文件确认。
- **文案：** 预览的品牌宣言、技术摘要和 CTA 文案属于展示稿，需要正式对外发布审核。
- **产品/实验：** 尚未提供完整的实拍、真实参数、数据单位、方法与来源。必须独立确认后才能上线。
- **技术与论文：** 研究成果页面应关联真实原文、出版状态、合法使用的图表与媒体许可。
- **字体：** 实际部署的 Manrope / Inter / Noto Sans SC / IBM Plex Mono 字体文件与授权、加载方式待工程确认。
- **表单与隐私：** 静态预览并未构成真实后端提交；对外收集信息前需提供接口、存储策略与隐私政策。
- **保留紫色：** `accent-plum-reserved` 非默认界面颜色，今后如果用于独立市场活动，需要设计评审。

## References

1. [Tactip V2 冷色科技风预览](./tactip-preview-cool.html)：本版布局、配色、组件状态和响应式的主要视觉依据。
2. [Tactip Logo（透明版）](./tactip-logo-transparent.png) 与 [Logo 原始上传](./logo.png)：字标造型与红点识别来源。
3. [上一版 DESIGN.md 备份](./DESIGN.original.md)：保留 Design System 文档结构的参考；其 Apple 视觉规则不再作为最终设计约束。
4. [University of Bristol — UG 2027 Singapore](https://www.bristol.ac.uk/campaigns/ug-2027-singapore/)：编辑式营销叙事的间接参考；不是本规范最终色值来源。

---

**执行优先级：真实技术内容 > 品牌识别 > 可访问性与交互 > 冷色几何系统一致性 > 视觉动效。**
