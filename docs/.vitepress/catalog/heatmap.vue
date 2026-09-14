<script setup lang="ts">
import type { HeatmapDatum } from "@xihan-ui/headless";
import { formatHeatmapDate } from "@xihan-ui/headless";
import { XhHeatmapRoot } from "@xihan-ui/vue";

const DAY_MS = 86_400_000;
// 十二周的活动量：数值由天序号哈希出来，每次打开都长一样
const activity: HeatmapDatum[] = [];
let index = 0;
for (let time = Date.UTC(2024, 8, 1); time <= Date.UTC(2024, 10, 23); time += DAY_MS) {
  const noise = ((Math.imul(++index, 2654435761) >>> 8) % 1000) / 1000;
  activity.push({ date: formatHeatmapDate(time), count: noise < 0.2 ? 0 : Math.round(noise * 8) });
}
</script>

<template>
  <XhHeatmapRoot :value="activity" start-date="2024-09-01" end-date="2024-11-23" style="inline-size: 240px" />
</template>
