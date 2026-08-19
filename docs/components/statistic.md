# 统计数值 <Badge type="info" text="statistic" />

一个带标签的关键数字，可以配前后缀。

## 何时使用

- 仪表盘、概览页上的核心指标。

## 何时不用

- 多个指标需要按维度对照：用[表格](./table)。
- 表达的是完成比例：用[进度条](./progress)。

## 特性

- 标签、值、前缀、后缀各占一段。
- 数字用等宽字形，位数变化时不会左右晃。

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

## 样式

默认皮肤 `@xihan-ui/styles/statistic.css` 按部件选择：`[data-scope="statistic"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-statistic-affix-fg` · `--xh-statistic-affix-font-size` · `--xh-statistic-fg` · `--xh-statistic-gap` · `--xh-statistic-label-fg` · `--xh-statistic-label-font-size` · `--xh-statistic-row-gap` · `--xh-statistic-value-fg` · `--xh-statistic-value-font-size`

## 组合

- 值位放[数值动画](./number-animation)；整块放进[卡片](./card)；一排指标用[栅格](./grid)。

## 最佳实践

- 单位写进后缀而不是揉进数字里，数字才对得齐。
- 给出对比基准（同比、环比），单独一个数字读者判断不了好坏。

## 反模式

- 一屏里十几个同等大小的指标：没有重点。
- 用它显示精确到分的金额却不给货币符号。
