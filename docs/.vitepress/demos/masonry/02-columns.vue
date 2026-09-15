<!-- 响应式列 | 根据容器宽度调整列数 -->
<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const items = [
  { id: 1, tone: "brand", height: "64px" },
  { id: 2, tone: "info", height: "76px" },
  { id: 3, tone: "success", height: "88px" },
  { id: 4, tone: "warning", height: "100px" },
] as const;
</script>

<template>
  <XhMasonry :columns="{ base: 1, sm: 2, md: 3 }" gap="sm" style="inline-size: min(720px, 100%)">
    <div
      v-for="item in items"
      :key="item.id"
      data-demo-block
      :data-tone="item.tone"
      :style="{ '--xh-demo-block-block-size': item.height }"
    />
  </XhMasonry>
</template>
