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

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-typography-block-gap` | `heading`<br>`paragraph` | `margin-block-start` | `is([data-part='heading'], [data-part='paragraph'])` | `--xh-_typography-block-gap` | typography 的 heading、paragraph 部件 margin-block-start 覆盖槽。 |
| `--xh-typography-code-bg` | `prose`<br>`text` | `background` | `variant=code`<br>`where(code)` | `--xh-bg-subtle` | typography 的 prose、text 部件 background 覆盖槽。 |
| `--xh-typography-code-font` | `prose`<br>`text` | `font-family` | `variant=code`<br>`where(code)`<br>`where(pre)` | `--xh-font-family-mono` | typography 的 prose、text 部件 font-family 覆盖槽。 |
| `--xh-typography-code-font-size` | `prose`<br>`text` | `font-size` | `variant=code`<br>`where(code)`<br>`where(pre)` | `--xh-_typography-code-size` | typography 的 prose、text 部件 font-size 覆盖槽。 |
| `--xh-typography-code-px` | `prose`<br>`text` | `padding-inline` | `variant=code`<br>`where(code)` | `--xh-space-1` | typography 的 prose、text 部件 padding-inline 覆盖槽。 |
| `--xh-typography-code-py` | `prose`<br>`text` | `padding-block` | `variant=code`<br>`where(code)` | `--xh-space-0_5` | typography 的 prose、text 部件 padding-block 覆盖槽。 |
| `--xh-typography-code-radius` | `prose`<br>`text` | `border-radius` | `variant=code`<br>`where(code)` | `--xh-shape-inset` | typography 的 prose、text 部件 border-radius 覆盖槽。 |
| `--xh-typography-fg` | `root` | `color` | `default` | `--xh-fg-default` | typography 的 root 部件 color 覆盖槽。 |
| `--xh-typography-font-size` | `root` | `font-size` | `default` | `--xh-_typography-body-size` | typography 的 root 部件 font-size 覆盖槽。 |
| `--xh-typography-font-weight` | `root` | `font-weight` | `default`<br>`weight=bold`<br>`weight=medium`<br>`weight=regular`<br>`weight=semibold` | `--xh-font-weight-bold`<br>`--xh-font-weight-medium`<br>`--xh-font-weight-regular`<br>`--xh-font-weight-semibold`<br>`--xh-text-body-weight` | typography 的 root 部件 font-weight 覆盖槽。 |
| `--xh-typography-heading-fg` | `heading` | `color` | `default` | `--xh-fg-default` | typography 的 heading 部件 color 覆盖槽。 |
| `--xh-typography-heading-font-size` | `heading` | `font-size` | `default`<br>`level=1`<br>`level=2`<br>`level=3`<br>`level=4`<br>`level=5`<br>`level=6` | `--xh-_typography-h1`<br>`--xh-_typography-h2`<br>`--xh-_typography-h3`<br>`--xh-_typography-h4`<br>`--xh-_typography-h5`<br>`--xh-_typography-h6` | typography 的 heading 部件 font-size 覆盖槽。 |
| `--xh-typography-heading-font-weight` | `heading` | `font-weight` | `default` | `--xh-font-weight-semibold` | typography 的 heading 部件 font-weight 覆盖槽。 |
| `--xh-typography-heading-gap` | `heading`<br>`paragraph` | `margin-block-start` | `is([data-part='heading'], [data-part='paragraph'])` | `--xh-_typography-heading-gap` | typography 的 heading、paragraph 部件 margin-block-start 覆盖槽。 |
| `--xh-typography-heading-leading` | `heading` | `line-height` | `default` | `--xh-leading-tight` | typography 的 heading 部件 line-height 覆盖槽。 |
| `--xh-typography-leading` | `root` | `line-height` | `default` | `--xh-text-body-leading` | typography 的 root 部件 line-height 覆盖槽。 |
| `--xh-typography-link-fg` | `link`<br>`prose` | `color` | `default`<br>`where(a)` | `--xh-fg-brand` | typography 的 link、prose 部件 color 覆盖槽。 |
| `--xh-typography-link-fg-hover` | `link` | `color` | `@media (hover: hover)`<br>`hover` | `--xh-fg-brand-strong` | typography 的 link 部件 color 覆盖槽。 |
| `--xh-typography-link-radius` | `link`<br>`prose` | `border-radius` | `default`<br>`where(a)` | `--xh-shape-inset` | typography 的 link、prose 部件 border-radius 覆盖槽。 |
| `--xh-typography-link-underline-offset` | `link`<br>`prose` | `text-underline-offset` | `default`<br>`where(a)` | `--xh-space-0_5` | typography 的 link、prose 部件 text-underline-offset 覆盖槽。 |
| `--xh-typography-measure` | `root` | `max-inline-size` | `default` | `--xh-_typography-measure` | typography 的 root 部件 max-inline-size 覆盖槽。 |
| `--xh-typography-prose-block-gap` | `prose` | `margin-block-start` | `where(h1, h2, h3, h4, h5, h6, p, ul, ol, pre, blockquote, table, hr)` | `--xh-_typography-block-gap` | typography 的 prose 部件 margin-block-start 覆盖槽。 |
| `--xh-typography-prose-cell-border` | `prose` | `border-block-end` | `where(th, td)` | `--xh-border-subtle` | typography 的 prose 部件 border-block-end 覆盖槽。 |
| `--xh-typography-prose-cell-px` | `prose` | `padding-inline` | `where(th, td)` | `--xh-space-3` | typography 的 prose 部件 padding-inline 覆盖槽。 |
| `--xh-typography-prose-cell-py` | `prose` | `padding-block` | `where(th, td)` | `--xh-space-2` | typography 的 prose 部件 padding-block 覆盖槽。 |
| `--xh-typography-prose-fg` | `prose` | `color` | `default` | `--xh-fg-default` | typography 的 prose 部件 color 覆盖槽。 |
| `--xh-typography-prose-font-size` | `prose` | `font-size` | `default` | `--xh-_typography-body-size` | typography 的 prose 部件 font-size 覆盖槽。 |
| `--xh-typography-prose-h1` | `prose` | `font-size` | `where(h1)` | `--xh-_typography-h1` | typography 的 prose 部件 font-size 覆盖槽。 |
| `--xh-typography-prose-h2` | `prose` | `font-size` | `where(h2)` | `--xh-_typography-h2` | typography 的 prose 部件 font-size 覆盖槽。 |
| `--xh-typography-prose-h3` | `prose` | `font-size` | `where(h3)` | `--xh-_typography-h3` | typography 的 prose 部件 font-size 覆盖槽。 |
| `--xh-typography-prose-h4` | `prose` | `font-size` | `where(h4)` | `--xh-_typography-h4` | typography 的 prose 部件 font-size 覆盖槽。 |
| `--xh-typography-prose-h5` | `prose` | `font-size` | `where(h5)` | `--xh-_typography-h5` | typography 的 prose 部件 font-size 覆盖槽。 |
| `--xh-typography-prose-h6` | `prose` | `font-size` | `where(h6)` | `--xh-_typography-h6` | typography 的 prose 部件 font-size 覆盖槽。 |
| `--xh-typography-prose-heading-fg` | `prose` | `color` | `where(h1, h2, h3, h4, h5, h6)` | `--xh-fg-default` | typography 的 prose 部件 color 覆盖槽。 |
| `--xh-typography-prose-heading-font-weight` | `prose` | `font-weight` | `where(h1, h2, h3, h4, h5, h6)` | `--xh-font-weight-semibold` | typography 的 prose 部件 font-weight 覆盖槽。 |
| `--xh-typography-prose-heading-gap` | `prose` | `margin-block-start` | `where(h1, h2, h3, h4, h5, h6)`<br>`where(h1, h2, h3, h4, h5, h6, p, ul, ol, pre, blockquote, table, hr)` | `--xh-_typography-heading-gap` | typography 的 prose 部件 margin-block-start 覆盖槽。 |
| `--xh-typography-prose-item-gap` | `prose` | `margin-block-start` | `where(li + li)`<br>`where(li)`<br>`where(ul, ol)` | `--xh-space-1` | typography 的 prose 部件 margin-block-start 覆盖槽。 |
| `--xh-typography-prose-leading` | `prose` | `line-height` | `default` | `--xh-text-prose-leading` | typography 的 prose 部件 line-height 覆盖槽。 |
| `--xh-typography-prose-link-fg` | `prose` | `color` | `where(a)` | `--xh-typography-link-fg` | typography 的 prose 部件 color 覆盖槽。 |
| `--xh-typography-prose-link-radius` | `prose` | `border-radius` | `where(a)` | `--xh-typography-link-radius` | typography 的 prose 部件 border-radius 覆盖槽。 |
| `--xh-typography-prose-link-underline-offset` | `prose` | `text-underline-offset` | `where(a)` | `--xh-typography-link-underline-offset` | typography 的 prose 部件 text-underline-offset 覆盖槽。 |
| `--xh-typography-prose-list-ps` | `prose` | `padding-inline-start` | `where(ul, ol)` | `--xh-space-6` | typography 的 prose 部件 padding-inline-start 覆盖槽。 |
| `--xh-typography-prose-pre-bg` | `prose` | `background` | `where(pre)` | `--xh-bg-subtle` | typography 的 prose 部件 background 覆盖槽。 |
| `--xh-typography-prose-pre-padding` | `prose` | `padding` | `where(pre)` | `--xh-space-4` | typography 的 prose 部件 padding 覆盖槽。 |
| `--xh-typography-prose-pre-radius` | `prose` | `border-radius` | `where(pre)` | `--xh-shape-surface` | typography 的 prose 部件 border-radius 覆盖槽。 |
| `--xh-typography-prose-quote-border` | `prose` | `border-inline-start` | `where(blockquote)` | `--xh-border-subtle` | typography 的 prose 部件 border-inline-start 覆盖槽。 |
| `--xh-typography-prose-quote-fg` | `prose` | `color` | `where(blockquote)` | `--xh-fg-muted` | typography 的 prose 部件 color 覆盖槽。 |
| `--xh-typography-prose-quote-ps` | `prose` | `padding-inline-start` | `where(blockquote)` | `--xh-space-4` | typography 的 prose 部件 padding-inline-start 覆盖槽。 |
| `--xh-typography-prose-rule-border` | `prose` | `border-block-start` | `where(hr)` | `--xh-border-subtle` | typography 的 prose 部件 border-block-start 覆盖槽。 |
| `--xh-typography-prose-strong-font-weight` | `prose` | `font-weight` | `where(strong)` | `--xh-font-weight-semibold` | typography 的 prose 部件 font-weight 覆盖槽。 |
| `--xh-typography-prose-th-font-weight` | `prose` | `font-weight` | `where(th)` | `--xh-font-weight-semibold` | typography 的 prose 部件 font-weight 覆盖槽。 |
| `--xh-typography-text-fg-muted` | `text` | `color` | `variant=muted` | `--xh-fg-muted` | typography 的 text 部件 color 覆盖槽。 |
| `--xh-typography-text-fg-tone` | `text` | `color` | `tone` | `--xh-_tone-fg` | typography 的 text 部件 color 覆盖槽。 |
| `--xh-typography-text-font-weight` | `text` | `font-weight` | `variant=strong` | `--xh-font-weight-semibold` | typography 的 text 部件 font-weight 覆盖槽。 |
<!-- xh-component-tokens:end -->

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
