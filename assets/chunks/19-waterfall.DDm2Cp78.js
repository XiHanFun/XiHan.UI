const t=`<!-- 瀑布 | waterfall 让每一步接在上一步的累计值上，涨跌分色；total 为真的行是小计，从 0 画到累计值 -->
<script setup lang="ts">
import { XhCartesianChartRoot } from "@xihan-ui/vue";

const profit = [
  { item: "营收", amount: 820 },
  { item: "成本", amount: -410 },
  { item: "毛利", total: true },
  { item: "销售", amount: -120 },
  { item: "研发", amount: -95 },
  { item: "其他收益", amount: 36 },
  { item: "净利", total: true },
];

const series = [{ mark: "bar", x: "item", y: "amount", name: "利润（万元）", waterfall: { total: "total" }, labels: "end" }] as const;
<\/script>

<template>
  <XhCartesianChartRoot :data="profit" :series="series">
    <template #caption>本季利润构成（万元）</template>
  </XhCartesianChartRoot>
</template>
`;export{t as default};
