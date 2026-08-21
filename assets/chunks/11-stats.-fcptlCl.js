const t=`<!-- 数据统计 | 总天数、空白天数与占比、最大值、平均值都从网格模型直接读，不必自己再遍历一遍数据 -->
<script setup lang="ts">
import type { HeatmapDatum } from "@xihan-ui/headless";
import { computed } from "vue";
import { buildHeatmapGrid, formatHeatmapDate } from "@xihan-ui/headless";
import { XhHeatmapRoot } from "@xihan-ui/vue";

const DAY_MS = 86_400_000;
const START = "2024-01-01";
const END = "2024-12-31";

// 一整年的提交量：数值由天序号哈希出来，同一年恒出同一份数据
function buildYear(year: number): HeatmapDatum[] {
  const days: HeatmapDatum[] = [];
  let index = 0;
  for (let time = Date.UTC(year, 0, 1); time <= Date.UTC(year, 11, 31); time += DAY_MS) {
    const at = new Date(time);
    const noise = ((Math.imul(++index, 2654435761) >>> 8) % 1000) / 1000;
    const weekend = at.getUTCDay() === 0 || at.getUTCDay() === 6;
    const ceiling = weekend ? 4 : 10;
    days.push({ date: formatHeatmapDate(time), count: noise < 0.22 ? 0 : Math.round(noise * ceiling) });
  }
  return days;
}

const activity = buildYear(2024);

// 网格的推导是纯函数，与组件内部用的是同一份；写默认插槽时载荷里的 grid 也是它
const grid = computed(() => buildHeatmapGrid({ value: activity, startDate: START, endDate: END }));

const stats = computed(() => {
  const days = grid.value.cells.size;
  // 空白 = 值为 0 的格子：没有数据的日子与写了 0 的日子都算。
  // 它不是「色阶第 0 档的格子数」——这里没给 thresholds，首个下界恒为 1，两个数才恰好相等
  const empty = grid.value.emptyCount;
  return [
    { label: "总天数", value: \`\${days} 天\` },
    { label: "空白", value: \`\${empty} 天（\${days ? Math.round((empty / days) * 100) : 0}%）\` },
    { label: "最多", value: \`\${grid.value.max} 次\` },
    { label: "平均", value: \`\${days ? (grid.value.total / days).toFixed(1) : "0.0"} 次/天\` },
  ];
});
<\/script>

<template>
  <div style="display: grid; gap: 12px">
    <XhHeatmapRoot :value="activity" :start-date="START" :end-date="END" />
    <div style="display: flex; flex-wrap: wrap; gap: 16px">
      <span v-for="item in stats" :key="item.label">
        {{ item.label }}：<strong>{{ item.value }}</strong>
      </span>
    </div>
  </div>
</template>
`;export{t as default};
