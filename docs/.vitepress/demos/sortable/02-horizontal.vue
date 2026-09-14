<!-- 水平排序 | 调整标签顺序 -->
<script setup lang="ts">
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ids = ref(["概览", "订单", "库存", "报表"]);
</script>

<template>
  <XhSortableRoot v-model:ids="ids" orientation="horizontal">
    <XhSortableItem
      v-for="id in ids"
      :key="id"
      :item-id="id"
      style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: var(--xh-shape-pill); background: var(--xh-bg-subtle)"
    >
      <XhSortableItemDragTrigger :item-id="id" />
      <span>{{ id }}</span>
    </XhSortableItem>
    <XhSortableDropIndicator />
    <XhSortableLiveRegion />
  </XhSortableRoot>
</template>
