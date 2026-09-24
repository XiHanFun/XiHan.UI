const n=`<!-- 破坏性命令 | 用语气把删除一类命令与其余区分开 -->
<script setup lang="ts">
import type { MenuNode, MenuNodeMeta } from "@xihan-ui/headless";
import { CopyIcon, PencilIcon, TrashIcon } from "@xihan-ui/icons";
import { XhButton, XhIcon, XhMenuRoot } from "@xihan-ui/vue";

const actions: MenuNode[] = [
  { value: "copy", label: "复制", shortcut: "⌘ C" },
  { value: "rename", label: "重命名", shortcut: "F2" },
  { value: "delete", label: "移到回收站", tone: "danger", shortcut: "⌫", separatorBefore: true },
];

const icons = { copy: CopyIcon, rename: PencilIcon, delete: TrashIcon };
const iconOf = (node: MenuNodeMeta) => icons[node.value as keyof typeof icons];
<\/script>

<template>
  <XhMenuRoot :collection="actions" trigger-as-child>
    <template #trigger><XhButton variant="subtle">文件</XhButton></template>
    <template #item-prefix="node">
      <XhIcon :icon="iconOf(node)" size="sm" />
    </template>
  </XhMenuRoot>
</template>
`;export{n as default};
