<!-- 说明与快捷键 | 只交数据，副文本与按键提示自动落位 -->
<script setup lang="ts">
import type { MenuNode } from "@xihan-ui/headless";
import { XhButton, XhMenuRoot } from "@xihan-ui/vue";

const actions: MenuNode[] = [
  { value: "duplicate", label: "创建副本", description: "保留当前版本，另存一份", shortcut: "⌘ D" },
  { value: "export", label: "导出", description: "生成 PDF 或 PNG", shortcut: "⌘ E" },
  { value: "archive", label: "归档", description: "移出列表，随时可以恢复", shortcut: "⌘ ⇧ A", separatorBefore: true },
];
</script>

<template>
  <XhMenuRoot :collection="actions" trigger-as-child>
    <template #trigger><XhButton variant="subtle">更多</XhButton></template>
  </XhMenuRoot>
</template>
