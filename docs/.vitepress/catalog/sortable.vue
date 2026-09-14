<script setup lang="ts">
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/vue";

const ids = ["规划", "设计", "实现"];
</script>

<template>
  <XhSortableRoot :ids="ids" style="inline-size: 220px">
    <XhSortableItem
      v-for="id in ids"
      :key="id"
      :item-id="id"
      style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
    >
      <XhSortableItemDragTrigger :item-id="id" />
      <span>{{ id }}</span>
    </XhSortableItem>
    <XhSortableDropIndicator />
    <XhSortableLiveRegion />
  </XhSortableRoot>
</template>
