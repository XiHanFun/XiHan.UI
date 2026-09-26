<!-- 半环 | sweep="half" 自 9 点扫到 3 点，高度只要一半，适合放在指标卡上方 -->
<script setup lang="ts">
import { XhPieChartRoot } from "@xihan-ui/vue";

// 半环的圆心在弦上，合计整块放在弦的上方、内圈里
const rows = [
  { item: "已支出", amount: 62 },
  { item: "已冻结", amount: 18 },
  { item: "可用", amount: 20 },
];
</script>

<template>
  <XhPieChartRoot
    :data="rows"
    name-field="item"
    value-field="amount"
    sweep="half"
    sort="none"
  >
    <template #caption>预算执行</template>
  </XhPieChartRoot>
</template>
