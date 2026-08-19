# 描述列表 <Badge type="info" text="descriptions" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

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
| `getItemProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getValueProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-descriptions-bg` · `--xh-descriptions-border` · `--xh-descriptions-fg` · `--xh-descriptions-font-size` · `--xh-descriptions-gap` · `--xh-descriptions-item-px` · `--xh-descriptions-item-py` · `--xh-descriptions-label-fg` · `--xh-descriptions-label-font-weight` · `--xh-descriptions-label-gap` · `--xh-descriptions-label-w` · `--xh-descriptions-pair-gap` · `--xh-descriptions-radius` · `--xh-descriptions-value-fg`
