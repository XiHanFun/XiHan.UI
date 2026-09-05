# 排印 <Badge type="info" text="typography" />

一块正文的排版容器：管住段间距与最大行宽，标题、段落与行内文字各自拿自己的字号、字重与行高。

## 何时使用

- 渲染一段较长的正文：文章、说明、条款、AI 回复。
- 需要标题层级与段落节奏一致，而不想逐处写字号。

## 何时不用

- 只是一行标签或一句提示：直接写文本，别套整套排版。
- 要把长文本裁成几行：用[文本截断](./truncate)。
- 要渲染 Markdown：用 `@xihan-ui/markdown`，它产出的节点再交给本组件排版。

## 特性

- `root` 管段间距与最大行宽；`level` 只换标题字号档位，用哪个标签由作者定。
- 行内文字三种形态：`muted` 弱化、`strong` 加重、`code` 等宽；与语气是两条轴，可以一起写。
- `link` 是一个独立部件，链接样式不必另写。

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

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-typography>` |
| Vue 组件 | `XhTypographyHeading` `XhTypographyLink` `XhTypographyParagraph` `XhTypographyRoot` `XhTypographyText` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/typography.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="typography"`：**`root`** · `heading` · `paragraph` · `text` · `link`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `size` | `Size` |  | 尺寸：sm / md / lg，整块正文的字号与段间距跟着换档。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getHeadingProps` | `(props?: TypographyHeadingProps) => T['element']` |  |
| `getParagraphProps` | `() => T['element']` |  |
| `getTextProps` | `(props?: TypographyTextProps) => T['element']` |  |
| `getLinkProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/typography.css` 按部件选择：`[data-scope="typography"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `heading` | `data-level` | levelAttr(heading.level) |
| `text` | `data-tone` | text.tone |
| `text` | `data-variant` | text.variant |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-typography-block-gap` · `--xh-typography-code-bg` · `--xh-typography-code-font` · `--xh-typography-code-font-size` · `--xh-typography-code-px` · `--xh-typography-code-py` · `--xh-typography-code-radius` · `--xh-typography-fg` · `--xh-typography-font-size` · `--xh-typography-font-weight` · `--xh-typography-heading-fg` · `--xh-typography-heading-font-size` · `--xh-typography-heading-font-weight` · `--xh-typography-heading-gap` · `--xh-typography-heading-leading` · `--xh-typography-leading` · `--xh-typography-link-fg` · `--xh-typography-link-fg-hover` · `--xh-typography-link-radius` · `--xh-typography-link-underline-offset` · `--xh-typography-measure` · `--xh-typography-text-fg-muted` · `--xh-typography-text-fg-tone` · `--xh-typography-text-font-weight`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤内置条件规则：`hover: hover`。

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
