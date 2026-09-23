# Typography 排印

用于组织标题、正文和富文本内容。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/typography" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/typography.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/typography" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/typography" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/typography.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

组合标题和正文

<XhDemo src="typography/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="typography"`：**`root`** · `heading` · `paragraph` · `text` · `link` · `prose`

## 示例

### 标题层级

设置标题的视觉层级

<XhDemo src="typography/02-heading-level" />

### 文本变体

设置正文、辅助、强调、代码和链接样式

<XhDemo src="typography/03-text" />

### 颜色

使用语义颜色

<XhDemo src="typography/04-tone" />

### 尺寸

设置正文大小

<XhDemo src="typography/05-size" />

### 富文本

排版外部 HTML 内容

<XhDemo src="typography/06-prose" />

## 设计指引

### 何时使用

- 展示文章、说明、条款或消息正文。
- 统一标题层级、段落间距和行宽。

### 何时不用

- 单行标签或简短提示直接使用文本。
- 需要限制长文本行数时，使用[文本截断](./truncate)。
- Markdown 内容使用 `@xihan-ui/markdown` 渲染后放入 `prose`。

### 特性

- 支持六档标题层级和三档正文尺寸。
- 支持弱化、强调、代码等文本变体。
- 支持链接、语义颜色、对齐和字重。
- `prose` 可直接排版外部 HTML 内容。

### 组合

- 可与[文本高亮](./highlight)和[代码视图](./code-view)组合使用。

### 最佳实践

- 使用 `root` 控制正文最大行宽。
- 根据文档结构选择标题标签，使用 `level` 调整视觉大小。

### 反模式

- 不要仅为了放大文字而改变标题语义。
- 不要在正文中密集放置交互控件。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-typography>` |
| Vue 组件 | `XhTypographyHeading` `XhTypographyLink` `XhTypographyParagraph` `XhTypographyProse` `XhTypographyRoot` `XhTypographyText` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/typography.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `align` | `TypographyAlign` |  | 对齐：start / center / end / justify，整块正文随之变化。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，整块正文的字号与段间距随之换档。 |
| `weight` | `TypographyWeight` |  | 字重：regular / medium / semibold / bold，整块正文随之变化。 |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhTypographyHeading` | `level` | `TypographyLevel \| string` |  | 字号档位 1-6，超出范围收敛到边界。 |
| `XhTypographyHeading` | `as` | `ElementType` |  | 渲染为哪个标签，默认 p；需要进入文档大纲时写 h2（或 hN）。 |
| `XhTypographyProse` | `as` | `ElementType` |  | 渲染为哪个标签，默认 div。 |
| `XhTypographyText` | `tone` | `Tone` |  | 语气：决定使用哪族颜色。 |
| `XhTypographyText` | `variant` | `TypographyVariant` |  | 形态：muted 弱化 / strong 加重 / code 等宽。 |
| `XhTypographyText` | `weight` | `TypographyWeight` |  | 字重：regular / medium / semibold / bold，只作用于该段行内文字。 |
| `XhTypographyText` | `as` | `ElementType` |  | 渲染为哪个标签，默认 span；需要 code / strong 的原生语义时自行写明。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getHeadingProps` | `(props?: TypographyHeadingProps) => T['element']` |  |
| `getParagraphProps` | `() => T['element']` |  |
| `getTextProps` | `(props?: TypographyTextProps) => T['element']` |  |
| `getLinkProps` | `() => T['element']` |  |
| `getProseProps` | `() => T['element']` | 富文本容器：外来的 HTML（Markdown 渲染结果）铺入其中，样式按标签提供。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/typography.css` 使用 `[data-scope="typography"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

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
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
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

### 动效

`color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`hover: hover`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
