<!-- 水平排序 | 调整标签顺序 -->
<script setup lang="ts">
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ids = ref(["概览", "订单", "库存", "报表"]);
const tones = ["brand", "info", "success", "warning"] as const;
</script>

<template>
  <XhSortableRoot v-model:ids="ids" orientation="horizontal">
    <XhSortableItem
      v-for="(id, index) in ids"
      :key="id"
      :item-id="id"
      :aria-label="id"
      style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: var(--xh-shape-pill); background: var(--xh-bg-subtle)"
    >
      <XhSortableItemDragTrigger :item-id="id" />
      <span data-demo-block="line" :data-tone="tones[index]" style="--xh-demo-block-inline-size: 48px" />
    </XhSortableItem>
    <XhSortableDropIndicator />
    <XhSortableLiveRegion />
  </XhSortableRoot>
</template>
