const n=`<!-- 按时区排时间刻度 | xAxis.timeZone 写 IANA 名：整点与整天落在那个时区的墙上时间上，刻度标签、提示框与数据表里的日期都按它写 -->
<script setup lang="ts">
import { XhCartesianChartRoot } from "@xihan-ui/vue";

// 数据按 UTC 采样，第一条是东京 3 月 2 日零点
const points = Array.from({ length: 13 }, (_, i) => ({
  time: new Date(Date.UTC(2024, 2, 1, 15 + i * 6)),
  requests: Math.round(40 + 30 * Math.sin(i / 2)),
}));

const series = [{ mark: "line", x: "time", y: "requests", name: "请求量" }] as const;

// 刻度按东京的墙上时间排：看的人在哪儿都一样
const xAxis = { scale: "utc", timeZone: "Asia/Tokyo" } as const;
<\/script>

<template>
  <XhCartesianChartRoot
    :data="points"
    :series="series"
    :x-axis="xAxis"
  >
    <template #caption>东京机房每 6 小时请求量（万次）</template>
  </XhCartesianChartRoot>
</template>
`;export{n as default};
