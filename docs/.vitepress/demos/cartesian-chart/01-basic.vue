<!-- 基础用法 | 一个柱系列：x 取类目字段，y 取数值字段，悬停或用方向键逐个查看 -->
<script setup lang="ts">
import { XhCartesianChartRoot } from "@xihan-ui/vue";

const sales = [
  { month: "一月", amount: 1204 },
  { month: "二月", amount: 986 },
  { month: "三月", amount: 1530 },
  { month: "四月", amount: 1382 },
  { month: "五月", amount: 1745 },
  { month: "六月", amount: 1618 },
];
</script>

<template>
  <!-- 不写默认插槽即铺开缺省结构：视口与绘图区、提示框、空态；一个系列时不出图例 -->
  <XhCartesianChartRoot
    :data="sales"
    :series="[{ mark: 'bar', x: 'month', y: 'amount', name: '销售额' }]"
  >
    <template #caption>月度销售额</template>
  </XhCartesianChartRoot>
</template>
