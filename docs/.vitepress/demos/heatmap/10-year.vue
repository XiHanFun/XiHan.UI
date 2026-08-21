<!-- 年份切换 | 一排按钮换的是区间，网格、月份段、色阶与锚点全按新区间从头算 -->
<script setup lang="ts">
import type { HeatmapDatum } from "@xihan-ui/headless";
import { computed, ref } from "vue";
import { formatHeatmapDate } from "@xihan-ui/headless";
import { XhButton, XhHeatmapRoot } from "@xihan-ui/vue";

const DAY_MS = 86_400_000;

// 一段区间的提交量：数值由天序号哈希出来，同一段区间恒出同一份数据
function buildRange(start: string, end: string): HeatmapDatum[] {
  const days: HeatmapDatum[] = [];
  const from = Date.parse(`${start}T00:00:00Z`);
  const to = Date.parse(`${end}T00:00:00Z`);
  let index = 0;
  for (let time = from; time <= to; time += DAY_MS) {
    const at = new Date(time);
    const noise = ((Math.imul(++index, 2654435761) >>> 8) % 1000) / 1000;
    const weekend = at.getUTCDay() === 0 || at.getUTCDay() === 6;
    const ceiling = weekend ? 4 : 8;
    days.push({ date: formatHeatmapDate(time), count: noise < 0.2 ? 0 : Math.round(noise * ceiling) });
  }
  return days;
}

// 今天按 UTC 取整到当天零点，「最近一年」从它往回数 364 天
const today = Math.floor(Date.now() / DAY_MS) * DAY_MS;

const ranges = [
  { key: "recent", label: "最近一年", start: formatHeatmapDate(today - 364 * DAY_MS), end: formatHeatmapDate(today) },
  { key: "2024", label: "2024", start: "2024-01-01", end: "2024-12-31" },
  { key: "2023", label: "2023", start: "2023-01-01", end: "2023-12-31" },
  { key: "2022", label: "2022", start: "2022-01-01", end: "2022-12-31" },
];

const activeKey = ref(ranges[0].key);
const active = computed(() => ranges.find((r) => r.key === activeKey.value) ?? ranges[0]);
// 数据跟着区间换：区间外的日子不进网格，也不把档位标尺顶高
const activity = computed(() => buildRange(active.value.start, active.value.end));
</script>

<template>
  <div style="display: grid; gap: 12px">
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <XhButton
        v-for="range in ranges"
        :key="range.key"
        size="sm"
        :variant="range.key === activeKey ? 'solid' : 'outline'"
        @click="activeKey = range.key"
      >
        {{ range.label }}
      </XhButton>
    </div>
    <!-- 换区间不必自己动手清理：上一次聚焦的那一格不在新区间里时，
         Tab 位自动退回新网格文档序的头一格 -->
    <XhHeatmapRoot
      :value="activity"
      :start-date="active.start"
      :end-date="active.end"
    />
  </div>
</template>
