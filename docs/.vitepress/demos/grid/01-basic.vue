<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 创建等宽列 -->
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const cellStyle
  = "min-inline-size: 0; padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)";

const metrics = [
  { label: "活跃用户", value: "12,860" },
  { label: "转化率", value: "8.4%" },
  { label: "订单", value: "1,294" },
];
</script>

<template>
  <XhGridRoot :cols="3" gap="md" style="inline-size: min(600px, 100%)">
    <XhGridItem v-for="metric in metrics" :key="metric.label" :style="cellStyle">
      <div style="color: var(--xh-fg-muted); font-size: 13px">{{ metric.label }}</div>
      <strong style="display: block; margin-block-start: 8px; font-size: 24px">{{ metric.value }}</strong>
    </XhGridItem>
  </XhGridRoot>
</template>
