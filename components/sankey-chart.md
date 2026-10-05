来源：https://ui.docs.xihanfun.com/components/sankey-chart

# SankeyChart 桑基图 `new`

看流量从哪里来、到哪里去、在哪里流失。节点分列排开，流带的宽度与流量成正比。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/sankey-chart" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/sankey-chart.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/sankey-chart" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/sankey-chart" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/sankey-chart.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

节点分列排开，流带的宽度与流量成正比；节点按分组着色，悬停节点时相连的流带换成它的颜色

```vue
<script setup lang="ts">
import { XhSankeyChartRoot } from "@xihan-ui/vue";

// 节点：身份、名字与分组，同一组同一个颜色
const nodes = [
  { id: "search", name: "搜索", group: "渠道" },
  { id: "ads", name: "广告", group: "渠道" },
  { id: "social", name: "社交", group: "渠道" },
  { id: "home", name: "首页", group: "页面" },
  { id: "list", name: "列表", group: "页面" },
  { id: "detail", name: "详情", group: "页面" },
  { id: "order", name: "下单", group: "结果" },
  { id: "leave", name: "离开", group: "结果" },
];

// 流带：从哪个节点流到哪个节点、流了多少
const links = [
  { source: "search", target: "home", value: 3200 },
  { source: "search", target: "list", value: 1800 },
  { source: "ads", target: "home", value: 1500 },
  { source: "ads", target: "detail", value: 900 },
  { source: "social", target: "home", value: 1100 },
  { source: "home", target: "list", value: 2600 },
  { source: "home", target: "leave", value: 3200 },
  { source: "list", target: "detail", value: 3100 },
  { source: "list", target: "leave", value: 1300 },
  { source: "detail", target: "order", value: 1700 },
  { source: "detail", target: "leave", value: 2300 },
];
</script>

<template>
  <XhSankeyChartRoot
    :nodes="nodes"
    :links="links"
  >
    <template #caption>本周访客流向</template>
  </XhSankeyChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-sankey-chart id="sankey-chart-basic">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">本周访客流向</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-sankey-chart>
</div>

<script type="module">
  const chart = document.getElementById("sankey-chart-basic");
  // 节点：身份、名字与分组，同一组同一个颜色
  const nodes = [
    { id: "search", name: "搜索", group: "渠道" },
    { id: "ads", name: "广告", group: "渠道" },
    { id: "social", name: "社交", group: "渠道" },
    { id: "home", name: "首页", group: "页面" },
    { id: "list", name: "列表", group: "页面" },
    { id: "detail", name: "详情", group: "页面" },
    { id: "order", name: "下单", group: "结果" },
    { id: "leave", name: "离开", group: "结果" },
  ];
  // 流带：从哪个节点流到哪个节点、流了多少
  const links = [
    { source: "search", target: "home", value: 3200 },
    { source: "search", target: "list", value: 1800 },
    { source: "ads", target: "home", value: 1500 },
    { source: "ads", target: "detail", value: 900 },
    { source: "social", target: "home", value: 1100 },
    { source: "home", target: "list", value: 2600 },
    { source: "home", target: "leave", value: 3200 },
    { source: "list", target: "detail", value: 3100 },
    { source: "list", target: "leave", value: 1300 },
    { source: "detail", target: "order", value: 1700 },
    { source: "detail", target: "leave", value: 2300 },
  ];
  chart.nodes = nodes;
  chart.links = links;
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="sankey-chart"`：**`root`** · `caption` · `legend` · `legend-item` · `legend-swatch` · `legend-label` · **`viewport`** · **`plot`** · `defs` · `gradient` · `gradient-stop` · `link` · `node` · `node-label` · `focus-ring` · `tooltip` · `tooltip-header` · `tooltip-row` · `tooltip-swatch` · `tooltip-value` · `tooltip-name` · `empty` · `summary` · `table-region` · `table`

## 示例

### 自上而下

orientation="vertical" 让流向朝下：页面是竖长的阅读顺序、或者列里的名字很长时用它

```vue
<script setup lang="ts">
import { XhSankeyChartRoot } from "@xihan-ui/vue";

const nodes = [
  { id: "search", name: "搜索", group: "渠道" },
  { id: "ads", name: "广告", group: "渠道" },
  { id: "social", name: "社交", group: "渠道" },
  { id: "home", name: "首页", group: "页面" },
  { id: "list", name: "列表", group: "页面" },
  { id: "detail", name: "详情", group: "页面" },
  { id: "order", name: "下单", group: "结果" },
  { id: "leave", name: "离开", group: "结果" },
];

const links = [
  { source: "search", target: "home", value: 3200 },
  { source: "search", target: "list", value: 1800 },
  { source: "ads", target: "home", value: 1500 },
  { source: "ads", target: "detail", value: 900 },
  { source: "social", target: "home", value: 1100 },
  { source: "home", target: "list", value: 2600 },
  { source: "home", target: "leave", value: 3200 },
  { source: "list", target: "detail", value: 3100 },
  { source: "list", target: "leave", value: 1300 },
  { source: "detail", target: "order", value: 1700 },
  { source: "detail", target: "leave", value: 2300 },
];
</script>

<template>
  <XhSankeyChartRoot
    :nodes="nodes"
    :links="links"
    orientation="vertical"
  >
    <template #caption>本周访客流向</template>
  </XhSankeyChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-sankey-chart id="sankey-chart-vertical" orientation="vertical">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">本周访客流向</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-sankey-chart>
</div>

<script type="module">
  const chart = document.getElementById("sankey-chart-vertical");
  const nodes = [
    { id: "search", name: "搜索", group: "渠道" },
    { id: "ads", name: "广告", group: "渠道" },
    { id: "social", name: "社交", group: "渠道" },
    { id: "home", name: "首页", group: "页面" },
    { id: "list", name: "列表", group: "页面" },
    { id: "detail", name: "详情", group: "页面" },
    { id: "order", name: "下单", group: "结果" },
    { id: "leave", name: "离开", group: "结果" },
  ];
  const links = [
    { source: "search", target: "home", value: 3200 },
    { source: "search", target: "list", value: 1800 },
    { source: "ads", target: "home", value: 1500 },
    { source: "ads", target: "detail", value: 900 },
    { source: "social", target: "home", value: 1100 },
    { source: "home", target: "list", value: 2600 },
    { source: "home", target: "leave", value: 3200 },
    { source: "list", target: "detail", value: 3100 },
    { source: "list", target: "leave", value: 1300 },
    { source: "detail", target: "order", value: 1700 },
    { source: "detail", target: "leave", value: 2300 },
  ];
  chart.nodes = nodes;
  chart.links = links;
</script>
```

### 流带随来源着色

linkColor="source" 让每条流带取源节点的颜色：读者要一路跟着某个来源看它流向哪里时用它

```vue
<script setup lang="ts">
import { XhSankeyChartRoot } from "@xihan-ui/vue";

const nodes = [
  { id: "search", name: "搜索", group: "渠道" },
  { id: "ads", name: "广告", group: "渠道" },
  { id: "social", name: "社交", group: "渠道" },
  { id: "home", name: "首页", group: "页面" },
  { id: "list", name: "列表", group: "页面" },
  { id: "detail", name: "详情", group: "页面" },
  { id: "order", name: "下单", group: "结果" },
  { id: "leave", name: "离开", group: "结果" },
];

const links = [
  { source: "search", target: "home", value: 3200 },
  { source: "search", target: "list", value: 1800 },
  { source: "ads", target: "home", value: 1500 },
  { source: "ads", target: "detail", value: 900 },
  { source: "social", target: "home", value: 1100 },
  { source: "home", target: "list", value: 2600 },
  { source: "home", target: "leave", value: 3200 },
  { source: "list", target: "detail", value: 3100 },
  { source: "list", target: "leave", value: 1300 },
  { source: "detail", target: "order", value: 1700 },
  { source: "detail", target: "leave", value: 2300 },
];
</script>

<template>
  <XhSankeyChartRoot
    :nodes="nodes"
    :links="links"
    link-color="source"
  >
    <template #caption>本周访客流向</template>
  </XhSankeyChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-sankey-chart id="sankey-chart-link-source" link-color="source">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">本周访客流向</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-sankey-chart>
</div>

<script type="module">
  const chart = document.getElementById("sankey-chart-link-source");
  const nodes = [
    { id: "search", name: "搜索", group: "渠道" },
    { id: "ads", name: "广告", group: "渠道" },
    { id: "social", name: "社交", group: "渠道" },
    { id: "home", name: "首页", group: "页面" },
    { id: "list", name: "列表", group: "页面" },
    { id: "detail", name: "详情", group: "页面" },
    { id: "order", name: "下单", group: "结果" },
    { id: "leave", name: "离开", group: "结果" },
  ];
  const links = [
    { source: "search", target: "home", value: 3200 },
    { source: "search", target: "list", value: 1800 },
    { source: "ads", target: "home", value: 1500 },
    { source: "ads", target: "detail", value: 900 },
    { source: "social", target: "home", value: 1100 },
    { source: "home", target: "list", value: 2600 },
    { source: "home", target: "leave", value: 3200 },
    { source: "list", target: "detail", value: 3100 },
    { source: "list", target: "leave", value: 1300 },
    { source: "detail", target: "order", value: 1700 },
    { source: "detail", target: "leave", value: 2300 },
  ];
  chart.nodes = nodes;
  chart.links = links;
</script>
```

### 渐变流带

linkColor="gradient" 让流带从源节点的颜色渐变到目标节点的颜色，两端的分组一眼看得出

```vue
<script setup lang="ts">
import { XhSankeyChartRoot } from "@xihan-ui/vue";

const nodes = [
  { id: "search", name: "搜索", group: "渠道" },
  { id: "ads", name: "广告", group: "渠道" },
  { id: "social", name: "社交", group: "渠道" },
  { id: "home", name: "首页", group: "页面" },
  { id: "list", name: "列表", group: "页面" },
  { id: "detail", name: "详情", group: "页面" },
  { id: "order", name: "下单", group: "结果" },
  { id: "leave", name: "离开", group: "结果" },
];

const links = [
  { source: "search", target: "home", value: 3200 },
  { source: "search", target: "list", value: 1800 },
  { source: "ads", target: "home", value: 1500 },
  { source: "ads", target: "detail", value: 900 },
  { source: "social", target: "home", value: 1100 },
  { source: "home", target: "list", value: 2600 },
  { source: "home", target: "leave", value: 3200 },
  { source: "list", target: "detail", value: 3100 },
  { source: "list", target: "leave", value: 1300 },
  { source: "detail", target: "order", value: 1700 },
  { source: "detail", target: "leave", value: 2300 },
];
</script>

<template>
  <XhSankeyChartRoot
    :nodes="nodes"
    :links="links"
    link-color="gradient"
  >
    <template #caption>本周访客流向</template>
  </XhSankeyChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-sankey-chart id="sankey-chart-gradient" link-color="gradient">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">本周访客流向</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-sankey-chart>
</div>

<script type="module">
  const chart = document.getElementById("sankey-chart-gradient");
  const nodes = [
    { id: "search", name: "搜索", group: "渠道" },
    { id: "ads", name: "广告", group: "渠道" },
    { id: "social", name: "社交", group: "渠道" },
    { id: "home", name: "首页", group: "页面" },
    { id: "list", name: "列表", group: "页面" },
    { id: "detail", name: "详情", group: "页面" },
    { id: "order", name: "下单", group: "结果" },
    { id: "leave", name: "离开", group: "结果" },
  ];
  const links = [
    { source: "search", target: "home", value: 3200 },
    { source: "search", target: "list", value: 1800 },
    { source: "ads", target: "home", value: 1500 },
    { source: "ads", target: "detail", value: 900 },
    { source: "social", target: "home", value: 1100 },
    { source: "home", target: "list", value: 2600 },
    { source: "home", target: "leave", value: 3200 },
    { source: "list", target: "detail", value: 3100 },
    { source: "list", target: "leave", value: 1300 },
    { source: "detail", target: "order", value: 1700 },
    { source: "detail", target: "leave", value: 2300 },
  ];
  chart.nodes = nodes;
  chart.links = links;
</script>
```

### 只写流带

不写 nodes 时节点按流带里出现的先后推断，名字就是身份，全部用同一个颜色

```vue
<script setup lang="ts">
import { XhSankeyChartRoot } from "@xihan-ui/vue";

// 节点从流带推断：源与目标写名字即可
const links = [
  { source: "煤炭", target: "发电", value: 420 },
  { source: "天然气", target: "发电", value: 160 },
  { source: "天然气", target: "供热", value: 90 },
  { source: "水电", target: "发电", value: 130 },
  { source: "发电", target: "工业", value: 340 },
  { source: "发电", target: "居民", value: 210 },
  { source: "发电", target: "损耗", value: 160 },
  { source: "供热", target: "居民", value: 70 },
  { source: "供热", target: "损耗", value: 20 },
];
</script>

<template>
  <XhSankeyChartRoot
    :links="links"
  >
    <template #caption>年度能源流向（万吨标准煤）</template>
  </XhSankeyChartRoot>
</template>
```

```html
<div style="width: 100%">
  <xh-sankey-chart id="sankey-chart-links-only">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">年度能源流向（万吨标准煤）</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-sankey-chart>
</div>

<script type="module">
  const chart = document.getElementById("sankey-chart-links-only");
  // 节点从流带推断：源与目标写名字即可
  const links = [
    { source: "煤炭", target: "发电", value: 420 },
    { source: "天然气", target: "发电", value: 160 },
    { source: "天然气", target: "供热", value: 90 },
    { source: "水电", target: "发电", value: 130 },
    { source: "发电", target: "工业", value: 340 },
    { source: "发电", target: "居民", value: 210 },
    { source: "发电", target: "损耗", value: 160 },
    { source: "供热", target: "居民", value: 70 },
    { source: "供热", target: "损耗", value: 20 },
  ];
  chart.links = links;
</script>
```

## 设计指引

### 何时使用

- 量在几个阶段之间分流、汇合：用户从哪些渠道进来、经过哪些页面、最后下单还是离开；预算从来源分到部门再分到项目；能源从产出到消耗。
- 读者关心的是「大头流向哪里」与「在哪一步流失」，而不是每条流带的精确数字。

### 何时不用

- 只有一条线性的流程、每步只会留下或离开：用[漏斗图](./funnel-chart)，逐级转化率读得更清楚。
- 流向成环（回流、循环引用）：桑基图只画有向无环的流，成环会报错；改用关系图。
- 要比较几个相近的流量：宽度差一点很难看出来，改用条形图或表格。
- 节点多到每列几十个：流带交织成一片，先按类别聚合。

### 特性

- 数据是流带（`links`，每条写 `source`、`target` 与 `value`）；节点（`nodes`，每个写 `id`，可选 `name` 与 `group`）缺省按流带里出现的先后推断，名字即身份。成环、自环、端点不存在或节点重复时报 `chart.sankey-shape`，流量为负时报 `chart.negative-share`，根上写 `data-state="error"`。
- 节点的值取流入与流出里较大的那个；节点分到哪一列由 `nodeAlign` 决定：`justify`（缺省）两端对齐、没有出边的节点贴到最后一列，`start` 靠源头，`end` 靠汇点，`center` 居中。列内次序缺省由布局按相连节点的位置排，`nodeSort="input"` 保持数据次序。
- `orientation` 取 `horizontal`（缺省，自左而右）或 `vertical`（自上而下）。节点的厚度取组件槽 `--xh-sankey-chart-node-width`，同一列相邻节点至少隔一行字。
- 颜色：节点按 `group` 第一次出现的先后分配分类色 1–8，没有分组时全部用色槽 1；多于 8 组时报 `chart.too-many-series`。流带缺省是半透明的中性色；`linkColor` 取 `source` / `target` 时用源或目标节点的颜色，取 `gradient` 时从源节点渐变到目标节点。
- 名字写在节点侧面、列间的空当里：前半程写在下游一侧，后半程写在上游一侧，放不下时截断；一列里挨得太近的名字只留前一个，其余交给提示框与数据表。
- 有两组及以上时显示图例，点图例项切换这一组的显隐：隐藏的节点与连着它们的流带不画，其余重新排布；悬停图例项时只留这一组。
- 悬停节点时连着它的流带换成它的颜色，其余淡出到 `--xh-chart-dim-alpha`；提示框写合计与流入、流出的明细（各列前 6 条，多出来的合成「其他」）。悬停流带时只留它和两端，提示框写流量与它占源节点流出、占目标节点流入的比例。细的节点沿流向放宽到最小命中尺寸 `--xh-chart-hit-min`。
- `format` 指定数值格式（数字格式或函数），提示框、可及名与数据表共用。
- 多张图接到同一个受控的 `activeKey` 上时，节点按身份、流带按「源→目标」与其他图对齐。
- `pending` 表示正在重新取数：保留上一帧、整体降低不透明度并在根上写 `aria-busy`。首次取数、手里还没有数据时，空态写 `translations.loadingText` 并转一个圈，取完仍没有流带才写 `emptyText`。
- 首次出现时流带与节点一起淡入，数据晚于挂载到达（异步取数，或 Web Components 连上之后才赋 `data`）时同样播这段入场；之后的数据变化与图例切换从当前的位置与宽度插值到新布局，离开的节点与流带淡出后才移除。`animated={false}`（Web Components 写 `animated="false"`）关闭过渡；系统开了减弱动效或容器写了 `data-motion="reduce"` 时几何直接到位，只保留淡入淡出。
- 三个适配器的作者侧写法不同，最终 DOM 一致：Vue 与 React 不写默认内容时铺开缺省结构（标题、图例、视口与绘图区、空态、提示框），提示框内容可由作用域插槽 / 函数式 children 替换；Web Components 侧作者写外壳（root、caption、legend、viewport 与其中空的 `<svg>` plot，可选 empty 与 tooltip），渐变、流带、节点、图例项与提示框的缺省内容由元素生成进去。
- Web Components 侧的节点、流带与数值格式只走 JS property；流向、分列、列内次序、流带着色与 `active-key` 另有同名属性。宿主元素缺省是行内元素，放进 flex / grid 时要给它一个宽度。

### 最佳实践

- 为图写标题：`caption` 是图的可访问名称，也要说明流的是什么、单位是什么。
- 用分组给节点着色，把「在哪一步」或「属于哪一类」交给颜色，名字留给身份；分组不超过 8 个。
- 流带缺省用中性色：颜色留给悬停时的强调；只有流向本身要按来源区分时才用 `linkColor="source"`。
- 需要读出准确数字时，在旁边放一张[表格](./table)，或把 `api.table` 交给表格组件（Vue 与 React 从根的作用域插槽 / 函数式 children 取 `table`，Web Components 读元素的 `table`）。

### 反模式

- 把有回流的数据硬画成桑基图：成环会报错，拆掉回流又会让读者误以为流量在减少。
- 同一张图里流量差几个数量级：最细的流带只剩一根线，读者看不到，改为把小流合并或单独画。
- 给每个节点一个颜色：颜色多到分不清，也没有表达任何分组。
- 用提示框作为读取数值的唯一途径：提示框对读屏隐藏，数值要能从可及名、摘要或数据表读到。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-sankey-chart>` |
| Vue 组件 | `XhSankeyChartCaption` `XhSankeyChartEmpty` `XhSankeyChartLegend` `XhSankeyChartPlot` `XhSankeyChartRoot` `XhSankeyChartTooltip` `XhSankeyChartViewport` |
| 组合式函数 | `useSankeyChart` |
| 状态机 | `sankeyChartMachine` |
| 皮肤 | `@xihan-ui/styles/sankey-chart.css` |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `hidden-series-change` | `ChartHiddenSeriesChangeDetails` | 图例切换显隐；detail 为 `{ hiddenSeries: string[] }` |
| `active-key-change` | `ChartActiveKeyChangeDetails` | 指针或键盘换了激活的节点或流带；detail 为 `{ activeKey }`，收起时为 null |
| `datum-active` | `ChartDatumDetails` | 悬停或聚焦到某个节点或流带；detail 为数据详情，收起时为 null |
| `datum-press` | `ChartDatumDetails` | 指针点击、Enter 或 Space 按在某个节点或流带上；detail 为数据详情 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSankeyChartRoot` | `default` | `SankeyChartRootSlotProps` | 自行摆放部件；不写时铺开缺省结构：图例、视口（绘图区与空态）、提示框。 |
| `XhSankeyChartRoot` | `caption` | — | 缺省结构里的标题内容。 |
| `XhSankeyChartRoot` | `tooltip` | `SankeyChartTooltipSlotProps` | 缺省结构里的提示框内容。 |
| `XhSankeyChartRoot` | `empty` | — | 缺省结构里的空态内容。 |
| `XhSankeyChartTooltip` | `default` | `SankeyChartTooltipSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhSankeyChartRoot` | `nodes` | `readonly SankeyNodeDatum[]` |  | 节点：身份、名字与分组；缺省按流带里出现的先后推断。 |
| `XhSankeyChartRoot` | `links` | `readonly SankeyLinkDatum[]` |  | 流带：源、目标与流量。 |
| `XhSankeyChartRoot` | `orientation` | `SankeyOrientation` |  | 流向，缺省 horizontal。 |
| `XhSankeyChartRoot` | `nodeAlign` | `SankeyNodeAlign` |  | 节点分列的方式，缺省 justify。 |
| `XhSankeyChartRoot` | `linkColor` | `SankeyLinkColor` |  | 流带的颜色，缺省 neutral。 |
| `XhSankeyChartRoot` | `nodeSort` | `SankeyNodeSort` |  | 列内次序，缺省 auto。 |
| `XhSankeyChartRoot` | `format` | `NumberFormatSpec \| ((value: number) => string)` |  | 数值格式。 |
| `XhSankeyChartRoot` | `hiddenSeries` | `string[]` |  | 隐藏的分组（受控）。 |
| `XhSankeyChartRoot` | `defaultHiddenSeries` | `string[]` |  | 初始隐藏的分组（非受控）。 |
| `XhSankeyChartRoot` | `activeKey` | `ChartKey \| null` |  | 激活的键（受控）：与别的图联动时是节点的身份或「源→目标」。 |
| `XhSankeyChartRoot` | `pending` | `boolean` |  | 数据重取中：保留上一帧、整体降低不透明度。 |
| `XhSankeyChartRoot` | `animated` | `boolean` |  | 播放过渡动画，缺省 true；false 时直接画终态。 |
| `XhSankeyChartRoot` | `locale` | `string` |  |  |
| `XhSankeyChartRoot` | `translations` | `Partial<SankeyChartTranslations>` |  |  |
| `XhSankeyChartRoot` | `onHiddenSeriesChange` | `SankeyChartProps['onHiddenSeriesChange']` |  |  |
| `XhSankeyChartRoot` | `onActiveKeyChange` | `SankeyChartProps['onActiveKeyChange']` |  |  |
| `XhSankeyChartRoot` | `onDatumActive` | `SankeyChartProps['onDatumActive']` |  |  |
| `XhSankeyChartRoot` | `onDatumPress` | `SankeyChartProps['onDatumPress']` |  |  |
| `XhSankeyChartRoot` | `caption` | `ReactNode` |  | 缺省结构里的标题内容。 |
| `XhSankeyChartRoot` | `renderTooltip` | `(props: SankeyChartTooltipSlotProps) => ReactNode` |  | 缺省结构里的提示框内容。 |
| `XhSankeyChartRoot` | `empty` | `ReactNode` |  | 缺省结构里的空态内容。 |
| `XhSankeyChartRoot` | `children` | `SlotChildren<SankeyChartRootSlotProps>` |  | 自行摆放部件；不写时铺开缺省结构：图例、视口（绘图区与空态）、提示框。 |
| `XhSankeyChartTooltip` | `children` | `SlotChildren<SankeyChartTooltipSlotProps>` |  | 替换缺省内容；函数式 children 拿到激活的节点或流带与缺省的内容模型。 |

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
| `model` | `SankeyModel` | 管线产物：图、布局、场景与无障碍模型。 |
| `scene` | `Scene` | 要画的场景；尚未测量时为空场景。 |
| `overlay` | `SankeyOverlay` | 前景层：焦点环。 |
| `measured` | `boolean` | 视口尚未测量（服务端与首帧）。 |
| `empty` | `boolean` | 没有可画的流带。 |
| `legendItems` | `readonly SankeyLegendItem[]` |  |
| `gradients` | `readonly SankeyGradient[]` | linkColor="gradient" 时每条流带一个渐变；其余时候为空。 |
| `active` | `ChartDatumDetails \| null` | 激活的节点或流带；没有时为 null。 |
| `tooltip` | `SankeyTooltipModel \| null` | 提示框内容；收起时为 null。 |
| `summary` | `string` |  |
| `table` | `TableModel` | 数据表模型：每条流带一行，源、目标与流量三列。 |
| `emptyText` | `string` |  |
| `tableCaption` | `string` |  |
| `activeKey` | `ChartKey \| null` |  |
| `hiddenSeries` | `string[]` |  |
| `toggleSeries` | `(id: string) => void` | 切换某个分组的显隐。 |
| `setFocusedDatum` | `(ref: { seriesId: string, index: number } \| null) => void` | 移动键盘锚点：只改锚点，不移动 DOM 焦点，也不派发回调。 |
| `markTag` | `(mark: Mark) => SankeyMarkTag` |  |
| `getRootProps` | `() => T['element']` |  |
| `getCaptionProps` | `() => T['element']` |  |
| `getLegendProps` | `() => T['element']` |  |
| `getLegendItemProps` | `(item: SankeyLegendItem) => T['button']` |  |
| `getLegendSwatchProps` | `(item: SankeyLegendItem) => T['element']` |  |
| `getLegendLabelProps` | `(item: SankeyLegendItem) => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getPlotProps` | `() => T['element']` |  |
| `getDefsProps` | `() => T['element']` | 绘图区的第一个子节点：流带渐变定义在这里。 |
| `getGradientProps` | `(gradient: SankeyGradient) => T['element']` |  |
| `getGradientStopProps` | `(gradient: SankeyGradient, at: 'from' \| 'to') => T['element']` |  |
| `getMarkProps` | `(mark: Mark) => T['element']` |  |
| `getTooltipProps` | `() => T['element']` |  |
| `getTooltipHeaderProps` | `() => T['element']` |  |
| `getTooltipRowProps` | `(row: SankeyTooltipRow) => T['element']` |  |
| `getTooltipSwatchProps` | `(row: SankeyTooltipRow) => T['element']` |  |
| `getTooltipValueProps` | `(row: SankeyTooltipRow) => T['element']` |  |
| `getTooltipNameProps` | `(row: SankeyTooltipRow) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` |  |
| `getSummaryProps` | `() => T['element']` |  |
| `getTableRegionProps` | `() => T['element']` | 数据表的视觉隐藏区域：块级、1px、裁掉，表格放在里面；隐藏不写在表格上，表格的高度收不住。 |
| `getTableProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | 总是 | 绘图区只占一个 Tab 位：焦点落到锚点节点，首次为第一列最上面的节点；图例同样只占一个 Tab 位 |
| `ArrowDown` | 焦点在绘图区 | 同一列的下一个节点（竖排时是 ArrowRight）；已在最后一个则原地不动 |
| `ArrowUp` | 焦点在绘图区 | 同一列的上一个节点（竖排时是 ArrowLeft） |
| `ArrowRight` | 焦点在绘图区 | 下游相邻的一列：取与当前节点流量最大的相连节点，没有相连的就取位置最近的（竖排时是 ArrowDown） |
| `ArrowLeft` | 焦点在绘图区 | 上游相邻的一列，取法同上（竖排时是 ArrowUp） |
| `Home` | 焦点在绘图区 | 第一列里位置最近的节点 |
| `End` | 焦点在绘图区 | 最后一列里位置最近的节点 |
| `Enter` / `Space` | 焦点在绘图区 | 报告聚焦的节点（onDatumPress） |
| `Escape` | 提示框显示着 | 收起提示框，焦点留在原处；按键不拦截，外层浮层的关闭仍归它自己 |
| `ArrowLeft` / `ArrowRight` / `Home` / `End` | 焦点在图例 | 在图例项之间移动，左右键跟随文字方向的视觉次序 |
| `Enter` / `Space` | 焦点在图例项 | 切换该分组的显隐（原生按钮行为） |

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
- 绘图区是 `role="graphics-document"`，`aria-describedby` 指向组件生成的摘要；每个节点是 `role="graphics-symbol"`，名称取 `translations.datumLabel`（缺省「名字, 流量」），务必按本地语言改写。流带对读屏隐藏，也不占焦点：它们的数据全部在数据表里。
- 绘图区只占一个 Tab 位，焦点落在节点上：上下键在同一列里走，左右键沿流向跨到相邻的列，取与当前节点流量最大的相连节点，没有相连的就取位置最近的；竖排时两组键对调。Home / End 到第一列与最后一列。焦点环画在节点之外，只在键盘聚焦时出现。
- 节点名、流带与焦点环一律 `aria-hidden`；提示框同样 `aria-hidden`。
- 组件在根内生成一段摘要与一张数据表，视觉隐藏、对读屏可见：摘要写节点数、流带数、源头的流出合计与最大的一条流带（模板是 `translations.summary`）；数据表每条流带一行，源、目标与流量三列。
- 图例是 `role="toolbar"`，每一项是 `<button aria-pressed>`，按下表示这一组可见；图例整体只占一个 Tab 位。
- 颜色不是区分分组的唯一线索：节点的名字写在图上，图例写出分组名；强制色下节点画成系统色的面与描边。
- 过渡只改画面：节点的名称、摘要与数据表在数据变化的那一刻就按新数据更新；收场中的节点 `aria-hidden`、不可聚焦。

## 样式参考

### 皮肤

`@xihan-ui/styles/sankey-chart.css` 按 `[data-scope="sankey-chart"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-sankey-chart` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

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
| `gradient-stop` | `data-xh-chart-slot` | String(at === 'from' ? gradient.from : gradient.to) |
| `tooltip` | `data-placement` | 'top' \| 'bottom'-'right' \| 'left' \| undefined |
| `tooltip` | `data-state` | 'visible' \| 'hidden' |
| `tooltip` | `data-xh-chart-part` | 'tooltip' |
| `tooltip-header` | `data-xh-chart-part` | 'tooltip-header' |
| `tooltip-row` | `data-xh-chart-part` | 'tooltip-row' |
| `tooltip-row` | `data-xh-chart-pattern` | undefined \| String(row.slot) |
| `tooltip-row` | `data-xh-chart-slot` | undefined \| String(row.slot) |
| `tooltip-swatch` | `data-xh-chart-part` | 'tooltip-swatch' |
| `tooltip-value` | `data-xh-chart-part` | 'tooltip-value' |
| `tooltip-name` | `data-xh-chart-part` | 'tooltip-name' |
| `empty` | `data-loading` | ''（条件成立时才出现） |
| `empty` | `data-state` | 'loading' \| undefined |
| `empty` | `data-xh-chart-part` | 'empty' |
| `empty` | `data-xh-loading-ring` | '' |
| `mark` | `data-dimmed` | ''（条件成立时才出现） |
| `mark` | `data-xh-chart-part` | mark.part \| undefined |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-sankey-chart-empty-gap` | `empty` | `gap` | `state=loading` | `--xh-space-2` | sankey-chart 的 empty 部件 gap 覆盖槽。 |
| `--xh-sankey-chart-gap` | `root` | `gap` | `default` | `--xh-space-3` | sankey-chart 的 root 部件 gap 覆盖槽。 |
| `--xh-sankey-chart-height` | `viewport` | `block-size` | `default` | `--xh-chart-height` | sankey-chart 的 viewport 部件 block-size 覆盖槽。 |
| `--xh-sankey-chart-legend-gap` | `legend` | `gap` | `default` | `--xh-space-1` | sankey-chart 的 legend 部件 gap 覆盖槽。 |
| `--xh-sankey-chart-legend-swatch-radius` | `legend-swatch` | `border-radius` | `default` | `--xh-shape-inset` | sankey-chart 的 legend-swatch 部件 border-radius 覆盖槽。 |
| `--xh-sankey-chart-link-alpha` | `link` | `fill-opacity` | `default` | `--xh-chart-link-alpha` | sankey-chart 的 link 部件 fill-opacity 覆盖槽。 |
| `--xh-sankey-chart-link-color` | `link` | `fill` | `default` | `--xh-chart-categorical-other` | sankey-chart 的 link 部件 fill 覆盖槽。 |
| `--xh-sankey-chart-node-radius` | `root` | `--xh-_chart-metric-radius` | `default` | `--xh-shape-inset` | sankey-chart 的 root 部件 --xh-_chart-metric-radius 覆盖槽。 |
| `--xh-sankey-chart-node-width` | `root` | `--xh-_chart-metric-bar-max` | `default` | `--xh-space-3` | sankey-chart 的 root 部件 --xh-_chart-metric-bar-max 覆盖槽。 |
| `--xh-sankey-chart-series-color` | `gradient-stop`<br>`legend-swatch`<br>`link`<br>`node`<br>`pattern-line`<br>`tooltip-swatch` | `background`<br>`border`<br>`fill`<br>`stop-color`<br>`stroke` | `@media (forced-colors: active)`<br>`@media print`<br>`mark=line`<br>`where([data-xh-chart-patterns])`<br>`xh-chart-pattern`<br>`xh-chart-pattern=1`<br>`xh-chart-pattern=2`<br>`xh-chart-pattern=3`<br>`xh-chart-pattern=4`<br>`xh-chart-pattern=5`<br>`xh-chart-pattern=6`<br>`xh-chart-pattern=7`<br>`xh-chart-pattern=8`<br>`xh-chart-patterns`<br>`xh-chart-slot`<br>`xh-chart-slot=1`<br>`xh-chart-slot=2`<br>`xh-chart-slot=3`<br>`xh-chart-slot=4`<br>`xh-chart-slot=5`<br>`xh-chart-slot=6`<br>`xh-chart-slot=7`<br>`xh-chart-slot=8` | `--xh-chart-categorical-1`<br>`--xh-chart-categorical-2`<br>`--xh-chart-categorical-3`<br>`--xh-chart-categorical-4`<br>`--xh-chart-categorical-5`<br>`--xh-chart-categorical-6`<br>`--xh-chart-categorical-7`<br>`--xh-chart-categorical-8` | sankey-chart 的 gradient-stop、legend-swatch、link、node、pattern-line、tooltip-swatch 部件 background、border、fill、stop-color、stroke 覆盖槽。 |
| `--xh-sankey-chart-tooltip-gap` | `tooltip` | `gap` | `default` | `--xh-space-1` | sankey-chart 的 tooltip 部件 gap 覆盖槽。 |
| `--xh-sankey-chart-tooltip-px` | `tooltip` | `padding-inline` | `default` | `--xh-surface-pad-sm` | sankey-chart 的 tooltip 部件 padding-inline 覆盖槽。 |
| `--xh-sankey-chart-tooltip-py` | `tooltip` | `padding-block` | `default` | `--xh-surface-pad-sm` | sankey-chart 的 tooltip 部件 padding-block 覆盖槽。 |
| `--xh-sankey-chart-tooltip-radius` | `tooltip` | `border-radius` | `default` | `--xh-shape-overlay` | sankey-chart 的 tooltip 部件 border-radius 覆盖槽。 |
| `--xh-sankey-chart-tooltip-row-gap` | `tooltip-row` | `gap` | `default` | `--xh-space-2` | sankey-chart 的 tooltip-row 部件 gap 覆盖槽。 |
| `--xh-sankey-chart-tooltip-shadow` | `tooltip` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | sankey-chart 的 tooltip 部件 box-shadow 覆盖槽。 |
| `--xh-sankey-chart-tooltip-swatch-radius` | `tooltip-swatch` | `border-radius` | `default` | `--xh-shape-inset` | sankey-chart 的 tooltip-swatch 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：状态 · 出现（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-fade-in` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`opacity` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 绘图区不随文字方向镜像：横排时流向始终自左而右，右键始终是下游。
- 图例、标题与提示框的内容随文字方向排列，图例的左右键跟随视觉次序翻转。
