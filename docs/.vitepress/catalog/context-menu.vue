<script setup lang="ts">
import { XhContextMenuRoot } from "@xihan-ui/vue";

const commands = [
  { value: "open", label: "打开" },
  { value: "rename", label: "重命名" },
  { value: "delete", label: "移到回收站", separatorBefore: true },
];
</script>

<template>
  <XhContextMenuRoot :collection="commands">
    <template #trigger>
      <span style="display: grid; place-items: center; gap: var(--xh-space-1); inline-size: var(--xh-doc-catalog-w); block-size: var(--xh-doc-catalog-h); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
        <strong>设计规范.pdf</strong>
        <span style="color: var(--xh-fg-muted)">右键打开菜单</span>
      </span>
    </template>
  </XhContextMenuRoot>
</template>
