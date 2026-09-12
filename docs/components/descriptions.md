# 描述列表 <Badge type="info" text="descriptions" />

成对的标签与值，按列排开。

## 何时使用

- 详情页的属性列表：订单信息、设备参数、用户资料。

## 何时不用

- 数据是多行同构的记录：用[表格](./table)。
- 只有一两对：直接写。

## 特性

- 语义是 `dt` / `dd`，组件只给身份与排版。
- `columns` 决定每行几组，不传即每行一组。
- 标签位置可以在值的上方或左侧；`bordered` 给出外框。
- 每一格可以写 `span` 横跨几列，上限是当前列数；窄档一行只摆一组时不认这个数。

## 示例

### 基础用法

标签与取值的配对靠 dl / dt / dd 表达，组件只给身份与排版；不传 columns 即每行一组

<XhDemo src="descriptions/01-basic" />

### 列数

columns 决定每行摆几组，一到六列；排版走 CSS Grid，不用表格

<XhDemo src="descriptions/02-columns" />

### 标签位置

placement 决定标签在上还是在左，不传即在上

<XhDemo src="descriptions/03-placement" />

### 外框

bordered 画一圈描边，并在格与格之间补上网格线

<XhDemo src="descriptions/04-bordered" />

### 尺寸

size 换的是每格的内边距、组与组的间距与整体字号，不传 size 即默认档

<XhDemo src="descriptions/05-size" />

### 跨列

一格写 span 横跨几列，上限是当前列数；长文本字段因此不必另开一份描述列表

<XhDemo src="descriptions/06-span" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-descriptions>` |
| Vue 组件 | `XhDescriptionsItem` `XhDescriptionsLabel` `XhDescriptionsRoot` `XhDescriptionsValue` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/descriptions.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="descriptions"`：**`root`** · `item` · `label` · `value`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `bordered` | `boolean` |  | 外框：给整份描述画一圈描边，并在格与格之间画网格线。 |
| `columns` | `DescriptionsColumns` |  | 每行摆几组，一到六列；不写即每行一组。 |
| `placement` | `DescriptionsPlacement` |  | 标签的位置：top / left；不写即标签在上。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(props?: DescriptionsItemProps) => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getValueProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/descriptions.css` 按部件选择：`[data-scope="descriptions"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-descriptions-bg` | `root` | `background` | `bordered` | `--xh-bg-surface` | descriptions 的 root 部件 background 覆盖槽。 |
| `--xh-descriptions-border` | `root` | `border` | `bordered` | `--xh-border-default` | descriptions 的 root 部件 border 覆盖槽。 |
| `--xh-descriptions-divider` | `item`<br>`root` | `border-block-start`<br>`border-inline-start` | `bordered` | `--xh-border-subtle` | descriptions 的 item、root 部件 border-block-start、border-inline-start 覆盖槽。 |
| `--xh-descriptions-fg` | `root` | `color` | `default` | `--xh-fg-default` | descriptions 的 root 部件 color 覆盖槽。 |
| `--xh-descriptions-font-size` | `root` | `font-size` | `default` | `--xh-_descriptions-font-size` | descriptions 的 root 部件 font-size 覆盖槽。 |
| `--xh-descriptions-gap` | `root` | `gap` | `default` | `--xh-_descriptions-gap` | descriptions 的 root 部件 gap 覆盖槽。 |
| `--xh-descriptions-item-px` | `item`<br>`root` | `padding-inline` | `bordered` | `--xh-_descriptions-px` | descriptions 的 item、root 部件 padding-inline 覆盖槽。 |
| `--xh-descriptions-item-py` | `item`<br>`root` | `padding-block` | `bordered` | `--xh-_descriptions-py` | descriptions 的 item、root 部件 padding-block 覆盖槽。 |
| `--xh-descriptions-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | descriptions 的 label 部件 color 覆盖槽。 |
| `--xh-descriptions-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | descriptions 的 label 部件 font-weight 覆盖槽。 |
| `--xh-descriptions-label-gap` | `item`<br>`root` | `column-gap` | `@media (min-width: 768px)`<br>`placement=left` | `--xh-_descriptions-label-gap` | descriptions 的 item、root 部件 column-gap 覆盖槽。 |
| `--xh-descriptions-label-w` | `item`<br>`root` | `grid-template-columns` | `@media (min-width: 768px)`<br>`placement=left` | `--xh-_descriptions-label-w` | descriptions 的 item、root 部件 grid-template-columns 覆盖槽。 |
| `--xh-descriptions-pair-gap` | `item` | `gap` | `default` | `--xh-_descriptions-pair-gap` | descriptions 的 item 部件 gap 覆盖槽。 |
| `--xh-descriptions-radius` | `root` | `border-radius` | `bordered` | `--xh-shape-surface` | descriptions 的 root 部件 border-radius 覆盖槽。 |
| `--xh-descriptions-value-fg` | `value` | `color` | `default` | `--xh-fg-default` | descriptions 的 value 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

## 响应式

皮肤按视口分档：`min-width: 1024px` · `min-width: 768px`。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 放进[卡片](./card)或[页头](./page-header)的页脚。

## 最佳实践

- 值为空时写"—"，别留空白——用户分不清是没有还是没加载出来。
- 标签左置时给它们统一宽度，值才对得齐。
- 长文本字段写 `span` 占满整行，别为它另开一份描述列表。

## 反模式

- 用它排版一张表格。
- 标签写得比值还长。
