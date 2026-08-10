<!-- 基础用法 | 标签清单交给 collection，default-value 指定初始选中项；面板常挂，靠 hidden 显隐 -->
<script setup lang="ts">
import { XhTabsRoot } from "@xihan-ui/vue";

const tabs = [
  { value: "overview", label: "概览" },
  { value: "usage", label: "用法" },
  // 禁用写在数据里，方向键会跳过它
  { value: "api", label: "API（禁用）", disabled: true },
];

// 面板正文按条目取
const panels: Record<string, string> = {
  overview: "概览面板：默认 automatic，方向键移动焦点时顺带切换选中。",
  usage: "用法面板：面板不做懒挂载，切走再切回来，里面的滚动位置与表单态都还在。",
  api: "API 面板。",
};
</script>

<template>
  <XhTabsRoot
    :collection="tabs"
    default-value="overview"
    style="inline-size: 100%"
  >
    <!-- 面板内容归作者，走 panel 插槽 -->
    <template #panel="node">{{ panels[node.value] }}</template>
  </XhTabsRoot>
</template>
