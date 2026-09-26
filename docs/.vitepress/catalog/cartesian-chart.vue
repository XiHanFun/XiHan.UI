<script setup lang="ts">
import { XhCartesianChartRoot } from "@xihan-ui/vue";

const sales = [
  { month: "1月", amount: 12 },
  { month: "2月", amount: 9 },
  { month: "3月", amount: 15 },
  { month: "4月", amount: 13 },
  { month: "5月", amount: 17 },
];
</script>

<template>
  <!-- 卡片只有一块可用高：视口高度取卡片下发的那个值，不带标题 -->
  <XhCartesianChartRoot
    :data="sales"
    :series="[{ mark: 'bar', x: 'month', y: 'amount', name: '销售额' }]"
    aria-label="月度销售额"
    style="inline-size: var(--xh-doc-catalog-w); --xh-cartesian-chart-height: var(--xh-doc-catalog-h)"
  />
</template>
