<script setup lang="ts">
import { XhBreadcrumbRoot } from "@xihan-ui/vue";

const items = [
  { value: "home", label: "首页", href: "#/" },
  { value: "components", label: "组件", href: "#/components" },
  { value: "breadcrumb", label: "面包屑", current: true },
];
</script>

<template>
  <XhBreadcrumbRoot :collection="items" />
</template>
