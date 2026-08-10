# 排印 <Badge type="info" text="typography" />

布局组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

root 管段间距与最大行宽，标题与段落各自拿字号、字重、行高

<XhDemo src="typography/01-basic" />

### 标题档位

level 只换字号档位，标签仍由 as 决定；不传 level 即默认档

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
