<!-- 禁用项目 | 固定单个项目的位置 -->
<script setup lang="ts">
import { XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ids = ref(["固定项", "设计", "实现", "发布"]);
</script>

<template>
  <XhSortableRoot v-model:ids="ids" style="inline-size: min(360px, 100%)">
    <XhSortableItem
      v-for="id in ids"
      :key="id"
      :item-id="id"
      :disabled="id === '固定项'"
      style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
    >
      <XhSortableItemDragTrigger :item-id="id" :disabled="id === '固定项'" />
      <span>{{ id }}</span>
    </XhSortableItem>
    <XhSortableLiveRegion />
  </XhSortableRoot>
</template>
