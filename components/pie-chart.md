来源：https://ui.docs.xihanfun.com/components/pie-chart

# PieChart 饼图

一眼看出少量类目在整体中的占比。缺省画成环形，中心显示合计；也可以画成实心饼、上半环或按数值画半径的玫瑰图。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/pie-chart" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/pie-chart.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/pie-chart" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/pie-chart" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/pie-chart.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一行数据一个扇区：nameField 取扇区名字段，valueField 取数值字段；缺省画成环形，中心显示合计

```vue
<script setup lang="ts">
import { XhPieChartRoot } from "@xihan-ui/vue";

// 缺省按数值从大到小、自 12 点顺时针排列，外侧标签带引导线
const rows = [
  { channel: "搜索", visits: 4200 },
  { channel: "直接访问", visits: 2600 },
  { channel: "社交", visits: 1800 },
  { channel: "邮件", visits: 900 },
  { channel: "广告", visits: 500 },
];
</script>

<template>
  <XhPieChartRoot
    :data="rows"
    name-field="channel"
    value-field="visits"
  >
    <template #caption>访问来源</template>
  </XhPieChartRoot>
</template>
```

```html
<!-- 元素只认作者写的外壳：扇区、标签与图例项由它按数据生成进 plot 与 legend；center 留空时写入合计 -->
<!-- 宿主元素缺省是行内元素，放进 flex / grid 时给它一个宽度，图才铺得开 -->
<div style="width: 100%">
  <xh-pie-chart id="pie-chart-basic" name-field="channel" value-field="visits">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">访问来源</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="center"></div>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-pie-chart>
</div>

<script type="module">
  // 缺省按数值从大到小、自 12 点顺时针排列，外侧标签带引导线
  // 数据是数组，只走 property
  document.getElementById("pie-chart-basic").data = [
    { channel: "搜索", visits: 4200 },
    { channel: "直接访问", visits: 2600 },
    { channel: "社交", visits: 1800 },
    { channel: "邮件", visits: 900 },
    { channel: "广告", visits: 500 },
  ];
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="pie-chart"`：**`root`** · `caption` · `legend` · `legend-item` · `legend-swatch` · `legend-label` · **`viewport`** · **`plot`** · `slice` · `leader-line` · `slice-label` · `focus-ring` · `center` · `center-value` · `center-label` · `tooltip` · `tooltip-header` · `tooltip-row` · `tooltip-swatch` · `tooltip-value` · `tooltip-name` · `empty` · `summary` · `table`

## 示例

### 实心饼

variant="pie" 去掉中心的空洞；扇区装得下时把占比写在扇区里

```vue
<script setup lang="ts">
import { XhPieChartRoot } from "@xihan-ui/vue";

// labels="inside" 把占比写在扇区里，装不下的扇区不写
const rows = [
  { channel: "搜索", visits: 4200 },
  { channel: "直接访问", visits: 2600 },
  { channel: "社交", visits: 1800 },
  { channel: "邮件", visits: 900 },
  { channel: "广告", visits: 500 },
];
</script>

<template>
  <XhPieChartRoot
    :data="rows"
    name-field="channel"
    value-field="visits"
    variant="pie"
    labels="inside"
  >
    <template #caption>访问来源</template>
  </XhPieChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-pie-chart id="pie-chart-pie" name-field="channel" value-field="visits" variant="pie" labels="inside">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">访问来源</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="center"></div>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-pie-chart>
</div>

<script type="module">
  // labels="inside" 把占比写在扇区里，装不下的扇区不写
  // 数据是数组，只走 property
  document.getElementById("pie-chart-pie").data = [
    { channel: "搜索", visits: 4200 },
    { channel: "直接访问", visits: 2600 },
    { channel: "社交", visits: 1800 },
    { channel: "邮件", visits: 900 },
    { channel: "广告", visits: 500 },
  ];
</script>
```

### 自定义中心

center 插槽替换环形中心的缺省合计：这里写出结论，而不是再放一个数字

```vue
<script setup lang="ts">
import { XhPieChartRoot } from "@xihan-ui/vue";

const tasks = [
  { status: "已完成", count: 72 },
  { status: "进行中", count: 18 },
  { status: "未开始", count: 10 },
];

// 中心写的是「完成了多少」，读者不用自己去加
const done = Math.round((tasks[0]!.count / tasks.reduce((sum, t) => sum + t.count, 0)) * 100);
</script>

<template>
  <XhPieChartRoot :data="tasks" name-field="status" value-field="count" sort="none">
    <template #caption>本迭代任务</template>
    <template #center>
      <span :style="{ fontSize: 'var(--xh-text-heading-3-size)', fontWeight: 'var(--xh-font-weight-semibold)' }">{{ done }}%</span>
      <span :style="{ color: 'var(--xh-fg-muted)', fontSize: 'var(--xh-text-secondary-size)' }">已完成</span>
    </template>
  </XhPieChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-pie-chart id="pie-chart-center" name-field="status" value-field="count" sort="none">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">本迭代任务</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <!-- center 里写了内容就归作者，元素不再写入合计 -->
        <div data-xh-part="center">
          <span id="pie-chart-center-done" style="font-size: var(--xh-text-heading-3-size); font-weight: var(--xh-font-weight-semibold)"></span>
          <span style="color: var(--xh-fg-muted); font-size: var(--xh-text-secondary-size)">已完成</span>
        </div>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-pie-chart>
</div>

<script type="module">
  const tasks = [
    { status: "已完成", count: 72 },
    { status: "进行中", count: 18 },
    { status: "未开始", count: 10 },
  ];
  document.getElementById("pie-chart-center").data = tasks;
  // 中心写的是「完成了多少」，读者不用自己去加
  const done = Math.round((tasks[0].count / tasks.reduce((sum, t) => sum + t.count, 0)) * 100);
  document.getElementById("pie-chart-center-done").textContent = `${done}%`;
</script>
```

### 玫瑰图

rose 让角度均分、半径按数值：面积与数值成正比，适合各项差距悬殊时拉开层次

```vue
<script setup lang="ts">
import { XhPieChartRoot } from "@xihan-ui/vue";

// 季度有自然次序，sort="none" 按数据次序排，不按大小
const rows = [
  { quarter: "一季度", users: 120 },
  { quarter: "二季度", users: 210 },
  { quarter: "三季度", users: 340 },
  { quarter: "四季度", users: 460 },
];
</script>

<template>
  <XhPieChartRoot
    :data="rows"
    name-field="quarter"
    value-field="users"
    rose
    sort="none"
  >
    <template #caption>各季度新增用户（千人）</template>
  </XhPieChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-pie-chart id="pie-chart-rose" name-field="quarter" value-field="users" rose sort="none">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">各季度新增用户（千人）</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="center"></div>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-pie-chart>
</div>

<script type="module">
  // 季度有自然次序，sort="none" 按数据次序排，不按大小
  // 数据是数组，只走 property
  document.getElementById("pie-chart-rose").data = [
    { quarter: "一季度", users: 120 },
    { quarter: "二季度", users: 210 },
    { quarter: "三季度", users: 340 },
    { quarter: "四季度", users: 460 },
  ];
</script>
```

### 半环

sweep="half" 自 9 点扫到 3 点，高度只要一半，适合放在指标卡上方

```vue
<script setup lang="ts">
import { XhPieChartRoot } from "@xihan-ui/vue";

// 半环的圆心在弦上，合计整块放在弦的上方、内圈里
const rows = [
  { item: "已支出", amount: 62 },
  { item: "已冻结", amount: 18 },
  { item: "可用", amount: 20 },
];
</script>

<template>
  <XhPieChartRoot
    :data="rows"
    name-field="item"
    value-field="amount"
    sweep="half"
    sort="none"
  >
    <template #caption>预算执行</template>
  </XhPieChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-pie-chart id="pie-chart-half" name-field="item" value-field="amount" sweep="half" sort="none">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">预算执行</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="center"></div>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-pie-chart>
</div>

<script type="module">
  // 半环的圆心在弦上，合计整块放在弦的上方、内圈里
  // 数据是数组，只走 property
  document.getElementById("pie-chart-half").data = [
    { item: "已支出", amount: 62 },
    { item: "已冻结", amount: 18 },
    { item: "可用", amount: 20 },
  ];
</script>
```

### 「其他」合并

扇区多于 maxSlices 时最小的几块并成「其他」，排在最后、取中性色，提示框里列出被合并的各项

```vue
<script setup lang="ts">
import { XhPieChartRoot } from "@xihan-ui/vue";

// maxSlices 含「其他」那一块：这里保留 4 个省份加「其他」
const rows = [
  { province: "广东", orders: 3200 },
  { province: "浙江", orders: 2400 },
  { province: "江苏", orders: 2100 },
  { province: "山东", orders: 1300 },
  { province: "四川", orders: 800 },
  { province: "湖北", orders: 600 },
  { province: "福建", orders: 500 },
  { province: "河南", orders: 400 },
];
</script>

<template>
  <XhPieChartRoot
    :data="rows"
    name-field="province"
    value-field="orders"
    :max-slices="5"
  >
    <template #caption>各省订单占比</template>
  </XhPieChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-pie-chart id="pie-chart-other" name-field="province" value-field="orders" max-slices="5">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">各省订单占比</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="center"></div>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-pie-chart>
</div>

<script type="module">
  // maxSlices 含「其他」那一块：这里保留 4 个省份加「其他」
  // 数据是数组，只走 property
  document.getElementById("pie-chart-other").data = [
    { province: "广东", orders: 3200 },
    { province: "浙江", orders: 2400 },
    { province: "江苏", orders: 2100 },
    { province: "山东", orders: 1300 },
    { province: "四川", orders: 800 },
    { province: "湖北", orders: 600 },
    { province: "福建", orders: 500 },
    { province: "河南", orders: 400 },
  ];
</script>
```

### 数据更新

换一组数据时扇区从当前角度走到新角度；关掉动画后直接画终态

```vue
<script setup lang="ts">
import { XhButton, XhPieChartRoot, XhSwitch } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const channels = ["搜索", "直接访问", "社交", "邮件"];
const weeks = [
  { week: 1, visits: [4200, 2800, 1800, 1200] },
  { week: 2, visits: [3000, 3400, 2400, 1200] },
  { week: 3, visits: [3600, 2200, 3000, 1600] },
];

const index = ref(0);
const animated = ref(true);
const current = computed(() => weeks[index.value]!);
const rows = computed(() => channels.map((channel, i) => ({ channel, visits: current.value.visits[i] })));
</script>

<template>
  <div :style="{ display: 'grid', gap: 'var(--xh-space-4)', width: '100%' }">
    <div :style="{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--xh-space-4)' }">
      <XhButton @click="index = (index + 1) % weeks.length">
        换一组数据
      </XhButton>
      <label :style="{ display: 'flex', alignItems: 'center', gap: 'var(--xh-space-2)' }">
        <XhSwitch v-model:checked="animated" />
        动画
      </label>
    </div>
    <!-- 按数据次序排列：扇区不随数值换位，只在原处伸缩 -->
    <XhPieChartRoot
      :data="rows"
      name-field="channel"
      value-field="visits"
      sort="none"
      :animated="animated"
    >
      <template #caption>
        第 {{ current.week }} 周访问来源
      </template>
    </XhPieChartRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: var(--xh-space-4); width: 100%">
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--xh-space-4)">
    <xh-button id="pie-chart-transition-next">
      <button data-xh-part="root">换一组数据</button>
    </xh-button>
    <label style="display: flex; align-items: center; gap: var(--xh-space-2)">
      <xh-switch id="pie-chart-transition-animated" default-checked>
        <button data-xh-part="root">
          <span data-xh-part="thumb"></span>
        </button>
      </xh-switch>
      动画
    </label>
  </div>
  <!-- 按数据次序排列：扇区不随数值换位，只在原处伸缩 -->
  <xh-pie-chart id="pie-chart-transition" name-field="channel" value-field="visits" sort="none">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption" id="pie-chart-transition-caption"></figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="center"></div>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-pie-chart>
</div>

<script type="module">
  const chart = document.getElementById("pie-chart-transition");
  const caption = document.getElementById("pie-chart-transition-caption");
  const channels = ["搜索", "直接访问", "社交", "邮件"];
  const weeks = [
    { week: 1, visits: [4200, 2800, 1800, 1200] },
    { week: 2, visits: [3000, 3400, 2400, 1200] },
    { week: 3, visits: [3600, 2200, 3000, 1600] },
  ];
  let index = 0;

  function show() {
    const current = weeks[index];
    caption.textContent = `第 ${current.week} 周访问来源`;
    chart.data = channels.map((channel, i) => ({ channel, visits: current.visits[i] }));
  }

  show();
  document.getElementById("pie-chart-transition-next").addEventListener("click", () => {
    index = (index + 1) % weeks.length;
    show();
  });
  document.getElementById("pie-chart-transition-animated").addEventListener("checked-change", (event) => {
    chart.animated = event.detail.checked;
  });
</script>
```

## 设计指引

### 何时使用

- 整体由少数几部分构成，读者要看的是「哪一块大、大约占多少」：渠道构成、预算分配、问卷选项占比。
- 部分之和有意义，并且就是读者关心的那个整体。
- 与柱状图或表格并排，给出同一组数据的构成视角。

### 何时不用

- 类目多于 6 个：改用[直角坐标图](./cartesian-chart)的横向条形图，长度比角度容易比较。
- 要比较几个相近的数值（如 23% 与 25%）：角度差异难以分辨，改用条形图。
- 只有 2 个类目：使用[统计数值](./statistic)或[进度条](./progress)，一个百分比就够了。
- 数值有正有负，或部分之和不是一个有意义的整体：占比无从谈起。
- 看构成随时间的变化：使用直角坐标图的百分比堆叠面积，一串饼图读不出趋势。

### 特性

- 数据是对象数组，每行一个扇区：`nameField` 指定扇区名所在的字段，`valueField` 指定数值所在的字段。数值为负时报错并在根上写 `data-state="error"`；全部为 0 或全部隐藏时显示空态。
- 形态由 `variant` 切换：`donut` 环形（缺省），内半径是外半径的 0.6，中心显示可见扇区的合计；`pie` 实心饼，没有中心。
- 扇区缺省按数值从大到小排列，自 12 点方向顺时针；`sort="none"` 按数据次序。读者从 12 点开始顺时针读，最大的一块在最前面最容易比较。
- 超过 `maxSlices`（缺省 6，含「其他」）时，最小的几块并成「其他」，排在最后、取中性色；提示框里列出被合并的各项。只并入一项时不合并，保留它本身。
- 颜色按数据次序依次取分类色 1–8；次序变化（改 `sort`、隐藏扇区）不改变颜色，同一个类目在不同图里保持同色。
- `sweep="half"` 画成上半环（自 9 点扫到 3 点），适合放在指标卡上方；`rose` 画成南丁格尔玫瑰图：角度均分，半径按数值的平方根，面积与数值成正比。两者可以同时使用。
- 扇区标签由 `labels` 控制：`outside`（缺省）画在外侧、带两段式引导线，两侧各排一列，自上而下推开避免重叠，放不下时去掉最小扇区的标签；`inside` 把占比写在扇区里，扇区装不下时不写；`none` 不画。视口太窄、外侧标签会把饼挤得太小时，外侧标签整体不画，只靠图例与提示框。
- 相邻扇区之间留 `--xh-chart-gap`（2px）的表面缝，靠缝区分扇区而不是靠描边；缝宽沿半径保持不变。
- 悬停或键盘聚焦一个扇区时，其余扇区淡出到 `--xh-chart-dim-alpha`；被指着的扇区不位移、不放大，位移会改变读者对面积的判断。
- 图例一个扇区一项，点击切换显隐；隐藏的扇区从合计中移除，其余扇区的占比随之重新计算。
- 环形中心是 HTML 叠层，缺省显示合计与说明文字（`translations.centerLabel`，缺省 Total）；悬停、键盘聚焦或联动到一个扇区时换成它的占比与名字，离开后回到合计；Vue 用 `center` 插槽、React 用 `renderCenter`、Web Components 在 center 部件里写内容，都可以替换。
- `format` 指定数值格式（数字格式或函数），提示框、标签、中心合计与数据表共用；占比固定写成一位小数的百分数。
- 多张图接到同一个受控的 `activeKey` 上时，饼图按扇区名与其他图的类目对齐：在柱状图上悬停「华东」，饼图的「华东」扇区一起指示。
- `pending` 表示正在重新取数：保留上一帧、整体降低不透明度并在根上写 `aria-busy`。首次取数、手里还没有扇区时，空态写 `translations.loadingText`（缺省 Loading…）并转一个圈，取完仍没有数据才写 `emptyText`。
- 首次出现时整圈从起始角顺着扫开，标签与引导线等扫开的边缘到了才出现，环形中心等整圈扫完再淡入，合计从 0 数上去；之后的数据变化与图例切换从当前角度插值到新角度，合计从旧值滚到新值，隐藏的扇区收拢并淡出后才移除。按数据次序排列（`sort="none"`）时扇区不换位，只在原处伸缩。
- `animated={false}`（Web Components 写 `animated="false"`）关闭过渡，数据一变直接画终态。系统开了减弱动效或容器写了 `data-motion="reduce"` 时几何直接到位，只保留淡入淡出。视口尺寸变化后的重排不播过渡。
- 过渡的快慢由动效令牌决定，组件从绘图区的计算样式读取：入场取 `--xh-motion-duration-reveal`（缺省 640ms），数据更新与图例切换取 `--xh-motion-duration-morph`（缺省 400ms）。在图或它的容器上改写它们，例如 `style="--xh-motion-duration-reveal: 1s"`，只影响这张图；入场的曲线取 `--xh-motion-ease-enter-strong`，更新取 `--xh-motion-ease-continuous`。
- 三个适配器的作者侧写法不同，最终 DOM 一致：Vue 与 React 不写默认内容时铺开缺省结构（标题、图例、视口与绘图区、环形中心、空态、提示框）；Web Components 侧作者写外壳（root、caption、legend、viewport 与其中空的 `<svg>` plot，可选 center、empty 与 tooltip），扇区、标签与图例项由元素生成进去。
- Web Components 侧的数据与数值格式只走 JS property；字段名、形态、次序、`max-slices`、标签与 `active-key` 另有同名属性。宿主元素缺省是行内元素，放进 flex / grid 时要给它一个宽度。

### 最佳实践

- 为图写标题：`caption` 是图的可访问名称，饼图尤其需要说明「整体」是什么。
- 扇区保持在 5 个以内；更多的类目交给「其他」，或者换成条形图。
- 需要读出准确数字时，把 `labels` 留在 `outside`，或者在旁边放一张[表格](./table)。
- 环形中心写整体的合计或一个结论（如「完成 72%」），不要再放一张小图。
- 同一页的几张饼图要比较时，保持相同的 `sort` 与颜色次序，读者才能按位置对照。

### 反模式

- 用 3D 饼图或把扇区拉出来强调：透视与位移都会歪曲面积。
- 用多张饼图表达时间变化：读者要在几张图之间来回比角度，改用堆叠面积或条形图。
- 占比之和不是 100% 的数据（多选题的选择率）：扇区面积没有含义。
- 把图例当作读取数值的唯一途径：数值要能从标签、提示框、摘要或数据表读到。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-pie-chart>` |
| Vue 组件 | `XhPieChartCaption` `XhPieChartCenter` `XhPieChartEmpty` `XhPieChartLegend` `XhPieChartPlot` `XhPieChartRoot` `XhPieChartTooltip` `XhPieChartViewport` |
| 组合式函数 | `usePieChart` |
| 状态机 | `pieChartMachine` |
| 皮肤 | `@xihan-ui/styles/pie-chart.css` |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `hidden-series-change` | `ChartHiddenSeriesChangeDetails` | 图例切换显隐；detail 为 `{ hiddenSeries: string[] }` |
| `active-key-change` | `ChartActiveKeyChangeDetails` | 指针或键盘换了激活的扇区；detail 为 `{ activeKey }`，收起时为 null |
| `datum-active` | `ChartDatumDetails` | 悬停或聚焦到某个扇区；detail 为扇区详情，收起时为 null |
| `datum-press` | `ChartDatumDetails` | 指针点击、Enter 或 Space 按在某个扇区上；detail 为扇区详情 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPieChartCenter` | `default` | `PieChartCenterSlotProps` |  |
| `XhPieChartRoot` | `default` | `PieChartRootSlotProps` | 自行摆放部件；不写时铺开缺省结构：图例、视口（绘图区、环形中心与空态）、提示框。 |
| `XhPieChartRoot` | `caption` | — | 缺省结构里的标题内容。 |
| `XhPieChartRoot` | `center` | `PieChartCenterSlotProps` | 缺省结构里的环形中心内容。 |
| `XhPieChartRoot` | `tooltip` | `PieChartTooltipSlotProps` | 缺省结构里的提示框内容。 |
| `XhPieChartRoot` | `empty` | — | 缺省结构里的空态内容。 |
| `XhPieChartTooltip` | `default` | `PieChartTooltipSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhPieChartCenter` | `children` | `SlotChildren<PieChartCenterSlotProps>` |  | 替换缺省内容；函数式 children 拿到合计与激活的扇区。 |
| `XhPieChartRoot` | `data` | `readonly ChartRow[]` |  | 数据：对象数组，每行一个扇区。 |
| `XhPieChartRoot` | `nameField` | `string` |  | 扇区名所在的字段。 |
| `XhPieChartRoot` | `valueField` | `string` |  | 数值所在的字段。 |
| `XhPieChartRoot` | `variant` | `PieVariant` |  | 形态，缺省 donut。 |
| `XhPieChartRoot` | `rose` | `boolean` |  | 南丁格尔玫瑰图：角度均分，半径按数值。 |
| `XhPieChartRoot` | `sweep` | `PieSweep` |  | 扫过的角度，缺省 full。 |
| `XhPieChartRoot` | `sort` | `PieSort` |  | 扇区次序，缺省 descending。 |
| `XhPieChartRoot` | `maxSlices` | `number` |  | 最多保留几个扇区（含「其他」），缺省 6。 |
| `XhPieChartRoot` | `labels` | `PieLabels` |  | 扇区标签，缺省 outside。 |
| `XhPieChartRoot` | `format` | `NumberFormatSpec \| ((value: number) => string)` |  | 数值格式。 |
| `XhPieChartRoot` | `hiddenSeries` | `string[]` |  | 隐藏的扇区（受控）。 |
| `XhPieChartRoot` | `defaultHiddenSeries` | `string[]` |  | 初始隐藏的扇区（非受控）。 |
| `XhPieChartRoot` | `activeKey` | `ChartKey \| null` |  | 激活的键（受控）：与别的图联动时是类目名。 |
| `XhPieChartRoot` | `pending` | `boolean` |  | 数据重取中：保留上一帧、整体降低不透明度。 |
| `XhPieChartRoot` | `animated` | `boolean` |  | 播放过渡动画，缺省 true；false 时直接画终态。 |
| `XhPieChartRoot` | `locale` | `string` |  |  |
| `XhPieChartRoot` | `translations` | `Partial<PieChartTranslations>` |  |  |
| `XhPieChartRoot` | `onHiddenSeriesChange` | `PieChartProps['onHiddenSeriesChange']` |  |  |
| `XhPieChartRoot` | `onActiveKeyChange` | `PieChartProps['onActiveKeyChange']` |  |  |
| `XhPieChartRoot` | `onDatumActive` | `PieChartProps['onDatumActive']` |  |  |
| `XhPieChartRoot` | `onDatumPress` | `PieChartProps['onDatumPress']` |  |  |
| `XhPieChartRoot` | `caption` | `ReactNode` |  | 缺省结构里的标题内容。 |
| `XhPieChartRoot` | `renderCenter` | `(props: PieChartCenterSlotProps) => ReactNode` |  | 缺省结构里的环形中心内容。 |
| `XhPieChartRoot` | `renderTooltip` | `(props: PieChartTooltipSlotProps) => ReactNode` |  | 缺省结构里的提示框内容。 |
| `XhPieChartRoot` | `empty` | `ReactNode` |  | 缺省结构里的空态内容。 |
| `XhPieChartRoot` | `children` | `SlotChildren<PieChartRootSlotProps>` |  | 自行摆放部件；不写时铺开缺省结构：图例、视口（绘图区、环形中心与空态）、提示框。 |
| `XhPieChartTooltip` | `children` | `SlotChildren<PieChartTooltipSlotProps>` |  | 替换缺省内容；函数式 children 拿到激活的扇区与缺省的内容模型。 |

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
| `model` | `PieModel` | 管线产物：扇区、布局、场景与无障碍模型。 |
| `scene` | `Scene` | 要画的场景；尚未测量时为空场景。 |
| `overlay` | `PieOverlay` | 前景层：焦点环画在扇区之上。 |
| `measured` | `boolean` | 视口尚未测量（服务端与首帧）。 |
| `empty` | `boolean` | 没有可画的数据（全部为 0、没有数据或全部隐藏）。 |
| `legendItems` | `readonly PieLegendItem[]` |  |
| `active` | `ChartDatumDetails \| null` | 激活的扇区；没有时为 null。 |
| `tooltip` | `PieTooltipModel \| null` | 提示框内容；收起时为 null。 |
| `center` | `{ readonly value: string, readonly label: string }` | 环形中心的缺省内容：可见扇区的合计与说明文字。 |
| `summary` | `string` |  |
| `table` | `TableModel` | 数据表模型：扇区名、数值、占比三列。 |
| `emptyText` | `string` |  |
| `tableCaption` | `string` |  |
| `activeKey` | `ChartKey \| null` |  |
| `hiddenSeries` | `string[]` |  |
| `toggleSeries` | `(id: string) => void` | 切换某个扇区的显隐。 |
| `setFocusedDatum` | `(ref: { seriesId: string, index: number } \| null) => void` | 移动键盘锚点：只改锚点，不移动 DOM 焦点，也不派发回调。 |
| `markTag` | `(mark: Mark) => PieMarkTag` |  |
| `getRootProps` | `() => T['element']` |  |
| `getCaptionProps` | `() => T['element']` |  |
| `getLegendProps` | `() => T['element']` |  |
| `getLegendItemProps` | `(item: PieLegendItem) => T['button']` |  |
| `getLegendSwatchProps` | `(item: PieLegendItem) => T['element']` |  |
| `getLegendLabelProps` | `(item: PieLegendItem) => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getPlotProps` | `() => T['element']` |  |
| `getMarkProps` | `(mark: Mark) => T['element']` |  |
| `getCenterProps` | `() => T['element']` |  |
| `getCenterValueProps` | `() => T['element']` |  |
| `getCenterLabelProps` | `() => T['element']` |  |
| `getTooltipProps` | `() => T['element']` |  |
| `getTooltipHeaderProps` | `() => T['element']` |  |
| `getTooltipRowProps` | `(row: PieTooltipRow) => T['element']` |  |
| `getTooltipSwatchProps` | `(row: PieTooltipRow) => T['element']` |  |
| `getTooltipValueProps` | `(row: PieTooltipRow) => T['element']` |  |
| `getTooltipNameProps` | `(row: PieTooltipRow) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` |  |
| `getSummaryProps` | `() => T['element']` |  |
| `getTableProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | 总是 | 绘图区只占一个 Tab 位：焦点落到锚点扇区，首次为 12 点方向的第一个扇区；图例同样只占一个 Tab 位 |
| `ArrowRight` / `ArrowDown` | 焦点在绘图区 | 顺时针移到下一个扇区；已在最后一个则原地不动 |
| `ArrowLeft` / `ArrowUp` | 焦点在绘图区 | 逆时针移到上一个扇区 |
| `Home` | 焦点在绘图区 | 第一个扇区 |
| `End` | 焦点在绘图区 | 最后一个扇区 |
| `Enter` / `Space` | 焦点在绘图区 | 报告聚焦的扇区（onDatumPress） |
| `Escape` | 提示框显示着 | 收起提示框，焦点留在原处；按键不拦截，外层浮层的关闭仍归它自己 |
| `ArrowLeft` / `ArrowRight` / `Home` / `End` | 焦点在图例 | 在图例项之间移动，左右键跟随文字方向的视觉次序 |
| `Enter` / `Space` | 焦点在图例项 | 切换该扇区的显隐（原生按钮行为） |

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

- 根是 `<figure>`，可访问名称来自 `caption`；不放标题时在根上写 `aria-label`。
- 绘图区是 `role="graphics-document"`，`aria-describedby` 指向组件生成的摘要；每个扇区是 `role="graphics-symbol"`，名称取 `translations.datumLabel`（缺省「名字, 数值, 占比」），务必按本地语言改写。
- 绘图区只占一个 Tab 位，焦点落在扇区上；右键与下键顺时针走到下一个扇区，左键与上键逆时针，Home / End 到第一个与最后一个。焦点环画在扇区之外，只在键盘聚焦时出现。
- 引导线、扇区标签与环形中心都 `aria-hidden` 或不在可访问树中：它们的内容已在扇区的名称里；提示框同样 `aria-hidden`。
- 组件在根内生成一段摘要与一张数据表，视觉隐藏、对读屏可见：摘要写扇区数、合计以及最大与最小的扇区（模板是 `translations.summary`），数据表三列是扇区名、数值与占比。
- 图例是 `role="toolbar"`，每一项是 `<button aria-pressed>`，按下表示扇区可见；图例整体只占一个 Tab 位。
- 颜色不是区分扇区的唯一线索：外侧标签写出扇区名，图例与提示框也写出名字。
- 过渡只改画面：扇区的名称、合计、摘要与数据表在数据变化的那一刻就按新数据更新；收场中的扇区 `aria-hidden`、不可聚焦。

## 样式参考

### 皮肤

`@xihan-ui/styles/pie-chart.css` 使用 `[data-scope="pie-chart"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

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
| `legend-item` | `data-xh-chart-slot` | slotAttr(item.slot, item.other) |
| `legend-swatch` | `data-xh-chart-part` | 'legend-swatch' |
| `viewport` | `data-xh-chart-part` | 'viewport' |
| `plot` | `data-xh-chart-part` | 'plot' |
| `center` | `data-drawing` | ''（条件成立时才出现） |
| `center` | `data-placement` | 'top' \| undefined |
| `tooltip` | `data-placement` | 'top' \| 'bottom'-'right' \| 'left' \| undefined |
| `tooltip` | `data-state` | 'visible' \| 'hidden' |
| `tooltip` | `data-xh-chart-part` | 'tooltip' |
| `tooltip-header` | `data-xh-chart-part` | 'tooltip-header' |
| `tooltip-row` | `data-series-id` | row.key |
| `tooltip-row` | `data-xh-chart-part` | 'tooltip-row' |
| `tooltip-row` | `data-xh-chart-slot` | slotAttr(row.slot, row.other) |
| `tooltip-swatch` | `data-xh-chart-part` | 'tooltip-swatch' |
| `tooltip-value` | `data-xh-chart-part` | 'tooltip-value' |
| `tooltip-name` | `data-xh-chart-part` | 'tooltip-name' |
| `empty` | `data-state` | 'loading' \| undefined |
| `empty` | `data-xh-chart-part` | 'empty' |
| `mark` | `data-dimmed` | ''（条件成立时才出现） |
| `mark` | `data-drawing` | '' |
| `mark` | `data-xh-chart-part` | mark.part \| undefined |
| `mark` | `data-xh-chart-slot` | slotAttr(slice.slot, slice.other) \| undefined |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-pie-chart-center-gap` | `center` | `gap` | `default` | `--xh-space-0_5` | pie-chart 的 center 部件 gap 覆盖槽。 |
| `--xh-pie-chart-center-value-font-size` | `center-value` | `font-size` | `default` | `--xh-text-heading-3-size` | pie-chart 的 center-value 部件 font-size 覆盖槽。 |
| `--xh-pie-chart-empty-gap` | `empty` | `gap` | `state=loading` | `--xh-space-2` | pie-chart 的 empty 部件 gap 覆盖槽。 |
| `--xh-pie-chart-gap` | `root` | `gap` | `default` | `--xh-space-3` | pie-chart 的 root 部件 gap 覆盖槽。 |
| `--xh-pie-chart-height` | `viewport` | `block-size` | `default` | `--xh-chart-height` | pie-chart 的 viewport 部件 block-size 覆盖槽。 |
| `--xh-pie-chart-legend-gap` | `legend` | `gap` | `default` | `--xh-space-1` | pie-chart 的 legend 部件 gap 覆盖槽。 |
| `--xh-pie-chart-legend-swatch-radius` | `legend-swatch` | `border-radius` | `default` | `--xh-shape-inset` | pie-chart 的 legend-swatch 部件 border-radius 覆盖槽。 |
| `--xh-pie-chart-series-color` | `legend-swatch`<br>`slice`<br>`tooltip-swatch` | `background`<br>`border`<br>`fill` | `xh-chart-slot=1`<br>`xh-chart-slot=2`<br>`xh-chart-slot=3`<br>`xh-chart-slot=4`<br>`xh-chart-slot=5`<br>`xh-chart-slot=6`<br>`xh-chart-slot=7`<br>`xh-chart-slot=8` | `--xh-chart-categorical-1`<br>`--xh-chart-categorical-2`<br>`--xh-chart-categorical-3`<br>`--xh-chart-categorical-4`<br>`--xh-chart-categorical-5`<br>`--xh-chart-categorical-6`<br>`--xh-chart-categorical-7`<br>`--xh-chart-categorical-8` | pie-chart 的 legend-swatch、slice、tooltip-swatch 部件 background、border、fill 覆盖槽。 |
| `--xh-pie-chart-slice-gap` | `root` | `--xh-_chart-metric-gap` | `default` | `--xh-chart-gap` | pie-chart 的 root 部件 --xh-_chart-metric-gap 覆盖槽。 |
| `--xh-pie-chart-slice-radius` | `root` | `--xh-_chart-metric-radius` | `default` | `--xh-shape-inset` | pie-chart 的 root 部件 --xh-_chart-metric-radius 覆盖槽。 |
| `--xh-pie-chart-tooltip-gap` | `tooltip` | `gap` | `default` | `--xh-space-1` | pie-chart 的 tooltip 部件 gap 覆盖槽。 |
| `--xh-pie-chart-tooltip-px` | `tooltip` | `padding-inline` | `default` | `--xh-surface-pad-sm` | pie-chart 的 tooltip 部件 padding-inline 覆盖槽。 |
| `--xh-pie-chart-tooltip-py` | `tooltip` | `padding-block` | `default` | `--xh-surface-pad-sm` | pie-chart 的 tooltip 部件 padding-block 覆盖槽。 |
| `--xh-pie-chart-tooltip-radius` | `tooltip` | `border-radius` | `default` | `--xh-shape-overlay` | pie-chart 的 tooltip 部件 border-radius 覆盖槽。 |
| `--xh-pie-chart-tooltip-row-gap` | `tooltip-row` | `gap` | `default` | `--xh-space-2` | pie-chart 的 tooltip-row 部件 gap 覆盖槽。 |
| `--xh-pie-chart-tooltip-shadow` | `tooltip` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | pie-chart 的 tooltip 部件 box-shadow 覆盖槽。 |
| `--xh-pie-chart-tooltip-swatch-radius` | `tooltip-swatch` | `border-radius` | `default` | `--xh-shape-inset` | pie-chart 的 tooltip-swatch 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：状态 · 出现 · 循环（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-fade-in` · `xh-spin` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`opacity` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 绘图区不随文字方向镜像：扇区自 12 点顺时针排列，右键始终是顺时针的下一个。
- 图例、标题与提示框的内容随文字方向排列，图例的左右键跟随视觉次序翻转。
