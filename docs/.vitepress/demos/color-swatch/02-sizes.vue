<!-- 尺寸 | sm / md / lg 三档换的是边长与棋盘格粒度，圆角恒是内嵌档 -->
<script setup lang="ts">
import { XhColorSwatch } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
    <XhColorSwatch value="#3b82f6" size="sm" label="小" />
    <XhColorSwatch value="#3b82f6" label="中" />
    <XhColorSwatch value="#3b82f6" size="lg" label="大" />
  </div>
</template>
