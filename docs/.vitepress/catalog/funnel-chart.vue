<script setup lang="ts">
import { XhFunnelChartRoot } from "@xihan-ui/vue";

const steps = [
  { stage: "浏览", users: 12800 },
  { stage: "加购", users: 5200 },
  { stage: "下单", users: 2300 },
  { stage: "支付", users: 1850 },
];
</script>

<template>
  <!-- 卡片只有一块可用高：视口高度取卡片下发的那个值，不带标题，不写转化率 -->
  <XhFunnelChartRoot
    :data="steps"
    name-field="stage"
    value-field="users"
    conversion="none"
    aria-label="购买流程"
    style="inline-size: var(--xh-doc-catalog-w); --xh-funnel-chart-height: var(--xh-doc-catalog-h)"
  />
</template>
