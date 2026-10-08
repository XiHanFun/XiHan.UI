var e=`<!-- 趋势线 | trend 画移动平均或最小二乘直线：看的是走向，不是某一天的起伏 -->
<script setup lang="ts">
import { XhCartesianChartRoot } from "@xihan-ui/vue";

// 30 天的日活，由序号算出，每次打开都长一样
function noise(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
const days = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  active: Math.round(1200 + i * 18 + (noise(i) - 0.5) * 320),
}));

const series = [{ mark: "line", x: "day", y: "active", name: "日活", symbols: "none" }] as const;

// 移动平均抹平日间的起伏；直线看整个月是涨是跌
const annotations = [
  { kind: "trend", series: "active", method: "moving-average", window: 7, label: "7 日均线" },
  { kind: "trend", series: "active", method: "linear" },
] as const;
<\/script>

<template>
  <XhCartesianChartRoot :data="days" :series="series" :annotations="annotations" :x-axis="{ title: '日' }">
    <template #caption>本月日活</template>
  </XhCartesianChartRoot>
</template>
`;export{e as default};