var e=`<!-- 看板 | 在几列之间移动任务 -->
<script setup lang="ts">
import type { SortableTransferDetails } from "@xihan-ui/headless";
import { XhSortableDropIndicator, XhSortableItem, XhSortableItemDragTrigger, XhSortableLiveRegion, XhSortableRoot } from "@xihan-ui/vue";
import { reactive } from "vue";

const columns = [
  { id: "todo", title: "待办" },
  { id: "doing", title: "进行中" },
  { id: "done", title: "已完成" },
];
const lists = reactive<Record<string, string[]>>({ todo: ["调研", "原型", "评审"], doing: ["接口", "联调"], done: ["立项"] });
const tones: Record<string, string> = { 调研: "brand", 原型: "info", 评审: "warning", 接口: "success", 联调: "danger", 立项: "neutral" };

// 落进别的列时源列表发一次 transfer：两列的新顺序都算好了，照着写回即可
function onTransfer(detail: SortableTransferDetails): void {
  lists[detail.fromList] = detail.fromIds;
  lists[detail.toList] = detail.toIds;
}
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: var(--xh-space-4)">
    <section
      v-for="column in columns"
      :key="column.id"
      style="flex: 1 1 160px; display: grid; gap: var(--xh-space-2); padding: var(--xh-space-3); border: var(--xh-stroke-thin) solid var(--xh-border-default); border-radius: var(--xh-shape-surface)"
    >
      <h4 :id="\`sortable-board-\${column.id}\`" style="margin: 0; font-size: var(--xh-text-label-size)">{{ column.title }}</h4>
      <XhSortableRoot
        v-model:ids="lists[column.id]"
        group="board"
        :list-id="column.id"
        :aria-labelledby="\`sortable-board-\${column.id}\`"
        style="min-block-size: var(--xh-control-h-lg)"
        @transfer="onTransfer"
      >
        <XhSortableItem
          v-for="id in lists[column.id]"
          :key="id"
          :item-id="id"
          :aria-label="id"
          style="display: flex; align-items: center; gap: var(--xh-space-2); padding: var(--xh-space-2) var(--xh-space-3); border-radius: var(--xh-shape-control); background: var(--xh-bg-subtle)"
        >
          <XhSortableItemDragTrigger :item-id="id" />
          <span data-demo-block="line" :data-tone="tones[id]" />
        </XhSortableItem>
        <XhSortableDropIndicator />
        <XhSortableLiveRegion />
      </XhSortableRoot>
    </section>
  </div>
</template>
`;export{e as default};