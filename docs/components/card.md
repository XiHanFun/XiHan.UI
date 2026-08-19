# 卡片 <Badge type="info" text="card" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

除了 root，封面、头、身、脚都可选；只写用得上的那几段

<XhDemo src="card/01-basic" />

### 形态

variant 只改描边、底色与投影怎么用，各段的排版三档一致

<XhDemo src="card/02-variant" />

### 尺寸

size 换的是各段的内边距与标题字号，不写 size 即默认档

<XhDemo src="card/03-size" />

### 分段与悬停

segmented 在段与段之间画一条分隔线；hoverable 只在能用指针的设备上抬起

<XhDemo src="card/04-segmented" />

### 带封面

封面顶到根的边上、不吃内边距，圆角由根统一裁

<XhDemo src="card/05-cover" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-card>` |
| Vue 组件 | `XhCardBody` `XhCardCover` `XhCardDescription` `XhCardFooter` `XhCardHeader` `XhCardRoot` `XhCardTitle` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/card.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="card"`：**`root`** · `cover` · `header` · `title` · `description` · `body` · `footer`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `hoverable` | `boolean` |  | 指针悬停时抬起：只落 data-hoverable，抬多少由皮肤定。 |
| `segmented` | `boolean` |  | 分段：在头、身、脚之间画分隔线。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定各段的内边距与标题字号。 |
| `variant` | `CardVariant` |  | 形态：outline / subtle / elevated / ghost，决定描边、底色与投影怎么用。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getCoverProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getBodyProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-card-bg` · `--xh-card-border` · `--xh-card-fg` · `--xh-card-radius` · `--xh-card-title-font-size`
