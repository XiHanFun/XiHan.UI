var e=`<!-- 视图设置 | 右键菜单中的 checkbox 与 radio 切换后保持展开 -->
<script setup lang="ts">
import type { ContextMenuNode } from "@xihan-ui/headless";
import { XhContextMenuRoot } from "@xihan-ui/vue";

const collection: ContextMenuNode[] = [
  { value: "grid", label: "显示网格", kind: "checkbox" },
  { value: "small", label: "小图标", kind: "radio", group: "size", groupLabel: "图标大小" },
  { value: "large", label: "大图标", kind: "radio", group: "size" },
];
<\/script>

<template>
  <XhContextMenuRoot
    :collection="collection"
    :default-checkbox-value="['grid']"
    :default-radio-value="{ size: 'small' }"
  >
    <template #trigger>
      右键调整视图
    </template>
  </XhContextMenuRoot>
</template>
`;export{e as default};