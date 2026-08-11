# 统计数值 <Badge type="info" text="statistic" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

标签在上、数值在下；数值由你自己格式化好再塞进来，组件不做千分位也不做换算

<XhDemo src="statistic/01-basic" />

### 前后缀

prefix 与 suffix 和数值排在同一行、按基线对齐，比数值小一档

<XhDemo src="statistic/02-affix" />

### 尺寸

size 换的是标签、数值与前后缀的字号，不传 size 即默认档

<XhDemo src="statistic/03-size" />

### 语气

tone 决定数值与前后缀用哪族颜色，标签始终保持弱前景

<XhDemo src="statistic/04-tone" />

### 等宽数字

数值用等宽数字排版，反复换数时字宽不变，后面的单位不会左右挪

<XhDemo src="statistic/05-tabular" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-statistic>` |
| Vue 组件 | `XhStatisticLabel` `XhStatisticPrefix` `XhStatisticRoot` `XhStatisticSuffix` `XhStatisticValue` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/statistic.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="statistic"`：**`root`** · `label` · `value` · `prefix` · `suffix`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `size` | `Size` |  | 尺寸：sm / md / lg，只落成 root 的 data-size。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，只落成 root 的 data-tone。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getValueProps` | `() => T['element']` |  |
| `getPrefixProps` | `() => T['element']` |  |
| `getSuffixProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
