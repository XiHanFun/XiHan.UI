const t=`<!-- 悬停详情 | 指针悬停与键盘聚焦走同一条路：详情条跟着那一格走，Escape 收起 -->
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
  return details ? \`\${details.date}：\${details.count} 次（第 \${details.level} 档）\` : "";
}

// 详情条对读屏是藏起来的，同一句必须同时当每格的可及名字，两处才不会各说各的
const translations = { cellLabel: readout };
<\/script>

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
`;export{t as default};
