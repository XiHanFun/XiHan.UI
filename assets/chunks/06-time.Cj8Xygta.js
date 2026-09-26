const n=`<!-- 时间轴 | 自变量给 Date，横轴换成时间比例尺：刻度按日期取整，间隔不均的日期按真实间距排开 -->
<script setup lang="ts">
import { XhCartesianChartRoot } from "@xihan-ui/vue";

// 两个月的日订单量，由日序号算出，每次打开都长一样
const orders = Array.from({ length: 61 }, (_, i) => ({
  date: new Date(2026, 6, 1 + i),
  count: Math.round(420 + i * 3 + Math.sin(i / 5) * 40 + Math.cos(i / 11) * 25),
}));

// monotone 平滑且不越过数据点，不会画出数据里没有的峰谷
const series = [{ mark: "line", x: "date", y: "count", name: "订单量", curve: "monotone", area: true }] as const;
<\/script>

<template>
  <XhCartesianChartRoot
    :data="orders"
    :series="series"
    :x-axis="{ format: { month: 'numeric', day: 'numeric' } }"
  >
    <template #caption>日订单量</template>
  </XhCartesianChartRoot>
</template>
`;export{n as default};
