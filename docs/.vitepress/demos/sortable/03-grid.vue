<!-- 网格排序 | 在换行布局中排序 -->
<script setup lang="ts">
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ids = ref(["颜色", "排版", "间距", "圆角", "阴影", "动效"]);
const tones = ["brand", "info", "success", "warning", "danger", "neutral"] as const;
</script>

<template>
  <XhSortableRoot v-model:ids="ids" orientation="both" style="max-inline-size: 340px">
    <XhSortableItem
      v-for="(id, index) in ids"
      :key="id"
      :item-id="id"
      :aria-label="id"
      style="display: flex; align-items: center; gap: 6px; inline-size: 104px; block-size: 72px; padding: 10px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
    >
      <XhSortableItemDragTrigger :item-id="id" />
      <span data-demo-block :data-tone="tones[index]" style="--xh-demo-block-block-size: 40px" />
    </XhSortableItem>
    <XhSortableDropIndicator />
    <XhSortableLiveRegion />
  </XhSortableRoot>
</template>
