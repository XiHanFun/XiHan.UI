const n=`<!-- 语义系列 | 颜色本身带好坏含义时写 tone：收入取成功色、支出取危险色，不再按次序取分类色 -->
<script setup lang="ts">
import { XhCartesianChartRoot } from "@xihan-ui/vue";

const cashflow = [
  { month: "1月", income: 86, expense: 64 },
  { month: "2月", income: 72, expense: 70 },
  { month: "3月", income: 95, expense: 68 },
  { month: "4月", income: 88, expense: 91 },
  { month: "5月", income: 104, expense: 77 },
  { month: "6月", income: 112, expense: 80 },
];

// 同一张图只用一种颜色角色：要么都写 tone，要么都按次序取分类色
const series = [
  { mark: "bar", x: "month", y: "income", name: "收入", tone: "success" },
  { mark: "bar", x: "month", y: "expense", name: "支出", tone: "danger" },
] as const;
<\/script>

<template>
  <XhCartesianChartRoot :data="cashflow" :series="series">
    <template #caption>月度收支（万元）</template>
  </XhCartesianChartRoot>
</template>
`;export{n as default};
