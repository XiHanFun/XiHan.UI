来源：https://ui.docs.xihanfun.com/components/hierarchy-chart

# HierarchyChart 层级图 `new`

看层级数据中各部分的占比，并逐层下钻。同一个组件用四种方式铺满空间：矩形树图、旭日图、冰柱图与圆堆积图。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/hierarchy-chart" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/hierarchy-chart.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/hierarchy-chart" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/hierarchy-chart" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/hierarchy-chart.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

缺省画成矩形树图：面积与数值成正比，第一层分支各取一个颜色；点一个部门下钻，路径回到上层

```vue
<script setup lang="ts">
import { XhHierarchyChartRoot } from "@xihan-ui/vue";

// 嵌套的树：子节点在 children 里，只有叶子写值，上层的值是子孙之和
const budget = {
  name: "全年预算",
  children: [
    { name: "研发", children: [
      { name: "平台", value: 420 },
      { name: "移动端", value: 260 },
      { name: "数据", value: 180 },
      { name: "测试", value: 90 },
    ] },
    { name: "市场", children: [
      { name: "品牌", value: 210 },
      { name: "渠道", value: 160 },
      { name: "活动", value: 120 },
    ] },
    { name: "销售", children: [
      { name: "华东", value: 240 },
      { name: "华南", value: 180 },
      { name: "华北", value: 150 },
      { name: "西部", value: 60 },
    ] },
    { name: "运营", children: [
      { name: "客服", value: 110 },
      { name: "内容", value: 80 },
    ] },
    { name: "行政", children: [
      { name: "办公", value: 70 },
      { name: "人事", value: 50 },
    ] },
  ],
};
</script>

<template>
  <XhHierarchyChartRoot
    :data="budget"
  >
    <template #caption>全年预算（万元）</template>
  </XhHierarchyChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-hierarchy-chart id="hierarchy-chart-basic">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">全年预算（万元）</figcaption>
      <nav data-xh-part="path"></nav>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-hierarchy-chart>
</div>

<script type="module">
  const chart = document.getElementById("hierarchy-chart-basic");
  // 嵌套的树：子节点在 children 里，只有叶子写值，上层的值是子孙之和
  const budget = {
    name: "全年预算",
    children: [
      { name: "研发", children: [
        { name: "平台", value: 420 },
        { name: "移动端", value: 260 },
        { name: "数据", value: 180 },
        { name: "测试", value: 90 },
      ] },
      { name: "市场", children: [
        { name: "品牌", value: 210 },
        { name: "渠道", value: 160 },
        { name: "活动", value: 120 },
      ] },
      { name: "销售", children: [
        { name: "华东", value: 240 },
        { name: "华南", value: 180 },
        { name: "华北", value: 150 },
        { name: "西部", value: 60 },
      ] },
      { name: "运营", children: [
        { name: "客服", value: 110 },
        { name: "内容", value: 80 },
      ] },
      { name: "行政", children: [
        { name: "办公", value: 70 },
        { name: "人事", value: 50 },
      ] },
    ],
  };
  chart.data = budget;
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="hierarchy-chart"`：**`root`** · `caption` · `path` · `path-item` · `legend` · `legend-scale` · `legend-scale-name` · `legend-scale-bar` · `legend-scale-value` · **`viewport`** · **`plot`** · `node` · `node-label` · `group-header` · `focus-ring` · `tooltip` · `tooltip-header` · `tooltip-row` · `tooltip-swatch` · `tooltip-value` · `tooltip-name` · `empty` · `summary` · `table-region` · `table`

## 示例

### 旭日图

layout="sunburst" 从中间往外一层一环，自 12 点顺时针；点中间的空洞上钻一层

```vue
<script setup lang="ts">
import { XhHierarchyChartRoot } from "@xihan-ui/vue";

const budget = {
  name: "全年预算",
  children: [
    { name: "研发", children: [
      { name: "平台", value: 420 },
      { name: "移动端", value: 260 },
      { name: "数据", value: 180 },
      { name: "测试", value: 90 },
    ] },
    { name: "市场", children: [
      { name: "品牌", value: 210 },
      { name: "渠道", value: 160 },
      { name: "活动", value: 120 },
    ] },
    { name: "销售", children: [
      { name: "华东", value: 240 },
      { name: "华南", value: 180 },
      { name: "华北", value: 150 },
      { name: "西部", value: 60 },
    ] },
    { name: "运营", children: [
      { name: "客服", value: 110 },
      { name: "内容", value: 80 },
    ] },
    { name: "行政", children: [
      { name: "办公", value: 70 },
      { name: "人事", value: 50 },
    ] },
  ],
};
</script>

<template>
  <XhHierarchyChartRoot
    :data="budget"
    layout="sunburst"
  >
    <template #caption>全年预算（万元）</template>
  </XhHierarchyChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-hierarchy-chart id="hierarchy-chart-sunburst" layout="sunburst">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">全年预算（万元）</figcaption>
      <nav data-xh-part="path"></nav>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-hierarchy-chart>
</div>

<script type="module">
  const chart = document.getElementById("hierarchy-chart-sunburst");
  const budget = {
    name: "全年预算",
    children: [
      { name: "研发", children: [
        { name: "平台", value: 420 },
        { name: "移动端", value: 260 },
        { name: "数据", value: 180 },
        { name: "测试", value: 90 },
      ] },
      { name: "市场", children: [
        { name: "品牌", value: 210 },
        { name: "渠道", value: 160 },
        { name: "活动", value: 120 },
      ] },
      { name: "销售", children: [
        { name: "华东", value: 240 },
        { name: "华南", value: 180 },
        { name: "华北", value: 150 },
        { name: "西部", value: 60 },
      ] },
      { name: "运营", children: [
        { name: "客服", value: 110 },
        { name: "内容", value: 80 },
      ] },
      { name: "行政", children: [
        { name: "办公", value: 70 },
        { name: "人事", value: 50 },
      ] },
    ],
  };
  chart.data = budget;
</script>
```

### 冰柱图

layout="icicle" 一层一条带，每一段的宽度就是它的占比，层级的深浅一眼看得出

```vue
<script setup lang="ts">
import { XhHierarchyChartRoot } from "@xihan-ui/vue";

const budget = {
  name: "全年预算",
  children: [
    { name: "研发", children: [
      { name: "平台", value: 420 },
      { name: "移动端", value: 260 },
      { name: "数据", value: 180 },
      { name: "测试", value: 90 },
    ] },
    { name: "市场", children: [
      { name: "品牌", value: 210 },
      { name: "渠道", value: 160 },
      { name: "活动", value: 120 },
    ] },
    { name: "销售", children: [
      { name: "华东", value: 240 },
      { name: "华南", value: 180 },
      { name: "华北", value: 150 },
      { name: "西部", value: 60 },
    ] },
    { name: "运营", children: [
      { name: "客服", value: 110 },
      { name: "内容", value: 80 },
    ] },
    { name: "行政", children: [
      { name: "办公", value: 70 },
      { name: "人事", value: 50 },
    ] },
  ],
};
</script>

<template>
  <XhHierarchyChartRoot
    :data="budget"
    layout="icicle"
  >
    <template #caption>全年预算（万元）</template>
  </XhHierarchyChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-hierarchy-chart id="hierarchy-chart-icicle" layout="icicle">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">全年预算（万元）</figcaption>
      <nav data-xh-part="path"></nav>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-hierarchy-chart>
</div>

<script type="module">
  const chart = document.getElementById("hierarchy-chart-icicle");
  const budget = {
    name: "全年预算",
    children: [
      { name: "研发", children: [
        { name: "平台", value: 420 },
        { name: "移动端", value: 260 },
        { name: "数据", value: 180 },
        { name: "测试", value: 90 },
      ] },
      { name: "市场", children: [
        { name: "品牌", value: 210 },
        { name: "渠道", value: 160 },
        { name: "活动", value: 120 },
      ] },
      { name: "销售", children: [
        { name: "华东", value: 240 },
        { name: "华南", value: 180 },
        { name: "华北", value: 150 },
        { name: "西部", value: 60 },
      ] },
      { name: "运营", children: [
        { name: "客服", value: 110 },
        { name: "内容", value: 80 },
      ] },
      { name: "行政", children: [
        { name: "办公", value: 70 },
        { name: "人事", value: 50 },
      ] },
    ],
  };
  chart.data = budget;
</script>
```

### 圆堆积

layout="pack" 用圆套圆：看层级的包含关系与大致的大小，不适合精确比较

```vue
<script setup lang="ts">
import { XhHierarchyChartRoot } from "@xihan-ui/vue";

const budget = {
  name: "全年预算",
  children: [
    { name: "研发", children: [
      { name: "平台", value: 420 },
      { name: "移动端", value: 260 },
      { name: "数据", value: 180 },
      { name: "测试", value: 90 },
    ] },
    { name: "市场", children: [
      { name: "品牌", value: 210 },
      { name: "渠道", value: 160 },
      { name: "活动", value: 120 },
    ] },
    { name: "销售", children: [
      { name: "华东", value: 240 },
      { name: "华南", value: 180 },
      { name: "华北", value: 150 },
      { name: "西部", value: 60 },
    ] },
    { name: "运营", children: [
      { name: "客服", value: 110 },
      { name: "内容", value: 80 },
    ] },
    { name: "行政", children: [
      { name: "办公", value: 70 },
      { name: "人事", value: 50 },
    ] },
  ],
};
</script>

<template>
  <XhHierarchyChartRoot
    :data="budget"
    layout="pack"
  >
    <template #caption>全年预算（万元）</template>
  </XhHierarchyChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-hierarchy-chart id="hierarchy-chart-pack" layout="pack">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">全年预算（万元）</figcaption>
      <nav data-xh-part="path"></nav>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-hierarchy-chart>
</div>

<script type="module">
  const chart = document.getElementById("hierarchy-chart-pack");
  const budget = {
    name: "全年预算",
    children: [
      { name: "研发", children: [
        { name: "平台", value: 420 },
        { name: "移动端", value: 260 },
        { name: "数据", value: 180 },
        { name: "测试", value: 90 },
      ] },
      { name: "市场", children: [
        { name: "品牌", value: 210 },
        { name: "渠道", value: 160 },
        { name: "活动", value: 120 },
      ] },
      { name: "销售", children: [
        { name: "华东", value: 240 },
        { name: "华南", value: 180 },
        { name: "华北", value: 150 },
        { name: "西部", value: 60 },
      ] },
      { name: "运营", children: [
        { name: "客服", value: 110 },
        { name: "内容", value: 80 },
      ] },
      { name: "行政", children: [
        { name: "办公", value: 70 },
        { name: "人事", value: 50 },
      ] },
    ],
  };
  chart.data = budget;
</script>
```

### 扁平的行

数据是一张表时写 idField 与 parentField，按父节点的身份组树

```vue
<script setup lang="ts">
import { XhHierarchyChartRoot } from "@xihan-ui/vue";

// 每行一个节点，parent 指向上一层的 id；只有最底层写人数
const rows = [
  { id: "company", parent: null, name: "公司" },
  { id: "rd", parent: "company", name: "研发中心" },
  { id: "fe", parent: "rd", name: "前端", value: 28 },
  { id: "be", parent: "rd", name: "后端", value: 42 },
  { id: "qa", parent: "rd", name: "测试", value: 15 },
  { id: "biz", parent: "company", name: "业务中心" },
  { id: "sales", parent: "biz", name: "销售", value: 36 },
  { id: "ops", parent: "biz", name: "运营", value: 22 },
  { id: "func", parent: "company", name: "职能" },
  { id: "hr", parent: "func", name: "人事", value: 9 },
  { id: "fin", parent: "func", name: "财务", value: 7 },
];
</script>

<template>
  <XhHierarchyChartRoot
    :data="rows"
    id-field="id"
    parent-field="parent"
  >
    <template #caption>各部门人数</template>
  </XhHierarchyChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-hierarchy-chart id="hierarchy-chart-flat" id-field="id" parent-field="parent">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">各部门人数</figcaption>
      <nav data-xh-part="path"></nav>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-hierarchy-chart>
</div>

<script type="module">
  const chart = document.getElementById("hierarchy-chart-flat");
  // 每行一个节点，parent 指向上一层的 id；只有最底层写人数
  const rows = [
    { id: "company", parent: null, name: "公司" },
    { id: "rd", parent: "company", name: "研发中心" },
    { id: "fe", parent: "rd", name: "前端", value: 28 },
    { id: "be", parent: "rd", name: "后端", value: 42 },
    { id: "qa", parent: "rd", name: "测试", value: 15 },
    { id: "biz", parent: "company", name: "业务中心" },
    { id: "sales", parent: "biz", name: "销售", value: 36 },
    { id: "ops", parent: "biz", name: "运营", value: 22 },
    { id: "func", parent: "company", name: "职能" },
    { id: "hr", parent: "func", name: "人事", value: 9 },
    { id: "fin", parent: "func", name: "财务", value: 7 },
  ];
  chart.data = rows;
</script>
```

### 按值着色

colorBy="value" 让颜色深浅对应数值，palette 换色相；图例每层一条色阶，translations.levelLabel 给各层起名

```vue
<script setup lang="ts">
import { XhHierarchyChartRoot } from "@xihan-ui/vue";

const budget = {
  name: "全年预算",
  children: [
    { name: "研发", children: [
      { name: "平台", value: 420 },
      { name: "移动端", value: 260 },
      { name: "数据", value: 180 },
      { name: "测试", value: 90 },
    ] },
    { name: "市场", children: [
      { name: "品牌", value: 210 },
      { name: "渠道", value: 160 },
      { name: "活动", value: 120 },
    ] },
    { name: "销售", children: [
      { name: "华东", value: 240 },
      { name: "华南", value: 180 },
      { name: "华北", value: 150 },
      { name: "西部", value: 60 },
    ] },
    { name: "运营", children: [
      { name: "客服", value: 110 },
      { name: "内容", value: 80 },
    ] },
    { name: "行政", children: [
      { name: "办公", value: 70 },
      { name: "人事", value: 50 },
    ] },
  ],
};

// 颜色在同一层里按最大值归一：图例每层一条色阶，给层起个读者认得的名字
const translations = { levelLabel: (level: number) => (level === 1 ? "部门" : "项目") };
</script>

<template>
  <XhHierarchyChartRoot
    :data="budget"
    color-by="value"
    palette="teal"
    :translations="translations"
  >
    <template #caption>全年预算（万元）</template>
  </XhHierarchyChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-hierarchy-chart id="hierarchy-chart-value" color-by="value" palette="teal">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">全年预算（万元）</figcaption>
      <nav data-xh-part="path"></nav>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-hierarchy-chart>
</div>

<script type="module">
  const chart = document.getElementById("hierarchy-chart-value");
  const budget = {
    name: "全年预算",
    children: [
      { name: "研发", children: [
        { name: "平台", value: 420 },
        { name: "移动端", value: 260 },
        { name: "数据", value: 180 },
        { name: "测试", value: 90 },
      ] },
      { name: "市场", children: [
        { name: "品牌", value: 210 },
        { name: "渠道", value: 160 },
        { name: "活动", value: 120 },
      ] },
      { name: "销售", children: [
        { name: "华东", value: 240 },
        { name: "华南", value: 180 },
        { name: "华北", value: 150 },
        { name: "西部", value: 60 },
      ] },
      { name: "运营", children: [
        { name: "客服", value: 110 },
        { name: "内容", value: 80 },
      ] },
      { name: "行政", children: [
        { name: "办公", value: 70 },
        { name: "人事", value: 50 },
      ] },
    ],
  };
  chart.data = budget;
  // 颜色在同一层里按最大值归一：图例每层一条色阶，给层起个读者认得的名字
  chart.translations = { levelLabel: level => (level === 1 ? "部门" : "项目") };
</script>
```

## 设计指引

### 何时使用

- 数据天然是一棵树，读者要看的是「整体怎么切分」：预算按部门与项目、销售额按大区与城市、磁盘占用按目录。
- 层级不止一层，读者需要从整体逐层钻到细处，再退回来。
- 叶子多到饼图与条形图装不下，但每一块的相对大小仍然有意义。

### 何时不用

- 只有一层、类目不超过 6 个：用[饼图](./pie-chart)，或者条形图更好比较。
- 要比较几个相近的数：面积与角度都不如长度好比，改用[直角坐标图](./cartesian-chart)的条形图。
- 值有正有负：占比没有意义，层级图报错；改用条形图。
- 关心的是流向而不是包含关系：用桑基图。

### 特性

- 数据有两种形状：嵌套的树（子节点在 `childrenField` 里，缺省 `children`），或扁平的行（写 `idField` 与 `parentField`，按父节点的身份组树）。扁平的行缺这两个字段、有多个根、父节点缺失或成环时报 `chart.hierarchy-shape`，根上写 `data-state="error"`。
- 只取叶子的值（`valueField`，缺省 `value`），上层的值是子孙之和，上层行里写的值不计。值为负时报 `chart.negative-share`。兄弟按值从大到小排：矩形树图大的块铺在前面，旭日图自 12 点顺时针。
- 节点的身份是 `idField` 的值；没有身份字段时是从最顶层往下的名字路径（`华东/上海`），同一个父节点下重名的兄弟后面加上次序。受控的 `rootKey`、`activeKey` 与数据引用的 `seriesId` 都是这个身份。
- `layout` 决定空间怎么填：`treemap`（缺省）按 `tile` 铺矩形（`squarify` 缺省、`binary`、`slice-dice`），看得见子节点的分组顶部留一条标题；`sunburst` 从中间的空洞往外一层一环；`icicle` 一层一条带，`orientation="horizontal"` 时层自左而右；`pack` 用圆套圆，只看层级与相对大小。
- `depth`（缺省 2）是同时看得见的层数。到了这个深度还有子节点的节点画成一整块，下钻才看得到里面。
- 着色由 `colorBy` 决定：`branch`（缺省）按数据次序给第一层分支分配分类色 1–8，后代继承分支的颜色、按层向承载面混色变浅；第一层多于 8 个分支时报 `chart.too-many-series`，改用 `value` 或 `uniform`。`value` 按值取顺序色阶（`palette` 换色相），同一层里按最大值归一；`uniform` 全部用色槽 1，靠标签区分。
- 按值着色时图例（部件 `legend`）给每个看得见的层一条色阶：名字、低端的值（0）、渐变条、高端的值（这一层的最大值）。颜色在同一层里各自归一，所以一层一条，同一种深浅在不同层代表的数不一样；只看得见一层时色阶的名字取 `translations.valueLabel`，多于一层时取 `translations.levelLabel(层号)`（缺省 `Level 1`、`Level 2`，层号从当前的根数起），务必按本地语言与数据的层级名改写。下钻、上钻后色阶跟着换。其余着色方式图例收起。
- 标签先量再放：矩形树图的分组标题写在顶部的标题条里，放不下时截断；叶子与旭日、冰柱、圆堆积的节点名只在整段放得下时写，放不下的交给提示框与数据表。
- 下钻：点有子节点的节点，或键盘聚焦后按 Enter，把它设为当前的根；点叶子报告按下（`onDatumPress`）。下钻路径（`path`）列出从最顶层到当前的根，点上层的项回到那一层；还在最顶层时路径收起。旭日图点中间的空洞上钻一层。`rootKey` / `defaultRootKey` / `onRootKeyChange` 让宿主受控或记住下钻的位置；`api.drillTo(key)` 与 `api.drillUp()` 供作者从外部下钻。
- 悬停取指针下最深的节点：提示框的头部是从当前的根到这个节点的路径，下面是数值、占上一层与占总体；与它不在同一条祖孙链上的节点淡出到 `--xh-chart-dim-alpha`。
- `format` 指定数值格式（数字格式或函数），标签、提示框、可及名与数据表共用。
- `pending` 表示正在重新取数：保留上一帧、整体降低不透明度并在根上写 `aria-busy`。首次取数、手里还没有数据时，空态写 `translations.loadingText` 并转一个圈，取完仍没有数据才写 `emptyText`。
- 首次出现时矩形淡入，旭日的扇区顺着扫开，圆堆积的圆从圆心长出，标签淡入，数据晚于挂载到达（异步取数，或 Web Components 连上之后才赋 `data`）时同样播这段入场。下钻与上钻从当前的画面插值到新画面：留下的节点从原位放大或缩回，新露出的节点出现、离开的淡出。`animated={false}`（Web Components 写 `animated="false"`）关闭过渡；系统开了减弱动效或容器写了 `data-motion="reduce"` 时几何直接到位，只保留淡入淡出。
- 三个适配器的作者侧写法不同，最终 DOM 一致：Vue 与 React 不写默认内容时铺开缺省结构（标题、下钻路径、图例、视口与绘图区、空态、提示框），提示框内容可由作用域插槽 / 函数式 children 替换；Web Components 侧作者写外壳（root、caption、path、viewport 与其中空的 `<svg>` plot，可选 legend、empty 与 tooltip），路径项、色阶、节点与提示框的缺省内容由元素生成进去。
- Web Components 侧的数据与数值格式只走 JS property；字段名、布局、铺法、层数、着色、色板、方向与 `root-key` 另有同名属性。宿主元素缺省是行内元素，放进 flex / grid 时要给它一个宽度。

### 最佳实践

- 为图写标题：`caption` 是图的可访问名称，也要说明切分的是什么。
- 第一层分支控制在 8 个以内；更多时把小的合并成「其他」，或者改用 `colorBy="value"`。
- 缺省的两层通常就够：层数越多，每一块越小，标签越写不下；让读者下钻，而不是一次铺开。
- 名字简短：标签只在整段放得下时显示，长名字多半只能靠提示框读到。
- 需要读出准确数字时，在旁边放一张[表格](./table)，或把 `api.table` 交给表格组件（Vue 与 React 从根的作用域插槽 / 函数式 children 取 `table`，Web Components 读元素的 `table`）。

### 反模式

- 用面积比较相近的值：面积差 10% 肉眼几乎看不出来。
- 把没有包含关系的类目硬凑成一棵树：层级图的每一层都在说「这些加起来是上一层」。
- 给每一层换一套颜色：颜色表示分支，换层就换色会让读者以为是不同的分支。
- 用提示框作为读取数值的唯一途径：提示框对读屏隐藏，数值要能从可及名、摘要或数据表读到。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-hierarchy-chart>` |
| Vue 组件 | `XhHierarchyChartCaption` `XhHierarchyChartEmpty` `XhHierarchyChartLegend` `XhHierarchyChartPath` `XhHierarchyChartPlot` `XhHierarchyChartRoot` `XhHierarchyChartTooltip` `XhHierarchyChartViewport` |
| 组合式函数 | `useHierarchyChart` |
| 状态机 | `hierarchyChartMachine` |
| 皮肤 | `@xihan-ui/styles/hierarchy-chart.css` |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `root-key-change` | `HierarchyRootKeyChangeDetails` | 下钻或上钻换了根；detail 为 `{ rootKey }`，最顶层为 null |
| `active-key-change` | `ChartActiveKeyChangeDetails` | 指针或键盘换了激活的节点；detail 为 `{ activeKey }`，收起时为 null |
| `datum-active` | `ChartDatumDetails` | 悬停或聚焦到某个节点；detail 为节点详情，收起时为 null |
| `datum-press` | `ChartDatumDetails` | 指针点击叶子、Enter 按在叶子上或 Space 按在节点上；detail 为节点详情 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhHierarchyChartRoot` | `default` | `HierarchyChartRootSlotProps` | 自行摆放部件；不写时铺开缺省结构：下钻路径、视口（绘图区与空态）、提示框。 |
| `XhHierarchyChartRoot` | `caption` | — | 缺省结构里的标题内容。 |
| `XhHierarchyChartRoot` | `tooltip` | `HierarchyChartTooltipSlotProps` | 缺省结构里的提示框内容。 |
| `XhHierarchyChartRoot` | `empty` | — | 缺省结构里的空态内容。 |
| `XhHierarchyChartTooltip` | `default` | `HierarchyChartTooltipSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhHierarchyChartRoot` | `data` | `ChartRow \| readonly ChartRow[]` |  | 数据：嵌套的树，或扁平的行（配合 idField 与 parentField）。 |
| `XhHierarchyChartRoot` | `childrenField` | `string` |  | 嵌套数据的子节点字段，缺省 children。 |
| `XhHierarchyChartRoot` | `idField` | `string` |  | 扁平数据：行的身份字段。 |
| `XhHierarchyChartRoot` | `parentField` | `string` |  | 扁平数据：父节点的身份字段。 |
| `XhHierarchyChartRoot` | `nameField` | `string` |  | 名字字段，缺省 name。 |
| `XhHierarchyChartRoot` | `valueField` | `string` |  | 数值字段，缺省 value：只取叶子的值。 |
| `XhHierarchyChartRoot` | `layout` | `HierarchyLayout` |  | 空间填充的方式，缺省 treemap。 |
| `XhHierarchyChartRoot` | `tile` | `HierarchyTile` |  | 矩形树图的铺法，缺省 squarify。 |
| `XhHierarchyChartRoot` | `depth` | `number` |  | 同时看得见的层数，缺省 2。 |
| `XhHierarchyChartRoot` | `colorBy` | `HierarchyColorBy` |  | 着色，缺省 branch。 |
| `XhHierarchyChartRoot` | `palette` | `ChartPalette` |  | 按值着色时顺序色阶的色板。 |
| `XhHierarchyChartRoot` | `orientation` | `'vertical' \| 'horizontal'` |  | 冰柱图的方向，缺省 vertical。 |
| `XhHierarchyChartRoot` | `rootKey` | `string \| null` |  | 当前的根（受控）：节点的身份，null 是最顶层。 |
| `XhHierarchyChartRoot` | `defaultRootKey` | `string \| null` |  | 初始的根（非受控）。 |
| `XhHierarchyChartRoot` | `format` | `NumberFormatSpec \| ((value: number) => string)` |  | 数值格式。 |
| `XhHierarchyChartRoot` | `activeKey` | `ChartKey \| null` |  | 激活的键（受控）：与别的图联动时是节点的身份。 |
| `XhHierarchyChartRoot` | `pending` | `boolean` |  | 数据重取中：保留上一帧、整体降低不透明度。 |
| `XhHierarchyChartRoot` | `animated` | `boolean` |  | 播放过渡动画，缺省 true；false 时直接画终态。 |
| `XhHierarchyChartRoot` | `locale` | `string` |  |  |
| `XhHierarchyChartRoot` | `translations` | `Partial<HierarchyChartTranslations>` |  |  |
| `XhHierarchyChartRoot` | `onRootKeyChange` | `HierarchyChartProps['onRootKeyChange']` |  |  |
| `XhHierarchyChartRoot` | `onActiveKeyChange` | `HierarchyChartProps['onActiveKeyChange']` |  |  |
| `XhHierarchyChartRoot` | `onDatumActive` | `HierarchyChartProps['onDatumActive']` |  |  |
| `XhHierarchyChartRoot` | `onDatumPress` | `HierarchyChartProps['onDatumPress']` |  |  |
| `XhHierarchyChartRoot` | `caption` | `ReactNode` |  | 缺省结构里的标题内容。 |
| `XhHierarchyChartRoot` | `renderTooltip` | `(props: HierarchyChartTooltipSlotProps) => ReactNode` |  | 缺省结构里的提示框内容。 |
| `XhHierarchyChartRoot` | `empty` | `ReactNode` |  | 缺省结构里的空态内容。 |
| `XhHierarchyChartRoot` | `children` | `SlotChildren<HierarchyChartRootSlotProps>` |  | 自行摆放部件；不写时铺开缺省结构：下钻路径、视口（绘图区与空态）、提示框。 |
| `XhHierarchyChartTooltip` | `children` | `SlotChildren<HierarchyChartTooltipSlotProps>` |  | 替换缺省内容；函数式 children 拿到激活的节点与缺省的内容模型。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'error' \| undefined |
| `tooltip` | 'visible' \| 'hidden' |
| `empty` | 'loading' \| undefined |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`ROOT.SET`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `model` | `HierarchyModel` | 管线产物：树、布局、场景与无障碍模型。 |
| `scene` | `Scene` | 要画的场景；尚未测量时为空场景。 |
| `overlay` | `HierarchyOverlay` | 前景层：焦点环。 |
| `measured` | `boolean` | 视口尚未测量（服务端与首帧）。 |
| `empty` | `boolean` | 没有可画的节点。 |
| `path` | `readonly HierarchyPathItem[]` | 下钻路径：从最顶层到当前的根。 |
| `legendScales` | `readonly HierarchyLegendScale[]` | 按值着色时图例里的色阶，每个看得见的层一条；不按值着色时为空。 |
| `rootKey` | `string \| null` | 当前的根的身份；null 是最顶层。 |
| `active` | `ChartDatumDetails \| null` | 激活的节点；没有时为 null。 |
| `tooltip` | `HierarchyTooltipModel \| null` | 提示框内容；收起时为 null。 |
| `summary` | `string` |  |
| `table` | `TableModel` | 数据表模型：全部节点，路径、数值与占上一层的比例。 |
| `emptyText` | `string` |  |
| `tableCaption` | `string` |  |
| `activeKey` | `ChartKey \| null` |  |
| `drillTo` | `(key: string \| null) => void` | 下钻到某个节点（有子节点才下得去），null 回到最顶层。 |
| `drillUp` | `() => void` | 上钻一层。 |
| `setFocusedDatum` | `(ref: { seriesId: string, index: number } \| null) => void` | 移动键盘锚点：只改锚点，不移动 DOM 焦点，也不派发回调。 |
| `markTag` | `(mark: Mark) => HierarchyMarkTag` |  |
| `getRootProps` | `() => T['element']` |  |
| `getCaptionProps` | `() => T['element']` |  |
| `getPathProps` | `() => T['element']` |  |
| `getPathItemProps` | `(item: HierarchyPathItem) => T['button']` |  |
| `getLegendProps` | `() => T['element']` |  |
| `getLegendScaleProps` | `(scale: HierarchyLegendScale) => T['element']` |  |
| `getLegendScaleNameProps` | `() => T['element']` |  |
| `getLegendScaleBarProps` | `() => T['element']` |  |
| `getLegendScaleValueProps` | `(edge: 'min' \| 'max') => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getPlotProps` | `() => T['element']` |  |
| `getMarkProps` | `(mark: Mark) => T['element']` |  |
| `getTooltipProps` | `() => T['element']` |  |
| `getTooltipHeaderProps` | `() => T['element']` |  |
| `getTooltipRowProps` | `(row: HierarchyTooltipRow) => T['element']` |  |
| `getTooltipSwatchProps` | `(row: HierarchyTooltipRow) => T['element']` |  |
| `getTooltipValueProps` | `(row: HierarchyTooltipRow) => T['element']` |  |
| `getTooltipNameProps` | `(row: HierarchyTooltipRow) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` |  |
| `getSummaryProps` | `() => T['element']` |  |
| `getTableRegionProps` | `() => T['element']` | 数据表的视觉隐藏区域：块级、1px、裁掉，表格放在里面；隐藏不写在表格上，表格的高度收不住。 |
| `getTableProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | 总是 | 绘图区只占一个 Tab 位：焦点落到锚点节点，首次为第一层的第一个节点 |
| `ArrowRight` | 焦点在绘图区 | 同一层的下一个兄弟：矩形树图与圆堆积按阅读序，旭日图顺时针，冰柱图自左而右；已在最后一个则原地不动 |
| `ArrowLeft` | 焦点在绘图区 | 同一层的上一个兄弟 |
| `ArrowDown` | 焦点在绘图区 | 进入第一个子节点（看得见的层内） |
| `ArrowUp` | 焦点在绘图区 | 回到父节点（看得见的层内） |
| `Home` | 焦点在绘图区 | 同一层的第一个兄弟 |
| `End` | 焦点在绘图区 | 同一层的最后一个兄弟 |
| `Enter` | 焦点在有子节点的节点 | 下钻：把它设为根，焦点落到它的第一个子节点；在叶子上报告按下（onDatumPress） |
| `Space` | 焦点在绘图区 | 报告聚焦的节点（onDatumPress） |
| `Backspace` | 已下钻 | 上钻一层，焦点落回刚才的根 |
| `Escape` | 提示框显示着 | 收起提示框，焦点留在原处；按键不拦截，外层浮层的关闭仍归它自己 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-busy` | 'true' \| undefined |
| `path` | `aria-label` | translations.pathLabel |
| `path-item` | `aria-current` | 'location' \| undefined |
| `path-item` | `aria-disabled` | 'true' \| undefined |
| `legend` | `aria-hidden` | 'true' |
| `plot` | `aria-describedby` | `summary` 部件的 id |
| `plot` | `aria-labelledby` | `caption` 部件的 id |
| `plot` | `aria-roledescription` | translations.chartRoleDescription |
| `plot` | `role` | 'tree' |
| `tooltip` | `aria-hidden` | 'true' |
| `mark` | `aria-hidden` | 'true' |

- 根是 `<figure>`，可访问名称来自 `caption`；不放标题时在根上写 `aria-label`。
- 绘图区是 `role="tree"`，角色说明取 `translations.chartRoleDescription`（缺省 `tree chart`：说明里留着「树」，读屏才知道能按方向键展开、收起，不要改成笼统的「图表」），`aria-describedby` 指向组件生成的摘要；每个看得见的节点是 `role="treeitem"`，带 `aria-level`、`aria-setsize` 与 `aria-posinset`。有子节点的节点带 `aria-expanded`：子节点看得见时为 `true`，到了可见层数的底为 `false`，按 Enter 下钻才看得到。节点的名称取 `translations.datumLabel`（缺省「名字, 数值, 占比 of 上一层」），务必按本地语言改写。
- 绘图区只占一个 Tab 位，焦点落在节点上：左右键在同一层的兄弟之间走（矩形树图与圆堆积按阅读序，旭日图顺时针，冰柱图按排列次序），下键进入第一个子节点，上键回到父节点，Home / End 到同一层的头尾。Enter 下钻、Backspace 上钻，焦点跟着落到新的一层。焦点环画在节点之外，只在键盘聚焦时出现。
- 下钻路径是一组按钮（与面包屑的链接同一身份），当前的根写 `aria-current="location"`、不可按。
- 标签与焦点环一律 `aria-hidden`；提示框同样 `aria-hidden`：它显示的内容与节点的名称是同一份。图例的色阶也 `aria-hidden`：每个节点的可及名与数据表里都写着它的值。
- 组件在根内生成一段摘要与一张数据表，视觉隐藏、对读屏可见：摘要写当前的根、下面一层的项数、合计与最大的一项（模板是 `translations.summary`）；数据表列出整棵树，首列是路径（列名取 `translations.nameLabel`），其余两列是数值与占上一层的比例。
- 颜色不是区分分支的唯一线索：路径、标签、提示框与可及名都写出名字。
- 过渡只改画面：节点的名称、摘要与数据表在数据或根变化的那一刻就更新；收场中的节点 `aria-hidden`、不可聚焦。

## 样式参考

### 皮肤

`@xihan-ui/styles/hierarchy-chart.css` 按 `[data-scope="hierarchy-chart"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-hierarchy-chart` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-palette` | props.palette \| undefined |
| `root` | `data-state` | 'error' \| undefined |
| `root` | `data-xh-chart-part` | 'root' |
| `caption` | `data-xh-chart-part` | 'caption' |
| `path-item` | `data-current` | ''（条件成立时才出现） |
| `path-item` | `data-pressed` | ''（条件成立时才出现） |
| `path-item` | `data-xh-collection-context` | 'nav' |
| `path-item` | `data-xh-collection-item` | '' |
| `path-item` | `data-xh-collection-size` | 'sm' |
| `path-item` | `data-xh-collection-terminal` | ''（条件成立时才出现） |
| `legend` | `data-xh-chart-part` | 'legend' |
| `legend-scale` | `data-level` | scale.level |
| `legend-scale-value` | `data-edge` | edge |
| `viewport` | `data-xh-chart-part` | 'viewport' |
| `plot` | `data-xh-chart-part` | 'plot' |
| `tooltip` | `data-placement` | 'top' \| 'bottom'-'right' \| 'left' \| undefined |
| `tooltip` | `data-state` | 'visible' \| 'hidden' |
| `tooltip` | `data-xh-chart-part` | 'tooltip' |
| `tooltip-header` | `data-xh-chart-part` | 'tooltip-header' |
| `tooltip-row` | `data-xh-chart-part` | 'tooltip-row' |
| `tooltip-swatch` | `data-xh-chart-part` | 'tooltip-swatch' |
| `tooltip-value` | `data-xh-chart-part` | 'tooltip-value' |
| `tooltip-name` | `data-xh-chart-part` | 'tooltip-name' |
| `empty` | `data-loading` | ''（条件成立时才出现） |
| `empty` | `data-state` | 'loading' \| undefined |
| `empty` | `data-xh-chart-part` | 'empty' |
| `empty` | `data-xh-loading-ring` | '' |
| `mark` | `data-dimmed` | ''（条件成立时才出现） |
| `mark` | `data-level` | String(Math.min(geometry.level, 4)) \| undefined |
| `mark` | `data-xh-chart-part` | mark.part \| undefined |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-hierarchy-chart-empty-gap` | `empty` | `gap` | `state=loading` | `--xh-space-2` | hierarchy-chart 的 empty 部件 gap 覆盖槽。 |
| `--xh-hierarchy-chart-gap` | `root` | `gap` | `default` | `--xh-space-3` | hierarchy-chart 的 root 部件 gap 覆盖槽。 |
| `--xh-hierarchy-chart-height` | `viewport` | `block-size` | `default` | `--xh-chart-height` | hierarchy-chart 的 viewport 部件 block-size 覆盖槽。 |
| `--xh-hierarchy-chart-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-sm` | hierarchy-chart 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-hierarchy-chart-legend-gap` | `legend` | `gap` | `default` | `--xh-space-4` | hierarchy-chart 的 legend 部件 gap 覆盖槽。 |
| `--xh-hierarchy-chart-legend-scale-bar-radius` | `legend-scale-bar` | `border-radius` | `default` | `--xh-shape-inset` | hierarchy-chart 的 legend-scale-bar 部件 border-radius 覆盖槽。 |
| `--xh-hierarchy-chart-legend-scale-gap` | `legend-scale` | `gap` | `default` | `--xh-space-2` | hierarchy-chart 的 legend-scale 部件 gap 覆盖槽。 |
| `--xh-hierarchy-chart-legend-scale-width` | `legend-scale-bar` | `inline-size` | `default` | `--xh-chart-legend-scale-width` | hierarchy-chart 的 legend-scale-bar 部件 inline-size 覆盖槽。 |
| `--xh-hierarchy-chart-node-gap` | `root` | `--xh-_chart-metric-gap` | `default` | `--xh-chart-gap` | hierarchy-chart 的 root 部件 --xh-_chart-metric-gap 覆盖槽。 |
| `--xh-hierarchy-chart-node-radius` | `root` | `--xh-_chart-metric-radius` | `default` | `--xh-shape-inset` | hierarchy-chart 的 root 部件 --xh-_chart-metric-radius 覆盖槽。 |
| `--xh-hierarchy-chart-path-column-gap` | `path` | `column-gap` | `default` | `--xh-icon-size` | hierarchy-chart 的 path 部件 column-gap 覆盖槽。 |
| `--xh-hierarchy-chart-path-fg` | `path-item` | `color` | `default`<br>`xh-collection-context=nav` | `--xh-fg-muted` | hierarchy-chart 的 path-item 部件 color 覆盖槽。 |
| `--xh-hierarchy-chart-path-font-size` | `path`<br>`path-item` | `font-size` | `default` | `--xh-control-font-sm` | hierarchy-chart 的 path、path-item 部件 font-size 覆盖槽。 |
| `--xh-hierarchy-chart-path-item-bg-hover` | `path-item` | `background-color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-bg-subtle` | hierarchy-chart 的 path-item 部件 background-color 覆盖槽。 |
| `--xh-hierarchy-chart-path-item-bg-pressed` | `path-item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=nav` | `--xh-bg-subtle-hover` | hierarchy-chart 的 path-item 部件 background-color 覆盖槽。 |
| `--xh-hierarchy-chart-path-item-fg-current` | `path-item` | `color` | `current`<br>`xh-collection-context=nav`<br>`xh-collection-terminal` | `--xh-fg-default` | hierarchy-chart 的 path-item 部件 color 覆盖槽。 |
| `--xh-hierarchy-chart-path-item-fg-hover` | `path-item` | `color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-fg-default` | hierarchy-chart 的 path-item 部件 color 覆盖槽。 |
| `--xh-hierarchy-chart-path-item-font-weight-current` | `path-item` | `font-weight` | `current`<br>`xh-collection-context=nav`<br>`xh-collection-terminal` | `--xh-font-weight-medium` | hierarchy-chart 的 path-item 部件 font-weight 覆盖槽。 |
| `--xh-hierarchy-chart-path-item-px` | `path-item` | `padding-inline` | `default` | `--xh-space-1` | hierarchy-chart 的 path-item 部件 padding-inline 覆盖槽。 |
| `--xh-hierarchy-chart-path-item-radius` | `path-item` | `border-radius` | `default` | `--xh-shape-control` | hierarchy-chart 的 path-item 部件 border-radius 覆盖槽。 |
| `--xh-hierarchy-chart-path-row-gap` | `path` | `row-gap` | `default` | `--xh-space-1` | hierarchy-chart 的 path 部件 row-gap 覆盖槽。 |
| `--xh-hierarchy-chart-path-separator-fg` | `path-item` | `background-color` | `default` | `--xh-fg-subtle` | hierarchy-chart 的 path-item 部件 background-color 覆盖槽。 |
| `--xh-hierarchy-chart-series-color` | `legend-swatch`<br>`node`<br>`pattern-line`<br>`tooltip-swatch` | `background`<br>`border`<br>`fill`<br>`stroke` | `@media (forced-colors: active)`<br>`@media print`<br>`mark=line`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=1`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns`<br>`xh-chart-slot=1`<br>`xh-chart-slot=2`<br>`xh-chart-slot=3`<br>`xh-chart-slot=4`<br>`xh-chart-slot=5`<br>`xh-chart-slot=6`<br>`xh-chart-slot=7`<br>`xh-chart-slot=8` | `--xh-chart-categorical-1`<br>`--xh-chart-categorical-2`<br>`--xh-chart-categorical-3`<br>`--xh-chart-categorical-4`<br>`--xh-chart-categorical-5`<br>`--xh-chart-categorical-6`<br>`--xh-chart-categorical-7`<br>`--xh-chart-categorical-8` | hierarchy-chart 的 legend-swatch、node、pattern-line、tooltip-swatch 部件 background、border、fill、stroke 覆盖槽。 |
| `--xh-hierarchy-chart-tooltip-gap` | `tooltip` | `gap` | `default` | `--xh-space-1` | hierarchy-chart 的 tooltip 部件 gap 覆盖槽。 |
| `--xh-hierarchy-chart-tooltip-px` | `tooltip` | `padding-inline` | `default` | `--xh-surface-pad-sm` | hierarchy-chart 的 tooltip 部件 padding-inline 覆盖槽。 |
| `--xh-hierarchy-chart-tooltip-py` | `tooltip` | `padding-block` | `default` | `--xh-surface-pad-sm` | hierarchy-chart 的 tooltip 部件 padding-block 覆盖槽。 |
| `--xh-hierarchy-chart-tooltip-radius` | `tooltip` | `border-radius` | `default` | `--xh-shape-overlay` | hierarchy-chart 的 tooltip 部件 border-radius 覆盖槽。 |
| `--xh-hierarchy-chart-tooltip-row-gap` | `tooltip-row` | `gap` | `default` | `--xh-space-2` | hierarchy-chart 的 tooltip-row 部件 gap 覆盖槽。 |
| `--xh-hierarchy-chart-tooltip-shadow` | `tooltip` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | hierarchy-chart 的 tooltip 部件 box-shadow 覆盖槽。 |
| `--xh-hierarchy-chart-tooltip-swatch-radius` | `tooltip-swatch` | `border-radius` | `default` | `--xh-shape-inset` | hierarchy-chart 的 tooltip-swatch 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 出现（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-fade-in` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`opacity` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；只认物理方向的量乘 `--xh-direction-sign` 换向，按就近的 `dir` 走；另有按 `dir` 分支的规则。

- 绘图区不随文字方向镜像：矩形树图的铺法、旭日图的顺时针与冰柱图的方向都不变，右键始终是阅读序或顺时针的下一个。
- 下钻路径、标题与提示框的内容随文字方向排列。
