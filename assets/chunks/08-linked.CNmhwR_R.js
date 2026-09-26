const e=`<!-- 两张图联动 | 两个量纲不共用一根 y 轴：两张图接到同一个受控的 activeKey，在同一个键上一起指示 -->
<script setup lang="ts">
import type { ChartKey } from "@xihan-ui/headless";
import { XhCartesianChartRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const weeks = [
  { week: "第 1 周", orders: 1320, rate: 0.031 },
  { week: "第 2 周", orders: 1485, rate: 0.034 },
  { week: "第 3 周", orders: 1610, rate: 0.029 },
  { week: "第 4 周", orders: 1540, rate: 0.036 },
  { week: "第 5 周", orders: 1790, rate: 0.041 },
  { week: "第 6 周", orders: 1720, rate: 0.038 },
];

// 任一张图上的指针或键盘换了键，另一张跟着显示十字准线与提示框
const activeKey = ref<ChartKey | null>(null);
<\/script>

<template>
  <div :style="{ display: 'grid', gap: 'var(--xh-space-6)', width: '100%' }">
    <XhCartesianChartRoot
      v-model:active-key="activeKey"
      :data="weeks"
      :series="[{ mark: 'bar', x: 'week', y: 'orders', name: '订单量' }]"
    >
      <template #caption>周订单量</template>
    </XhCartesianChartRoot>
    <XhCartesianChartRoot
      v-model:active-key="activeKey"
      :data="weeks"
      :series="[{ mark: 'line', x: 'week', y: 'rate', name: '转化率' }]"
      :y-axis="{ format: { style: 'percent', precision: { type: 'fixed', digits: 1 } } }"
    >
      <template #caption>周转化率</template>
    </XhCartesianChartRoot>
  </div>
</template>
`;export{e as default};
