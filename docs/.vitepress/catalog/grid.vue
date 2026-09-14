<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const cellStyle = "min-inline-size: 0; padding: 10px 12px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)";
const metrics = [
  { label: "活跃", value: "12,860" },
  { label: "转化", value: "8.4%" },
  { label: "订单", value: "1,294" },
];
</script>

<template>
  <XhGridRoot :cols="3" gap="sm" style="inline-size: 240px">
    <XhGridItem v-for="metric in metrics" :key="metric.label" :style="cellStyle">
      <div style="color: var(--xh-fg-muted); font-size: 12px">{{ metric.label }}</div>
      <strong style="display: block; margin-block-start: 4px; font-size: 16px">{{ metric.value }}</strong>
    </XhGridItem>
  </XhGridRoot>
</template>
