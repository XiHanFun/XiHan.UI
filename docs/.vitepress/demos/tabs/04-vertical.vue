<!-- 竖排 | orientation 换掉方向键收哪一对键：竖排认上下键，左右键原样放行给页面 -->
<script setup lang="ts">
import { XhTabsRoot } from "@xihan-ui/vue";

const tabs = [
  { value: "general", label: "通用" },
  { value: "appearance", label: "外观" },
  { value: "advanced", label: "高级" },
];
</script>

<template>
  <XhTabsRoot
    :collection="tabs"
    default-value="general"
    orientation="vertical"
    style="inline-size: 100%"
  >
    <template #panel="node">{{ node.label }}设置面板</template>
  </XhTabsRoot>
</template>
