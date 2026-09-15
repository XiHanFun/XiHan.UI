const t=`<!-- 档数 | levels 决定分几档，图例与格子共用同一条色阶 -->
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
<\/script>

<template>
  <!-- 三档：没有数据、少、多。要自己定分档边界就改传 thresholds -->
  <XhHeatmapRoot
    :value="activity"
    start-date="2024-01-01"
    end-date="2024-01-28"
    :levels="3"
  />
</template>
`;export{t as default};
