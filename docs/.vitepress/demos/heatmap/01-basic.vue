<!-- 基础用法 | 一段日期铺成周列 × 星期行的方格阵，颜色深浅表示当天数值落在第几档 -->
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
  <!-- 不写默认插槽即按区间自动铺开：月份行、七行星期与图例一并渲染 -->
  <XhHeatmapRoot
    :value="activity"
    start-date="2024-01-01"
    end-date="2024-01-28"
  />
</template>
