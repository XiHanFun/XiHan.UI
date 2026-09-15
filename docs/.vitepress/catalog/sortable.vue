<script setup lang="ts">
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/vue";

const items = [
  { id: "规划", tone: "brand" },
  { id: "设计", tone: "info" },
  { id: "实现", tone: "success" },
] as const;
</script>

<template>
  <XhSortableRoot :ids="items.map(item => item.id)" style="inline-size: 220px">
    <XhSortableItem
      v-for="item in items"
      :key="item.id"
      :item-id="item.id"
      :aria-label="item.id"
      style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
    >
      <XhSortableItemDragTrigger :item-id="item.id" />
      <span data-demo-block="line" :data-tone="item.tone" aria-hidden="true" />
    </XhSortableItem>
    <XhSortableDropIndicator />
    <XhSortableLiveRegion />
  </XhSortableRoot>
</template>
