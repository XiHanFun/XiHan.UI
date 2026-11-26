# Statistic 统计数值

带标签的关键数字，可以配前后缀。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/statistic" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/statistic.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/statistic" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/statistic" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/statistic.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

标签在上、数值在下；手写部件时数值由作者格式化好放进 value 部件，组件原样显示

<XhDemo src="statistic/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="statistic"`：**`root`** · `label` · `value` · `prefix` · `suffix` · `trend`

## 示例

### 前后缀

prefix 与 suffix 和数值排在同一行、按基线对齐，比数值小一档

<XhDemo src="statistic/02-affix" />

### 语气与尺寸

tone 决定数值与前后缀使用哪族颜色，标签始终保持弱前景；size 改变标签、数值与前后缀的字号，不传 size 即默认档

<XhDemo src="statistic/03-tone-size" />

### 等宽数字

数值使用等宽数字排版，反复更换数值时字宽不变，后面的单位不会左右移动

<XhDemo src="statistic/05-tabular" />

### 涨跌

trend 写为 trend 部件的 data-trend，箭头由皮肤绘制；与 tone 正交：下跌也可以是正向语气

<XhDemo src="statistic/06-trend" />

### props 写法

不写结构时按标准结构铺：标签、数值与涨跌几项写出一块统计数，单位放进 suffix 插槽；数值按当前语言分组

<XhDemo src="statistic/07-props" />

### 格式化

formatOptions 原样交给 Intl.NumberFormat：货币、百分比与紧凑记数都按当前语言的写法输出

<XhDemo src="statistic/08-format" />

## 设计指引

### 何时使用

- 仪表盘、概览页上的核心指标。

### 何时不用

- 多个指标需要按维度对照时，使用[表格](./table)。
- 表达完成比例时，使用[进度条](./progress)。

### 特性

- 标签、值、前缀、后缀各占一段。
- 数字使用等宽字形，位数变化时不会左右晃动。
- `trend` 给出涨跌方向，箭头由皮肤绘制；它与 `tone` 正交，下跌也可以是正向语气。
- 给了 `value` 就由组件格式化：`formatOptions` 原样交给 `Intl.NumberFormat`（小数位、分组、货币、百分比、单位、紧凑记数），不写时按该语言的缺省，分组打开、至多三位小数；选项不合法时当场报错。`locale` 不写时取全局配置的语言，再没有按宿主语言，宿主也没有时按 en-US。`null` 与不给同义，不会铺成 0。
- 值部件里写了内容就照写的显示，不覆盖；部件空着才放格式化好的数值。不给 `value` 时数值由作者格式化好放进值部件。
- 不写结构时按标准结构铺（Vue 不写默认插槽、React 不给 children、Web Components 不写部件或只写 `root`），三端出自同一个结构函数：标签、前缀、值、后缀、涨跌，给了哪段才铺哪段。标签取 `label` 或同名插槽，前后缀只来自插槽，值是 `value` 格式化好的文字，涨跌给了 `trend` 或 `trendText` 才铺、比数文字写在里面。Vue 是 `label`、`prefix`、`suffix` 三个具名插槽，React 是同名的三个属性，Web Components 是宿主直接子节点上的同名 `slot`，`trendText` 写作 `trend-text`。

### 组合

- 值位放[数值动画](./number-animation)；整块放入[卡片](./card)；一排指标使用[栅格](./grid)。

### 最佳实践

- 单位写进后缀而不是混入数字，数字才能对齐。
- 给出对比基准（同比、环比），单独一个数字无法判断好坏。

### 反模式

- 一屏内十几个同等大小的指标，没有重点。
- 显示精确到分的金额却不提供货币符号。

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
| `formatOptions` | `Intl.NumberFormatOptions` |  | 交给 Intl.NumberFormat 的选项：小数位、分组、货币、百分比、单位、紧凑记数等。 不写按该语言的缺省（分组打开、至多三位小数）；只在给了 value 时生效，选项不合法时格式化当场报错。 |
| `locale` | `string` |  | BCP 47 语言标记，决定小数点、分组符、数字系统与货币写法。 未提供时取全局配置的 locale，再没有按宿主语言，宿主也没有时按 en-US。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，只写为 root 的 data-size。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，只写为 root 的 data-tone。 |
| `trend` | `StatisticTrend` |  | 涨跌：up / down / flat，写为 trend 部件的 data-trend，皮肤据此绘制兜底箭头。 与 tone 正交，方向与颜色互不联动：下跌也可以是正面信息（差错率、退货率）。 |
| `value` | `number` |  | 数值。给了就按 locale 与 formatOptions 格式化成 valueText，value 部件没写内容时显示这串字； 部件里写了内容就照写的显示，不覆盖。不给时数值由作者写进 value 部件。 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhStatisticRoot` | `default` | — |  |
| `XhStatisticRoot` | `label` | — | 标签，压过 label。 |
| `XhStatisticRoot` | `prefix` | — | 数值前的货币符号或图标。 |
| `XhStatisticRoot` | `suffix` | — | 数值后的单位或百分号。 |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhStatisticRoot` | `label` | `ReactNode` |  | 标签。是字符串时作文字，是别的节点时由 label 部件装着。 |
| `XhStatisticRoot` | `prefix` | `ReactNode` |  | 数值前的货币符号或图标，铺进 prefix 部件。 |
| `XhStatisticRoot` | `suffix` | `ReactNode` |  | 数值后的单位或百分号，铺进 suffix 部件。 |
| `XhStatisticRoot` | `trendText` | `string` |  | 涨跌段的比数文字（「同比 12%」），铺进 trend 部件。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `trend` | `StatisticTrend` | 当前涨跌方向；未提供时为 undefined。 |
| `valueText` | `string` | value 按 locale 与 formatOptions 格式化后的文字；没给 value 时为 undefined。 |
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

`@xihan-ui/styles/statistic.css` 按 `[data-scope="statistic"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-statistic` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `trend` | `data-trend` | props.trend |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-statistic-affix-fg` | `prefix`<br>`suffix` | `color` | `default` | `--xh-_tone-fg` | statistic 的 prefix、suffix 部件 color 覆盖槽。 |
| `--xh-statistic-affix-font-size` | `prefix`<br>`suffix` | `font-size` | `default` | `--xh-_statistic-affix-size` | statistic 的 prefix、suffix 部件 font-size 覆盖槽。 |
| `--xh-statistic-fg` | `root` | `color` | `default` | `--xh-fg-default` | statistic 的 root 部件 color 覆盖槽。 |
| `--xh-statistic-gap` | `root` | `column-gap` | `default` | `--xh-space-0` | statistic 的 root 部件 column-gap 覆盖槽。 |
| `--xh-statistic-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-_statistic-icon-size` | statistic 的 root 部件 --xh-icon-size 覆盖槽。 |
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

动效角色：状态（见[动效规范](../design/motion#角色)）。

`color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
