<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 网格排序 | 在换行布局中排序 -->
<script setup lang="ts">
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ids = ref(["颜色", "排版", "间距", "圆角", "阴影", "动效"]);
</script>

<template>
  <XhSortableRoot v-model:ids="ids" orientation="both" style="max-inline-size: 340px">
    <XhSortableItem
      v-for="id in ids"
      :key="id"
      :item-id="id"
      style="display: flex; align-items: center; gap: 6px; inline-size: 104px; block-size: 72px; padding: 10px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
    >
      <XhSortableItemDragTrigger :item-id="id" />
      <span>{{ id }}</span>
    </XhSortableItem>
    <XhSortableDropIndicator />
    <XhSortableLiveRegion />
  </XhSortableRoot>
</template>
