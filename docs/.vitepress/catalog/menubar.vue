<script setup lang="ts">
import { XhMenubarRoot } from "@xihan-ui/vue";

const menus = [
  { value: "file", label: "文件", items: [{ value: "new", label: "新建" }, { value: "open", label: "打开" }] },
  { value: "edit", label: "编辑", items: [{ value: "undo", label: "撤销" }, { value: "redo", label: "重做" }] },
  { value: "view", label: "视图", items: [{ value: "sidebar", label: "侧栏" }] },
];
</script>

<template>
  <XhMenubarRoot :collection="menus" style="background: var(--xh-bg-subtle)" />
</template>
