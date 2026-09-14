<script setup lang="ts">
import { XhNavigationMenuLink, XhNavigationMenuRoot } from "@xihan-ui/vue";

const entries = [
  { value: "products", label: "产品" },
  { value: "docs", label: "文档" },
  { value: "resources", label: "资源" },
];
</script>

<template>
  <XhNavigationMenuRoot :collection="entries">
    <template #panel="node">
      <XhNavigationMenuLink :href="`#/${node.value}`">{{ node.label }}概览</XhNavigationMenuLink>
    </template>
  </XhNavigationMenuRoot>
</template>
