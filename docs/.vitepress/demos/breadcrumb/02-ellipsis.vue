<!-- 折叠层级 | 收起过长路径的中间部分 -->
<script setup lang="ts">
import { XhBreadcrumbRoot } from "@xihan-ui/vue";

const items = [
  { value: "home", label: "首页", href: "#/" },
  { value: "docs", label: "文档", href: "#/docs" },
  { value: "guides", label: "指南", href: "#/docs/guides" },
  { value: "components", label: "组件", href: "#/docs/guides/components" },
  { value: "breadcrumb", label: "面包屑", current: true },
];
</script>

<template>
  <XhBreadcrumbRoot :collection="items" :max-items="3" />
</template>
