const t=`<!-- 月历形态 | 按自然月分块，每块是一张真月历，1 号落在它真实的星期几上 -->
<script setup lang="ts">
import { XhHeatmapRoot } from "@xihan-ui/vue";

const activity = [
  { date: "2024-01-16", count: 1 },
  { date: "2024-01-18", count: 3 },
  { date: "2024-01-22", count: 6 },
  { date: "2024-01-25", count: 2 },
  { date: "2024-01-29", count: 9 },
  { date: "2024-01-31", count: 4 },
  { date: "2024-02-05", count: 12 },
  { date: "2024-02-08", count: 7 },
  { date: "2024-02-10", count: 2 },
];
<\/script>

<template>
  <!-- 连续周列看不出月界，按自然月分块才比得了逐月的分布 -->
  <XhHeatmapRoot
    variant="month"
    :value="activity"
    start-date="2024-01-15"
    end-date="2024-02-11"
  />
</template>
`;export{t as default};
