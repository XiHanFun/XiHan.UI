# Statistic 统计数值

一个带标签的关键数字，可以配前后缀。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/statistic" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/statistic.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/statistic" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/statistic" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/statistic.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

标签在上、数值在下；数值由你自己格式化好再塞进来，组件不做千分位也不做换算

<XhDemo src="statistic/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="statistic"`：**`root`** · `label` · `value` · `prefix` · `suffix` · `trend`

## 示例

### 前后缀

prefix 与 suffix 和数值排在同一行、按基线对齐，比数值小一档

<XhDemo src="statistic/02-affix" />

### 尺寸

size 换的是标签、数值与前后缀的字号，不传 size 即默认档

<XhDemo src="statistic/03-size" />

### 颜色

tone 决定数值与前后缀用哪族颜色，标签始终保持弱前景

<XhDemo src="statistic/04-tone" />

### 等宽数字

数值用等宽数字排版，反复换数时字宽不变，后面的单位不会左右挪

<XhDemo src="statistic/05-tabular" />

### 涨跌

trend 落成 trend 部件的 data-direction，箭头由皮肤画；与 tone 正交——跌也可以是好事

<XhDemo src="statistic/06-trend" />

## 设计指引

### 何时使用

- 仪表盘、概览页上的核心指标。

### 何时不用

- 多个指标需要按维度对照：用[表格](./table)。
- 表达的是完成比例：用[进度条](./progress)。

### 特性

- 标签、值、前缀、后缀各占一段。
- 数字用等宽字形，位数变化时不会左右晃。
- `trend` 给出涨跌方向，箭头由皮肤画；它与 `tone` 正交——跌也可以是好事。

### 组合

- 值位放[数值动画](./number-animation)；整块放进[卡片](./card)；一排指标用[栅格](./grid)。

### 最佳实践

- 单位写进后缀而不是揉进数字里，数字才对得齐。
- 给出对比基准（同比、环比），单独一个数字读者判断不了好坏。

### 反模式

- 一屏里十几个同等大小的指标：没有重点。
- 用它显示精确到分的金额却不给货币符号。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-statistic>` |
| Vue 组件 | `XhStatisticLabel` `XhStatisticPrefix` `XhStatisticRoot` `XhStatisticSuffix` `XhStatisticTrend` `XhStatisticValue` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/statistic.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `size` | `Size` |  | 尺寸：sm / md / lg，只落成 root 的 data-size。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，只落成 root 的 data-tone。 |
| `trend` | `StatisticTrend` |  | 涨跌：up / down / flat，落成 trend 部件的 data-direction，皮肤据它出兜底箭头。 与 tone 正交，方向与颜色互不联动——跌也可以是好事（差错率、退货率）。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `trend` | `StatisticTrend` | 当前涨跌方向；没给即 undefined。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getValueProps` | `() => T['element']` |  |
| `getPrefixProps` | `() => T['element']` |  |
| `getSuffixProps` | `() => T['element']` |  |
| `getTrendProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/statistic.css` 使用 `[data-scope="statistic"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `trend` | `data-direction` | props.trend |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-statistic-affix-fg` | `prefix`<br>`suffix` | `color` | `default` | `--xh-_tone-fg` | statistic 的 prefix、suffix 部件 color 覆盖槽。 |
| `--xh-statistic-affix-font-size` | `prefix`<br>`suffix` | `font-size` | `default` | `--xh-_statistic-affix-size` | statistic 的 prefix、suffix 部件 font-size 覆盖槽。 |
| `--xh-statistic-fg` | `root` | `color` | `default` | `--xh-fg-default` | statistic 的 root 部件 color 覆盖槽。 |
| `--xh-statistic-gap` | `root` | `column-gap` | `default` | `--xh-space-0` | statistic 的 root 部件 column-gap 覆盖槽。 |
| `--xh-statistic-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | statistic 的 label 部件 color 覆盖槽。 |
| `--xh-statistic-label-font-size` | `label` | `font-size` | `default` | `--xh-_statistic-label-size` | statistic 的 label 部件 font-size 覆盖槽。 |
| `--xh-statistic-row-gap` | `root` | `row-gap` | `default` | `--xh-_statistic-row-gap` | statistic 的 root 部件 row-gap 覆盖槽。 |
| `--xh-statistic-trend-fg` | `trend` | `color` | `default` | `--xh-_tone-fg` | statistic 的 trend 部件 color 覆盖槽。 |
| `--xh-statistic-trend-font-size` | `trend` | `font-size` | `default` | `--xh-_statistic-affix-size` | statistic 的 trend 部件 font-size 覆盖槽。 |
| `--xh-statistic-trend-gap` | `trend` | `gap` | `default` | `--xh-space-0_5` | statistic 的 trend 部件 gap 覆盖槽。 |
| `--xh-statistic-trend-offset` | `trend` | `margin-inline-start` | `default` | `--xh-space-2` | statistic 的 trend 部件 margin-inline-start 覆盖槽。 |
| `--xh-statistic-value-fg` | `value` | `color` | `default` | `--xh-_tone-fg` | statistic 的 value 部件 color 覆盖槽。 |
| `--xh-statistic-value-font-size` | `value` | `font-size` | `default` | `--xh-_statistic-value-size` | statistic 的 value 部件 font-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
