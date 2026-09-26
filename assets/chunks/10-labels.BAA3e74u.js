const a=`<!-- 数据标签与合计 | labels="inside" 把每一段的数写在柱内，totals 在整叠外侧写合计；段太矮放不下时不写 -->
<script setup lang="ts">
import { XhCartesianChartRoot } from "@xihan-ui/vue";

const quarters = [
  { quarter: "一季度", online: 42, store: 28, partner: 15 },
  { quarter: "二季度", online: 51, store: 26, partner: 18 },
  { quarter: "三季度", online: 48, store: 31, partner: 9 },
  { quarter: "四季度", online: 63, store: 34, partner: 21 },
];
<\/script>

<template>
  <XhCartesianChartRoot
    :data="quarters"
    :series="[
      { mark: 'bar', x: 'quarter', y: 'online', name: '线上', stack: 'sales', labels: 'inside' },
      { mark: 'bar', x: 'quarter', y: 'store', name: '门店', stack: 'sales', labels: 'inside' },
      { mark: 'bar', x: 'quarter', y: 'partner', name: '渠道', stack: 'sales', labels: 'inside' },
    ]"
    totals
  >
    <template #caption>各季度销售额（万元）</template>
  </XhCartesianChartRoot>
</template>
`;export{a as default};
