<!-- 基础用法 | collection 是入口与条目的事实源：顶层节点铺成一排入口，它的 items 铺成那张菜单里的条目 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhMenubarRoot } from "@xihan-ui/vue";

const menus = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
      { value: "close", label: "关闭", disabled: true },
    ],
  },
  {
    value: "edit",
    label: "编辑",
    items: [
      { value: "undo", label: "撤销" },
      { value: "redo", label: "重做" },
    ],
  },
  {
    value: "view",
    label: "视图",
    items: [
      { value: "zoom-in", label: "放大" },
      { value: "zoom-out", label: "缩小" },
    ],
  },
];

const picked = ref("");

function onSelect(details: { menu: string; value: string }): void {
  picked.value = `${details.menu} / ${details.value}`;
}
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <XhMenubarRoot :collection="menus" @select="onSelect" />

    <span>最近选中：{{ picked || "（无）" }}</span>
  </div>
</template>
