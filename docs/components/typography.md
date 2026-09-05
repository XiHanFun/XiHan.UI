# 排印 <Badge type="info" text="typography" />

一块正文的排版容器：管住段间距与最大行宽，标题、段落与行内文字各自拿自己的字号、字重与行高。

## 何时使用

- 渲染一段较长的正文：文章、说明、条款、AI 回复。
- 需要标题层级与段落节奏一致，而不想逐处写字号。

## 何时不用

- 只是一行标签或一句提示：直接写文本，别套整套排版。
- 要把长文本裁成几行：用[文本截断](./truncate)。
- 要渲染 Markdown：用 `@xihan-ui/markdown`，它产出的节点套一层 `prose` 部件即得排版。

## 特性

- `root` 管段间距与最大行宽；`level` 只换标题字号档位，用哪个标签由作者定。
- 行内文字三种形态：`muted` 弱化、`strong` 加重、`code` 等宽；与语气、字重是三条轴，可以一起写。
- `link` 是一个独立部件，链接样式不必另写。
- `prose` 收外来的整段 HTML：节点由内容自己带，标题、段落、列表、代码块、引用、表格按标签上样式。
- `align` 与 `weight` 落在 `root` 上，整块正文一起换；`weight` 也能只写在一段行内文字上。

## 示例

### 基础用法

root 管段间距与最大行宽，标题与段落各自拿字号、字重、行高

<XhDemo src="typography/01-basic" />

### 标题档位

level 只换字号档位，用哪个标签由作者定；不传 level 即默认档

<XhDemo src="typography/02-heading-level" />

### 行内文字

variant 换形态：muted 弱化、strong 加重、code 等宽

<XhDemo src="typography/03-text" />

### 语气

tone 决定这一段行内文字用哪族颜色，与 variant 是两个轴，可以一起写

<XhDemo src="typography/04-tone" />

### 尺寸

size 换的是整块正文的字号与段间距，不传 size 即默认档

<XhDemo src="typography/05-size" />

### 富文本

prose 收外来的整段 HTML：节点由内容自己带，样式按标签给

<XhDemo src="typography/06-prose" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-typography>` |
| Vue 组件 | `XhTypographyHeading` `XhTypographyLink` `XhTypographyParagraph` `XhTypographyProse` `XhTypographyRoot` `XhTypographyText` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/typography.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="typography"`：**`root`** · `heading` · `paragraph` · `text` · `link` · `prose`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `align` | `TypographyAlign` |  | 对齐：start / center / end / justify，整块正文跟着换。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，整块正文的字号与段间距跟着换档。 |
| `weight` | `TypographyWeight` |  | 字重：regular / medium / semibold / bold，整块正文跟着换。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getHeadingProps` | `(props?: TypographyHeadingProps) => T['element']` |  |
| `getParagraphProps` | `() => T['element']` |  |
| `getTextProps` | `(props?: TypographyTextProps) => T['element']` |  |
| `getLinkProps` | `() => T['element']` |  |
| `getProseProps` | `() => T['element']` | 富文本容器：外来的 HTML（Markdown 渲染结果）铺进来，样式按标签给。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/typography.css` 按部件选择：`[data-scope="typography"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-align` | props.align |
| `root` | `data-size` | props.size |
| `root` | `data-weight` | props.weight |
| `heading` | `data-level` | levelAttr(heading.level) |
| `text` | `data-tone` | text.tone |
| `text` | `data-variant` | text.variant |
| `text` | `data-weight` | text.weight |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-typography-block-gap` · `--xh-typography-code-bg` · `--xh-typography-code-font` · `--xh-typography-code-font-size` · `--xh-typography-code-px` · `--xh-typography-code-py` · `--xh-typography-code-radius` · `--xh-typography-fg` · `--xh-typography-font-size` · `--xh-typography-font-weight` · `--xh-typography-heading-fg` · `--xh-typography-heading-font-size` · `--xh-typography-heading-font-weight` · `--xh-typography-heading-gap` · `--xh-typography-heading-leading` · `--xh-typography-leading` · `--xh-typography-link-fg` · `--xh-typography-link-fg-hover` · `--xh-typography-link-radius` · `--xh-typography-link-underline-offset` · `--xh-typography-measure` · `--xh-typography-prose-block-gap` · `--xh-typography-prose-cell-border` · `--xh-typography-prose-cell-px` · `--xh-typography-prose-cell-py` · `--xh-typography-prose-fg` · `--xh-typography-prose-font-size` · `--xh-typography-prose-h1` · `--xh-typography-prose-h2` · `--xh-typography-prose-h3` · `--xh-typography-prose-h4` · `--xh-typography-prose-h5` · `--xh-typography-prose-h6` · `--xh-typography-prose-heading-fg` · `--xh-typography-prose-heading-font-weight` · `--xh-typography-prose-heading-gap` · `--xh-typography-prose-item-gap` · `--xh-typography-prose-leading` · `--xh-typography-prose-link-fg` · `--xh-typography-prose-link-radius` · `--xh-typography-prose-list-ps` · `--xh-typography-prose-pre-bg` · `--xh-typography-prose-pre-padding` · `--xh-typography-prose-pre-radius` · `--xh-typography-prose-quote-border` · `--xh-typography-prose-quote-fg` · `--xh-typography-prose-quote-ps` · `--xh-typography-prose-rule-border` · `--xh-typography-prose-strong-font-weight` · `--xh-typography-prose-th-font-weight` · `--xh-typography-text-fg-muted` · `--xh-typography-text-fg-tone` · `--xh-typography-text-font-weight`

## 动效

`color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤另按输入能力分档：`hover: hover`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[文本高亮](./highlight)配合做检索命中标记；与[代码视图](./code-view)配合放整段代码。

## 最佳实践

- 最大行宽交给 `root`，别让正文横贯整个宽屏——一行超过约四十个汉字就很难回到下一行的行首。
- 标题层级按文档结构选标签，视觉大小用 `level` 单独调，两件事分开。

## 反模式

- 为了字大就用 `<h1>`：读屏用户按标题跳转时会撞见错的结构。
- 在正文块里塞交互控件却不留间距，点击目标会挤在一起。
