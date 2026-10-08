var e=`<!-- 按值着色 | color 把第三个量映射到顺序色阶，图例末尾多一条色阶；palette 把色阶换到别的色相上 -->
<script setup lang="ts">
import { XhCartesianChartRoot } from "@xihan-ui/vue";

// 一片区域里 60 个监测点的位置与 PM2.5 读数，由序号算出，每次打开都长一样
function noise(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
const stations = Array.from({ length: 60 }, (_, i) => {
  const east = Math.round(noise(i) * 100);
  const north = Math.round(noise(i + 60) * 100);
  const pm = Math.round(20 + (east + north) * 0.6 + noise(i + 120) * 30);
  return { east, north, pm };
});

const series = [{ mark: "scatter", x: "east", y: "north", color: "pm", name: "监测点" }] as const;
<\/script>

<template>
  <XhCartesianChartRoot
    :data="stations"
    :series="series"
    palette="teal"
    :x-axis="{ title: '向东（千米）' }"
    :y-axis="{ title: '向北（千米）' }"
    :translations="{ colorLabel: 'PM2.5' }"
  >
    <template #caption>各监测点的 PM2.5</template>
  </XhCartesianChartRoot>
</template>
`;export{e as default};