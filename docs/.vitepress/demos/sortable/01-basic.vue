<!-- 基础用法 | ids 是顺序的唯一真源，sort 事件回传的 ids 已经重排好，可直接写回 -->
<script setup lang="ts">
import { XhSortableItem, XhSortableItemDragTrigger, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ids = ref(["写方案", "评审", "实现", "上线"]);
</script>

<template>
  <XhSortableRoot v-model:ids="ids" style="inline-size: 100%">
    <XhSortableItem v-for="id in ids" :key="id" :item-id="id" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--xh-border-default)">
      <XhSortableItemDragTrigger :item-id="id" />
      <span>{{ id }}</span>
    </XhSortableItem>
  </XhSortableRoot>
  <p style="margin-top: 12px; color: var(--xh-fg-muted)">当前顺序：{{ ids.join(" → ") }}</p>
</template>
