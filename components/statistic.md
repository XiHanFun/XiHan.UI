来源：https://ui.docs.xihanfun.com/components/statistic

# Statistic `统计数值`

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

```vue
<script setup lang="ts">
import { XhStatisticLabel, XhStatisticRoot, XhStatisticValue } from "@xihan-ui/vue";
</script>

<template>
  <XhStatisticRoot>
    <XhStatisticLabel>本月新增用户</XhStatisticLabel>
    <XhStatisticValue>12,480</XhStatisticValue>
  </XhStatisticRoot>
</template>
```

```html
<xh-statistic>
  <div data-xh-part="root">
    <span data-xh-part="label">本月新增用户</span>
    <span data-xh-part="value">12,480</span>
  </div>
</xh-statistic>
```

## 示例

### 前后缀

prefix 与 suffix 和数值排在同一行、按基线对齐，比数值小一档

```vue
<script setup lang="ts">
import { ArrowUpIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhStatisticLabel,
  XhStatisticPrefix,
  XhStatisticRoot,
  XhStatisticSuffix,
  XhStatisticValue,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 40px">
    <XhStatisticRoot>
      <XhStatisticLabel>账户余额</XhStatisticLabel>
      <XhStatisticPrefix>¥</XhStatisticPrefix>
      <XhStatisticValue>3,240.00</XhStatisticValue>
    </XhStatisticRoot>

    <XhStatisticRoot>
      <XhStatisticLabel>转化率</XhStatisticLabel>
      <XhStatisticValue>68.4</XhStatisticValue>
      <XhStatisticSuffix>%</XhStatisticSuffix>
    </XhStatisticRoot>

    <XhStatisticRoot>
      <XhStatisticLabel>较上月</XhStatisticLabel>
      <XhStatisticPrefix><XhIcon :icon="ArrowUpIcon" /></XhStatisticPrefix>
      <XhStatisticValue>12.5</XhStatisticValue>
      <XhStatisticSuffix>%</XhStatisticSuffix>
    </XhStatisticRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 40px">
  <xh-statistic>
    <div data-xh-part="root">
      <span data-xh-part="label">账户余额</span>
      <span data-xh-part="prefix">¥</span>
      <span data-xh-part="value">3,240.00</span>
    </div>
  </xh-statistic>

  <xh-statistic>
    <div data-xh-part="root">
      <span data-xh-part="label">转化率</span>
      <span data-xh-part="value">68.4</span>
      <span data-xh-part="suffix">%</span>
    </div>
  </xh-statistic>

  <xh-statistic>
    <div data-xh-part="root">
      <span data-xh-part="label">较上月</span>
      <span data-xh-part="prefix"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20V4"/><path d="M6 10L12 4L18 10"/></svg></span>
      <span data-xh-part="value">12.5</span>
      <span data-xh-part="suffix">%</span>
    </div>
  </xh-statistic>
</div>
```

### 尺寸

size 换的是标签、数值与前后缀的字号，不传 size 即默认档

```vue
<script setup lang="ts">
import {
  XhStatisticLabel,
  XhStatisticRoot,
  XhStatisticSuffix,
  XhStatisticValue,
} from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 40px">
    <XhStatisticRoot v-for="s in sizes" :key="s.label" :size="s.size">
      <XhStatisticLabel>{{ s.label }}</XhStatisticLabel>
      <XhStatisticValue>86.7</XhStatisticValue>
      <XhStatisticSuffix>%</XhStatisticSuffix>
    </XhStatisticRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 40px">
  <xh-statistic size="sm">
    <div data-xh-part="root">
      <span data-xh-part="label">小</span>
      <span data-xh-part="value">86.7</span>
      <span data-xh-part="suffix">%</span>
    </div>
  </xh-statistic>

  <xh-statistic>
    <div data-xh-part="root">
      <span data-xh-part="label">默认</span>
      <span data-xh-part="value">86.7</span>
      <span data-xh-part="suffix">%</span>
    </div>
  </xh-statistic>

  <xh-statistic size="lg">
    <div data-xh-part="root">
      <span data-xh-part="label">大</span>
      <span data-xh-part="value">86.7</span>
      <span data-xh-part="suffix">%</span>
    </div>
  </xh-statistic>
</div>
```

### 语气

tone 决定数值与前后缀用哪族颜色，标签始终保持弱前景

```vue
<script setup lang="ts">
import { ArrowUpIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhStatisticLabel,
  XhStatisticPrefix,
  XhStatisticRoot,
  XhStatisticSuffix,
  XhStatisticValue,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 32px">
    <XhStatisticRoot v-for="t in tones" :key="t" :tone="t">
      <XhStatisticLabel>{{ t }}</XhStatisticLabel>
      <XhStatisticPrefix><XhIcon :icon="ArrowUpIcon" /></XhStatisticPrefix>
      <XhStatisticValue>24.8</XhStatisticValue>
      <XhStatisticSuffix>%</XhStatisticSuffix>
    </XhStatisticRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 32px">
  <xh-statistic tone="brand">
    <div data-xh-part="root">
      <span data-xh-part="label">brand</span>
      <span data-xh-part="prefix"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20V4"/><path d="M6 10L12 4L18 10"/></svg></span>
      <span data-xh-part="value">24.8</span>
      <span data-xh-part="suffix">%</span>
    </div>
  </xh-statistic>

  <xh-statistic tone="neutral">
    <div data-xh-part="root">
      <span data-xh-part="label">neutral</span>
      <span data-xh-part="prefix"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20V4"/><path d="M6 10L12 4L18 10"/></svg></span>
      <span data-xh-part="value">24.8</span>
      <span data-xh-part="suffix">%</span>
    </div>
  </xh-statistic>

  <xh-statistic tone="success">
    <div data-xh-part="root">
      <span data-xh-part="label">success</span>
      <span data-xh-part="prefix"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20V4"/><path d="M6 10L12 4L18 10"/></svg></span>
      <span data-xh-part="value">24.8</span>
      <span data-xh-part="suffix">%</span>
    </div>
  </xh-statistic>

  <xh-statistic tone="warning">
    <div data-xh-part="root">
      <span data-xh-part="label">warning</span>
      <span data-xh-part="prefix"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20V4"/><path d="M6 10L12 4L18 10"/></svg></span>
      <span data-xh-part="value">24.8</span>
      <span data-xh-part="suffix">%</span>
    </div>
  </xh-statistic>

  <xh-statistic tone="danger">
    <div data-xh-part="root">
      <span data-xh-part="label">danger</span>
      <span data-xh-part="prefix"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20V4"/><path d="M6 10L12 4L18 10"/></svg></span>
      <span data-xh-part="value">24.8</span>
      <span data-xh-part="suffix">%</span>
    </div>
  </xh-statistic>

  <xh-statistic tone="info">
    <div data-xh-part="root">
      <span data-xh-part="label">info</span>
      <span data-xh-part="prefix"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20V4"/><path d="M6 10L12 4L18 10"/></svg></span>
      <span data-xh-part="value">24.8</span>
      <span data-xh-part="suffix">%</span>
    </div>
  </xh-statistic>
</div>
```

### 等宽数字

数值用等宽数字排版，反复换数时字宽不变，后面的单位不会左右挪

```vue
<script setup lang="ts">
import {
  XhStatisticLabel,
  XhStatisticRoot,
  XhStatisticSuffix,
  XhStatisticValue,
} from "@xihan-ui/vue";
import { ref } from "vue";

const amount = ref("1,111.11");

// 每次换一组随机数字，位数固定，只有字形在变
function reroll() {
  const digit = () => String(Math.floor(Math.random() * 10));
  amount.value = `${digit()},${digit()}${digit()}${digit()}.${digit()}${digit()}`;
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 24px">
    <XhStatisticRoot>
      <XhStatisticLabel>今日成交额</XhStatisticLabel>
      <XhStatisticValue>{{ amount }}</XhStatisticValue>
      <XhStatisticSuffix>元</XhStatisticSuffix>
    </XhStatisticRoot>

    <button type="button" @click="reroll">换一组数字</button>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 24px">
  <xh-statistic id="statistic-tabular">
    <div data-xh-part="root">
      <span data-xh-part="label">今日成交额</span>
      <span data-xh-part="value">1,111.11</span>
      <span data-xh-part="suffix">元</span>
    </div>
  </xh-statistic>

  <button type="button" id="statistic-tabular-reroll">换一组数字</button>
</div>

<script type="module">
  // 每次换一组随机数字，位数固定，只有字形在变
  const host = document.getElementById("statistic-tabular");
  const value = host.querySelector('[data-xh-part="value"]');
  document.getElementById("statistic-tabular-reroll").addEventListener("click", () => {
    const digit = () => String(Math.floor(Math.random() * 10));
    value.textContent = `${digit()},${digit()}${digit()}${digit()}.${digit()}${digit()}`;
  });
</script>
```

### 涨跌

trend 落成 trend 部件的 data-direction，箭头由皮肤画；与 tone 正交——跌也可以是好事

```vue
<script setup lang="ts">
import {
  XhStatisticLabel,
  XhStatisticRoot,
  XhStatisticSuffix,
  XhStatisticTrend,
  XhStatisticValue,
} from "@xihan-ui/vue";

const cards = [
  { label: "本月新增用户", value: "12,480", unit: "人", trend: "up", tone: "success", note: "同比 12.4%" },
  { label: "订单退货率", value: "1.8", unit: "%", trend: "down", tone: "success", note: "同比 0.6%" },
  { label: "平均响应时长", value: "240", unit: "ms", trend: "flat", tone: "neutral", note: "与上周持平" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 32px">
    <XhStatisticRoot
      v-for="c in cards"
      :key="c.label"
      :tone="c.tone"
      :trend="c.trend"
    >
      <XhStatisticLabel>{{ c.label }}</XhStatisticLabel>
      <XhStatisticValue>{{ c.value }}</XhStatisticValue>
      <XhStatisticSuffix>{{ c.unit }}</XhStatisticSuffix>
      <XhStatisticTrend>{{ c.note }}</XhStatisticTrend>
    </XhStatisticRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 32px">
  <xh-statistic tone="success" trend="up">
    <div data-xh-part="root">
      <span data-xh-part="label">本月新增用户</span>
      <span data-xh-part="value">12,480</span>
      <span data-xh-part="suffix">人</span>
      <span data-xh-part="trend">同比 12.4%</span>
    </div>
  </xh-statistic>

  <xh-statistic tone="success" trend="down">
    <div data-xh-part="root">
      <span data-xh-part="label">订单退货率</span>
      <span data-xh-part="value">1.8</span>
      <span data-xh-part="suffix">%</span>
      <span data-xh-part="trend">同比 0.6%</span>
    </div>
  </xh-statistic>

  <xh-statistic tone="neutral" trend="flat">
    <div data-xh-part="root">
      <span data-xh-part="label">平均响应时长</span>
      <span data-xh-part="value">240</span>
      <span data-xh-part="suffix">ms</span>
      <span data-xh-part="trend">与上周持平</span>
    </div>
  </xh-statistic>
</div>
```

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

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-statistic>` |
| Vue 组件 | `XhStatisticLabel` `XhStatisticPrefix` `XhStatisticRoot` `XhStatisticSuffix` `XhStatisticTrend` `XhStatisticValue` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/statistic.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="statistic"`：**`root`** · `label` · `value` · `prefix` · `suffix` · `trend`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `size` | `Size` |  | 尺寸：sm / md / lg，只落成 root 的 data-size。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，只落成 root 的 data-tone。 |
| `trend` | `StatisticTrend` |  | 涨跌：up / down / flat，落成 trend 部件的 data-direction，皮肤据它出兜底箭头。 与 tone 正交，方向与颜色互不联动——跌也可以是好事（差错率、退货率）。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `trend` | `StatisticTrend` | 当前涨跌方向；没给即 undefined。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getValueProps` | `() => T['element']` |  |
| `getPrefixProps` | `() => T['element']` |  |
| `getSuffixProps` | `() => T['element']` |  |
| `getTrendProps` | `() => T['element']` |  |

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
| `trend` | `data-direction` | props.trend |

<!-- xh-component-tokens:start -->
## CSS 变量

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

## 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 值位放[数值动画](./number-animation)；整块放进[卡片](./card)；一排指标用[栅格](./grid)。

## 最佳实践

- 单位写进后缀而不是揉进数字里，数字才对得齐。
- 给出对比基准（同比、环比），单独一个数字读者判断不了好坏。

## 反模式

- 一屏里十几个同等大小的指标：没有重点。
- 用它显示精确到分的金额却不给货币符号。
