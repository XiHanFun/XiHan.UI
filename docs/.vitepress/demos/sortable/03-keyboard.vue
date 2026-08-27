<!-- 键盘拖拽 | 默认开着且关不掉：Tab 到手柄，空格拾起，方向键挪，空格放下，Esc 取消 -->
<script setup lang="ts">
import { XhSortableItem, XhSortableItemHandle, XhSortableRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const ids = ref(["第一项", "第二项", "第三项"]);
const log = ref<string[]>([]);
</script>

<template>
  <p style="margin-bottom: 8px; color: var(--xh-fg-muted)">
    Tab 聚焦到 ⠿，按空格拾起后用 ↑↓ 移动，再按空格落下；Esc 退回原位。
  </p>
  <XhSortableRoot
    v-model:ids="ids"
    @sort="log.unshift(`${$event.id}：第 ${$event.from + 1} 位 → 第 ${$event.to + 1} 位`)"
    @drag-end="$event.canceled && log.unshift(`${$event.id}：已取消`)"
  >
    <XhSortableItem v-for="id in ids" :key="id" :item-id="id" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--xh-border-default)">
      <XhSortableItemHandle :item-id="id">⠿</XhSortableItemHandle>
      <span>{{ id }}</span>
    </XhSortableItem>
  </XhSortableRoot>
  <ul style="margin-top: 12px; color: var(--xh-fg-muted)">
    <li v-for="(line, i) in log.slice(0, 4)" :key="i">{{ line }}</li>
  </ul>
</template>
