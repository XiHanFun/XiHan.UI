const e=`<!-- 基础用法 | 节点分列排开，流带的宽度与流量成正比；节点按分组着色，悬停节点时相连的流带换成它的颜色 -->
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
<\/script>

<template>
  <XhSankeyChartRoot
    :nodes="nodes"
    :links="links"
  >
    <template #caption>本周访客流向</template>
  </XhSankeyChartRoot>
</template>
`;export{e as default};
