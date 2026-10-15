---
version: alpha
name: XiHan.UI
description: 'XiHan.UI 4.2.0 缺省主题（浅色 · 舒适密度 · 基础对比度）的设计语言：中性克制、描边分界、4px 网格、令牌驱动。'
colors:
  primary: 'oklch(0.546 0.216 258)'
  primary-hover: 'oklch(0.488 0.196 258)'
  primary-active: 'oklch(0.424 0.164 258)'
  on-primary: 'oklch(1 0 0)'
  primary-subtle: 'color-mix(in oklab, oklch(0.546 0.216 258) 12%, oklch(1 0 0))'
  on-primary-subtle: 'color-mix(in oklab, oklch(0.546 0.216 258) 60%, oklch(0.208 0.006 258))'
  page: 'oklch(0.964 0.004 265)'
  surface: 'oklch(1 0 0)'
  surface-raised: 'oklch(1 0 0)'
  field: 'color-mix(in oklab, color-mix(in oklab, oklch(0 0 0) 4.7%, transparent) 55%, transparent)'
  subtle: 'color-mix(in oklab, oklch(0 0 0) 4.7%, transparent)'
  subtle-hover: 'color-mix(in oklab, oklch(0 0 0) 10.2%, transparent)'
  subtle-active: 'color-mix(in oklab, oklch(0 0 0) 16.9%, transparent)'
  on-surface: 'oklch(0.208 0.006 258)'
  on-surface-muted: 'oklch(0.461 0.018 258)'
  on-surface-subtle: 'oklch(0.52 0.018 256)'
  disabled: 'oklch(0.7 0.016 258)'
  outline: 'color-mix(in oklab, oklch(0 0 0) 10.2%, transparent)'
  outline-subtle: 'color-mix(in oklab, oklch(0 0 0) 4.7%, transparent)'
  outline-strong: 'color-mix(in oklab, oklch(0 0 0) 16.9%, transparent)'
  outline-control-hover: 'color-mix(in oklab, oklch(0 0 0) 37.9%, transparent)'
  focus-ring: 'oklch(0.546 0.216 258)'
  success: 'oklch(0.51 0.15 149)'
  warning: 'oklch(0.62 0.15 70)'
  info: 'oklch(0.53 0.15 237)'
  danger: 'oklch(0.577 0.213 25)'
  scrim: 'color-mix(in oklab, oklch(0.208 0.006 258) 60%, transparent)'
typography:
  display:
    fontFamily: '-apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: '1.75rem'
    lineHeight: 1.25
  heading-1:
    fontFamily: '-apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: '1.5rem'
    fontWeight: 500
    lineHeight: 1.25
  heading-2:
    fontFamily: '-apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: '1.25rem'
    fontWeight: 500
    lineHeight: 1.25
  heading-3:
    fontFamily: '-apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: '1rem'
    fontWeight: 500
    lineHeight: 1.25
  body:
    fontFamily: '-apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: '-apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.5
  secondary:
    fontFamily: '-apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: '0.8125rem'
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: '-apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: '0.75rem'
    fontWeight: 400
    lineHeight: 1.5
  code:
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
    fontSize: '0.8125rem'
    lineHeight: '1.5rem'
rounded:
  none: '0px'
  sm: '2px'
  md: '4px'
  lg: '8px'
  xl: '16px'
  full: '9999px'
  control: '2px'
  surface: '4px'
  overlay: '4px'
spacing:
  unit: '4px'
  xs: '4px'
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '24px'
  2xl: '32px'
  control-sm: '28px'
  control-md: '32px'
  control-lg: '36px'
  hit-coarse: '44px'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    height: '{spacing.control-md}'
    padding: '0 16px'
  button-primary-hover:
    backgroundColor: '{colors.primary-hover}'
  button-primary-active:
    backgroundColor: '{colors.primary-active}'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.on-surface}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    height: '{spacing.control-md}'
    padding: '0 16px'
  button-ghost-hover:
    backgroundColor: '{colors.subtle}'
  button-ghost-active:
    backgroundColor: '{colors.subtle-hover}'
  input:
    backgroundColor: '{colors.field}'
    textColor: '{colors.on-surface}'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    height: '{spacing.control-md}'
    padding: '0 12px'
    width: '16rem'
  input-focus:
    backgroundColor: '{colors.surface}'
  card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.on-surface}'
    rounded: '{rounded.surface}'
    padding: '20px 16px'
  menu:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.on-surface}'
    typography: '{typography.body}'
    rounded: '{rounded.overlay}'
  menu-item-hover:
    backgroundColor: '{colors.subtle}'
  list-item-selected:
    backgroundColor: '{colors.primary-subtle}'
    textColor: '{colors.on-primary-subtle}'
  dialog:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.on-surface}'
    rounded: '{rounded.overlay}'
  tooltip:
    backgroundColor: '{colors.on-surface}'
    textColor: '{colors.surface}'
    typography: '{typography.secondary}'
    rounded: '{rounded.control}'
  badge:
    backgroundColor: '{colors.danger}'
    textColor: '{colors.on-primary}'
    typography: '{typography.caption}'
    rounded: '{rounded.full}'
---
## Overview

XiHan.UI 是框架无关的设计系统运行时：组件行为住在 Headless 层，Vue、React 与 Web Components 三端消费同一份纯 CSS 皮肤，所以三端外观一致。视觉取向是**中性、克制、任务导向**：页面主体保持中性，只有主按钮缺省使用品牌实心，品牌淡底专门表达「选中 / 当前」；层级先靠描边、间距与字重区分，阴影只表达真实的抬升。

所有尺度都是令牌：颜色、间距、圆角、描边、阴影与动效不写散值，皮肤里的每个数字都能回溯到一支 `--xh-*` 令牌。本文件取值是缺省档；深色、紧凑、高对比、减弱动效、减少透明度、强制色与打印是同一份皮肤的不同切面，组件身份（形状、结构）在各切面下不变。

完整规范：https://ui.docs.xihanfun.com/design/

## Colors

颜色用 OKLCH 表达，明度感知均匀：同一档跨色相同一明度，换色相不必重算对比度。颜色分三层——基础色板（primitive）、语义角色（`--xh-bg-*` / `--xh-fg-*` / `--xh-border-*` / `--xh-ring-*`）与组件覆盖槽（`--xh-<组件>-*`）；界面只消费语义角色，不直接取色板。

- 品牌色是从种子派生的 11 档梯度，600 档是锚点：实心底取 600，悬停 700，按下 800；品牌淡底按比例混入承载面。
- 页面底（page）是冷灰，内容面（surface）是白；淡底与三档边线不取灰色板，而是墨色按比例透明（淡底 4.7% / 10.2% / 16.9%）。
- 状态色（success / warning / info / danger）表达任务结果，不表达空间层级；错误、警告、选择与加载不能只靠颜色，必须同时有图标、文案或形状。
- 正文与背景对比至少 4.5:1，大字与图形至少 3:1；焦点环颜色不随语气变化。

## Typography

组件不指定正文字族，控件与面板继承宿主页面的字体；库只定等宽字族、字号阶梯、字重、行高与排版角色。中后台建议系统字栈，数字密集处开启 `font-variant-numeric: tabular-nums`。

- 字号以 rem 记：正文、标签与 md 档控件 0.875rem，说明与 sm 档控件 0.8125rem，次级标注 0.75rem；标题三级 1rem / 1.25rem / 1.5rem，字重 500。
- 层级由字号、字重、行高与间距共同表达，不只调颜色；密度切换不缩字号。
- 代码、密钥、哈希与快捷键用等宽字族 `--xh-font-family-mono`。

## Layout

只有一把尺：4px 网格。间距阶梯 4px / 8px / 12px / 16px / 24px / 32px，2 / 6 / 10px 只用于图标基线与几何补偿；信息关系越紧密间距越小，不同信息组之间至少升一档。

- 控件高 sm / md / lg = 28px / 32px / 36px（紧凑密度各降 4px），md 是缺省；同一 size 不随断点改变。
- 尺寸档同时换行内内衬（8px / 12px / 16px）、间隙、字号与图标；按钮这类文字动作控件的行内内衬再宽一档。
- 字段缺省宽 16rem、压缩底线 12rem，放进表单字段即铺满。
- 粗指针下命中区至少 44px，用伪元素外扩，不改布局盒。
- 面的内衬只走 `--xh-surface-*`，页面分段走 `--xh-section-py-*`，列隙走 `--xh-layout-gap-*`。

## Elevation & Depth

阴影只表达「离页面多远」，不表达边界——边界归描边。只有四个海拔角色：

- raised：贴在页面上略抬起的面（Card、开关拇指），缺省无影，边界全靠描边。
- lifted：正被指针拖动的东西，`0 4px 10px oklch(0 0 0 / 0.1)`。
- floating：含网格或多列的锚定面板（日期面板、多列级联），`0 4px 10px oklch(0 0 0 / 0.1)`。
- sheet：模态与强反馈面（Dialog、Drawer、Command、Notification），`0 4px 12px oklch(0 0 0 / 0.15)`。

锚定瞬态浮层（菜单、气泡）是实体白底 + 1px 描边 + 一层柔和投影，不采样背后内容；没有玻璃拟态材质。

## Shapes

圆角只有一条语义阶梯：控件本体（Button、Input、Select、Tag 方签、Alert 提示条）2px，成面的静态容器（Card、Panel、列表容器）4px，脱离文档流的浮层（Popover、Menu、Dialog）4px。

- pill 只给两类身份：状态 chip（Badge）与一维对象（轨道、进度条、指示条、滚动条滑块）；普通按钮、字段、卡片与浮层不用 pill。
- 宽高相等的圆（头像、单选圈、拇指、圆形图标钮）取 circle，不用 pill 冒充。
- 内层圆角不超过外层圆角减去内边距；相连控件（输入组、按钮组）消除相接侧圆角；锚定浮层里的列表行是通栏行，不取圆角。
- 描边只有 1px / 2px / 3px 三档：一切描边与分隔线用细档，焦点环与选中指示条用粗档。

## Components

组件先归族再画样式，同族同类部件逐条同值：

- **Action Control**（Button、Toggle、图标按钮、分页按钮、各类 trigger）：只有 Button 缺省品牌实心，其余缺省中性；按下 120ms 换到 active 底、释放 200ms 回到 rest，缺省只换面不缩放。
- **Field Chrome**（Input、Select trigger、日期与时间字段、Combobox）：静息是淡底 `--xh-bg-field` + 控件描边、无影；聚焦换承载面底 + 品牌描边，不画聚焦环；校验失败换 danger 描边与淡底。
- **Collection Item**（菜单项、列表项、树节点、表格行）：悬停在白底上取 hover 100 档、按下 200 档；选中按语境只有一种标记——浮层集合是行尾对号，页内集合是品牌淡底，导航是指示条或品牌字色。
- **Surface**（Card、Alert、Panel）：边界三选一——描边（缺省）、淡底、无壳；Card 的抬起影是加成，描边必须在。
- **Overlay**（Popover、Menu、Tooltip、Dialog、Drawer）：浮层圆角 overlay，模态取 sheet 海拔并带遮罩；有进场就有退场。
- **Feedback**（Notification、Progress、Skeleton）：状态语气配图标与文案，进行中给可感知的进度。

公共视觉轴只有 `size`（sm / md / lg）、`variant`（outline / subtle / ghost，可按下的面多一档 solid）与 `tone`（brand / neutral / danger / warning / success / info），没有私有的 bordered、primary 之类开关。

## Do's and Don'ts

- Do：颜色、间距、圆角、阴影与动效只取 `--xh-*` 令牌；缺令牌时先加语义令牌，不写散值。
- Don't：写 5px、6px、10px 这类独立圆角或 5 / 7 / 9 / 13px 这类散值间距。
- Do：用描边划分边界，阴影只表达抬升。
- Don't：用阴影或大面积色块代替描边做分区，也不要做玻璃拟态的半透明面。
- Do：主要动作用 Button 缺省的品牌实心，次要动作用中性的 outline / subtle / ghost 形态。
- Don't：把品牌淡底用于「今天」「已完成」「展开中」这类非选中语义。
- Do：错误、警告与选中同时给图标、文案或形状通道；禁用同时调整前景或背景并关闭交互。
- Don't：只靠颜色区分状态，或只把禁用项降低透明度。
- Do：中后台页面保持紧凑、清晰、任务导向，列表与表单优先信息密度。
- Don't：在控制台页面放营销式大标题、装饰性 Hero 区或大面积插画。

## Customization

1. 品牌色：用 `registerBrand` 从一个种子色派生整条 11 档品牌梯度，明度曲线不变，对比度保证随之成立。
2. 视觉环境：`createVisualEnvironmentController` 把明暗、密度、对比度、动效、透明度等偏好写到根元素的 `data-*` 属性上，皮肤随之切换。
3. 全局令牌：在 `:root` 或任意子树上直接改写同名 `--xh-*` 语义令牌，作用域内的组件随之变化。
4. 组件覆盖槽：改写 `--xh-<组件>-*` 只影响该组件，缺省值回落到语义令牌。
5. 覆盖样式写进 `@layer xihan.overrides`，按 `[data-scope][data-part]` 部件选择器书写，不依赖类名。

主题设计器：https://ui.docs.xihanfun.com/design/theme-designer
