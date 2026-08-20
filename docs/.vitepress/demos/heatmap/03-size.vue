<!-- 尺寸 | size 换格子边长与行首星期名的留白，一屏能放下的周数跟着变 -->
<script setup lang="ts">
import type { HeatmapDatum } from "@xihan-ui/headless";
import { formatHeatmapDate } from "@xihan-ui/headless";
import { XhHeatmapRoot } from "@xihan-ui/vue";

const DAY_MS = 86_400_000;

// 与基础用法同一份年度数据：只换尺寸档，看同一年占多宽
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
</script>

<template>
  <div style="display: grid; gap: 16px">
    <!-- sm 档格子最小：同样一整年 53 列，md 档要 774px，这一档 660px，一屏放得下 -->
    <XhHeatmapRoot
      :value="activity"
      start-date="2024-01-01"
      end-date="2024-12-31"
      size="sm"
    />
    <!-- lg 档格子 12px：一整年要 880px 上下，多数容器里都会横向滚 -->
    <XhHeatmapRoot
      :value="activity"
      start-date="2024-01-01"
      end-date="2024-12-31"
      size="lg"
    />
  </div>
</template>
