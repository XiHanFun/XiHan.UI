<script setup lang="ts">
import { XhMenubarContent, XhMenubarItem, XhMenubarRoot, XhMenubarTrigger } from "@xihan-ui/vue";

const menus = [
  { value: "file", label: "文件", items: [{ value: "new", label: "新建" }, { value: "open", label: "打开" }, { value: "save", label: "保存" }] },
  { value: "edit", label: "编辑", items: [{ value: "undo", label: "撤销" }, { value: "redo", label: "重做" }] },
  { value: "view", label: "视图", items: [{ value: "sidebar", label: "侧栏" }] },
];
</script>

<template>
  <!-- 受控停在「文件」上：预览只看得见、点不着，那张浮层就地铺在菜单栏下 -->
  <XhMenubarRoot value="file" style="display: grid; justify-items: start; gap: 6px; background: transparent">
    <div style="display: flex; gap: 2px; padding: 2px; border-radius: var(--xh-shape-control); background: var(--xh-bg-subtle)">
      <XhMenubarTrigger v-for="menu in menus" :key="menu.value" :value="menu.value">{{ menu.label }}</XhMenubarTrigger>
    </div>
    <XhMenubarContent value="file" style="position: static; inline-size: 140px">
      <XhMenubarItem v-for="item in menus[0].items" :key="item.value" :value="item.value">{{ item.label }}</XhMenubarItem>
    </XhMenubarContent>
  </XhMenubarRoot>
</template>
