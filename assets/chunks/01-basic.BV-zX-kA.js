const e=`<!-- 基础用法 | 拖动任务调整顺序 -->
<script setup lang="ts">
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ids = ref(["规划", "设计", "实现", "发布"]);
const tones = ["brand", "info", "success", "warning"] as const;
<\/script>

<template>
  <XhSortableRoot v-model:ids="ids" style="inline-size: min(360px, 100%)">
    <XhSortableItem
      v-for="(id, index) in ids"
      :key="id"
      :item-id="id"
      :aria-label="id"
      style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
    >
      <XhSortableItemDragTrigger :item-id="id" />
      <span data-demo-block="line" :data-tone="tones[index]" />
    </XhSortableItem>
    <XhSortableDropIndicator />
    <XhSortableLiveRegion />
  </XhSortableRoot>
</template>
`;export{e as default};
