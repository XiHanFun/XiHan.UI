<!-- 破坏性命令 | 用语气把删除一类命令与其余区分开 -->
<script setup lang="ts">
import type { MenuNode } from "@xihan-ui/headless";
import { CopyIcon, PencilIcon, TrashIcon } from "@xihan-ui/icons";
import {
  XhButton,
  XhIcon,
  XhMenuItemIndicator,
  XhMenuItemText,
  XhMenuRoot,
} from "@xihan-ui/vue";

const actions: MenuNode[] = [
  { value: "copy", label: "复制" },
  { value: "rename", label: "重命名" },
  { value: "delete", label: "移到回收站", tone: "danger", separatorBefore: true },
];

const icons = { copy: CopyIcon, rename: PencilIcon, delete: TrashIcon };
</script>

<template>
  <XhMenuRoot :collection="actions" trigger-as-child>
    <template #trigger><XhButton variant="subtle">文件</XhButton></template>
    <template #item="node">
      <XhMenuItemIndicator>
        <XhIcon :icon="icons[node.value as keyof typeof icons]" size="sm" />
      </XhMenuItemIndicator>
      <XhMenuItemText>{{ node.label }}</XhMenuItemText>
    </template>
  </XhMenuRoot>
</template>
