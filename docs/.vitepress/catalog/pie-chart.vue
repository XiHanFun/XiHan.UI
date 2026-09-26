<script setup lang="ts">
import { XhPieChartRoot } from "@xihan-ui/vue";

const channels = [
  { channel: "搜索", visits: 42 },
  { channel: "直接访问", visits: 26 },
  { channel: "社交", visits: 18 },
  { channel: "邮件", visits: 9 },
];
</script>

<template>
  <!-- 卡片只有一块可用高：视口高度取卡片下发的那个值，不带标题，标签留给正文页 -->
  <XhPieChartRoot
    :data="channels"
    name-field="channel"
    value-field="visits"
    labels="none"
    aria-label="访问来源"
    style="inline-size: var(--xh-doc-catalog-w); --xh-pie-chart-height: var(--xh-doc-catalog-h)"
  />
</template>
