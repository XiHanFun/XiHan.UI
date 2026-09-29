来源：https://ui.docs.xihanfun.com/components/heatmap

# Heatmap 热力图

按网格铺开的强度图：一格是一个观测点，颜色深浅表示数值所在的档位。三种形态共用同一套分档、色阶、图例与详情条，只是格子的排列方式不同：连续周列的一年日历、按自然月分块的月历、行列由作者提供的矩阵。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/heatmap" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/heatmap.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/heatmap" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/heatmap" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/heatmap.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一整年铺为周列 × 星期行的方格阵，颜色深浅表示当天数值所在的档位

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
<!-- 装热力图的这一层是 flex / grid 项时，会被一整年的网格撑到内容宽；
     给它 min-width: 0，网格才收进容器宽度、自己横着滚 -->
<div id="heatmap-basic-mount" style="min-width: 0"></div>

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

## 组件结构

加粗的是必需部件。

`data-scope="heatmap"`：**`root`** · **`grid`** · `month-block` · `row` · `week-day` · `month-label` · `row-label` · `column-label` · `cell` · `tooltip` · `legend` · `legend-label` · `legend-item`

## 示例

### 语气换色

tone 决定使用哪族颜色，色阶两端随之更换，格子的分档不变

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

palette 直接按颜色指定，取基础色板同名色相的满档一端；分档与空格底色都不变

```vue
<script setup lang="ts">
import type { HeatmapPalette } from "@xihan-ui/headless";
import { XhHeatmapRoot } from "@xihan-ui/vue";

// 同一份数据按色板各铺一遍，肉眼比的就只有颜色这一件事
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

const palettes: HeatmapPalette[] = ["red", "orange", "amber", "yellow", "lime", "green", "teal", "cyan", "blue", "indigo", "purple", "pink", "gray"];
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
  // 同一份数据按色板各铺一遍，肉眼比的就只有颜色这一件事
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

  const palettes = ["red", "orange", "amber", "yellow", "lime", "green", "teal", "cyan", "blue", "indigo", "purple", "pink", "gray"];

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

size 改变格子边长与行首星期名的留白，一屏能放下的周数随之变化

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

<!-- 元素不生成结构：外壳只写 root，一整年的月份行、七行星期与图例由脚本照 grid 铺。
     宿主自己就是 grid 项，min-width: 0 写在它身上，放不下的那一档才在栏内横着滚 -->
<template id="heatmap-size-template">
  <xh-heatmap start-date="2024-01-01" end-date="2024-12-31" style="min-width: 0">
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

焦点落到某一天时报告日期与计数，键盘用户与鼠标用户看到同一份明细

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

按自然月分块，每块是一张真实月历，1 号落在它实际的星期几上

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

行列都由作者提供，数据按行列定位而不按日期：星期 × 时段的活跃度

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

指针悬停与键盘聚焦经同一条路径：详情条跟随该格，Escape 收起

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
<div id="heatmap-detail-mount" style="min-width: 0"></div>

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

一排按钮切换的是区间，网格、月份段、色阶与锚点全部按新区间重新计算

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
  <div id="heatmap-year-mount" style="min-width: 0"></div>
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

总天数、空白天数与占比、最大值、平均值都从网格模型直接读取，不必再遍历一遍数据

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
  <div id="heatmap-stats-mount" style="min-width: 0"></div>
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

### 发散色阶

数据里有负数时以 0 为中点分两侧着色：相关系数矩阵，负相关与正相关各走一种颜色

```vue
<script setup lang="ts">
import { XhHeatmapRoot } from "@xihan-ui/vue";

const metrics = ["时长", "页数", "跳出", "转化"];
// 对角线是自己和自己，恒为 1；其余两两之间在 ±1 之间
const correlation = [
  { row: "时长", column: "时长", value: 1 },
  { row: "时长", column: "页数", value: 0.72 },
  { row: "时长", column: "跳出", value: -0.65 },
  { row: "时长", column: "转化", value: 0.41 },
  { row: "页数", column: "时长", value: 0.72 },
  { row: "页数", column: "页数", value: 1 },
  { row: "页数", column: "跳出", value: -0.58 },
  { row: "页数", column: "转化", value: 0.36 },
  { row: "跳出", column: "时长", value: -0.65 },
  { row: "跳出", column: "页数", value: -0.58 },
  { row: "跳出", column: "跳出", value: 1 },
  { row: "跳出", column: "转化", value: -0.47 },
  { row: "转化", column: "时长", value: 0.41 },
  { row: "转化", column: "页数", value: 0.36 },
  { row: "转化", column: "跳出", value: -0.47 },
  { row: "转化", column: "转化", value: 1 },
];
</script>

<template>
  <!-- 不必写 scale：出现负数即按发散色阶，对照条两端的文字缺省就是两侧最远的数 -->
  <XhHeatmapRoot
    variant="matrix"
    :rows="metrics"
    :columns="metrics"
    :value="correlation"
    style="--xh-heatmap-column-w: 44px; --xh-heatmap-row-h: 28px"
  />
</template>
```

```html
<!-- 对照条两侧各一排：polarity 标明在中点哪一侧，次序与 legendItems 一致；两端文字是两侧最远的数，与 legendText 一致 -->
<xh-heatmap id="heatmap-diverging" variant="matrix">
  <div data-xh-part="root" style="--xh-heatmap-column-w: 44px; --xh-heatmap-row-h: 28px">
    <div data-xh-part="grid">
      <div data-xh-part="row">
        <span data-xh-part="row-label"></span>
        <span data-xh-part="column-label" value="时长">时长</span>
        <span data-xh-part="column-label" value="页数">页数</span>
        <span data-xh-part="column-label" value="跳出">跳出</span>
        <span data-xh-part="column-label" value="转化">转化</span>
      </div>
      <div data-xh-part="row" value="时长">
        <span data-xh-part="row-label" value="时长">时长</span>
        <div data-xh-part="cell" value="时长"></div>
        <div data-xh-part="cell" value="页数"></div>
        <div data-xh-part="cell" value="跳出"></div>
        <div data-xh-part="cell" value="转化"></div>
      </div>
      <div data-xh-part="row" value="页数">
        <span data-xh-part="row-label" value="页数">页数</span>
        <div data-xh-part="cell" value="时长"></div>
        <div data-xh-part="cell" value="页数"></div>
        <div data-xh-part="cell" value="跳出"></div>
        <div data-xh-part="cell" value="转化"></div>
      </div>
      <div data-xh-part="row" value="跳出">
        <span data-xh-part="row-label" value="跳出">跳出</span>
        <div data-xh-part="cell" value="时长"></div>
        <div data-xh-part="cell" value="页数"></div>
        <div data-xh-part="cell" value="跳出"></div>
        <div data-xh-part="cell" value="转化"></div>
      </div>
      <div data-xh-part="row" value="转化">
        <span data-xh-part="row-label" value="转化">转化</span>
        <div data-xh-part="cell" value="时长"></div>
        <div data-xh-part="cell" value="页数"></div>
        <div data-xh-part="cell" value="跳出"></div>
        <div data-xh-part="cell" value="转化"></div>
      </div>
    </div>
    <div data-xh-part="legend">
      <span data-xh-part="legend-label" value="low">-1</span>
      <span data-xh-part="legend-item" value="4" polarity="negative"></span>
      <span data-xh-part="legend-item" value="3" polarity="negative"></span>
      <span data-xh-part="legend-item" value="2" polarity="negative"></span>
      <span data-xh-part="legend-item" value="1" polarity="negative"></span>
      <span data-xh-part="legend-item" value="0"></span>
      <span data-xh-part="legend-item" value="1" polarity="positive"></span>
      <span data-xh-part="legend-item" value="2" polarity="positive"></span>
      <span data-xh-part="legend-item" value="3" polarity="positive"></span>
      <span data-xh-part="legend-item" value="4" polarity="positive"></span>
      <span data-xh-part="legend-label" value="high">1</span>
    </div>
  </div>
</xh-heatmap>

<script type="module">
  // 对角线是自己和自己，恒为 1；其余两两之间在 ±1 之间
  const heatmap = document.getElementById("heatmap-diverging");
  heatmap.rows = ["时长", "页数", "跳出", "转化"];
  heatmap.columns = ["时长", "页数", "跳出", "转化"];
  heatmap.value = [
    { row: "时长", column: "时长", value: 1 },
    { row: "时长", column: "页数", value: 0.72 },
    { row: "时长", column: "跳出", value: -0.65 },
    { row: "时长", column: "转化", value: 0.41 },
    { row: "页数", column: "时长", value: 0.72 },
    { row: "页数", column: "页数", value: 1 },
    { row: "页数", column: "跳出", value: -0.58 },
    { row: "页数", column: "转化", value: 0.36 },
    { row: "跳出", column: "时长", value: -0.65 },
    { row: "跳出", column: "页数", value: -0.58 },
    { row: "跳出", column: "跳出", value: 1 },
    { row: "跳出", column: "转化", value: -0.47 },
    { row: "转化", column: "时长", value: 0.41 },
    { row: "转化", column: "页数", value: 0.36 },
    { row: "转化", column: "跳出", value: -0.47 },
    { row: "转化", column: "转化", value: 1 },
  ];
</script>
```

### 连续色阶

着色按数值的确切比例，不按档位取整：挤在同一档里的几格也分得出高低

```vue
<script setup lang="ts">
import { XhHeatmapRoot } from "@xihan-ui/vue";

const rooms = ["华北", "华东", "华南"];
const hours = ["00", "04", "08", "12", "16", "20"];
// 各机房逐时段的 CPU 利用率（%）：午间几格落在同一档，分档画出来一样深
const utilization = [
  { row: "华北", column: "00", value: 31 },
  { row: "华北", column: "04", value: 28 },
  { row: "华北", column: "08", value: 57 },
  { row: "华北", column: "12", value: 74 },
  { row: "华北", column: "16", value: 69 },
  { row: "华北", column: "20", value: 48 },
  { row: "华东", column: "00", value: 35 },
  { row: "华东", column: "04", value: 30 },
  { row: "华东", column: "08", value: 62 },
  { row: "华东", column: "12", value: 81 },
  { row: "华东", column: "16", value: 77 },
  { row: "华东", column: "20", value: 55 },
  { row: "华南", column: "00", value: 29 },
  { row: "华南", column: "04", value: 26 },
  { row: "华南", column: "08", value: 54 },
  { row: "华南", column: "12", value: 70 },
  { row: "华南", column: "16", value: 72 },
  { row: "华南", column: "20", value: 51 },
];
</script>

<template>
  <!-- 档位照常算：读屏与打印仍按档报，只有颜色走连续比例 -->
  <XhHeatmapRoot
    variant="matrix"
    continuous
    :rows="rooms"
    :columns="hours"
    :value="utilization"
    style="--xh-heatmap-column-w: 36px; --xh-heatmap-row-h: 28px"
  />
</template>
```

```html
<!-- 档位照常算：读屏与打印仍按档报，只有颜色走连续比例 -->
<xh-heatmap id="heatmap-continuous" variant="matrix" continuous>
  <div data-xh-part="root" style="--xh-heatmap-column-w: 36px; --xh-heatmap-row-h: 28px">
    <div data-xh-part="grid">
      <div data-xh-part="row">
        <span data-xh-part="row-label"></span>
        <span data-xh-part="column-label" value="00">00</span>
        <span data-xh-part="column-label" value="04">04</span>
        <span data-xh-part="column-label" value="08">08</span>
        <span data-xh-part="column-label" value="12">12</span>
        <span data-xh-part="column-label" value="16">16</span>
        <span data-xh-part="column-label" value="20">20</span>
      </div>
      <div data-xh-part="row" value="华北">
        <span data-xh-part="row-label" value="华北">华北</span>
        <div data-xh-part="cell" value="00"></div>
        <div data-xh-part="cell" value="04"></div>
        <div data-xh-part="cell" value="08"></div>
        <div data-xh-part="cell" value="12"></div>
        <div data-xh-part="cell" value="16"></div>
        <div data-xh-part="cell" value="20"></div>
      </div>
      <div data-xh-part="row" value="华东">
        <span data-xh-part="row-label" value="华东">华东</span>
        <div data-xh-part="cell" value="00"></div>
        <div data-xh-part="cell" value="04"></div>
        <div data-xh-part="cell" value="08"></div>
        <div data-xh-part="cell" value="12"></div>
        <div data-xh-part="cell" value="16"></div>
        <div data-xh-part="cell" value="20"></div>
      </div>
      <div data-xh-part="row" value="华南">
        <span data-xh-part="row-label" value="华南">华南</span>
        <div data-xh-part="cell" value="00"></div>
        <div data-xh-part="cell" value="04"></div>
        <div data-xh-part="cell" value="08"></div>
        <div data-xh-part="cell" value="12"></div>
        <div data-xh-part="cell" value="16"></div>
        <div data-xh-part="cell" value="20"></div>
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
  // 各机房逐时段的 CPU 利用率（%）：午间几格落在同一档，分档画出来一样深
  const heatmap = document.getElementById("heatmap-continuous");
  heatmap.rows = ["华北", "华东", "华南"];
  heatmap.columns = ["00", "04", "08", "12", "16", "20"];
  heatmap.value = [
    { row: "华北", column: "00", value: 31 },
    { row: "华北", column: "04", value: 28 },
    { row: "华北", column: "08", value: 57 },
    { row: "华北", column: "12", value: 74 },
    { row: "华北", column: "16", value: 69 },
    { row: "华北", column: "20", value: 48 },
    { row: "华东", column: "00", value: 35 },
    { row: "华东", column: "04", value: 30 },
    { row: "华东", column: "08", value: 62 },
    { row: "华东", column: "12", value: 81 },
    { row: "华东", column: "16", value: 77 },
    { row: "华东", column: "20", value: 55 },
    { row: "华南", column: "00", value: 29 },
    { row: "华南", column: "04", value: 26 },
    { row: "华南", column: "08", value: 54 },
    { row: "华南", column: "12", value: 70 },
    { row: "华南", column: "16", value: 72 },
    { row: "华南", column: "20", value: 51 },
  ];
</script>
```

### 按下下钻

点一格或焦点在格上按 Enter，报告那一格：据此打开明细

```vue
<script setup lang="ts">
import type { HeatmapCellDetails } from "@xihan-ui/headless";
import { XhHeatmapRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const days = ["周一", "周二", "周三"];
const slots = ["上午", "下午", "夜里"];
const orders = [
  { row: "周一", column: "上午", value: 12 },
  { row: "周一", column: "下午", value: 30 },
  { row: "周一", column: "夜里", value: 8 },
  { row: "周二", column: "上午", value: 26 },
  { row: "周二", column: "下午", value: 18 },
  { row: "周二", column: "夜里", value: 4 },
  { row: "周三", column: "上午", value: 6 },
  { row: "周三", column: "下午", value: 34 },
  { row: "周三", column: "夜里", value: 15 },
];

const picked = ref<HeatmapCellDetails | null>(null);
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-3); justify-items: start">
    <!-- 载荷与详情同源：行、列、原始值与档位都在里面，不必回头查数据 -->
    <XhHeatmapRoot
      variant="matrix"
      :rows="days"
      :columns="slots"
      :value="orders"
      style="--xh-heatmap-column-w: 44px; --xh-heatmap-row-h: 28px"
      @cell-press="picked = $event"
    />
    <p aria-live="polite" style="margin: 0">
      {{ picked ? `${picked.row} ${picked.column}：${picked.count} 单` : "点一格查看明细" }}
    </p>
  </div>
</template>
```

```html
<div style="display: grid; gap: var(--xh-space-3); justify-items: start">
  <xh-heatmap id="heatmap-press" variant="matrix">
    <div data-xh-part="root" style="--xh-heatmap-column-w: 44px; --xh-heatmap-row-h: 28px">
      <div data-xh-part="grid">
        <div data-xh-part="row">
          <span data-xh-part="row-label"></span>
          <span data-xh-part="column-label" value="上午">上午</span>
          <span data-xh-part="column-label" value="下午">下午</span>
          <span data-xh-part="column-label" value="夜里">夜里</span>
        </div>
        <div data-xh-part="row" value="周一">
          <span data-xh-part="row-label" value="周一">周一</span>
          <div data-xh-part="cell" value="上午"></div>
          <div data-xh-part="cell" value="下午"></div>
          <div data-xh-part="cell" value="夜里"></div>
        </div>
        <div data-xh-part="row" value="周二">
          <span data-xh-part="row-label" value="周二">周二</span>
          <div data-xh-part="cell" value="上午"></div>
          <div data-xh-part="cell" value="下午"></div>
          <div data-xh-part="cell" value="夜里"></div>
        </div>
        <div data-xh-part="row" value="周三">
          <span data-xh-part="row-label" value="周三">周三</span>
          <div data-xh-part="cell" value="上午"></div>
          <div data-xh-part="cell" value="下午"></div>
          <div data-xh-part="cell" value="夜里"></div>
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
  <p id="heatmap-press-output" aria-live="polite" style="margin: 0">点一格查看明细</p>
</div>

<script type="module">
  const heatmap = document.getElementById("heatmap-press");
  heatmap.rows = ["周一", "周二", "周三"];
  heatmap.columns = ["上午", "下午", "夜里"];
  heatmap.value = [
    { row: "周一", column: "上午", value: 12 },
    { row: "周一", column: "下午", value: 30 },
    { row: "周一", column: "夜里", value: 8 },
    { row: "周二", column: "上午", value: 26 },
    { row: "周二", column: "下午", value: 18 },
    { row: "周二", column: "夜里", value: 4 },
    { row: "周三", column: "上午", value: 6 },
    { row: "周三", column: "下午", value: 34 },
    { row: "周三", column: "夜里", value: 15 },
  ];

  // 载荷与详情同源：行、列、原始值与档位都在里面，不必回头查数据
  const output = document.getElementById("heatmap-press-output");
  heatmap.addEventListener("cell-press", (event) => {
    const { row, column, count } = event.detail;
    output.textContent = `${row} ${column}：${count} 单`;
  });
</script>
```

## 设计指引

### 何时使用

- 查看一段连续日期上的多少分布，以及是否存在成片的空档。
- 查看逐月分布，月与月之间需要对齐比较。
- 查看两条离散坐标交叉产生的强度：“星期 × 小时”的活跃度、“品类 × 月份”的销量、相关系数矩阵。
- 强调节奏与分布，而不是某一格的准确数值。

### 何时不用

- 需要选择日期或区间时，使用[日历选择器](./calendar-picker)或[日历范围选择器](./calendar-range-picker)，它们才有选中语义与表单出口。
- 需要读取准确数字、排序或筛选时，使用[表格](./table)。
- 只报告一个总量或同比时，使用[统计数值](./statistic)。

### 特性

- 典型用法是一整年：`calendar` 形态给出整年的起止日期，铺出 53 个周列 × 7 行。以下各条的取值都按这个尺度确定。
- 三种形态由 `variant` 切换，默认 `calendar`：
  - `calendar`：连续周列 × 星期行，月份名浮在网格上沿作为坐标轴，适合查看整年的节奏；
  - `month`：按自然月分块，每块是一张真实月历，1 号落在真实的星期位置，适合查看逐月分布；连续周列看不出月界，这是它存在的理由；
  - `matrix`：行列都由作者通过 `rows` / `columns` 提供，数据按 `(row, column)` 定位，与日期无关。
- 矩阵形态的格子两向分别度量：宽度使用 `--xh-heatmap-column-w`，高度使用 `--xh-heatmap-row-h`，两者都不使用日历形态的 `--xh-heatmap-cell-size`。日历尺按一年五十多列确定，矩阵的行首挂着行名，格子按它定高会矮于行名，行高由行名文字决定、格子在行内拉成细条。行高未设置时取格宽尺的两倍（sm 16px / md 20px / lg 24px），每一档都高于行名文字；列宽未设置时取行高，默认格子为正方形。行高不使用控件高度尺：该尺用于可交互控件在一行内对齐，矩阵格子不可交互，接入后密度档切换会导致矩阵变形。
- 月份名与星期名跟随 `locale`：未提供时跟随宿主浏览器语言，读取失败时使用 `en-US`。周首日由 `firstDayOfWeek` 单独决定，默认星期一。
- 数据接受两种形状之一，按是否含 `date` 区分：日期形态写 `{ date, count }`，矩阵形态写 `{ row, column, value }`。同一格出现多次即累加。
- 日期只接受 ISO 的 `YYYY-MM-DD` 串，加减以 UTC 计算，不引入日期库。
- 区间起点不在周首日时会错列，两种日期形态的口径不同：`calendar` 是排在起点星期之前的整行向后错一列，`month` 是本月首格错到 1 号真实的星期位置。两者都不铺没有日期的占位格。
- 月份名落在该月首日所在的列上；一列跨两个月时整列归后一个月。1 号极少正好是周首日，按列内首日所在月分段会使十二个月份名中的九个整体晚一列，读者顺着“2 月”向下看反而错过月初几天。第 0 列是唯一例外，它按区间首日所在的月归属：起点落在月末（如 `2024-01-29` 起的近 365 天）时该列只露出上月末尾几天，跟随末日会使首月没有名字。代价是这种区间中第二个月的名字排在第 1 列，比 1 号所在的第 0 列晚一列。
- 一整年放不下一屏时网格横向滚动，行首的星期名列固定在起始缘不随之滚动（矩阵形态的行名同理）。固定列自带 `--xh-bg-surface` 的底色，整块放在其他底色上（卡片、分区）时需要改写 `--xh-heatmap-bg`，否则该列会形成色块。月历形态例外：月块换行排列，宽度不超过容器，不作为滚动容器，也没有固定列。
- 三张网格的推导都是纯函数（`buildHeatmapGrid` / `buildHeatmapMonthGrid` / `buildHeatmapMatrixGrid`），可脱离组件单独调用以预生成数据。
- 格距四周相同：数据行的高度固定为格子边长，不由行首星期名的文字撑开。三档尺寸的横向与纵向格距是同一个值（默认 4px），格子 sm 8px / md 10px / lg 12px。
- 行首的星期名隔行绘制：只保留第 0/2/4/6 行之外的三行，周首日是星期一时是“二 / 四 / 六”，是星期日时是“一 / 三 / 五”。一行只有 10px 高而字号是 12px，七个连续书写会上下重叠；隔行后每个保留的字有两行高度可用。三档尺寸一致，不随档位变化。需要七行全部绘制时把 `--xh-heatmap-week-day-skip` 改为可见颜色，例如 `var(--xh-heatmap-label-fg, var(--xh-fg-subtle))`（此时 `sm` 档会较为紧凑）。跳过的是文字着色而不是盒子：节点、文字、盒子与底色都在，固定列的实色底不能缺四行，否则格子会从行首透出，那四行也会不再参与命中测试。
- 色阶对照条两端各有一个词（默认 `Less` `More`），一排色块本身无法说明哪端表示多。文案使用 `translations.legendLow` / `legendHigh`，部件是 `legend-label`（`value` 为 `low` 或 `high`）；Vue 侧不写默认插槽时两端自动铺出，WC 侧从元素的 `legendText` 属性读取。
- 配色有两条路径，默认为品牌色。一条是 `tone` 语气轴（brand / neutral / success / warning / danger / info），与其他组件共用；另一条是 `palette` 色板轴（基础色板的十二个色相 red / orange / amber / yellow / lime / green / teal / cyan / blue / indigo / purple / pink，加上 gray），直接按颜色指定，满档取同名色相的 600 档。色板只决定色阶满档一端的实心底，0 档的空格底与中间各档的混合方式不变，也不参与语气层的悬停 / 淡底 / 前景派生；它是装饰性的轴，不是语义轴。两者都写时以色板为准：色板指定了具体颜色，语气只能推导出颜色。
- 色阶有两种，由 `scale` 切换：`sequential` 顺序色阶从空格底到满档单向加深；`diverging` 发散色阶以 `midpoint`（缺省 0）为界，低于中点兑向负向色、高于中点兑向正向色，中点那一格是中性的中点色。不写 `scale` 时按数据定：出现负数即按发散色阶，相关系数、同比涨跌、盈亏这类有正有负的数据不必额外声明；显式写 `sequential` 时负数照旧落第 0 档。发散色阶取数据色的发散三色（`--xh-chart-diverging-negative` / `-center` / `-positive`，组件槽 `--xh-heatmap-diverging-*` 可单独改写），`tone` 与 `palette` 在这一档不生效：两侧的含义由中点决定，不由语气决定。两侧共用同一套档数，按离中点最远的距离均分，离中点同样远的正负两格深浅相同；格子与详情带 `polarity`（`negative` / `positive`，中点那一格为 null）。对照条随之从负向满档经中点排到正向满档，两端文字缺省是两侧最远的那两个数。打印时两侧同档的环一样粗，负向一侧改用点线区分。
- `continuous` 打开连续色阶：着色按数值在色阶上的确切比例，不按档位取整，挤在同一档里的几格也分得出高低。档位照常计算，格子的 `data-level`、打印纹理与可访问名称里的档位都不变；对照条仍是分档的色块，作为刻度参照。
- 一格被按下时（指针点击，或焦点在格上按 Enter）派发 `onCellPress`，载荷与详情同源（日期或行列、原始值、档位、侧别、在色阶中的位置），用来下钻到那一天或那一对行列；事件名 `cell-press`，与图表家族的 `onDatumPress` 同一口径。它只报告按下，不产生选中状态。
- 档数可调：未提供 `thresholds` 时把有数据的那几档在 (0, 最大值] 上等宽分开（分界取整、逐档至少加 1），提供时以其为准。分档由图表引擎的分档比例尺完成；`thresholds` 里有重复或不是有限数的值时剔除并在诊断通道报 `chart.invalid-range`，档数按剩下的算。
- 在图外报告“总天数 / 空白天数与占比 / 最大值 / 平均值”不需要再次遍历数据：三张网格都带 `max`（最大值）、`total`（总和）与 `emptyCount`（值为 0 的格子数），格子总数从 `cells.size` 读取。`emptyCount` 统计值为 0 的格子：没有数据的日期与写了 0 的日期都计入。它不是色阶第 0 档的格子数：未提供 `thresholds` 时首个下界始终为 1，两个数相等；提供 `thresholds` 后第 0 档还会包含低于首个下界的非零值，两个数不再相等。
- 悬停或键盘聚焦到某一格时显示详情条，内容由作者编写；组件只提供身份、位置与该格的数据（日期或行列、原始值、档位、在色阶中的位置）。详情条与对照条走 Chart 家族配方：详情条是与其余图表提示框同一副 frosted 材质、overlay 圆角与正文排版，不反白，`--xh-heatmap-tooltip-bg` / `-fg` / `-border` 只换颜色那一层，顶部的边界光与背景模糊照旧。
- 首次出现时网格、星期名、月份名与对照条原样在场，有颜色的格子从空格底色填到自己的档位色，按日期先后（矩阵按列先后）一路扫过去；数据晚于挂载到达（异步取数，或 Web Components 连上之后才赋 `value`）时同样播这段填色，网格一格颜色都没有时不播。之后的数据变化让各格从旧档的颜色过渡到新档，只在这一段过渡，主题、语气与色板的换色照常一步到位。扫描取 `--xh-motion-duration-reveal`，每格的填色取 `--xh-motion-duration-enter`，数据变化取 `--xh-motion-duration-morph`，在图或它的容器上改写它们只影响这张图。`animated={false}`（Web Components 写 `animated="false"`）关闭过渡；系统开了减弱动效或容器写了 `data-motion="reduce"` 时不再逐格扫过去，各格一起淡变填色，数据变化直接换色。
- 语气与尺寸两轴与其他组件同源；色板轴是热力图独有的。
- 两个适配器的作者侧写法不同，最终 DOM 一致：Vue 侧不写默认插槽时按形态自动铺开整棵树，另有 `cell` 插槽向每格放入内容（三种形态都铺，载荷是日历格或矩阵格，用 `'date' in cell` 区分）、`tooltip` 插槽编写详情条内容（写了才铺出详情条）；Web Components 侧元素不生成任何结构，各部件由作者写进标记，元素只按部件名打属性。
- Web Components 侧铺一整年不需要手写三百多个格子：`<xh-heatmap>` 上有 `grid` / `monthGrid` / `matrixGrid` 三个只读属性，分别对应三种形态推导出的网格（行、列、月份段、星期名、档位标尺都在其中），按其循环生成节点即可；元素连接后即可读取，接线在此之后进行，当场铺出的格子能被接上。每次读取都重算整张网格，读取一次后缓存使用。两个插槽是 Vue 专属，WC 侧通过 `cell-active` 事件自行填充详情条。
- 自行编写默认插槽铺网格时，锚点从载荷的 `focusedCell` / `anchorCell` 读取、用 `setFocusedCell` 移动：这一组三种形态通用，带 `Date` 的一组在矩阵形态下始终为 null。

从其他库迁移时的对照表。左列是那些库写在 `color-theme` 上的取值，右侧是本库的色板轴。色板取基础色板的色相，语气轴取的是语气色（专表好坏），两者的颜色不再相同：只想换颜色时写色板，颜色本身带好坏含义时才写语气：

| 其他库的 `color-theme` | 色板轴 | 满档实心底取的原语 |
| --- | --- | --- |
| `green` | `palette="green"` | `--xh-color-green-600` |
| `blue` | `palette="blue"` | `--xh-color-blue-600` |
| `orange` | `palette="orange"` | `--xh-color-orange-600` |
| `purple` | `palette="purple"` | `--xh-color-purple-600` |
| `red` | `palette="red"` | `--xh-color-red-600` |
| 其余色相 | `palette="amber"` 等十二个色相名 | `--xh-color-<色相>-600` |
| （多数库没有） | `palette="gray"` | `--xh-color-neutral-600`；深色态换 `--xh-color-neutral-450` |
| （多数库默认为绿） | 不写 | `--xh-bg-brand`，跟随使用者的品牌色 |

- 灰色是唯一按主题换档的一族：十二个色相的 600 档明度都是 0.546，深色态的空格底（`neutral-800`，明度 0.269）距离足够；中性 600 档只有 0.439，五档均分后每档只差 0.0425、相邻两档对比度 1.16–1.20，几乎无法分辨。因此深色态改取 `neutral-450`（明度 0.65），步长回到 0.095、相邻两档 1.42–1.50，不输彩色族；不取更亮的 `neutral-400` 是因为高对比档的 `border-default` 正是该档，满档格子的描边会与底色同色。`tone="neutral"` 没有这层处理，需要灰色热力图时写 `palette="gray"`。
- 色板之外的颜色可以直接指定：改写 `--xh-heatmap-ink`（满档的实心底）与 `--xh-heatmap-empty`（0 档的空格底），中间各档由两端在 oklab 中混合。这个入口优先级最高，色板与语气都不能覆盖它。

### 组合

- 详情条不引入浮层引擎，也不参与浮层的层级与关闭协议：它按 root 的内边距盒绝对定位，随网格一起横向滚动，摆在上方还是下方按格子的行序决定，因此始终压在网格自身上。条比一格宽得多，格子末缘之前的空间比起始缘之后多时它改从末缘反向延伸，不越过滚动容器的末缘；否则整年铺开时后三分之一的格子悬停出的条会被裁掉，横向滚动条也会随之伸缩。选择的是两侧空间较大的一边，与条自身的宽度无关（条的宽度在计算落点时尚不可得：内容即将替换，收起时又是 `display:none`）；容器窄到条比较大的一侧还宽时，条仍会被裁掉一截，两侧都放不下时没有解。需要会翻转、会避让视口的真正浮层时，在格子上挂[文字提示](./tooltip)。
- 与[日历选择器](./calendar-picker)并排：一个查看分布，一个选择日期。

### 最佳实践

- 图例两端的词按默认铺出即可；需要换成“少 / 多”或其他说法时改 `translations.legendLow` / `legendHigh`，不要删除，只有一排色块时读者无法判断深色的含义。
- 深浅不是唯一线索：数值必须在文案中说明，否则色觉障碍的用户无法读取。
- 一张图只选一条轴：表达“这一族数据是告警”时写 `tone`，表达“这张图使用绿色”时写 `palette`，两者都写会让读者猜测优先级。同一页并排的几张图更要统一，混用会让读者以为颜色有语义。
- 色板只改变颜色不改变语义：`palette="red"` 的格子不代表这些天出了问题，该含义只能由标题与文案表达。
- 数据中出现极端值时自行提供 `thresholds`，按最大值均分会把其余格子全部压到第 0、1 档，整张图变成一片空白加一个亮点。
- 数据有天然的中点时（相关系数的 0、目标完成率的 100%）写 `scale="diverging"` 与 `midpoint`，读者一眼分得出“高于”与“低于”；只有大小没有方向的数据（次数、时长）用顺序色阶，强行分两侧会让读者以为低于中点是坏事。
- 一屏放不下时让网格横向滚动，不要把格子压到无法辨认。整年在 `md` 档约需 774px，`sm` 档约 660px，容器窄于该值会出现横向滚动条。
- 键盘移动到视口外的格子时网格会自动滚动，落点已避开固定列；为 root 另加内边距或更换 `--xh-heatmap-gutter` 时不需要再处理，两处读取同一个值。
- 矩阵的列名与其下一列的格子同宽：标签较长时整体调大 `--xh-heatmap-column-w`，不只撑开标签，否则标签会与格子错位。
- 调宽列时一并调高行：只设置 `--xh-heatmap-column-w` 而不设置 `--xh-heatmap-row-h`，格子会横向拉成细条。两个值在 1.5 : 1 左右最易读，一屏放不下时减少列数而不压扁行。
- 矩阵的行列顺序就是渲染顺序，按希望读者阅读的次序提供，组件不排序。
- 月历形态中上下键移动的是“上一周 / 下一周同一天”，可以跨月块：从一月块最后一行按 ↓ 会落到二月块，而月块并排换行，视觉上像向右上方跳动。按块阅读时使用左右键，它逐日移动、次序与视觉一致。矩阵形态没有这种情况，它的行列是无序类目，上下键到边即停。

### 反模式

- 将它用作日期选择器：格子只报告按下（`onCellPress`），没有选中语义，也不保留按下过哪一格。
- 一次铺多年：列数上千后既看不出节奏，键盘也无法走到尽头。
- 只用颜色不提供文案：没有可访问名称的方格阵对读屏用户等于空白。
- 把详情条作为唯一的信息出口：它对读屏隐藏，只写在那里等于只提供给鼠标用户。
- 矩阵形态中期望组件从数据推断行列：轴上没有的行列，数据中写了也不进入网格。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-heatmap>` |
| Vue 组件 | `XhHeatmapCell` `XhHeatmapColumnLabel` `XhHeatmapGrid` `XhHeatmapLegend` `XhHeatmapLegendItem` `XhHeatmapLegendLabel` `XhHeatmapMonthBlock` `XhHeatmapMonthLabel` `XhHeatmapRoot` `XhHeatmapRow` `XhHeatmapRowLabel` `XhHeatmapTooltip` `XhHeatmapWeekDay` |
| 组合式函数 | `useHeatmap` |
| 状态机 | `heatmapMachine` |
| 皮肤 | `@xihan-ui/styles/heatmap.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `variant` | `HeatmapVariant` |  | 形态：calendar 连续周列、month 按自然月分块、matrix 行列由作者提供；默认 calendar。 |
| `value` | `HeatmapValue[]` |  | 数据。日期形态接受 { date, count }，矩阵形态接受 { row, column, value }；同一格出现多次即累加。 |
| `rows` | `HeatmapAxisInput[]` |  | 矩阵的行，顺序即渲染顺序；只写身份或身份与文本分开写均可。 |
| `columns` | `HeatmapAxisInput[]` |  | 矩阵的列，顺序即渲染顺序。 |
| `startDate` | `string` |  | 区间起点（含），ISO YYYY-MM-DD。未提供或非法时为空网格。 |
| `endDate` | `string` |  | 区间终点（含）。早于起点即空网格。 |
| `levels` | `number` |  | 档数，默认 5；提供 thresholds 时档数由它决定。 |
| `thresholds` | `number[]` |  | 各档的下界，升序；提供后 levels 不再生效。发散色阶里它是离中点的距离，两侧共用。 |
| `scale` | `HeatmapScaleMode` |  | 色阶：sequential 从空格底色单向加深；diverging 以 midpoint 为界往两侧各自加深， 低于中点取负向色、高于中点取正向色（相关系数、同比涨跌、盈亏）。缺省按数据定：出现负数即 diverging。 发散色阶取数据色的发散三色，tone 与 palette 不再生效。 |
| `midpoint` | `number` |  | 发散色阶的中点，缺省 0。 |
| `continuous` | `boolean` |  | 连续色阶：不分档，按数值在色阶上的确切位置着色；档位照常算，打印与读屏仍按档。缺省 false。 |
| `firstDayOfWeek` | `number` |  | 周首日，0 = 星期日，默认 1。 |
| `locale` | `string` |  | 月份名与星期名的书写 locale，未提供时按宿主语言，宿主也没有时按 en-US。 |
| `dir` | `Direction` |  | 文字方向。只作显式覆盖：未提供时方向从 DOM 读取， 左右方向键的语义跟随视觉次序，上下键与它无关。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `palette` | `HeatmapPalette` |  | 色板：基础色板的十二个色相加 gray，直接指定色阶满档一端的颜色；同时提供 tone 时以色板为准。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `animated` | `boolean` |  | 播放过渡，默认开：首次出现时有数据的格子按先后从空格底色填到自己的档位色， 之后的数据变化从旧档的颜色过渡到新档。关闭后直接画终态。 |
| `translations` | `Partial<HeatmapTranslations>` |  |  |
| `onCellFocus` | `(details: HeatmapCellFocusDetails) => void` |  | DOM 焦点落到某一格时通知一次；同一格重复聚焦不重复通知。 只由真实的聚焦触发，程序化移动锚点（`setFocusedCell`）不派发该回调。 |
| `onCellActive` | `(details: HeatmapCellDetails \| null) => void` |  | 详情应显示哪一格：指针悬停或键盘聚焦都会走到这里，收起时为 null。 详情条的内容由作者决定，组件只报告是哪一格、数值多少。 |
| `onCellPress` | `(details: HeatmapCellDetails) => void` |  | 一格被按下：指针点击，或焦点在格上按 Enter。载荷与 onCellActive 同形， 用来下钻到那一天或那一对行列。Space 不接，照常滚动页面。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `cell-focus` | `HeatmapCellFocusDetails` | 焦点落到某一格；detail 为 `{ date, row, column, count, level, polarity, percent }` |
| `cell-active` | `HeatmapCellDetails` | 详情应显示哪一格（悬停或聚焦）；收起时 detail 为 null |
| `cell-press` | `HeatmapCellDetails` | 点按一格，或焦点在格上按 Enter；detail 与 cell-focus 同形 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhHeatmapRoot` | `default` | `HeatmapRootSlotProps` |  |
| `XhHeatmapRoot` | `cell` | `HeatmapCellSlotProps` | 铺开网格时每一格的内容插槽，默认是空格子；三种形态都铺设。 |
| `XhHeatmapRoot` | `tooltip` | `HeatmapCellDetails \| null` | 详情条的内容插槽；写了它才会铺设 tooltip 部件。 |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhHeatmapCell` | `value` | `string` | 是 | 日期形态是 ISO 日期，矩阵形态是列身份。 |
| `XhHeatmapCell` | `row` | `string` |  | 矩阵形态：行身份；写在行中时不必再写一遍。 |
| `XhHeatmapColumnLabel` | `value` | `string` | 是 | 列身份。 |
| `XhHeatmapLegendItem` | `value` | `number \| string` | 是 | 档位，兼收字符串。 |
| `XhHeatmapLegendItem` | `polarity` | `HeatmapPolarity` |  | 发散色阶下这一格在中点的哪一侧；顺序色阶与中点那一格不写。 |
| `XhHeatmapLegendLabel` | `value` | `HeatmapLegendBound` | 是 | 挂在哪一端：low 是色阶起点，high 是终点。 |
| `XhHeatmapMonthBlock` | `value` | `string` | 是 | 月份身份 YYYY-MM。 |
| `XhHeatmapMonthLabel` | `value` | `string` | 是 | 月份身份 YYYY-MM。 |
| `XhHeatmapRoot` | `renderCell` | `(cell: HeatmapCellSlotProps) => ReactNode` |  | 铺开网格时每一格的内容；未提供时是空格子。 |
| `XhHeatmapRoot` | `renderTooltip` | `(details: HeatmapCellDetails \| null) => ReactNode` |  | 详情条的内容；提供后才铺设 tooltip 部件。 |
| `XhHeatmapRoot` | `children` | `SlotChildren<HeatmapRootSlotProps>` |  |  |
| `XhHeatmapRow` | `value` | `number \| string` |  | 行的身份。日历形态是行序 0-6，月历形态是月内第几周，矩阵形态是行身份； 未写即坐标轴行。 |
| `XhHeatmapRow` | `month` | `string` |  | 月历形态：所属月份 YYYY-MM；写在月块中时不必再写一遍。 |
| `XhHeatmapRowLabel` | `value` | `string` |  | 行身份；未写即表头行行首的角落占位。 |
| `XhHeatmapWeekDay` | `value` | `number \| string` |  | 行序 0-6；未提供即坐标轴行行首的占位。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `tooltip` | 'hidden' \| 'visible' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`CELL.FOCUS` · `CELL.BLUR` · `CELL.ENTER` · `CELL.LEAVE` · `DETAIL.DISMISS` · `FOCUS.SET` · `TRANSITION.END`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `variant` | `HeatmapVariant` | 当前形态。 |
| `scaleMode` | `HeatmapScaleMode` | 生效的色阶：显式给的，或按数据定出来的。 |
| `legendItems` | `readonly HeatmapLegendEntry[]` | 对照条上的一排，作者按它逐个铺 legend-item：顺序色阶从第 0 档到满档， 发散色阶从负向满档经中点到正向满档。 |
| `grid` | `HeatmapGrid` | 日历网格：行是星期几、列是周次，另带月份段、星期名与档位标尺。其余形态下是一张空网格。 |
| `monthGrid` | `HeatmapMonthGrid \| null` | 月历网格：按自然月分块；不是 month 形态时为 null。 |
| `matrixGrid` | `HeatmapMatrixGrid \| null` | 矩阵网格：行列由作者提供；不是 matrix 形态时为 null。 |
| `focusedCell` | `HeatmapCellRef \| null` | 最后一次被聚焦的格；从未聚焦过时为 null。 |
| `focusedDate` | `string \| null` | 最后一次被聚焦的日期；矩阵形态下恒为 null。 |
| `anchorCell` | `HeatmapCellRef \| null` | 当前占据 Tab 位的格：锚点仍在网格中即为它，否则回退为文档序首格。 |
| `anchorDate` | `string \| null` | 当前占据 Tab 位的日期；矩阵形态下恒为 null。 |
| `activeCell` | `HeatmapCellDetails \| null` | 详情应显示的格的数据：身份、原始值、档位与色阶位置；不显示时为 null。 |
| `detailOpen` | `boolean` | 详情条当前是否显示。 |
| `legendText` | `{ low: string, high: string }` | 对照条两端的文字，作者按它渲染 legend-label 部件。 与 `getLegendLabelProps` 同源，修改 translations 两处一起变化。 |
| `cellAt` | `(date: string) => HeatmapCellMeta \| null` | 按日期取一格；不在区间内时为 null。矩阵形态下恒为 null。 |
| `setFocusedCell` | `(cell: HeatmapCellRef \| null) => void` | 移动锚点。只改锚点不移动 DOM 焦点，也不派发 `onCellFocus`； 需要焦点跟随时自行调用元素的 focus()。 |
| `setFocusedDate` | `(date: string \| null) => void` | 按日期移动锚点，等同于 `setFocusedCell({ date })`。 |
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

## 无障碍

### 键盘

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
| `Enter` | focus in grid | 按下焦点那一格：报告它（onCellPress，载荷与详情同源），用来下钻；Space 不接，照常滚动页面 |

### ARIA

以下属性由 `connect` 生成。

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
| `cell` | `aria-label` | matrixCellLabel({ date: '', row, column, count, ...pl… |
| `cell` | `role` | 'gridcell' |
| `tooltip` | `aria-hidden` | 'true' |
| `legend` | `aria-label` | translations?.legendLabel |
| `legend` | `role` | 'group' |
| `legend-item` | `aria-hidden` | 'true' |

- 网格是 `role="grid"` 且 `aria-readonly`，每行一个 `role="row"`，每格一个 `role="gridcell"`。
- 月历形态中一个自然月是一个 `role="rowgroup"`，块的可访问名称是该月的完整名称；块内的星期名坐标轴整条 `aria-hidden`，读屏看到的每一块只有合法的行。
- 矩阵形态中行名是 `role="rowheader"`、列名是 `role="columnheader"`，表头行行首的角落占位 `aria-hidden`；行列总数把两条表头计入，读屏报告的行列号才正确。
- 格子内没有文字，可访问名称完全由文案拼出：日期形态使用 `translations.cellLabel`（日期 + 数值），矩阵形态使用 `translations.matrixCellLabel`（行 + 列 + 数值），务必按本地语言改写。
- 星期名、月份名与图例中的色块都是视觉坐标轴，一律 `aria-hidden`：每格自身能读出完整身份与数值，再读一遍轴只是噪音。
- 日历形态中星期名隔行绘制，视觉上可以根据上下文推断被跳过的行：因此每一行自带 `aria-label`，写的是该行星期的全称（如“星期一”）。这个名称跟随 `locale`、不进 `translations`，读的就是坐标轴上的词，两处必须逐字一致（月块的名称同理）。它只是补充：`role="row"` 上的名称并非所有读屏在方向键导航时都播报，而每一格的可访问名称本就带完整日期。
- 图例整体是 `role="group"`，名称使用 `translations.legendLabel`。两端的词是真实文字、不隐藏，因此能说明色阶的方向；深色表示多还是少是约定而非自明。
- 详情条 `aria-hidden`：它显示的信息与格子的可访问名称是同一份，读两遍反而干扰。因此详情条内不能出现可访问名称中没有的内容，否则读屏用户会缺少信息。
- 各行格子数不一定相同（首行可能少一格），格子上带 `aria-colindex`，读屏报出的列号才正确。
- 整张网格只占一个 Tab 位，进入后靠方向键移动。键盘聚焦与指针悬停触发同一条详情：只支持悬停会把键盘与读屏用户排除在外。
- Escape 收起详情条但不拦截按键：外层浮层的关闭仍由其自身处理。
- Enter 按下焦点那一格（`onCellPress`），与点击同一条路径；Space 不接，照常滚动页面。
- 发散色阶不只靠颜色区分两侧：每格的可访问名称写的是带符号的原始值，详情条同理；色觉障碍的读者依然读得出正负。

## 样式参考

### 皮肤

`@xihan-ui/styles/heatmap.css` 使用 `[data-scope="heatmap"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-animating` | ''（条件成立时才出现） |
| `root` | `data-palette` | props.palette |
| `root` | `data-scale` | 'diverging' \| undefined |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `row` | `data-week` | String(row.week) |
| `row` | `data-week-day` | undefined \| String(row.weekDay) |
| `week-day` | `data-week-day` | undefined \| String(label.weekDay) |
| `cell` | `data-drawing` | ''（条件成立时才出现） |
| `cell` | `data-highlighted` | ''（条件成立时才出现） |
| `cell` | `data-level` | String(place.level) |
| `cell` | `data-polarity` | place.polarity |
| `tooltip` | `data-inline-anchor` | undefined \| tip.inlineAnchor |
| `tooltip` | `data-placement` | undefined \| ((): 'block-start' \| 'block-end' =&gt; { if (activeRef =… |
| `tooltip` | `data-state` | 'hidden' \| 'visible' |
| `tooltip` | `data-xh-chart-part` | 'tooltip' |
| `legend` | `data-xh-chart-part` | 'legend' |
| `legend-label` | `data-bound` | label.bound |
| `legend-item` | `data-level` | String(item.level) |
| `legend-item` | `data-polarity` | item.polarity |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-heatmap-bg` | `root`<br>`row-label`<br>`week-day` | `background` | `default` | `--xh-bg-surface` | heatmap 的 root、row-label、week-day 部件 background 覆盖槽。 |
| `--xh-heatmap-block-gap` | `grid`<br>`root` | `gap` | `variant=month` | `--xh-_heatmap-gutter` | heatmap 的 grid、root 部件 gap 覆盖槽。 |
| `--xh-heatmap-block-inner-gap` | `month-block` | `gap` | `default` | `--xh-_heatmap-gap` | heatmap 的 month-block 部件 gap 覆盖槽。 |
| `--xh-heatmap-cell-bg` | `cell`<br>`legend-item` | `background` | `default` | `--xh-_heatmap-ink` | heatmap 的 cell、legend-item 部件 background 覆盖槽。 |
| `--xh-heatmap-cell-border` | `cell`<br>`legend-item` | `box-shadow` | `default` | `--xh-border-default` | heatmap 的 cell、legend-item 部件 box-shadow 覆盖槽。 |
| `--xh-heatmap-cell-border-highlighted` | `cell` | `box-shadow` | `highlighted` | `--xh-fg-default` | heatmap 的 cell 部件 box-shadow 覆盖槽。 |
| `--xh-heatmap-cell-radius` | `cell`<br>`legend-item` | `border-radius` | `default` | `--xh-shape-inset` | heatmap 的 cell、legend-item 部件 border-radius 覆盖槽。 |
| `--xh-heatmap-cell-size` | `cell`<br>`legend-item`<br>`month-label`<br>`root`<br>`row`<br>`week-day` | `block-size`<br>`border`<br>`inline-size`<br>`margin-inline-start` | `@media print`<br>`default`<br>`first-child`<br>`level=1`<br>`level=2`<br>`level=3`<br>`size=lg`<br>`size=sm`<br>`variant=month`<br>`week`<br>`week-day` | `--xh-space-2`<br>`--xh-space-2_5`<br>`--xh-space-3` | heatmap 的 cell、legend-item、month-label、root、row、week-day 部件 block-size、border、inline-size、margin-inline-start 覆盖槽。 |
| `--xh-heatmap-column-w` | `cell`<br>`column-label`<br>`root` | `inline-size` | `default`<br>`variant=matrix` | `--xh-_heatmap-row-h` | heatmap 的 cell、column-label、root 部件 inline-size 覆盖槽。 |
| `--xh-heatmap-diverging-center` | `cell`<br>`legend-item`<br>`root` | `background`<br>`background-color` | `@keyframes xh-heatmap-fill`<br>`scale=diverging` | `--xh-chart-diverging-center` | heatmap 的 cell、legend-item、root 部件 background、background-color 覆盖槽。 |
| `--xh-heatmap-diverging-negative` | `cell`<br>`legend-item`<br>`root` | `background` | `is([data-scope='heatmap'][data-part='cell'], [data-scope='heatmap'][data-part='legend-item'])`<br>`polarity=negative`<br>`scale=diverging` | `--xh-chart-diverging-negative` | heatmap 的 cell、legend-item、root 部件 background 覆盖槽。 |
| `--xh-heatmap-diverging-positive` | `cell`<br>`legend-item`<br>`root` | `background` | `is([data-scope='heatmap'][data-part='cell'], [data-scope='heatmap'][data-part='legend-item'])`<br>`polarity=positive`<br>`scale=diverging` | `--xh-chart-diverging-positive` | heatmap 的 cell、legend-item、root 部件 background 覆盖槽。 |
| `--xh-heatmap-empty` | `cell`<br>`legend-item`<br>`root` | `background`<br>`background-color` | `@keyframes xh-heatmap-fill`<br>`default` | `--xh-bg-subtle-opaque` | heatmap 的 cell、legend-item、root 部件 background、background-color 覆盖槽。 |
| `--xh-heatmap-fg` | `root` | `color` | `default` | `--xh-fg-muted` | heatmap 的 root 部件 color 覆盖槽。 |
| `--xh-heatmap-font-size` | `root` | `font-size` | `default` | `--xh-_heatmap-font-size` | heatmap 的 root 部件 font-size 覆盖槽。 |
| `--xh-heatmap-gap` | `root` | `gap` | `default` | `--xh-space-2` | heatmap 的 root 部件 gap 覆盖槽。 |
| `--xh-heatmap-grid-gap` | `grid` | `gap` | `default` | `--xh-_heatmap-gap` | heatmap 的 grid 部件 gap 覆盖槽。 |
| `--xh-heatmap-gutter` | `grid`<br>`root`<br>`row-label`<br>`week-day` | `gap`<br>`inline-size`<br>`scroll-padding-inline-start` | `default`<br>`size=sm`<br>`variant=month` | `--xh-space-6`<br>`--xh-space-8` | heatmap 的 grid、root、row-label、week-day 部件 gap、inline-size、scroll-padding-inline-start 覆盖槽。 |
| `--xh-heatmap-ink` | `cell`<br>`legend-item`<br>`root` | `background` | `default`<br>`is([data-theme='dark'] *, [data-theme='dark'])`<br>`palette=amber`<br>`palette=blue`<br>`palette=cyan`<br>`palette=gray`<br>`palette=green`<br>`palette=indigo`<br>`palette=lime`<br>`palette=orange`<br>`palette=pink`<br>`palette=purple`<br>`palette=red`<br>`palette=teal`<br>`palette=yellow`<br>`theme=dark`<br>`tone` | `--xh-_tone`<br>`--xh-bg-brand`<br>`--xh-color-amber-600`<br>`--xh-color-blue-600`<br>`--xh-color-cyan-600`<br>`--xh-color-green-600`<br>`--xh-color-indigo-600`<br>`--xh-color-lime-600`<br>`--xh-color-neutral-450`<br>`--xh-color-neutral-600`<br>`--xh-color-orange-600`<br>`--xh-color-pink-600`<br>`--xh-color-purple-600`<br>`--xh-color-red-600`<br>`--xh-color-teal-600`<br>`--xh-color-yellow-600` | heatmap 的 cell、legend-item、root 部件 background 覆盖槽。 |
| `--xh-heatmap-label-fg` | `column-label`<br>`legend`<br>`month-label`<br>`root`<br>`row-label`<br>`week-day` | `color` | `default`<br>`variant=month`<br>`week-day=0`<br>`week-day=2`<br>`week-day=4`<br>`week-day=6` | `--xh-fg-subtle` | heatmap 的 column-label、legend、month-label、root、row-label、week-day 部件 color 覆盖槽。 |
| `--xh-heatmap-legend-gap` | `legend` | `gap` | `default` | `--xh-_heatmap-gap` | heatmap 的 legend 部件 gap 覆盖槽。 |
| `--xh-heatmap-py` | `root` | `padding-block` | `default` | `--xh-_heatmap-gap` | heatmap 的 root 部件 padding-block 覆盖槽。 |
| `--xh-heatmap-row-gap` | `row` | `gap` | `default` | `--xh-_heatmap-gap` | heatmap 的 row 部件 gap 覆盖槽。 |
| `--xh-heatmap-row-h` | `cell`<br>`column-label`<br>`root` | `block-size`<br>`inline-size` | `default`<br>`size=lg`<br>`size=sm`<br>`variant=matrix` | `--xh-space-4`<br>`--xh-space-5`<br>`--xh-space-6` | heatmap 的 cell、column-label、root 部件 block-size、inline-size 覆盖槽。 |
| `--xh-heatmap-sticky-layer` | `row-label`<br>`week-day` | `z-index` | `default` | `1` | heatmap 的 row-label、week-day 部件 z-index 覆盖槽。 |
| `--xh-heatmap-title-fg` | `month-label`<br>`root` | `color` | `variant=month` | `--xh-fg-default` | heatmap 的 month-label、root 部件 color 覆盖槽。 |
| `--xh-heatmap-tooltip-bg` | `tooltip` | `background-color` | `default` | `--xh-material-frosted-bg` | heatmap 的 tooltip 部件 background-color 覆盖槽。 |
| `--xh-heatmap-tooltip-border` | `tooltip` | `border-color` | `default` | `--xh-material-frosted-border` | heatmap 的 tooltip 部件 border-color 覆盖槽。 |
| `--xh-heatmap-tooltip-fg` | `tooltip` | `color` | `default` | `--xh-material-frosted-fg` | heatmap 的 tooltip 部件 color 覆盖槽。 |
| `--xh-heatmap-tooltip-font-size` | `tooltip` | `font-size` | `default` | `--xh-text-body-size` | heatmap 的 tooltip 部件 font-size 覆盖槽。 |
| `--xh-heatmap-tooltip-layer` | `tooltip` | `z-index` | `default` | `2` | heatmap 的 tooltip 部件 z-index 覆盖槽。 |
| `--xh-heatmap-tooltip-max-w` | `tooltip` | `max-inline-size` | `default` | `--xh-overlay-max-w` | heatmap 的 tooltip 部件 max-inline-size 覆盖槽。 |
| `--xh-heatmap-tooltip-px` | `tooltip` | `padding-inline` | `default` | `--xh-surface-pad-sm` | heatmap 的 tooltip 部件 padding-inline 覆盖槽。 |
| `--xh-heatmap-tooltip-py` | `tooltip` | `padding-block` | `default` | `--xh-surface-pad-sm` | heatmap 的 tooltip 部件 padding-block 覆盖槽。 |
| `--xh-heatmap-tooltip-radius` | `tooltip` | `border-radius` | `default` | `--xh-shape-overlay` | heatmap 的 tooltip 部件 border-radius 覆盖槽。 |
| `--xh-heatmap-tooltip-shadow` | `tooltip` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | heatmap 的 tooltip 部件 box-shadow 覆盖槽。 |
| `--xh-heatmap-week-day-skip` | `root`<br>`week-day` | `color` | `week-day=0`<br>`week-day=2`<br>`week-day=4`<br>`week-day=6` | `transparent` | heatmap 的 root、week-day 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：状态 · 出现（见[动效规范](../design/motion#角色)）。

关键帧 `xh-heatmap-fill` 随皮肤自带，不引用别处文件里的名字；`background-color` · `box-shadow` · `opacity` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 横轴沿 inline 方向排列，整页切换为 rtl 时视觉次序整体翻转，左右方向键的语义跟随翻转，上下键不受影响。
- 方向从 DOM 实时读取，祖先链上任意一处 `dir` 或 CSS `direction` 都有效；`dir` 属性只作显式覆盖。
- 详情条的落点也按逻辑方向计算：rtl 下从末缘反向度量，样式侧只写一条 `inset-inline-start` 即两向通用。
