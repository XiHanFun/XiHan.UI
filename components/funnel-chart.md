来源：https://ui.docs.xihanfun.com/components/funnel-chart

# FunnelChart 漏斗图 `new`

看一个流程里各阶段的保留量与逐级转化率。每个阶段一行，宽度与数值成正比，相邻阶段之间写出转化率。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/funnel-chart" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/funnel-chart.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/funnel-chart" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/funnel-chart" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/funnel-chart.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一行数据一个阶段、按先后排好：宽度与数值成正比，相邻阶段之间写出相对上一阶段的转化率

```vue
<script setup lang="ts">
import { XhFunnelChartRoot } from "@xihan-ui/vue";

// 每行一个阶段，次序就是流程的先后
const steps = [
  { stage: "浏览商品", users: 12800 },
  { stage: "加入购物车", users: 5200 },
  { stage: "提交订单", users: 2300 },
  { stage: "完成支付", users: 1850 },
  { stage: "再次购买", users: 620 },
];
</script>

<template>
  <XhFunnelChartRoot
    :data="steps"
    name-field="stage"
    value-field="users"
  >
    <template #caption>本月购买流程</template>
  </XhFunnelChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-funnel-chart id="funnel-chart-basic" name-field="stage" value-field="users">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">本月购买流程</figcaption>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-funnel-chart>
</div>

<script type="module">
  const chart = document.getElementById("funnel-chart-basic");
  // 每行一个阶段，次序就是流程的先后
  const steps = [
    { stage: "浏览商品", users: 12800 },
    { stage: "加入购物车", users: 5200 },
    { stage: "提交订单", users: 2300 },
    { stage: "完成支付", users: 1850 },
    { stage: "再次购买", users: 620 },
  ];
  chart.data = steps;
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="funnel-chart"`：**`root`** · `caption` · **`viewport`** · **`plot`** · `stage` · `stage-label` · `conversion` · `focus-ring` · `tooltip` · `tooltip-header` · `tooltip-row` · `tooltip-swatch` · `tooltip-value` · `tooltip-name` · `empty` · `summary` · `table-region` · `table`

## 示例

### 条形

shape="bar" 画成等高的条形：阶段之间要仔细比较宽度时比梯形的斜边好对齐

```vue
<script setup lang="ts">
import { XhFunnelChartRoot } from "@xihan-ui/vue";

const steps = [
  { stage: "浏览商品", users: 12800 },
  { stage: "加入购物车", users: 5200 },
  { stage: "提交订单", users: 2300 },
  { stage: "完成支付", users: 1850 },
  { stage: "再次购买", users: 620 },
];
</script>

<template>
  <XhFunnelChartRoot
    :data="steps"
    name-field="stage"
    value-field="users"
    shape="bar"
  >
    <template #caption>本月购买流程</template>
  </XhFunnelChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-funnel-chart id="funnel-chart-bar" name-field="stage" value-field="users" shape="bar">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">本月购买流程</figcaption>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-funnel-chart>
</div>

<script type="module">
  const chart = document.getElementById("funnel-chart-bar");
  const steps = [
    { stage: "浏览商品", users: 12800 },
    { stage: "加入购物车", users: 5200 },
    { stage: "提交订单", users: 2300 },
    { stage: "完成支付", users: 1850 },
    { stage: "再次购买", users: 620 },
  ];
  chart.data = steps;
</script>
```

### 相对第一阶段

conversion="first" 让每个阶段写相对第一阶段的转化率：读者关心从头到尾留下多少

```vue
<script setup lang="ts">
import { XhFunnelChartRoot } from "@xihan-ui/vue";

const steps = [
  { stage: "浏览商品", users: 12800 },
  { stage: "加入购物车", users: 5200 },
  { stage: "提交订单", users: 2300 },
  { stage: "完成支付", users: 1850 },
  { stage: "再次购买", users: 620 },
];
</script>

<template>
  <XhFunnelChartRoot
    :data="steps"
    name-field="stage"
    value-field="users"
    conversion="first"
  >
    <template #caption>本月购买流程</template>
  </XhFunnelChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-funnel-chart id="funnel-chart-first" name-field="stage" value-field="users" conversion="first">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">本月购买流程</figcaption>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-funnel-chart>
</div>

<script type="module">
  const chart = document.getElementById("funnel-chart-first");
  const steps = [
    { stage: "浏览商品", users: 12800 },
    { stage: "加入购物车", users: 5200 },
    { stage: "提交订单", users: 2300 },
    { stage: "完成支付", users: 1850 },
    { stage: "再次购买", users: 620 },
  ];
  chart.data = steps;
</script>
```

### 靠左对齐

align="start" 让阶段靠起始边对齐，逐级缩短看得更清楚

```vue
<script setup lang="ts">
import { XhFunnelChartRoot } from "@xihan-ui/vue";

const steps = [
  { stage: "收到简历", users: 860 },
  { stage: "简历通过", users: 310 },
  { stage: "一面", users: 150 },
  { stage: "二面", users: 64 },
  { stage: "发放录用", users: 18 },
];
</script>

<template>
  <XhFunnelChartRoot
    :data="steps"
    name-field="stage"
    value-field="users"
    align="start"
    shape="bar"
  >
    <template #caption>招聘流程</template>
  </XhFunnelChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-funnel-chart id="funnel-chart-start" name-field="stage" value-field="users" align="start" shape="bar">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">招聘流程</figcaption>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-funnel-chart>
</div>

<script type="module">
  const chart = document.getElementById("funnel-chart-start");
  const steps = [
    { stage: "收到简历", users: 860 },
    { stage: "简历通过", users: 310 },
    { stage: "一面", users: 150 },
    { stage: "二面", users: 64 },
    { stage: "发放录用", users: 18 },
  ];
  chart.data = steps;
</script>
```

### 金字塔

direction="up" 画成金字塔：第一阶段在最下面，往上逐级收窄；层级之间是包含关系，不写转化率

```vue
<script setup lang="ts">
import { XhFunnelChartRoot } from "@xihan-ui/vue";

const steps = [
  { stage: "普通会员", users: 48000 },
  { stage: "银卡", users: 12500 },
  { stage: "金卡", users: 3100 },
  { stage: "钻石", users: 420 },
];
</script>

<template>
  <XhFunnelChartRoot
    :data="steps"
    name-field="stage"
    value-field="users"
    direction="up"
    conversion="none"
  >
    <template #caption>会员等级分布</template>
  </XhFunnelChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-funnel-chart id="funnel-chart-pyramid" name-field="stage" value-field="users" direction="up" conversion="none">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">会员等级分布</figcaption>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-funnel-chart>
</div>

<script type="module">
  const chart = document.getElementById("funnel-chart-pyramid");
  const steps = [
    { stage: "普通会员", users: 48000 },
    { stage: "银卡", users: 12500 },
    { stage: "金卡", users: 3100 },
    { stage: "钻石", users: 420 },
  ];
  chart.data = steps;
</script>
```

## 设计指引

### 何时使用

- 流程有固定的先后，每一步都从上一步里留下一部分：访问 → 注册 → 下单、线索 → 商机 → 成交。
- 读者要找的是「在哪一步流失最多」，以及从头到尾留下多少。
- 金字塔（`direction="up"`）用于层级之间有包含关系、越往上越少的构成：人口年龄段、组织层级。

### 何时不用

- 阶段之间没有先后，只是几个并列的类目：用[直角坐标图](./cartesian-chart)的横向条形图。
- 要看各部分占整体的比例：用[饼图](./pie-chart)。
- 要看转化随时间的变化：一串漏斗读不出趋势，把每一步的转化率画成折线。
- 只有两个阶段：一个百分比就说清了，用[统计数值](./statistic)。

### 特性

- 数据是对象数组，按阶段的先后排好，每行一个阶段：`nameField` 指定阶段名所在的字段，`valueField` 指定数值所在的字段。数值为负时报 `chart.negative-share`，字段不存在时报 `chart.unknown-field`，根上写 `data-state="error"`；阶段值不要求递减，递增时转化率写成大于 100%。
- 阶段的宽度与数值成正比，最宽的阶段铺满漏斗占的宽度。`shape` 取 `trapezoid`（缺省）时上下两条边分别接着自己与下一阶段的宽度，最后一个阶段两条边一样宽；`bar` 画成等高的条形，各阶段之间更好比较。`align` 取 `center`（缺省）居中，`start` 靠起始边对齐，逐级缩短看得更清楚。
- `direction="up"` 画成金字塔：第一阶段在最下面，往上逐级收窄。
- 颜色取有序色阶：第一阶段最深，往后逐级变浅，到色阶的 30% 为止（更浅的一段压在承载面上看不清）。阶段有固有次序，不用分类色，也就没有图例，阶段名直接标在阶段上。`palette` 把色阶换到基础色板里同名的色相上，与热力图、按值着色的散点同名。
- 阶段标签写阶段名与数值：`labels="outside"`（缺省）跟在各阶段的右边，漏斗让出最长那条标签的宽度，字压在承载面上，深浅两端都读得清；`inside` 写在阶段里、描一圈承载面色，放不下时写到阶段右边。
- `conversion` 取 `previous`（缺省，相对上一阶段）或 `first`（相对第一阶段）时，转化率写在左侧一列、落在两个阶段的交界处；`none` 不写，左侧不留列。
- 指着一行就命中那个阶段，窄的阶段两侧的空白也算；提示框写数值与两种转化率（第一阶段只有数值），其余阶段与它们的标签淡出到 `--xh-chart-dim-alpha`，被指着的阶段不位移、不放大。
- `hiddenSeries` 隐藏的阶段不画，转化率跳过它按相邻的可见阶段重算。
- `format` 指定数值格式（数字格式或函数），标签、提示框、可及名与数据表共用；转化率固定写成一位小数的百分数。
- 多张图接到同一个受控的 `activeKey` 上时，漏斗图按阶段名与其他图的类目对齐。
- `pending` 表示正在重新取数：保留上一帧、整体降低不透明度并在根上写 `aria-busy`。首次取数、手里还没有阶段时，空态写 `translations.loadingText` 并转一个圈，取完仍没有数据才写 `emptyText`。
- 首次出现时各阶段从中线（`align="start"` 时从起始边）一起横向展开，标签与转化率淡入，数据晚于挂载到达（异步取数，或 Web Components 连上之后才赋 `data`）时同样播这段入场；之后的数据变化从当前宽度插值到新宽度。`animated={false}`（Web Components 写 `animated="false"`）关闭过渡；系统开了减弱动效或容器写了 `data-motion="reduce"` 时几何直接到位，只保留淡入淡出。
- 三个适配器的作者侧写法不同，最终 DOM 一致：Vue 与 React 不写默认内容时铺开缺省结构（标题、视口与绘图区、空态、提示框），提示框内容可由作用域插槽 / 函数式 children 替换；Web Components 侧作者写外壳（root、caption、viewport 与其中空的 `<svg>` plot，可选 empty 与 tooltip），阶段、标签与转化率由元素生成进去。
- Web Components 侧的数据与数值格式只走 JS property；字段名、形状、对齐、方向、转化率、标签、色板与 `active-key` 另有同名属性。宿主元素缺省是行内元素，放进 flex / grid 时要给它一个宽度。

### 最佳实践

- 为图写标题：`caption` 是图的可访问名称，也要说明流程是什么、统计的是哪段时间。
- 阶段保持在 3–7 个；更长的流程拆成几段，或把相近的步骤并起来。
- 读者关心逐步流失时用 `previous`，关心从头到尾留下多少时用 `first`；两种都要时读提示框与数据表。
- 各阶段之间要仔细比较数值时改用 `shape="bar"`，梯形的斜边会让宽度难以对齐。
- 需要可见的表格视图时，把 `api.table` 交给[表格](./table)组件（Vue 与 React 从根的作用域插槽 / 函数式 children 取 `table`，Web Components 读元素的 `table`）。

### 反模式

- 用漏斗画没有先后的类目：读者会把宽度的递减读成流失。
- 把不同时间段、不同口径的数放进同一个漏斗：转化率失去含义。
- 为了好看让阶段宽度不按数值：漏斗的形状本身就是数据。
- 把提示框当作读取转化率的唯一途径：提示框对读屏隐藏，数值要能从标签、摘要或数据表读到。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-funnel-chart>` |
| Vue 组件 | `XhFunnelChartCaption` `XhFunnelChartEmpty` `XhFunnelChartPlot` `XhFunnelChartRoot` `XhFunnelChartTooltip` `XhFunnelChartViewport` |
| 组合式函数 | `useFunnelChart` |
| 状态机 | `funnelChartMachine` |
| 皮肤 | `@xihan-ui/styles/funnel-chart.css` |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `hidden-series-change` | `ChartHiddenSeriesChangeDetails` | 阶段的显隐变了；detail 为 `{ hiddenSeries: string[] }` |
| `active-key-change` | `ChartActiveKeyChangeDetails` | 指针或键盘换了激活的阶段；detail 为 `{ activeKey }`，收起时为 null |
| `datum-active` | `ChartDatumDetails` | 悬停或聚焦到某个阶段；detail 为阶段详情，收起时为 null |
| `datum-press` | `ChartDatumDetails` | 指针点击、Enter 或 Space 按在某个阶段上；detail 为阶段详情 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFunnelChartRoot` | `default` | `FunnelChartRootSlotProps` | 自行摆放部件；不写时铺开缺省结构：视口（绘图区与空态）、提示框。 |
| `XhFunnelChartRoot` | `caption` | — | 缺省结构里的标题内容。 |
| `XhFunnelChartRoot` | `tooltip` | `FunnelChartTooltipSlotProps` | 缺省结构里的提示框内容。 |
| `XhFunnelChartRoot` | `empty` | — | 缺省结构里的空态内容。 |
| `XhFunnelChartTooltip` | `default` | `FunnelChartTooltipSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhFunnelChartRoot` | `data` | `readonly ChartRow[]` |  | 数据：对象数组，按阶段的先后排好，每行一个阶段。 |
| `XhFunnelChartRoot` | `nameField` | `string` |  | 阶段名所在的字段。 |
| `XhFunnelChartRoot` | `valueField` | `string` |  | 数值所在的字段。 |
| `XhFunnelChartRoot` | `shape` | `FunnelShape` |  | 阶段的形状，缺省 trapezoid。 |
| `XhFunnelChartRoot` | `align` | `FunnelAlign` |  | 阶段的对齐，缺省 center。 |
| `XhFunnelChartRoot` | `direction` | `FunnelDirection` |  | 排列方向，缺省 down；up 即金字塔。 |
| `XhFunnelChartRoot` | `conversion` | `FunnelConversion` |  | 转化率的基准，缺省 previous。 |
| `XhFunnelChartRoot` | `labels` | `FunnelLabels` |  | 阶段标签，缺省 inside。 |
| `XhFunnelChartRoot` | `palette` | `ChartPalette` |  | 顺序色阶的色板。 |
| `XhFunnelChartRoot` | `format` | `NumberFormatSpec \| ((value: number) => string)` |  | 数值格式。 |
| `XhFunnelChartRoot` | `hiddenSeries` | `string[]` |  | 隐藏的阶段（受控）。 |
| `XhFunnelChartRoot` | `defaultHiddenSeries` | `string[]` |  | 初始隐藏的阶段（非受控）。 |
| `XhFunnelChartRoot` | `activeKey` | `ChartKey \| null` |  | 激活的键（受控）：与别的图联动时是阶段名。 |
| `XhFunnelChartRoot` | `pending` | `boolean` |  | 数据重取中：保留上一帧、整体降低不透明度。 |
| `XhFunnelChartRoot` | `animated` | `boolean` |  | 播放过渡动画，缺省 true；false 时直接画终态。 |
| `XhFunnelChartRoot` | `locale` | `string` |  |  |
| `XhFunnelChartRoot` | `translations` | `Partial<FunnelChartTranslations>` |  |  |
| `XhFunnelChartRoot` | `onHiddenSeriesChange` | `FunnelChartProps['onHiddenSeriesChange']` |  |  |
| `XhFunnelChartRoot` | `onActiveKeyChange` | `FunnelChartProps['onActiveKeyChange']` |  |  |
| `XhFunnelChartRoot` | `onDatumActive` | `FunnelChartProps['onDatumActive']` |  |  |
| `XhFunnelChartRoot` | `onDatumPress` | `FunnelChartProps['onDatumPress']` |  |  |
| `XhFunnelChartRoot` | `caption` | `ReactNode` |  | 缺省结构里的标题内容。 |
| `XhFunnelChartRoot` | `renderTooltip` | `(props: FunnelChartTooltipSlotProps) => ReactNode` |  | 缺省结构里的提示框内容。 |
| `XhFunnelChartRoot` | `empty` | `ReactNode` |  | 缺省结构里的空态内容。 |
| `XhFunnelChartRoot` | `children` | `SlotChildren<FunnelChartRootSlotProps>` |  | 自行摆放部件；不写时铺开缺省结构：视口（绘图区与空态）、提示框。 |
| `XhFunnelChartTooltip` | `children` | `SlotChildren<FunnelChartTooltipSlotProps>` |  | 替换缺省内容；函数式 children 拿到激活的阶段与缺省的内容模型。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'error' \| undefined |
| `tooltip` | 'visible' \| 'hidden' |
| `empty` | 'loading' \| undefined |

以下名称仅用于内部状态机。

**状态**：`idle`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `model` | `FunnelModel` | 管线产物：阶段、布局、场景与无障碍模型。 |
| `scene` | `Scene` | 要画的场景；尚未测量时为空场景。 |
| `overlay` | `FunnelOverlay` | 前景层：焦点环画在阶段之上。 |
| `measured` | `boolean` | 视口尚未测量（服务端与首帧）。 |
| `empty` | `boolean` | 没有可画的阶段。 |
| `active` | `ChartDatumDetails \| null` | 激活的阶段；没有时为 null。 |
| `tooltip` | `FunnelTooltipModel \| null` | 提示框内容；收起时为 null。 |
| `summary` | `string` |  |
| `table` | `TableModel` | 数据表模型：阶段名、数值、相对上一阶段、相对第一阶段四列。 |
| `emptyText` | `string` |  |
| `tableCaption` | `string` |  |
| `activeKey` | `ChartKey \| null` |  |
| `hiddenSeries` | `string[]` |  |
| `toggleSeries` | `(id: string) => void` | 切换某个阶段的显隐：隐藏的阶段不画，转化率跳过它重算。 |
| `setFocusedDatum` | `(ref: { seriesId: string, index: number } \| null) => void` | 移动键盘锚点：只改锚点，不移动 DOM 焦点，也不派发回调。 |
| `markTag` | `(mark: Mark) => FunnelMarkTag` |  |
| `getRootProps` | `() => T['element']` |  |
| `getCaptionProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getPlotProps` | `() => T['element']` |  |
| `getMarkProps` | `(mark: Mark) => T['element']` |  |
| `getTooltipProps` | `() => T['element']` |  |
| `getTooltipHeaderProps` | `() => T['element']` |  |
| `getTooltipRowProps` | `(row: FunnelTooltipRow) => T['element']` |  |
| `getTooltipSwatchProps` | `(row: FunnelTooltipRow) => T['element']` |  |
| `getTooltipValueProps` | `(row: FunnelTooltipRow) => T['element']` |  |
| `getTooltipNameProps` | `(row: FunnelTooltipRow) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` |  |
| `getSummaryProps` | `() => T['element']` |  |
| `getTableRegionProps` | `() => T['element']` | 数据表的视觉隐藏区域：块级、1px、裁掉，表格放在里面；隐藏不写在表格上，表格的高度收不住。 |
| `getTableProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | 总是 | 绘图区只占一个 Tab 位：焦点落到锚点阶段，首次为第一阶段 |
| `ArrowDown` / `ArrowRight` | 焦点在绘图区 | 下一阶段；金字塔里由 ArrowUp 承担；已在最后一个则原地不动 |
| `ArrowUp` / `ArrowLeft` | 焦点在绘图区 | 上一阶段；金字塔里由 ArrowDown 承担 |
| `Home` | 焦点在绘图区 | 第一阶段 |
| `End` | 焦点在绘图区 | 最后一个阶段 |
| `PageUp` / `PageDown` | 焦点在绘图区 | 跨 10% 的阶段，至少 1 个 |
| `Enter` / `Space` | 焦点在绘图区 | 报告聚焦的阶段（onDatumPress） |
| `Escape` | 提示框显示着 | 收起提示框，焦点留在原处；按键不拦截，外层浮层的关闭仍归它自己 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `plot` | `aria-describedby` | `summary` 部件的 id |
| `plot` | `aria-labelledby` | `caption` 部件的 id |
| `plot` | `aria-roledescription` | translations.chartRoleDescription |
| `plot` | `role` | 'graphics-document' |
| `tooltip` | `aria-hidden` | 'true' |
| `mark` | `aria-hidden` | 'true' |

- 根是 `<figure>`，可访问名称来自 `caption`；不放标题时在根上写 `aria-label`。
- 绘图区是 `role="graphics-document"`，`aria-describedby` 指向组件生成的摘要；每个阶段是 `role="graphics-symbol"`，名称取 `translations.datumLabel`（缺省「阶段名, 数值, 相对上一阶段的转化率」），务必按本地语言改写。
- 绘图区只占一个 Tab 位，焦点落在阶段上：右键与下键到下一阶段，左键与上键到上一阶段；金字塔里上下两个键跟着画面对调。Home / End 到第一与最后一个阶段。焦点环画在阶段之外，只在键盘聚焦时出现。
- 阶段标签、转化率与焦点环一律 `aria-hidden`：它们的内容已在阶段的名称里；提示框同样 `aria-hidden`。
- 组件在根内生成一段摘要与一张数据表，视觉隐藏、对读屏可见：摘要写阶段数、首尾两个阶段、从头到尾的转化率与流失最多的一步（模板是 `translations.summary`）；数据表四列是阶段名、数值、相对上一阶段与相对第一阶段（列名取 `nameLabel`、`valueLabel`、`previousLabel`、`firstLabel`）。
- 颜色不承载身份：阶段名写在阶段上，次序由位置表达；强制色下阶段改成系统色的面与描边。

## 样式参考

### 皮肤

`@xihan-ui/styles/funnel-chart.css` 按 `[data-scope="funnel-chart"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-funnel-chart` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-palette` | props.palette |
| `root` | `data-state` | 'error' \| undefined |
| `root` | `data-xh-chart-part` | 'root' |
| `caption` | `data-xh-chart-part` | 'caption' |
| `viewport` | `data-xh-chart-part` | 'viewport' |
| `plot` | `data-xh-chart-part` | 'plot' |
| `tooltip` | `data-placement` | 'top' \| 'bottom'-'right' \| 'left' \| undefined |
| `tooltip` | `data-state` | 'visible' \| 'hidden' |
| `tooltip` | `data-xh-chart-part` | 'tooltip' |
| `tooltip-header` | `data-xh-chart-part` | 'tooltip-header' |
| `tooltip-row` | `data-xh-chart-part` | 'tooltip-row' |
| `tooltip-swatch` | `data-seg` | stop?.seg |
| `tooltip-swatch` | `data-xh-chart-part` | 'tooltip-swatch' |
| `tooltip-value` | `data-xh-chart-part` | 'tooltip-value' |
| `tooltip-name` | `data-xh-chart-part` | 'tooltip-name' |
| `empty` | `data-loading` | ''（条件成立时才出现） |
| `empty` | `data-state` | 'loading' \| undefined |
| `empty` | `data-xh-chart-part` | 'empty' |
| `empty` | `data-xh-loading-ring` | '' |
| `mark` | `data-dimmed` | ''（条件成立时才出现） |
| `mark` | `data-placement` | 'inside' \| 'outside' \| undefined |
| `mark` | `data-xh-chart-part` | mark.part \| undefined |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-funnel-chart-empty-gap` | `empty` | `gap` | `state=loading` | `--xh-space-2` | funnel-chart 的 empty 部件 gap 覆盖槽。 |
| `--xh-funnel-chart-gap` | `root` | `gap` | `default` | `--xh-space-3` | funnel-chart 的 root 部件 gap 覆盖槽。 |
| `--xh-funnel-chart-height` | `viewport` | `block-size` | `default` | `--xh-chart-height` | funnel-chart 的 viewport 部件 block-size 覆盖槽。 |
| `--xh-funnel-chart-stage-gap` | `root` | `--xh-_chart-metric-gap` | `default` | `--xh-chart-gap` | funnel-chart 的 root 部件 --xh-_chart-metric-gap 覆盖槽。 |
| `--xh-funnel-chart-tooltip-gap` | `tooltip` | `gap` | `default` | `--xh-space-1` | funnel-chart 的 tooltip 部件 gap 覆盖槽。 |
| `--xh-funnel-chart-tooltip-px` | `tooltip` | `padding-inline` | `default` | `--xh-surface-pad-sm` | funnel-chart 的 tooltip 部件 padding-inline 覆盖槽。 |
| `--xh-funnel-chart-tooltip-py` | `tooltip` | `padding-block` | `default` | `--xh-surface-pad-sm` | funnel-chart 的 tooltip 部件 padding-block 覆盖槽。 |
| `--xh-funnel-chart-tooltip-radius` | `tooltip` | `border-radius` | `default` | `--xh-shape-overlay` | funnel-chart 的 tooltip 部件 border-radius 覆盖槽。 |
| `--xh-funnel-chart-tooltip-row-gap` | `tooltip-row` | `gap` | `default` | `--xh-space-2` | funnel-chart 的 tooltip-row 部件 gap 覆盖槽。 |
| `--xh-funnel-chart-tooltip-shadow` | `tooltip` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | funnel-chart 的 tooltip 部件 box-shadow 覆盖槽。 |
| `--xh-funnel-chart-tooltip-swatch-radius` | `tooltip-swatch` | `border-radius` | `default` | `--xh-shape-inset` | funnel-chart 的 tooltip-swatch 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：状态 · 出现（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-fade-in` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`opacity` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 绘图区不随文字方向镜像：`align="start"` 始终靠左缘，转化率在左、外侧标签在右。
- 提示框的内容随文字方向排列。
