<!-- 禁用项目 | 固定单个项目的位置 -->
<script setup lang="ts">
import { XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ids = ref(["固定项", "设计", "实现", "发布"]);
const tones = ["neutral", "info", "success", "warning"] as const;
</script>

<template>
  <XhSortableRoot v-model:ids="ids" style="inline-size: min(360px, 100%)">
    <XhSortableItem
      v-for="(id, index) in ids"
      :key="id"
      :item-id="id"
      :disabled="id === '固定项'"
      :aria-label="id"
      style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
    >
      <XhSortableItemDragTrigger :item-id="id" :disabled="id === '固定项'" />
      <span data-demo-block="line" :data-tone="tones[index]" />
    </XhSortableItem>
    <XhSortableLiveRegion />
  </XhSortableRoot>
</template>
