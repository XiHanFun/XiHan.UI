<!-- 尺寸 | 适配不同的信息密度 -->
<script setup lang="ts">
import { XhBreadcrumbRoot } from "@xihan-ui/vue";

const items = [
  { value: "home", label: "首页", href: "#/" },
  { value: "components", label: "组件", href: "#/components" },
  { value: "breadcrumb", label: "面包屑", current: true },
];
const sizes = [
  { label: "小", value: "sm" },
  { label: "中", value: undefined },
  { label: "大", value: "lg" },
] as const;
</script>

<template>
  <div style="display: grid; gap: 16px; inline-size: min(560px, 100%)">
    <div v-for="item in sizes" :key="item.label" style="display: flex; align-items: center; gap: 16px">
      <span style="inline-size: 24px; color: var(--xh-fg-muted)">{{ item.label }}</span>
      <XhBreadcrumbRoot :collection="items" :size="item.value" />
    </div>
  </div>
</template>
