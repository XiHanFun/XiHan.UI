<!-- 悬停详情 | 指针悬停与键盘聚焦走同一条路：详情条跟着那一格走，Escape 收起 -->
<script setup lang="ts">
import type { HeatmapCellDetails } from "@xihan-ui/headless";
import { XhHeatmapRoot } from "@xihan-ui/vue";

const activity = [
  { date: "2024-01-02", count: 1 },
  { date: "2024-01-04", count: 3 },
  { date: "2024-01-08", count: 6 },
  { date: "2024-01-11", count: 2 },
  { date: "2024-01-15", count: 9 },
  { date: "2024-01-17", count: 4 },
  { date: "2024-01-22", count: 12 },
  { date: "2024-01-25", count: 7 },
  { date: "2024-01-27", count: 2 },
];

// 详情条里写什么由作者定，组件只报是哪一格、数值多少
function readout(details: HeatmapCellDetails | null): string {
  return details ? `${details.date}：${details.count} 次（第 ${details.level} 档）` : "";
}

// 详情条对读屏是藏起来的，同一句必须同时当每格的可及名字，两处才不会各说各的
const translations = { cellLabel: readout };
</script>

<template>
  <!-- 写了 tooltip 插槽才会铺出详情条；同一份文字也在每格的可及名字里，读屏不缺信息 -->
  <XhHeatmapRoot
    :value="activity"
    :translations="translations"
    start-date="2024-01-01"
    end-date="2024-01-28"
  >
    <template #tooltip="details">{{ readout(details) }}</template>
  </XhHeatmapRoot>
</template>
