来源：https://ui.docs.xihanfun.com/components/heatmap

# Heatmap `热力图`

按网格铺开的强度图：一格是一个观测点，颜色深浅表示它的数值落在第几档。三种形态共用同一套分档、色阶、图例与详情条，只是把格子摊开的方式不同——连续周列的一年日历、按自然月分块的月历、行列由作者给的矩阵。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/heatmap" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/heatmap.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/heatmap" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/heatmap" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/heatmap.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一整年铺成周列 × 星期行的方格阵，颜色深浅表示当天数值落在第几档

```vue
<script setup lang="ts">
import type { HeatmapDatum } from "@xihan-ui/headless";
import { formatHeatmapDate } from "@xihan-ui/headless";
import { XhHeatmapRoot } from "@xihan-ui/vue";

const DAY_MS = 86_400_000;

// 一整年的提交量：工作日多、周末少，三月与十月各有一波冲刺，八月是长假的空档。
// 数值由天序号哈希出来，同一年恒出同一份数据，示例每次打开都长一样
function buildYear(year: number): HeatmapDatum[] {
  const days: HeatmapDatum[] = [];
  let index = 0;
  for (let time = Date.UTC(year, 0, 1); time <= Date.UTC(year, 11, 31); time += DAY_MS) {
    const at = new Date(time);
    const noise = ((Math.imul(++index, 2654435761) >>> 8) % 1000) / 1000;
    const month = at.getUTCMonth();
    // 冲刺月的量翻倍，八月压到最低；周末一律减半
    const peak = month === 2 || month === 9 ? 16 : month === 7 ? 3 : 8;
    const weekend = at.getUTCDay() === 0 || at.getUTCDay() === 6;
    const ceiling = weekend ? peak / 2 : peak;
    days.push({ date: formatHeatmapDate(time), count: noise < 0.16 ? 0 : Math.round(noise * ceiling) });
  }
  return days;
}

const activity = buildYear(2024);
</script>

<template>
  <!-- 不写默认插槽即按区间自动铺开：月份行、七行星期与图例一并渲染。
       一整年 53 列，一屏放不下时网格自己横着滚，行首的星期名钉在原地 -->
  <XhHeatmapRoot
    :value="activity"
    start-date="2024-01-01"
    end-date="2024-12-31"
  />
</template>
```

```html
<div id="heatmap-basic-mount"></div>

<!-- 元素不生成结构：外壳只写 root，一整年的月份行、七行星期与图例由脚本照 grid 铺 -->
<template id="heatmap-basic-template">
  <xh-heatmap start-date="2024-01-01" end-date="2024-12-31">
    <div data-xh-part="root"></div>
  </xh-heatmap>
</template>

<script type="module">
  const DAY_MS = 86400000;

  // 一整年的提交量：工作日多、周末少，三月与十月各有一波冲刺，八月是长假的空档。
  // 数值由天序号哈希出来，同一年恒出同一份数据，示例每次打开都长一样
  function buildYear(year) {
    const days = [];
    let index = 0;
    for (let time = Date.UTC(year, 0, 1); time <= Date.UTC(year, 11, 31); time += DAY_MS) {
      const at = new Date(time);
      const noise = ((Math.imul(++index, 2654435761) >>> 8) % 1000) / 1000;
      const month = at.getUTCMonth();
      // 冲刺月的量翻倍，八月压到最低；周末一律减半
      const peak = month === 2 || month === 9 ? 16 : month === 7 ? 3 : 8;
      const weekend = at.getUTCDay() === 0 || at.getUTCDay() === 6;
      const ceiling = weekend ? peak / 2 : peak;
      days.push({
        date: at.toISOString().slice(0, 10),
        count: noise < 0.16 ? 0 : Math.round(noise * ceiling),
      });
    }
    return days;
  }

  /** 一个角色节点：身份写在 value 上，元素照它回网格里查数值与档位。 */
  function part(tag, name, value, text) {
    const el = document.createElement(tag);
    el.dataset.xhPart = name;
    if (value !== undefined) el.setAttribute("value", value);
    if (text !== undefined) el.textContent = text;
    return el;
  }

  const fragment = document
    .getElementById("heatmap-basic-template")
    .content.cloneNode(true);
  const heatmap = fragment.querySelector("xh-heatmap");
  const root = fragment.querySelector('[data-xh-part="root"]');

  // 元素一连上就能读 grid，接线排在这之后，铺出来的格子赶得上
  document.getElementById("heatmap-basic-mount").append(fragment);
  // 数据是数组，只走 property：HTML 属性装不下它
  heatmap.value = buildYear(2024);

  // 只读的 grid 一次取出来用：每读一次都重算一遍整张网格
  const grid = heatmap.grid;

  // 月份行排在网格之外，行首那个占位与下面各行的星期名同宽，月份才对得上列
  const monthRow = part("div", "row");
  monthRow.append(part("span", "week-day"));
  for (const month of grid.months) {
    monthRow.append(part("span", "month-label", month.value, month.label));
  }

  const gridEl = part("div", "grid");
  for (const row of grid.rows) {
    const line = part("div", "row", row.weekDay);
    line.append(part("span", "week-day", row.weekDay, grid.weekDays[row.weekDay].label));
    for (const day of row.cells) {
      line.append(part("div", "cell", day.date));
    }
    gridEl.append(line);
  }

  const legend = part("div", "legend");
  // 两端各一个字：一排色块自己说不出哪头是多，文案跟着 legendText 走
  legend.append(part("span", "legend-label", "low", heatmap.legendText.low));
  for (let level = 0; level < grid.levels; level++) {
    legend.append(part("span", "legend-item", level));
  }
  legend.append(part("span", "legend-label", "high", heatmap.legendText.high));

  root.append(monthRow, gridEl, legend);
</script>
```

## 示例

### 语气换色

tone 决定用哪族颜色，色阶两端跟着换，格子的分档不变

```vue
<script setup lang="ts">
import { XhHeatmapRoot } from "@xihan-ui/vue";

const activity = [
  { date: "2024-01-02", count: 1 },
  { date: "2024-01-04", count: 3 },
  { date: "2024-01-08", count: 6 },
  { date: "2024-01-11", count: 2 },
  { date: "2024-01-15", count: 9 },
  { date: "2024-01-17", count: 4 },
  { date: "2024-01-22", count: 12 },
  { date: "2024-01-25", count: 7 },
  { date: "2024-01-27", count: 2 },
];
</script>

<template>
  <!-- 语气只换颜色族：档位怎么分由数据与 levels 决定，与它无关 -->
  <XhHeatmapRoot
    :value="activity"
    start-date="2024-01-01"
    end-date="2024-01-28" tone="success"
  />
</template>
```

```html
<!-- 语气只换颜色族：档位怎么分由数据与 levels 决定，与它无关 -->
<xh-heatmap id="heatmap-tone" start-date="2024-01-01" end-date="2024-01-28" tone="success">
  <div data-xh-part="root">
    <div data-xh-part="row">
      <span data-xh-part="week-day"></span>
      <span data-xh-part="month-label" value="2024-01">1月</span>
    </div>
    <div data-xh-part="grid">
      <div data-xh-part="row" value="0">
        <span data-xh-part="week-day" value="0">一</span>
        <div data-xh-part="cell" value="2024-01-01"></div>
        <div data-xh-part="cell" value="2024-01-08"></div>
        <div data-xh-part="cell" value="2024-01-15"></div>
        <div data-xh-part="cell" value="2024-01-22"></div>
      </div>
      <div data-xh-part="row" value="1">
        <span data-xh-part="week-day" value="1">二</span>
        <div data-xh-part="cell" value="2024-01-02"></div>
        <div data-xh-part="cell" value="2024-01-09"></div>
        <div data-xh-part="cell" value="2024-01-16"></div>
        <div data-xh-part="cell" value="2024-01-23"></div>
      </div>
      <div data-xh-part="row" value="2">
        <span data-xh-part="week-day" value="2">三</span>
        <div data-xh-part="cell" value="2024-01-03"></div>
        <div data-xh-part="cell" value="2024-01-10"></div>
        <div data-xh-part="cell" value="2024-01-17"></div>
        <div data-xh-part="cell" value="2024-01-24"></div>
      </div>
      <div data-xh-part="row" value="3">
        <span data-xh-part="week-day" value="3">四</span>
        <div data-xh-part="cell" value="2024-01-04"></div>
        <div data-xh-part="cell" value="2024-01-11"></div>
        <div data-xh-part="cell" value="2024-01-18"></div>
        <div data-xh-part="cell" value="2024-01-25"></div>
      </div>
      <div data-xh-part="row" value="4">
        <span data-xh-part="week-day" value="4">五</span>
        <div data-xh-part="cell" value="2024-01-05"></div>
        <div data-xh-part="cell" value="2024-01-12"></div>
        <div data-xh-part="cell" value="2024-01-19"></div>
        <div data-xh-part="cell" value="2024-01-26"></div>
      </div>
      <div data-xh-part="row" value="5">
        <span data-xh-part="week-day" value="5">六</span>
        <div data-xh-part="cell" value="2024-01-06"></div>
        <div data-xh-part="cell" value="2024-01-13"></div>
        <div data-xh-part="cell" value="2024-01-20"></div>
        <div data-xh-part="cell" value="2024-01-27"></div>
      </div>
      <div data-xh-part="row" value="6">
        <span data-xh-part="week-day" value="6">日</span>
        <div data-xh-part="cell" value="2024-01-07"></div>
        <div data-xh-part="cell" value="2024-01-14"></div>
        <div data-xh-part="cell" value="2024-01-21"></div>
        <div data-xh-part="cell" value="2024-01-28"></div>
      </div>
    </div>
    <div data-xh-part="legend">
      <span data-xh-part="legend-label" value="low">少</span>
      <span data-xh-part="legend-item" value="0"></span>
      <span data-xh-part="legend-item" value="1"></span>
      <span data-xh-part="legend-item" value="2"></span>
      <span data-xh-part="legend-item" value="3"></span>
      <span data-xh-part="legend-item" value="4"></span>
      <span data-xh-part="legend-label" value="high">多</span>
    </div>
  </div>
</xh-heatmap>

<script type="module">
  // 数据是数组，只走 property：HTML 属性装不下它
  document.getElementById("heatmap-tone").value = [
    { date: "2024-01-02", count: 1 },
    { date: "2024-01-04", count: 3 },
    { date: "2024-01-08", count: 6 },
    { date: "2024-01-11", count: 2 },
    { date: "2024-01-15", count: 9 },
    { date: "2024-01-17", count: 4 },
    { date: "2024-01-22", count: 12 },
    { date: "2024-01-25", count: 7 },
    { date: "2024-01-27", count: 2 },
  ];
</script>
```

### 色板换色

palette 直接按颜色点名，六个色板只换色阶满档那一端，分档与空格底都不动

```vue
<script setup lang="ts">
import type { HeatmapPalette } from "@xihan-ui/headless";
import { XhHeatmapRoot } from "@xihan-ui/vue";

// 同一份数据铺六遍，肉眼比的就只有颜色这一件事
const activity = [
  { date: "2024-01-02", count: 1 },
  { date: "2024-01-04", count: 3 },
  { date: "2024-01-08", count: 6 },
  { date: "2024-01-11", count: 2 },
  { date: "2024-01-15", count: 9 },
  { date: "2024-01-17", count: 4 },
  { date: "2024-01-22", count: 12 },
  { date: "2024-01-25", count: 7 },
  { date: "2024-01-27", count: 2 },
];

const palettes: HeatmapPalette[] = ["green", "blue", "orange", "purple", "red", "gray"];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 20px">
    <div v-for="palette in palettes" :key="palette" style="display: grid; gap: 4px">
      <span style="color: var(--xh-fg-subtle); font-size: 12px">{{ palette }}</span>
      <!-- 只写 palette：色板管的只有满档实心底那一端，档位怎么分与它无关 -->
      <XhHeatmapRoot
        :value="activity"
        start-date="2024-01-01"
        end-date="2024-01-28" :palette="palette"
      />
    </div>
  </div>
</template>
```

```html
<div id="heatmap-palette-mount" style="display: flex; flex-wrap: wrap; gap: 20px"></div>

<!-- 元素不生成结构：外壳只写 root，月份行、七行星期与图例由脚本照 grid 铺 -->
<template id="heatmap-palette-template">
  <div style="display: grid; gap: 4px">
    <span style="color: var(--xh-fg-subtle); font-size: 12px"></span>
    <!-- 只写 palette：色板管的只有满档实心底那一端，档位怎么分与它无关 -->
    <xh-heatmap start-date="2024-01-01" end-date="2024-01-28">
      <div data-xh-part="root"></div>
    </xh-heatmap>
  </div>
</template>

<script type="module">
  // 同一份数据铺六遍，肉眼比的就只有颜色这一件事
  const activity = [
    { date: "2024-01-02", count: 1 },
    { date: "2024-01-04", count: 3 },
    { date: "2024-01-08", count: 6 },
    { date: "2024-01-11", count: 2 },
    { date: "2024-01-15", count: 9 },
    { date: "2024-01-17", count: 4 },
    { date: "2024-01-22", count: 12 },
    { date: "2024-01-25", count: 7 },
    { date: "2024-01-27", count: 2 },
  ];

  const palettes = ["green", "blue", "orange", "purple", "red", "gray"];

  /** 一个角色节点：身份写在 value 上，元素照它回网格里查数值与档位。 */
  function part(tag, name, value, text) {
    const el = document.createElement(tag);
    el.dataset.xhPart = name;
    if (value !== undefined) el.setAttribute("value", value);
    if (text !== undefined) el.textContent = text;
    return el;
  }

  const mount = document.getElementById("heatmap-palette-mount");
  const template = document.getElementById("heatmap-palette-template");

  for (const palette of palettes) {
    const fragment = template.content.cloneNode(true);
    fragment.querySelector("span").textContent = palette;
    const heatmap = fragment.querySelector("xh-heatmap");
    heatmap.setAttribute("palette", palette);
    const root = fragment.querySelector('[data-xh-part="root"]');

    // 元素一连上就能读 grid，接线排在这之后，铺出来的格子赶得上
    mount.append(fragment);
    // 数据是数组，只走 property：HTML 属性装不下它
    heatmap.value = activity;

    // 只读的 grid 一次取出来用：每读一次都重算一遍整张网格
    const grid = heatmap.grid;

    // 月份行排在网格之外，行首那个占位与下面各行的星期名同宽，月份才对得上列
    const monthRow = part("div", "row");
    monthRow.append(part("span", "week-day"));
    for (const month of grid.months) {
      monthRow.append(part("span", "month-label", month.value, month.label));
    }

    const gridEl = part("div", "grid");
    for (const row of grid.rows) {
      const line = part("div", "row", row.weekDay);
      line.append(part("span", "week-day", row.weekDay, grid.weekDays[row.weekDay].label));
      for (const day of row.cells) {
        line.append(part("div", "cell", day.date));
      }
      gridEl.append(line);
    }

    const legend = part("div", "legend");
    // 两端各一个字：一排色块自己说不出哪头是多，文案跟着 legendText 走
    legend.append(part("span", "legend-label", "low", heatmap.legendText.low));
    for (let level = 0; level < grid.levels; level++) {
      legend.append(part("span", "legend-item", level));
    }
    legend.append(part("span", "legend-label", "high", heatmap.legendText.high));

    root.append(monthRow, gridEl, legend);
  }
</script>
```

### 尺寸

size 换格子边长与行首星期名的留白，一屏能放下的周数跟着变

```vue
<script setup lang="ts">
import type { HeatmapDatum } from "@xihan-ui/headless";
import { formatHeatmapDate } from "@xihan-ui/headless";
import { XhHeatmapRoot } from "@xihan-ui/vue";

const DAY_MS = 86_400_000;

// 与基础用法同一份年度数据：只换尺寸档，看同一年占多宽
function buildYear(year: number): HeatmapDatum[] {
  const days: HeatmapDatum[] = [];
  let index = 0;
  for (let time = Date.UTC(year, 0, 1); time <= Date.UTC(year, 11, 31); time += DAY_MS) {
    const at = new Date(time);
    const noise = ((Math.imul(++index, 2654435761) >>> 8) % 1000) / 1000;
    const month = at.getUTCMonth();
    const peak = month === 2 || month === 9 ? 16 : month === 7 ? 3 : 8;
    const weekend = at.getUTCDay() === 0 || at.getUTCDay() === 6;
    const ceiling = weekend ? peak / 2 : peak;
    days.push({ date: formatHeatmapDate(time), count: noise < 0.16 ? 0 : Math.round(noise * ceiling) });
  }
  return days;
}

const activity = buildYear(2024);
</script>

<template>
  <div style="display: grid; gap: 16px">
    <!-- sm 档格子最小：同样一整年 53 列，md 档要 774px，这一档 660px，一屏放得下 -->
    <XhHeatmapRoot
      :value="activity"
      start-date="2024-01-01"
      end-date="2024-12-31"
      size="sm"
    />
    <!-- lg 档格子 12px：一整年要 880px 上下，多数容器里都会横向滚 -->
    <XhHeatmapRoot
      :value="activity"
      start-date="2024-01-01"
      end-date="2024-12-31"
      size="lg"
    />
  </div>
</template>
```

```html
<div id="heatmap-size-mount" style="display: grid; gap: 16px"></div>

<!-- 元素不生成结构：外壳只写 root，一整年的月份行、七行星期与图例由脚本照 grid 铺 -->
<template id="heatmap-size-template">
  <xh-heatmap start-date="2024-01-01" end-date="2024-12-31">
    <div data-xh-part="root"></div>
  </xh-heatmap>
</template>

<script type="module">
  const DAY_MS = 86400000;

  // 与基础用法同一份年度数据：只换尺寸档，看同一年占多宽
  function buildYear(year) {
    const days = [];
    let index = 0;
    for (let time = Date.UTC(year, 0, 1); time <= Date.UTC(year, 11, 31); time += DAY_MS) {
      const at = new Date(time);
      const noise = ((Math.imul(++index, 2654435761) >>> 8) % 1000) / 1000;
      const month = at.getUTCMonth();
      const peak = month === 2 || month === 9 ? 16 : month === 7 ? 3 : 8;
      const weekend = at.getUTCDay() === 0 || at.getUTCDay() === 6;
      const ceiling = weekend ? peak / 2 : peak;
      days.push({
        date: at.toISOString().slice(0, 10),
        count: noise < 0.16 ? 0 : Math.round(noise * ceiling),
      });
    }
    return days;
  }

  /** 一个角色节点：身份写在 value 上，元素照它回网格里查数值与档位。 */
  function part(tag, name, value, text) {
    const el = document.createElement(tag);
    el.dataset.xhPart = name;
    if (value !== undefined) el.setAttribute("value", value);
    if (text !== undefined) el.textContent = text;
    return el;
  }

  const activity = buildYear(2024);
  const mount = document.getElementById("heatmap-size-mount");

  /** 铺一档：sm 档格子最小，同样一整年 53 列只要 660px，md 档要 774px，lg 档要 880px。 */
  function render(size) {
    const fragment = document
      .getElementById("heatmap-size-template")
      .content.cloneNode(true);
    const heatmap = fragment.querySelector("xh-heatmap");
    const root = fragment.querySelector('[data-xh-part="root"]');
    heatmap.setAttribute("size", size);

    mount.append(fragment);
    // 数据是数组，只走 property：HTML 属性装不下它
    heatmap.value = activity;

    // 只读的 grid 一次取出来用：每读一次都重算一遍整张网格
    const grid = heatmap.grid;

    const monthRow = part("div", "row");
    monthRow.append(part("span", "week-day"));
    for (const month of grid.months) {
      monthRow.append(part("span", "month-label", month.value, month.label));
    }

    const gridEl = part("div", "grid");
    for (const row of grid.rows) {
      const line = part("div", "row", row.weekDay);
      line.append(part("span", "week-day", row.weekDay, grid.weekDays[row.weekDay].label));
      for (const day of row.cells) {
        line.append(part("div", "cell", day.date));
      }
      gridEl.append(line);
    }

    const legend = part("div", "legend");
    // 两端各一个字：一排色块自己说不出哪头是多，文案跟着 legendText 走
    legend.append(part("span", "legend-label", "low", heatmap.legendText.low));
    for (let level = 0; level < grid.levels; level++) {
      legend.append(part("span", "legend-item", level));
    }
    legend.append(part("span", "legend-label", "high", heatmap.legendText.high));

    root.append(monthRow, gridEl, legend);
  }

  render("sm");
  render("lg");
</script>
```

### 档数

levels 决定分几档，图例与格子共用同一条色阶

```vue
<script setup lang="ts">
import { XhHeatmapRoot } from "@xihan-ui/vue";

const activity = [
  { date: "2024-01-02", count: 1 },
  { date: "2024-01-04", count: 3 },
  { date: "2024-01-08", count: 6 },
  { date: "2024-01-11", count: 2 },
  { date: "2024-01-15", count: 9 },
  { date: "2024-01-17", count: 4 },
  { date: "2024-01-22", count: 12 },
  { date: "2024-01-25", count: 7 },
  { date: "2024-01-27", count: 2 },
];
</script>

<template>
  <!-- 三档：没有数据、少、多。要自己定分档边界就改传 thresholds -->
  <XhHeatmapRoot
    :value="activity"
    start-date="2024-01-01"
    end-date="2024-01-28"
    :levels="3"
  />
</template>
```

```html
<!-- 三档：没有数据、少、多。要自己定分档边界就改传 thresholds -->
<xh-heatmap id="heatmap-levels" start-date="2024-01-01" end-date="2024-01-28" levels="3">
  <div data-xh-part="root">
    <div data-xh-part="row">
      <span data-xh-part="week-day"></span>
      <span data-xh-part="month-label" value="2024-01">1月</span>
    </div>
    <div data-xh-part="grid">
      <div data-xh-part="row" value="0">
        <span data-xh-part="week-day" value="0">一</span>
        <div data-xh-part="cell" value="2024-01-01"></div>
        <div data-xh-part="cell" value="2024-01-08"></div>
        <div data-xh-part="cell" value="2024-01-15"></div>
        <div data-xh-part="cell" value="2024-01-22"></div>
      </div>
      <div data-xh-part="row" value="1">
        <span data-xh-part="week-day" value="1">二</span>
        <div data-xh-part="cell" value="2024-01-02"></div>
        <div data-xh-part="cell" value="2024-01-09"></div>
        <div data-xh-part="cell" value="2024-01-16"></div>
        <div data-xh-part="cell" value="2024-01-23"></div>
      </div>
      <div data-xh-part="row" value="2">
        <span data-xh-part="week-day" value="2">三</span>
        <div data-xh-part="cell" value="2024-01-03"></div>
        <div data-xh-part="cell" value="2024-01-10"></div>
        <div data-xh-part="cell" value="2024-01-17"></div>
        <div data-xh-part="cell" value="2024-01-24"></div>
      </div>
      <div data-xh-part="row" value="3">
        <span data-xh-part="week-day" value="3">四</span>
        <div data-xh-part="cell" value="2024-01-04"></div>
        <div data-xh-part="cell" value="2024-01-11"></div>
        <div data-xh-part="cell" value="2024-01-18"></div>
        <div data-xh-part="cell" value="2024-01-25"></div>
      </div>
      <div data-xh-part="row" value="4">
        <span data-xh-part="week-day" value="4">五</span>
        <div data-xh-part="cell" value="2024-01-05"></div>
        <div data-xh-part="cell" value="2024-01-12"></div>
        <div data-xh-part="cell" value="2024-01-19"></div>
        <div data-xh-part="cell" value="2024-01-26"></div>
      </div>
      <div data-xh-part="row" value="5">
        <span data-xh-part="week-day" value="5">六</span>
        <div data-xh-part="cell" value="2024-01-06"></div>
        <div data-xh-part="cell" value="2024-01-13"></div>
        <div data-xh-part="cell" value="2024-01-20"></div>
        <div data-xh-part="cell" value="2024-01-27"></div>
      </div>
      <div data-xh-part="row" value="6">
        <span data-xh-part="week-day" value="6">日</span>
        <div data-xh-part="cell" value="2024-01-07"></div>
        <div data-xh-part="cell" value="2024-01-14"></div>
        <div data-xh-part="cell" value="2024-01-21"></div>
        <div data-xh-part="cell" value="2024-01-28"></div>
      </div>
    </div>
    <div data-xh-part="legend">
      <span data-xh-part="legend-label" value="low">少</span>
      <span data-xh-part="legend-item" value="0"></span>
      <span data-xh-part="legend-item" value="1"></span>
      <span data-xh-part="legend-item" value="2"></span>
      <span data-xh-part="legend-label" value="high">多</span>
    </div>
  </div>
</xh-heatmap>

<script type="module">
  // 数据是数组，只走 property：HTML 属性装不下它
  document.getElementById("heatmap-levels").value = [
    { date: "2024-01-02", count: 1 },
    { date: "2024-01-04", count: 3 },
    { date: "2024-01-08", count: 6 },
    { date: "2024-01-11", count: 2 },
    { date: "2024-01-15", count: 9 },
    { date: "2024-01-17", count: 4 },
    { date: "2024-01-22", count: 12 },
    { date: "2024-01-25", count: 7 },
    { date: "2024-01-27", count: 2 },
  ];
</script>
```

### 焦点明细

焦点落到某一天时报出日期与计数，键盘用户与鼠标用户看到同一份明细

```vue
<script setup lang="ts">
import { XhHeatmapRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const activity = [
  { date: "2024-01-02", count: 1 },
  { date: "2024-01-04", count: 3 },
  { date: "2024-01-08", count: 6 },
  { date: "2024-01-11", count: 2 },
  { date: "2024-01-15", count: 9 },
  { date: "2024-01-17", count: 4 },
  { date: "2024-01-22", count: 12 },
  { date: "2024-01-25", count: 7 },
  { date: "2024-01-27", count: 2 },
];

const readout = ref("（把焦点移到某一格）");
</script>

<template>
  <div style="display: grid; gap: 12px">
    <!-- 每格自己就念得出日期与计数；这里再把它显示出来，眼睛也看得见 -->
    <XhHeatmapRoot
      :value="activity"
      start-date="2024-01-01"
      end-date="2024-01-28"
      @cell-focus="readout = `${$event.date}：${$event.count} 次（第 ${$event.level} 档）`"
    />
    <span>{{ readout }}</span>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px">
  <!-- 每格自己就念得出日期与计数；这里再把它显示出来，眼睛也看得见 -->
  <xh-heatmap id="heatmap-focus" start-date="2024-01-01" end-date="2024-01-28">
    <div data-xh-part="root">
      <div data-xh-part="row">
        <span data-xh-part="week-day"></span>
        <span data-xh-part="month-label" value="2024-01">1月</span>
      </div>
      <div data-xh-part="grid">
        <div data-xh-part="row" value="0">
          <span data-xh-part="week-day" value="0">一</span>
          <div data-xh-part="cell" value="2024-01-01"></div>
          <div data-xh-part="cell" value="2024-01-08"></div>
          <div data-xh-part="cell" value="2024-01-15"></div>
          <div data-xh-part="cell" value="2024-01-22"></div>
        </div>
        <div data-xh-part="row" value="1">
          <span data-xh-part="week-day" value="1">二</span>
          <div data-xh-part="cell" value="2024-01-02"></div>
          <div data-xh-part="cell" value="2024-01-09"></div>
          <div data-xh-part="cell" value="2024-01-16"></div>
          <div data-xh-part="cell" value="2024-01-23"></div>
        </div>
        <div data-xh-part="row" value="2">
          <span data-xh-part="week-day" value="2">三</span>
          <div data-xh-part="cell" value="2024-01-03"></div>
          <div data-xh-part="cell" value="2024-01-10"></div>
          <div data-xh-part="cell" value="2024-01-17"></div>
          <div data-xh-part="cell" value="2024-01-24"></div>
        </div>
        <div data-xh-part="row" value="3">
          <span data-xh-part="week-day" value="3">四</span>
          <div data-xh-part="cell" value="2024-01-04"></div>
          <div data-xh-part="cell" value="2024-01-11"></div>
          <div data-xh-part="cell" value="2024-01-18"></div>
          <div data-xh-part="cell" value="2024-01-25"></div>
        </div>
        <div data-xh-part="row" value="4">
          <span data-xh-part="week-day" value="4">五</span>
          <div data-xh-part="cell" value="2024-01-05"></div>
          <div data-xh-part="cell" value="2024-01-12"></div>
          <div data-xh-part="cell" value="2024-01-19"></div>
          <div data-xh-part="cell" value="2024-01-26"></div>
        </div>
        <div data-xh-part="row" value="5">
          <span data-xh-part="week-day" value="5">六</span>
          <div data-xh-part="cell" value="2024-01-06"></div>
          <div data-xh-part="cell" value="2024-01-13"></div>
          <div data-xh-part="cell" value="2024-01-20"></div>
          <div data-xh-part="cell" value="2024-01-27"></div>
        </div>
        <div data-xh-part="row" value="6">
          <span data-xh-part="week-day" value="6">日</span>
          <div data-xh-part="cell" value="2024-01-07"></div>
          <div data-xh-part="cell" value="2024-01-14"></div>
          <div data-xh-part="cell" value="2024-01-21"></div>
          <div data-xh-part="cell" value="2024-01-28"></div>
        </div>
      </div>
      <div data-xh-part="legend">
        <span data-xh-part="legend-label" value="low">少</span>
        <span data-xh-part="legend-item" value="0"></span>
        <span data-xh-part="legend-item" value="1"></span>
        <span data-xh-part="legend-item" value="2"></span>
        <span data-xh-part="legend-item" value="3"></span>
        <span data-xh-part="legend-item" value="4"></span>
        <span data-xh-part="legend-label" value="high">多</span>
      </div>
    </div>
  </xh-heatmap>
  <span id="heatmap-focus-readout">（把焦点移到某一格）</span>
</div>

<script type="module">
  // 数据是数组，只走 property；明细经 cell-focus 事件回来
  const host = document.getElementById("heatmap-focus");
  const readout = document.getElementById("heatmap-focus-readout");
  host.value = [
    { date: "2024-01-02", count: 1 },
    { date: "2024-01-04", count: 3 },
    { date: "2024-01-08", count: 6 },
    { date: "2024-01-11", count: 2 },
    { date: "2024-01-15", count: 9 },
    { date: "2024-01-17", count: 4 },
    { date: "2024-01-22", count: 12 },
    { date: "2024-01-25", count: 7 },
    { date: "2024-01-27", count: 2 },
  ];
  host.addEventListener("cell-focus", (event) => {
    const { date, count, level } = event.detail;
    readout.textContent = `${date}：${count} 次（第 ${level} 档）`;
  });
</script>
```

### 月历形态

按自然月分块，每块是一张真月历，1 号落在它真实的星期几上

```vue
<script setup lang="ts">
import { XhHeatmapRoot } from "@xihan-ui/vue";

const activity = [
  { date: "2024-01-16", count: 1 },
  { date: "2024-01-18", count: 3 },
  { date: "2024-01-22", count: 6 },
  { date: "2024-01-25", count: 2 },
  { date: "2024-01-29", count: 9 },
  { date: "2024-01-31", count: 4 },
  { date: "2024-02-05", count: 12 },
  { date: "2024-02-08", count: 7 },
  { date: "2024-02-10", count: 2 },
];
</script>

<template>
  <!-- 连续周列看不出月界，按自然月分块才比得了逐月的分布 -->
  <XhHeatmapRoot
    variant="month"
    :value="activity"
    start-date="2024-01-15"
    end-date="2024-02-11"
  />
</template>
```

```html
<!-- 连续周列看不出月界，按自然月分块才比得了逐月的分布 -->
<xh-heatmap id="heatmap-month" variant="month" start-date="2024-01-15" end-date="2024-02-11">
  <div data-xh-part="root">
    <div data-xh-part="grid">
      <div data-xh-part="month-block" value="2024-01">
        <span data-xh-part="month-label" value="2024-01">1月</span>
        <div data-xh-part="row">
          <span data-xh-part="week-day" value="0">一</span>
          <span data-xh-part="week-day" value="1">二</span>
          <span data-xh-part="week-day" value="2">三</span>
          <span data-xh-part="week-day" value="3">四</span>
          <span data-xh-part="week-day" value="4">五</span>
          <span data-xh-part="week-day" value="5">六</span>
          <span data-xh-part="week-day" value="6">日</span>
        </div>
        <div data-xh-part="row" value="0">
          <div data-xh-part="cell" value="2024-01-15"></div>
          <div data-xh-part="cell" value="2024-01-16"></div>
          <div data-xh-part="cell" value="2024-01-17"></div>
          <div data-xh-part="cell" value="2024-01-18"></div>
          <div data-xh-part="cell" value="2024-01-19"></div>
          <div data-xh-part="cell" value="2024-01-20"></div>
          <div data-xh-part="cell" value="2024-01-21"></div>
        </div>
        <div data-xh-part="row" value="1">
          <div data-xh-part="cell" value="2024-01-22"></div>
          <div data-xh-part="cell" value="2024-01-23"></div>
          <div data-xh-part="cell" value="2024-01-24"></div>
          <div data-xh-part="cell" value="2024-01-25"></div>
          <div data-xh-part="cell" value="2024-01-26"></div>
          <div data-xh-part="cell" value="2024-01-27"></div>
          <div data-xh-part="cell" value="2024-01-28"></div>
        </div>
        <div data-xh-part="row" value="2">
          <div data-xh-part="cell" value="2024-01-29"></div>
          <div data-xh-part="cell" value="2024-01-30"></div>
          <div data-xh-part="cell" value="2024-01-31"></div>
        </div>
      </div>
      <div data-xh-part="month-block" value="2024-02">
        <span data-xh-part="month-label" value="2024-02">2月</span>
        <div data-xh-part="row">
          <span data-xh-part="week-day" value="0">一</span>
          <span data-xh-part="week-day" value="1">二</span>
          <span data-xh-part="week-day" value="2">三</span>
          <span data-xh-part="week-day" value="3">四</span>
          <span data-xh-part="week-day" value="4">五</span>
          <span data-xh-part="week-day" value="5">六</span>
          <span data-xh-part="week-day" value="6">日</span>
        </div>
        <div data-xh-part="row" value="0">
          <div data-xh-part="cell" value="2024-02-01"></div>
          <div data-xh-part="cell" value="2024-02-02"></div>
          <div data-xh-part="cell" value="2024-02-03"></div>
          <div data-xh-part="cell" value="2024-02-04"></div>
        </div>
        <div data-xh-part="row" value="1">
          <div data-xh-part="cell" value="2024-02-05"></div>
          <div data-xh-part="cell" value="2024-02-06"></div>
          <div data-xh-part="cell" value="2024-02-07"></div>
          <div data-xh-part="cell" value="2024-02-08"></div>
          <div data-xh-part="cell" value="2024-02-09"></div>
          <div data-xh-part="cell" value="2024-02-10"></div>
          <div data-xh-part="cell" value="2024-02-11"></div>
        </div>
      </div>
    </div>
    <div data-xh-part="legend">
      <span data-xh-part="legend-label" value="low">少</span>
      <span data-xh-part="legend-item" value="0"></span>
      <span data-xh-part="legend-item" value="1"></span>
      <span data-xh-part="legend-item" value="2"></span>
      <span data-xh-part="legend-item" value="3"></span>
      <span data-xh-part="legend-item" value="4"></span>
      <span data-xh-part="legend-label" value="high">多</span>
    </div>
  </div>
</xh-heatmap>

<script type="module">
  // 数据是数组，只走 property：HTML 属性装不下它
  document.getElementById("heatmap-month").value = [
    { date: "2024-01-16", count: 1 },
    { date: "2024-01-18", count: 3 },
    { date: "2024-01-22", count: 6 },
    { date: "2024-01-25", count: 2 },
    { date: "2024-01-29", count: 9 },
    { date: "2024-01-31", count: 4 },
    { date: "2024-02-05", count: 12 },
    { date: "2024-02-08", count: 7 },
    { date: "2024-02-10", count: 2 },
  ];
</script>
```

### 矩阵形态

行列都由作者给，数据按行列定位而不按日期：星期 × 时段的活跃度

```vue
<script setup lang="ts">
import { XhHeatmapRoot } from "@xihan-ui/vue";

const rows = ["周一", "周二", "周三", "周四", "周五"];
const columns = ["09:00", "12:00", "15:00", "18:00", "21:00"];
const traffic = [
  { row: "周一", column: "09:00", value: 12 },
  { row: "周一", column: "12:00", value: 30 },
  { row: "周一", column: "18:00", value: 22 },
  { row: "周二", column: "12:00", value: 26 },
  { row: "周二", column: "21:00", value: 9 },
  { row: "周三", column: "09:00", value: 6 },
  { row: "周三", column: "15:00", value: 18 },
  { row: "周四", column: "12:00", value: 34 },
  { row: "周四", column: "18:00", value: 28 },
  { row: "周五", column: "15:00", value: 14 },
  { row: "周五", column: "18:00", value: 40 },
  { row: "周五", column: "21:00", value: 25 },
];
</script>

<template>
  <!-- 行名与列名都是真表头，读屏报某一格时会连着念出它属于哪一行哪一列 -->
  <XhHeatmapRoot
    variant="matrix"
    :rows="rows"
    :columns="columns"
    :value="traffic"
    style="--xh-heatmap-column-w: 44px; --xh-heatmap-row-h: 28px"
  />
</template>
```

```html
<!-- 行名与列名都是真表头，读屏报某一格时会连着念出它属于哪一行哪一列 -->
<xh-heatmap id="heatmap-matrix" variant="matrix">
  <div data-xh-part="root" style="--xh-heatmap-column-w: 44px; --xh-heatmap-row-h: 28px">
    <div data-xh-part="grid">
      <div data-xh-part="row">
        <span data-xh-part="row-label"></span>
        <span data-xh-part="column-label" value="09:00">09:00</span>
        <span data-xh-part="column-label" value="12:00">12:00</span>
        <span data-xh-part="column-label" value="15:00">15:00</span>
        <span data-xh-part="column-label" value="18:00">18:00</span>
        <span data-xh-part="column-label" value="21:00">21:00</span>
      </div>
      <div data-xh-part="row" value="周一">
        <span data-xh-part="row-label" value="周一">周一</span>
        <div data-xh-part="cell" value="09:00"></div>
        <div data-xh-part="cell" value="12:00"></div>
        <div data-xh-part="cell" value="15:00"></div>
        <div data-xh-part="cell" value="18:00"></div>
        <div data-xh-part="cell" value="21:00"></div>
      </div>
      <div data-xh-part="row" value="周二">
        <span data-xh-part="row-label" value="周二">周二</span>
        <div data-xh-part="cell" value="09:00"></div>
        <div data-xh-part="cell" value="12:00"></div>
        <div data-xh-part="cell" value="15:00"></div>
        <div data-xh-part="cell" value="18:00"></div>
        <div data-xh-part="cell" value="21:00"></div>
      </div>
      <div data-xh-part="row" value="周三">
        <span data-xh-part="row-label" value="周三">周三</span>
        <div data-xh-part="cell" value="09:00"></div>
        <div data-xh-part="cell" value="12:00"></div>
        <div data-xh-part="cell" value="15:00"></div>
        <div data-xh-part="cell" value="18:00"></div>
        <div data-xh-part="cell" value="21:00"></div>
      </div>
      <div data-xh-part="row" value="周四">
        <span data-xh-part="row-label" value="周四">周四</span>
        <div data-xh-part="cell" value="09:00"></div>
        <div data-xh-part="cell" value="12:00"></div>
        <div data-xh-part="cell" value="15:00"></div>
        <div data-xh-part="cell" value="18:00"></div>
        <div data-xh-part="cell" value="21:00"></div>
      </div>
      <div data-xh-part="row" value="周五">
        <span data-xh-part="row-label" value="周五">周五</span>
        <div data-xh-part="cell" value="09:00"></div>
        <div data-xh-part="cell" value="12:00"></div>
        <div data-xh-part="cell" value="15:00"></div>
        <div data-xh-part="cell" value="18:00"></div>
        <div data-xh-part="cell" value="21:00"></div>
      </div>
    </div>
    <div data-xh-part="legend">
      <span data-xh-part="legend-label" value="low">少</span>
      <span data-xh-part="legend-item" value="0"></span>
      <span data-xh-part="legend-item" value="1"></span>
      <span data-xh-part="legend-item" value="2"></span>
      <span data-xh-part="legend-item" value="3"></span>
      <span data-xh-part="legend-item" value="4"></span>
      <span data-xh-part="legend-label" value="high">多</span>
    </div>
  </div>
</xh-heatmap>

<script type="module">
  // 行、列与数据都是数组，只走 property：HTML 属性装不下它们
  const matrix = document.getElementById("heatmap-matrix");
  matrix.rows = ["周一", "周二", "周三", "周四", "周五"];
  matrix.columns = ["09:00", "12:00", "15:00", "18:00", "21:00"];
  matrix.value = [
    { row: "周一", column: "09:00", value: 12 },
    { row: "周一", column: "12:00", value: 30 },
    { row: "周一", column: "18:00", value: 22 },
    { row: "周二", column: "12:00", value: 26 },
    { row: "周二", column: "21:00", value: 9 },
    { row: "周三", column: "09:00", value: 6 },
    { row: "周三", column: "15:00", value: 18 },
    { row: "周四", column: "12:00", value: 34 },
    { row: "周四", column: "18:00", value: 28 },
    { row: "周五", column: "15:00", value: 14 },
    { row: "周五", column: "18:00", value: 40 },
    { row: "周五", column: "21:00", value: 25 },
  ];
</script>
```

### 悬停详情

指针悬停与键盘聚焦走同一条路：详情条跟着那一格走，Escape 收起

```vue
<script setup lang="ts">
import type { HeatmapCellDetails, HeatmapDatum } from "@xihan-ui/headless";
import { formatHeatmapDate } from "@xihan-ui/headless";
import { XhHeatmapRoot } from "@xihan-ui/vue";

const DAY_MS = 86_400_000;

function buildYear(year: number): HeatmapDatum[] {
  const days: HeatmapDatum[] = [];
  let index = 0;
  for (let time = Date.UTC(year, 0, 1); time <= Date.UTC(year, 11, 31); time += DAY_MS) {
    const at = new Date(time);
    const noise = ((Math.imul(++index, 2654435761) >>> 8) % 1000) / 1000;
    const month = at.getUTCMonth();
    const peak = month === 2 || month === 9 ? 16 : month === 7 ? 3 : 8;
    const weekend = at.getUTCDay() === 0 || at.getUTCDay() === 6;
    const ceiling = weekend ? peak / 2 : peak;
    days.push({ date: formatHeatmapDate(time), count: noise < 0.16 ? 0 : Math.round(noise * ceiling) });
  }
  return days;
}

const activity = buildYear(2024);

// 详情条里写什么由作者定，组件只报是哪一格、数值多少
function readout(details: HeatmapCellDetails | null): string {
  return details ? `${details.date}：${details.count} 次（第 ${details.level} 档）` : "";
}

// 详情条对读屏是藏起来的，同一句必须同时当每格的可及名字，两处才不会各说各的
const translations = { cellLabel: readout };
</script>

<template>
  <!-- 写了 tooltip 插槽才会铺出详情条；同一份文字也在每格的可及名字里，读屏不缺信息。
       详情条按网格的内边距盒定位，横着滚到年末也照样贴着那一格 -->
  <XhHeatmapRoot
    :value="activity"
    :translations="translations"
    start-date="2024-01-01"
    end-date="2024-12-31"
  >
    <template #tooltip="details">{{ readout(details) }}</template>
  </XhHeatmapRoot>
</template>
```

```html
<div id="heatmap-detail-mount"></div>

<!-- 详情条要作者自己写进标记；一整年的网格由脚本照 grid 铺 -->
<template id="heatmap-detail-template">
  <xh-heatmap start-date="2024-01-01" end-date="2024-12-31">
    <div data-xh-part="root">
      <div data-xh-part="tooltip"></div>
    </div>
  </xh-heatmap>
</template>

<script type="module">
  const DAY_MS = 86400000;

  function buildYear(year) {
    const days = [];
    let index = 0;
    for (let time = Date.UTC(year, 0, 1); time <= Date.UTC(year, 11, 31); time += DAY_MS) {
      const at = new Date(time);
      const noise = ((Math.imul(++index, 2654435761) >>> 8) % 1000) / 1000;
      const month = at.getUTCMonth();
      const peak = month === 2 || month === 9 ? 16 : month === 7 ? 3 : 8;
      const weekend = at.getUTCDay() === 0 || at.getUTCDay() === 6;
      const ceiling = weekend ? peak / 2 : peak;
      days.push({
        date: at.toISOString().slice(0, 10),
        count: noise < 0.16 ? 0 : Math.round(noise * ceiling),
      });
    }
    return days;
  }

  /** 一个角色节点：身份写在 value 上，元素照它回网格里查数值与档位。 */
  function part(tag, name, value, text) {
    const el = document.createElement(tag);
    el.dataset.xhPart = name;
    if (value !== undefined) el.setAttribute("value", value);
    if (text !== undefined) el.textContent = text;
    return el;
  }

  // 详情条里那一句
  const readout = (details) =>
    details ? `${details.date}：${details.count} 次（第 ${details.level} 档）` : "";

  const fragment = document
    .getElementById("heatmap-detail-template")
    .content.cloneNode(true);
  const heatmap = fragment.querySelector("xh-heatmap");
  const root = fragment.querySelector('[data-xh-part="root"]');
  const tip = fragment.querySelector('[data-xh-part="tooltip"]');

  document.getElementById("heatmap-detail-mount").append(fragment);
  // 详情条对读屏是藏起来的，同一句必须同时当每格的可及名字，两处才不会各说各的
  heatmap.translations = { cellLabel: readout };
  // 数据是数组，只走 property：HTML 属性装不下它
  heatmap.value = buildYear(2024);

  const grid = heatmap.grid;

  const monthRow = part("div", "row");
  monthRow.append(part("span", "week-day"));
  for (const month of grid.months) {
    monthRow.append(part("span", "month-label", month.value, month.label));
  }

  const gridEl = part("div", "grid");
  for (const row of grid.rows) {
    const line = part("div", "row", row.weekDay);
    line.append(part("span", "week-day", row.weekDay, grid.weekDays[row.weekDay].label));
    for (const day of row.cells) {
      line.append(part("div", "cell", day.date));
    }
    gridEl.append(line);
  }

  const legend = part("div", "legend");
  // 两端各一个字：一排色块自己说不出哪头是多，文案跟着 legendText 走
  legend.append(part("span", "legend-label", "low", heatmap.legendText.low));
  for (let level = 0; level < grid.levels; level++) {
    legend.append(part("span", "legend-item", level));
  }
  legend.append(part("span", "legend-label", "high", heatmap.legendText.high));

  // 详情条排在网格与图例之间，与 Vue 侧不写默认插槽时铺出来的次序一致
  root.insertBefore(monthRow, tip);
  root.insertBefore(gridEl, tip);
  root.append(legend);

  // 详情该显示哪一格经 cell-active 事件回来
  heatmap.addEventListener("cell-active", (event) => {
    tip.textContent = readout(event.detail);
  });
</script>
```

### 年份切换

一排按钮换的是区间，网格、月份段、色阶与锚点全按新区间从头算

```vue
<script setup lang="ts">
import type { HeatmapDatum } from "@xihan-ui/headless";
import { formatHeatmapDate } from "@xihan-ui/headless";
import { XhButton, XhHeatmapRoot } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const DAY_MS = 86_400_000;

// 一段区间的提交量：数值由天序号哈希出来，同一段区间恒出同一份数据
function buildRange(start: string, end: string): HeatmapDatum[] {
  const days: HeatmapDatum[] = [];
  const from = Date.parse(`${start}T00:00:00Z`);
  const to = Date.parse(`${end}T00:00:00Z`);
  let index = 0;
  for (let time = from; time <= to; time += DAY_MS) {
    const at = new Date(time);
    const noise = ((Math.imul(++index, 2654435761) >>> 8) % 1000) / 1000;
    const weekend = at.getUTCDay() === 0 || at.getUTCDay() === 6;
    const ceiling = weekend ? 4 : 8;
    days.push({ date: formatHeatmapDate(time), count: noise < 0.2 ? 0 : Math.round(noise * ceiling) });
  }
  return days;
}

// 今天按 UTC 取整到当天零点，「最近一年」从它往回数 364 天
const today = Math.floor(Date.now() / DAY_MS) * DAY_MS;

const ranges = [
  { key: "recent", label: "最近一年", start: formatHeatmapDate(today - 364 * DAY_MS), end: formatHeatmapDate(today) },
  { key: "2024", label: "2024", start: "2024-01-01", end: "2024-12-31" },
  { key: "2023", label: "2023", start: "2023-01-01", end: "2023-12-31" },
  { key: "2022", label: "2022", start: "2022-01-01", end: "2022-12-31" },
];

const activeKey = ref(ranges[0].key);
const active = computed(() => ranges.find(r => r.key === activeKey.value) ?? ranges[0]);
// 数据跟着区间换：区间外的日子不进网格，也不把档位标尺顶高
const activity = computed(() => buildRange(active.value.start, active.value.end));
</script>

<template>
  <div style="display: grid; gap: 12px">
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <XhButton
        v-for="range in ranges"
        :key="range.key"
        size="sm"
        :variant="range.key === activeKey ? 'solid' : 'outline'"
        @click="activeKey = range.key"
      >
        {{ range.label }}
      </XhButton>
    </div>
    <!-- 换区间不必自己动手清理：上一次聚焦的那一格不在新区间里时，
         Tab 位自动退回新网格文档序的头一格 -->
    <XhHeatmapRoot
      :value="activity"
      :start-date="active.start"
      :end-date="active.end"
    />
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px">
  <div id="heatmap-year-tabs" style="display: flex; flex-wrap: wrap; gap: 8px"></div>
  <div id="heatmap-year-mount"></div>
</div>

<!-- 元素不生成结构：换区间之后照新的 grid 重铺一遍月份行、七行星期与图例 -->
<template id="heatmap-year-template">
  <xh-heatmap>
    <div data-xh-part="root"></div>
  </xh-heatmap>
</template>

<script type="module">
  const DAY_MS = 86400000;

  // 一段区间的提交量：数值由天序号哈希出来，同一段区间恒出同一份数据
  function buildRange(start, end) {
    const days = [];
    const from = Date.parse(`${start}T00:00:00Z`);
    const to = Date.parse(`${end}T00:00:00Z`);
    let index = 0;
    for (let time = from; time <= to; time += DAY_MS) {
      const at = new Date(time);
      const noise = ((Math.imul(++index, 2654435761) >>> 8) % 1000) / 1000;
      const weekend = at.getUTCDay() === 0 || at.getUTCDay() === 6;
      const ceiling = weekend ? 4 : 8;
      days.push({
        date: at.toISOString().slice(0, 10),
        count: noise < 0.2 ? 0 : Math.round(noise * ceiling),
      });
    }
    return days;
  }

  /** 一个角色节点：身份写在 value 上，元素照它回网格里查数值与档位。 */
  function part(tag, name, value, text) {
    const el = document.createElement(tag);
    el.dataset.xhPart = name;
    if (value !== undefined) el.setAttribute("value", value);
    if (text !== undefined) el.textContent = text;
    return el;
  }

  // 今天按 UTC 取整到当天零点，「最近一年」从它往回数 364 天
  const today = Math.floor(Date.now() / DAY_MS) * DAY_MS;
  const iso = (time) => new Date(time).toISOString().slice(0, 10);

  const ranges = [
    { key: "recent", label: "最近一年", start: iso(today - 364 * DAY_MS), end: iso(today) },
    { key: "2024", label: "2024", start: "2024-01-01", end: "2024-12-31" },
    { key: "2023", label: "2023", start: "2023-01-01", end: "2023-12-31" },
    { key: "2022", label: "2022", start: "2022-01-01", end: "2022-12-31" },
  ];

  const fragment = document
    .getElementById("heatmap-year-template")
    .content.cloneNode(true);
  const heatmap = fragment.querySelector("xh-heatmap");
  const root = fragment.querySelector('[data-xh-part="root"]');
  const tabs = document.getElementById("heatmap-year-tabs");

  const buttons = ranges.map((range) => {
    const host = document.createElement("xh-button");
    host.setAttribute("size", "sm");
    const button = document.createElement("button");
    button.dataset.xhPart = "root";
    button.textContent = range.label;
    button.addEventListener("click", () => show(range.key));
    host.append(button);
    tabs.append(host);
    return host;
  });

  /** 换区间：属性与数据一起换，再照新的 grid 重铺一遍。 */
  function show(key) {
    const range = ranges.find((item) => item.key === key) ?? ranges[0];
    buttons.forEach((host, index) => {
      host.setAttribute("variant", ranges[index].key === key ? "solid" : "outline");
    });
    heatmap.setAttribute("start-date", range.start);
    heatmap.setAttribute("end-date", range.end);
    // 数据是数组，只走 property：HTML 属性装不下它
    heatmap.value = buildRange(range.start, range.end);

    // 只读的 grid 一次取出来用：每读一次都重算一遍整张网格
    const grid = heatmap.grid;
    root.replaceChildren();

    // 月份行排在网格之外，行首那个占位与下面各行的星期名同宽，月份才对得上列
    const monthRow = part("div", "row");
    monthRow.append(part("span", "week-day"));
    for (const month of grid.months) {
      monthRow.append(part("span", "month-label", month.value, month.label));
    }

    const gridEl = part("div", "grid");
    for (const row of grid.rows) {
      const line = part("div", "row", row.weekDay);
      line.append(part("span", "week-day", row.weekDay, grid.weekDays[row.weekDay].label));
      for (const day of row.cells) {
        line.append(part("div", "cell", day.date));
      }
      gridEl.append(line);
    }

    const legend = part("div", "legend");
    // 两端各一个字：一排色块自己说不出哪头是多，文案跟着 legendText 走
    legend.append(part("span", "legend-label", "low", heatmap.legendText.low));
    for (let level = 0; level < grid.levels; level++) {
      legend.append(part("span", "legend-item", level));
    }
    legend.append(part("span", "legend-label", "high", heatmap.legendText.high));

    root.append(monthRow, gridEl, legend);
  }

  // 元素一连上就能读 grid，接线排在这之后，铺出来的格子赶得上。
  // 换区间不必自己动手清理：上一次聚焦的那一格不在新区间里时，
  // Tab 位自动退回新网格文档序的头一格
  document.getElementById("heatmap-year-mount").append(fragment);
  show(ranges[0].key);
</script>
```

### 数据统计

总天数、空白天数与占比、最大值、平均值都从网格模型直接读，不必自己再遍历一遍数据

```vue
<script setup lang="ts">
import type { HeatmapDatum } from "@xihan-ui/headless";
import { buildHeatmapGrid, formatHeatmapDate } from "@xihan-ui/headless";
import { XhHeatmapRoot } from "@xihan-ui/vue";
import { computed } from "vue";

const DAY_MS = 86_400_000;
const START = "2024-01-01";
const END = "2024-12-31";

// 一整年的提交量：数值由天序号哈希出来，同一年恒出同一份数据
function buildYear(year: number): HeatmapDatum[] {
  const days: HeatmapDatum[] = [];
  let index = 0;
  for (let time = Date.UTC(year, 0, 1); time <= Date.UTC(year, 11, 31); time += DAY_MS) {
    const at = new Date(time);
    const noise = ((Math.imul(++index, 2654435761) >>> 8) % 1000) / 1000;
    const weekend = at.getUTCDay() === 0 || at.getUTCDay() === 6;
    const ceiling = weekend ? 4 : 10;
    days.push({ date: formatHeatmapDate(time), count: noise < 0.22 ? 0 : Math.round(noise * ceiling) });
  }
  return days;
}

const activity = buildYear(2024);

// 网格的推导是纯函数，与组件内部用的是同一份；写默认插槽时载荷里的 grid 也是它
const grid = computed(() => buildHeatmapGrid({ value: activity, startDate: START, endDate: END }));

const stats = computed(() => {
  const days = grid.value.cells.size;
  // 空白 = 值为 0 的格子：没有数据的日子与写了 0 的日子都算。
  // 它不是「色阶第 0 档的格子数」——这里没给 thresholds，首个下界恒为 1，两个数才恰好相等
  const empty = grid.value.emptyCount;
  return [
    { label: "总天数", value: `${days} 天` },
    { label: "空白", value: `${empty} 天（${days ? Math.round((empty / days) * 100) : 0}%）` },
    { label: "最多", value: `${grid.value.max} 次` },
    { label: "平均", value: `${days ? (grid.value.total / days).toFixed(1) : "0.0"} 次/天` },
  ];
});
</script>

<template>
  <div style="display: grid; gap: 12px">
    <XhHeatmapRoot :value="activity" :start-date="START" :end-date="END" />
    <div style="display: flex; flex-wrap: wrap; gap: 16px">
      <span v-for="item in stats" :key="item.label">
        {{ item.label }}：<strong>{{ item.value }}</strong>
      </span>
    </div>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px">
  <div id="heatmap-stats-mount"></div>
  <div id="heatmap-stats-readout" style="display: flex; flex-wrap: wrap; gap: 16px"></div>
</div>

<!-- 元素不生成结构：外壳只写 root，一整年的月份行、七行星期与图例由脚本照 grid 铺 -->
<template id="heatmap-stats-template">
  <xh-heatmap start-date="2024-01-01" end-date="2024-12-31">
    <div data-xh-part="root"></div>
  </xh-heatmap>
</template>

<script type="module">
  const DAY_MS = 86400000;

  // 一整年的提交量：数值由天序号哈希出来，同一年恒出同一份数据
  function buildYear(year) {
    const days = [];
    let index = 0;
    for (let time = Date.UTC(year, 0, 1); time <= Date.UTC(year, 11, 31); time += DAY_MS) {
      const at = new Date(time);
      const noise = ((Math.imul(++index, 2654435761) >>> 8) % 1000) / 1000;
      const weekend = at.getUTCDay() === 0 || at.getUTCDay() === 6;
      const ceiling = weekend ? 4 : 10;
      days.push({
        date: at.toISOString().slice(0, 10),
        count: noise < 0.22 ? 0 : Math.round(noise * ceiling),
      });
    }
    return days;
  }

  /** 一个角色节点：身份写在 value 上，元素照它回网格里查数值与档位。 */
  function part(tag, name, value, text) {
    const el = document.createElement(tag);
    el.dataset.xhPart = name;
    if (value !== undefined) el.setAttribute("value", value);
    if (text !== undefined) el.textContent = text;
    return el;
  }

  const fragment = document
    .getElementById("heatmap-stats-template")
    .content.cloneNode(true);
  const heatmap = fragment.querySelector("xh-heatmap");
  const root = fragment.querySelector('[data-xh-part="root"]');
  const readout = document.getElementById("heatmap-stats-readout");

  // 元素一连上就能读 grid，接线排在这之后，铺出来的格子赶得上
  document.getElementById("heatmap-stats-mount").append(fragment);
  // 数据是数组，只走 property：HTML 属性装不下它
  heatmap.value = buildYear(2024);

  // 只读的 grid 一次取出来用：每读一次都重算一遍整张网格
  const grid = heatmap.grid;

  // 月份行排在网格之外，行首那个占位与下面各行的星期名同宽，月份才对得上列
  const monthRow = part("div", "row");
  monthRow.append(part("span", "week-day"));
  for (const month of grid.months) {
    monthRow.append(part("span", "month-label", month.value, month.label));
  }

  const gridEl = part("div", "grid");
  for (const row of grid.rows) {
    const line = part("div", "row", row.weekDay);
    line.append(part("span", "week-day", row.weekDay, grid.weekDays[row.weekDay].label));
    for (const day of row.cells) {
      line.append(part("div", "cell", day.date));
    }
    gridEl.append(line);
  }

  const legend = part("div", "legend");
  // 两端各一个字：一排色块自己说不出哪头是多，文案跟着 legendText 走
  legend.append(part("span", "legend-label", "low", heatmap.legendText.low));
  for (let level = 0; level < grid.levels; level++) {
    legend.append(part("span", "legend-item", level));
  }
  legend.append(part("span", "legend-label", "high", heatmap.legendText.high));

  root.append(monthRow, gridEl, legend);

  const days = grid.cells.size;
  // 空白 = 值为 0 的格子：没有数据的日子与写了 0 的日子都算。
  // 它不是「色阶第 0 档的格子数」——这里没给 thresholds，首个下界恒为 1，两个数才恰好相等
  const empty = grid.emptyCount;
  const stats = [
    { label: "总天数", value: `${days} 天` },
    { label: "空白", value: `${empty} 天（${days ? Math.round((empty / days) * 100) : 0}%）` },
    { label: "最多", value: `${grid.max} 次` },
    { label: "平均", value: `${days ? (grid.total / days).toFixed(1) : "0.0"} 次/天` },
  ];
  for (const item of stats) {
    const line = document.createElement("span");
    line.append(`${item.label}：`);
    const strong = document.createElement("strong");
    strong.textContent = item.value;
    line.append(strong);
    readout.append(line);
  }
</script>
```

## 设计指引

### 何时使用

- 看一段连续日期上「哪几天多、哪几天少」，以及有没有成片的空档。
- 看逐月的分布，月与月之间要能对齐着比。
- 看两条离散坐标交叉出来的强度，比如「星期 × 小时」的活跃度、「品类 × 月份」的销量、相关系数矩阵。
- 强调节奏与分布，而不是某一格的准确数值。

### 何时不用

- 要挑日期、选区间：用[日历](./calendar)，它才有选中语义与表单出口。
- 要读准确数字、要排序筛选：用[表格](./table)。
- 只报一个总量或同比：用[统计数值](./statistic)。

### 特性

- 典型用法是一整年：`calendar` 形态给整年的起止日期，铺出 53 个周列 × 7 行、三百六十几格，一眼看完全年的节奏。下面各条里的取值都是按这个尺度定的。
- 三种形态由 `variant` 切换，不写即 `calendar`：
  - `calendar` 连续周列 × 星期行，月份名浮在网格上沿当坐标轴，适合看一整年的节奏；
  - `month` 按自然月分块，每块是一张真月历，1 号落在它真实的星期几上，适合看逐月的分布——连续周列看不出月界，这是它存在的理由；
  - `matrix` 行列都由作者用 `rows` / `columns` 给，数据按 `(row, column)` 定位，与日期无关。
- 矩阵形态的格子两向分开量：宽走 `--xh-heatmap-column-w`、高走 `--xh-heatmap-row-h`，两者都不吃日历那把「一天一个小方块」的 `--xh-heatmap-cell-size`——那把尺是按「一年五十几列」定的，矩阵一行左边还挂着行名，格子照它定高就矮过行名，行高由行名的字定、格子在行里摊成一条。行高不写时是格宽尺的两倍（sm 16px / md 20px / lg 24px），每一档都高过行名那行字；列宽不写时取行高，一格缺省就是正方块。行高不接控件高度那把尺：那把尺是给可点可输的控件在一行里排齐用的，矩阵格子不可交互，接上去密度档一换矩阵就跟着变形。
- 月份名与星期名跟着 `locale` 走：不给就跟宿主浏览器语言，读不到才落 `en-US`。周首日是另一条，由 `firstDayOfWeek` 定，缺省星期一。
- 数据收两种形状之一，按有没有 `date` 分辨：日期形态写 `{ date, count }`，矩阵形态写 `{ row, column, value }`。同一格出现多次即累加。
- 日期只认 ISO 的 `YYYY-MM-DD` 串，加减以 UTC 计，不引日期库。
- 区间起点不在周首日时会错列，两种日期形态的口径不同：`calendar` 是「排在起点星期几之前的那几行整行往后错一列」，`month` 是「本月首格错到 1 号真实的星期几」。两者都不铺没有日期的占位格。
- 月份名落在「这个月头一天所在的那一列」上：一列跨两个月时整列归后一个月。1 号极少正好是周首日，按「列里头一天所在的月」分段会让十二个月份名里有九个整体晚一列，读者顺着「2 月」往下看反而错过月初那几天。第 0 列是唯一的例外，它按区间首日所在的月归——起点落在月末（`2024-01-29` 起的近 365 天就是）时那一列只露出上个月末尾几天，跟着末一天走会让头一个月一个名字都不出。代价是这种区间里第二个月的名字排在第 1 列，比它 1 号所在的第 0 列晚一列。
- 一整年放不下一屏时网格自己横着滚，行首那一列星期名钉在起始缘不跟着走（矩阵形态的行名同理）。钉住的那一列自带 `--xh-bg-surface` 的底色，整块摆在别的底色上（卡片、分区）时要改写 `--xh-heatmap-bg`，否则那一列会是一块补丁。 月历形态例外：月块是换行排开的，宽度永远不超过容器，那一档不当滚动容器，也就没有钉住的那一列。
- 三张网格的推导都是纯函数（`buildHeatmapGrid` / `buildHeatmapMonthGrid` / `buildHeatmapMatrixGrid`），可以脱离组件单独调用来预生成数据。
- 格距四周一样宽：数据行的高度钉死成格子的边长，不由行首那一列星期名的字撑开。三档尺寸的横向与纵向格距是同一个值（缺省 4px），格子 sm 8px / md 10px / lg 12px。
- 行首那一列星期名隔行画：只留第 0/2/4/6 行之外的那三行——周首日是星期一时是「二 / 四 / 六」，是星期日时是「一 / 三 / 五」。一行只有 10px 高而字是 12px，七个挨着写会上下叠在一起；隔一行之后每个留下来的字有两行的高度可用。三档尺寸一视同仁，不随档位变。要七行全画就把 `--xh-heatmap-week-day-skip` 改成一个看得见的颜色，比如 `var(--xh-heatmap-label-fg, var(--xh-fg-subtle))`（此时 `sm` 档会挨得很紧）。跳过的是字不是盒子：那几行只是字不上色，节点、文字、盒子与底色都还在——钉住那一列的实色底不能缺四行，缺了格子就从行首透出来，那四行也会不再参与命中测试，鼠标划过行首弹出的是看不见那一格的详情条。
- 色阶对照条两端各写一个词（缺省 `Less` `More`），一排色块自己说不出哪头是多。文案走 `translations.legendLow` / `legendHigh`，部件是 `legend-label`（`value` 写 `low` 或 `high`）；Vue 侧不写默认插槽时两端自动铺出来，WC 侧从元素的 `legendText` 属性取这两个字。
- 配色有两条路，缺省是品牌色。一条是 `tone` 语气轴（brand / neutral / success / warning / danger / info），与其余组件共用；另一条是 `palette` 色板轴（green / blue / orange / purple / red / gray），直接按颜色点名。色板只定色阶满档那一端的实心底，0 档的空格底与中间各档的兑法一概不动，也不参与语气层的悬停 / 淡底 / 前景派生——它是装饰性的一条轴，不是第四条语义轴。两个都写时听色板的：色板指名了一个具体颜色，语气只是推得出一个颜色。
- 档数可调：不给 `thresholds` 就按网格内的最大值均分，给了就以它为准。
- 要在图外报「总天数 / 空白天数与占比 / 最大值 / 平均值」不必自己再遍历一遍数据：三张网格都带 `max`（最大值）、`total`（总和）与 `emptyCount`（值为 0 的格子数），格子总数从 `cells.size` 读。`emptyCount` 数的是值为 0 的格子：没有数据的日子与写了 0 的日子都算。它不是「色阶第 0 档的格子数」——不给 `thresholds` 时首个下界恒为 1，两个数恰好相等；给了 `thresholds` 之后第 0 档还会收进低于首个下界的那些非零值，两个数不再相等。
- 悬停或键盘聚焦到某一格就显示详情条，内容由作者写；组件只给身份、位置与这一格的数据（日期或行列、原始值、档位、在色阶里的位置）。
- 语气与尺寸两轴与其余组件同源；色板轴是热力图独有的。
- 两个适配器的作者侧写法不同，最终 DOM 一致：Vue 侧不写默认插槽就按形态自动铺开整棵树，另有 `cell` 插槽往每格里塞内容（三种形态都铺，载荷是日历那一格或矩阵那一格，用 `'date' in cell` 分辨）、`tooltip` 插槽写详情条的内容（写了它才铺出详情条）；Web Components 侧元素不生成任何结构，各部件都要作者写进标记，元素只负责按部件名打属性。
- Web Components 侧铺一整年不必手写三百多个格子：`<xh-heatmap>` 上有 `grid` / `monthGrid` / `matrixGrid` 三个只读属性，分别对应三种形态推导出来的网格（行、列、月份段、星期名、档位标尺都在里面），照着循环生成节点即可——元素一连上就读得到，接线排在这之后，当场铺出来的格子赶得上。每读一次都重算一遍整张网格，取一次存下来用。两个插槽是 Vue 专属，WC 侧靠 `cell-active` 事件自己填详情条。
- 自己写默认插槽铺网格时，锚点从载荷里的 `focusedCell` / `anchorCell` 读、用 `setFocusedCell` 挪：这一组三形态通用，带 `Date` 的那一组在矩阵形态下恒为 null。

从别的库过来的对号入座表。左边一列是那些库写在 `color-theme` 上的取值，右边两列是本库的两条路——写哪一条都行，同一行的两种写法在缺省主题下产出同一个颜色（`gray` 是唯一的例外，见表下那条）：

| 别处的 `color-theme` | 色板轴（推荐） | 语气轴 | 满档实心底取的原语 |
| --- | --- | --- | --- |
| `green` | `palette="green"` | `tone="success"` | `--xh-color-success-600` |
| `blue` | `palette="blue"` | `tone="info"` | `--xh-color-info-600` |
| `orange` | `palette="orange"` | `tone="warning"` | `--xh-color-warning-600` |
| `purple` | `palette="purple"` | 语气轴里没有紫 | `--xh-color-purple-600` |
| `red` | `palette="red"` | `tone="danger"` | `--xh-color-danger-600` |
| （多数库没有） | `palette="gray"` | `tone="neutral"` | `--xh-color-neutral-600`；深色态换 `--xh-color-neutral-450` |
| （多数库的缺省是绿） | 不写 | 不写 | `--xh-bg-brand`，跟着使用者的品牌色走 |

- 灰是唯一按主题换档的一族：五个彩色族的 600 档明度在 0.577–0.705，深色态的空格底（`neutral-800`，明度 0.269）离得够远；中性 600 档只有 0.439，五档摊下来每档只差 0.0425、相邻两档对比度 1.16–1.20，等于看不出分档。因此深色态改取 `neutral-450`（明度 0.65），步长回到 0.095、相邻两档 1.42–1.50，与彩色族齐平；不取更亮的 `neutral-400` 是因为高对比档的 `border-default` 正是那一档，满档格子的描边会与底色同色。`tone="neutral"` 没有这层照顾，要灰色热力图请写 `palette="gray"`。
- 这七种之外的任何颜色一直都可以直接给：改写 `--xh-heatmap-ink`（满档的实心底）与 `--xh-heatmap-empty`（0 档的空格底），中间各档由这两端在 oklab 里兑出来。这个口子的优先级最高，色板与语气都压不过它。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-heatmap>` |
| Vue 组件 | `XhHeatmapCell` `XhHeatmapColumnLabel` `XhHeatmapGrid` `XhHeatmapLegend` `XhHeatmapLegendItem` `XhHeatmapLegendLabel` `XhHeatmapMonthBlock` `XhHeatmapMonthLabel` `XhHeatmapRoot` `XhHeatmapRow` `XhHeatmapRowLabel` `XhHeatmapTooltip` `XhHeatmapWeekDay` |
| 组合式函数 | `useHeatmap` |
| 状态机 | `heatmapMachine` |
| 皮肤 | `@xihan-ui/styles/heatmap.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="heatmap"`：**`root`** · **`grid`** · `month-block` · `row` · `week-day` · `month-label` · `row-label` · `column-label` · `cell` · `tooltip` · `legend` · `legend-label` · `legend-item`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `variant` | `HeatmapVariant` |  | 形态：calendar 连续周列、month 按自然月分块、matrix 行列由作者给；缺省 calendar。 |
| `value` | `HeatmapValue[]` |  | 数据。日期形态收 { date, count }，矩阵形态收 { row, column, value }；同一格出现多次即累加。 |
| `rows` | `HeatmapAxisInput[]` |  | 矩阵的行，顺序即渲染顺序；只写身份或身份与文本分开写都行。 |
| `columns` | `HeatmapAxisInput[]` |  | 矩阵的列，顺序即渲染顺序。 |
| `startDate` | `string` |  | 区间起点（含），ISO YYYY-MM-DD。缺省或非法即空网格。 |
| `endDate` | `string` |  | 区间终点（含）。早于起点即空网格。 |
| `levels` | `number` |  | 档数，缺省 5；给了 thresholds 则档数由它定。 |
| `thresholds` | `number[]` |  | 各档的下界，升序；给了它 levels 不再起作用。 |
| `firstDayOfWeek` | `number` |  | 周首日，0 = 星期日，缺省 1。 |
| `locale` | `string` |  | 月份名与星期名的书写 locale，不给按宿主语言，宿主也没有时按 en-US。 |
| `dir` | `Direction` |  | 文字方向。只作显式覆盖：不写时方向从 DOM 现读， 左右方向键的语义跟着视觉次序走，上下键与它无关。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `palette` | `HeatmapPalette` |  | 色板：green / blue / orange / purple / red / gray，直接点名色阶满档那一端的颜色；同时写了 tone 时听它的。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<HeatmapTranslations>` |  |  |
| `onCellFocus` | `(details: HeatmapCellFocusDetails) => void` |  | DOM 焦点落到某一格时通知一次；同一格重复聚焦不重复通知。 只由真实的聚焦触发，程序化挪锚点（`setFocusedCell`）不派这个回调。 |
| `onCellActive` | `(details: HeatmapCellDetails \| null) => void` |  | 详情该显示哪一格：指针悬停或键盘聚焦都会走到这里，收起时给 null。 详情条里写什么由作者决定，组件只报是哪一格、数值多少。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `cell-focus` | `HeatmapCellFocusDetails` | 焦点落到某一格；detail 为 `{ date, row, column, count, level, percent }` |
| `cell-active` | `HeatmapCellDetails` | 详情该显示哪一格（悬停或聚焦）；收起时 detail 为 null |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhHeatmapRoot` | `default` | `HeatmapRootSlotProps` |  |
| `XhHeatmapRoot` | `cell` | `HeatmapCellSlotProps` | 铺开网格时每一格的内容插槽，缺省是空格子；三种形态都铺。 |
| `XhHeatmapRoot` | `tooltip` | `HeatmapCellDetails \| null` | 详情条的内容插槽；写了它才会铺出 tooltip 部件。 |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `tooltip` | 'hidden' \| 'visible' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`CELL.FOCUS` · `CELL.BLUR` · `CELL.ENTER` · `CELL.LEAVE` · `DETAIL.DISMISS` · `FOCUS.SET`

## connect API

`useHeatmap` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `variant` | `HeatmapVariant` | 当前形态。 |
| `grid` | `HeatmapGrid` | 日历网格：行是星期几、列是周次，另带月份段、星期名与档位标尺。其余形态下是一张空网格。 |
| `monthGrid` | `HeatmapMonthGrid \| null` | 月历网格：按自然月分块；不是 month 形态时为 null。 |
| `matrixGrid` | `HeatmapMatrixGrid \| null` | 矩阵网格：行列由作者给；不是 matrix 形态时为 null。 |
| `focusedCell` | `HeatmapCellRef \| null` | 最后一次被聚焦的那一格；从没聚焦过时为 null。 |
| `focusedDate` | `string \| null` | 最后一次被聚焦的那一天；矩阵形态下恒为 null。 |
| `anchorCell` | `HeatmapCellRef \| null` | 当下占着 Tab 位的那一格：锚点还在网格里就是它，否则退回文档序头一格。 |
| `anchorDate` | `string \| null` | 当下占着 Tab 位的那一天；矩阵形态下恒为 null。 |
| `activeCell` | `HeatmapCellDetails \| null` | 详情该显示哪一格的数据：身份、原始值、档位与色阶位置；不显示时为 null。 |
| `detailOpen` | `boolean` | 详情条此刻是不是显示着。 |
| `legendText` | `{ low: string, high: string }` | 对照条两端要写的那两个字，作者照它渲染 legend-label 部件。 与 `getLegendLabelProps` 同源，改 translations 两处一起变。 |
| `cellAt` | `(date: string) => HeatmapCellMeta \| null` | 按日期取一格；不在区间内给 null。矩阵形态下恒为 null。 |
| `setFocusedCell` | `(cell: HeatmapCellRef \| null) => void` | 挪动锚点。只改锚点不搬 DOM 焦点，也不派 `onCellFocus`； 需要焦点跟着走的自行调用元素的 focus()。 |
| `setFocusedDate` | `(date: string \| null) => void` | 按日期挪动锚点，等同于 `setFocusedCell({ date })`。 |
| `getRootProps` | `() => T['element']` |  |
| `getGridProps` | `() => T['element']` |  |
| `getMonthBlockProps` | `(props: HeatmapMonthBlockProps) => T['element']` |  |
| `getRowProps` | `(props: HeatmapRowProps) => T['element']` |  |
| `getWeekDayProps` | `(props: HeatmapWeekDayProps) => T['element']` |  |
| `getMonthLabelProps` | `(props: HeatmapMonthLabelProps) => T['element']` |  |
| `getRowLabelProps` | `(props: HeatmapRowLabelProps) => T['element']` |  |
| `getColumnLabelProps` | `(props: HeatmapColumnLabelProps) => T['element']` |  |
| `getCellProps` | `(props: HeatmapCellProps) => T['element']` |  |
| `getTooltipProps` | `() => T['element']` |  |
| `getLegendProps` | `() => T['element']` |  |
| `getLegendLabelProps` | `(props: HeatmapLegendLabelProps) => T['element']` |  |
| `getLegendItemProps` | `(props: HeatmapLegendItemProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | 总是 | 整张网格只占一个 Tab 位：焦点落到锚点那一格，一格都没有时落网格自己 |
| `ArrowLeft` | focus in grid | 焦点横着退一格：日历形态是上一周的同一天，月历形态是前一天（跨得过月块），矩阵形态是左边一列；已在头一格则原地不动。dir=rtl 时改由 ArrowRight 承担 |
| `ArrowRight` | focus in grid | 焦点横着进一格：日历形态是下一周的同一天，月历形态是后一天（跨得过月块），矩阵形态是右边一列；已在末一格则原地不动。dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowUp` | focus in grid | 焦点竖着退一格：日历形态是前一天，月历形态是上一周的同一天，矩阵形态是上面一行；走出网格则原地不动 |
| `ArrowDown` | focus in grid | 焦点竖着进一格：日历形态是后一天，月历形态是下一周的同一天，矩阵形态是下面一行；走出网格则原地不动 |
| `Home` | focus in grid | 焦点移到本行头一格：日历形态是这个星期几最早的一天，月历形态是这一周在本月里的头一天，矩阵形态是头一列 |
| `End` | focus in grid | 焦点移到本行末一格：日历形态是这个星期几最晚的一天，月历形态是这一周在本月里的末一天，矩阵形态是末一列 |
| `Ctrl+Home` | focus in grid | 焦点移到整张网格文档序的头一格 |
| `Ctrl+End` | focus in grid | 焦点移到整张网格文档序的末一格 |
| `Escape` | 详情条显示着 | 收起详情条；焦点留在原处，按键不拦截（外层浮层的关闭仍归它自己管） |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `grid` | `aria-colcount` | counts.columns \| undefined |
| `grid` | `aria-label` | translations?.gridLabel |
| `grid` | `aria-readonly` | 'true' |
| `grid` | `aria-rowcount` | counts.rows \| undefined |
| `grid` | `role` | 'grid' |
| `month-block` | `aria-label` | monthBlockOf.get(block.value)?.long |
| `month-block` | `role` | 'rowgroup' |
| `row` | `aria-hidden` | 'true' |
| `row` | `aria-label` | undefined \| grid.weekDays[row.weekDay]?.long |
| `row` | `aria-rowindex` | 1 |
| `row` | `role` | 'row' |
| `week-day` | `aria-hidden` | 'true' |
| `month-label` | `aria-hidden` | 'true' |
| `row-label` | `aria-colindex` | 1 |
| `row-label` | `aria-hidden` | 'true' |
| `row-label` | `role` | 'rowheader' |
| `column-label` | `aria-colindex` | meta.index + 2 \| undefined |
| `column-label` | `role` | 'columnheader' |
| `cell` | `aria-colindex` | meta.columnIndex + 2 \| undefined |
| `cell` | `aria-label` | matrixCellLabel({ date: '', row, column, count, level… |
| `cell` | `role` | 'gridcell' |
| `tooltip` | `aria-hidden` | 'true' |
| `legend` | `aria-label` | translations?.legendLabel |
| `legend` | `role` | 'group' |
| `legend-item` | `aria-hidden` | 'true' |

- 网格是 `role="grid"` 且 `aria-readonly`，每行一个 `role="row"`，每格一个 `role="gridcell"`。
- 月历形态里一个自然月是一个 `role="rowgroup"`，块的可及名字是这个月的长名字；块里那条星期名坐标轴整条 `aria-hidden`，读屏看到的每一块就只剩合法的几行。
- 矩阵形态里行名是 `role="rowheader"`、列名是 `role="columnheader"`，表头行行首那个角落占位 `aria-hidden`；行列总数把两条表头也算进去，读屏报的行列号才对得上。
- 格子里没有文字，可及名字全靠文案拼出来：日期形态走 `translations.cellLabel`（日期 + 数值），矩阵形态走 `translations.matrixCellLabel`（行 + 列 + 数值），务必按本地语言改写它们。
- 星期名、月份名与图例里的色块都是给眼睛看的坐标轴，一律 `aria-hidden`：每格自己就念得出完整身份与数值，再念一遍轴只是噪音。
- 日历形态里星期名是隔行画的，肉眼靠上下文补得出被跳过的那几行：因此每一行自带 `aria-label`，写的是这一行星期几的全称（`星期一` 这种）。这个名字跟 `locale` 走、不进 `translations`——它念的就是坐标轴上那个词，两处必须逐字一致（月块的名字同理）。它只是一层补充：`role="row"` 上的名字并非所有读屏在方向键导航时都播报，而每一格的可及名字里本就带完整日期，星期几这条信息从来没丢过。
- 图例整体是 `role="group"`，名字走 `translations.legendLabel`：一排色块自己说不出这是干什么用的。两端那两个字是真文字、不藏，色阶朝哪个方向深因此说得出口——深色代表多还是少是约定俗成而非自明的。
- 详情条 `aria-hidden`：它显示的信息与那一格的可及名字是同一份，念两遍反而吵。**因此详情条里不能出现可及名字里没有的内容**，否则读屏用户就少了一块。
- 各行格子数不一定齐（首行可能少一格），格子上带 `aria-colindex`，读屏报出的列号才对得上。
- 整张网格只占一个 Tab 位，进去以后靠方向键走。键盘聚焦与指针悬停触发的是同一条详情：只做悬停等于把键盘与读屏用户排除在外。
- Escape 收起详情条但不拦截按键：外层浮层的关闭仍归它自己管。

## 样式

默认皮肤 `@xihan-ui/styles/heatmap.css` 按部件选择：`[data-scope="heatmap"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-palette` | props.palette |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `row` | `data-week` | String(row.week) |
| `row` | `data-week-day` | undefined \| String(row.weekDay) |
| `week-day` | `data-week-day` | undefined \| String(label.weekDay) |
| `cell` | `data-level` | String(level) |
| `tooltip` | `data-inline-anchor` | undefined \| tip.inlineAnchor |
| `tooltip` | `data-placement` | undefined \| ((): 'block-start' \| 'block-end' =&gt; { if (activeRef =… |
| `tooltip` | `data-state` | 'hidden' \| 'visible' |
| `legend-label` | `data-bound` | label.bound |
| `legend-item` | `data-level` | String(item.level) |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-heatmap-bg` | `root`<br>`row-label`<br>`week-day` | `background` | `default` | `--xh-bg-surface` | heatmap 的 root、row-label、week-day 部件 background 覆盖槽。 |
| `--xh-heatmap-block-gap` | `grid`<br>`root` | `gap` | `variant=month` | `--xh-_heatmap-gutter` | heatmap 的 grid、root 部件 gap 覆盖槽。 |
| `--xh-heatmap-block-inner-gap` | `month-block` | `gap` | `default` | `--xh-_heatmap-gap` | heatmap 的 month-block 部件 gap 覆盖槽。 |
| `--xh-heatmap-cell-bg` | `cell`<br>`legend-item` | `background` | `default` | `--xh-_heatmap-ink` | heatmap 的 cell、legend-item 部件 background 覆盖槽。 |
| `--xh-heatmap-cell-border` | `cell`<br>`legend-item` | `box-shadow` | `default` | `--xh-border-default` | heatmap 的 cell、legend-item 部件 box-shadow 覆盖槽。 |
| `--xh-heatmap-cell-radius` | `cell`<br>`legend-item` | `border-radius` | `default` | `--xh-shape-inset` | heatmap 的 cell、legend-item 部件 border-radius 覆盖槽。 |
| `--xh-heatmap-cell-size` | `cell`<br>`legend-item`<br>`month-label`<br>`root`<br>`row`<br>`week-day` | `block-size`<br>`border`<br>`inline-size`<br>`margin-inline-start` | `@media print`<br>`default`<br>`first-child`<br>`level=1`<br>`level=2`<br>`level=3`<br>`size=lg`<br>`size=sm`<br>`variant=month`<br>`week`<br>`week-day` | `--xh-space-2`<br>`--xh-space-2_5`<br>`--xh-space-3` | heatmap 的 cell、legend-item、month-label、root、row、week-day 部件 block-size、border、inline-size、margin-inline-start 覆盖槽。 |
| `--xh-heatmap-column-w` | `cell`<br>`column-label`<br>`root` | `inline-size` | `default`<br>`variant=matrix` | `--xh-_heatmap-row-h` | heatmap 的 cell、column-label、root 部件 inline-size 覆盖槽。 |
| `--xh-heatmap-empty` | `cell`<br>`legend-item`<br>`root` | `background` | `default` | `--xh-bg-subtle` | heatmap 的 cell、legend-item、root 部件 background 覆盖槽。 |
| `--xh-heatmap-fg` | `root` | `color` | `default` | `--xh-fg-muted` | heatmap 的 root 部件 color 覆盖槽。 |
| `--xh-heatmap-font-size` | `root` | `font-size` | `default` | `--xh-_heatmap-font-size` | heatmap 的 root 部件 font-size 覆盖槽。 |
| `--xh-heatmap-gap` | `root` | `gap` | `default` | `--xh-space-2` | heatmap 的 root 部件 gap 覆盖槽。 |
| `--xh-heatmap-grid-gap` | `grid` | `gap` | `default` | `--xh-_heatmap-gap` | heatmap 的 grid 部件 gap 覆盖槽。 |
| `--xh-heatmap-gutter` | `grid`<br>`root`<br>`row-label`<br>`week-day` | `gap`<br>`inline-size`<br>`scroll-padding-inline-start` | `default`<br>`size=sm`<br>`variant=month` | `--xh-space-6`<br>`--xh-space-8` | heatmap 的 grid、root、row-label、week-day 部件 gap、inline-size、scroll-padding-inline-start 覆盖槽。 |
| `--xh-heatmap-ink` | `cell`<br>`legend-item`<br>`root` | `background` | `default`<br>`is([data-theme='dark'] *, [data-theme='dark'])`<br>`palette=blue`<br>`palette=gray`<br>`palette=green`<br>`palette=orange`<br>`palette=purple`<br>`palette=red`<br>`theme=dark`<br>`tone` | `--xh-_tone`<br>`--xh-bg-brand`<br>`--xh-color-danger-600`<br>`--xh-color-info-600`<br>`--xh-color-neutral-450`<br>`--xh-color-neutral-600`<br>`--xh-color-purple-600`<br>`--xh-color-success-600`<br>`--xh-color-warning-600` | heatmap 的 cell、legend-item、root 部件 background 覆盖槽。 |
| `--xh-heatmap-label-fg` | `column-label`<br>`legend`<br>`month-label`<br>`root`<br>`row-label`<br>`week-day` | `color` | `default`<br>`variant=month`<br>`week-day=0`<br>`week-day=2`<br>`week-day=4`<br>`week-day=6` | `--xh-fg-subtle` | heatmap 的 column-label、legend、month-label、root、row-label、week-day 部件 color 覆盖槽。 |
| `--xh-heatmap-legend-gap` | `legend` | `gap` | `default` | `--xh-_heatmap-gap` | heatmap 的 legend 部件 gap 覆盖槽。 |
| `--xh-heatmap-py` | `root` | `padding-block` | `default` | `--xh-_heatmap-gap` | heatmap 的 root 部件 padding-block 覆盖槽。 |
| `--xh-heatmap-row-gap` | `row` | `gap` | `default` | `--xh-_heatmap-gap` | heatmap 的 row 部件 gap 覆盖槽。 |
| `--xh-heatmap-row-h` | `cell`<br>`column-label`<br>`root` | `block-size`<br>`inline-size` | `default`<br>`size=lg`<br>`size=sm`<br>`variant=matrix` | `--xh-space-4`<br>`--xh-space-5`<br>`--xh-space-6` | heatmap 的 cell、column-label、root 部件 block-size、inline-size 覆盖槽。 |
| `--xh-heatmap-sticky-layer` | `row-label`<br>`week-day` | `z-index` | `default` | `1` | heatmap 的 row-label、week-day 部件 z-index 覆盖槽。 |
| `--xh-heatmap-title-fg` | `month-label`<br>`root` | `color` | `variant=month` | `--xh-fg-default` | heatmap 的 month-label、root 部件 color 覆盖槽。 |
| `--xh-heatmap-tooltip-bg` | `tooltip` | `background` | `default` | `--xh-fg-default` | heatmap 的 tooltip 部件 background 覆盖槽。 |
| `--xh-heatmap-tooltip-fg` | `tooltip` | `color` | `default` | `--xh-bg-surface` | heatmap 的 tooltip 部件 color 覆盖槽。 |
| `--xh-heatmap-tooltip-font-size` | `tooltip` | `font-size` | `default` | `--xh-text-caption-size` | heatmap 的 tooltip 部件 font-size 覆盖槽。 |
| `--xh-heatmap-tooltip-layer` | `tooltip` | `z-index` | `default` | `2` | heatmap 的 tooltip 部件 z-index 覆盖槽。 |
| `--xh-heatmap-tooltip-max-w` | `tooltip` | `max-inline-size` | `default` | `--xh-overlay-max-w` | heatmap 的 tooltip 部件 max-inline-size 覆盖槽。 |
| `--xh-heatmap-tooltip-px` | `tooltip` | `padding-inline` | `default` | `--xh-space-2` | heatmap 的 tooltip 部件 padding-inline 覆盖槽。 |
| `--xh-heatmap-tooltip-py` | `tooltip` | `padding-block` | `default` | `--xh-space-1` | heatmap 的 tooltip 部件 padding-block 覆盖槽。 |
| `--xh-heatmap-tooltip-radius` | `tooltip` | `border-radius` | `default` | `--xh-shape-control` | heatmap 的 tooltip 部件 border-radius 覆盖槽。 |
| `--xh-heatmap-tooltip-shadow` | `tooltip` | `box-shadow` | `default` | `--xh-elevation-floating` | heatmap 的 tooltip 部件 box-shadow 覆盖槽。 |
| `--xh-heatmap-week-day-skip` | `root`<br>`week-day` | `color` | `week-day=0`<br>`week-day=2`<br>`week-day=4`<br>`week-day=6` | `transparent` | heatmap 的 root、week-day 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 横轴沿 inline 排开，整页切成 rtl 时视觉次序整体翻转，左右方向键的语义跟着翻，上下键不受影响。
- 方向从 DOM 现读，祖先链上任意一处 `dir` 或 CSS `direction` 都算数；`dir` 属性只作显式覆盖。
- 详情条的落点也按逻辑方向量：rtl 下从末缘往回量，样式侧只写一条 `inset-inline-start` 就两向通用。

## 组合

- 详情条不引浮层引擎，也就不参与浮层的层级与关闭协议：它按 root 的内边距盒绝对定位，跟着网格一起横向滚动，摆上边还是摆下边按格子的行序定，因此始终压在网格自己身上。条比一格宽得多，格子末缘之前的地方比起始缘之后多时它就改从末缘往回长，不越过滚动容器的末缘——否则整年铺开时后三分之一的格子悬停出来的条会被裁掉，横向滚动条还会跟着一伸一缩。挑的是两侧空间大的那一边，与条自己多宽无关（条的宽在量落点那一刻还拿不到：内容马上要换，收起时又是 `display:none`）；容器窄到条比大的那一侧还宽时，条仍会被裁掉一截，两侧都摆不下是没有解的。要一条会翻转、会避让视口的真浮层，请自己在格子上挂[提示](./tooltip)。
- 与[日历](./calendar)并排：一个看分布、一个挑日期。

## 最佳实践

- 图例两端的那两个词照默认铺出来就好；要换成「少 / 多」或别的说法改 `translations.legendLow` / `legendHigh`，别把它们删掉——只给一排色块，读者猜不出深色是多还是少。
- 深浅不是唯一线索：数值必须在文案里说清楚，否则色觉障碍的用户什么都读不到。
- 一张图只挑一条轴：要表达「这一族数据是告警」就写 `tone`，要表达「这张图用绿色」就写 `palette`，两个都写只会让读代码的人猜哪个赢。同一页并排的几张图更要统一，混着写会让读者以为颜色有语义。
- 色板换的只是颜色不是语义：`palette="red"` 的格子不代表这些天出了问题，那层意思只能靠标题与文案说。
- 数据里出现极端值时自己给 `thresholds`，按最大值均分会把其余格子全压到第 0、1 档，整张图变成一片空白加一个亮点。
- 一屏放不下就让网格自己横向滚动，不要把格子压到看不清。整年在 `md` 档要 774px 上下，`sm` 档 660px 上下，容器窄于这个数就会出横向滚动条。
- 键盘走到视口外的格子时网格会自己滚过去，落点已经让开钉住的那一列；给 root 另加内边距或换 `--xh-heatmap-gutter` 时不必再管这件事，两处读的是同一个值。
- 矩阵的列名与它下面那一列的格子同宽：标签长就整体调大 `--xh-heatmap-column-w`，别只把标签撑开——撑开的标签会与格子错位。
- 调宽了列就一并调高行：只给 `--xh-heatmap-column-w` 而不给 `--xh-heatmap-row-h`，格子会横着拉成细条。两个值配到 1.5 : 1 上下最好读，一屏放不下就减列不要压扁行。
- 矩阵的行列顺序就是渲染顺序，按你希望读者阅读的次序给，别指望组件替你排。
- 月历形态里上下键走的是「上一周 / 下一周同一天」，跨得过月块：从一月块最后一行按 ↓ 会落到二月块里，而月块是并排换行的，视觉上像往右上方跳了一下。要按块阅读就用左右键，它逐日走、次序与肉眼一致。矩阵形态没有这回事，它的行列是无序的类目，上下键到边即停。

## 反模式

- 拿它当日期选择器：格子不可点、没有选中语义，点开一个浮层去改值属于另一件事。
- 一次铺好几年：列数上千以后既看不出节奏，键盘也走不到头。
- 只用颜色不给文案：一张没有可及名字的方格阵，对读屏用户等于一片空白。
- 把详情条当唯一的信息出口：它对读屏是藏起来的，只写在那里等于只给鼠标用户看。
- 矩阵形态里指望组件从数据里猜出行列：轴上没有的行列，数据里写了也不进网格。
