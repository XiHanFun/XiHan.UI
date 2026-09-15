const e=`<!-- 基础用法 | 在一条菜单栏中组织应用命令 -->
<script setup lang="ts">
import { XhMenubarRoot } from "@xihan-ui/vue";

const menus = [
  { value: "file", label: "文件", items: [{ value: "new", label: "新建" }, { value: "open", label: "打开" }, { value: "save", label: "保存" }] },
  { value: "edit", label: "编辑", items: [{ value: "undo", label: "撤销" }, { value: "redo", label: "重做" }] },
  { value: "view", label: "视图", items: [{ value: "sidebar", label: "侧栏" }, { value: "terminal", label: "终端" }] },
];
<\/script>

<template>
  <XhMenubarRoot :collection="menus" style="background: var(--xh-bg-subtle)" />
</template>
`;export{e as default};
