来源：https://ui.docs.xihanfun.com/components/sparkline

# Sparkline 迷你图 `new`

在文字、表格单元格或指标卡里一眼看到一组数的趋势形状。没有坐标轴、图例与提示框，高度缺省是一行字高，随文排版。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/sparkline" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/sparkline.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/sparkline" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/sparkline" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/sparkline.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一组数画成一条折线，末点标出现在的位置；可及名写在 aria-label 上，摘要由组件生成

```vue
<script setup lang="ts">
import { XhSparkline } from "@xihan-ui/vue";

// 近 12 周的访问量：迷你图只看形状，不读具体的值
const visits = [320, 356, 341, 398, 420, 388, 452, 470, 431, 498, 520, 548];
</script>

<template>
  <XhSparkline :data="visits" aria-label="近 12 周访问量" />
</template>
```

```html
<!-- 元素只认作者写的空 <svg>：摘要与图形由它按数据生成进去 -->
<xh-sparkline id="sparkline-basic">
  <svg data-xh-part="root" aria-label="近 12 周访问量"></svg>
</xh-sparkline>

<script type="module">
  // 近 12 周的访问量：迷你图只看形状，不读具体的值
  // 数据是数组，只走 property
  document.getElementById("sparkline-basic").data = [320, 356, 341, 398, 420, 388, 452, 470, 431, 498, 520, 548];
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="sparkline"`：**`root`** · `summary` · `band` · `reference-line` · `area-fill` · `line` · `bar` · `dot`

## 示例

### 变体

variant 切换同一组数的画法：line 折线、area 折线下铺一层淡洗、bar 柱

```vue
<script setup lang="ts">
import { XhSparkline } from "@xihan-ui/vue";

const orders = [18, 24, 21, 30, 27, 35, 32, 41];
const variants = ["line", "area", "bar"] as const;
</script>

<template>
  <div :style="{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--xh-space-6)' }">
    <XhSparkline
      v-for="v in variants"
      :key="v"
      :data="orders"
      :variant="v"
      :aria-label="`近 8 天订单数（${v}）`"
    />
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--xh-space-6)">
  <xh-sparkline data-demo="sparkline-variant" variant="line">
    <svg data-xh-part="root" aria-label="近 8 天订单数（line）"></svg>
  </xh-sparkline>
  <xh-sparkline data-demo="sparkline-variant" variant="area">
    <svg data-xh-part="root" aria-label="近 8 天订单数（area）"></svg>
  </xh-sparkline>
  <xh-sparkline data-demo="sparkline-variant" variant="bar">
    <svg data-xh-part="root" aria-label="近 8 天订单数（bar）"></svg>
  </xh-sparkline>
</div>

<script type="module">
  for (const el of document.querySelectorAll("[data-demo='sparkline-variant']"))
    el.data = [18, 24, 21, 30, 27, 35, 32, 41];
</script>
```

### 盈亏

variant="win-loss" 只看正负：正值在中线之上、负值在中线之下，柱等高，0 不画

```vue
<script setup lang="ts">
import { XhSparkline } from "@xihan-ui/vue";

// 近 16 个交易日的盈亏（元）：只关心赚还是亏、连续几天
const pnl = [120, -40, 85, 60, -15, -80, 0, 45, 30, 90, -25, 70, 55, -60, 20, 110];
</script>

<template>
  <XhSparkline :data="pnl" variant="win-loss" aria-label="近 16 个交易日盈亏" />
</template>
```

```html
<xh-sparkline id="sparkline-win-loss" variant="win-loss">
  <svg data-xh-part="root" aria-label="近 16 个交易日盈亏"></svg>
</xh-sparkline>

<script type="module">
  // 近 16 个交易日的盈亏（元）：只关心赚还是亏、连续几天
  document.getElementById("sparkline-win-loss").data = [120, -40, 85, 60, -15, -80, 0, 45, 30, 90, -25, 70, 55, -60, 20, 110];
</script>
```

### 极值

markers="extremes" 在末点之外再标出最高与最低点；markers="none" 一个点都不标

```vue
<script setup lang="ts">
import { XhSparkline } from "@xihan-ui/vue";

// 一天里每两小时的在线人数
const online = [820, 640, 410, 380, 560, 1240, 1580, 1320, 1460, 1710, 1390, 980];
</script>

<template>
  <div :style="{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--xh-space-6)' }">
    <XhSparkline :data="online" markers="extremes" aria-label="今日在线人数，标出最高与最低" />
    <XhSparkline :data="online" markers="none" aria-label="今日在线人数" />
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--xh-space-6)">
  <xh-sparkline data-demo="sparkline-markers" markers="extremes">
    <svg data-xh-part="root" aria-label="今日在线人数，标出最高与最低"></svg>
  </xh-sparkline>
  <xh-sparkline data-demo="sparkline-markers" markers="none">
    <svg data-xh-part="root" aria-label="今日在线人数"></svg>
  </xh-sparkline>
</div>

<script type="module">
  // 一天里每两小时的在线人数
  for (const el of document.querySelectorAll("[data-demo='sparkline-markers']"))
    el.data = [820, 640, 410, 380, 560, 1240, 1580, 1320, 1460, 1710, 1390, 980];
</script>
```

### 参考带

band 把正常区间画成一条淡底，一眼看出哪几次越界；纵向范围会扩到把它包进来

```vue
<script setup lang="ts">
import { XhSparkline } from "@xihan-ui/vue";

// 近 14 天的接口 P95 延迟（ms），正常区间 120–200
const latency = [150, 162, 148, 171, 188, 214, 196, 172, 165, 158, 231, 204, 179, 168];
</script>

<template>
  <XhSparkline :data="latency" :band="[120, 200]" aria-label="近 14 天 P95 延迟，正常区间 120 到 200 毫秒" />
</template>
```

```html
<xh-sparkline id="sparkline-band">
  <svg data-xh-part="root" aria-label="近 14 天 P95 延迟，正常区间 120 到 200 毫秒"></svg>
</xh-sparkline>

<script type="module">
  // 近 14 天的接口 P95 延迟（ms），正常区间 120–200；参考带是数组，只走 property
  const sparkline = document.getElementById("sparkline-band");
  sparkline.data = [150, 162, 148, 171, 188, 214, 196, 172, 165, 158, 231, 204, 179, 168];
  sparkline.band = [120, 200];
</script>
```

### 颜色

颜色本身带好坏含义时写 tone：线与标记点整条取语气色；缺省 neutral 线取弱化色、末点取品牌色

```vue
<script setup lang="ts">
import { XhSparkline } from "@xihan-ui/vue";

// 近 10 分钟的错误率（%）：越高越糟，取危险色
const errors = [0.4, 0.5, 0.3, 0.6, 0.9, 1.4, 1.2, 1.8, 2.3, 2.1];
</script>

<template>
  <XhSparkline :data="errors" tone="danger" aria-label="近 10 分钟错误率" />
</template>
```

```html
<xh-sparkline id="sparkline-tone" tone="danger">
  <svg data-xh-part="root" aria-label="近 10 分钟错误率"></svg>
</xh-sparkline>

<script type="module">
  // 近 10 分钟的错误率（%）：越高越糟，取危险色
  document.getElementById("sparkline-tone").data = [0.4, 0.5, 0.3, 0.6, 0.9, 1.4, 1.2, 1.8, 2.3, 2.1];
</script>
```

### 随文

缺省高度是所在行的一行字高、宽 6rem，放进正文或更小的说明文字里都不撑高这一行

```vue
<script setup lang="ts">
import { XhSparkline } from "@xihan-ui/vue";

const signups = [42, 38, 51, 47, 60, 58, 66];
</script>

<template>
  <div :style="{ display: 'grid', gap: 'var(--xh-space-3)' }">
    <div>
      本周注册 <XhSparkline :data="signups" aria-label="本周每日注册数" /> 共 362 人，较上周多 18%。
    </div>
    <div :style="{ color: 'var(--xh-fg-muted)', fontSize: 'var(--xh-text-caption-size)' }">
      数据截至今日 18:00 <XhSparkline :data="signups" markers="none" aria-label="本周每日注册数" />
    </div>
  </div>
</template>
```

```html
<div style="display: grid; gap: var(--xh-space-3)">
  <div>
    本周注册
    <xh-sparkline data-demo="sparkline-inline">
      <svg data-xh-part="root" aria-label="本周每日注册数"></svg>
    </xh-sparkline>
    共 362 人，较上周多 18%。
  </div>
  <div style="color: var(--xh-fg-muted); font-size: var(--xh-text-caption-size)">
    数据截至今日 18:00
    <xh-sparkline data-demo="sparkline-inline" markers="none">
      <svg data-xh-part="root" aria-label="本周每日注册数"></svg>
    </xh-sparkline>
  </div>
</div>

<script type="module">
  for (const el of document.querySelectorAll("[data-demo='sparkline-inline']"))
    el.data = [42, 38, 51, 47, 60, 58, 66];
</script>
```

### 指标卡

与统计数值组合：数值给出现在是多少，迷你图给出是怎么走到这里的；尺寸由组件槽放大到铺满卡片

```vue
<script setup lang="ts">
import {
  XhCardContent,
  XhCardRoot,
  XhSparkline,
  XhStatisticLabel,
  XhStatisticRoot,
  XhStatisticSuffix,
  XhStatisticTrend,
  XhStatisticValue,
} from "@xihan-ui/vue";

const revenue = [86, 92, 88, 97, 104, 99, 112, 118, 115, 126, 131, 138];
</script>

<template>
  <XhCardRoot style="inline-size: 18rem; max-inline-size: 100%">
    <XhCardContent :style="{ display: 'grid', gap: 'var(--xh-space-3)' }">
      <XhStatisticRoot tone="success" trend="up">
        <XhStatisticLabel>本月营收</XhStatisticLabel>
        <XhStatisticValue>138</XhStatisticValue>
        <XhStatisticSuffix>万元</XhStatisticSuffix>
        <XhStatisticTrend>较上月 5.3%</XhStatisticTrend>
      </XhStatisticRoot>
      <XhSparkline
        :data="revenue"
        variant="area"
        aria-label="近 12 个月营收"
        :style="{ '--xh-sparkline-width': '100%', '--xh-sparkline-height': 'var(--xh-space-8)' }"
      />
    </XhCardContent>
  </XhCardRoot>
</template>
```

```html
<xh-card>
  <div data-xh-part="root" style="inline-size: 18rem; max-inline-size: 100%">
    <div data-xh-part="content" style="display: grid; gap: var(--xh-space-3)">
      <xh-statistic tone="success" trend="up">
        <div data-xh-part="root">
          <span data-xh-part="label">本月营收</span>
          <span data-xh-part="value">138</span>
          <span data-xh-part="suffix">万元</span>
          <span data-xh-part="trend">较上月 5.3%</span>
        </div>
      </xh-statistic>
      <!-- 宿主元素缺省是行内元素：要铺满卡片时给它 display: block -->
      <xh-sparkline id="sparkline-stat-card" variant="area" style="display: block">
        <svg
          data-xh-part="root"
          aria-label="近 12 个月营收"
          style="--xh-sparkline-width: 100%; --xh-sparkline-height: var(--xh-space-8)"
        ></svg>
      </xh-sparkline>
    </div>
  </div>
</xh-card>

<script type="module">
  document.getElementById("sparkline-stat-card").data = [86, 92, 88, 97, 104, 99, 112, 118, 115, 126, 131, 138];
</script>
```

### 摘要文案

读屏念出的描述由 translations.summary 按摘要模型写成，数值按 locale 与 format 格式化

```vue
<script setup lang="ts">
import type { SparklineSummary } from "@xihan-ui/headless";
import { XhSparkline } from "@xihan-ui/vue";

const balance = [12800, 13400, 12950, 14100, 13820, 15260];

// 模型里的数值已按 locale 与 format 写好，模板只管措辞
function summary(m: SparklineSummary): string {
  if (m.count === 0)
    return "没有数据。";
  const trend = m.direction === "up" ? `上升 ${m.change}` : m.direction === "down" ? `下降 ${m.change}` : "持平";
  return `${m.count} 个月，最低 ${m.min}，最高 ${m.max}；最新 ${m.last}，较首月${trend}。`;
}
</script>

<template>
  <XhSparkline
    :data="balance"
    locale="zh-CN"
    :format="{ style: 'currency', currency: 'CNY', precision: { type: 'fixed', digits: 0 } }"
    :translations="{ summary }"
    aria-label="近 6 个月账户余额"
  />
</template>
```

```html
<xh-sparkline id="sparkline-summary" locale="zh-CN">
  <svg data-xh-part="root" aria-label="近 6 个月账户余额"></svg>
</xh-sparkline>

<script type="module">
  const sparkline = document.getElementById("sparkline-summary");
  sparkline.data = [12800, 13400, 12950, 14100, 13820, 15260];
  sparkline.format = { style: "currency", currency: "CNY", precision: { type: "fixed", digits: 0 } };
  // 模型里的数值已按 locale 与 format 写好，模板只管措辞
  sparkline.translations = {
    summary: (m) => {
      if (m.count === 0)
        return "没有数据。";
      const trend = m.direction === "up" ? `上升 ${m.change}` : m.direction === "down" ? `下降 ${m.change}` : "持平";
      return `${m.count} 个月，最低 ${m.min}，最高 ${m.max}；最新 ${m.last}，较首月${trend}。`;
    },
  };
</script>
```

### 参考线

reference 画一条横贯的虚线：写目标值看每天达没达标，写 mean / median 看高于还是低于平常；摘要一并读出它的值

```vue
<script setup lang="ts">
import { XhSparkline } from "@xihan-ui/vue";

// 近 14 天的日销量（单），目标每天 180
const sales = [150, 162, 188, 171, 196, 214, 176, 182, 165, 158, 201, 194, 179, 186];
</script>

<template>
  <div style="display: grid; gap: 8px">
    <XhSparkline :data="sales" :reference="180" aria-label="近 14 天日销量，目标 180 单" />
    <!-- 均值由组件按有值的点算出 -->
    <XhSparkline :data="sales" reference="mean" variant="area" aria-label="近 14 天日销量与均值" />
  </div>
</template>
```

```html
<div style="display: grid; gap: 8px">
  <xh-sparkline id="sparkline-reference-target" reference="180">
    <svg data-xh-part="root" aria-label="近 14 天日销量，目标 180 单"></svg>
  </xh-sparkline>
  <!-- 均值由组件按有值的点算出 -->
  <xh-sparkline id="sparkline-reference-mean" reference="mean" variant="area">
    <svg data-xh-part="root" aria-label="近 14 天日销量与均值"></svg>
  </xh-sparkline>
</div>

<script type="module">
  // 近 14 天的日销量（单），目标每天 180
  const sales = [150, 162, 188, 171, 196, 214, 176, 182, 165, 158, 201, 194, 179, 186];
  document.getElementById("sparkline-reference-target").data = sales;
  document.getElementById("sparkline-reference-mean").data = sales;
</script>
```

## 设计指引

### 何时使用

- 指标卡里给数值配上它是怎么走到这里的：近 12 周访问量、近 30 天营收。
- 表格的一列里并排比较多行的走势：每个接口的延迟、每个门店的销量。
- 正文里一句话带出一段趋势，读者不需要读具体的值。

### 何时不用

- 需要读出具体的值、悬停查看或用键盘逐点浏览：改用[直角坐标图](./cartesian-chart)。
- 只有一个数：使用[统计数值](./statistic)。
- 要比较几组数的大小而不是各自的走势：并排的迷你图各自缩放，高低不能互相比较，改用直角坐标图把它们画在同一根数值轴上。
- 单值对量程（完成度、容量占用）：使用[进度条](./progress)。

### 特性

- 数据可以是数值数组，也可以是对象数组配合 `y` 指明数值字段；null、undefined 与 NaN 是缺失，折线在缺失处断开，不按 0 画。对象数组没给 `y`、或字段在数据里不存在时报错，根上写 `data-state="error"`；没有一个有值的点时根上写 `data-state="empty"`，什么都不画。
- 形态由 `variant` 切换：`line` 折线（缺省）；`area` 在折线下铺一层淡洗，铺到根的下沿，只衬托形状；`bar` 一个值一根柱，纵向范围包含 0，柱从 0 长出；`win-loss` 只看正负，正值在中线之上、负值在中线之下，柱等高，0 与缺失不画，颜色取涨跌色（缺省绿涨红跌）。
- 对象数组给了 `x` 且它是数值或日期时，折线按横坐标的间距排开，间隔不均的采样也不会被拉平；`x` 是类目名或没给时按数据次序等距排开。柱与盈亏形态总是按次序等宽排开。数据按横坐标排好序再交给组件，组件按数据次序连线。
- `curve="monotone"` 把折线画得平滑，且不会越过数据点冒出数据里没有的高低。
- 标记点由 `markers` 控制：`last`（缺省）标出末点，读者先看到「现在在哪」；`extremes` 在末点之外再标出最高与最低点，末点恰是最高或最低时只标一次，全部相等时只标末点；`none` 不标。柱形态下是把对应的那几根柱换成强调色。盈亏形态不画标记点。
- `band` 把正常区间 `[下界, 上界]` 画成一条横贯的淡底，纵向范围会扩到把它包进来，越界的点一眼可见。下界大于上界或不是有限数时报错。盈亏形态不画参考带。
- `reference` 画一条横贯的细虚线（部件 `reference-line`）：写一个数是目标或阈值，写 `mean` / `median` 按有值的点算出均值 / 中位数。纵向范围同样扩到把它包进来；摘要里一并读出它的值，读屏用户也知道这条尺子在哪。既不是有限数也不是 `mean` / `median` 时报错。盈亏形态不画参考线，它的中线已经是 0。
- 缺省语气 `neutral`：线与柱取弱化色 `--xh-chart-deemphasis`，标记点与强调的柱取品牌色相的分类色 1。写了其他 `tone` 时整条取语气色：颜色本身带好坏含义（错误率、合格率）时用它，并在旁边用文字说明好坏。
- 尺寸由组件槽决定：宽 `--xh-sparkline-width`（缺省 6rem），高 `--xh-sparkline-height`（缺省一行字高，`1lh`）。放进指标卡时把宽改成 `100%`、高改成一格间距令牌即可铺满；几何在尺寸变化后重新计算，线宽与标记点大小不随之缩放。
- 首次出现时折线从头描到尾，标记点等描线的笔尖到了才出现，柱从基线长出，数据晚于挂载到达（异步取数，或 Web Components 连上之后才赋 `data`）时同样播这段入场；之后数据变化时从当前位置插值到新位置，数据整体平移一格（滚动窗口）时折线跟着滑动而不是变形。`animated={false}`（Web Components 写 `animated="false"`）关闭过渡；系统开了减弱动效或容器写了 `data-motion="reduce"` 时几何直接到位，只保留淡入。
- 三个适配器的作者侧写法不同，最终 DOM 一致：Vue 与 React 渲染一个 `<svg>`；Web Components 侧作者写一个空的 `<svg data-xh-part="root">`，摘要与图形由元素生成进去。数据、参考带与数值格式只走 JS property；参考线另有同名属性（`reference="180"` 或 `reference="mean"`）。

### 最佳实践

- 在根上写 `aria-label` 说明这是什么数据、覆盖多长时间（如「近 12 周访问量」），摘要只念数值。
- 旁边给出末值或变化量的文字：迷你图不标数，读者靠它读出「现在是多少」。
- 同一列里的迷你图用相同的宽度、相同的时间跨度，读者才能按位置对照形状。
- 一张迷你图只画一组数；要比较两组数的走势就并排放两张，或者改用直角坐标图。

### 反模式

- 在迷你图上加坐标轴、网格或数据标签：那是直角坐标图的职责，迷你图的价值就在于小到能随文。
- 把几张各自缩放的迷你图当作大小比较：每张的纵向范围只由自己的数据决定，高的那张不代表数更大。
- 用语气色表达没有好坏含义的数据：读者会把颜色读成告警。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-sparkline>` |
| Vue 组件 | `XhSparkline` |
| 组合式函数 | `useSparkline` |
| 状态机 | `sparklineMachine` |
| 皮肤 | `@xihan-ui/styles/sparkline.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `data` | `readonly (number \| null \| undefined)[] \| readonly ChartRow[]` |  | 数据：数值数组，或对象数组配合 x / y 指明字段。null、undefined 与 NaN 是缺失，折线在此断开，不按 0 画。 |
| `x` | `string` |  | 对象数组的横坐标字段；是数值或日期时折线按它的间距排开，缺省按数据次序等距排开。 |
| `y` | `string` |  | 对象数组的数值字段。 |
| `variant` | `SparklineVariant` |  | 形态，缺省 line。 |
| `curve` | `SparklineCurve` |  | 折线与面积的插值，缺省 linear。 |
| `markers` | `SparklineMarkers` |  | 标记点，缺省 last；柱形态下是把这几根柱换成强调色，盈亏形态不标。 |
| `band` | `readonly [number, number]` |  | 参考带 [下界, 上界]：正常区间画成一条淡底，纵向范围扩到把它包进来。盈亏形态不画。 |
| `reference` | `SparklineReference` |  | 参考线：一条横贯的虚线，写一个固定值（目标、阈值），或 mean / median 按数据算出均值 / 中位数。 纵向范围扩到把它包进来；摘要里一并读出它的值。盈亏形态不画。 |
| `tone` | `Tone` |  | 语气，缺省 neutral：线与柱取弱化色、标记取品牌色；其余语气整条取语气色。 |
| `format` | `NumberFormatSpec \| ((value: number) => string)` |  | 数值格式：摘要里的数值用它写。 |
| `animated` | `boolean` |  | 播放过渡动画，缺省 true：首次出现时折线从头描到尾、柱从基线长出，数据变化时从当前位置插值到新位置。 false 时直接画终态。系统开了减弱动效或容器写了 data-motion="reduce" 时几何直接落到终态，只保留淡入淡出。 |
| `locale` | `string` |  | 数字格式与内建文案的语言；未提供时按宿主语言。 |
| `translations` | `Partial<SparklineTranslations>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'error' \| 'empty' \| undefined |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`RESIZE` · `METRICS` · `SCENE.FRAME`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `model` | `SparklineModel` | 管线产物：规格、场景与摘要。 |
| `scene` | `Scene` | 要画的场景；尚未测量时为空场景。 |
| `measured` | `boolean` | 已经量过尺寸、画得出来。 |
| `empty` | `boolean` | 没有一个有值的点。 |
| `summary` | `string` |  |
| `getRootProps` | `() => T['element']` |  |
| `getSummaryProps` | `() => T['element']` |  |
| `getMarkProps` | `(mark: Mark) => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-describedby` | `summary` 部件的 id |
| `root` | `role` | 'img' |

- 根是 `<svg role="img">`，可访问名称来自作者写在根上的 `aria-label`；没写时开发期在诊断通道报 `chart.missing-name`。
- `aria-describedby` 指向组件生成的摘要（`<desc>`），缺省英文，写点数、范围、末值与首末变化率；盈亏形态写正负各几个。模板是 `translations.summary`，拿到的数值已按 `locale` 与 `format` 格式化，务必按本地语言改写。
- 迷你图不可聚焦、不接任何按键，里面的图形对读屏都是装饰；要逐个读值就换直角坐标图。
- 颜色不是读出信息的唯一途径：盈亏的正负靠在中线的上方还是下方表达，强制色下线与柱取系统文字色、标记点取强调色，参考带只留轮廓。

## 样式参考

### 皮肤

`@xihan-ui/styles/sparkline.css` 按 `[data-scope="sparkline"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-sparkline` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-state` | 'error' \| 'empty' \| undefined |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-sparkline-accent-color` | `bar`<br>`dot`<br>`root` | `fill` | `default`<br>`marker`<br>`not([data-tone='neutral'])`<br>`tone`<br>`tone=neutral` | `--xh-_tone`<br>`--xh-chart-categorical-1` | sparkline 的 bar、dot、root 部件 fill 覆盖槽。 |
| `--xh-sparkline-band-bg` | `band` | `fill` | `default` | `--xh-bg-subtle` | sparkline 的 band 部件 fill 覆盖槽。 |
| `--xh-sparkline-bar-max` | `root` | `--xh-_chart-metric-bar-max` | `default` | `--xh-chart-bar-max` | sparkline 的 root 部件 --xh-_chart-metric-bar-max 覆盖槽。 |
| `--xh-sparkline-bar-radius` | `root` | `--xh-_chart-metric-radius` | `default` | `--xh-shape-inset` | sparkline 的 root 部件 --xh-_chart-metric-radius 覆盖槽。 |
| `--xh-sparkline-color` | `area-fill`<br>`bar`<br>`line`<br>`root` | `fill`<br>`stroke` | `default`<br>`not([data-tone='neutral'])`<br>`tone`<br>`tone=neutral` | `--xh-_tone`<br>`--xh-chart-deemphasis` | sparkline 的 area-fill、bar、line、root 部件 fill、stroke 覆盖槽。 |
| `--xh-sparkline-height` | `root` | `block-size` | `default` | `--xh-text-body-size`<br>`1lh` | sparkline 的 root 部件 block-size 覆盖槽。 |
| `--xh-sparkline-line-width` | `legend-swatch`<br>`line`<br>`root`<br>`tooltip-swatch` | `--xh-_chart-dash`<br>`background`<br>`block-size`<br>`stroke-width` | `@media (forced-colors: active)`<br>`@media print`<br>`default`<br>`mark=line`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns` | `--xh-chart-line-width` | sparkline 的 legend-swatch、line、root、tooltip-swatch 部件 --xh-_chart-dash、background、block-size、stroke-width 覆盖槽。 |
| `--xh-sparkline-marker-size` | `legend-swatch`<br>`root`<br>`tooltip-swatch` | `background` | `@media (forced-colors: active)`<br>`@media print`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=1`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns` | `--xh-chart-point-size` | sparkline 的 legend-swatch、root、tooltip-swatch 部件 background 覆盖槽。 |
| `--xh-sparkline-reference-color` | `reference-line` | `stroke` | `default` | `--xh-chart-label` | sparkline 的 reference-line 部件 stroke 覆盖槽。 |
| `--xh-sparkline-width` | `root` | `inline-size` | `default` | `6rem` | sparkline 的 root 部件 inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：出现（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-draw` · `xh-fade-in` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

- 迷你图不随文字方向镜像：时间从左往右走，与直角坐标图的绘图区一致。
