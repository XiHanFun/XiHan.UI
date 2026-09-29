const n=`<!-- 旭日图 | layout="sunburst" 从中间往外一层一环，自 12 点顺时针；点中间的空洞上钻一层 -->
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
<\/script>

<template>
  <XhHierarchyChartRoot
    :data="budget"
    layout="sunburst"
  >
    <template #caption>全年预算（万元）</template>
  </XhHierarchyChartRoot>
</template>
`;export{n as default};
