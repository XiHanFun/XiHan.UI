<script setup lang="ts">
import { XhRadarChartRoot } from "@xihan-ui/vue";

const phones = [
  { model: "旗舰机", camera: 92, battery: 70, screen: 88, performance: 95, price: 45 },
  { model: "中端机", camera: 74, battery: 86, screen: 72, performance: 70, price: 82 },
];

const indicators = [
  { key: "camera", label: "影像" },
  { key: "battery", label: "续航" },
  { key: "screen", label: "屏幕" },
  { key: "performance", label: "性能" },
  { key: "price", label: "性价比" },
];
</script>

<template>
  <!-- 卡片只有一块可用高：视口高度取卡片下发的那个值，不带标题 -->
  <XhRadarChartRoot
    :data="phones"
    name-field="model"
    :indicators="indicators"
    aria-label="两款手机的评测得分"
    style="inline-size: var(--xh-doc-catalog-w); --xh-radar-chart-height: var(--xh-doc-catalog-h)"
  />
</template>
