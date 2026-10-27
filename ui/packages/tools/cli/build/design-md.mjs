// 生成 design.md：YAML 头的令牌取值全部从 tokens.json 展开，正文是缺省主题的视觉规则。
// 格式遵循 google-labs-code/design.md：头部是机读令牌，正文按 Overview → Do's and Don'ts 的顺序分节。
import { resolveTokenValue } from './tokens.mjs'

const SYSTEM_FONT = '-apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'

/** YAML 标量：数字原样，其余一律单引号。 */
function scalar(value) {
  if (typeof value === 'number')
    return String(value)
  return `'${String(value).replace(/'/g, '\'\'')}'`
}

function yamlBlock(key, entries) {
  const lines = [`${key}:`]
  for (const [name, value] of entries) {
    if (value && typeof value === 'object') {
      lines.push(`  ${name}:`)
      for (const [k, v] of Object.entries(value))
        lines.push(`    ${k}: ${scalar(v)}`)
    }
    else {
      lines.push(`  ${name}: ${scalar(value)}`)
    }
  }
  return lines.join('\n')
}

/**
 * @param {{ version: string, site: string, values: Record<string, string> }} input
 *   values 是 tokens.json 的内容。
 */
export function renderDesignMd({ version, site, values }) {
  const t = (name) => {
    const key = `--xh-${name}`
    if (!(key in values))
      throw new Error(`[design.md] 令牌 ${key} 不存在，令牌改名后同步 build/design-md.mjs`)
    return resolveTokenValue(values, values[key])
  }
  const num = name => Number(t(name))
  /** 圆角档是种子的 calc 倍数：解到像素，DESIGN.md 的尺寸只认字面量。 */
  const px = (name) => {
    const value = t(name)
    const hit = /^calc\(([\d.]+)px \* ([\d.]+)\)$/.exec(value)
    return hit ? `${Number(hit[1]) * Number(hit[2])}px` : value
  }

  const colors = [
    ['primary', t('bg-brand')],
    ['primary-hover', t('bg-brand-hover')],
    ['primary-active', t('bg-brand-active')],
    ['on-primary', t('fg-on-brand')],
    ['primary-subtle', t('bg-brand-subtle')],
    ['on-primary-subtle', t('fg-on-brand-subtle')],
    ['page', t('bg-page')],
    ['surface', t('bg-surface')],
    ['surface-raised', t('bg-surface-raised')],
    ['field', t('bg-field')],
    ['subtle', t('bg-subtle')],
    ['subtle-hover', t('bg-subtle-hover')],
    ['subtle-active', t('bg-subtle-active')],
    ['on-surface', t('fg-default')],
    ['on-surface-muted', t('fg-muted')],
    ['on-surface-subtle', t('fg-subtle')],
    ['disabled', t('fg-disabled')],
    ['outline', t('border-default')],
    ['outline-subtle', t('border-subtle')],
    ['outline-strong', t('border-strong')],
    ['outline-control-hover', t('border-control-hover')],
    ['focus-ring', t('ring-focus')],
    ['success', t('fg-success')],
    ['warning', t('fg-warning')],
    ['info', t('fg-info')],
    ['danger', t('fg-danger')],
    ['scrim', t('bg-overlay')],
  ]

  const typography = [
    ['display', { fontFamily: SYSTEM_FONT, fontSize: t('text-display-size'), lineHeight: num('leading-tight') }],
    ['heading-1', { fontFamily: SYSTEM_FONT, fontSize: t('text-heading-1-size'), fontWeight: num('text-heading-1-weight'), lineHeight: num('leading-tight') }],
    ['heading-2', { fontFamily: SYSTEM_FONT, fontSize: t('text-heading-2-size'), fontWeight: num('text-heading-2-weight'), lineHeight: num('leading-tight') }],
    ['heading-3', { fontFamily: SYSTEM_FONT, fontSize: t('text-heading-3-size'), fontWeight: num('text-heading-3-weight'), lineHeight: num('leading-tight') }],
    ['body', { fontFamily: SYSTEM_FONT, fontSize: t('text-body-size'), fontWeight: num('text-body-weight'), lineHeight: num('text-body-leading') }],
    ['label', { fontFamily: SYSTEM_FONT, fontSize: t('text-label-size'), fontWeight: num('text-label-weight'), lineHeight: num('leading-normal') }],
    ['secondary', { fontFamily: SYSTEM_FONT, fontSize: t('text-secondary-size'), fontWeight: num('font-weight-regular'), lineHeight: num('leading-normal') }],
    ['caption', { fontFamily: SYSTEM_FONT, fontSize: t('text-caption-size'), fontWeight: num('font-weight-regular'), lineHeight: num('leading-normal') }],
    ['code', { fontFamily: t('font-family-mono'), fontSize: t('font-size-sm'), lineHeight: t('text-code-leading') }],
  ]

  const rounded = [
    ['none', t('radius-none')],
    ['xs', px('radius-xs')],
    ['sm', px('radius-sm')],
    ['md', px('radius-md')],
    ['lg', px('radius-lg')],
    ['full', t('radius-full')],
    ['inset', px('shape-inset')],
    ['control', px('shape-control')],
    ['surface', px('shape-surface')],
    ['overlay', px('shape-overlay')],
    ['sheet', px('shape-sheet')],
  ]

  const spacing = [
    ['unit', t('space-1')],
    ['xs', t('space-1')],
    ['sm', t('space-2')],
    ['md', t('space-3')],
    ['lg', t('space-4')],
    ['xl', t('space-6')],
    ['2xl', t('space-8')],
    ['control-sm', t('control-h-sm')],
    ['control-md', t('control-h-md')],
    ['control-lg', t('control-h-lg')],
    ['hit-coarse', t('control-hit-coarse')],
  ]

  const buttonPadding = `0 ${t('space-4')}`
  const components = [
    ['button-primary', { backgroundColor: '{colors.primary}', textColor: '{colors.on-primary}', typography: '{typography.label}', rounded: '{rounded.control}', height: '{spacing.control-md}', padding: buttonPadding }],
    ['button-primary-hover', { backgroundColor: '{colors.primary-hover}' }],
    ['button-primary-active', { backgroundColor: '{colors.primary-active}' }],
    ['button-ghost', { backgroundColor: 'transparent', textColor: '{colors.on-surface}', typography: '{typography.label}', rounded: '{rounded.control}', height: '{spacing.control-md}', padding: buttonPadding }],
    ['button-ghost-hover', { backgroundColor: '{colors.subtle}' }],
    ['button-ghost-active', { backgroundColor: '{colors.subtle-hover}' }],
    ['input', { backgroundColor: '{colors.field}', textColor: '{colors.on-surface}', typography: '{typography.body}', rounded: '{rounded.control}', height: '{spacing.control-md}', padding: `0 ${t('control-px-md')}`, width: t('control-w') }],
    ['input-focus', { backgroundColor: '{colors.surface}' }],
    ['card', { backgroundColor: '{colors.surface}', textColor: '{colors.on-surface}', rounded: '{rounded.surface}', padding: `${t('surface-py-md')} ${t('surface-px-md')}` }],
    ['menu', { backgroundColor: '{colors.surface}', textColor: '{colors.on-surface}', typography: '{typography.body}', rounded: '{rounded.overlay}' }],
    ['menu-item-hover', { backgroundColor: '{colors.subtle}' }],
    ['list-item-selected', { backgroundColor: '{colors.primary-subtle}', textColor: '{colors.on-primary-subtle}' }],
    ['dialog', { backgroundColor: '{colors.surface}', textColor: '{colors.on-surface}', rounded: '{rounded.sheet}' }],
    ['tooltip', { backgroundColor: '{colors.on-surface}', textColor: '{colors.surface}', typography: '{typography.secondary}', rounded: '{rounded.control}' }],
    ['badge', { backgroundColor: '{colors.danger}', textColor: '{colors.on-primary}', typography: '{typography.caption}', rounded: '{rounded.full}' }],
  ]

  const header = [
    '---',
    'version: alpha',
    'name: XiHan.UI',
    `description: ${scalar(`XiHan.UI ${version} 缺省主题（浅色 · 舒适密度 · 基础对比度）的设计语言：中性克制、描边分界、4px 网格、令牌驱动。`)}`,
    yamlBlock('colors', colors),
    yamlBlock('typography', typography),
    yamlBlock('rounded', rounded),
    yamlBlock('spacing', spacing),
    yamlBlock('components', components),
    '---',
  ].join('\n')

  const body = `
## Overview

XiHan.UI 是框架无关的设计系统运行时：组件行为住在 Headless 层，Vue、React 与 Web Components 三端消费同一份纯 CSS 皮肤，所以三端外观一致。视觉取向是**中性、克制、任务导向**：页面主体保持中性，只有主按钮缺省使用品牌实心，品牌淡底专门表达「选中 / 当前」；层级先靠描边、间距与字重区分，阴影只表达真实的抬升。

所有尺度都是令牌：颜色、间距、圆角、描边、阴影与动效不写散值，皮肤里的每个数字都能回溯到一支 \`--xh-*\` 令牌。本文件取值是缺省档；深色、紧凑、高对比、减弱动效、减少透明度、强制色与打印是同一份皮肤的不同切面，组件身份（形状、结构）在各切面下不变。

完整规范：${site}/design/

## Colors

颜色用 OKLCH 表达，明度感知均匀：同一档跨色相同一明度，换色相不必重算对比度。颜色分三层——基础色板（primitive）、语义角色（\`--xh-bg-*\` / \`--xh-fg-*\` / \`--xh-border-*\` / \`--xh-ring-*\`）与组件覆盖槽（\`--xh-<组件>-*\`）；界面只消费语义角色，不直接取色板。

- 品牌色是从种子派生的 11 档梯度，600 档是锚点：实心底取 600，悬停 700，按下 800；品牌淡底按比例混入承载面。
- 页面底（page）是冷灰，内容面（surface）是白；淡底与三档边线不取灰色板，而是墨色按比例透明（淡底 4.7% / 10.2% / 16.9%）。
- 状态色（success / warning / info / danger）表达任务结果，不表达空间层级；错误、警告、选择与加载不能只靠颜色，必须同时有图标、文案或形状。
- 正文与背景对比至少 4.5:1，大字与图形至少 3:1；焦点环颜色不随语气变化。

## Typography

组件不指定正文字族，控件与面板继承宿主页面的字体；库只定等宽字族、字号阶梯、字重、行高与排版角色。中后台建议系统字栈，数字密集处开启 \`font-variant-numeric: tabular-nums\`。

- 字号以 rem 记：正文、标签与 md 档控件 ${t('font-size-md')}，说明与 sm 档控件 ${t('font-size-sm')}，次级标注 ${t('font-size-xs')}；标题三级 ${t('text-heading-3-size')} / ${t('text-heading-2-size')} / ${t('text-heading-1-size')}，字重 ${t('text-heading-1-weight')}。
- 层级由字号、字重、行高与间距共同表达，不只调颜色；密度切换不缩字号。
- 代码、密钥、哈希与快捷键用等宽字族 \`--xh-font-family-mono\`。

## Layout

只有一把尺：4px 网格。间距阶梯 ${t('space-1')} / ${t('space-2')} / ${t('space-3')} / ${t('space-4')} / ${t('space-6')} / ${t('space-8')}，2 / 6 / 10px 只用于图标基线与几何补偿；信息关系越紧密间距越小，不同信息组之间至少升一档。

- 控件高 sm / md / lg = ${t('control-h-sm')} / ${t('control-h-md')} / ${t('control-h-lg')}（紧凑密度各降 4px），md 是缺省；同一 size 不随断点改变。
- 尺寸档同时换行内内衬（${t('control-px-sm')} / ${t('control-px-md')} / ${t('control-px-lg')}）、间隙、字号与图标；按钮这类文字动作控件的行内内衬再宽一档。
- 字段缺省宽 ${t('control-w')}、压缩底线 ${t('control-min-w')}，放进表单字段即铺满。
- 粗指针下命中区至少 ${t('control-hit-coarse')}，用伪元素外扩，不改布局盒。
- 面的内衬只走 \`--xh-surface-*\`，页面分段走 \`--xh-section-py-*\`，列隙走 \`--xh-layout-gap-*\`。

## Elevation & Depth

阴影只表达「离页面多远」，不表达边界——边界归描边。只有四个海拔角色：

- raised：贴在页面上略抬起的面（Card、开关拇指），缺省无影，边界全靠描边。
- lifted：正被指针拖动的东西，\`${t('elevation-lifted')}\`。
- floating：含网格或多列的锚定面板（日期面板、多列级联），\`${t('elevation-floating')}\`。
- sheet：模态与强反馈面（Dialog、Drawer、Command、Notification），\`${t('elevation-sheet')}\`。

锚定瞬态浮层（菜单、气泡）是实体白底 + 1px 描边 + md 档投影，不采样背后内容；没有玻璃拟态材质。阴影只有三档，按面的类型取：贴在页面上的抬起面 sm、锚定浮层 md、模态与强反馈面 lg。

## Shapes

圆角只有一颗种子 \`--xh-radius-seed\`（${t('radius-seed')}），各档按比例派生，组件只引语义角色：嵌在控件、面与浮层里的小块（勾选方框、集合行、轨道里的段与滑块、字段里的标签）${px('shape-inset')}，控件本体（Button、Input、Select、Tag 方签、Alert 提示条）${px('shape-control')}，成面的静态容器（Card、Panel、列表容器）${px('shape-surface')}，脱离文档流的弹层（Popover、Menu、候选面板）${px('shape-overlay')}，模态与强反馈面（Dialog、Drawer、Notification 卡片）${px('shape-sheet')}。

- pill 只给两类身份：状态 chip（Badge）与一维对象（轨道、进度条、指示条、滚动条滑块）；普通按钮、字段、卡片与浮层不用 pill。
- 宽高相等的圆（头像、单选圈、拇指、圆形图标钮）取 circle，不用 pill 冒充。
- 内层圆角不超过外层圆角减去内边距：浮层留 4px 内距，里面的列表行取 inset；相连控件（输入组、按钮组）消除相接侧圆角。
- 描边只有 ${t('stroke-thin')} / ${t('stroke-thick')} / ${t('stroke-strong')} 三档：一切描边与分隔线用细档，焦点环与选中指示条用粗档。

## Components

组件先归族再画样式，同族同类部件逐条同值：

- **Action Control**（Button、Toggle、图标按钮、分页按钮、各类 trigger）：只有 Button 缺省品牌实心，其余缺省中性；按下 150ms 换到 active 底、释放 200ms 回到 rest，缺省只换面不缩放。
- **Field Chrome**（Input、Select trigger、日期与时间字段、Combobox）：静息是淡底 \`--xh-bg-field\` + 控件描边、无影；聚焦换承载面底 + 品牌描边，不画聚焦环；校验失败换 danger 描边与淡底。
- **Collection Item**（菜单项、列表项、树节点、表格行）：悬停在白底上取 hover 100 档、按下 200 档；选中按语境只有一种标记——浮层集合是行尾对号，页内集合是品牌淡底，导航是指示条或品牌字色。
- **Surface**（Card、Alert、Panel）：边界三选一——描边（缺省）、淡底、无壳；Card 的抬起影是加成，描边必须在。
- **Overlay**（Popover、Menu、Tooltip、Dialog、Drawer）：弹层圆角 overlay，模态取 sheet 圆角与海拔并带遮罩；有进场就有退场。
- **Feedback**（Notification、Progress、Skeleton）：状态语气配图标与文案，进行中给可感知的进度。

公共视觉轴只有 \`size\`（sm / md / lg）、\`variant\`（outline / subtle / ghost，可按下的面多一档 solid）与 \`tone\`（brand / neutral / danger / warning / success / info），没有私有的 bordered、primary 之类开关。

## Do's and Don'ts

- Do：颜色、间距、圆角、阴影与动效只取 \`--xh-*\` 令牌；缺令牌时先加语义令牌，不写散值。
- Don't：写 5px、6px 这类字面圆角或 5 / 7 / 9 / 13px 这类散值间距。
- Do：用描边划分边界，阴影只表达抬升。
- Don't：用阴影或大面积色块代替描边做分区，也不要做玻璃拟态的半透明面。
- Do：主要动作用 Button 缺省的品牌实心，次要动作用中性的 outline / subtle / ghost 形态。
- Don't：把品牌淡底用于「今天」「已完成」「展开中」这类非选中语义。
- Do：错误、警告与选中同时给图标、文案或形状通道；禁用同时调整前景或背景并关闭交互。
- Don't：只靠颜色区分状态，或只把禁用项降低透明度。
- Do：中后台页面保持紧凑、清晰、任务导向，列表与表单优先信息密度。
- Don't：在控制台页面放营销式大标题、装饰性 Hero 区或大面积插画。

## Customization

1. 品牌色：用 \`registerBrand\` 从一个种子色派生整条 11 档品牌梯度，明度曲线不变，对比度保证随之成立。
2. 视觉环境：\`createVisualEnvironmentController\` 把明暗、密度、对比度、动效、透明度等偏好写到根元素的 \`data-*\` 属性上，皮肤随之切换。
3. 全局令牌：在 \`:root\` 或任意子树上直接改写同名 \`--xh-*\` 语义令牌，作用域内的组件随之变化。
4. 组件覆盖槽：改写 \`--xh-<组件>-*\` 只影响该组件，缺省值回落到语义令牌。
5. 覆盖样式写进 \`@layer xihan.overrides\`，按 \`[data-scope][data-part]\` 部件选择器书写，不依赖类名。

主题设计器：${site}/design/theme-designer
`
  return `${header}\n${body.trimStart()}`
}
