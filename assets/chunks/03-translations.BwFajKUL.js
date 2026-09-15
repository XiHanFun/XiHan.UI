const e=`<!-- 自定义分隔符 | 替换层级之间的视觉标记 -->
<script setup lang="ts">
import { XhBreadcrumbRoot } from "@xihan-ui/vue";

const items = [
  { value: "workspace", label: "工作台", href: "#/workspace" },
  { value: "projects", label: "项目", href: "#/workspace/projects" },
  { value: "xihan-ui", label: "XiHan.UI", current: true },
];
<\/script>

<template>
  <XhBreadcrumbRoot :collection="items">
    <template #separator>•</template>
  </XhBreadcrumbRoot>
</template>
`;export{e as default};
