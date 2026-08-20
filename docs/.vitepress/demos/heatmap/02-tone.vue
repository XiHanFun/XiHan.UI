<!-- 语气换色 | tone 决定用哪族颜色，色阶两端跟着换，格子的分档不变 -->
<script setup lang="ts">
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
</script>

<template>
  <!-- 语气只换颜色族：档位怎么分由数据与 levels 决定，与它无关 -->
  <XhHeatmapRoot
    :value="activity"
    start-date="2024-01-01"
    end-date="2024-01-28" tone="success"
  />
</template>
