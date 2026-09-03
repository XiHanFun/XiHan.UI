<!-- 禁用 | 手柄退出 Tab 序列，按下也不进拖动 -->
<script setup lang="ts">
import { XhSortableItem, XhSortableItemDragTrigger, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ids = ref(["锁定一", "锁定二", "锁定三"]);
</script>

<template>
  <XhSortableRoot v-model:ids="ids" disabled>
    <XhSortableItem v-for="id in ids" :key="id" :item-id="id" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--xh-border-default)">
      <XhSortableItemDragTrigger :item-id="id" />
      <span>{{ id }}</span>
    </XhSortableItem>
  </XhSortableRoot>
</template>
