<!-- 自适应列 | 根据最小列宽自动排列 -->
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const features = [
  { id: 1, tone: "brand" },
  { id: 2, tone: "info" },
  { id: 3, tone: "success" },
  { id: 4, tone: "warning" },
  { id: 5, tone: "danger" },
  { id: 6, tone: "neutral" },
] as const;
</script>

<template>
  <XhGridRoot min-col-width="sm" gap="sm" style="inline-size: min(640px, 100%)">
    <XhGridItem
      v-for="feature in features"
      :key="feature.id"
      data-demo-block
      :data-tone="feature.tone"
    />
  </XhGridRoot>
</template>
