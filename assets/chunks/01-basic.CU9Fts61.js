const e=`<!-- 基础用法 | 拖动任务调整顺序 -->
<script setup lang="ts">
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ids = ref(["规划", "设计", "实现", "发布"]);
<\/script>

<template>
  <XhSortableRoot v-model:ids="ids" style="inline-size: min(360px, 100%)">
    <XhSortableItem
      v-for="id in ids"
      :key="id"
      :item-id="id"
      style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
    >
      <XhSortableItemDragTrigger :item-id="id" />
      <span>{{ id }}</span>
    </XhSortableItem>
    <XhSortableDropIndicator />
    <XhSortableLiveRegion />
  </XhSortableRoot>
</template>
`;export{e as default};
