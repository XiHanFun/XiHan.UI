来源：https://ui.docs.xihanfun.com/components/radar-chart

# RadarChart 雷达图 `new`

比较少数几个实体在多个指标上的画像。每个指标一根轴，自 12 点方向顺时针排开，一个实体连成一个多边形。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/radar-chart" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/radar-chart.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/radar-chart" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/radar-chart" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/radar-chart.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一行数据一个实体：nameField 取实体名字段，indicators 列出指标；每个指标一根轴，自 12 点顺时针排开

```vue
<script setup lang="ts">
import { XhRadarChartRoot } from "@xihan-ui/vue";

// 每行一个实体，指标的值都是 0–100 的评分
const phones = [
  { model: "旗舰机", camera: 92, battery: 70, screen: 88, performance: 95, price: 45 },
  { model: "中端机", camera: 74, battery: 86, screen: 72, performance: 70, price: 82 },
];

// 指标按顺时针排开；相关的指标排在相邻的位置
const indicators = [
  { key: "camera", label: "影像" },
  { key: "battery", label: "续航" },
  { key: "screen", label: "屏幕" },
  { key: "performance", label: "性能" },
  { key: "price", label: "性价比" },
] as const;
</script>

<template>
  <XhRadarChartRoot
    :data="phones"
    name-field="model"
    :indicators="indicators"
  >
    <template #caption>两款手机的评测得分</template>
  </XhRadarChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-radar-chart id="radar-chart-basic" name-field="model">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">两款手机的评测得分</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-radar-chart>
</div>

<script type="module">
  const chart = document.getElementById("radar-chart-basic");
  // 每行一个实体，指标的值都是 0–100 的评分
  const phones = [
    { model: "旗舰机", camera: 92, battery: 70, screen: 88, performance: 95, price: 45 },
    { model: "中端机", camera: 74, battery: 86, screen: 72, performance: 70, price: 82 },
  ];
  // 指标按顺时针排开；相关的指标排在相邻的位置
  const indicators = [
    { key: "camera", label: "影像" },
    { key: "battery", label: "续航" },
    { key: "screen", label: "屏幕" },
    { key: "performance", label: "性能" },
    { key: "price", label: "性价比" },
  ];
  chart.data = phones;
  chart.indicators = indicators;
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="radar-chart"`：**`root`** · `caption` · `legend` · `legend-item` · `legend-swatch` · `legend-label` · **`viewport`** · **`plot`** · `defs` · `pattern` · `pattern-line` · `grid-ring` · `ring-label` · `spoke` · `indicator-label` · `series` · `area-fill` · `line` · `point` · `crosshair` · `focus-ring` · `tooltip` · `tooltip-header` · `tooltip-row` · `tooltip-swatch` · `tooltip-value` · `tooltip-name` · `empty` · `summary` · `table`

## 示例

### 共用量程

scale="shared" 让全部指标共用一个量程：单位相同的指标，形状的大小才能跨指标比较

```vue
<script setup lang="ts">
import { XhRadarChartRoot } from "@xihan-ui/vue";

// 六项能力都是 0–100 分：同一种单位，适合共用量程
const people = [
  { name: "张三", design: 85, frontend: 92, backend: 60, testing: 70, communication: 78, planning: 66 },
  { name: "李四", design: 58, frontend: 70, backend: 90, testing: 82, communication: 64, planning: 80 },
];

const indicators = [
  { key: "design", label: "设计" },
  { key: "frontend", label: "前端" },
  { key: "backend", label: "后端" },
  { key: "testing", label: "测试" },
  { key: "communication", label: "沟通" },
  { key: "planning", label: "规划" },
] as const;
</script>

<template>
  <XhRadarChartRoot
    :data="people"
    name-field="name"
    :indicators="indicators"
    scale="shared"
  >
    <template #caption>两名工程师的能力评估</template>
  </XhRadarChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-radar-chart id="radar-chart-shared" name-field="name" scale="shared">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">两名工程师的能力评估</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-radar-chart>
</div>

<script type="module">
  const chart = document.getElementById("radar-chart-shared");
  // 六项能力都是 0–100 分：同一种单位，适合共用量程
  const people = [
    { name: "张三", design: 85, frontend: 92, backend: 60, testing: 70, communication: 78, planning: 66 },
    { name: "李四", design: 58, frontend: 70, backend: 90, testing: 82, communication: 64, planning: 80 },
  ];
  const indicators = [
    { key: "design", label: "设计" },
    { key: "frontend", label: "前端" },
    { key: "backend", label: "后端" },
    { key: "testing", label: "测试" },
    { key: "communication", label: "沟通" },
    { key: "planning", label: "规划" },
  ];
  chart.data = people;
  chart.indicators = indicators;
</script>
```

### 指定量程

指标上写 min / max 固定量程：单位不同的指标各自按自己的尺度读，数据变了轴也不跳

```vue
<script setup lang="ts">
import { XhRadarChartRoot } from "@xihan-ui/vue";

// 五个指标的单位各不相同：客流是人次、客单价是元、复购率是百分比……
const stores = [
  { store: "旗舰店", traffic: 5200, basket: 168, repeat: 42, rating: 4.7, staff: 18 },
  { store: "社区店", traffic: 2100, basket: 96, repeat: 58, rating: 4.5, staff: 7 },
];

// 每个指标固定自己的量程，写在指标名里读者才知道轴的尺度
const indicators = [
  { key: "traffic", label: "客流（人次）", max: 6000 },
  { key: "basket", label: "客单价（元）", max: 200 },
  { key: "repeat", label: "复购率（%）", max: 100 },
  { key: "rating", label: "评分", min: 3, max: 5 },
  { key: "staff", label: "店员（人）", max: 20 },
] as const;
</script>

<template>
  <XhRadarChartRoot
    :data="stores"
    name-field="store"
    :indicators="indicators"
  >
    <template #caption>门店经营指标</template>
  </XhRadarChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-radar-chart id="radar-chart-range" name-field="store">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">门店经营指标</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-radar-chart>
</div>

<script type="module">
  const chart = document.getElementById("radar-chart-range");
  // 五个指标的单位各不相同：客流是人次、客单价是元、复购率是百分比……
  const stores = [
    { store: "旗舰店", traffic: 5200, basket: 168, repeat: 42, rating: 4.7, staff: 18 },
    { store: "社区店", traffic: 2100, basket: 96, repeat: 58, rating: 4.5, staff: 7 },
  ];
  // 每个指标固定自己的量程，写在指标名里读者才知道轴的尺度
  const indicators = [
    { key: "traffic", label: "客流（人次）", max: 6000 },
    { key: "basket", label: "客单价（元）", max: 200 },
    { key: "repeat", label: "复购率（%）", max: 100 },
    { key: "rating", label: "评分", min: 3, max: 5 },
    { key: "staff", label: "店员（人）", max: 20 },
  ];
  chart.data = stores;
  chart.indicators = indicators;
</script>
```

### 圆形网格

shape="circle" 把网格画成同心圆：指标多、多边形的折角显得杂乱时更安静

```vue
<script setup lang="ts">
import { XhRadarChartRoot } from "@xihan-ui/vue";

const people = [
  { name: "张三", design: 85, frontend: 92, backend: 60, testing: 70, communication: 78, planning: 66 },
  { name: "李四", design: 58, frontend: 70, backend: 90, testing: 82, communication: 64, planning: 80 },
];

const indicators = [
  { key: "design", label: "设计" },
  { key: "frontend", label: "前端" },
  { key: "backend", label: "后端" },
  { key: "testing", label: "测试" },
  { key: "communication", label: "沟通" },
  { key: "planning", label: "规划" },
] as const;
</script>

<template>
  <XhRadarChartRoot
    :data="people"
    name-field="name"
    :indicators="indicators"
    shape="circle"
  >
    <template #caption>两名工程师的能力评估</template>
  </XhRadarChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-radar-chart id="radar-chart-circle" name-field="name" shape="circle">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">两名工程师的能力评估</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-radar-chart>
</div>

<script type="module">
  const chart = document.getElementById("radar-chart-circle");
  const people = [
    { name: "张三", design: 85, frontend: 92, backend: 60, testing: 70, communication: 78, planning: 66 },
    { name: "李四", design: 58, frontend: 70, backend: 90, testing: 82, communication: 64, planning: 80 },
  ];
  const indicators = [
    { key: "design", label: "设计" },
    { key: "frontend", label: "前端" },
    { key: "backend", label: "后端" },
    { key: "testing", label: "测试" },
    { key: "communication", label: "沟通" },
    { key: "planning", label: "规划" },
  ];
  chart.data = people;
  chart.indicators = indicators;
</script>
```

### 只画轮廓

area 关掉淡洗，只留轮廓线与顶点：实体多、面积叠在一起互相遮挡时更容易分辨

```vue
<script setup lang="ts">
import { XhRadarChartRoot } from "@xihan-ui/vue";

const phones = [
  { model: "旗舰机", camera: 92, battery: 70, screen: 88, performance: 95, price: 45 },
  { model: "中端机", camera: 74, battery: 86, screen: 72, performance: 70, price: 82 },
  { model: "入门机", camera: 55, battery: 90, screen: 60, performance: 52, price: 95 },
];

const indicators = [
  { key: "camera", label: "影像" },
  { key: "battery", label: "续航" },
  { key: "screen", label: "屏幕" },
  { key: "performance", label: "性能" },
  { key: "price", label: "性价比" },
] as const;
</script>

<template>
  <XhRadarChartRoot
    :data="phones"
    name-field="model"
    :indicators="indicators"
    :area="false"
  >
    <template #caption>三款手机的评测得分</template>
  </XhRadarChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-radar-chart id="radar-chart-outline" name-field="model" area="false">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">三款手机的评测得分</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-radar-chart>
</div>

<script type="module">
  const chart = document.getElementById("radar-chart-outline");
  const phones = [
    { model: "旗舰机", camera: 92, battery: 70, screen: 88, performance: 95, price: 45 },
    { model: "中端机", camera: 74, battery: 86, screen: 72, performance: 70, price: 82 },
    { model: "入门机", camera: 55, battery: 90, screen: 60, performance: 52, price: 95 },
  ];
  const indicators = [
    { key: "camera", label: "影像" },
    { key: "battery", label: "续航" },
    { key: "screen", label: "屏幕" },
    { key: "performance", label: "性能" },
    { key: "price", label: "性价比" },
  ];
  chart.data = phones;
  chart.indicators = indicators;
</script>
```

### 各圈的数值

ring-labels 在 12 点方向那根轴上写出每一圈的数值，rings 定圈数；只在各指标量程相同时写

```vue
<script setup lang="ts">
import { XhRadarChartRoot } from "@xihan-ui/vue";

// 六项能力都是 0–100 分：同一种单位，适合共用量程
const people = [
  { name: "张三", design: 85, frontend: 92, backend: 60, testing: 70, communication: 78, planning: 66 },
  { name: "李四", design: 58, frontend: 70, backend: 90, testing: 82, communication: 64, planning: 80 },
];

const indicators = [
  { key: "design", label: "设计" },
  { key: "frontend", label: "前端" },
  { key: "backend", label: "后端" },
  { key: "testing", label: "测试" },
  { key: "communication", label: "沟通" },
  { key: "planning", label: "规划" },
] as const;
</script>

<template>
  <XhRadarChartRoot
    :data="people"
    name-field="name"
    :indicators="indicators"
    scale="shared"
    :rings="5"
    ring-labels
  >
    <template #caption>两名工程师的能力评估</template>
  </XhRadarChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-radar-chart id="radar-chart-ring-labels" name-field="name" scale="shared" rings="5" ring-labels>
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">两名工程师的能力评估</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-radar-chart>
</div>

<script type="module">
  const chart = document.getElementById("radar-chart-ring-labels");
  // 六项能力都是 0–100 分：同一种单位，适合共用量程
  const people = [
    { name: "张三", design: 85, frontend: 92, backend: 60, testing: 70, communication: 78, planning: 66 },
    { name: "李四", design: 58, frontend: 70, backend: 90, testing: 82, communication: 64, planning: 80 },
  ];
  const indicators = [
    { key: "design", label: "设计" },
    { key: "frontend", label: "前端" },
    { key: "backend", label: "后端" },
    { key: "testing", label: "测试" },
    { key: "communication", label: "沟通" },
    { key: "planning", label: "规划" },
  ];
  chart.data = people;
  chart.indicators = indicators;
</script>
```

## 设计指引

### 何时使用

- 两三个实体在同一组指标上各有长短，读者要看的是整体的「形状」：候选人的能力画像、产品的评测维度、门店的经营指标。
- 指标有 3–10 个，且都是「越大越好」或都是「越小越好」，形状的大小才有一致的含义。

### 何时不用

- 要读出准确的数值或比较几个相近的数：改用[直角坐标图](./cartesian-chart)的分组条形图，长度比半径好比较。
- 实体多于 3 个：多边形互相遮挡、颜色两两配对也分不清，改成几张小图并排，或者用条形图。
- 指标之间有先后或因果关系：轴的次序没有含义，读者会把相邻的指标读成相关的。
- 只有一两个指标：围不成面，直接写数字或用条形图。

### 特性

- 数据是对象数组，每行一个实体（一个系列）：`nameField` 指定实体名所在的字段，`indicators` 列出指标，每一项写数据里的字段 `key`、显示的名字 `label` 与可选的量程 `min` / `max`。还没给指标时按空态处理；给了但少于 3 个或多于 10 个时报 `chart.indicator-count`，字段不存在时报 `chart.unknown-field`，根上写 `data-state="error"`。
- 量程由 `scale` 决定：`independent`（缺省）每个指标自己的量程，下限缺省 0（有负值时取最小值），上限按全部实体的最大值取整到刻度上；`shared` 全部指标共用一个量程，适合同一种单位的指标。量程按全部实体算，图例隐藏一个实体时其余实体的形状不变。超出量程的值贴在圆心或最外圈上。
- 网格的圈数由 `rings` 定（2–10，缺省 4），上限按圈数取整到刻度上，每一圈都落在整数刻度。`ringLabels` 在 12 点方向那根轴的右侧写出每一圈的数值（部件 `ring-label`）；只在各指标量程相同时写（`shared`，或各指标写了同样的上下限），量程各不相同时一根轴的刻度代表不了别的轴，写出来反而误读，这时读数交给提示框与数据表。
- 网格由 `shape` 决定：`polygon`（缺省）画成与指标同数的多边形，`circle` 画成同心圆；都是等分的四圈加每个指标一根轴，只给眼睛看。指标名写在轴端外侧：右半边从轴端往外写，左半边往回写，正上方与正下方居中；过长时截断。
- 每个实体一个分组：轮廓线、铺在里面的系列色淡洗（`area`，缺省开）与每个指标上的顶点。`curve="catmull-rom"` 让轮廓平滑地穿过每个顶点；缺失的值落在圆心、不画顶点，也不进焦点次序。
- 颜色按数据次序依次取分类色 1–8；图例隐藏一个实体后，其余实体的颜色不变。多于 3 个实体时开发期报 `chart.radar-overlap` 提醒（按两两配对检查只有前 3 个色槽都合格），多于 8 个时报错。
- 颜色不可用或不可靠时改用纹理区分实体：强制色与打印下总是开启，作者在任意祖先上写 `data-xh-chart-patterns` 也会开启。淡洗改用本系列的斜线纹理，轮廓换成各自的线型，图例与提示框的色标画成同一副纹理。
- 悬停时按角度落到最近的指标轴，那根轴加粗成准线，取这根轴上离指针最近的顶点；提示框列出全部可见实体在这个指标上的值（缺失的写 `translations.missingValue`），被指着的那一行加粗。其余实体淡出到 `--xh-chart-dim-alpha`，悬停图例项时同样只保留那个实体。
- `format` 指定数值格式（数字格式或函数），提示框、可及名与数据表共用。
- 多张图接到同一个受控的 `activeKey` 上时，雷达图按指标的 `key` 与其他图对齐。
- `pending` 表示正在重新取数：保留上一帧、整体降低不透明度并在根上写 `aria-busy`。首次取数、手里还没有数据时，空态写 `translations.loadingText` 并转一个圈，取完仍没有数据才写 `emptyText`。
- 首次出现时各实体的轮廓与顶点从圆心一起张开，网格与指标名淡入，数据晚于挂载到达（异步取数，或 Web Components 连上之后才赋 `data`）时同样播这段入场（空态里已画出的网格留在原处）；之后的数据变化与图例切换从当前形状插值到新形状，隐藏的实体收回并淡出后才移除。`animated={false}`（Web Components 写 `animated="false"`）关闭过渡；系统开了减弱动效或容器写了 `data-motion="reduce"` 时几何直接到位，只保留淡入淡出。
- 过渡的快慢由动效令牌决定：入场取 `--xh-motion-duration-reveal`，数据更新与图例切换取 `--xh-motion-duration-morph`，在图或它的容器上改写它们只影响这张图。
- 三个适配器的作者侧写法不同，最终 DOM 一致：Vue 与 React 不写默认内容时铺开缺省结构（标题、图例、视口与绘图区、空态、提示框），提示框内容可由作用域插槽 / 函数式 children 替换；Web Components 侧作者写外壳（root、caption、legend、viewport 与其中空的 `<svg>` plot，可选 empty 与 tooltip），网格、系列、图例项与提示框的缺省内容由元素生成进去。
- Web Components 侧的数据、指标与数值格式只走 JS property；实体字段、网格形状、量程、轮廓画法与 `active-key` 另有同名属性。宿主元素缺省是行内元素，放进 flex / grid 时要给它一个宽度。

### 最佳实践

- 为图写标题：`caption` 是图的可访问名称，也要说明比较的是什么。
- 实体保持在 3 个以内；要比的实体多时，每个实体一张小图，指标次序与量程保持一致。
- 把相关的指标排在相邻的位置，读者会把相邻的轴读成一组。
- 指标单位不同时用 `independent`，并在指标名里写出单位或量程；单位相同时用 `shared`，形状的大小才能跨指标比较。
- 需要读出准确数字时，在旁边放一张[表格](./table)，或把 `api.table` 交给表格组件（Vue 与 React 从根的作用域插槽 / 函数式 children 取 `table`，Web Components 读元素的 `table`）。

### 反模式

- 用面积大小比较实体：面积随指标的排列次序而变，换个次序结论就不同。
- 把几十个实体叠在一张图上：多边形糊成一团，读者只能靠图例逐个点开。
- 混用「越大越好」与「越小越好」的指标：同一个形状的外扩一半是好、一半是坏。
- 用提示框作为读取数值的唯一途径：提示框对读屏隐藏，数值要能从摘要或数据表读到。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-radar-chart>` |
| Vue 组件 | `XhRadarChartCaption` `XhRadarChartEmpty` `XhRadarChartLegend` `XhRadarChartPlot` `XhRadarChartRoot` `XhRadarChartTooltip` `XhRadarChartViewport` |
| 组合式函数 | `useRadarChart` |
| 状态机 | `radarChartMachine` |
| 皮肤 | `@xihan-ui/styles/radar-chart.css` |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `hidden-series-change` | `ChartHiddenSeriesChangeDetails` | 图例切换显隐；detail 为 `{ hiddenSeries: string[] }` |
| `active-key-change` | `ChartActiveKeyChangeDetails` | 指针或键盘换了激活的指标；detail 为 `{ activeKey }`，收起时为 null |
| `datum-active` | `ChartDatumDetails` | 悬停或聚焦到某个顶点；detail 为数据详情，收起时为 null |
| `datum-press` | `ChartDatumDetails` | 指针点击、Enter 或 Space 按在某个顶点上；detail 为数据详情 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhRadarChartRoot` | `default` | `RadarChartRootSlotProps` | 自行摆放部件；不写时铺开缺省结构：图例、视口（绘图区与空态）、提示框。 |
| `XhRadarChartRoot` | `caption` | — | 缺省结构里的标题内容。 |
| `XhRadarChartRoot` | `tooltip` | `RadarChartTooltipSlotProps` | 缺省结构里的提示框内容。 |
| `XhRadarChartRoot` | `empty` | — | 缺省结构里的空态内容。 |
| `XhRadarChartTooltip` | `default` | `RadarChartTooltipSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhRadarChartRoot` | `data` | `readonly ChartRow[]` |  | 数据：对象数组，每行一个实体（一个系列）。 |
| `XhRadarChartRoot` | `nameField` | `string` |  | 实体名所在的字段。 |
| `XhRadarChartRoot` | `indicators` | `readonly RadarIndicator[]` |  | 指标：3–10 个，自 12 点方向顺时针排开。 |
| `XhRadarChartRoot` | `shape` | `RadarShape` |  | 网格形状，缺省 polygon。 |
| `XhRadarChartRoot` | `area` | `boolean` |  | 轮廓里铺一层系列色的淡洗，缺省 true。 |
| `XhRadarChartRoot` | `scale` | `RadarScale` |  | 量程，缺省 independent。 |
| `XhRadarChartRoot` | `curve` | `RadarCurve` |  | 轮廓的画法，缺省 linear。 |
| `XhRadarChartRoot` | `rings` | `number` |  | 网格分几圈，2–10，缺省 4。 |
| `XhRadarChartRoot` | `ringLabels` | `boolean` |  | 在 12 点方向那根轴上写出每一圈的数值；只在各指标量程相同时写。 |
| `XhRadarChartRoot` | `format` | `NumberFormatSpec \| ((value: number) => string)` |  | 数值格式。 |
| `XhRadarChartRoot` | `hiddenSeries` | `string[]` |  | 隐藏的实体（受控）。 |
| `XhRadarChartRoot` | `defaultHiddenSeries` | `string[]` |  | 初始隐藏的实体（非受控）。 |
| `XhRadarChartRoot` | `activeKey` | `ChartKey \| null` |  | 激活的键（受控）：与别的图联动时是指标的 key。 |
| `XhRadarChartRoot` | `pending` | `boolean` |  | 数据重取中：保留上一帧、整体降低不透明度。 |
| `XhRadarChartRoot` | `animated` | `boolean` |  | 播放过渡动画，缺省 true；false 时直接画终态。 |
| `XhRadarChartRoot` | `locale` | `string` |  |  |
| `XhRadarChartRoot` | `translations` | `Partial<RadarChartTranslations>` |  |  |
| `XhRadarChartRoot` | `onHiddenSeriesChange` | `RadarChartProps['onHiddenSeriesChange']` |  |  |
| `XhRadarChartRoot` | `onActiveKeyChange` | `RadarChartProps['onActiveKeyChange']` |  |  |
| `XhRadarChartRoot` | `onDatumActive` | `RadarChartProps['onDatumActive']` |  |  |
| `XhRadarChartRoot` | `onDatumPress` | `RadarChartProps['onDatumPress']` |  |  |
| `XhRadarChartRoot` | `caption` | `ReactNode` |  | 缺省结构里的标题内容。 |
| `XhRadarChartRoot` | `renderTooltip` | `(props: RadarChartTooltipSlotProps) => ReactNode` |  | 缺省结构里的提示框内容。 |
| `XhRadarChartRoot` | `empty` | `ReactNode` |  | 缺省结构里的空态内容。 |
| `XhRadarChartRoot` | `children` | `SlotChildren<RadarChartRootSlotProps>` |  | 自行摆放部件；不写时铺开缺省结构：图例、视口（绘图区与空态）、提示框。 |
| `XhRadarChartTooltip` | `children` | `SlotChildren<RadarChartTooltipSlotProps>` |  | 替换缺省内容；函数式 children 拿到激活的顶点与缺省的内容模型。 |

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
| `model` | `RadarModel` | 管线产物：系列、量程、布局、场景与无障碍模型。 |
| `scene` | `Scene` | 要画的场景；尚未测量时为空场景。 |
| `overlay` | `RadarOverlay` | 前景层：激活的指标轴与焦点环。 |
| `measured` | `boolean` | 视口尚未测量（服务端与首帧）。 |
| `empty` | `boolean` | 没有可画的数据（没有数据、全部隐藏或没有值）。 |
| `legendItems` | `readonly RadarLegendItem[]` |  |
| `patterns` | `readonly ChartPattern[]` | 各系列的纹理：画在绘图区的 defs 里，强制色、打印与环境开启纹理时面积用它填充。 |
| `active` | `ChartDatumDetails \| null` | 激活的数据；没有时为 null。 |
| `tooltip` | `RadarTooltipModel \| null` | 提示框内容；收起时为 null。 |
| `summary` | `string` |  |
| `table` | `TableModel` | 数据表模型：实体名一列，每个指标一列。 |
| `emptyText` | `string` |  |
| `tableCaption` | `string` |  |
| `activeKey` | `ChartKey \| null` |  |
| `hiddenSeries` | `string[]` |  |
| `toggleSeries` | `(id: string) => void` | 切换某个系列的显隐。 |
| `setFocusedDatum` | `(ref: { seriesId: string, index: number } \| null) => void` | 移动键盘锚点：只改锚点，不移动 DOM 焦点，也不派发回调。 |
| `markTag` | `(mark: Mark) => RadarMarkTag` |  |
| `getRootProps` | `() => T['element']` |  |
| `getCaptionProps` | `() => T['element']` |  |
| `getLegendProps` | `() => T['element']` |  |
| `getLegendItemProps` | `(item: RadarLegendItem) => T['button']` |  |
| `getLegendSwatchProps` | `(item: RadarLegendItem) => T['element']` |  |
| `getLegendLabelProps` | `(item: RadarLegendItem) => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getPlotProps` | `() => T['element']` |  |
| `getDefsProps` | `() => T['element']` | 绘图区的第一个子节点：各系列的纹理定义在这里。 |
| `getPatternProps` | `(pattern: ChartPattern) => T['element']` |  |
| `getPatternLineProps` | `(pattern: ChartPattern) => T['element']` |  |
| `getMarkProps` | `(mark: Mark) => T['element']` |  |
| `getTooltipProps` | `() => T['element']` |  |
| `getTooltipHeaderProps` | `() => T['element']` |  |
| `getTooltipRowProps` | `(row: RadarTooltipRow) => T['element']` |  |
| `getTooltipSwatchProps` | `(row: RadarTooltipRow) => T['element']` |  |
| `getTooltipValueProps` | `(row: RadarTooltipRow) => T['element']` |  |
| `getTooltipNameProps` | `(row: RadarTooltipRow) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` |  |
| `getSummaryProps` | `() => T['element']` |  |
| `getTableProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | 总是 | 绘图区只占一个 Tab 位：焦点落到锚点顶点，首次为第一个实体在 12 点方向的指标上；图例同样只占一个 Tab 位 |
| `ArrowRight` | 焦点在绘图区 | 顺时针移到同一个实体的下一个指标（跳过缺失值）；已在最后一个则原地不动 |
| `ArrowLeft` | 焦点在绘图区 | 逆时针移到上一个指标 |
| `ArrowUp` | 焦点在绘图区 | 在同一个指标上换到图例次序的下一个实体，跳过隐藏的实体与缺失值 |
| `ArrowDown` | 焦点在绘图区 | 在同一个指标上换到上一个实体 |
| `Home` / `PageUp` | 焦点在绘图区 | 同一个实体的第一个指标 |
| `End` / `PageDown` | 焦点在绘图区 | 同一个实体的最后一个指标 |
| `Enter` / `Space` | 焦点在绘图区 | 报告聚焦的顶点（onDatumPress） |
| `Escape` | 提示框显示着 | 收起提示框，焦点留在原处；按键不拦截，外层浮层的关闭仍归它自己 |
| `ArrowLeft` / `ArrowRight` / `Home` / `End` | 焦点在图例 | 在图例项之间移动，左右键跟随文字方向的视觉次序 |
| `Enter` / `Space` | 焦点在图例项 | 切换该实体的显隐（原生按钮行为） |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `legend` | `aria-label` | translations.legendLabel |
| `legend` | `role` | 'toolbar' |
| `legend-item` | `aria-pressed` | 'false' \| 'true' |
| `legend-swatch` | `aria-hidden` | 'true' |
| `plot` | `aria-describedby` | `summary` 部件的 id |
| `plot` | `aria-labelledby` | `caption` 部件的 id |
| `plot` | `aria-roledescription` | translations.chartRoleDescription |
| `plot` | `role` | 'graphics-document' |
| `tooltip` | `aria-hidden` | 'true' |
| `mark` | `aria-hidden` | 'true' |
| `mark` | `aria-label` | undefined \| s?.name |
| `mark` | `aria-roledescription` | undefined \| translations.seriesRoleDescription |
| `mark` | `role` | undefined \| 'graphics-object' |

- 根是 `<figure>`，可访问名称来自 `caption`；不放标题时在根上写 `aria-label`。
- 绘图区是 `role="graphics-document"`，`aria-describedby` 指向组件生成的摘要；每个实体是一个 `role="graphics-object"` 的分组，名称是实体名；每个顶点是 `role="graphics-symbol"`，名称取 `translations.datumLabel`（缺省「指标, 实体 值」），务必按本地语言改写。
- 绘图区只占一个 Tab 位，焦点落在顶点上：左右键沿顺时针在同一个实体的指标之间走，上下键在同一个指标上换实体，Home / End 到第一个与最后一个指标。焦点环画在顶点之外，只在键盘聚焦时出现。
- 网格、指标轴、指标名、准线与焦点环一律 `aria-hidden`；提示框同样 `aria-hidden`：它显示的内容与顶点的名称是同一份。
- 组件在根内生成一段摘要与一张数据表，视觉隐藏、对读屏可见：摘要写实体数、指标数，以及每个实体最高与最低的指标（按在各自量程里的位置比，模板是 `translations.summary`）；数据表首列是实体名（列名取 `translations.nameLabel`），其余每个指标一列。
- 图例是 `role="toolbar"`，每一项是 `<button aria-pressed>`，按下表示实体可见；图例整体只占一个 Tab 位。
- 颜色不是区分实体的唯一线索：图例与提示框写出实体名，顶点的名称也带着实体名；强制色与打印下还有各自的纹理与线型。
- 过渡只改画面：顶点的名称、摘要与数据表在数据变化的那一刻就按新数据更新；收场中的实体 `aria-hidden`、不可聚焦。

## 样式参考

### 皮肤

`@xihan-ui/styles/radar-chart.css` 使用 `[data-scope="radar-chart"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-state` | 'error' \| undefined |
| `root` | `data-xh-chart-part` | 'root' |
| `caption` | `data-xh-chart-part` | 'caption' |
| `legend` | `data-xh-chart-part` | 'legend' |
| `legend-item` | `data-pressed` | ''（条件成立时才出现） |
| `legend-item` | `data-value` | item.id |
| `legend-item` | `data-xh-action-control` | '' |
| `legend-item` | `data-xh-action-profile` | 'text' |
| `legend-item` | `data-xh-action-size` | 'xs' |
| `legend-item` | `data-xh-action-variant` | 'ghost' |
| `legend-item` | `data-xh-chart-part` | 'legend-item' |
| `legend-item` | `data-xh-chart-pattern` | String(item.slot) |
| `legend-item` | `data-xh-chart-slot` | String(item.slot) |
| `legend-swatch` | `data-xh-chart-part` | 'legend-swatch' |
| `viewport` | `data-xh-chart-part` | 'viewport' |
| `plot` | `data-xh-chart-part` | 'plot' |
| `defs` | `data-xh-chart-part` | 'defs' |
| `pattern` | `data-xh-chart-part` | 'pattern' |
| `pattern` | `data-xh-chart-slot` | undefined \| String(pattern.slot) |
| `pattern-line` | `data-xh-chart-part` | 'pattern-line' |
| `tooltip` | `data-placement` | 'top' \| 'bottom'-'right' \| 'left' \| undefined |
| `tooltip` | `data-state` | 'visible' \| 'hidden' |
| `tooltip` | `data-xh-chart-part` | 'tooltip' |
| `tooltip-header` | `data-xh-chart-part` | 'tooltip-header' |
| `tooltip-row` | `data-current` | ''（条件成立时才出现） |
| `tooltip-row` | `data-series-id` | row.seriesId |
| `tooltip-row` | `data-xh-chart-part` | 'tooltip-row' |
| `tooltip-row` | `data-xh-chart-pattern` | String(row.slot) |
| `tooltip-row` | `data-xh-chart-slot` | String(row.slot) |
| `tooltip-swatch` | `data-xh-chart-part` | 'tooltip-swatch' |
| `tooltip-value` | `data-xh-chart-part` | 'tooltip-value' |
| `tooltip-name` | `data-xh-chart-part` | 'tooltip-name' |
| `empty` | `data-loading` | ''（条件成立时才出现） |
| `empty` | `data-state` | 'loading' \| undefined |
| `empty` | `data-xh-chart-part` | 'empty' |
| `empty` | `data-xh-loading-ring` | '' |
| `mark` | `data-dimmed` | ''（条件成立时才出现） |
| `mark` | `data-series-id` | mark.key.slice('series:'.length) |
| `mark` | `data-xh-chart-part` | mark.part \| undefined |
| `mark` | `data-xh-chart-slot` | String(s.slot) \| undefined \| String(mark.paint.slot) |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-radar-chart-empty-gap` | `empty` | `gap` | `state=loading` | `--xh-space-2` | radar-chart 的 empty 部件 gap 覆盖槽。 |
| `--xh-radar-chart-gap` | `root` | `gap` | `default` | `--xh-space-3` | radar-chart 的 root 部件 gap 覆盖槽。 |
| `--xh-radar-chart-height` | `viewport` | `block-size` | `default` | `--xh-chart-height` | radar-chart 的 viewport 部件 block-size 覆盖槽。 |
| `--xh-radar-chart-legend-gap` | `legend` | `gap` | `default` | `--xh-space-1` | radar-chart 的 legend 部件 gap 覆盖槽。 |
| `--xh-radar-chart-legend-swatch-radius` | `legend-swatch` | `border-radius` | `default` | `--xh-shape-inset` | radar-chart 的 legend-swatch 部件 border-radius 覆盖槽。 |
| `--xh-radar-chart-line-width` | `legend-swatch`<br>`line`<br>`root`<br>`tooltip-swatch` | `background`<br>`block-size`<br>`stroke-dasharray`<br>`stroke-width` | `@media (forced-colors: active)`<br>`@media print`<br>`default`<br>`mark=line`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns` | `--xh-chart-line-width` | radar-chart 的 legend-swatch、line、root、tooltip-swatch 部件 background、block-size、stroke-dasharray、stroke-width 覆盖槽。 |
| `--xh-radar-chart-point-size` | `legend-swatch`<br>`root`<br>`tooltip-swatch` | `background` | `@media (forced-colors: active)`<br>`@media print`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=1`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns` | `--xh-chart-point-size` | radar-chart 的 legend-swatch、root、tooltip-swatch 部件 background 覆盖槽。 |
| `--xh-radar-chart-ring-label-fg` | `ring-label` | `fill` | `default` | `--xh-chart-label` | radar-chart 的 ring-label 部件 fill 覆盖槽。 |
| `--xh-radar-chart-ring-label-opacity` | `ring-label` | `opacity` | `default` | `0.8` | radar-chart 的 ring-label 部件 opacity 覆盖槽。 |
| `--xh-radar-chart-series-color` | `area-fill`<br>`legend-swatch`<br>`line`<br>`pattern-line`<br>`point`<br>`tooltip-swatch` | `background`<br>`border`<br>`fill`<br>`stroke` | `@media (forced-colors: active)`<br>`@media print`<br>`mark=line`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=1`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns`<br>`xh-chart-slot=1`<br>`xh-chart-slot=2`<br>`xh-chart-slot=3`<br>`xh-chart-slot=4`<br>`xh-chart-slot=5`<br>`xh-chart-slot=6`<br>`xh-chart-slot=7`<br>`xh-chart-slot=8` | `--xh-chart-categorical-1`<br>`--xh-chart-categorical-2`<br>`--xh-chart-categorical-3`<br>`--xh-chart-categorical-4`<br>`--xh-chart-categorical-5`<br>`--xh-chart-categorical-6`<br>`--xh-chart-categorical-7`<br>`--xh-chart-categorical-8` | radar-chart 的 area-fill、legend-swatch、line、pattern-line、point、tooltip-swatch 部件 background、border、fill、stroke 覆盖槽。 |
| `--xh-radar-chart-tooltip-gap` | `tooltip` | `gap` | `default` | `--xh-space-1` | radar-chart 的 tooltip 部件 gap 覆盖槽。 |
| `--xh-radar-chart-tooltip-px` | `tooltip` | `padding-inline` | `default` | `--xh-surface-pad-sm` | radar-chart 的 tooltip 部件 padding-inline 覆盖槽。 |
| `--xh-radar-chart-tooltip-py` | `tooltip` | `padding-block` | `default` | `--xh-surface-pad-sm` | radar-chart 的 tooltip 部件 padding-block 覆盖槽。 |
| `--xh-radar-chart-tooltip-radius` | `tooltip` | `border-radius` | `default` | `--xh-shape-overlay` | radar-chart 的 tooltip 部件 border-radius 覆盖槽。 |
| `--xh-radar-chart-tooltip-row-gap` | `tooltip-row` | `gap` | `default` | `--xh-space-2` | radar-chart 的 tooltip-row 部件 gap 覆盖槽。 |
| `--xh-radar-chart-tooltip-shadow` | `tooltip` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | radar-chart 的 tooltip 部件 box-shadow 覆盖槽。 |
| `--xh-radar-chart-tooltip-swatch-radius` | `tooltip-swatch` | `border-radius` | `default` | `--xh-shape-inset` | radar-chart 的 tooltip-swatch 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：状态 · 出现（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-fade-in` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`opacity` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 绘图区不随文字方向镜像：指标自 12 点顺时针排列，右键始终是顺时针的下一个指标。
- 图例、标题与提示框的内容随文字方向排列，图例的左右键跟随视觉次序翻转。
