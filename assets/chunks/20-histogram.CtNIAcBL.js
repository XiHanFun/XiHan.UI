var e=`<!-- 直方图 | 柱的 x 写成 [起, 止] 分箱区间，柱按区间的真实宽度画在数值轴上；分箱用 @xihan-ui/viz 的 bin() 或后端算好 -->
<script setup lang="ts">
import { XhCartesianChartRoot } from "@xihan-ui/vue";

// 200 次请求的耗时，由序号算出，每次打开都长一样
function noise(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
const samples = Array.from({ length: 200 }, (_, i) => Math.round(80 + (noise(i) + noise(i + 500) + noise(i + 900)) * 60));

// 每 20 毫秒一箱；高尾合成一箱，宽度照实画出
const edges = [80, 100, 120, 140, 160, 180, 200, 220, 260];
const bins = edges.slice(0, -1).map((from, i) => ({
  from,
  to: edges[i + 1]!,
  count: samples.filter(v => v >= from && (i === edges.length - 2 ? v <= edges[i + 1]! : v < edges[i + 1]!)).length,
}));

const series = [{ mark: "bar", x: ["from", "to"], y: "count", name: "请求数" }] as const;
<\/script>

<template>
  <XhCartesianChartRoot :data="bins" :series="series" :x-axis="{ title: '耗时（毫秒）' }">
    <template #caption>请求耗时分布</template>
  </XhCartesianChartRoot>
</template>
`;export{e as default};