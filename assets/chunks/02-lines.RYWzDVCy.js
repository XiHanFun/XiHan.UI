const n=`<!-- 多系列折线 | 三条折线共用坐标轴，图例点一下隐藏或恢复一个系列，其余系列颜色不变 -->
<script setup lang="ts">
import { XhCartesianChartRoot } from "@xihan-ui/vue";

const visits = [
  { month: "1月", web: 820, ios: 540, android: 610 },
  { month: "2月", web: 760, ios: 580, android: 650 },
  { month: "3月", web: 910, ios: 640, android: 720 },
  { month: "4月", web: 880, ios: 700, android: 760 },
  { month: "5月", web: 950, ios: 760, android: 840 },
  { month: "6月", web: 1010, ios: 830, android: 900 },
  { month: "7月", web: 970, ios: 880, android: 960 },
  { month: "8月", web: 1040, ios: 920, android: 1010 },
];

// 系列的 id 缺省取 y 的字段名；name 是图例与提示框里的字
const series = [
  { mark: "line", x: "month", y: "web", name: "网页" },
  { mark: "line", x: "month", y: "ios", name: "iOS" },
  { mark: "line", x: "month", y: "android", name: "Android" },
] as const;
<\/script>

<template>
  <XhCartesianChartRoot :data="visits" :series="series">
    <template #caption>各端月活跃用户（千人）</template>
  </XhCartesianChartRoot>
</template>
`;export{n as default};
